'use strict';

const { createApp } = Vue;

const CHAPEAUX = [
  ['AS_BEZIERS', 'FC_THONGUE_LIBRON_1', 'FA_MARSEILLE_FEM.', 'FC_THONGUE_LIBRON_2'],
  ['FC_VILLEFRANCHE_BEAUJ_1', 'FC_VILLEFRANCHE_BEAUJ_2', 'US_LESQUIN', 'FC_ECUBLENS_1933'],
  ['ES_ST_SIMON_TOULOUSE_1', 'ES_HERBLAY', 'ENT_FEM_LAVAUR_BRIATEXTE', 'ES_ST_SIMON_TOULOUSE_2'],
  ['FC_MOUGINS', 'SC_DRAGUIGNAN', 'RIVIERA_FC', 'CA_PEYMEINADE'],
  ['ORMESSON_SUR_MARNE_1', 'AS_MONTFERRAND', 'ORMESSON_SUR_MARNE_2', 'PONT_DU_CHÂTEAU'],
  ['MOULINS_YZEURE_FOOTBALL', 'US_VILETTE_D_ANTHON_1', 'US_VILETTE_D_ANTHON_2', 'ASM_BELFORT'],
];

const LOGOS = {
  'AS_BEZIERS': 'img/logo_ASB.png',
  'FC_THONGUE_LIBRON_1': 'img/thongue_et_Libron.png',
  'FA_MARSEILLE_FEM.': 'img/logo-famf.png',
  'FC_THONGUE_LIBRON_2': 'img/thongue_et_Libron.png',
  'FC_VILLEFRANCHE_BEAUJ_1': 'img/Logo_FC_Villefranche_Beaujolais.png',
  'FC_VILLEFRANCHE_BEAUJ_2': 'img/Logo_FC_Villefranche_Beaujolais.png',
  'US_LESQUIN': 'img/Logo_US_Lesquin.png',
  'FC_ECUBLENS_1933': 'img/ecublens.png',
  'ES_ST_SIMON_TOULOUSE_1': 'img/Saint_Simon.png',
  'ES_HERBLAY': 'img/herbblay.png',
  'ENT_FEM_LAVAUR_BRIATEXTE': 'img/lauvaur.png',
  'ES_ST_SIMON_TOULOUSE_2': 'img/Saint_Simon.png',
  'FC_MOUGINS': 'img/FC MOUGINS.png',
  'SC_DRAGUIGNAN': 'img/Logo_SC_Draguignan.svg',
  'RIVIERA_FC': 'img/riviera-football-club.webp',
  'CA_PEYMEINADE': 'img/logo__t1wiaz.png',
  'ORMESSON_SUR_MARNE_1': 'img/Ormesson.png',
  'AS_MONTFERRAND': 'img/Logo_AS_Montferrand.png',
  'ORMESSON_SUR_MARNE_2': 'img/Ormesson.png',
  'PONT_DU_CHÂTEAU': 'img/logo__sgcn.png',
  'MOULINS_YZEURE_FOOTBALL': 'img/Logo_Moulins-Yzeure_Foot.svg',
  'US_VILETTE_D_ANTHON_1': 'img/USVJ-logo-GOLD.png',
  'US_VILETTE_D_ANTHON_2': 'img/USVJ-logo-GOLD.png',
  'ASM_BELFORT': 'img/Logo_ASM_Belfort_FC.svg',
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