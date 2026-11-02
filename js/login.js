(function () {
  'use strict';

  const LOGIN_KEY = 'finantech_rpa_logado';
  const LOGIN_USER = 'admin';
  const LOGIN_PASS = 'FinRPA!2026#N7vQ4sL';

  const form = document.getElementById('loginForm');
  const usernameInput = document.getElementById('usuario');
  const passwordInput = document.getElementById('senha');
  const fictitiousDataConfirmation = document.getElementById('confirmacaoDadosFicticios');
  const errorMessage = document.getElementById('loginErro');

  try {
    if (localStorage.getItem(LOGIN_KEY) === 'true') {
      window.location.replace('index.html');
      return;
    }
  } catch (error) {
    console.error('Não foi possível verificar a sessão.', error);
    errorMessage.textContent = 'O armazenamento local está indisponível neste navegador.';
    errorMessage.classList.remove('hidden');
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    if (!fictitiousDataConfirmation.checked) {
      errorMessage.textContent = 'Confirme que usará somente dados fictícios para entrar.';
      errorMessage.classList.remove('hidden');
      fictitiousDataConfirmation.focus();
      return;
    }

    const username = usernameInput.value.trim().toLowerCase();
    const password = passwordInput.value;

    if (username !== LOGIN_USER || password !== LOGIN_PASS) {
      errorMessage.textContent = 'Usuário ou senha inválidos.';
      errorMessage.classList.remove('hidden');
      passwordInput.value = '';
      passwordInput.focus();
      return;
    }

    try {
      localStorage.setItem(LOGIN_KEY, 'true');
    } catch (error) {
      console.error('Não foi possível iniciar a sessão.', error);
      errorMessage.textContent = 'Não foi possível iniciar a sessão neste navegador.';
      errorMessage.classList.remove('hidden');
      return;
    }

    window.location.replace('index.html');
  });
})();
