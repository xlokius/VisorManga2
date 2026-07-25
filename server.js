require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const MANGAS_DIR = path.join(__dirname, 'mangas');

const USERNAME = 'username'; // Cambia esto a tu nombre de usuario deseado
const PASSWORD_HASH = bcrypt.hashSync('password', 10);

app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: false, // evita presets ocultos como upgrade-insecure-requests
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'"],
      // upgradeInsecureRequests deliberadamente omitido
    }
  }
}));
app.disable('x-powered-by');
app.use(express.json());
app.set('trust proxy', 1);
app.use(session({
  secret: process.env.SESSION_SECRET,
  name: 'sid',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 4
  }
}));

const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 8,
  message: { error: 'Demasiados intentos. Intenta mas tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
});

function requireAuth(req, res, next) {
  if (req.session && req.session.authenticated) return next();
  return res.status(401).json({ error: 'No autorizado' });
}
function requireAuthPage(req, res, next) {
  if (req.session && req.session.authenticated) return next();
  return res.redirect('/login.html');
}

app.post('/api/login', loginLimiter, (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'Faltan credenciales' });
  const validUser = username === USERNAME;
  const validPass = bcrypt.compareSync(password, PASSWORD_HASH);
  if (validUser && validPass) {
    req.session.regenerate((err) => {
      if (err) return res.status(500).json({ error: 'Error de sesion' });
      req.session.authenticated = true;
      req.session.user = USERNAME;
      return res.json({ ok: true });
    });
  } else {
    return res.status(401).json({ error: 'Usuario o contrasena incorrectos' });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(() => { res.clearCookie('sid'); res.json({ ok: true }); });
});
app.get('/api/session', (req, res) => {
  res.json({ authenticated: !!(req.session && req.session.authenticated) });
});

app.get('/', requireAuthPage, (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/reader.html', requireAuthPage, (req, res) => res.sendFile(path.join(__dirname, 'public', 'reader.html')));
app.get('/login.html', (req, res, next) => {
  if (req.session && req.session.authenticated) return res.redirect('/');
  next();
});
app.use(express.static(path.join(__dirname, 'public')));

const IMG_EXT = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif'];
function isImage(file) { return IMG_EXT.includes(path.extname(file).toLowerCase()); }
function naturalSort(a, b) { return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }); }
function listDirs(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name).sort(naturalSort);
}
function listImages(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).filter(d => d.isFile() && isImage(d.name)).map(d => d.name).sort(naturalSort);
}
function getMangaStructure(mangaPath) {
  const entries = fs.readdirSync(mangaPath, { withFileTypes: true });
  const dirs = entries.filter(e => e.isDirectory()).map(e => e.name).sort(naturalSort);
  const images = entries.filter(e => e.isFile() && isImage(e.name)).map(e => e.name).sort(naturalSort);
  if (dirs.length > 0) return { type: 'chapters', chapters: dirs };
  return { type: 'flat', images };
}
function getCoverImage(mangaName) {
  const mangaPath = path.join(MANGAS_DIR, mangaName);
  const structure = getMangaStructure(mangaPath);
  if (structure.type === 'flat') {
    if (structure.images.length === 0) return null;
    return `/mangas-content/${encodeURIComponent(mangaName)}/${encodeURIComponent(structure.images[0])}`;
  } else {
    const firstChapter = structure.chapters[0];
    const imgs = listImages(path.join(mangaPath, firstChapter));
    if (imgs.length === 0) return null;
    return `/mangas-content/${encodeURIComponent(mangaName)}/${encodeURIComponent(firstChapter)}/${encodeURIComponent(imgs[0])}`;
  }
}

app.get('/api/mangas', requireAuth, (req, res) => {
  if (!fs.existsSync(MANGAS_DIR)) return res.json([]);
  const mangaNames = listDirs(MANGAS_DIR);
  const result = mangaNames.map(name => {
    const structure = getMangaStructure(path.join(MANGAS_DIR, name));
    return {
      name,
      title: name.replace(/[-_]/g, ' '),
      cover: getCoverImage(name),
      chapterCount: structure.type === 'chapters' ? structure.chapters.length : 1
    };
  });
  res.json(result);
});

app.get('/api/mangas/:manga', requireAuth, (req, res) => {
  const mangaName = req.params.manga;
  const mangaPath = path.join(MANGAS_DIR, mangaName);
  if (!fs.existsSync(mangaPath)) return res.status(404).json({ error: 'No encontrado' });
  const structure = getMangaStructure(mangaPath);
  if (structure.type === 'chapters') res.json({ type: 'chapters', chapters: structure.chapters });
  else res.json({ type: 'flat', chapters: ['_root'] });
});

app.get('/api/mangas/:manga/:chapter', requireAuth, (req, res) => {
  const { manga, chapter } = req.params;
  const mangaPath = path.join(MANGAS_DIR, manga);
  if (!fs.existsSync(mangaPath)) return res.status(404).json({ error: 'No encontrado' });
  let images = [];
  let basePath;
  if (chapter === '_root') {
    images = listImages(mangaPath);
    basePath = `/mangas-content/${encodeURIComponent(manga)}`;
  } else {
    const chapterPath = path.join(mangaPath, chapter);
    if (!fs.existsSync(chapterPath)) return res.status(404).json({ error: 'Capitulo no encontrado' });
    images = listImages(chapterPath);
    basePath = `/mangas-content/${encodeURIComponent(manga)}/${encodeURIComponent(chapter)}`;
  }
  const urls = images.map(img => `${basePath}/${encodeURIComponent(img)}`);
  res.json({ images: urls });
});

app.use('/mangas-content', requireAuth, express.static(MANGAS_DIR, { dotfiles: 'deny', index: false }));

app.use((req, res) => res.status(404).json({ error: 'No encontrado' }));

app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
