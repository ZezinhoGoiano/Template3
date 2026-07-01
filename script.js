/* ================================================================
   APEX MOTORS — script.js
   Versão: 1.0.0
   Autor: Apex Motors Dev Team
   Descrição: JavaScript principal da landing page premium
   
   ÍNDICE:
   1.  Utilitários & Helpers
   2.  Intersection Observer (Reveal ao Scroll)
   3.  Header — Scroll & Mobile Menu
   4.  Hero — Ken Burns Effect
   5.  Filtros de Veículos
   6.  Modal de Veículo
   7.  Lightbox da Galeria
   8.  Widget de Acessibilidade
   9.  Formulário de Financiamento
   10. Formulário de Trade-in
   11. FAQ Accordion
   12. Slider de Depoimentos
   13. Estatísticas Animadas (CountUp)
   14. Toast Notifications
   15. Back to Top
   16. Smooth Scroll
   17. Validação de Formulários
   18. Lazy Loading Aprimorado
   19. Performance & Analytics
   20. Inicialização
================================================================ */

'use strict';

/* ================================================================
   BANCO DE DADOS DE VEÍCULOS
   Organize todos os veículos aqui para facilitar manutenção
   e futura integração com API/backend
================================================================ */
const VEHICLES_DATA = [
  {
    id: '1',
    name: 'Porsche 911 Carrera S',
    year: '2023',
    price: 1290000,
    category: 'sport',
    badge: 'NOVO',
    badgeColor: 'success',
    description: 'O ícone absoluto dos esportivos. Motor boxer de 6 cilindros 3.0 biturbo entregando 450 cv de potência pura. Aceleração de 0-100 km/h em apenas 3.5 segundos.',
    images: [
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80',
      'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80',
      'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800&q=80',
    ],
    specs: {
      km: '14.200 km',
      power: '450 cv',
      transmission: 'PDK 8 vel.',
      fuel: 'Gasolina',
      acceleration: '3.5s (0-100)',
      topSpeed: '308 km/h',
      color: 'Prata Metálico',
      doors: '2 portas',
    },
    optionals: [
      'Teto panorâmico',
      'Sistema de som Bose',
      'Bancos com aquecimento',
      'Rodas 20" liga leve',
      'Controle de cruzeiro adaptativo',
      'Câmera 360°',
    ],
  },
  {
    id: '2',
    name: 'Mercedes-Benz S 500',
    year: '2023',
    price: 1650000,
    category: 'luxury',
    badge: 'DESTAQUE',
    badgeColor: 'accent',
    description: 'Luxo e tecnologia em perfeita harmonia. Motor V8 híbrido com 435 cv, bancos massageadores, suspensão pneumática e o mais avançado sistema MBUX.',
    images: [
      'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80',
      'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80',
      'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&q=80',
    ],
    specs: {
      km: '8.500 km',
      power: '435 cv',
      transmission: '9G-Tronic',
      fuel: 'Híbrido',
      acceleration: '4.5s (0-100)',
      topSpeed: '250 km/h',
      color: 'Preto Obsidiana',
      doors: '4 portas',
    },
    optionals: [
      'MBUX com IA',
      'Head-up Display',
      'Bancos massageadores',
      'Suspensão pneumática',
      'Sistema Burmester 4D',
      'Perfume interior',
    ],
  },
  {
    id: '3',
    name: 'BMW X7 M60i',
    year: '2024',
    price: 1180000,
    category: 'suv',
    badge: 'NOVO',
    badgeColor: 'success',
    description: 'O SUV definitivo. Motor V8 4.4 biturbo com 530 cv, sete lugares com conforto de primeira classe, tecnologia xDrive e acabamento Vernasca.',
    images: [
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80',
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80',
      'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&q=80',
    ],
    specs: {
      km: '0 km',
      power: '530 cv',
      transmission: 'Steptronic 8',
      fuel: 'Gasolina',
      acceleration: '4.5s (0-100)',
      topSpeed: '250 km/h',
      color: 'Branco Alpino',
      doors: '5 portas',
    },
    optionals: [
      'Pacote M Sport Pro',
      'iDrive 8.0',
      'Bancos Vernasca',
      'Rodas 22" M',
      'Tração xDrive',
      'Faróis Laserlight',
    ],
  },
  {
    id: '4',
    name: 'Lamborghini Huracán EVO',
    year: '2022',
    price: 3490000,
    category: 'sport',
    badge: 'PREMIUM',
    badgeColor: 'warning',
    description: 'Pura emoção italiana. V10 aspirado de 5.2 litros gerando 640 cv de adrenalina pura. Sistema LDVI que prevê suas intenções ao volante.',
    images: [
      'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?w=800&q=80',
      'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?w=800&q=80',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80',
    ],
    specs: {
      km: '22.000 km',
      power: '640 cv',
      transmission: 'LDF 7 vel.',
      fuel: 'Gasolina',
      acceleration: '2.9s (0-100)',
      topSpeed: '325 km/h',
      color: 'Amarelo Orion',
      doors: '2 portas',
    },
    optionals: [
      'Sistema LDVI',
      'Câmera frontal lift',
      'Bancos esportivos',
      'Escapamento Akrapovič',
      'Rodas Giano 20"',
      'Pintura especial',
    ],
  },
  {
    id: '5',
    name: 'Audi A8 L 60 TFSI',
    year: '2023',
    price: 1420000,
    category: 'luxury',
    badge: null,
    badgeColor: null,
    description: 'Sofisticação tecnológica alemã. Motor V8 TFSI com 462 cv, suspensão preditiva que lê a pista, interior em couro Valcona e Matrix LED.',
    images: [
      'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800&q=80',
      'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800&q=80',
      'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&q=80',
    ],
    specs: {
      km: '18.600 km',
      power: '462 cv',
      transmission: 'Tiptronic 8',
      fuel: 'Gasolina',
      acceleration: '4.4s (0-100)',
      topSpeed: '250 km/h',
      color: 'Preto Mythos',
      doors: '4 portas',
    },
    optionals: [
      'Suspensão preditiva',
      'Virtual Cockpit Plus',
      'Bang & Olufsen 3D',
      'Matrix LED',
      'Bancos massageadores',
      'Tração Quattro',
    ],
  },
  {
    id: '6',
    name: 'Range Rover Autobiography',
    year: '2024',
    price: 2180000,
    category: 'suv',
    badge: 'NOVO',
    badgeColor: 'success',
    description: 'Luxo britânico incomparável. Motor diesel V8 com 530 cv, capacidade off-road excepcional, interior em couro Windsor premium.',
    images: [
      'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&q=80',
      'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&q=80',
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80',
    ],
    specs: {
      km: '5.200 km',
      power: '530 cv',
      transmission: 'Auto 8 vel.',
      fuel: 'Diesel',
      acceleration: '4.6s (0-100)',
      topSpeed: '250 km/h',
      color: 'Verde British Racing',
      doors: '5 portas',
    },
    optionals: [
      'Terrain Response 2',
      'Pivi Pro',
      'Meridian Signature',
      'Bancos Executive',
      'Teto panorâmico',
      'Rodas 23"',
    ],
  },
];

