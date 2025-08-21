# ¿Quién quiere ser experto en Japón? — Web App

Juego tipo *¿Quién quiere ser millonario?* para jugar en familia con 100 preguntas sobre Japón (cultura, idioma, comida, lugares y curiosidades), inspirado en el viaje de agosto 2025.

## 🚀 Estructura

```
/ (raíz)
├─ index.html
├─ styles.css
├─ script.js
├─ /assets
│  ├─ logo.svg
│  ├─ bg.svg
│  ├─ ll-5050.svg
│  ├─ ll-audience.svg
│  └─ ll-phone.svg
└─ /data
   └─ questions_es.json
```

## 🧩 Funcionalidades
- **Comodines**: 50:50, Público, Llamada (con pista).
- **Escalera de premios** de 15 escalones (modo TV).
- **Selección de preguntas** progresiva por dificultad o aleatoria.
- **Revisión** al final de la partida y guardado del mejor resultado en `localStorage`.
- 100% **estático** (sirve en GitHub Pages / Netlify).

## 💻 Despliegue
### GitHub Pages
1. Sube esta carpeta a un repo (`millonario-japon`).
2. Activa **Pages** en `Settings → Pages → Deploy from branch (main) /root`.
3. Abre la URL que te proporcione GitHub.

### Netlify
- Arrastra y suelta esta carpeta en Netlify (o conecta el repo).
- No necesita build; es un **sitio estático** (public dir = `/`).

## 🖼️ Imágenes y estilo
- Los SVGs incluidos (logo, patrón de fondo, iconos de comodines) son **originales** y libres de uso.
- Si quieres añadir fondos fotográficos (Monte Fuji, torii, etc.), colócalos en `/assets` y referencia en `styles.css`.

## ✍️ Personalización
- Edita `data/questions_es.json` para modificar/añadir preguntas.
- Para cambiar el número por defecto de preguntas, mira el `<select id="setting-count">` en `index.html`.

---

*Generado: 2025-08-21*
