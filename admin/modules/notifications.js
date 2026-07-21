/* ================================================================
   APEX MOTORS ADMIN — modules/notifications.js
   Notificações reais: novos leads + veículos vendidos
================================================================ */

'use strict';

const NOTIF_STORAGE_KEY = 'apex-notif-last-seen';
const NOTIF_LIMIT = 20;

const notifEl = (id) => document.getElementById(id);

const getLastSeen = () => {
  const saved = localStorage.getItem(NOTIF_STORAGE_KEY);
  return saved ? new Date(saved) : new Date(0);
};

const setLastSeen = (date = new Date()) => {
  localStorage.setItem(NOTIF_STORAGE_KEY, date.toISOString());
};

const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - date) / 1000);
  if (seconds < 60) return 'agora mesmo';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'ontem';
  if (days < 7) return `há ${days} dias`;
  return date.toLocaleDateString('pt-BR');
};

const fmtCurrency = (value) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value || 0);

/* ================================================================
   BUSCA NOTIFICAÇÕES REAIS
================================================================ */
const fetchNotifications = async () => {
  const notifications = [];

  // 1) Novos leads
  try {
    const { data: leads, error } = await supabaseClient
      .from('leads')
      .select('id, name, created_at')
      .order('created_at', { ascending: false })
      .limit(NOTIF_LIMIT);

    if (!error && leads) {
      leads.forEach((lead) => {
        notifications.push({
          id: `lead-${lead.id}`,
          icon: '👤',
          title: 'Novo lead recebido',
          message: lead.name
            ? `${lead.name} entrou em contato`
            : 'Um novo cliente entrou em contato',
          date: new Date(lead.created_at),
          link: 'leads.html',
        });
      });
    }
  } catch (err) {
    console.warn('[Notificações] Erro ao buscar leads:', err.message);
  }

  // 2) Veículos vendidos
  try {
    const { data: vehicles, error } = await supabaseClient
      .from('vehicles')
      .select('id, name, price, sold_at')
      .eq('status', 'sold')
      .not('sold_at', 'is', null)
      .order('sold_at', { ascending: false })
      .limit(NOTIF_LIMIT);

    if (!error && vehicles) {
      vehicles.forEach((v) => {
        notifications.push({
          id: `sale-${v.id}`,
          icon: '💰',
          title: 'Veículo vendido',
          message: `${v.name} foi vendido por ${fmtCurrency(v.price)}`,
          date: new Date(v.sold_at),
          link: 'estoque.html',
        });
      });
    }
  } catch (err) {
    console.warn('[Notificações] Erro ao buscar vendas:', err.message);
  }

  notifications.sort((a, b) => b.date - a.date);
  return notifications.slice(0, NOTIF_LIMIT);
};

/* ================================================================
   RENDERIZA O PAINEL
================================================================ */
const renderNotifications = (notifications, lastSeen) => {
  const list  = notifEl('notifList');
  const empty = notifEl('notifEmpty');
  if (!list) return;

  if (notifications.length === 0) {
    list.innerHTML = '';
    if (empty) empty.hidden = false;
    return;
  }

  if (empty) empty.hidden = true;

  list.innerHTML = notifications.map((n) => {
    const isUnread = n.date > lastSeen;
    return `
      <a href="${n.link}" class="notif-item ${isUnread ? 'notif-item--unread' : ''}">
        <span class="notif-item__icon">${n.icon}</span>
        <div class="notif-item__body">
          <strong class="notif-item__title">${n.title}</strong>
          <p class="notif-item__message">${n.message}</p>
          <span class="notif-item__time">${timeAgo(n.date)}</span>
        </div>
        ${isUnread ? '<span class="notif-item__dot" aria-hidden="true"></span>' : ''}
      </a>
    `;
  }).join('');
};

const updateBadge = (notifications, lastSeen) => {
  const badge = notifEl('notifBadge');
  if (!badge) return;

  const unreadCount = notifications.filter((n) => n.date > lastSeen).length;

  if (unreadCount > 0) {
    badge.textContent = unreadCount > 9 ? '9+' : String(unreadCount);
    badge.hidden = false;
  } else {
    badge.hidden = true;
  }
};

/* ================================================================
   ESTADO E CONTROLE
================================================================ */
let cachedNotifications = [];

const refreshNotifications = async () => {
  cachedNotifications = await fetchNotifications();
  const lastSeen = getLastSeen();
  updateBadge(cachedNotifications, lastSeen);

  const panel = notifEl('notifPanel');
  if (panel && !panel.hidden) {
    renderNotifications(cachedNotifications, lastSeen);
  }
};

const openPanel = () => {
  const panel  = notifEl('notifPanel');
  const toggle = notifEl('notifToggle');
  if (!panel) return;

  renderNotifications(cachedNotifications, getLastSeen());

  panel.hidden = false;
  toggle?.setAttribute('aria-expanded', 'true');

  setLastSeen(new Date());
  setTimeout(() => updateBadge(cachedNotifications, getLastSeen()), 50);
};

const closePanel = () => {
  const panel  = notifEl('notifPanel');
  const toggle = notifEl('notifToggle');
  if (!panel) return;

  panel.hidden = true;
  toggle?.setAttribute('aria-expanded', 'false');
};

const togglePanel = () => {
  const panel = notifEl('notifPanel');
  if (!panel) return;
  panel.hidden ? openPanel() : closePanel();
};

/* ================================================================
   REALTIME
================================================================ */
const initNotifRealtime = () => {
  supabaseClient
    .channel('notifications-realtime')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'leads' },
      () => refreshNotifications())
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'vehicles' },
      () => refreshNotifications())
    .subscribe();
};

/* ================================================================
   INIT
================================================================ */
const initNotifications = async () => {
  const widget = notifEl('notifWidget');
  const toggle = notifEl('notifToggle');
  if (!widget || !toggle) return;

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    togglePanel();
  });

  document.addEventListener('click', (e) => {
    if (!widget.contains(e.target)) closePanel();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closePanel();
  });

  await refreshNotifications();
  initNotifRealtime();

  setInterval(refreshNotifications, 60000);
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNotifications);
} else {
  initNotifications();
}
