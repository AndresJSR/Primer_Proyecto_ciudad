// Renderiza el layout y el grid dinámico 15x15 en el mapa central

fetch('src/View/layouts/mainLayout.html')
    .then(res => res.text())
    .then(html => {
        document.getElementById('app').innerHTML = html;
        renderGrid();
    });

function renderGrid() {
    const map = document.getElementById('city-map');
    if (!map) return;
    map.innerHTML = '';
    const tileWidth = 80;
    const tileHeight = 40;
    for (let y = 0; y < 15; y++) {
        for (let x = 0; x < 15; x++) {
            const cell = document.createElement('div');
            cell.className = 'city-cell';
            cell.dataset.x = x;
            cell.dataset.y = y;
            // Proyección isométrica matemática
            const isoX = (x - y) * (tileWidth / 2) + 300; // 300 = mitad del mapa para centrar
            const isoY = (x + y) * (tileHeight / 2);
            cell.style.left = isoX + 'px';
            cell.style.top = isoY + 'px';
            map.appendChild(cell);
        }
    }
}
