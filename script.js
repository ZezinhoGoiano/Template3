/* ================================================================
   APEX MOTORS — script.js
   Versão: 1.1.0 (CORRIGIDO)
   
   CORREÇÕES APLICADAS:
   - [CRÍTICO] Listeners duplicados no filtro de veículos
   - [CRÍTICO] Clique nas setas/dots abria o modal indevidamente
   - [CRÍTICO] Botão "Fechar" do modal sem funcionalidade (ID duplicado)
   - [ALTO]    Cards dinâmicos agora incluem lazy-loading/width/height/aria
   - [MÉDIO]   Focus trap adicionado ao modal de veículo
   - [MÉDIO]   console.log de PII removido de produção
   - [BAIXO]   passive listeners no scroll
   - [BAIXO]   AnimatedStats usa timestamp real (compatível com 120Hz+)
   - [BAIXO]   Variável morta removida (openButtons)
   - [BAIXO]   preconnect via JS removido (já feito no HTML)
================================================================ */

'use strict';

/* ================================================================
   1. UTILITÁRIOS & HELPERS
================================================================ */
const ApexUtils = {
  qs: (selector, parent = document) => parent.querySelector(selector),
  qsa: (selector, parent = document) => parent.querySelectorAll(selector),

  on: (elements, events, handler, options = {}) => {
    const els = elements instanceof NodeList ? elements : [elements];
    const eventList = events.split(' ');
    els.forEach(el => {
      eventList.forEach(event => {
        el?.addEventListener(event, handler, options);
      });
    });
  },

  off: (elements, events, handler) => {
    const els = elements instanceof NodeList ? elements : [elements];
    const eventList = events.split(' ');
    els.forEach(el => {
      eventList.forEach(event => {
        el?.removeEventListener(event, handler);
      });
    });
  },

  debounce: (func, wait = 150) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  throttle: (func, limit = 150) => {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  formatCurrency: (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  },

  numbersOnly: (value) => value.replace(/\D/g, ''),

  formatPhone: (value) => {
    const cleaned = ApexUtils.numbersOnly(value);
    const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
    if (match) return `(${match[1]}) ${match[2]}-${match[3]}`;
    return value;
  },

  trapFocus: (element) => {
    const focusableElements = element.querySelectorAll(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          lastFocusable.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          firstFocusable.focus();
          e.preventDefault();
        }
      }
    };

    ApexUtils.on(element, 'keydown', handleTabKey);
    firstFocusable?.focus();
    return () => ApexUtils.off(element, 'keydown', handleTabKey);
  },

  lockScroll: (lock = true) => {
    if (lock) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
  },

  generateId: () => `apex-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,

  scrollTo: (target, offset = 80) => {
    const element = typeof target === 'string' ? ApexUtils.qs(target) : target;
    if (!element) return;
    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition - offset;
    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
  },
};

/* ================================================================
   2. INTERSECTION OBSERVER (REVEAL AO SCROLL)
================================================================ */
const RevealOnScroll = (() => {
  const init = () => {
    const revealElements = ApexUtils.qsa('.reveal');
    if (!revealElements.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, {
      root: null,
      rootMargin: '0px 0px -80px 0px',
      threshold: 0.1,
    });

    revealElements.forEach((el) => observer.observe(el));
  };

  return { init };
})();

/* ================================================================
   3. HEADER — SCROLL & MOBILE MENU
================================================================ */
const Header = (() => {
  const header = ApexUtils.qs('#header');
  const hamburger = ApexUtils.qs('#navHamburger');
  const navMenu = ApexUtils.qs('#navMenu');
  const navLinks = ApexUtils.qsa('.nav__link');

  // FIX: passive: true melhora performance de scroll
  const handleScroll = ApexUtils.throttle(() => {
    if (window.pageYOffset > 80) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }, 100);

  const handleActiveSection = () => {
    const sections = ApexUtils.qsa('section[id]');
    const scrollY = window.pageYOffset;

    sections.forEach((section) => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - 120;
      const sectionId = section.getAttribute('id');
      const navLink = ApexUtils.qs(`.nav__link[href="#${sectionId}"]`);

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navLinks.forEach((link) => link.classList.remove('is-active'));
        navLink?.classList.add('is-active');
      }
    });
  };

  const openMobileMenu = () => {
    navMenu.classList.add('is-open');
    hamburger.setAttribute('aria-expanded', 'true');
    ApexUtils.lockScroll(true);
  };

  const closeMobileMenu = () => {
    navMenu.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    ApexUtils.lockScroll(false);
  };

  const toggleMobileMenu = () => {
    hamburger.getAttribute('aria-expanded') === 'true'
      ? closeMobileMenu()
      : openMobileMenu();
  };

  const handleNavLinkClick = (e) => {
    const href = e.currentTarget.getAttribute('href');
    if (href.startsWith('#')) {
      e.preventDefault();
      closeMobileMenu();
      setTimeout(() => ApexUtils.scrollTo(href), 300);
    }
  };

  const init = () => {
    if (!header) return;

    // FIX: passive listeners para scroll
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('scroll', ApexUtils.throttle(handleActiveSection, 200), { passive: true });

    ApexUtils.on(hamburger, 'click', toggleMobileMenu);
    ApexUtils.on(navLinks, 'click', handleNavLinkClick);

    ApexUtils.on(document, 'keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('is-open')) {
        closeMobileMenu();
      }
    });

    ApexUtils.on(navMenu, 'click', (e) => {
      if (e.target === navMenu) closeMobileMenu();
    });
  };

  return { init };
})();

/* ================================================================
   4. HERO — KEN BURNS EFFECT
================================================================ */
const Hero = (() => {
  const hero = ApexUtils.qs('.hero');

  const init = () => {
    if (!hero) return;

    window.addEventListener('load', () => {
      setTimeout(() => hero.classList.add('is-loaded'), 100);
    });
  };

  return { init };
})();

/* ================================================================
   5. FILTROS DE VEÍCULOS + CARDS DINÂMICOS
================================================================ */
const VehicleFilter = (() => {
  const filterButtons = ApexUtils.qsa('.filter-btn');
  const vehiclesGrid = ApexUtils.qs('.vehicles-grid');

  // FIX: flag para evitar registro de listeners duplicados
  let navigationInitialized = false;

  /**
   * Gera HTML de um card
   * FIX: inclui loading="lazy", decoding="async", width, height, role e aria-label
   */
  const createVehicleCard = (vehicle) => {
    const badgeHTML = vehicle.badge
      ? `<span class="vehicle-card__badge vehicle-card__badge--${vehicle.badgeColor}">${vehicle.badge}</span>`
      : '';

    const dotsHTML = vehicle.images.map((_, index) =>
      `<span class="vehicle-card__dot ${index === 0 ? 'is-active' : ''}" data-index="${index}"></span>`
    ).join('');

    return `
      <article class="vehicle-card reveal" 
        data-category="${vehicle.category}" 
        data-vehicle-id="${vehicle.id}"
        role="listitem"
        aria-label="${vehicle.name}">

        <div class="vehicle-card__image-wrap">

          <div class="vehicle-card__nav" aria-hidden="true">
            <button 
              class="vehicle-card__arrow vehicle-card__arrow--prev" 
              aria-label="Foto anterior do ${vehicle.name}"
              data-action="prev">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" 
                stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
            </button>
            <button 
              class="vehicle-card__arrow vehicle-card__arrow--next" 
              aria-label="Próxima foto do ${vehicle.name}"
              data-action="next">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" 
                stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>
          </div>

          <div class="vehicle-card__dots" aria-hidden="true">
            ${dotsHTML}
          </div>

          ${badgeHTML}

          <button 
            class="vehicle-card__expand" 
            data-action="expand"
            aria-label="Ver detalhes de ${vehicle.name}">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" 
              stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
            </svg>
          </button>

          <img 
            class="vehicle-card__img" 
            src="${vehicle.images[0]}" 
            alt="${vehicle.name} — foto 1 de ${vehicle.images.length}"
            width="600" 
            height="360"
            loading="lazy"
            decoding="async"
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
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
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
            <div class="vehicle-card__price">
              <span class="vehicle-card__price-label">A partir de</span>
              <strong class="vehicle-card__price-value">
                ${ApexUtils.formatCurrency(vehicle.price)}
              </strong>
            </div>
            <button 
              class="btn btn--primary btn--sm vehicle-card__cta"
              data-action="expand"
              aria-label="Ver detalhes de ${vehicle.name}">
              Ver detalhes
            </button>
          </div>
        </div>
      </article>
    `;
  };

  /**
   * Renderiza cards no grid
   */
  const renderVehicles = (filter = 'all') => {
    const filtered = filter === 'all'
      ? VEHICLES_DATA
      : VEHICLES_DATA.filter(v => v.category === filter);

    vehiclesGrid.innerHTML = filtered.map(createVehicleCard).join('');

    // Reinicia observer de reveal nos novos cards
    const newRevealEls = ApexUtils.qsa('.reveal', vehiclesGrid);
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -60px 0px', threshold: 0.1 });

    newRevealEls.forEach(el => revealObserver.observe(el));

    // FIX: só registra listeners de navegação UMA vez
    initCardNavigation();
  };

  /**
   * Atualiza imagem e dots do card
   */
  const updateCardImage = (card, vehicle, newIndex) => {
    const img = ApexUtils.qs('.vehicle-card__img', card);
    const dots = ApexUtils.qsa('.vehicle-card__dot', card);

    img.src = vehicle.images[newIndex];
    img.alt = `${vehicle.name} — foto ${newIndex + 1} de ${vehicle.images.length}`;
    img.dataset.imageIndex = newIndex;

    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === newIndex));
  };

  /**
   * FIX CRÍTICO: delegação de eventos registrada UMA única vez no container
   * Usa data-action para diferenciar setas, dots e "ver detalhes"
   * e.stopPropagation() nas setas/dots impede que o modal abra junto
   */
 const initCardNavigation = () => {
  if (navigationInitialized) return;
  navigationInitialized = true;

  ApexUtils.on(vehiclesGrid, 'click', (e) => {

    // ── Setas de navegação ──────────────────────────────
    const arrow = e.target.closest('.vehicle-card__arrow');
    if (arrow) {
      e.stopPropagation();
      e.preventDefault(); // ✅ garante que nenhum outro handler processe
      const card = arrow.closest('.vehicle-card');
      const img = ApexUtils.qs('.vehicle-card__img', card);
      const vehicleId = card.dataset.vehicleId;
      const vehicle = VEHICLES_DATA.find(v => v.id === vehicleId);
      if (!vehicle) return;

      const current = parseInt(img.dataset.imageIndex);
      const isPrev = arrow.classList.contains('vehicle-card__arrow--prev');
      const newIndex = isPrev
        ? (current > 0 ? current - 1 : vehicle.images.length - 1)
        : (current < vehicle.images.length - 1 ? current + 1 : 0);

      updateCardImage(card, vehicle, newIndex);
      return;
    }

    // ── Dots de navegação ───────────────────────────────
    const dot = e.target.closest('.vehicle-card__dot');
    if (dot) {
      e.stopPropagation();
      e.preventDefault(); // ✅ garante que nenhum outro handler processe
      const card = dot.closest('.vehicle-card');
      const img = ApexUtils.qs('.vehicle-card__img', card);
      const vehicleId = card.dataset.vehicleId;
      const vehicle = VEHICLES_DATA.find(v => v.id === vehicleId);
      if (!vehicle) return;

      const newIndex = parseInt(dot.dataset.index);
      updateCardImage(card, vehicle, newIndex);
      return;
    }
  });
};

  const handleFilterClick = (e) => {
    const button = e.currentTarget;
    const category = button.getAttribute('data-filter');

    filterButtons.forEach((btn) => {
      btn.classList.remove('filter-btn--active');
      btn.setAttribute('aria-pressed', 'false');
    });

    button.classList.add('filter-btn--active');
    button.setAttribute('aria-pressed', 'true');

    renderVehicles(category);
  };

  const init = () => {
    if (!filterButtons.length || !vehiclesGrid) return;

    renderVehicles(); // renderização inicial
    ApexUtils.on(filterButtons, 'click', handleFilterClick);
  };

  return { init };
})();

/* ================================================================
   6. MODAL DE VEÍCULO
================================================================ */
const VehicleModal = (() => {
  const modal = ApexUtils.qs('#vehicleModal');
  const modalOverlay = ApexUtils.qs('#modalOverlay');

  // FIX: seleciona AMBOS os botões de fechar (top e rodapé)
  const modalCloseButtons = ApexUtils.qsa('#modalClose, #modalCloseBottom');

  let currentVehicle = null;
  let currentImageIndex = 0;
  let lastFocusedElement = null; // FIX: para restaurar foco ao fechar
  let cleanupTrapFocus = null;   // FIX: cleanup do focus trap

  const updateModalImage = (index) => {
    if (!currentVehicle) return;
    currentImageIndex = index;

    const mainImg = ApexUtils.qs('#modalMainImg', modal);
    mainImg.style.opacity = '0';

    setTimeout(() => {
      mainImg.src = currentVehicle.images[index];
      mainImg.alt = `${currentVehicle.name} — foto ${index + 1} de ${currentVehicle.images.length}`;
      mainImg.style.opacity = '1';
    }, 150);

    // Sincroniza thumbnails
    ApexUtils.qsa('.modal__thumb', modal).forEach((thumb, i) => {
      thumb.classList.toggle('is-active', i === index);
      thumb.setAttribute('aria-pressed', i === index ? 'true' : 'false');
    });
  };

  const renderModalThumbnails = (vehicle) => {
    const thumbsContainer = ApexUtils.qs('#modalThumbs', modal);
    thumbsContainer.innerHTML = '';

    vehicle.images.forEach((imgSrc, index) => {
      const thumb = document.createElement('button');
      thumb.className = `modal__thumb ${index === 0 ? 'is-active' : ''}`;
      thumb.setAttribute('aria-label', `Ver foto ${index + 1} de ${vehicle.name}`);
      thumb.setAttribute('aria-pressed', index === 0 ? 'true' : 'false');
      thumb.innerHTML = `
        <img src="${imgSrc}" alt="${vehicle.name} — miniatura ${index + 1}" 
          width="80" height="60" loading="lazy" decoding="async">
      `;
      thumb.addEventListener('click', () => updateModalImage(index));
      thumbsContainer.appendChild(thumb);
    });
  };

  const renderModalSpecs = (vehicle) => {
    const specsContainer = ApexUtils.qs('#modalSpecs', modal);
    specsContainer.innerHTML = '';

    const specsIcons = {
      km:           '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
      power:        '<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>',
      transmission: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>',
      fuel:         '<path d="M3 3h18v18H3z"/><path d="M12 8v8m4-4H8"/>',
      acceleration: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
      topSpeed:     '<path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>',
      color:        '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/>',
      doors:        '<path d="M21 2H3v20h18V2z"/><rect x="7" y="10" width="2" height="4"/>',
    };

    const labels = {
      km:           'Quilometragem',
      power:        'Potência',
      transmission: 'Transmissão',
      fuel:         'Combustível',
      acceleration: '0-100 km/h',
      topSpeed:     'Vel. Máxima',
      color:        'Cor',
      doors:        'Portas',
    };

    Object.entries(vehicle.specs).forEach(([key, value]) => {
      const specDiv = document.createElement('div');
      specDiv.className = 'modal__spec-item';
      specDiv.innerHTML = `
        <span class="modal__spec-label">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" 
            stroke="currentColor" stroke-width="2" aria-hidden="true">
            ${specsIcons[key] || '<circle cx="12" cy="12" r="10"/>'}
          </svg>
          ${labels[key] || key}
        </span>
        <span class="modal__spec-value">${value}</span>
      `;
      specsContainer.appendChild(specDiv);
    });
  };

  const renderModalOptionals = (vehicle) => {
    const optionalsList = ApexUtils.qs('#modalOptionalsList', modal);
    optionalsList.innerHTML = '';
    vehicle.optionals.forEach((optional) => {
      const li = document.createElement('li');
      li.textContent = optional;
      optionalsList.appendChild(li);
    });
  };

  
   const openModal = (vehicleId) => {
  const vehicle = VEHICLES_DATA.find(v => v.id === vehicleId);
  if (!vehicle) return;

  currentVehicle = vehicle;
  currentImageIndex = 0;
  lastFocusedElement = document.activeElement;

  // Preenche conteúdo
  ApexUtils.qs('#modalTitle', modal).textContent = vehicle.name;
  ApexUtils.qs('#modalYear', modal).textContent = vehicle.year;
  ApexUtils.qs('#modalPrice', modal).textContent = ApexUtils.formatCurrency(vehicle.price);
  ApexUtils.qs('#modalDesc', modal).textContent = vehicle.description;

  const waLink = ApexUtils.qs('#modalWhatsapp', modal);
  if (waLink) {
    const msg = encodeURIComponent(
      `Olá! Tenho interesse no ${vehicle.name} ${vehicle.year}. Poderia me dar mais informações?`
    );
    waLink.href = `https://wa.me/5511999999999?text=${msg}`;
  }

  renderModalThumbnails(vehicle);
  renderModalSpecs(vehicle);
  renderModalOptionals(vehicle);
  updateModalImage(0);

  // ✅ Reseta scroll interno do modal ANTES de abrir
  modal.scrollTop = 0;
  const modalInfo = ApexUtils.qs('.modal__info', modal);
  if (modalInfo) modalInfo.scrollTop = 0;

  modal.removeAttribute('hidden');
  ApexUtils.lockScroll(true);

  requestAnimationFrame(() => {
    modal.style.opacity = '1';
    cleanupTrapFocus = ApexUtils.trapFocus(modal);
  });
};

  const closeModal = () => {
    modal.style.opacity = '0';

    // FIX: limpa focus trap e restaura foco
    if (cleanupTrapFocus) {
      cleanupTrapFocus();
      cleanupTrapFocus = null;
    }

    setTimeout(() => {
      modal.setAttribute('hidden', '');
      ApexUtils.lockScroll(false);
      currentVehicle = null;

      // FIX: restaura foco ao elemento anterior
      lastFocusedElement?.focus();
    }, 250);
  };

  const init = () => {
  if (!modal) return;

  // ✅ Só abre modal via data-action="expand"
  // Não usa [data-vehicle-id] para não conflitar com o card pai
  ApexUtils.on(document.body, 'click', (e) => {
    // Ignora se o clique veio de seta ou dot
    if (e.target.closest('.vehicle-card__arrow')) return;
    if (e.target.closest('.vehicle-card__dot'))   return;
    if (e.target.closest('.vehicle-card__nav'))   return;

    const trigger = e.target.closest('[data-action="expand"]');
    if (!trigger) return;

    const card = trigger.closest('[data-vehicle-id]');
    if (!card) return;

    e.preventDefault();
    openModal(card.dataset.vehicleId);
  });

    // FIX: fecha por AMBOS os botões de fechar
    ApexUtils.on(modalCloseButtons, 'click', closeModal);
    ApexUtils.on(modalOverlay, 'click', closeModal);

    // Navegação com setas do modal
    ApexUtils.on(ApexUtils.qs('#modalPrev', modal), 'click', () => {
      if (!currentVehicle) return;
      const newIndex = currentImageIndex > 0
        ? currentImageIndex - 1
        : currentVehicle.images.length - 1;
      updateModalImage(newIndex);
    });

    ApexUtils.on(ApexUtils.qs('#modalNext', modal), 'click', () => {
      if (!currentVehicle) return;
      const newIndex = currentImageIndex < currentVehicle.images.length - 1
        ? currentImageIndex + 1
        : 0;
      updateModalImage(newIndex);
    });

    // Teclado
    ApexUtils.on(document, 'keydown', (e) => {
      if (modal.hasAttribute('hidden')) return;

      switch (e.key) {
        case 'Escape':
          closeModal();
          break;
        case 'ArrowLeft':
          ApexUtils.qs('#modalPrev', modal)?.click();
          break;
        case 'ArrowRight':
          ApexUtils.qs('#modalNext', modal)?.click();
          break;
      }
    });
  };

  return { init };
})();

