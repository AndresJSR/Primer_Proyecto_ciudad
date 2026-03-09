// Cargar controladores
const script = document.createElement('script');
script.src = 'src/Business/Controllers/ConstructionMenuController.js';
document.head.appendChild(script);

const resourcePanelScript = document.createElement('script');
resourcePanelScript.src = 'src/Business/Controllers/ResourcePanelController.js';
document.head.appendChild(resourcePanelScript);

const modalScript = document.createElement('script');
modalScript.src = 'src/Business/Controllers/ModalController.js';
document.head.appendChild(modalScript);

window.addEventListener('buildModeChanged', (e) => {
    console.log('Modo de construcción:', e.detail.type);
});

// Permitir recibir el contenido del mapa personalizado desde el menú de inicio
let customMapContent = null;
window.addEventListener('startGame', (e) => {
    if (e && e.detail && e.detail.mapContent) {
        customMapContent = e.detail.mapContent;
    }
});

// CONFIGURACIÓN GLOBAL
const tileWidth = 80;
const tileHeight = 40;
const gridSize = 15;

function getMapSize() {
    const width = (gridSize + gridSize) * (tileWidth / 2);
    const height = (gridSize + gridSize) * (tileHeight / 2);
    return { width, height };
}

// ─── ESTADO DE CÁMARA ────────────────────────────────────────────────────────
// offsetX/offsetY: desplazamiento en píxeles desde el centro del viewport
// scale: zoom actual
let camera = {
    offsetX: 0,
    offsetY: 0,
    scale: 1,
    minScale: 0.35,
    maxScale: 3.0,
};

// Animación suave con lerp
let anim = {
    offsetX: 0,
    offsetY: 0,
    scale: 1,
    running: false,
};

let isDragging = false;
let lastMouse = { x: 0, y: 0 };

// ─── APLICAR TRANSFORM ────────────────────────────────────────────────────────
// El map-camera está centrado con translate(-50%,-50%) en CSS,
// así que solo necesitamos translate(offsetX, offsetY) + scale.
function applyTransform(ox, oy, sc) {
    const cameraEl = document.querySelector('.map-camera');
    if (!cameraEl) return;
    cameraEl.style.transform = `translate(-50%, -50%) translate(${ox}px, ${oy}px) scale(${sc})`;
}

// ─── LOOP DE ANIMACIÓN ────────────────────────────────────────────────────────
function startAnimLoop() {
    if (anim.running) return;
    anim.running = true;

    function tick() {
        const LERP = 0.14;

        const dX = camera.offsetX - anim.offsetX;
        const dY = camera.offsetY - anim.offsetY;
        const dS = camera.scale  - anim.scale;

        anim.offsetX += dX * LERP;
        anim.offsetY += dY * LERP;
        anim.scale   += dS * LERP;

        applyTransform(anim.offsetX, anim.offsetY, anim.scale);

        const done =
            Math.abs(dX) < 0.05 &&
            Math.abs(dY) < 0.05 &&
            Math.abs(dS) < 0.0005;

        if (done) {
            anim.offsetX = camera.offsetX;
            anim.offsetY = camera.offsetY;
            anim.scale   = camera.scale;
            applyTransform(anim.offsetX, anim.offsetY, anim.scale);
            anim.running = false;
        } else {
            requestAnimationFrame(tick);
        }
    }

    requestAnimationFrame(tick);
}

// ─── CLAMP: no dejar salir el mapa del viewport ───────────────────────────────
function clampOffset() {
    const viewport = document.querySelector('.map-viewport');
    if (!viewport) return;

    const { width: mapW, height: mapH } = getMapSize();
    const vw = viewport.clientWidth;
    const vh = viewport.clientHeight;

    // El mapa escalado
    const sw = mapW * camera.scale;
    const sh = mapH * camera.scale;

    // Margen: permite desplazar hasta que el borde del mapa llegue al centro del viewport
    const maxX = Math.max(0, (sw - vw) / 2 + vw * 0.25);
    const maxY = Math.max(0, (sh - vh) / 2 + vh * 0.25);

    camera.offsetX = Math.max(-maxX, Math.min(maxX, camera.offsetX));
    camera.offsetY = Math.max(-maxY, Math.min(maxY, camera.offsetY));
}

// ─── CENTRAR CÁMARA ───────────────────────────────────────────────────────────
function centerCamera() {
    // Calcular escala inicial para que el mapa llene cómodamente el viewport
    const viewport = document.querySelector('.map-viewport');
    let initialScale = 1;
    if (viewport) {
        const { width: mapW, height: mapH } = getMapSize();
        const scaleX = (viewport.clientWidth  * 0.85) / mapW;
        const scaleY = (viewport.clientHeight * 0.85) / mapH;
        initialScale = Math.min(scaleX, scaleY, 1.0); // nunca mayor a 1 al inicio
        initialScale = Math.max(camera.minScale, initialScale);
    }

    camera.offsetX = 0;
    camera.offsetY = 0;
    camera.scale   = initialScale;
    anim.offsetX   = 0;
    anim.offsetY   = 0;
    anim.scale     = initialScale;
    applyTransform(0, 0, initialScale);
}

