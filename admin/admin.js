/* ================================================================
   APEX MOTORS ADMIN — admin.js
   Lógica base: auth guard, sidebar, logout, toast, busca global
================================================================ */

'use strict';

const $ = (sel, parent = document) => parent.querySelector(sel);
const $$ = (sel, parent = document) => parent.querySelectorAll(sel);

/* ================================================================
   TOAST
================================================================ */
const AdminToast = {
  show(message, type = 'info', duration = 4000) {
    const container = $('#toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.setAttribute('role', 'alert');

    const icons = {
      success: '✅',
      error:   '❌',
      info:    'ℹ️',
      warning: '⚠️',
    };

    toast.innerHTML = `
      <span style="font-size:16px;flex-shrink:0">${icons[type] || 'ℹ️'}</span>
      <span style="flex:1;font-size:var(--text-sm)">${message}</span>
      <button onclick="this.parentElement.remove()"
        style="color:var(--color-text-muted);font-size:18px;line-height:1;
               background:none;border:none;cursor:pointer;padding:0 0 0 8px">
        ×
      </button>
    `;
    toast.style.cssText = `
      display: flex;
      align-items: center;
      gap: 10px;
    `;

    container.appendChild(toast);

    if (duration > 0) {
      setTimeout(() => {
        toast.classList.add('is-removing');
        setTimeout(() => toast.remove(), 300);
      }, duration);
    }
  }
};

// Expõe globalmente
window.AdminToast = AdminToast;

/* ================================================================
   AUTH GUARD
   Redireciona para login se não estiver autenticado
================================================================ */
const initAuthGuard = async () => {
  try {
    const session = await requireAuth();
    if (!session) return;

    // Preenche info do usuário na sidebar
    const email = session.user.email || '';
    const avatarLetter = email.charAt(0).toUpperCase();

    const emailEl  = $('#userEmail');
    const avatarEl = $('#userAvatar');

    if (emailEl)  emailEl.textContent  = email;
    if (avatarEl) avatarEl.textContent = avatarLetter;

  } catch (err) {
    console.error('Erro no auth guard:', err);
    window.location.href = 'index.html';
  }
};

/* ================================================================
   LOGOUT
================================================================ */
const initLogout = () => {
  const btn = $('#logoutBtn');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    btn.disabled = true;
    AdminToast.show('Saindo...', 'info', 1500);
    setTimeout(async () => {
      await logout();
    }, 800);
  });
};

/* ================================================================
   SIDEBAR — colapsar desktop / abrir mobile
================================================================ */
const initSidebar = () => {
  const sidebar        = $('#sidebar');
  const toggleBtn      = $('#sidebarToggle');
  const mobileBtn      = $('#mobileMenuToggle');
  const overlay        = $('#sidebarOverlay');

  if (!sidebar) return;

  // Restaura estado salvo (desktop)
  const isCollapsed = localStorage.getItem('apex-sidebar-collapsed') === 'true';
  if (isCollapsed) sidebar.classList.add('is-collapsed');

  // Toggle desktop (recolher/expandir)
  toggleBtn?.addEventListener('click', () => {
    sidebar.classList.toggle('is-collapsed');
    const collapsed = sidebar.classList.contains('is-collapsed');
    localStorage.setItem('apex-sidebar-collapsed', collapsed);
  });

  // Abre menu mobile
  const openMobile = () => {
    sidebar.classList.add('is-mobile-open');
    overlay.classList.add('is-active');
    document.body.style.overflow = 'hidden';
  };

  const closeMobile = () => {
    sidebar.classList.remove('is-mobile-open');
    overlay.classList.remove('is-active');
    document.body.style.overflow = '';
  };

  mobileBtn?.addEventListener('click', openMobile);
  overlay?.addEventListener('click', closeMobile);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMobile();
  });
};

/* ================================================================
   BUSCA GLOBAL (placeholder — integração futura)
================================================================ */
const initGlobalSearch = () => {
  const input = $('#globalSearch');
  if (!input) return;

  let timeout;
  input.addEventListener('input', () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      const query = input.value.trim();
      if (query.length < 2) return;
      // TODO: implementar busca real no Supabase
      console.log('Buscando:', query);
    }, 400);
  });
};

/* ================================================================
   ATUALIZA ANO NO FOOTER (se existir)
================================================================ */
const updateYear = () => {
  const el = $('#currentYear');
  if (el) el.textContent = new Date().getFullYear();
};

/* ================================================================
   INIT
================================================================ */
document.addEventListener('DOMContentLoaded', async () => {
  await initAuthGuard();
  initLogout();
  initSidebar();
  initGlobalSearch();
  updateYear();
});
