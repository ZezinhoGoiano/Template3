/* ================================================================
   APEX MOTORS — analytics.js
   Registra eventos reais no Supabase.
   Carregado em: index.html e estoque.html
   
   Eventos registrados:
   - page_view       → toda visita a uma página
   - card_click      → clique no botão "Ver detalhes"
   - modal_open      → modal de veículo aberto
   - whatsapp_click  → qualquer clique em link do WhatsApp
   - filter_click    → uso dos filtros de categoria
   - gallery_open    → abertura do lightbox da galeria
   - estoque_view    → visita à página de estoque
================================================================ */

'use strict';

/* ================================================================
   CONFIGURAÇÃO DO SUPABASE
   (mesmo cliente do site, mas inicializado aqui de forma isolada)
================================================================ */
const APEX_SUPABASE_URL = 'https://lbwbdwzcyljtelaadbnx.supabase.co';
const APEX_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxid2Jkd3pjeWxqdGVsYWFkYm54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ0MTI5NDEsImV4cCI6MjA5OTk4ODk0MX0.fkvnX5tEM6Fi0USj6M3zpwXurDZK32XlB7xiJ0C5R00';

// Usa o cliente global se já existir (carregado pelo admin)
// ou cria um novo para o site público
const analyticsClient = (typeof window.supabase !== 'undefined')
  ? window.supabase.createClient(APEX_SUPABASE_URL, APEX_SUPABASE_KEY)
  : null;

/* ================================================================
   SESSÃO ÚNICA POR VISITA
   Gera um ID de sessão persistente por aba/visita
================================================================ */
const getSessionId = () => {
  const key = 'apex_session_id';
  let sessionId = sessionStorage.getItem(key);
  if (!sessionId) {
    sessionId = `s_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem(key, sessionId);
  }
  return sessionId;
};

/* ================================================================
   DETECTA DISPOSITIVO
================================================================ */
const getDevice = () => {
  const ua = navigator.userAgent;
  if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
  if (/mobile|iphone|ipod|android|blackberry|mini|windows\sce|palm/i.test(ua)) return 'mobile';
  return 'desktop';
};

/* ================================================================
   DETECTA PÁGINA ATUAL
================================================================ */
const getCurrentPage = () => {
  const path = window.location.pathname;
  if (path.includes('estoque')) return 'estoque';
  return 'index';
};

/* ================================================================
   DETECTA ORIGEM (referrer)
================================================================ */
const getOrigin = () => {
  const ref = document.referrer;
  if (!ref) return 'direto';
  if (ref.includes('google'))    return 'google';
  if (ref.includes('instagram')) return 'instagram';
  if (ref.includes('facebook'))  return 'facebook';
  if (ref.includes('whatsapp'))  return 'whatsapp';
  return 'outro';
};

/* ================================================================
   FUNÇÃO PRINCIPAL — registra evento no Supabase
================================================================ */
const trackEvent = async (eventType, data = {}) => {
  if (!analyticsClient) {
    console.warn('[Analytics] Cliente Supabase não disponível');
    return;
  }

  // Não registra se for o próprio admin navegando
  // (verifica se tem sessão autenticada — admin logado)
  try {
    const { data: { session } } = await analyticsClient.auth.getSession();
    if (session) return; // admin — não conta
  } catch (_) {
    // ignora erro de auth — continua registrando
  }

  const payload = {
    event_type:   eventType,
    vehicle_id:   data.vehicleId   || null,
    vehicle_name: data.vehicleName || null,
    page:         data.page        || getCurrentPage(),
    origin:       data.origin      || getOrigin(),
    device:       getDevice(),
    session_id:   getSessionId(),
  };

  try {
    const { error } = await analyticsClient
      .from('analytics')
      .insert(payload);

    if (error) {
      console.warn('[Analytics] Erro ao registrar evento:', error.message);
    }
  } catch (err) {
    console.warn('[Analytics] Falha silenciosa:', err.message);
  }
};

/* ================================================================
   EVENTOS AUTOMÁTICOS
================================================================ */
const ApexAnalytics = {

  /* Registra visualização de página */
  trackPageView() {
    trackEvent('page_view');
  },

  /* Registra abertura de modal de veículo */
  trackModalOpen(vehicleId, vehicleName) {
    trackEvent('modal_open', { vehicleId, vehicleName });
  },

  /* Registra clique no card (botão "Ver detalhes") */
  trackCardClick(vehicleId, vehicleName) {
    trackEvent('card_click', { vehicleId, vehicleName });
  },

  /* Registra clique no WhatsApp */
  trackWhatsappClick(vehicleId = null, vehicleName = null) {
    trackEvent('whatsapp_click', { vehicleId, vehicleName });
  },

  /* Registra uso de filtro */
  trackFilterClick(category) {
    trackEvent('filter_click', { vehicleName: category });
  },

  /* Registra abertura da galeria */
  trackGalleryOpen() {
    trackEvent('gallery_open');
  },
};

/* ================================================================
   INICIALIZAÇÃO — observa cliques automaticamente
================================================================ */
const initAnalytics = () => {

  // 1. Page view imediato
  ApexAnalytics.trackPageView();

  // 2. Observa cliques no WhatsApp (todos os links wa.me)
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href*="wa.me"]');
    if (!link) return;

    // Tenta identificar o veículo pelo card pai
    const card = link.closest('[data-vehicle-id]');
    const vehicleId   = card?.dataset?.vehicleId   || null;
    const vehicleName = card?.dataset?.vehicleName  || null;

    ApexAnalytics.trackWhatsappClick(vehicleId, vehicleName);
  }, { passive: true });

  // 3. Observa cliques em "Ver detalhes" / expand
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-action="expand"]');
    if (!trigger) return;

    const card = trigger.closest('[data-vehicle-id]');
    if (!card) return;

    const vehicleId = card.dataset.vehicleId;
    const vehicle   = (typeof VEHICLES_DATA !== 'undefined')
      ? VEHICLES_DATA.find(v => v.id === vehicleId)
      : null;

    ApexAnalytics.trackCardClick(vehicleId, vehicle?.name || null);
  }, { passive: true });

  // 4. Observa abertura do lightbox da galeria
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-gallery]');
    if (btn) ApexAnalytics.trackGalleryOpen();
  }, { passive: true });

  // 5. Observa cliques nos filtros
  document.addEventListener('click', (e) => {
    const filterBtn = e.target.closest('.filter-btn');
    if (!filterBtn) return;
    const category = filterBtn.dataset.filter || 'all';
    ApexAnalytics.trackFilterClick(category);
  }, { passive: true });

};

/* ================================================================
   EXPÕE GLOBALMENTE para uso no script.js e estoque.js
================================================================ */
window.ApexAnalytics = ApexAnalytics;

/* ================================================================
   BOOTSTRAP
================================================================ */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAnalytics);
} else {
  initAnalytics();
                            }
