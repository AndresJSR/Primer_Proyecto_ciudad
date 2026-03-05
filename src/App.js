// Quitar el import para compatibilidad con navegador
// import './Business/Controllers/ConstructionMenuController.js';

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

// CONFIGURACIÓN GLOBAL
const tileWidth = 80;
const tileHeight = 40;
const gridSize = 15;

// CÁLCULO REAL DEL MAPA ISOMÉTRICO
function getMapSize() {
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

            cameraEl.style.transform =
                `translate(-50%, -50%) translate(${camera.x}px, ${camera.y}px) scale(${camera.scale})`;

            if (
                Math.abs(camera.x - camera.targetX) > 0.5 ||
                Math.abs(camera.y - camera.targetY) > 0.5 ||
                Math.abs(camera.scale - camera.targetScale) > 0.001
            ) {
                requestAnimationFrame(animate);
            } else {
                camera.x = camera.targetX;
                camera.y = camera.targetY;
                camera.scale = camera.targetScale;
                cameraEl.style.transform =
                    `translate(-50%, -50%) translate(${camera.x}px, ${camera.y}px) scale(${camera.scale})`;
                animating = false;
            }
        }

        animate();
    } else {
        cameraEl.style.transform =
            `translate(-50%, -50%) translate(${camera.x}px, ${camera.y}px) scale(${camera.scale})`;
    }
}

function clampCamera() {
    const viewport = document.querySelector('.map-viewport');
    if (!viewport) return;

    const { width: mapWidth, height: mapHeight } = getMapSize();

    const viewportWidth = viewport.clientWidth;
    const viewportHeight = viewport.clientHeight;

    const scaledMapWidth = mapWidth * camera.targetScale;
    const scaledMapHeight = mapHeight * camera.targetScale;

    const maxX = (scaledMapWidth - viewportWidth) / 2;
    const maxY = (scaledMapHeight - viewportHeight) / 2;

    camera.targetX = Math.max(-maxX, Math.min(maxX, camera.targetX));
    camera.targetY = Math.max(-maxY, Math.min(maxY, camera.targetY));
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

    // ZOOM
    viewport.addEventListener('wheel', (e) => {
        if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();

            const prevScale = camera.targetScale;

            if (e.deltaY < 0) camera.targetScale *= 1.08;
            else camera.targetScale /= 1.08;

            camera.targetScale = Math.max(
                camera.minScale,
                Math.min(camera.maxScale, camera.targetScale)
            );

            const rect = viewport.getBoundingClientRect();
            const cx = e.clientX - rect.left - rect.width / 2;
            const cy = e.clientY - rect.top - rect.height / 2;

            camera.targetX = (camera.targetX - cx) * (camera.targetScale / prevScale) + cx;
            camera.targetY = (camera.targetY - cy) * (camera.targetScale / prevScale) + cy;

            clampCamera();
            updateCamera(true);
        }
    }, { passive: false });

    // DRAG
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
}

fetch('src/View/layouts/cityBuilderLayout.html')
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

    const mapWidth = (gridSize + gridSize) * (tileWidth / 2);
    const mapHeight = (gridSize + gridSize) * (tileHeight / 2);

    map.style.width = mapWidth + "px";
    map.style.height = mapHeight + "px";

    const centerX = mapWidth / 2;

    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {

            const cell = document.createElement('div');
            cell.className = 'city-cell';
            cell.dataset.x = x;
            cell.dataset.y = y;

            const isoX = (x - y) * (tileWidth / 2);
            const isoY = (x + y) * (tileHeight / 2);

            cell.style.left = (isoX + centerX - tileWidth / 2) + 'px';
            cell.style.top = isoY + 'px';

            map.appendChild(cell);
        }
    }
}