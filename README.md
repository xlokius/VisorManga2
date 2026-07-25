# 🎴 MangaWave

**MangaWave** es un lector de manga web personal, minimalista y con identidad visual propia inspirada en la estetica japonesa (tinta sumi, papel washi, sellos hanko). Permite organizar tu biblioteca local de mangas por carpetas y leerlos en modo cascada (estilo webtoon/scroll continuo), con multiples temas de color y autenticacion segura.



## Caracteristicas

- **Modo cascada**: lectura continua sin espacios entre imagenes, con control de ancho ajustable en vivo.
- **4 temas visuales**: Sumi Ink, Washi Paper, Neon Kanji y Sakura Dusk, cada uno con su propia paleta de colores via variables CSS.
- **Autenticacion segura**: login con usuario/contrasena, contrasenas hasheadas con bcrypt, sesiones httpOnly, rate limiting y proteccion con Helmet (CSP).
- **Escaneo flexible de biblioteca**: detecta automaticamente mangas organizados como `manga/capitulo/imagenes` o `manga/imagenes` (capitulo unico).
- **Portada automatica**: usa la primera imagen encontrada de cada manga como portada en la galeria.
- **Buscador en vivo** dentro de la biblioteca.
- **Diseno responsive**: adaptado a movil y escritorio.
- **Componentes UI personalizados**: botones con efecto de relleno deslizante y resplandor, selector de tema custom, slider de ancho con relleno dinamico.
- **Sin frameworks pesados**: HTML, CSS y JavaScript vanilla + Express en el backend, sin dependencias de build.



## Stack tecnico

| Capa       | Tecnologia                          |
|------------|--------------------------------------|
| Backend    | Node.js + Express                    |
| Frontend   | HTML5, CSS3 (variables/custom props), JavaScript vanilla |
| Auth       | bcrypt, express-session, express-rate-limit, helmet |
| Tipografia | Shippori Mincho, Inter, JetBrains Mono (Google Fonts) |



## Estructura del proyecto

```
mangawave/
├── server.js               # Servidor Express, rutas API, auth
├── mangas/                 # Carpeta raiz de tu biblioteca (no incluida en git)
│   ├── nombre-manga-1/
│   │   ├── capitulo-1/
│   │   │   ├── 01.jpg
│   │   │   └── 02.jpg
│   │   └── capitulo-2/
│   └── nombre-manga-2/     # Estructura plana (capitulo unico)
│       ├── 01.jpg
│       └── 02.jpg
└── public/
    ├── index.html          # Galeria / biblioteca
    ├── login.html          # Pantalla de inicio de sesion
    ├── reader.html         # Lector en modo cascada
    ├── css/
    │   ├── theme.css       # Variables de los 4 temas
    │   ├── buttons.css     # Sistema de botones (hover-fill, glow) y controles
    │   ├── main.css        # Estilos de la galeria
    │   ├── login.css       # Estilos del login
    │   └── reader.css      # Estilos del lector
    └── js/
        ├── main.js         # Logica de la galeria
        ├── login.js        # Logica de autenticacion
        └── reader.js       # Logica del lector
```



## Instalacion

1. Clona el repositorio:
   ```bash
   git clone https://github.com/xlokius/VisorManga2.git
   cd VisorManga2
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Crea un archivo `.env` en la raiz con tus variables de entorno:
   ```
   SESSION_SECRET=cambia_esto_por_un_valor_aleatorio_largo
   PORT=3000
   ```

4. Crea la carpeta `mangas/` en la raiz del proyecto y agrega tus mangas siguiendo alguna de las 2 estructuras soportadas (ver arriba).

5. Inicia el servidor:
   ```bash
   npm start
   ```

6. Abre `http://localhost:3000` en tu navegador.



## Uso

1. Inicia sesion con tus credenciales configuradas.
2. En la biblioteca, usa el buscador para filtrar por titulo o el selector de tema para cambiar la paleta de colores.
3. Haz clic en un manga para abrir el lector.
4. Selecciona el capitulo desde el menu desplegable y ajusta el ancho de las paginas con el control deslizante.
5. Usa el boton "Volver" para regresar a la biblioteca o "Salir" para cerrar sesion.



## Temas disponibles

| Tema         | Descripcion                                   |
|--------------|------------------------------------------------|
| Sumi Ink     | Tinta japonesa sobre papel oscuro (por defecto)|
| Washi Paper  | Papel de arroz claro, estetica tradicional     |
| Neon Kanji   | Estilo neon urbano, usado en el lector          |
| Sakura Dusk  | Tonos rosados inspirados en flores de cerezo    |



## Seguridad

- Las contrasenas se almacenan con **bcrypt** (nunca en texto plano).
- Las sesiones usan cookies **httpOnly** y `sameSite: strict`.
- Se aplica **rate limiting** en el endpoint de login para mitigar fuerza bruta.
- Cabeceras de seguridad configuradas con **Helmet** (CSP).
- Ningun dato sensible se transmite por parametros de URL.



## Roadmap / posibles mejoras futuras

- [ ] Marcar capitulos como leidos / progreso de lectura.
- [ ] Modo de lectura por paginas (no solo cascada).
- [ ] Soporte multiusuario.
- [ ] Cache de miniaturas para cargas mas rapidas.



## Licencia

Proyecto de uso personal. Ajusta esta seccion segun corresponda antes de publicar (por ejemplo, MIT License) si planeas compartirlo publicamente.



## Nota

Este proyecto esta pensado para uso personal con contenido propio o de dominio publico. Respeta los derechos de autor del material que organices con esta herramienta.

