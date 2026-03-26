'use strict';

const { createApp } = Vue;

const CHAPEAUX = [
  ['AS BEZIERS', 'FC THONGUE LIBRON 1', 'FA MARSEILLE FEM.', 'FC THONGUE LIBRON 2'],
  ['FC VILLEFRANCHE BEAUJ. 1', 'FC VILLEFRANCHE BEAUJ. 2', 'US LESQUIN', 'FC ECUBLENS 1933'],
  ['ES ST SIMON TOULOUSE 1', 'ES HERBLAY', 'ENT.FEM. LAVAUR BRIATEXTE', 'ES ST SIMON TOULOUSE 2'],
  ['FC MOUGINS', 'SC DRAGUIGNAN', 'RIVIERA FC', 'CA PEYMEINADE'],
  ['ORMESSON SUR MARNE 1', 'AS MONTFERRAND', 'ORMESSON SUR MARNE 2', 'PONT DU CHÂTEAU'],
  ['MOULINS YZEURE FOOTBALL', 'US VILETTE D\'ANTHON 1', 'US VILETTE D\'ANTHON 2', 'ASM BELFORT'],
];

const LOGOS = {
  'AS BEZIERS': 'img/logo_ASB.png',
  'FC THONGUE LIBRON 1': 'img/thongue_et_Libron.png',
  'FA MARSEILLE FEM.': 'img/logo-famf.png',
  'FC THONGUE LIBRON 2': 'img/thongue_et_Libron.png',
  'FC VILLEFRANCHE BEAUJ. 1': 'img/Logo_FC_Villefranche_Beaujolais.png',
  'FC VILLEFRANCHE BEAUJ. 2': 'img/Logo_FC_Villefranche_Beaujolais.png',
  'US LESQUIN': 'img/Logo_US_Lesquin.png',
  'FC ECUBLENS 1933': 'img/ecublens.png',
  'ES ST SIMON TOULOUSE 1': 'img/Saint_Simon.png',
  'ES HERBLAY': 'img/herbblay.png',
  'ENT.FEM. LAVAUR BRIATEXTE': 'img/lauvaur.png',
  'ES ST SIMON TOULOUSE 2': 'img/Saint_Simon.png',
  'FC MOUGINS': 'img/FC MOUGINS.png',
  'SC DRAGUIGNAN': 'img/Logo_SC_Draguignan.svg',
  'RIVIERA FC': 'img/riviera-football-club.webp',
  'CA PEYMEINADE': 'img/logo__t1wiaz.png',
  'ORMESSON SUR MARNE 1': 'img/Ormesson.png',
  'AS MONTFERRAND': 'img/Logo_AS_Montferrand.png',
  'ORMESSON SUR MARNE 2': 'img/Ormesson.png',
  'PONT DU CHÂTEAU': 'img/logo__sgcn.png',
  'MOULINS YZEURE FOOTBALL': 'img/Logo_Moulins-Yzeure_Foot.svg',
  'US VILETTE D\'ANTHON 1': 'img/USVJ-logo-GOLD.png',
  'US VILETTE D\'ANTHON 2': 'img/USVJ-logo-GOLD.png',
  'ASM BELFORT': 'img/Logo_ASM_Belfort_FC.svg',
};

const NB_CHAPEAUX = 6;
const NB_POULES   = 4;

/* ── Confettis ── */
const CONFETTI_COLORS = ['#d8135a','#3a86ff','#ffd166','#06d6a0','#ef476f','#ffffff'];

function spawnConfetti(count = 40) {
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    const x = Math.random() * 100;
    const dur = 0.9 + Math.random() * 1.2;
    const delay = Math.random() * 0.4;
    el.style.cssText = `
      left: ${x}vw;
      top: -10px;
      background: ${CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]};
      width: ${5 + Math.random() * 7}px;
      height: ${5 + Math.random() * 7}px;
      border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
      animation-duration: ${dur}s;
      animation-delay: ${delay}s;
    `;
    document.body.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }
}

/* ── Overlay ── */
function showOverlay({ equipe, chapeau, poule, logo }) {
  return new Promise(resolve => {
    const overlay = document.getElementById('tirage-overlay');
    const nameEl  = document.getElementById('tirage-equipe-name');
    const chapEl  = document.getElementById('tirage-chapeau-label');
    const pouleEl = document.getElementById('tirage-poule-label');
    const logoEl  = document.getElementById('tirage-logo');

    chapEl.textContent  = `Chapeau ${chapeau}`;
    nameEl.textContent  = equipe;
    pouleEl.innerHTML   = `→ Poule <strong>${poule}</strong>`;

    if (logo) {
      logoEl.src   = logo;
      logoEl.style.display = 'block';
    } else {
      logoEl.style.display = 'none';
    }

    // Re-déclencher l'animation de la carte
    const card = document.getElementById('tirage-card');
    card.style.animation = 'none';
    void card.offsetWidth;
    card.style.animation = '';

    logoEl.style.animation = 'none';
    void logoEl.offsetWidth;
    logoEl.style.animation  = '';

    overlay.classList.add('visible');
    spawnConfetti(28);

    const close = () => {
      overlay.classList.remove('visible');
      resolve();
    };

    overlay.addEventListener('click', close, { once: true });
    setTimeout(close, 2200);
  });
}