/* ================================================================
   1. UTILITÁRIOS & HELPERS
================================================================ */

const ApexUtils = {
  /**
   * Seleciona um elemento do DOM
   * @param {string} selector
   * @param {Element} parent
   * @returns {Element|null}
   */
  qs: (selector, parent = document) => parent.querySelector(selector),

  /**
   * Seleciona múltiplos elementos do DOM
   * @param {string} selector
   * @param {Element} parent
   * @returns {NodeList}
   */
  qsa: (selector, parent = document) => parent.querySelectorAll(selector),

  /**
   * Adiciona evento(s) a elemento(s)
   * @param {Element|NodeList} elements
   * @param {string} events
   * @param {Function} handler
   * @param {object} options
   */
  on: (elements, events, handler, options = {}) => {
    const els = elements instanceof NodeList ? elements : [elements];
    const eventList = events.split(' ');

    els.forEach(el => {
      eventList.forEach(event => {
        el?.addEventListener(event, handler, options);
      });
    });
  },

  /**
   * Remove evento(s) de elemento(s)
   * @param {Element|NodeList} elements
   * @param {string} events
   * @param {Function} handler
   */
  off: (elements, events, handler) => {
    const els = elements instanceof NodeList ? elements : [elements];
    const eventList = events.split(' ');

    els.forEach(el => {
      eventList.forEach(event => {
        el?.removeEventListener(event, handler);
      });
    });
  },

  /**
   * Debounce function
   * @param {Function} func
   * @param {number} wait
   * @returns {Function}
   */
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

  /**
   * Throttle function
   * @param {Function} func
   * @param {number} limit
   * @returns {Function}
   */
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

  /**
   * Formata número como moeda BRL
   * @param {number} value
   * @returns {string}
   */
  formatCurrency: (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  },

  /**
   * Formata número removendo não-dígitos
   * @param {string} value
   * @returns {string}
   */
  numbersOnly: (value) => value.replace(/\D/g, ''),

  /**
   * Formata telefone (11) 99999-9999
   * @param {string} value
   * @returns {string}
   */
  formatPhone: (value) => {
    const cleaned = ApexUtils.numbersOnly(value);
    const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return value;
  },

  /**
   * Trap focus dentro de um elemento (a11y)
   * @param {Element} element
   */
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

  /**
   * Bloqueia scroll do body (útil para modais)
   * @param {boolean} lock
   */
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

  /**
   * Gera ID único
   * @returns {string}
   */
  generateId: () => `apex-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,

  /**
   * Anima scroll até elemento
   * @param {Element|string} target
   * @param {number} offset
   */
  scrollTo: (target, offset = 80) => {
    const element = typeof target === 'string' ? ApexUtils.qs(target) : target;
    if (!element) return;

    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth',
    });
  },
};

/* ================================================================
   2. INTERSECTION OBSERVER (REVEAL AO SCROLL)
================================================================ */

const RevealOnScroll = (() => {
  const init = () => {
    const revealElements = ApexUtils.qsa('.reveal');
    if (!revealElements.length) return;

    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -80px 0px',
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          // Opcional: parar de observar depois de revelar
          // observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

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

  let lastScroll = 0;

  /**
   * Adiciona classe ao header quando scrollar
   */
  const handleScroll = ApexUtils.throttle(() => {
    const currentScroll = window.pageYOffset;

    // Adiciona classe quando passar de 80px
    if (currentScroll > 80) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }

    // Opcional: esconder header ao rolar para baixo
    // if (currentScroll > lastScroll && currentScroll > 200) {
    //   header.style.transform = 'translateY(-100%)';
    // } else {
    //   header.style.transform = 'translateY(0)';
    // }

    lastScroll = currentScroll;
  }, 100);

  /**
   * Toggle menu mobile
   */
  const toggleMobileMenu = () => {
    const isOpen = hamburger.getAttribute('aria-expanded') === 'true';

    if (isOpen) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
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

  /**
   * Fecha menu ao clicar em link
   */
  const handleNavLinkClick = (e) => {
    const href = e.currentTarget.getAttribute('href');

    // Se for link interno (#)
    if (href.startsWith('#')) {
      e.preventDefault();
      closeMobileMenu();

      setTimeout(() => {
        ApexUtils.scrollTo(href);
      }, 300);
    }
  };

  /**
   * Marca link ativo baseado na seção visível
   */
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

  /**
   * Fecha menu ao pressionar ESC
   */
  const handleEscKey = (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('is-open')) {
      closeMobileMenu();
    }
  };

  const init = () => {
    if (!header) return;

    // Scroll
    ApexUtils.on(window, 'scroll', handleScroll);
    ApexUtils.on(window, 'scroll', ApexUtils.throttle(handleActiveSection, 200));

    // Mobile menu
    ApexUtils.on(hamburger, 'click', toggleMobileMenu);
    ApexUtils.on(navLinks, 'click', handleNavLinkClick);

    // ESC para fechar
    ApexUtils.on(document, 'keydown', handleEscKey);

    // Fecha menu ao clicar fora (overlay)
    ApexUtils.on(navMenu, 'click', (e) => {
      if (e.target === navMenu) {
        closeMobileMenu();
      }
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

    // Adiciona classe após o load para iniciar animação ken burns
    window.addEventListener('load', () => {
      setTimeout(() => {
        hero.classList.add('is-loaded');
      }, 100);
    });

    // ✅ Parallax sutil no scroll (CORRIGIDO - para quando sai do hero)
    const handleParallax = ApexUtils.throttle(() => {
      const scrolled = window.pageYOffset;
      const heroBg = ApexUtils.qs('.hero__bg', hero);
      const heroHeight = hero.offsetHeight;
      
      // ✅ SÓ APLICA PARALLAX ENQUANTO ESTÁ NO HERO
      if (heroBg && scrolled < heroHeight) {
        heroBg.style.transform = `translateY(${scrolled * 0.4}px) scale(1)`;
      } else if (heroBg) {
        // ✅ TRAVA NA POSIÇÃO FINAL
        heroBg.style.transform = `translateY(${heroHeight * 0.4}px) scale(1)`;
      }
    }, 16);

    ApexUtils.on(window, 'scroll', handleParallax);
  };

  return { init };
})();

/* ================================================================
   5. FILTROS DE VEÍCULOS
================================================================ */

/* ================================================================
   5. FILTROS DE VEÍCULOS + GERAÇÃO DINÂMICA DOS CARDS
================================================================ */
const VehicleFilter = (() => {
  const filterButtons = ApexUtils.qsa('.filter-btn');
  const vehiclesGrid = ApexUtils.qs('.vehicles-grid');

  /**
   * Gera o HTML de um card de veículo
   */
  const createVehicleCard = (vehicle) => {
    const badgeHTML = vehicle.badge 
      ? `<span class="vehicle-card__badge vehicle-card__badge--${vehicle.badgeColor}">${vehicle.badge}</span>` 
      : '';

    const dotsHTML = vehicle.images.map((_, index) => 
      `<span class="vehicle-card__dot ${index === 0 ? 'is-active' : ''}" data-index="${index}"></span>`
    ).join('');

    return `
      <div class="vehicle-card" data-category="${vehicle.category}" data-vehicle-id="${vehicle.id}">
        <div class="vehicle-card__image-wrap">
          <div class="vehicle-card__nav">
            <button class="vehicle-card__arrow vehicle-card__arrow--prev" aria-label="Foto anterior">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
            </button>
            <button class="vehicle-card__arrow vehicle-card__arrow--next" aria-label="Próxima foto">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>
          </div>
          
          <div class="vehicle-card__dots">
            ${dotsHTML}
          </div>

          ${badgeHTML}
          
          <button class="vehicle-card__expand" data-vehicle-id="${vehicle.id}">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
            </svg>
          </button>

          <img class="vehicle-card__img" src="${vehicle.images[0]}" alt="${vehicle.name}" data-vehicle-id="${vehicle.id}" data-image-index="0">
        </div>

        <div class="vehicle-card__body">
          <div class="vehicle-card__header">
            <div>
              <h3 class="vehicle-card__name">${vehicle.name}</h3>
              <span class="vehicle-card__year">${vehicle.year}</span>
            </div>
          </div>

          <div class="vehicle-card__specs">
            <div class="vehicle-card__spec">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
              <span>${vehicle.specs.km}</span>
            </div>
            <div class="vehicle-card__spec">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
              <span>${vehicle.specs.power}</span>
            </div>
          </div>

          <div class="vehicle-card__footer">
            <div class="vehicle-card__price">
              <span class="vehicle-card__price-label">A partir de</span>
              <span class="vehicle-card__price-value">${ApexUtils.formatCurrency(vehicle.price)}</span>
            </div>
            <button class="btn btn--primary btn--sm vehicle-card__cta" data-vehicle-id="${vehicle.id}">
              Ver detalhes
            </button>
          </div>
        </div>
      </div>
    `;
  };

  /**
   * Renderiza todos os veículos
   */
  const renderVehicles = (filter = 'all') => {
    const filteredVehicles = filter === 'all' 
      ? VEHICLES_DATA 
      : VEHICLES_DATA.filter(v => v.category === filter);

    vehiclesGrid.innerHTML = filteredVehicles.map(createVehicleCard).join('');

    // Inicializa navegação de imagens nos cards
    initCardNavigation();
  };

  /**
   * Navegação de imagens nos cards
   */
  const initCardNavigation = () => {
    // Setas
    ApexUtils.on(vehiclesGrid, 'click', (e) => {
      const arrow = e.target.closest('.vehicle-card__arrow');
      if (!arrow) return;

      const card = e.target.closest('.vehicle-card');
      const img = ApexUtils.qs('.vehicle-card__img', card);
      const vehicleId = img.dataset.vehicleId;
      const currentIndex = parseInt(img.dataset.imageIndex);
      const vehicle = VEHICLES_DATA.find(v => v.id === vehicleId);
      
      if (!vehicle) return;

      let newIndex;
      if (arrow.classList.contains('vehicle-card__arrow--prev')) {
        newIndex = currentIndex > 0 ? currentIndex - 1 : vehicle.images.length - 1;
      } else {
        newIndex = currentIndex < vehicle.images.length - 1 ? currentIndex + 1 : 0;
      }

      updateCardImage(card, vehicle, newIndex);
    });

    // Bolinhas
    ApexUtils.on(vehiclesGrid, 'click', (e) => {
      const dot = e.target.closest('.vehicle-card__dot');
      if (!dot) return;

      const card = e.target.closest('.vehicle-card');
      const img = ApexUtils.qs('.vehicle-card__img', card);
      const vehicleId = img.dataset.vehicleId;
      const newIndex = parseInt(dot.dataset.index);
      const vehicle = VEHICLES_DATA.find(v => v.id === vehicleId);
      
      if (!vehicle) return;

      updateCardImage(card, vehicle, newIndex);
    });
  };

  /**
   * Atualiza imagem e dots do card
   */
  const updateCardImage = (card, vehicle, newIndex) => {
    const img = ApexUtils.qs('.vehicle-card__img', card);
    const dots = ApexUtils.qsa('.vehicle-card__dot', card);

    img.src = vehicle.images[newIndex];
    img.alt = `${vehicle.name} - Foto ${newIndex + 1}`;
    img.dataset.imageIndex = newIndex;

    dots.forEach((dot, index) => {
      dot.classList.toggle('is-active', index === newIndex);
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
    if (!filterButtons.length) return;

    renderVehicles();
    ApexUtils.on(filterButtons, 'click', handleFilterClick);
  };

  return { init };
})();

/* ================================================================
   6. MODAL DE VEÍCULO
================================================================ */

/* ================================================================
   6. MODAL DE VEÍCULO COM NAVEGAÇÃO
================================================================ */
const VehicleModal = (() => {
  const modal = ApexUtils.qs('#vehicleModal');
  const modalOverlay = ApexUtils.qs('#modalOverlay');
  const modalClose = ApexUtils.qs('#modalClose');
  const openButtons = ApexUtils.qsa('[data-vehicle-id]');

  let currentVehicle = null;
  let currentImageIndex = 0;

  /**
   * Abre o modal com dados do veículo
   */
  const openModal = (vehicleId) => {
    const vehicle = VEHICLES_DATA.find(v => v.id === vehicleId);
    if (!vehicle) return;

    currentVehicle = vehicle;
    currentImageIndex = 0;

    // Preenche dados
    ApexUtils.qs('#modalTitle', modal).textContent = vehicle.name;
    ApexUtils.qs('#modalYear', modal).textContent = vehicle.year;
    ApexUtils.qs('#modalPrice', modal).textContent = ApexUtils.formatCurrency(vehicle.price);
    ApexUtils.qs('#modalDesc', modal).textContent = vehicle.description;

    // Renderiza thumbnails
    renderModalThumbnails(vehicle);

    // Renderiza specs
    renderModalSpecs(vehicle);

    // Renderiza optionals
    renderModalOptionals(vehicle);

    // Mostra primeira imagem
    updateModalImage(0);

    // Mostra modal
    modal.removeAttribute('hidden');
    ApexUtils.lockScroll(true);

    requestAnimationFrame(() => {
      modal.style.opacity = '1';
    });
  };

  /**
   * Renderiza thumbnails
   */
  const renderModalThumbnails = (vehicle) => {
    const thumbsContainer = ApexUtils.qs('#modalThumbs', modal);
    thumbsContainer.innerHTML = '';

    vehicle.images.forEach((img, index) => {
      const thumb = document.createElement('button');
      thumb.className = `modal__thumb ${index === 0 ? 'is-active' : ''}`;
      thumb.innerHTML = `<img src="${img}" alt="${vehicle.name} - Miniatura ${index + 1}" width="80" height="60">`;
      thumb.setAttribute('aria-label', `Ver foto ${index + 1}`);
      thumb.addEventListener('click', () => {
        updateModalImage(index);
        
        // Atualiza active state
        thumbsContainer.querySelectorAll('.modal__thumb').forEach(t => t.classList.remove('is-active'));
        thumb.classList.add('is-active');
      });

      thumbsContainer.appendChild(thumb);
    });
  };

  /**
   * Atualiza imagem principal do modal
   */
  /**
 * Atualiza imagem principal do modal
 */
const updateModalImage = (index) => {
  if (!currentVehicle) return;

  currentImageIndex = index;
  const mainImg = ApexUtils.qs('#modalMainImg', modal);
  
  mainImg.style.opacity = '0';
  
  setTimeout(() => {
    mainImg.src = currentVehicle.images[index];
    mainImg.alt = `${currentVehicle.name} - Foto ${index + 1}`;
    mainImg.style.opacity = '1';
  }, 150);

  // ✅ ATUALIZA THUMBNAILS também!
  const thumbs = ApexUtils.qsa('.modal__thumb', modal);
  thumbs.forEach((thumb, i) => {
    thumb.classList.toggle('is-active', i === index);
  });
};

  /**
   * Renderiza specs
   */
  const renderModalSpecs = (vehicle) => {
    const specsContainer = ApexUtils.qs('#modalSpecs', modal);
    specsContainer.innerHTML = '';

    const specsIcons = {
      km: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
      power: '<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>',
      transmission: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>',
      fuel: '<path d="M3 3h18v18H3z"/><path d="M12 8v8m4-4H8"/>',
      acceleration: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
      topSpeed: '<path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>',
      color: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/>',
      doors: '<path d="M21 2H3v20h18V2z"/><rect x="7" y="10" width="2" height="4"/>',
    };

    const labels = {
      km: 'Quilometragem',
      power: 'Potência',
      transmission: 'Transmissão',
      fuel: 'Combustível',
      acceleration: '0-100 km/h',
      topSpeed: 'Vel. Máxima',
      color: 'Cor',
      doors: 'Portas',
    };

    Object.entries(vehicle.specs).forEach(([key, value]) => {
      const specDiv = document.createElement('div');
      specDiv.className = 'modal__spec-item';

      const iconSVG = specsIcons[key] || '<circle cx="12" cy="12" r="10"/>';

      specDiv.innerHTML = `
        <span class="modal__spec-label">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            ${iconSVG}
          </svg>
          ${labels[key] || key}
        </span>
        <span class="modal__spec-value">${value}</span>
      `;

      specsContainer.appendChild(specDiv);
    });
  };

  /**
   * Renderiza optionals
   */
  const renderModalOptionals = (vehicle) => {
    const optionalsList = ApexUtils.qs('#modalOptionalsList', modal);
    optionalsList.innerHTML = '';

    vehicle.optionals.forEach((optional) => {
      const li = document.createElement('li');
      li.textContent = optional;
      optionalsList.appendChild(li);
    });
  };

  const closeModal = () => {
    modal.style.opacity = '0';

    setTimeout(() => {
      modal.setAttribute('hidden', '');
      ApexUtils.lockScroll(false);
      currentVehicle = null;
    }, 250);
  };

  const init = () => {
  if (!modal) return;

  // Abrir modal (usando event delegation para elementos dinâmicos)
  ApexUtils.on(document.body, 'click', (e) => {
    const btn = e.target.closest('[data-vehicle-id]');
    if (!btn) return;
    
    e.preventDefault();
    const vehicleId = btn.getAttribute('data-vehicle-id');
    openModal(vehicleId);
  });

    // Fechar modal
    ApexUtils.on(modalClose, 'click', closeModal);
    ApexUtils.on(modalOverlay, 'click', closeModal);

    // Navegação com setas
    ApexUtils.on(ApexUtils.qs('#modalPrev', modal), 'click', () => {
      if (!currentVehicle) return;
      const newIndex = currentImageIndex > 0 ? currentImageIndex - 1 : currentVehicle.images.length - 1;
      updateModalImage(newIndex);
    });

    ApexUtils.on(ApexUtils.qs('#modalNext', modal), 'click', () => {
      if (!currentVehicle) return;
      const newIndex = currentImageIndex < currentVehicle.images.length - 1 ? currentImageIndex + 1 : 0;
      updateModalImage(newIndex);
    });

    // Navegação com dots
    ApexUtils.on(modal, 'click', (e) => {
      const dot = e.target.closest('.modal__dot');
      if (!dot || !currentVehicle) return;
      
      const index = parseInt(dot.dataset.index);
      updateModalImage(index);
    });

    // Keyboard
    ApexUtils.on(document, 'keydown', (e) => {
      if (e.key === 'Escape' && !modal.hasAttribute('hidden')) {
        closeModal();
      }
      
      if (!modal.hasAttribute('hidden')) {
        if (e.key === 'ArrowLeft') {
          ApexUtils.qs('#modalPrev', modal)?.click();
        } else if (e.key === 'ArrowRight') {
          ApexUtils.qs('#modalNext', modal)?.click();
        }
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
    lightbox.removeAttribute('hidden');
    ApexUtils.lockScroll(true);
    showImage(index);

    cleanupTrapFocus = ApexUtils.trapFocus(lightbox);

    requestAnimationFrame(() => {
      lightbox.style.opacity = '1';
    });
  };

  const closeLightbox = () => {
    lightbox.style.opacity = '0';

    setTimeout(() => {
      lightbox.setAttribute('hidden', '');
      ApexUtils.lockScroll(false);

      if (cleanupTrapFocus) {
        cleanupTrapFocus();
      }
    }, 200);
  };

  const nextImage = () => showImage(currentIndex + 1);
  const prevImage = () => showImage(currentIndex - 1);

  const handleKeyPress = (e) => {
    if (lightbox.hasAttribute('hidden')) return;

    switch (e.key) {
      case 'Escape':
        closeLightbox();
        break;
      case 'ArrowRight':
        nextImage();
        break;
      case 'ArrowLeft':
        prevImage();
        break;
    }
  };

  const init = () => {
    if (!lightbox) return;

    // Abrir lightbox
    ApexUtils.on(galleryButtons, 'click', (e) => {
      const index = parseInt(e.currentTarget.getAttribute('data-gallery'));
      openLightbox(index);
    });

    // Controles
    ApexUtils.on(lightboxClose, 'click', closeLightbox);
    ApexUtils.on(lightboxOverlay, 'click', closeLightbox);
    ApexUtils.on(lightboxPrev, 'click', prevImage);
    ApexUtils.on(lightboxNext, 'click', nextImage);
    ApexUtils.on(document, 'keydown', handleKeyPress);
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

  let fontSize = 16; // Base font size

  /**
   * Toggle painel
   */
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

  /**
   * Toggle alto contraste
   */
  const toggleHighContrast = () => {
    const isActive = btnHighContrast.getAttribute('aria-checked') === 'true';

    if (isActive) {
      document.body.classList.remove('high-contrast');
      btnHighContrast.setAttribute('aria-checked', 'false');
      localStorage.removeItem('apex-high-contrast');
    } else {
      document.body.classList.add('high-contrast');
      btnHighContrast.setAttribute('aria-checked', 'true');
      localStorage.setItem('apex-high-contrast', 'true');
    }
  };

  /**
   * Toggle reduzir animações
   */
  const toggleReduceMotion = () => {
    const isActive = btnReduceMotion.getAttribute('aria-checked') === 'true';

    if (isActive) {
      document.body.classList.remove('reduce-motion');
      btnReduceMotion.setAttribute('aria-checked', 'false');
      localStorage.removeItem('apex-reduce-motion');
    } else {
      document.body.classList.add('reduce-motion');
      btnReduceMotion.setAttribute('aria-checked', 'true');
      localStorage.setItem('apex-reduce-motion', 'true');
    }
  };

  /**
   * Toggle realce de foco
   */
  const toggleFocusHighlight = () => {
    const isActive = btnFocusHighlight.getAttribute('aria-checked') === 'true';

    if (isActive) {
      document.body.classList.remove('focus-highlight');
      btnFocusHighlight.setAttribute('aria-checked', 'false');
      localStorage.removeItem('apex-focus-highlight');
    } else {
      document.body.classList.add('focus-highlight');
      btnFocusHighlight.setAttribute('aria-checked', 'true');
      localStorage.setItem('apex-focus-highlight', 'true');
    }
  };

  /**
   * Aumentar fonte
   */
  const increaseFontSize = () => {
    if (fontSize >= 20) return; // Limite máximo
    fontSize += 1;
    document.documentElement.style.fontSize = `${fontSize}px`;
    localStorage.setItem('apex-font-size', fontSize);
  };

  /**
   * Diminuir fonte
   */
  const decreaseFontSize = () => {
    if (fontSize <= 14) return; // Limite mínimo
    fontSize -= 1;
    document.documentElement.style.fontSize = `${fontSize}px`;
    localStorage.setItem('apex-font-size', fontSize);
  };

  /**
   * Resetar fonte
   */
  const resetFontSize = () => {
    fontSize = 16;
    document.documentElement.style.fontSize = `${fontSize}px`;
    localStorage.removeItem('apex-font-size');
  };

  /**
   * Carrega preferências salvas
   */
  const loadPreferences = () => {
    // Alto contraste
    if (localStorage.getItem('apex-high-contrast') === 'true') {
      document.body.classList.add('high-contrast');
      btnHighContrast.setAttribute('aria-checked', 'true');
    }

    // Reduzir motion
    if (localStorage.getItem('apex-reduce-motion') === 'true') {
      document.body.classList.add('reduce-motion');
      btnReduceMotion.setAttribute('aria-checked', 'true');
    }

    // Realce de foco
    if (localStorage.getItem('apex-focus-highlight') === 'true') {
      document.body.classList.add('focus-highlight');
      btnFocusHighlight.setAttribute('aria-checked', 'true');
    }

    // Tamanho de fonte
    const savedFontSize = localStorage.getItem('apex-font-size');
    if (savedFontSize) {
      fontSize = parseInt(savedFontSize);
      document.documentElement.style.fontSize = `${fontSize}px`;
    }
  };

  /**
   * Fecha painel ao clicar fora
   */
  const handleClickOutside = (e) => {
    if (!widget.contains(e.target) && panel && !panel.hasAttribute('hidden')) {
      panel.setAttribute('hidden', '');
      toggle.setAttribute('aria-expanded', 'false');
    }
  };

  const init = () => {
    if (!widget) return;

    loadPreferences();

    // Toggle painel
    ApexUtils.on(toggle, 'click', togglePanel);

    // Opções
    ApexUtils.on(btnHighContrast, 'click', toggleHighContrast);
    ApexUtils.on(btnReduceMotion, 'click', toggleReduceMotion);
    ApexUtils.on(btnFocusHighlight, 'click', toggleFocusHighlight);

    // Controles de fonte
    ApexUtils.on(btnFontIncrease, 'click', increaseFontSize);
    ApexUtils.on(btnFontDecrease, 'click', decreaseFontSize);
    ApexUtils.on(btnFontReset, 'click', resetFontSize);

    // Fechar ao clicar fora
    ApexUtils.on(document, 'click', handleClickOutside);
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

  /**
   * Formata campo como moeda enquanto digita
   */
  const formatCurrencyInput = (input) => {
    let value = ApexUtils.numbersOnly(input.value);

    if (value === '') {
      input.value = '';
      return;
    }

    value = (parseInt(value) / 100).toFixed(2);
    input.value = parseFloat(value).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  /**
   * Calcula financiamento
   */
  const calculateFinancing = (e) => {
    e.preventDefault();

    // Pega valores
    const vehicleValue = parseFloat(ApexUtils.numbersOnly(vehicleValueInput.value)) / 100;
    const entryValue = parseFloat(ApexUtils.numbersOnly(entryValueInput.value)) / 100;
    const installments = parseInt(installmentsSelect.value);

    // Validações
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

    // Cálculo simples de financiamento
    // Taxa fixa para exemplo: 1.49% a.m.
    const monthlyRate = 0.0149;
    const financedAmount = vehicleValue - entryValue;

    const installmentValue =
      (financedAmount * monthlyRate * Math.pow(1 + monthlyRate, installments)) /
      (Math.pow(1 + monthlyRate, installments) - 1);

    // Mostra resultado
    resultValue.textContent = ApexUtils.formatCurrency(installmentValue);
    resultDiv.removeAttribute('hidden');

    Toast.show('Simulação calculada com sucesso!', 'success');
  };

  const init = () => {
    if (!form) return;

    // Formata inputs de moeda enquanto digita
    ApexUtils.on(vehicleValueInput, 'input', () => formatCurrencyInput(vehicleValueInput));
    ApexUtils.on(entryValueInput, 'input', () => formatCurrencyInput(entryValueInput));

    // Submit do formulário
    ApexUtils.on(form, 'submit', calculateFinancing);
  };

  return { init };
})();

/* ================================================================
   10. FORMULÁRIO DE TRADE-IN
================================================================ */

const TradeInForm = (() => {
  const form = ApexUtils.qs('#tradeInForm');

  /**
   * Valida e envia formulário
   */
  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    // Validações básicas
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

    // Simula envio (aqui seria uma requisição real para API)
    console.log('📝 Dados de avaliação:', data);

    // Mensagem WhatsApp
    const message = `Olá! Gostaria de avaliar meu veículo:\n\nNome: ${data.tiName}\nTelefone: ${data.tiPhone}\nVeículo: ${data.tiBrand} ${data.tiModel} ${data.tiYear}\nKM: ${data.tiKm}`;
    const whatsappUrl = `https://wa.me/5511999999999?text=${encodeURIComponent(message)}`;

    Toast.show('Redirecionando para o WhatsApp...', 'success');

    setTimeout(() => {
      window.open(whatsappUrl, '_blank');
      form.reset();
    }, 1500);
  };

  /**
   * Formata telefone enquanto digita
   */
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

    const phoneInput = ApexUtils.qs('#tiPhone', form);

    // Formata telefone
    ApexUtils.on(phoneInput, 'input', formatPhoneInput);

    // Submit
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
      // Fechar
      item.classList.remove('is-open');
      button.setAttribute('aria-expanded', 'false');
      answer.setAttribute('hidden', '');
    } else {
      // Fecha todos os outros (accordion único aberto)
      faqItems.forEach((otherItem) => {
        if (otherItem !== item && otherItem.classList.contains('is-open')) {
          otherItem.classList.remove('is-open');
          otherItem.querySelector('.faq-item__question').setAttribute('aria-expanded', 'false');
          otherItem.querySelector('.faq-item__answer').setAttribute('hidden', '');
        }
      });

      // Abrir
      item.classList.add('is-open');
      button.setAttribute('aria-expanded', 'true');
      answer.removeAttribute('hidden');
    }
  };

  const init = () => {
    if (!faqItems.length) return;

    faqItems.forEach((item) => {
      const button = item.querySelector('.faq-item__question');

      ApexUtils.on(button, 'click', () => toggleItem(item));
    });
  };

  return { init };
})();

