// Controlador del menú de inicio para City Builder Game
/* ===================================================
   CITY BUILDER — Lógica del Menú de Inicio
   =================================================== */

(function () {
  'use strict';

  // ── Elementos ──────────────────────────────────────
  const selectMapBtn  = document.getElementById('select-map-btn');
  const mapFileInput  = document.getElementById('map-file-input');
  const playBtn       = document.getElementById('play-btn');
  const fileInfoEl    = document.getElementById('file-info');
  const mapNameBadge  = document.getElementById('map-name-badge');

  let selectedFile = null;

  // ── Partículas de fondo ────────────────────────────
  function spawnParticles () {
    const container = document.getElementById('particles');
    if (!container) return;

    const count = 28;

    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'particle';

      const x    = Math.random() * 100;
      const y    = 30 + Math.random() * 60;
      const dur  = 5 + Math.random() * 7;
      const delay= Math.random() * 8;
      const size = Math.random() > 0.7 ? 3 : 2;

      p.style.cssText = `
        left: ${x}%;
        top:  ${y}%;
        --dur:   ${dur}s;
        --delay: ${delay}s;
        width:   ${size}px;
        height:  ${size}px;
        opacity: 0;
      `;

      container.appendChild(p);
    }
  }

  // ── Abrir selector de archivo ──────────────────────
  selectMapBtn.addEventListener('click', () => {
    mapFileInput.click();
  });

  // ── Archivo seleccionado ───────────────────────────
  mapFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    selectedFile = file;

    const sizekb = (file.size / 1024).toFixed(1);
    const name   = truncate(file.name, 34);

    // Mostrar info del archivo
    fileInfoEl.innerHTML = `
      <span class="fi-icon">✦</span>
      <span class="fi-name">${name}</span>
      <span class="fi-size">${sizekb} KB</span>
    `;

    // Activar botón Jugar
    playBtn.disabled = false;
    playBtn.classList.add('ready');

    // Badge con nombre corto
    const shortName = file.name.replace(/\.txt$/i, '');
    mapNameBadge.textContent = truncate(shortName, 18);
    mapNameBadge.classList.add('visible');

    // Pequeña animación de pulso en el botón Jugar
    playBtn.animate(
      [
        { transform: 'scale(1)' },
        { transform: 'scale(1.03)' },
        { transform: 'scale(1)' },
      ],
      { duration: 350, easing: 'ease-in-out' }
    );
  });

  // ── Jugar ──────────────────────────────────────────
  playBtn.addEventListener('click', () => {
    if (!selectedFile || playBtn.disabled) return;

    // Emitir el evento startGame para integrarse con el flujo actual
    const reader = new FileReader();
    reader.onload = function(evt) {
      const mapContent = evt.target.result;
      window.dispatchEvent(new CustomEvent('startGame', {
        detail: { mapContent, fileName: selectedFile.name }
      }));
    };
    reader.readAsText(selectedFile);

    // Animación de salida (opcional demo)
    const menu = document.getElementById('start-menu');
    menu.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    menu.style.opacity    = '0';
    menu.style.transform  = 'scale(0.97) translateY(-12px)';
  });

  // ── Utilidad ───────────────────────────────────────
  function truncate (str, max) {
    return str.length > max ? str.slice(0, max - 1) + '…' : str;
  }

  // ── Init ───────────────────────────────────────────
  spawnParticles();
})();

// Permitir inicialización explícita desde index.html
window.initMainMenu = function() {
  // No hace falta duplicar lógica, solo ejecuta el IIFE si no se ha ejecutado
};