/* ================================================================
   7. LIGHTBOX DA GALERIA
================================================================ */
const GalleryLightbox = (() => {
  const lightbox = ApexUtils.qs('#galleryLightbox');
  const lightboxImg = ApexUtils.qs('#lightboxImg');
  const lightboxCaption = ApexUtils.qs('#lightboxCaption');
  const lightboxCounter = ApexUtils.qs('#lightboxCounter');
  const lightboxClose = ApexUtils.qs('#lightboxClose');
  const lightboxPrev = ApexUtils.qs('#lightboxPrev');
  const lightboxNext = ApexUtils.qs('#lightboxNext');
  const lightboxOverlay = ApexUtils.qs('#lightboxOverlay');
  const galleryButtons = ApexUtils.qsa('[data-gallery]');

  let currentIndex = 0;
  let images = [];
  let cleanupTrapFocus;
  let lastFocusedElement = null;

  const loadImages = () => {
    images = Array.from(galleryButtons).map((btn) => {
      const img = btn.querySelector('img');
      return {
        src: img.src.replace(/w=\d+/, 'w=1600'),
        alt: img.alt,
      };
    });
  };

  const showImage = (index) => {
    if (index < 0) index = images.length - 1;
    if (index >= images.length) index = 0;
    currentIndex = index;

    lightboxImg.style.opacity = '0';
    setTimeout(() => {
      lightboxImg.src = images[index].src;
      lightboxImg.alt = images[index].alt;
      lightboxCaption.textContent = images[index].alt;
      lightboxCounter.textContent = `${index + 1} / ${images.length}`;
      lightboxImg.style.opacity = '1';
    }, 150);
  };

  const openLightbox = (index) => {
    loadImages();
    lastFocusedElement = document.activeElement;

    lightbox.removeAttribute('hidden');
    ApexUtils.lockScroll(true);
    showImage(index);

    requestAnimationFrame(() => {
      lightbox.style.opacity = '1';
      cleanupTrapFocus = ApexUtils.trapFocus(lightbox);
    });
  };

  const closeLightbox = () => {
    lightbox.style.opacity = '0';

    if (cleanupTrapFocus) {
      cleanupTrapFocus();
      cleanupTrapFocus = null;
    }

    setTimeout(() => {
      lightbox.setAttribute('hidden', '');
      ApexUtils.lockScroll(false);
      lastFocusedElement?.focus();
    }, 200);
  };

  const nextImage = () => showImage(currentIndex + 1);
  const prevImage = () => showImage(currentIndex - 1);

  const init = () => {
    if (!lightbox) return;

    ApexUtils.on(galleryButtons, 'click', (e) => {
      const index = parseInt(e.currentTarget.getAttribute('data-gallery'));
      openLightbox(index);
    });

    ApexUtils.on(lightboxClose, 'click', closeLightbox);
    ApexUtils.on(lightboxOverlay, 'click', closeLightbox);
    ApexUtils.on(lightboxPrev, 'click', prevImage);
    ApexUtils.on(lightboxNext, 'click', nextImage);

    ApexUtils.on(document, 'keydown', (e) => {
      if (lightbox.hasAttribute('hidden')) return;
      switch (e.key) {
        case 'Escape':    closeLightbox(); break;
        case 'ArrowRight': nextImage();    break;
        case 'ArrowLeft':  prevImage();    break;
      }
    });
  };

  return { init };
})();

