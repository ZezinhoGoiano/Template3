/* ================================================================
   APEX MOTORS ADMIN — supabase.js
================================================================ */

'use strict';

const SUPABASE_URL = 'https://lbwbdwzcyljtelaadbnx.supabase.co';

const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxid2Jkd3pjeWxqdGVsYWFkYm54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ0MTI5NDEsImV4cCI6MjA5OTk4ODk0MX0.fkvnX5tEM6Fi0USj6M3zpwXurDZK32XlB7xiJ0C5R00';

// ✅ Cria o cliente E expõe explicitamente em window
// para garantir compatibilidade entre scripts/módulos
const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true, // ✅ evita sessão expirar durante uso
    },
  }
);

// ✅ Garante acesso via window também
window.supabaseClient = supabaseClient;

/* ================================================================
   AUTENTICAÇÃO
================================================================ */
async function requireAuth() {
  try {
    const {
      data: { session },
      error,
    } = await supabaseClient.auth.getSession();

    if (error || !session) {
      window.location.href = 'index.html';
      return null;
    }

    return session;
  } catch (err) {
    console.error('[Supabase] Erro ao verificar sessão:', err);
    window.location.href = 'index.html';
    return null;
  }
}

async function logout() {
  try {
    await supabaseClient.auth.signOut();
  } catch (err) {
    console.error('[Supabase] Erro ao sair:', err);
  } finally {
    window.location.href = 'index.html';
  }
}

/* ================================================================
   LOGS DE AÇÃO
================================================================ */
async function logAction(action, entityType, entityId = null, details = {}) {
  try {
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    const { error } = await supabaseClient.from('logs').insert({
      user_email: user?.email || 'unknown',
      action,
      entity_type: entityType,
      entity_id: entityId,
      details,
    });

    if (error) {
      console.error('[Supabase] Erro ao registrar ação:', error.message);
    }
  } catch (err) {
    console.error('[Supabase] Falha ao registrar log:', err.message);
  }
}

/* ================================================================
   🆕 TESTE DE CONEXÃO / PERMISSÕES
   Use no console para debugar rapidamente problemas de RLS
================================================================ */
async function testSupabaseAccess() {
  console.log('🔍 Testando acesso às tabelas...');

  const tables = ['analytics', 'leads', 'logs'];

  for (const table of tables) {
    const { data, error, count } = await supabaseClient
      .from(table)
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error(`❌ ${table}: ERRO —`, error.message);
    } else {
      console.log(`✅ ${table}: OK — ${count} registros acessíveis`);
    }
  }
}

// Expõe globalmente para debug manual no console
window.testSupabaseAccess = testSupabaseAccess;
