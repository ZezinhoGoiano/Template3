/* ================================================================
   APEX MOTORS — estoque.js
   Versão: 1.0.0
   Página de estoque completo.
   Depende de: vehicles-data.js (carregado antes no HTML)
================================================================ */

'use strict';

/* ================================================================
   UTILITÁRIOS (subconjunto do ApexUtils)
================================================================ */
const $ = (sel, parent = document) => parent.querySelector(sel);
const $$ = (sel, parent = document) => parent.querySelectorAll(sel);

const formatCurrency = (value) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

/* ================================================================
   ESTADO
================================================================ */
let currentTab      = 'available'; // 'available' | 'sold'
let currentFilter   = 'all';
let currentImageMap = {}; // vehicleId → imageIndex atual no card

/* ================================================================
   GERAÇÃO DE CARDS
================================================================ */
const createCard = (vehicle) => {
  const isSold   = vehicle.status === 'sold';
  const badgeHTML = vehicle.badge
    ? `<span class="vehicle-card__badge vehicle-card__badge--${vehicle.badgeColor}">${vehicle.badge}</span>`
    : '';

  const dotsHTML = vehicle.images.map((_, i) =>
    `<button class="vehicle-card__dot ${i === 0 ? 'is-active' : ''}"
      data-index="${i}" aria-label="Foto ${i + 1}"></button>`
  ).join('');

  const navHTML = vehicle.images.length > 1 ? `
    <div class="vehicle-card__nav" aria-hidden="true">
      <button class="vehicle-card__arrow vehicle-card__arrow--prev"
        aria-label="Foto anterior">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
      <button class="vehicle-card__arrow vehicle-card__arrow--next"
        aria-label="Próxima foto">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2">
          <path d="M9 18l6-6-6-6"/>
        </svg>
      </button>
    </div>
    <div class="vehicle-card__dots" aria-hidden="true">${dotsHTML}</div>
  ` : '';

  const footerHTML = isSold
    ? `<div class="vehicle-card__price">
         <span class="vehicle-card__price-label">Vendido por</span>
         <strong class="vehicle-card__price-value">${formatCurrency(vehicle.price)}</strong>
       </div>`
    : `<div class="vehicle-card__price">
         <span class="vehicle-card__price-label">A partir de</span>
         <strong class="vehicle-card__price-value">${formatCurrency(vehicle.price)}</strong>
       </div>
       <button class="btn btn--primary btn--sm vehicle-card__cta"
         data-action="expand"
         aria-label="Ver detalhes de ${vehicle.name}">
         Ver detalhes
       </button>`;

  return `
    <article class="vehicle-card reveal ${isSold ? 'vehicle-card--sold' : ''}"
      data-category="${vehicle.category}"
      data-vehicle-id="${vehicle.id}"
      role="listitem"
      aria-label="${vehicle.name}${isSold ? ' — Vendido' : ''}">

      <div class="vehicle-card__image-wrap">
        ${navHTML}
        ${badgeHTML}

        <button class="vehicle-card__expand"
          data-action="expand"
          aria-label="Ver detalhes de ${vehicle.name}"
          ${isSold ? 'disabled style="display:none"' : ''}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
          </svg>
        </button>

        <img
          class="vehicle-card__img"
          src="${vehicle.images[0]}"
          alt="${vehicle.name} — foto 1 de ${vehicle.images.length}"
          width="600" height="360"
          loading="lazy" decoding="async"
          data-image-index="0">
      </div>

      <div class="vehicle-card__body">
        <div class="vehicle-card__header">
          <div>
            <h3 class="vehicle-card__name">${vehicle.name}</h3>
            <span class="vehicle-card__year">${vehicle.year}</span>
          </div>
        </div>

        <div class="vehicle-card__specs" aria-label="Especificações">
          <div class="vehicle-card__spec">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
            </svg>
            <span>${vehicle.specs.km}</span>
          </div>
          <div class="vehicle-card__spec">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
            <span>${vehicle.specs.power}</span>
          </div>
          <div class="vehicle-card__spec">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" aria-hidden="true">
              <rect x="2" y="7" width="20" height="14" rx="2"/>
              <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
            </svg>
            <span>${vehicle.specs.transmission}</span>
          </div>
        </div>

        <div class="vehicle-card__footer">
          ${footerHTML}
        </div>
      </div>
    </article>
  `;
};

/* ================================================================
   RENDERIZAÇÃO
================================================================ */
const getGrid = () => $(`#grid-${currentTab === 'available' ? 'disponiveis' : 'vendidos'}`);

const renderGrid = () => {
  const grid = getGrid();
  if (!grid) return;

  const vehicles = VEHICLES_DATA.filter(v => {
    const matchStatus = v.status === currentTab;
    const matchFilter = currentFilter === 'all' || v.category === currentFilter;
    return matchStatus && matchFilter;
  });

  grid.innerHTML = vehicles.length
    ? vehicles.map(createCard).join('')
    : `<div style="grid-column:1/-1;text-align:center;padding:var(--space-16);color:var(--color-text-muted);">
         Nenhum veículo encontrado nessa categoria.
       </div>`;

  // Inicia observer de reveal nos novos cards
  initReveal(grid);

  // Inicia navegação de fotos
  initCardNav(grid);
};

/* ================================================================
   REVEAL ANIMATION
================================================================ */
const initReveal = (container) => {
  const els = $$('.reveal', container);
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -60px 0px', threshold: 0.1 });

  els.forEach(el => observer.observe(el));
};

