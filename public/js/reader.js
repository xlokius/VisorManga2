const params = new URLSearchParams(window.location.search);
const mangaName = params.get('manga');
const pagesWrap = document.getElementById('pagesWrap');
const mangaTitle = document.getElementById('mangaTitle');
const chapterSelect = document.getElementById('chapterSelect');
const widthRange = document.getElementById('widthRange');
const widthValue = document.getElementById('widthValue'); // <-- NUEVO
const backBtn = document.getElementById('backBtn');

const savedTheme = localStorage.getItem('mw-theme') || 'neon';
document.body.setAttribute('data-theme', savedTheme);

const savedWidth = localStorage.getItem('mw-reader-width') || '70';
widthRange.value = savedWidth;
document.documentElement.style.setProperty('--reader-width', savedWidth + '%');

// NUEVO: pintar el relleno del slider y el % al cargar la pagina
if (widthValue) {
  const pctInit = ((widthRange.value - widthRange.min) / (widthRange.max - widthRange.min)) * 100;
  widthRange.style.setProperty('--fill', pctInit + '%');
  widthValue.textContent = widthRange.value + '%';
}

widthRange.addEventListener('input', () => {
  document.documentElement.style.setProperty('--reader-width', widthRange.value + '%');
  localStorage.setItem('mw-reader-width', widthRange.value);

  // NUEVO: actualizar relleno del slider y el % en vivo
  if (widthValue) {
    const pct = ((widthRange.value - widthRange.min) / (widthRange.max - widthRange.min)) * 100;
    widthRange.style.setProperty('--fill', pct + '%');
    widthValue.textContent = widthRange.value + '%';
  }
});

backBtn.addEventListener('click', () => { window.location.href = '/'; });

if (!mangaName) { window.location.href = '/'; }

mangaTitle.textContent = mangaName.replace(/[-_]/g, ' ');

let chaptersList = [];

async function loadChapters() {
  const res = await fetch(`/api/mangas/${encodeURIComponent(mangaName)}`);
  if (res.status === 401) { window.location.href = '/login.html'; return; }
  const data = await res.json();
  chaptersList = data.chapters;
  chapterSelect.innerHTML = '';
  chaptersList.forEach(ch => {
    const opt = document.createElement('option');
    opt.value = ch;
    opt.textContent = ch === '_root' ? 'Unico' : ch.replace(/[-_]/g, ' ');
    chapterSelect.appendChild(opt);
  });
  loadPages(chaptersList[0]);
}

chapterSelect.addEventListener('change', () => {
  loadPages(chapterSelect.value);
});

async function loadPages(chapter) {
  pagesWrap.innerHTML = '<p class="loading-spinner">Cargando paginas...</p>';
  const res = await fetch(`/api/mangas/${encodeURIComponent(mangaName)}/${encodeURIComponent(chapter)}`);
  if (res.status === 401) { window.location.href = '/login.html'; return; }
  const data = await res.json();
  pagesWrap.innerHTML = '';
  if (!data.images || !data.images.length) {
    pagesWrap.innerHTML = '<p class="loading-spinner">No hay imagenes en este capitulo</p>';
    return;
  }
  data.images.forEach(src => {
    const img = document.createElement('img');
    img.src = src;
    img.loading = 'lazy';
    pagesWrap.appendChild(img);
  });
  window.scrollTo(0, 0);
}

loadChapters();
