const grid = document.getElementById('grid');
const emptyMsg = document.getElementById('emptyMsg');
const themeSelect = document.getElementById('themeSelect');
const searchInput = document.getElementById('searchInput');
const logoutBtn = document.getElementById('logoutBtn');

const savedTheme = localStorage.getItem('mw-theme') || 'sumi';
document.body.setAttribute('data-theme', savedTheme);
themeSelect.value = savedTheme;

themeSelect.addEventListener('change', () => {
  document.body.setAttribute('data-theme', themeSelect.value);
  localStorage.setItem('mw-theme', themeSelect.value);
});

let allMangas = [];

async function loadMangas() {
  try {
    const res = await fetch('/api/mangas');
    if (res.status === 401) { window.location.href = '/login.html'; return; }
    allMangas = await res.json();
    renderMangas(allMangas);
  } catch (e) {
    emptyMsg.style.display = 'block';
    emptyMsg.textContent = 'Error al cargar la biblioteca';
  }
}

function renderMangas(list) {
  grid.innerHTML = '';
  if (!list.length) { emptyMsg.style.display = 'block'; return; }
  emptyMsg.style.display = 'none';
  list.forEach((manga, i) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `Abrir ${manga.title}`);
    card.style.animationDelay = `${i * 0.05}s`;
    card.innerHTML = `
      <div class="card-cover-wrap">
        <img src="${manga.cover || ''}" alt="Portada de ${manga.title}" loading="lazy" onerror="this.style.opacity=0">
        <div class="corner-fold"><span class="chapters-num">${manga.chapterCount}</span></div>
      </div>
      <div class="card-info">
        <h3 class="card-title">${manga.title}</h3>
        <p class="card-chapters">${manga.chapterCount} cap.</p>
      </div>`;
    const open = () => { window.location.href = `/reader.html?manga=${encodeURIComponent(manga.name)}`; };
    card.addEventListener('click', open);
    card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
    grid.appendChild(card);
  });
}

searchInput.addEventListener('input', () => {
  const q = searchInput.value.toLowerCase();
  renderMangas(allMangas.filter(m => m.title.toLowerCase().includes(q)));
});

logoutBtn.addEventListener('click', async () => {
  await fetch('/api/logout', { method: 'POST' });
  window.location.href = '/login.html';
});

loadMangas();
