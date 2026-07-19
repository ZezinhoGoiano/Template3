/* ================================================================
   APEX MOTORS ADMIN — login.js
   Lógica da página de login + recuperação de senha
================================================================ */

'use strict';

const $ = (sel) => document.querySelector(sel);

/* ================================================================
   TOAST SIMPLES (reutilizado do site principal, versão enxuta)
================================================================ */
const showToast = (message, type = 'info') => {
  const container = $('#toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.setAttribute('role', 'alert');
  toast.innerHTML = `<div class="toast__message">${message}</div>`;

  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('is-removing');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
};

/* ================================================================
   REDIRECIONA SE JÁ ESTIVER LOGADO
================================================================ */
const checkExistingSession = async () => {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (session) {
    window.location.href = 'dashboard.html';
  }
};

/* ================================================================
   TOGGLE MOSTRAR/OCULTAR SENHA
================================================================ */
const initPasswordToggle = () => {
  const toggle = $('#togglePassword');
  const input = $('#loginPassword');

  toggle?.addEventListener('click', () => {
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    toggle.setAttribute('aria-label', isPassword ? 'Ocultar senha' : 'Mostrar senha');
  });
};

/* ================================================================
   ALTERNAR ENTRE LOGIN E "ESQUECI MINHA SENHA"
================================================================ */
const initCardSwitch = () => {
  const loginCard = $('#loginCard');
  const forgotCard = $('#forgotCard');

  $('#showForgotPassword')?.addEventListener('click', () => {
    loginCard.hidden = true;
    forgotCard.hidden = false;
  });

  $('#backToLogin')?.addEventListener('click', () => {
    forgotCard.hidden = true;
    loginCard.hidden = false;
  });
};

/* ================================================================
   SUBMIT DO LOGIN
================================================================ */
const initLoginForm = () => {
  const form = $('#loginForm');
  const errorBox = $('#loginError');
  const submitBtn = $('#loginSubmit');
  const submitText = $('#loginSubmitText');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = $('#loginEmail').value.trim();
    const password = $('#loginPassword').value;

    errorBox.hidden = true;
    submitBtn.disabled = true;
    submitText.textContent = 'Entrando...';

    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    submitBtn.disabled = false;
    submitText.textContent = 'Entrar';

    if (error) {
      errorBox.textContent = 'E-mail ou senha inválidos. Tente novamente.';
      errorBox.hidden = false;
      return;
    }

    showToast('Login realizado com sucesso!', 'success');
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 800);
  });
};

/* ================================================================
   SUBMIT DO "ESQUECI MINHA SENHA"
================================================================ */
const initForgotForm = () => {
  const form = $('#forgotForm');
  const messageBox = $('#forgotMessage');
  const submitBtn = $('#forgotSubmit');
  const submitText = $('#forgotSubmitText');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = $('#forgotEmail').value.trim();

    messageBox.hidden = true;
    submitBtn.disabled = true;
    submitText.textContent = 'Enviando...';

    // FIX: redirectTo deve apontar para uma página que trate o reset
    // (vamos criar reset-password.html na sequência)
    const redirectUrl = `${window.location.origin}${window.location.pathname.replace('index.html', '')}reset-password.html`;

    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    submitBtn.disabled = false;
    submitText.textContent = 'Enviar link de recuperação';

    if (error) {
      messageBox.className = 'login-message login-message--error';
      messageBox.textContent = 'Não foi possível enviar o e-mail. Verifique o endereço informado.';
      messageBox.hidden = false;
      return;
    }

    messageBox.className = 'login-message login-message--success';
    messageBox.textContent = 'Link de recuperação enviado! Verifique sua caixa de entrada (e spam).';
    messageBox.hidden = false;
    form.reset();
  });
};

/* ================================================================
   INIT
================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  $('#loginYear').textContent = new Date().getFullYear();
  checkExistingSession();
  initPasswordToggle();
  initCardSwitch();
  initLoginForm();
  initForgotForm();
});