/* ================================================================
   12. SLIDER DE DEPOIMENTOS
================================================================ */

const TestimonialsSlider = (() => {
  const track = ApexUtils.qs('#testimonialsTrack');
  const prevBtn = ApexUtils.qs('#testimonialsPrev');
  const nextBtn = ApexUtils.qs('#testimonialsNext');
  const dotsContainer = ApexUtils.qs('#sliderDots');
  const dots = ApexUtils.qsa('.slider-dot');

  let currentSlide = 0;
  let totalSlides = 0;
  let autoplayInterval;

  const updateSlider = () => {
    if (!track) return;

    // ✅ Total de SLIDES (não cards individuais)
    const slides = track.querySelectorAll('.testimonials-slide');
    totalSlides = slides.length; // Deve ser 2

    // Garante que currentSlide está dentro dos limites
    if (currentSlide >= totalSlides) {
      currentSlide = 0;
    }
    
    if (currentSlide < 0) {
      currentSlide = totalSlides - 1;
    }

    // Move track (cada slide = 100%)
    const offset = currentSlide * -100;
    track.style.transform = `translateX(${offset}%)`;

    // Atualiza dots
    dots.forEach((dot, index) => {
      if (index === currentSlide) {
        dot.classList.add('slider-dot--active');
        dot.setAttribute('aria-selected', 'true');
      } else {
        dot.classList.remove('slider-dot--active');
        dot.setAttribute('aria-selected', 'false');
      }
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

  const goToSlide = (index) => {
    currentSlide = index;
    updateSlider();
  };

  const startAutoplay = () => {
    autoplayInterval = setInterval(nextSlide, 6000);
  };

  const stopAutoplay = () => {
    clearInterval(autoplayInterval);
  };

  const init = () => {
    if (!track) return;

    currentSlide = 0;
    updateSlider(); // ✅ Inicializa logo

    // Botões
    ApexUtils.on(prevBtn, 'click', () => {
      prevSlide();
      stopAutoplay();
      startAutoplay();
    });

    ApexUtils.on(nextBtn, 'click', () => {
      nextSlide();
      stopAutoplay();
      startAutoplay();
    });

    // Dots
    dots.forEach((dot, index) => {
      ApexUtils.on(dot, 'click', () => {
        goToSlide(index);
        stopAutoplay();
        startAutoplay();
      });
    });

    // Atualiza ao redimensionar
    ApexUtils.on(
      window,
      'resize',
      ApexUtils.debounce(() => {
        updateSlider();
      }, 200)
    );

    // Autoplay
    startAutoplay();

    // Pausa autoplay ao passar mouse
    ApexUtils.on(track, 'mouseenter', stopAutoplay);
    ApexUtils.on(track, 'mouseleave', startAutoplay);
  };

  return { init };
})();

/* ================================================================
   13. ESTATÍSTICAS ANIMADAS (COUNT-UP)
================================================================ */

const AnimatedStats = (() => {
  const stats = ApexUtils.qsa('.stat-card__number[data-target]');
  let hasAnimated = false;

  const animateCount = (element) => {
    const target = parseInt(element.getAttribute('data-target'));
    const prefix = element.getAttribute('data-prefix') || '';
    const suffix = element.getAttribute('data-suffix') || '';
    const duration = 2000; // 2 segundos
    const increment = target / (duration / 16); // 60fps

    let current = 0;

    const updateCount = () => {
      current += increment;

      if (current >= target) {
        element.textContent = `${prefix}${target.toLocaleString('pt-BR')}${suffix}`;
      } else {
        element.textContent = `${prefix}${Math.floor(current).toLocaleString('pt-BR')}${suffix}`;
        requestAnimationFrame(updateCount);
      }
    };

    updateCount();
  };

  const handleIntersection = (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !hasAnimated) {
        hasAnimated = true;

        stats.forEach((stat, index) => {
          setTimeout(() => {
            animateCount(stat);
          }, index * 100); // Delay escalonado
        });
      }
    });
  };

  const init = () => {
    if (!stats.length) return;

    const observer = new IntersectionObserver(handleIntersection, {
      threshold: 0.5,
    });

    // Observa o primeiro stat
    if (stats[0]) {
      observer.observe(stats[0]);
    }
  };

  return { init };
})();