createApp({
  data() {
    return {
      chapeaux:          CHAPEAUX,
      logos:             LOGOS,
      poules:            Array.from({ length: NB_POULES }, () => []),
      tirageFini:        false,
      historique:        [],
      chapeauxRestants:  [],
      tiragesParChapeau: Array(NB_CHAPEAUX).fill(0),
      tourChapeau:       0,
      activeChapeauIdx:  -1,
      lastPouleIdx:      -1,
      newMemberIdx:      -1,
      isAnimating:       false,
    };
  },

  methods: {
    equipeEstTirée(equipe) {
      return this.historique.some(h => h.equipe === equipe);
    },

    resetTirage() {
      this._resetTirage();
    },

    _resetTirage() {
      this.chapeauxRestants  = CHAPEAUX.map(chap => [...chap]);
      this.poules            = Array.from({ length: NB_POULES }, () => []);
      this.tirageFini        = false;
      this.historique        = [];
      this.tiragesParChapeau = Array(NB_CHAPEAUX).fill(0);
      this.tourChapeau       = 0;
      this.activeChapeauIdx  = -1;
      this.lastPouleIdx      = -1;
      this.newMemberIdx      = -1;
      this.isAnimating       = false;
    },

    async tirageEquipe() {
      if (this.tirageFini || this.isAnimating) return;
      this.isAnimating = true;

      let chapeauIdx = -1;
      for (let i = 0; i < NB_CHAPEAUX; i++) {
        const idx = (this.tourChapeau + i) % NB_CHAPEAUX;
        if (this.chapeauxRestants[idx]?.length > 0) {
          chapeauIdx = idx;
          break;
        }
      }

      if (chapeauIdx === -1) {
        this.tirageFini = true;
        this.isAnimating = false;
        return;
      }

      const pouleIdx = this.poules.findIndex((_, i) =>
        !this.historique.some(h => h.poule === i + 1 && h.chapeau === chapeauIdx + 1)
      );

      if (pouleIdx === -1) {
        this.tourChapeau = (chapeauIdx + 1) % NB_CHAPEAUX;
        this.isAnimating = false;
        this.tirageEquipe();
        return;
      }

      // Highlight du chapeau actif
      this.activeChapeauIdx = chapeauIdx;

      const chapeau = this.chapeauxRestants[chapeauIdx];
      const randIdx = Math.floor(Math.random() * chapeau.length);
      const equipe  = chapeau.splice(randIdx, 1)[0];

      const logo = this.logos[equipe] || null;

      // Afficher l'overlay animé
      await showOverlay({
        equipe,
        chapeau: chapeauIdx + 1,
        poule:   pouleIdx + 1,
        logo,
      });

      // Mettre à jour les données après l'overlay
      this.poules[pouleIdx] = [...this.poules[pouleIdx], equipe];
      this.tiragesParChapeau[chapeauIdx]++;

      const entry = { equipe, chapeau: chapeauIdx + 1, poule: pouleIdx + 1 };
      this.historique.push(entry);

      // Marquer la poule et la position pour l'animation d'entrée
      this.lastPouleIdx = pouleIdx;
      this.newMemberIdx = this.poules[pouleIdx].length - 1;

      // Flash de la poule
      this.$nextTick(() => {
        const pouleCards = document.querySelectorAll('.group-card');
        const target = pouleCards[pouleIdx];
        if (target) {
          target.classList.remove('just-updated');
          void target.offsetWidth;
          target.classList.add('just-updated');
          setTimeout(() => target.classList.remove('just-updated'), 1200);
        }
      });

      this.tourChapeau = (chapeauIdx + 1) % NB_CHAPEAUX;

      // Reset active chapeau après un court délai
      setTimeout(() => { this.activeChapeauIdx = -1; }, 600);

      if (this.poules.every(p => p.length >= NB_CHAPEAUX)) {
        this.tirageFini = true;
        setTimeout(() => spawnConfetti(80), 100);
      }

      this.isAnimating = false;
    },

    isNewMember(pouleIdx, memberIdx) {
      return pouleIdx === this.lastPouleIdx && memberIdx === this.newMemberIdx;
    },
  },

  mounted() {
    this._resetTirage();
  },
}).mount('#app');