/* ================================================================
   NAVEGAÇÃO DE FOTOS NOS CARDS
================================================================ */
const updateCardImage = (card, vehicle, newIndex) => {
  const img  = $('.vehicle-card__img', card);
  const dots = $$('.vehicle-card__dot', card);

  img.src = vehicle.images[newIndex];
  img.alt = `${vehicle.name} — foto ${newIndex + 1} de ${vehicle.images.length}`;
  img.dataset.imageIndex = newIndex;

  dots.forEach((dot, i) => dot.classList.toggle('is-active', i === newIndex));
  currentImageMap[vehicle.id] = newIndex;
};

const initCardNav = (grid) => {
  grid.addEventListener('click', (e) => {

    // ── SE FOR BOTÃO DE ABRIR MODAL, DEIXA PASSAR ────────
    if (e.target.closest('[data-action="expand"]')) {
      // Não faz nada aqui — deixa o VehicleModal (em document.body)
      // processar o clique normalmente
      return;
    }

    // ── Setas ──────────────────────────────────────────────
    const arrow = e.target.closest('.vehicle-card__arrow');
    if (arrow) {
      e.stopPropagation();
      e.preventDefault();
      const card      = arrow.closest('.vehicle-card');
      const vehicleId = card.dataset.vehicleId;
      const vehicle   = VEHICLES_DATA.find(v => v.id === vehicleId);
      if (!vehicle) return;

      const img     = $('.vehicle-card__img', card);
      const current = parseInt(img.dataset.imageIndex) || 0;
      const isPrev  = arrow.classList.contains('vehicle-card__arrow--prev');
      const newIndex = isPrev
        ? (current > 0 ? current - 1 : vehicle.images.length - 1)
        : (current < vehicle.images.length - 1 ? current + 1 : 0);

      updateCardImage(card, vehicle, newIndex);
      return;
    }

    // ── Dots ───────────────────────────────────────────────
    const dot = e.target.closest('.vehicle-card__dot');
    if (dot) {
      e.stopPropagation();
      e.preventDefault();
      const card      = dot.closest('.vehicle-card');
      const vehicleId = card.dataset.vehicleId;
      const vehicle   = VEHICLES_DATA.find(v => v.id === vehicleId);
      if (!vehicle) return;

      updateCardImage(card, vehicle, parseInt(dot.dataset.index));
      return;
    }
  });
};


/* ================================================================
   MODAL (reutiliza a lógica do script.js — VehicleModal)
   O estoque.html carrega vehicles-data.js + script.js + estoque.js
   então VehicleModal já está disponível
================================================================ */

/* ================================================================
   TABS — Disponíveis / Vendidos
================================================================ */
const updateCounts = () => {
  const available = VEHICLES_DATA.filter(v => v.status === 'available').length;
  const sold      = VEHICLES_DATA.filter(v => v.status === 'sold').length;

  const countDisp = $('#count-disponiveis');
  const countVend = $('#count-vendidos');
  if (countDisp) countDisp.textContent = available;
  if (countVend) countVend.textContent = sold;
};

const switchTab = (tabName) => {
  currentTab    = tabName === 'disponiveis' ? 'available' : 'sold';
  currentFilter = 'all'; // reseta filtro ao trocar aba

  // Atualiza visual das tabs
  $$('.estoque-tab').forEach(tab => tab.classList.remove('estoque-tab--active'));
  $(`[data-tab="${tabName}"]`)?.classList.add('estoque-tab--active');

  // Atualiza visual dos filtros
  $$('.filter-btn').forEach(btn => {
    btn.classList.toggle('filter-btn--active', btn.dataset.filter === 'all');
    btn.setAttribute('aria-pressed', btn.dataset.filter === 'all' ? 'true' : 'false');
  });

  // Alterna visibilidade dos grids
  const gridDisp = $('#grid-disponiveis');
  const gridVend = $('#grid-vendidos');

  if (tabName === 'disponiveis') {
    gridDisp.style.display = 'grid';
    gridVend.style.display = 'none';
  } else {
    gridDisp.style.display = 'none';
    gridVend.style.display = 'grid';
  }

  renderGrid();
};

/* ================================================================
   FILTROS
================================================================ */
const filterVehicles = (category) => {
  currentFilter = category;

  $$('.filter-btn').forEach(btn => {
    const isActive = btn.dataset.filter === category;
    btn.classList.toggle('filter-btn--active', isActive);
    btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });

  renderGrid();
};

/* ================================================================
   HEADER SCROLL (versão simplificada)
================================================================ */
const initHeader = () => {
  const header    = $('#header');
  const hamburger = $('#navHamburger');
  const navMenu   = $('#navMenu');
  if (!header) return;

  // Estoque já começa com is-scrolled (header sempre sólido)
  header.classList.add('is-scrolled');

  // Mobile menu
  hamburger?.addEventListener('click', () => {
    const isOpen = hamburger.getAttribute('aria-expanded') === 'true';
    hamburger.setAttribute('aria-expanded', String(!isOpen));
    navMenu?.classList.toggle('is-open', !isOpen);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu?.classList.contains('is-open')) {
      hamburger.setAttribute('aria-expanded', 'false');
      navMenu.classList.remove('is-open');
    }
  });
};

/* ================================================================
   INICIALIZAÇÃO
================================================================ */
const initEstoque = () => {
  updateCounts();
  initHeader();

  // Expõe funções para os onclick do HTML
  window.switchTab      = switchTab;
  window.filterVehicles = filterVehicles;

  // Renderiza grid inicial (disponíveis, todos)
  renderGrid();

  // Inicia reveal nos elementos estáticos da página (header, tags)
  initReveal(document.body);

  // Inicia modal (VehicleModal vem do script.js)
  if (typeof VehicleModal !== 'undefined') {
    VehicleModal.init();
  }

  console.log('✅ Estoque inicializado');
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initEstoque);
} else {
  initEstoque();
}
