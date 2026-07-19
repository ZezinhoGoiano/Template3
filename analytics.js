/* ================================================================
   APEX MOTORS — analytics.js
   Versão: 2.0.0
   Registra eventos reais no Supabase.
================================================================ */

'use strict';

/* ================================================================
   CONFIGURAÇÃO
================================================================ */
const APEX_SUPABASE_URL = 'https://lbwbdwzcyljtelaadbnx.supabase.co';
const APEX_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxid2Jkd3pjeWxqdGVsYWFkYm54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ0MTI5NDEsImV4cCI6MjA5OTk4ODk0MX0.fkvnX5tEM6Fi0USj6M3zpwXurDZK32XlB7xiJ0C5R00';

let _analyticsClient = null;

const getClient = () => {
  if (_analyticsClient) return _analyticsClient;
  if (typeof window.supabase === 'undefined') {
    console.warn('[Analytics] SDK Supabase não carregado ainda');
    return null;
  }
  _analyticsClient = window.supabase.createClient(APEX_SUPABASE_URL, APEX_SUPABASE_KEY);
  return _analyticsClient;
};

/* ================================================================
   SESSÃO
================================================================ */
const getSessionId = () => {
  const key = 'apex_session_id';
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = `s_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem(key, id);
  }
  return id;
};

/* ================================================================
   DEVICE
================================================================ */
const getDevice = () => {
  const ua = navigator.userAgent;
  if (/tablet|ipad|playbook|silk/i.test(ua))                                      return 'tablet';
  if (/mobile|iphone|ipod|android|blackberry|mini|windows\sce|palm/i.test(ua))    return 'mobile';
  return 'desktop';
};

/* ================================================================
   PÁGINA
================================================================ */
const getCurrentPage = () => {
  const path = window.location.pathname;
  if (path.includes('estoque')) return 'estoque';
  return 'index';
};

/* ================================================================
   ORIGEM
================================================================ */
const getOrigin = () => {
  const ref = document.referrer;
  if (!ref)                          return 'direto';
  if (ref.includes('google'))        return 'google';
  if (ref.includes('instagram'))     return 'instagram';
  if (ref.includes('facebook'))      return 'facebook';
  if (ref.includes('whatsapp'))      return 'whatsapp';
  return 'outro';
};

/* ================================================================
   CORE — envia evento para o Supabase
================================================================ */
const _track = async (eventType, data = {}) => {
  const client = getClient();
  if (!client) return;

  // Não registra se for admin logado
  try {
    const { data: { session } } = await client.auth.getSession();
    if (session) return;
  } catch (_) { /* ignora */ }

  const payload = {
    event_type:   eventType,
    vehicle_id:   data.vehicleId   || null,
    vehicle_name: data.vehicleName || null,
    page:         getCurrentPage(),
    origin:       getOrigin(),
    device:       getDevice(),
    session_id:   getSessionId(),
  };

  try {
    const { error } = await client.from('analytics').insert(payload);
    if (error) console.warn('[Analytics] Erro:', error.message);
    else        console.log(`[Analytics] ✅ ${eventType}`, payload.vehicle_name || '');
  } catch (err) {
    console.warn('[Analytics] Falha:', err.message);
  }
};

/* ================================================================
   API PÚBLICA
================================================================ */
window.ApexAnalytics = {

  trackPageView() {
    _track('page_view');
  },

  trackModalOpen(vehicleId, vehicleName) {
    console.log('[Analytics] trackModalOpen chamado:', vehicleId, vehicleName);
    _track('modal_open', { vehicleId, vehicleName });
  },

  trackCardClick(vehicleId, vehicleName) {
    console.log('[Analytics] trackCardClick chamado:', vehicleId, vehicleName);
    _track('card_click', { vehicleId, vehicleName });
  },

  trackWhatsappClick(vehicleId = null, vehicleName = null) {
    _track('whatsapp_click', { vehicleId, vehicleName });
  },

  trackFilterClick(category) {
    _track('filter_click', { vehicleName: category });
  },

  trackGalleryOpen() {
    _track('gallery_open');
  },
};

/* ================================================================
   LISTENERS AUTOMÁTICOS (WhatsApp, Filtros, Galeria)
   Modal e Card são chamados diretamente pelo script.js
================================================================ */
document.addEventListener('DOMContentLoaded', () => {

  // Page view
  window.ApexAnalytics.trackPageView();

  // WhatsApp — qualquer link wa.me
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href*="wa.me"]');
    if (!link) return;
    const card = link.closest('[data-vehicle-id]');
    window.ApexAnalytics.trackWhatsappClick(
      card?.dataset?.vehicleId  || null,
      card?.dataset?.vehicleName || null
    );
  }, { passive: true });

  // Filtros
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    window.ApexAnalytics.trackFilterClick(btn.dataset.filter || 'all');
  }, { passive: true });

  // Galeria lightbox
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-gallery]')) {
      window.ApexAnalytics.trackGalleryOpen();
    }
  }, { passive: true });

});
