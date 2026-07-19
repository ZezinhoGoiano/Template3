/* ================================================================
   APEX MOTORS — analytics.js
   Versão: 2.1.0
   Registra eventos reais no Supabase.
================================================================ */

'use strict';

/* ================================================================
   CONFIGURAÇÃO
   ✅ Lê do objeto global definido em supabase.js
      para não duplicar credenciais no código
================================================================ */

// ✅ Reutiliza o cliente já criado pelo supabase.js (sem duplicar)
const getClient = () => {
  // Tenta usar o cliente global do site (script.js / supabase.js)
  if (typeof window.apexSupabaseClient !== 'undefined') {
    return window.apexSupabaseClient;
  }
  // Fallback: tenta o cliente do admin
  if (typeof window.supabaseClient !== 'undefined') {
    return window.supabaseClient;
  }
  // Último recurso: cria novo cliente se SDK disponível
  if (
    typeof window.supabase !== 'undefined' &&
    typeof APEX_SUPABASE_URL !== 'undefined' &&
    typeof APEX_SUPABASE_KEY !== 'undefined'
  ) {
    if (!window._apexAnalyticsClient) {
      window._apexAnalyticsClient = window.supabase.createClient(
        APEX_SUPABASE_URL,
        APEX_SUPABASE_KEY
      );
    }
    return window._apexAnalyticsClient;
  }

  console.warn('[Analytics] Nenhum cliente Supabase disponível');
  return null;
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
  if (/tablet|ipad|playbook|silk/i.test(ua))                                   return 'tablet';
  if (/mobile|iphone|ipod|android|blackberry|mini|windows\sce|palm/i.test(ua)) return 'mobile';
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
   ✅ ORIGEM — agora lê UTMs da URL primeiro
================================================================ */
const getOrigin = () => {
  // 1. Prioridade: parâmetros UTM na URL
  const params = new URLSearchParams(window.location.search);
  const utmSource = params.get('utm_source');
  if (utmSource) {
    const src = utmSource.toLowerCase();
    if (src.includes('google'))    return 'google';
    if (src.includes('instagram')) return 'instagram';
    if (src.includes('facebook'))  return 'facebook';
    if (src.includes('whatsapp'))  return 'whatsapp';
    if (src.includes('tiktok'))    return 'tiktok';
    return utmSource.toLowerCase(); // retorna o UTM literal
  }

  // 2. Fallback: referrer do navegador
  const ref = document.referrer;
  if (!ref)                        return 'direto';
  if (ref.includes('google'))      return 'google';
  if (ref.includes('instagram'))   return 'instagram';
  if (ref.includes('facebook'))    return 'facebook';
  if (ref.includes('t.co'))        return 'twitter';
  if (ref.includes('youtube'))     return 'youtube';

  return 'outro';
};

/* ================================================================
   ✅ CONTROLE DE PAGE VIEW — evita duplicatas por sessão
================================================================ */
const hasTrackedPageView = () => {
  const key = `apex_pv_${getCurrentPage()}_${getSessionId()}`;
  if (sessionStorage.getItem(key)) return true;
  sessionStorage.setItem(key, '1');
  return false;
};

/* ================================================================
   ✅ FILA OFFLINE — guarda eventos que falharam
================================================================ */
const OFFLINE_QUEUE_KEY = 'apex_offline_queue';

const saveToOfflineQueue = (eventType, data) => {
  try {
    const queue = JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]');
    queue.push({ eventType, data, ts: Date.now() });
    // Mantém no máximo 50 eventos na fila
    if (queue.length > 50) queue.splice(0, queue.length - 50);
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  } catch (_) { /* ignora erros de localStorage */ }
};

