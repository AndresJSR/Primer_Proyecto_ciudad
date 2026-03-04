// Quitar el import para compatibilidad con navegador
// import './Business/Controllers/ConstructionMenuController.js';

// Cargar el controlador del menú de construcción de forma tradicional
const script = document.createElement('script');
script.src = 'src/Business/Controllers/ConstructionMenuController.js';
document.head.appendChild(script);

// Cargar el controlador del panel de recursos
const resourcePanelScript = document.createElement('script');
resourcePanelScript.src = 'src/Business/Controllers/ResourcePanelController.js';
document.head.appendChild(resourcePanelScript);

// Cargar el controlador del modal
const modalScript = document.createElement('script');
modalScript.src = 'src/Business/Controllers/ModalController.js';
document.head.appendChild(modalScript);

// Escuchar el evento buildModeChanged y mostrar en consola el modo activo
window.addEventListener('buildModeChanged', (e) => {
    console.log('Modo de construcción:', e.detail.type);
});

// Renderiza el layout y el grid dinámico 15x15 en el mapa central

function getMapSize() {
    const tileWidth = 80;
    const tileHeight = 40;
    const gridSize = 15; // O usa una variable si el tamaño es dinámico
    const width = (gridSize + gridSize) * (tileWidth / 2);
    const height = (gridSize + gridSize) * (tileHeight / 2);
    return { width, height };
}

let camera = {
    x: 0,
    y: 0,
    scale: 1,
    minScale: 0.4,
    maxScale: 2.2,
    targetX: 0,
    targetY: 0,
    targetScale: 1
};
let isDragging = false;
let lastMouse = { x: 0, y: 0 };
let animating = false;

function updateCamera(smooth = false) {
    const cameraEl = document.querySelector('.map-camera');
    if (!cameraEl) return;
    if (smooth) {
        if (animating) return;
        animating = true;
        function animate() {
            camera.x += (camera.targetX - camera.x) * 0.18;
            camera.y += (camera.targetY - camera.y) * 0.18;
            camera.scale += (camera.targetScale - camera.scale) * 0.18;
            cameraEl.style.transform = `translate(-50%, -50%) translate(${camera.x}px, ${camera.y}px) scale(${camera.scale})`;
            if (Math.abs(camera.x - camera.targetX) > 0.5 || Math.abs(camera.y - camera.targetY) > 0.5 || Math.abs(camera.scale - camera.targetScale) > 0.001) {
                requestAnimationFrame(animate);
            } else {
                camera.x = camera.targetX;
                camera.y = camera.targetY;
                camera.scale = camera.targetScale;
                cameraEl.style.transform = `translate(-50%, -50%) translate(${camera.x}px, ${camera.y}px) scale(${camera.scale})`;
                animating = false;
            }
        }
        animate();
    } else {
        cameraEl.style.transform = `translate(-50%, -50%) translate(${camera.x}px, ${camera.y}px) scale(${camera.scale})`;
    }
}

function clampCamera() {
    const viewport = document.querySelector('.map-viewport');
    if (!viewport) return;
    const { width: mapWidth, height: mapHeight } = getMapSize();
    const vpWidth = viewport.clientWidth;
    const vpHeight = viewport.clientHeight;
    const scaledWidth = mapWidth * camera.targetScale;
    const scaledHeight = mapHeight * camera.targetScale;
    // Si el mapa es más pequeño que el viewport, centrar y bloquear movimiento
    const maxOffsetX = Math.max(0, (scaledWidth - vpWidth) / 2);
    const maxOffsetY = Math.max(0, (scaledHeight - vpHeight) / 2);
    camera.targetX = Math.max(-maxOffsetX, Math.min(maxOffsetX, camera.targetX));
    camera.targetY = Math.max(-maxOffsetY, Math.min(maxOffsetY, camera.targetY));
}

function centerCamera() {
    camera.x = 0;
    camera.y = 0;
    camera.targetX = 0;
    camera.targetY = 0;
    camera.scale = 1;
    camera.targetScale = 1;
}