// ─── CONTROLES ────────────────────────────────────────────────────────────────
function setupCameraControls() {
    const viewport = document.querySelector('.map-viewport');
    if (!viewport) return;

    // ZOOM con rueda — pivota en el cursor
    viewport.addEventListener('wheel', (e) => {
        e.preventDefault();

        const zoomFactor = e.deltaY < 0 ? 1.10 : 1 / 1.10;
        const prevScale = camera.scale;
        const newScale  = Math.max(camera.minScale, Math.min(camera.maxScale, prevScale * zoomFactor));

        if (newScale === prevScale) return;

        // Posición del cursor relativa al CENTRO del viewport
        const rect = viewport.getBoundingClientRect();
        const cursorX = e.clientX - rect.left - rect.width  / 2;
        const cursorY = e.clientY - rect.top  - rect.height / 2;

        // Ajuste de offset para que el punto bajo el cursor no se mueva
        // Fórmula: nuevoOffset = cursor - (cursor - offsetActual) * (newScale / prevScale)
        camera.offsetX = cursorX - (cursorX - camera.offsetX) * (newScale / prevScale);
        camera.offsetY = cursorY - (cursorY - camera.offsetY) * (newScale / prevScale);
        camera.scale   = newScale;

        clampOffset();
        startAnimLoop();
    }, { passive: false });

    // DRAG con mouse
    viewport.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return;
        isDragging = true;
        lastMouse  = { x: e.clientX, y: e.clientY };
        viewport.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        camera.offsetX += e.clientX - lastMouse.x;
        camera.offsetY += e.clientY - lastMouse.y;
        lastMouse = { x: e.clientX, y: e.clientY };
        clampOffset();
        startAnimLoop();
    });

    window.addEventListener('mouseup', () => {
        if (!isDragging) return;
        isDragging = false;
        viewport.style.cursor = '';
    });

    // DRAG con touch (mobile)
    let lastTouch = null;
    let lastPinchDist = null;

    viewport.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            lastTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            lastPinchDist = null;
        } else if (e.touches.length === 2) {
            lastPinchDist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
        }
    }, { passive: true });

    viewport.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (e.touches.length === 1 && lastTouch) {
            camera.offsetX += e.touches[0].clientX - lastTouch.x;
            camera.offsetY += e.touches[0].clientY - lastTouch.y;
            lastTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            clampOffset();
            startAnimLoop();
        } else if (e.touches.length === 2 && lastPinchDist !== null) {
            const dist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            const ratio = dist / lastPinchDist;
            const prevScale = camera.scale;
            camera.scale = Math.max(camera.minScale, Math.min(camera.maxScale, prevScale * ratio));

            // Pivota en el centro del pinch
            const rect = viewport.getBoundingClientRect();
            const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left - rect.width  / 2;
            const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top  - rect.height / 2;
            camera.offsetX = cx - (cx - camera.offsetX) * (camera.scale / prevScale);
            camera.offsetY = cy - (cy - camera.offsetY) * (camera.scale / prevScale);

            lastPinchDist = dist;
            clampOffset();
            startAnimLoop();
        }
    }, { passive: false });

    viewport.addEventListener('touchend', () => {
        lastTouch = null;
        lastPinchDist = null;
    }, { passive: true });

    // Recenter con doble click
    viewport.addEventListener('dblclick', () => {
        camera.offsetX = 0;
        camera.offsetY = 0;
        clampOffset();
        startAnimLoop();
    });
}

// ─── RENDER DEL GRID ─────────────────────────────────────────────────────────
function renderGrid() {
    const map = document.getElementById('city-map');
    if (!map) return;

    map.innerHTML = '';

    // Si hay un mapa personalizado, úsalo aquí
    if (customMapContent) {
        // Aquí puedes procesar customMapContent para crear el mapa
        // Por ahora solo lo mostramos en consola
        console.log('Mapa personalizado cargado:', customMapContent);
        // TODO: lógica para parsear y renderizar el mapa personalizado
    }

    const mapWidth  = (gridSize + gridSize) * (tileWidth  / 2);
    const mapHeight = (gridSize + gridSize) * (tileHeight / 2);

    map.style.width  = mapWidth  + 'px';
    map.style.height = mapHeight + 'px';

    const centerX = mapWidth / 2;

    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            const cell = document.createElement('div');
            cell.className  = 'city-cell';
            cell.dataset.x  = x;
            cell.dataset.y  = y;

            const isoX = (x - y) * (tileWidth  / 2);
            const isoY = (x + y) * (tileHeight / 2);

            cell.style.left = (isoX + centerX - tileWidth / 2) + 'px';
            cell.style.top  = isoY + 'px';

            map.appendChild(cell);
        }
    }
}

// ─── INIT ─────────────────────────────────────────────────────────────────────
fetch('src/View/layouts/cityBuilderLayout.html')
    .then(res => res.text())
    .then(html => {
        document.getElementById('app').innerHTML = html;
        renderGrid();
        centerCamera();
        setupCameraControls();
    });