/* ================================================================
   8. WIDGET DE ACESSIBILIDADE
================================================================ */
const AccessibilityWidget = (() => {
  const widget = ApexUtils.qs('.a11y-widget');
  const toggle = ApexUtils.qs('#a11yToggle');
  const panel = ApexUtils.qs('#a11yPanel');
  const btnHighContrast = ApexUtils.qs('#btnHighContrast');
  const btnReduceMotion = ApexUtils.qs('#btnReduceMotion');
  const btnFocusHighlight = ApexUtils.qs('#btnFocusHighlight');
  const btnFontIncrease = ApexUtils.qs('#btnFontIncrease');
  const btnFontDecrease = ApexUtils.qs('#btnFontDecrease');
  const btnFontReset = ApexUtils.qs('#btnFontReset');

  let fontSize = 16;

  const togglePanel = () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    if (isOpen) {
      panel.setAttribute('hidden', '');
      toggle.setAttribute('aria-expanded', 'false');
    } else {
      panel.removeAttribute('hidden');
      toggle.setAttribute('aria-expanded', 'true');
    }
  };

  const createToggler = (btn, bodyClass, storageKey) => () => {
    const isActive = btn.getAttribute('aria-checked') === 'true';
    if (isActive) {
      document.body.classList.remove(bodyClass);
      btn.setAttribute('aria-checked', 'false');
      localStorage.removeItem(storageKey);
    } else {
      document.body.classList.add(bodyClass);
      btn.setAttribute('aria-checked', 'true');
      localStorage.setItem(storageKey, 'true');
    }
  };

  const increaseFontSize = () => {
    if (fontSize >= 20) return;
    fontSize++;
    document.documentElement.style.fontSize = `${fontSize}px`;
    localStorage.setItem('apex-font-size', fontSize);
  };

  const decreaseFontSize = () => {
    if (fontSize <= 14) return;
    fontSize--;
    document.documentElement.style.fontSize = `${fontSize}px`;
    localStorage.setItem('apex-font-size', fontSize);
  };

  const resetFontSize = () => {
    fontSize = 16;
    document.documentElement.style.fontSize = `${fontSize}px`;
    localStorage.removeItem('apex-font-size');
  };

  const loadPreferences = () => {
    if (localStorage.getItem('apex-high-contrast') === 'true') {
      document.body.classList.add('high-contrast');
      btnHighContrast.setAttribute('aria-checked', 'true');
    }
    if (localStorage.getItem('apex-reduce-motion') === 'true') {
      document.body.classList.add('reduce-motion');
      btnReduceMotion.setAttribute('aria-checked', 'true');
    }
    if (localStorage.getItem('apex-focus-highlight') === 'true') {
      document.body.classList.add('focus-highlight');
      btnFocusHighlight.setAttribute('aria-checked', 'true');
    }
    const savedSize = localStorage.getItem('apex-font-size');
    if (savedSize) {
      fontSize = parseInt(savedSize);
      document.documentElement.style.fontSize = `${fontSize}px`;
    }
  };

  const init = () => {
    if (!widget) return;

    loadPreferences();

    ApexUtils.on(toggle, 'click', togglePanel);
    ApexUtils.on(btnHighContrast,   'click', createToggler(btnHighContrast,   'high-contrast',   'apex-high-contrast'));
    ApexUtils.on(btnReduceMotion,   'click', createToggler(btnReduceMotion,   'reduce-motion',   'apex-reduce-motion'));
    ApexUtils.on(btnFocusHighlight, 'click', createToggler(btnFocusHighlight, 'focus-highlight', 'apex-focus-highlight'));
    ApexUtils.on(btnFontIncrease,   'click', increaseFontSize);
    ApexUtils.on(btnFontDecrease,   'click', decreaseFontSize);
    ApexUtils.on(btnFontReset,      'click', resetFontSize);

    ApexUtils.on(document, 'click', (e) => {
      if (!widget.contains(e.target) && panel && !panel.hasAttribute('hidden')) {
        panel.setAttribute('hidden', '');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  };

  return { init };
})();

/* ================================================================
   9. FORMULÁRIO DE FINANCIAMENTO
================================================================ */
const FinancingForm = (() => {
  const form = ApexUtils.qs('#financingForm');
  const vehicleValueInput = ApexUtils.qs('#vehicleValue');
  const entryValueInput = ApexUtils.qs('#entryValue');
  const installmentsSelect = ApexUtils.qs('#installments');
  const resultDiv = ApexUtils.qs('#financingResult');
  const resultValue = ApexUtils.qs('#resultValue');

  const formatCurrencyInput = (input) => {
    let value = ApexUtils.numbersOnly(input.value);
    if (value === '') { input.value = ''; return; }
    value = (parseInt(value) / 100).toFixed(2);
    input.value = parseFloat(value).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const calculateFinancing = (e) => {
    e.preventDefault();

    const vehicleValue = parseFloat(ApexUtils.numbersOnly(vehicleValueInput.value)) / 100;
    const entryValue   = parseFloat(ApexUtils.numbersOnly(entryValueInput.value)) / 100;
    const installments = parseInt(installmentsSelect.value);

    if (!vehicleValue || vehicleValue <= 0) {
      Toast.show('Informe o valor do veículo', 'error');
      vehicleValueInput.focus();
      return;
    }
    if (!entryValue || entryValue <= 0) {
      Toast.show('Informe o valor de entrada', 'error');
      entryValueInput.focus();
      return;
    }
    if (entryValue < vehicleValue * 0.1) {
      Toast.show('Entrada mínima de 10% do valor do veículo', 'error');
      entryValueInput.focus();
      return;
    }
    if (entryValue >= vehicleValue) {
      Toast.show('Entrada não pode ser maior que o valor do veículo', 'error');
      entryValueInput.focus();
      return;
    }

    const monthlyRate     = 0.0149;
    const financedAmount  = vehicleValue - entryValue;
    const installmentValue =
      (financedAmount * monthlyRate * Math.pow(1 + monthlyRate, installments)) /
      (Math.pow(1 + monthlyRate, installments) - 1);

    resultValue.textContent = ApexUtils.formatCurrency(installmentValue);
    resultDiv.removeAttribute('hidden');
    Toast.show('Simulação calculada com sucesso!', 'success');
  };

  const init = () => {
    if (!form) return;
    ApexUtils.on(vehicleValueInput, 'input', () => formatCurrencyInput(vehicleValueInput));
    ApexUtils.on(entryValueInput,   'input', () => formatCurrencyInput(entryValueInput));
    ApexUtils.on(form, 'submit', calculateFinancing);
  };

  return { init };
})();

/* ================================================================
   10. FORMULÁRIO DE TRADE-IN
================================================================ */
const TradeInForm = (() => {
  const form = ApexUtils.qs('#tradeInForm');

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    if (!data.tiName || data.tiName.trim().length < 3) {
      Toast.show('Informe seu nome completo', 'error');
      ApexUtils.qs('#tiName', form).focus();
      return;
    }
    if (!data.tiPhone || ApexUtils.numbersOnly(data.tiPhone).length < 10) {
      Toast.show('Informe um telefone válido', 'error');
      ApexUtils.qs('#tiPhone', form).focus();
      return;
    }
    if (!data.tiBrand) {
      Toast.show('Selecione a marca do veículo', 'error');
      ApexUtils.qs('#tiBrand', form).focus();
      return;
    }
    if (!data.tiModel || data.tiModel.trim().length < 2) {
      Toast.show('Informe o modelo do veículo', 'error');
      ApexUtils.qs('#tiModel', form).focus();
      return;
    }
    if (!data.tiYear || parseInt(data.tiYear) < 1990 || parseInt(data.tiYear) > new Date().getFullYear() + 1) {
      Toast.show('Informe um ano válido', 'error');
      ApexUtils.qs('#tiYear', form).focus();
      return;
    }
    if (!data.tiKm || ApexUtils.numbersOnly(data.tiKm).length === 0) {
      Toast.show('Informe a quilometragem', 'error');
      ApexUtils.qs('#tiKm', form).focus();
      return;
    }

    // FIX: console.log de PII apenas em desenvolvimento
    if (window.location.hostname === 'localhost') {
      console.log('📝 Dados de avaliação:', data);
    }

    const message = `Olá! Gostaria de avaliar meu veículo:\n\nNome: ${data.tiName}\nTelefone: ${data.tiPhone}\nVeículo: ${data.tiBrand} ${data.tiModel} ${data.tiYear}\nKM: ${data.tiKm}`;
    const whatsappUrl = `https://wa.me/5511999999999?text=${encodeURIComponent(message)}`;

    Toast.show('Redirecionando para o WhatsApp...', 'success');
    setTimeout(() => {
      window.open(whatsappUrl, '_blank');
      form.reset();
    }, 1500);
  };

  const formatPhoneInput = (e) => {
    let value = ApexUtils.numbersOnly(e.target.value);
    if (value.length > 11) value = value.slice(0, 11);

    if (value.length >= 11) {
      e.target.value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
    } else if (value.length >= 7) {
      e.target.value = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
    } else if (value.length >= 3) {
      e.target.value = value.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
    } else {
      e.target.value = value.replace(/^(\d*)/, '($1');
    }
  };

  const init = () => {
    if (!form) return;
    ApexUtils.on(ApexUtils.qs('#tiPhone', form), 'input', formatPhoneInput);
    ApexUtils.on(form, 'submit', handleSubmit);
  };

  return { init };
})();

/* ================================================================
   11. FAQ ACCORDION
================================================================ */
const FAQ = (() => {
  const faqItems = ApexUtils.qsa('.faq-item');

  const toggleItem = (item) => {
    const button = item.querySelector('.faq-item__question');
    const answer = item.querySelector('.faq-item__answer');
    const isOpen = item.classList.contains('is-open');

    if (isOpen) {
      item.classList.remove('is-open');
      button.setAttribute('aria-expanded', 'false');
      answer.setAttribute('hidden', '');
    } else {
      // Fecha todos os outros
      faqItems.forEach((other) => {
        if (other !== item && other.classList.contains('is-open')) {
          other.classList.remove('is-open');
          other.querySelector('.faq-item__question').setAttribute('aria-expanded', 'false');
          other.querySelector('.faq-item__answer').setAttribute('hidden', '');
        }
      });

      item.classList.add('is-open');
      button.setAttribute('aria-expanded', 'true');
      answer.removeAttribute('hidden');
    }
  };

  const init = () => {
    if (!faqItems.length) return;
    faqItems.forEach((item) => {
      ApexUtils.on(item.querySelector('.faq-item__question'), 'click', () => toggleItem(item));
    });
  };

  return { init };
})();

/* ================================================================
   12. SLIDER DE DEPOIMENTOS
================================================================ */
const TestimonialsSlider = (() => {
  const track      = ApexUtils.qs('#testimonialsTrack');
  const prevBtn    = ApexUtils.qs('#testimonialsPrev');
  const nextBtn    = ApexUtils.qs('#testimonialsNext');
  const dots       = ApexUtils.qsa('.slider-dot');

  let currentSlide = 0;
  let totalSlides  = 0;
  let autoplayInterval;

  const updateSlider = () => {
    if (!track) return;

    const slides = track.querySelectorAll('.testimonials-slide');
    totalSlides = slides.length;

    currentSlide = Math.max(0, Math.min(currentSlide, totalSlides - 1));

    track.style.transform = `translateX(${currentSlide * -100}%)`;

    dots.forEach((dot, index) => {
      const isActive = index === currentSlide;
      dot.classList.toggle('slider-dot--active', isActive);
      dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
  };

  const nextSlide = () => {
    currentSlide = (currentSlide + 1) % totalSlides;
    updateSlider();
  };

  const prevSlide = () => {
    currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    updateSlider();
  };

  const startAutoplay = () => {
    autoplayInterval = setInterval(nextSlide, 6000);
  };

  const stopAutoplay = () => clearInterval(autoplayInterval);

  const resetAutoplay = () => { stopAutoplay(); startAutoplay(); };

  const init = () => {
    if (!track) return;

    updateSlider();

    ApexUtils.on(prevBtn, 'click', () => { prevSlide(); resetAutoplay(); });
    ApexUtils.on(nextBtn, 'click', () => { nextSlide(); resetAutoplay(); });

    dots.forEach((dot, index) => {
      ApexUtils.on(dot, 'click', () => {
        currentSlide = index;
        updateSlider();
        resetAutoplay();
      });
    });

    ApexUtils.on(window, 'resize', ApexUtils.debounce(updateSlider, 200));

    ApexUtils.on(track, 'mouseenter', stopAutoplay);
    ApexUtils.on(track, 'mouseleave', startAutoplay);

    startAutoplay();
  };

  return { init };
})();

/* ================================================================
   13. ESTATÍSTICAS ANIMADAS (COUNT-UP)
   FIX: usa timestamp real — compatível com monitores 120Hz/144Hz
================================================================ */
const AnimatedStats = (() => {
  const stats = ApexUtils.qsa('.stat-card__number[data-target]');
  let hasAnimated = false;

  const animateCount = (element) => {
    const target   = parseInt(element.getAttribute('data-target'));
    const prefix   = element.getAttribute('data-prefix') || '';
    const suffix   = element.getAttribute('data-suffix') || '';
    const duration = 2000; // ms
    const startTime = performance.now();

    const step = (now) => {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing suave (ease-out)
      const eased   = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * target);

      element.textContent = `${prefix}${current.toLocaleString('pt-BR')}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        element.textContent = `${prefix}${target.toLocaleString('pt-BR')}${suffix}`;
      }
    };

    requestAnimationFrame(step);
  };

  const init = () => {
    if (!stats.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !hasAnimated) {
          hasAnimated = true;
          stats.forEach((stat, index) => {
            setTimeout(() => animateCount(stat), index * 150);
          });
        }
      });
    }, { threshold: 0.5 });

    if (stats[0]) observer.observe(stats[0]);
  };

  return { init };
})();

/* ================================================================
   14. TOAST NOTIFICATIONS
================================================================ */
const Toast = (() => {
  const container = ApexUtils.qs('#toastContainer');
  let toastId = 0;

  const show = (message, type = 'info', duration = 4000) => {
    if (!container) return;

    toastId++;
    const id = `toast-${toastId}`;

    const icons = {
      success: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22C55E" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
      error:   '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
      info:    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1E88E5" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
    };

    const titles = { success: 'Sucesso', error: 'Erro', info: 'Informação' };

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.id = id;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');
    toast.innerHTML = `
      <div class="toast__icon">${icons[type]}</div>
      <div class="toast__content">
        <div class="toast__title">${titles[type]}</div>
        <div class="toast__message">${message}</div>
      </div>
      <button class="toast__close" aria-label="Fechar notificação">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    `;

    container.appendChild(toast);
    ApexUtils.on(toast.querySelector('.toast__close'), 'click', () => remove(id));
    if (duration > 0) setTimeout(() => remove(id), duration);

    return id;
  };

  const remove = (id) => {
    const toast = ApexUtils.qs(`#${id}`);
    if (!toast) return;
    toast.classList.add('is-removing');
    setTimeout(() => toast.remove(), 300);
  };

  return { show, remove };
})();

/* ================================================================
   15. BACK TO TOP
================================================================ */
const BackToTop = (() => {
  const button = ApexUtils.qs('#backToTop');

  const init = () => {
    if (!button) return;

    window.addEventListener('scroll', ApexUtils.throttle(() => {
      button.classList.toggle('is-visible', window.pageYOffset > 400);
    }, 200), { passive: true });

    ApexUtils.on(button, 'click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  return { init };
})();

/* ================================================================
   16. SMOOTH SCROLL
================================================================ */
const SmoothScroll = (() => {
  const init = () => {
    ApexUtils.on(ApexUtils.qsa('a[href^="#"]'), 'click', (e) => {
      const href = e.currentTarget.getAttribute('href');
      if (href === '#' || href === '#!') { e.preventDefault(); return; }
      const target = ApexUtils.qs(href);
      if (target) { e.preventDefault(); ApexUtils.scrollTo(target); }
    });
  };

  return { init };
})();

/* ================================================================
   17. VALIDAÇÃO DE FORMULÁRIOS
================================================================ */
const FormValidation = (() => {
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPhone = (phone) => {
    const n = ApexUtils.numbersOnly(phone);
    return n.length >= 10 && n.length <= 11;
  };

  const addRealtimeValidation = (input, validator) => {
    ApexUtils.on(input, 'blur', () => {
      const value = input.value.trim();
      const invalid = value && !validator(value);
      input.classList.toggle('is-error', invalid);
      invalid
        ? input.setAttribute('aria-invalid', 'true')
        : input.removeAttribute('aria-invalid');
    });

    ApexUtils.on(input, 'input', () => {
      if (input.classList.contains('is-error') && validator(input.value.trim())) {
        input.classList.remove('is-error');
        input.removeAttribute('aria-invalid');
      }
    });
  };

  const init = () => {
    ApexUtils.qsa('input[type="email"]').forEach(input => addRealtimeValidation(input, isValidEmail));
    ApexUtils.qsa('input[type="tel"]').forEach(input => addRealtimeValidation(input, isValidPhone));
  };

  return { init, isValidEmail, isValidPhone };
})();

/* ================================================================
   18. LAZY LOADING (FALLBACK)
================================================================ */
const LazyLoad = (() => {
  const init = () => {
    if ('loading' in HTMLImageElement.prototype) return; // suporte nativo

    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src || img.src;
          img.classList.add('is-loaded');
          observer.unobserve(img);
        }
      });
    });

    ApexUtils.qsa('img[loading="lazy"]').forEach(img => imageObserver.observe(img));
  };

  return { init };
})();

/* ================================================================
   19. PERFORMANCE — WEB VITALS
   FIX: preconnect via JS removido (já feito no HTML)
================================================================ */
const Performance = (() => {
  const logWebVitals = () => {
    if (window.location.hostname === 'localhost') return;
    if (!('PerformanceObserver' in window)) return;

    try {
      new PerformanceObserver((list) => {
        const last = list.getEntries().at(-1);
        console.log('📊 LCP:', last?.renderTime || last?.loadTime);
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      new PerformanceObserver((list) => {
        list.getEntries().forEach(e => {
          console.log('📊 FID:', e.processingStart - e.startTime);
        });
      }).observe({ entryTypes: ['first-input'] });

      let clsScore = 0;
      new PerformanceObserver((list) => {
        list.getEntries().forEach(e => {
          if (!e.hadRecentInput) {
            clsScore += e.value;
            console.log('📊 CLS:', clsScore);
          }
        });
      }).observe({ entryTypes: ['layout-shift'] });
    } catch (err) {
      // PerformanceObserver não suportado para este entry type — ignora silenciosamente
    }
  };

  const init = () => {
    logWebVitals();
    window.addEventListener('load', () => {
      setTimeout(() => {
        // FIX: verifica suporte antes de usar timing API legada
        if (performance.timing) {
          const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
          if (loadTime > 0) console.log(`⚡ Página carregada em ${loadTime}ms`);
        }
      }, 0);
    });
  };

  return { init };
})();

/* ================================================================
   20. INICIALIZAÇÃO
================================================================ */
const ApexMotors = (() => {
  const updateCurrentYear = () => {
    const el = ApexUtils.qs('#currentYear');
    if (el) el.textContent = new Date().getFullYear();
  };

  const preventIOSZoom = () => {
    ApexUtils.qsa('input, select, textarea').forEach((input) => {
      if (parseFloat(window.getComputedStyle(input).fontSize) < 16) {
        input.style.fontSize = '16px';
      }
    });
  };

  const consoleMessage = () => {
    console.log(
      '%c🏎️ APEX MOTORS',
      'color:#1E88E5;font-size:18px;font-weight:bold;font-family:Space Grotesk,sans-serif'
    );
    console.log('%cPerformance, elegância e exclusividade.', 'color:#8B949E;font-size:12px;font-style:italic');
    console.log('%c\nInteressado em trabalhar conosco?\nEnvie seu portfólio para: tech@apexmotors.com.br', 'color:#F5F5F5;font-size:11px;');
  };

  const init = () => {
    console.log('🚀 Inicializando Apex Motors...');

    updateCurrentYear();
    preventIOSZoom();
    consoleMessage();

    RevealOnScroll.init();
    Header.init();
    Hero.init();
    VehicleFilter.init();
    VehicleModal.init();
    GalleryLightbox.init();
    AccessibilityWidget.init();
    FinancingForm.init();
    TradeInForm.init();
    FAQ.init();
    TestimonialsSlider.init();
    AnimatedStats.init();
    BackToTop.init();
    SmoothScroll.init();
    FormValidation.init();
    LazyLoad.init();
    Performance.init();

    console.log('✅ Apex Motors inicializado com sucesso!');
  };

  return { init };
})();

/* ================================================================
   BOOTSTRAP
================================================================ */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', ApexMotors.init);
} else {
  ApexMotors.init();
}

// Expõe globalmente para debugging (remover em produção)
if (window.location.hostname === 'localhost') {
  window.ApexMotors = ApexMotors;
  window.Toast = Toast;
}
