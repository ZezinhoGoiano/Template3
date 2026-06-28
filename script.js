// Apex Motors Landing Page - Javascript
// Otimizado, acessível e sem dependências

// ------------------------------
// Utilitários
// ------------------------------
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Respeita preferência nativa do sistema por reduzir animações
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ------------------------------
// Inicialização de Variáveis
// ------------------------------
const navbar = document.querySelector('#navbar');
const hamburger = document.querySelector('#hamburger');
const mobileMenu = document.querySelector('#mobile-menu');
const sections = document.querySelectorAll('.animate-on-scroll');
const counters = document.querySelectorAll('.counter');
const faqItems = document.querySelectorAll('.faq-item');
const accessibilityBtn = document.querySelector('#accessibility-toggle');
const accessibilityMenu = document.querySelector('#accessibility-menu');
let countersAnimated = false;
let lastScroll = 0;

// ------------------------------
// Efeito da Navbar no Scroll
// ------------------------------
const handleNavbarScroll = debounce(() => {
  const scrollPosition = window.scrollY;

  if (scrollPosition > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }

  // Navbar inteligente: esconde ao rolar para baixo, mostra ao rolar para cima
  if (scrollPosition > lastScroll && scrollPosition > 400) {
    navbar.classList.add('navbar-hidden');
  } else {
    navbar.classList.remove('navbar-hidden');
  }

  lastScroll = scrollPosition;
}, 10);

window.addEventListener('scroll', handleNavbarScroll);

// ------------------------------
// Menu Mobile
// ------------------------------
hamburger.addEventListener('click', () => {
  const isOpen = hamburger.getAttribute('aria-expanded') === 'true';
  hamburger.setAttribute('aria-expanded', !isOpen);
  hamburger.classList.toggle('active');
  mobileMenu.classList.toggle('active');
  document.body.classList.toggle('scroll-locked');
});

// ------------------------------
// Scroll Suave Nativo
// ------------------------------
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();

    // Fecha menu mobile automaticamente
    hamburger.classList.remove('active');
    mobileMenu.classList.remove('active');
    document.body.classList.remove('scroll-locked');

    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'start'
      });
    }
  });
});

// ------------------------------
// Animações de entrada no Scroll
// ------------------------------
if (!prefersReducedMotion) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  });

  sections.forEach(section => {
    observer.observe(section);
  });
} else {
  // Desativa todas animações automaticamente se o usuário preferir
  sections.forEach(s => s.classList.add('visible'));
}

// ------------------------------
// Contadores Animados das Estatísticas
// ------------------------------
const animateCounters = () => {
  if (countersAnimated) return;

  counters.forEach(counter => {
    const target = parseInt(counter.dataset.target);
    const duration = 2200;
    const step = target / (duration / 16);
    let current = 0;

    const updateCounter = () => {
      current += step;
      if (current < target) {
        counter.innerText = Math.floor(current).toLocaleString('pt-BR');
        requestAnimationFrame(updateCounter);
      } else {
        counter.innerText = target.toLocaleString('pt-BR');
      }
    };

    updateCounter();
  });

  countersAnimated = true;
};

const statsObserver = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting && !prefersReducedMotion) {
    animateCounters();
  }
}, { threshold: 0.5 });

statsObserver.observe(document.querySelector('#stats'));

// ------------------------------
// Lightbox / Modal de Imagens dos Veículos
// ------------------------------
const lightbox = document.createElement('div');
lightbox.id = 'lightbox';
lightbox.innerHTML = `
  <button id="lightbox-close" aria-label="Fechar imagem">✕</button>
  <img id="lightbox-image" alt="" />
`;
document.body.appendChild(lightbox);

const openLightbox = (src) => {
  lightbox.querySelector('#lightbox-image').src = src;
  lightbox.classList.add('active');
  document.body.classList.add('scroll-locked');
};

const closeLightbox = () => {
  lightbox.classList.remove('active');
  document.body.classList.remove('scroll-locked');
};

// Abre lightbox ao clicar em qualquer imagem de veiculo
document.querySelectorAll('.vehicle-image').forEach(img => {
  img.addEventListener('click', () => {
    openLightbox(img.src);
  });
});

lightbox.querySelector('#lightbox-close').addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});

// Fecha qualquer modal com a tecla ESC
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeLightbox();
    accessibilityMenu.classList.remove('active');
  }
});

// ------------------------------
// FAQ Accordion
// ------------------------------
faqItems.forEach(item => {
  const header = item.querySelector('.faq-header');
  
  header.addEventListener('click', () => {
    const isOpen = item.classList.contains('active');

    // Fecha todos os outros itens automaticamente
    faqItems.forEach(i => i.classList.remove('active'));

    // Abre ou fecha o item atual
    if (!isOpen) item.classList.add('active');
  });
});

// ------------------------------
// Menu de Acessibilidade
// ------------------------------
accessibilityBtn.addEventListener('click', () => {
  accessibilityMenu.classList.toggle('active');
});

// Alto Contraste
document.querySelector('#ac-high-contrast').addEventListener('click', () => {
  document.body.classList.toggle('high-contrast');
});

// Ajuste de tamanho da fonte
let fontSizeLevel = 0;
document.querySelector('#ac-font-size').addEventListener('click', () => {
  fontSizeLevel = (fontSizeLevel + 1) % 3;
  document.body.classList.remove('font-1', 'font-2');
  if (fontSizeLevel > 0) document.body.classList.add(`font-${fontSizeLevel}`);
});

// Reduzir animações
document.querySelector('#ac-reduced-motion').addEventListener('click', () => {
  document.body.classList.toggle('reduced-motion');
});

// ------------------------------
// Micro Interações Premium
// ------------------------------

// Efeito de ripple em todos os botões
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', function(e) {
    const ripple = document.createElement('span');
    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');

    this.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
  });
});

// ------------------------------
// Inicialização Final
// ------------------------------
window.addEventListener('load', () => {
  // Remove preloader
  document.body.classList.add('loaded');
  
  // Atualiza estado da navbar no carregamento
  handleNavbarScroll();
});

console.log('Apex Motors Landing Page Carregada ✅');
