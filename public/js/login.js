const form = document.getElementById('loginForm');
const btn = form.querySelector('.btn-login');
const errorMsg = document.getElementById('errorMsg');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorMsg.textContent = '';
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  btn.classList.add('loading');
  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (res.ok && data.ok) {
      window.location.href = '/';
    } else {
      errorMsg.textContent = data.error || 'Error al iniciar sesion';
      btn.classList.remove('loading');
    }
  } catch (err) {
    errorMsg.textContent = 'Error de conexion con el servidor';
    btn.classList.remove('loading');
  }
});