/* ================================================================
   14. TOAST NOTIFICATIONS
================================================================ */

const Toast = (() => {
  const container = ApexUtils.qs('#toastContainer');
  let toastId = 0;

  /**
   * Mostra toast
   * @param {string} message
   * @param {string} type - 'success' | 'error' | 'info'
   * @param {number} duration - em ms (0 = permanente)
   */
  const show = (message, type = 'info', duration = 4000) => {
    if (!container) return;

    toastId++;
    const id = `toast-${toastId}`;

    const icons = {
      success:
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22C55E" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
      error:
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
      info: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1E88E5" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
    };

    const titles = {
      success: 'Sucesso',
      error: 'Erro',
      info: 'Informação',
    };

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

    // Botão fechar
    const closeBtn = toast.querySelector('.toast__close');
    ApexUtils.on(closeBtn, 'click', () => remove(id));

    // Auto-remove
    if (duration > 0) {
      setTimeout(() => remove(id), duration);
    }

    return id;
  };

  /**
   * Remove toast
   */
  const remove = (id) => {
    const toast = ApexUtils.qs(`#${id}`);
    if (!toast) return;

    toast.classList.add('is-removing');

    setTimeout(() => {
      toast.remove();
    }, 300);
  };

  return { show, remove };
})();

/* ================================================================
   15. BACK TO TOP
================================================================ */

