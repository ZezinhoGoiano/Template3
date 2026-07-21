/* ================================================================
   APEX MOTORS — vehicles-data.js
   Busca veículos do Supabase e expõe como VEHICLES_DATA global.
================================================================ */

'use strict';

const _SUPABASE_URL      = 'https://lbwbdwzcyljtelaadbnx.supabase.co';
const _SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxid2Jkd3pjeWxqdGVsYWFkYm54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ0MTI5NDEsImV4cCI6MjA5OTk4ODk0MX0.fkvnX5tEM6Fi0USj6M3zpwXurDZK32XlB7xiJ0C5R00';
 // ← cole sua anon key aqui

// Começa vazio — preenchido antes dos outros scripts rodarem
window.VEHICLES_DATA = [];

/* ================================================================
   NORMALIZA campos do banco → formato esperado pelo front-end
   Banco:  badge_color (snake_case)
   Front:  badgeColor  (camelCase)
================================================================ */
const _normalizeVehicle = (v) => ({
  id:          String(v.id),
  name:        v.name         || '',
  year:        String(v.year  || ''),
  price:       Number(v.price || 0),
  category:    v.category     || '',
  badge:       v.badge        || null,
  badgeColor:  v.badge_color  || null,
  status:      v.status       || 'available',
  description: v.description  || '',
  images:      Array.isArray(v.images) ? v.images : [],
  videos:      Array.isArray(v.videos) ? v.videos : [],

  sold_at:    v.sold_at    || null,
  updated_at: v.updated_at || null,

  specs: (v.specs && typeof v.specs === 'object') ? {
    motor:        v.specs.motor        || '—',
    km:           v.specs.km           || '—',
    power:        v.specs.power        || '—',
    transmission: v.specs.transmission || '—',
    fuel:         v.specs.fuel         || '—',
    acceleration: v.specs.acceleration || '—',
    topSpeed:     v.specs.topSpeed     || '—',
    color:        v.specs.color        || '—',
    doors:        v.specs.doors        || '—',
  } : {
    motor:'—', km:'—', power:'—', transmission:'—', fuel:'—',
    acceleration:'—', topSpeed:'—', color:'—', doors:'—',
  },
  optionals: Array.isArray(v.optionals) ? v.optionals : [],

  financingEnabled: Boolean(v.financing_enabled),
  financingOptions: Array.isArray(v.financing_options) ? v.financing_options : [],
  discountEnabled:  Boolean(v.discount_enabled),
  discountPrice:    v.discount_price != null ? Number(v.discount_price) : null,
});
/* ================================================================
   PROMISE global — todos os scripts aguardam ela resolver
================================================================ */
window.vehiclesDataReady = (async () => {
  try {
    const client = window.supabase.createClient(
      _SUPABASE_URL,
      _SUPABASE_ANON_KEY
    );

    const { data, error } = await client
      .from('vehicles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    window.VEHICLES_DATA = (data || []).map(_normalizeVehicle);
    console.log(`✅ ${window.VEHICLES_DATA.length} veículos carregados do Supabase`);

  } catch (err) {
    console.error('❌ Erro ao carregar veículos:', err.message);
    // Mantém [] — página carrega sem veículos, não quebra
  }

  return window.VEHICLES_DATA;
})();
