/* auth.js — login/register page logic */

(function () {
  // If already logged in, skip straight to the dashboard.
  if (Storage.getCurrentUser()) {
    window.location.href = 'dashboard.html';
    return;
  }

  const loginView = document.getElementById('loginView');
  const registerView = document.getElementById('registerView');

  document.getElementById('showRegister').addEventListener('click', () => {
    loginView.style.display = 'none';
    registerView.style.display = 'block';
  });

  document.getElementById('showLogin').addEventListener('click', () => {
    registerView.style.display = 'none';
    loginView.style.display = 'block';
  });

  function showError(elId, message) {
    const el = document.getElementById(elId);
    el.textContent = message;
    el.classList.add('visible');
  }

  function clearError(elId) {
    document.getElementById(elId).classList.remove('visible');
  }

  document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    clearError('loginError');
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    const user = Storage.verifyLogin(email, password);
    if (!user) {
      showError('loginError', 'Incorrect email or password.');
      return;
    }
    Storage.setSession(user.id);
    window.location.href = 'dashboard.html';
  });

  document.getElementById('registerForm').addEventListener('submit', (e) => {
    e.preventDefault();
    clearError('registerError');
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;

    if (Storage.findUserByEmail(email)) {
      showError('registerError', 'An account with that email already exists.');
      return;
    }

    const user = Storage.createUser({ name, email, password });
    Storage.setSession(user.id);
    window.location.href = 'dashboard.html';
  });
})();