const BackToTop = (() => {
  const button = ApexUtils.qs('#backToTop');

  const handleScroll = ApexUtils.throttle(() => {
    if (window.pageYOffset > 400) {
      button.classList.add('is-visible');
    } else {
      button.classList.remove('is-visible');
    }
  }, 200);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const init = () => {
    if (!button) return;

    ApexUtils.on(window, 'scroll', handleScroll);
    ApexUtils.on(button, 'click', scrollToTop);
  };

  return { init };
})();

/* ================================================================
   16. SMOOTH SCROLL
================================================================ */

const SmoothScroll = (() => {
  const init = () => {
    // Links internos com #
    const links = ApexUtils.qsa('a[href^="#"]');

    ApexUtils.on(links, 'click', (e) => {
      const href = e.currentTarget.getAttribute('href');

      // Ignora links vazios ou só #
      if (href === '#' || href === '#!') {
        e.preventDefault();
        return;
      }

      const target = ApexUtils.qs(href);
      if (target) {
        e.preventDefault();
        ApexUtils.scrollTo(target);
      }
    });
  };

  return { init };
})();

/* ================================================================
   17. VALIDAÇÃO DE FORMULÁRIOS
================================================================ */

const FormValidation = (() => {
  /**
   * Valida email
   */
  const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  /**
   * Valida telefone brasileiro
   */
  const isValidPhone = (phone) => {
    const cleaned = ApexUtils.numbersOnly(phone);
    return cleaned.length >= 10 && cleaned.length <= 11;
  };

  /**
   * Adiciona validação em tempo real
   */
  const addRealtimeValidation = (input, validator) => {
    ApexUtils.on(input, 'blur', () => {
      const value = input.value.trim();

      if (value && !validator(value)) {
        input.classList.add('is-error');
        input.setAttribute('aria-invalid', 'true');
      } else {
        input.classList.remove('is-error');
        input.removeAttribute('aria-invalid');
      }
    });

    ApexUtils.on(input, 'input', () => {
      if (input.classList.contains('is-error')) {
        const value = input.value.trim();
        if (validator(value)) {
          input.classList.remove('is-error');
          input.removeAttribute('aria-invalid');
        }
      }
    });
  };

  const init = () => {
    // Email inputs
    const emailInputs = ApexUtils.qsa('input[type="email"]');
    emailInputs.forEach((input) => {
      addRealtimeValidation(input, isValidEmail);
    });

    // Phone inputs
    const phoneInputs = ApexUtils.qsa('input[type="tel"]');
    phoneInputs.forEach((input) => {
      addRealtimeValidation(input, isValidPhone);
    });
  };

  return { init, isValidEmail, isValidPhone };
})();