const flushOfflineQueue = async () => {
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    if (!raw) return;

    const queue = JSON.parse(raw);
    if (!queue.length) return;

    const client = getClient();
    if (!client) return;

    // Tenta enviar eventos antigos
    const failed = [];
    for (const item of queue) {
      // Descarta eventos com mais de 48h
      if (Date.now() - item.ts > 48 * 60 * 60 * 1000) continue;

      try {
        const { error } = await client.from('analytics').insert(item.data);
        if (error) failed.push(item);
      } catch (_) {
        failed.push(item);
      }
    }

    // Salva apenas os que falharam novamente
    if (failed.length > 0) {
      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(failed));
    } else {
      localStorage.removeItem(OFFLINE_QUEUE_KEY);
    }

    if (queue.length - failed.length > 0) {
      console.log(`[Analytics] ✅ ${queue.length - failed.length} evento(s) offline enviados`);
    }
  } catch (_) { /* ignora */ }
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

    if (error) {
      console.warn('[Analytics] Erro:', error.message);
      saveToOfflineQueue(eventType, payload); // ✅ guarda na fila
    } else {
      console.log(`[Analytics] ✅ ${eventType}`, payload.vehicle_name || '');
    }
  } catch (err) {
    console.warn('[Analytics] Falha de rede — guardando na fila:', err.message);
    saveToOfflineQueue(eventType, payload); // ✅ guarda na fila
  }
};

/* ================================================================
   API PÚBLICA
================================================================ */
window.ApexAnalytics = {

  // ✅ trackPageView com controle de duplicatas
  trackPageView() {
    if (hasTrackedPageView()) {
      console.log('[Analytics] Page view já registrado nesta sessão — ignorado');
      return;
    }
    _track('page_view');
  },

  trackModalOpen(vehicleId, vehicleName) {
    console.log('[Analytics] trackModalOpen:', vehicleId, vehicleName);
    _track('modal_open', { vehicleId, vehicleName });
  },

  trackCardClick(vehicleId, vehicleName) {
    console.log('[Analytics] trackCardClick:', vehicleId, vehicleName);
    _track('card_click', { vehicleId, vehicleName });
  },

  trackWhatsappClick(vehicleId = null, vehicleName = null) {
    _track('whatsapp_click', { vehicleId, vehicleName });
  },

  trackFilterClick(category) {
    _track('filter_click', { vehicleName: category });
  },

  trackGalleryOpen(vehicleId = null, vehicleName = null) {
    _track('gallery_open', { vehicleId, vehicleName }); // ✅ agora recebe contexto
  },

  // ✅ Expõe flush para uso manual se necessário
  flushQueue: flushOfflineQueue,
};

/* ================================================================
   LISTENERS AUTOMÁTICOS
================================================================ */
document.addEventListener('DOMContentLoaded', async () => {

  // ✅ Tenta enviar eventos offline antes de registrar novos
  await flushOfflineQueue();

  // Page view
  window.ApexAnalytics.trackPageView();

  // WhatsApp — qualquer link wa.me
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href*="wa.me"]');
    if (!link) return;
    const card = link.closest('[data-vehicle-id]');
    window.ApexAnalytics.trackWhatsappClick(
      card?.dataset?.vehicleId   || null,
      card?.dataset?.vehicleName || null
    );
  }, { passive: true });

  // Filtros
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    window.ApexAnalytics.trackFilterClick(btn.dataset.filter || 'all');
  }, { passive: true });

  // ✅ Galeria lightbox — agora captura contexto do veículo
  document.addEventListener('click', (e) => {
    const galleryTrigger = e.target.closest('[data-gallery]');
    if (!galleryTrigger) return;
    const card = galleryTrigger.closest('[data-vehicle-id]');
    window.ApexAnalytics.trackGalleryOpen(
      card?.dataset?.vehicleId   || null,
      card?.dataset?.vehicleName || null
    );
  }, { passive: true });

  // ✅ Tenta reenviar fila quando conexão voltar
  window.addEventListener('online', async () => {
    console.log('[Analytics] Conexão restaurada — enviando fila offline...');
    await flushOfflineQueue();
  });

});
