/* ================================================================
   APEX MOTORS ADMIN — supabase.js
================================================================ */

const SUPABASE_URL = 'https://lbwbdwzcyljtelaadbnx.supabase.co';

const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxid2Jkd3pjeWxqdGVsYWFkYm54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ0MTI5NDEsImV4cCI6MjA5OTk4ODk0MX0.fkvnX5tEM6Fi0USj6M3zpwXurDZK32XlB7xiJ0C5R00';

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

async function requireAuth() {
  const {
    data: { session },
    error
  } = await supabaseClient.auth.getSession();

  if (error || !session) {
    window.location.href = 'index.html';
    return null;
  }

  return session;
}

async function logout() {
  await supabaseClient.auth.signOut();
  window.location.href = 'index.html';
}

async function logAction(action, entityType, entityId = null, details = {}) {
  const {
    data: { user }
  } = await supabaseClient.auth.getUser();

  const { error } = await supabaseClient.from('logs').insert({
    user_email: user?.email || 'unknown',
    action,
    entity_type: entityType,
    entity_id: entityId,
    details
  });

  if (error) {
    console.error('Erro ao registrar ação:', error);
  }
}