/* ================================================================
   18. LAZY LOADING APRIMORADO
================================================================ */

const LazyLoad = (() => {
  const init = () => {
    // Navegadores modernos já suportam loading="lazy"
    // Mas podemos adicionar um fallback com IntersectionObserver

    const lazyImages = ApexUtils.qsa('img[loading="lazy"]');

    // Verifica se o navegador não suporta lazy loading nativo
    if ('loading' in HTMLImageElement.prototype) {
      // Suporta nativamente, nada a fazer
      return;
    }

    // Fallback com IntersectionObserver
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

    lazyImages.forEach((img) => imageObserver.observe(img));
  };

  return { init };
})();

/* ================================================================
   19. PERFORMANCE & ANALYTICS
================================================================ */

const Performance = (() => {
  /**
   * Registra Web Vitals
   */
  const logWebVitals = () => {
    // Só em produção
    if (window.location.hostname === 'localhost') return;

    // Core Web Vitals
    if ('PerformanceObserver' in window) {
      // LCP - Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log('📊 LCP:', lastEntry.renderTime || lastEntry.loadTime);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // FID - First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          console.log('📊 FID:', entry.processingStart - entry.startTime);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // CLS - Cumulative Layout Shift
      let clsScore = 0;
      const clsObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (!entry.hadRecentInput) {
            clsScore += entry.value;
            console.log('📊 CLS:', clsScore);
          }
        });
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    }
  };

  /**
   * Pré-conecta a domínios externos
   */
  const preconnect = () => {
    const domains = ['https://images.unsplash.com', 'https://fonts.googleapis.com', 'https://fonts.gstatic.com'];

    domains.forEach((domain) => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = domain;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
  };

  const init = () => {
    logWebVitals();
    preconnect();

    // Log do tempo de carregamento
    window.addEventListener('load', () => {
      setTimeout(() => {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        console.log(`⚡ Página carregada em ${loadTime}ms`);
      }, 0);
    });
  };

  return { init };
})();