function setupCameraControls() {
    const viewport = document.querySelector('.map-viewport');
    if (!viewport) return;
    // Zoom con rueda
    viewport.addEventListener('wheel', (e) => {
        if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            const prevScale = camera.targetScale;
            if (e.deltaY < 0) camera.targetScale *= 1.08;
            else camera.targetScale /= 1.08;
            camera.targetScale = Math.max(camera.minScale, Math.min(camera.maxScale, camera.targetScale));
            // Mantener el punto bajo el cursor respecto al centro
            const rect = viewport.getBoundingClientRect();
            const cx = e.clientX - rect.left - rect.width / 2;
            const cy = e.clientY - rect.top - rect.height / 2;
            camera.targetX = (camera.targetX - cx) * (camera.targetScale / prevScale) + cx;
            camera.targetY = (camera.targetY - cy) * (camera.targetScale / prevScale) + cy;
            clampCamera();
            updateCamera(true);
        }
    }, { passive: false });
    // Drag con mouse
    viewport.addEventListener('mousedown', (e) => {
        isDragging = true;
        lastMouse.x = e.clientX;
        lastMouse.y = e.clientY;
        viewport.style.cursor = 'grabbing';
    });
    window.addEventListener('mousemove', (e) => {
        if (isDragging) {
            camera.targetX += e.clientX - lastMouse.x;
            camera.targetY += e.clientY - lastMouse.y;
            lastMouse.x = e.clientX;
            lastMouse.y = e.clientY;
            clampCamera();
            updateCamera(true);
        }
    });
    window.addEventListener('mouseup', () => {
        isDragging = false;
        viewport.style.cursor = '';
    });
    // Touch para móvil
    let lastTouchDist = null;
    viewport.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
            lastTouchDist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
        } else if (e.touches.length === 1) {
            isDragging = true;
            lastMouse.x = e.touches[0].clientX;
            lastMouse.y = e.touches[0].clientY;
        }
    });
    viewport.addEventListener('touchmove', (e) => {
        if (e.touches.length === 2 && lastTouchDist !== null) {
            const dist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            const scaleChange = dist / lastTouchDist;
            camera.targetScale *= scaleChange;
            camera.targetScale = Math.max(camera.minScale, Math.min(camera.maxScale, camera.targetScale));
            lastTouchDist = dist;
            clampCamera();
            updateCamera(true);
        } else if (e.touches.length === 1 && isDragging) {
            camera.targetX += e.touches[0].clientX - lastMouse.x;
            camera.targetY += e.touches[0].clientY - lastMouse.y;
            lastMouse.x = e.touches[0].clientX;
            lastMouse.y = e.touches[0].clientY;
            clampCamera();
            updateCamera(true);
        }
    }, { passive: false });
    window.addEventListener('touchend', (e) => {
        if (e.touches.length < 2) lastTouchDist = null;
        if (e.touches.length === 0) isDragging = false;
        viewport.style.cursor = '';
    });
}

fetch('src/View/layouts/mainLayout.html')
    .then(res => res.text())
    .then(html => {
        document.getElementById('app').innerHTML = html;
        renderGrid();
        centerCamera();
        setupCameraControls();
        updateCamera();
    });

function renderGrid() {
    const map = document.getElementById('city-map');
    if (!map) return;
    map.innerHTML = '';
    const tileWidth = 80;
    const tileHeight = 40;
    const gridSize = 15;
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            const cell = document.createElement('div');
            cell.className = 'city-cell';
            cell.dataset.x = x;
            cell.dataset.y = y;
            // Proyección isométrica matemática
            const isoX = (x - y) * (tileWidth / 2) + (gridSize * tileWidth) / 2 - tileWidth / 2;
            const isoY = (x + y) * (tileHeight / 2);
            cell.style.left = isoX + 'px';
            cell.style.top = isoY + 'px';
            map.appendChild(cell);
        }
    }
}