/* ================================================================
   20. INICIALIZAÇÃO
================================================================ */

const ApexMotors = (() => {
  /**
   * Inicializa ano atual no footer
   */
  const updateCurrentYear = () => {
    const yearElement = ApexUtils.qs('#currentYear');
    if (yearElement) {
      yearElement.textContent = new Date().getFullYear();
    }
  };

  /**
   * Previne zoom em inputs no iOS
   */
  const preventIOSZoom = () => {
    const inputs = ApexUtils.qsa('input, select, textarea');
    inputs.forEach((input) => {
      const fontSize = window.getComputedStyle(input).fontSize;
      if (parseFloat(fontSize) < 16) {
        input.style.fontSize = '16px';
      }
    });
  };

  /**
   * Console easter egg
   */
  const consoleMessage = () => {
    const styles = [
      'color: #1E88E5',
      'font-size: 18px',
      'font-weight: bold',
      'font-family: Space Grotesk, sans-serif',
      'text-shadow: 2px 2px 4px rgba(0,0,0,0.3)',
    ].join(';');

    console.log('%c🏎️ APEX MOTORS', styles);
    console.log(
      '%cPerformance, elegância e exclusividade.',
      'color: #8B949E; font-size: 12px; font-style: italic;'
    );
    console.log(
      '%c\nInteressado em trabalhar conosco?\nEnvie seu portfólio para: tech@apexmotors.com.br',
      'color: #F5F5F5; font-size: 11px;'
    );
  };

  /**
   * Inicialização principal
   */
  const init = () => {
    console.log('🚀 Inicializando Apex Motors...');

    // Utilitários
    updateCurrentYear();
    preventIOSZoom();
    consoleMessage();

    // Módulos
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

    // Notificação de boas-vindas (opcional)
    // setTimeout(() => {
    //   Toast.show('Bem-vindo à Apex Motors! Explore nossa seleção premium.', 'info', 5000);
    // }, 2000);

    console.log('✅ Apex Motors inicializado com sucesso!');
  };

  return { init };
})();

/* ================================================================
   BOOTSTRAP
================================================================ */

// DOM Content Loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', ApexMotors.init);
} else {
  ApexMotors.init();
}

// Expõe globalmente para debugging (remover em produção)
window.ApexMotors = ApexMotors;
window.Toast = Toast;
