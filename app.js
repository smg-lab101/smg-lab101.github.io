let tempCtx, ndviCtx, precipCtx; // oben global

function init() {
    // DOM-Elements
    const tempCanvas = document.getElementById('tempCanvas');
    const ndviCanvas = document.getElementById('ndviCanvas');
    const precipCanvas = document.getElementById('precipCanvas');

    // Contexts 
    tempCtx = tempCanvas.getContext('2d');
    ndviCtx = ndviCanvas.getContext('2d');
    precipCtx = precipCanvas.getContext('2d');

    // Setup
    setupCanvasInteraction(tempCanvas, tempCtx, 'temp');
    setupCanvasInteraction(ndviCanvas, ndviCtx, 'ndvi');
    setupCanvasInteraction(precipCanvas, precipCtx, 'precip');

    setUpSlider();

    // Bootstrap Tooltips
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltipTriggerList.forEach(el => new bootstrap.Tooltip(el));
}

document.addEventListener("DOMContentLoaded", init);

//Global Configs
const config = {
    width: 360,
    height: 300,
    fieldMap: {
        temp: { field: 'air_temperature_2m', roll: 'air_temperature_2m_roll', label: 'Temperatur', color: d3.scaleLinear().domain([-10, 15, 40]).range(["#371144", "#d64b57", "#fde9ab"]) },
        ndvi: { field: 'ndvi', roll: 'ndvi_roll', label: 'NDVI', color: d3.scaleLinear().domain([0, 1]).range(['#d9f0a3', '#004529']) },
        precip: { field: 'precipitation_era5', roll: 'precipitation_era5_roll', label: 'Niederschlag', color: d3.scaleLinear().domain([0, 10]).range(['#f7fbff', '#08306b']) }
    }
};

const EUROPE_LON = [-12.0, 30.0];
const EUROPE_LAT = [34.0, 62.0];

// Determine center according to map
const centerLon = (EUROPE_LON[0] + EUROPE_LON[1]) / 2; // 9.0
const centerLat = (EUROPE_LAT[0] + EUROPE_LAT[1]) / 2; // 48.0

const baseScale = 500;
const projection = d3.geoMercator()
    .center([centerLon, centerLat])
    .scale(baseScale)
    .translate([config.width / 2, config.height / 2]);

const times = [];
for (let year = 2000; year <= 2021; year++) {
    for (let month = 0; month < 12; month++) {
        const ym = `${year}-${String(month + 1).padStart(2, '0')}`;
        if (ym >= '2000-03' && ym <= '2021-12') {
            times.push(ym);
        }
    }
}

function getCurrentYearMonth() {
    return document.getElementById("sliderLabel").textContent;
}

function createSliderTicks(times, container) {
    container.innerHTML = "";
    const usedPercents = new Set();
    for (let year = 2000; year <= 2021; year++) {
        const index = times.findIndex(t => t.startsWith(`${year}-01`));
        if (index === -1) continue;
        const percent = Math.round((index / (times.length - 1)) * 100);
        if (usedPercents.has(percent)) continue;
        usedPercents.add(percent);

        const marker = document.createElement("div");
        marker.className = "tick-marker";
        marker.style.left = `${percent}%`;
        container.appendChild(marker);

        const label = document.createElement("div");
        label.className = "tick-label";
        label.textContent = year;
        label.style.left = `${percent}%`;
        container.appendChild(label);
    }
}

function drawPoints(ctx, data, colorFn) {
    const POINT_RADIUS = 4;

    ctx.clearRect(0, 0, config.width, config.height);
    data.forEach(d => {
        const [x, y] = projection([d.lon, d.lat]);
        ctx.beginPath();
        ctx.arc(x, y, POINT_RADIUS, 0, 2 * Math.PI);
        ctx.fillStyle = colorFn(d);
        ctx.fill();
    });
}

function setUpSlider() {
    const slider = d3.select("#timeSlider").attr("max", times.length - 1);
    slider.on('input', function () { update(+this.value); });
    createSliderTicks(times, document.getElementById("sliderTicks"));

    const start = times.indexOf('2000-03');
    slider.property('value', start);
    update(start);
}

function setupCanvasInteraction(canvas, ctx, configKey) {
    setupTooltipInteraction(canvas, configKey);
    setupZoomInteraction(canvas);
}

function setupTooltipInteraction(canvas, configKey) {
    const { color } = config.fieldMap[configKey];

    canvas.addEventListener('mousemove', ev => {
        const rect = canvas.getBoundingClientRect();
        const mx = ev.clientX - rect.left, my = ev.clientY - rect.top;

        const found = lastData.find(d => {
            const [x, y] = projection([d.lon, d.lat]);
            return Math.hypot(x - mx, y - my) < 3;
        });

        if (found) {
            showAllTooltips(ev, found);
        } else {
            hideAllTooltips();
        }
    });

    canvas.addEventListener('mouseleave', hideAllTooltips);
}

function setupZoomInteraction(canvas) {
    d3.select(canvas).call(
        d3.zoom()
            .scaleExtent([1, 6])
            .on("zoom", ({ transform }) => {
                const k = transform.k;

                const panPaddingFactor = .95;
                const maxPanX = (config.width * (k - 1)) / 2 * panPaddingFactor;
                const maxPanY = (config.height * (k - 1)) / 2 * panPaddingFactor;

                const clampedX = Math.max(-maxPanX, Math.min(maxPanX, transform.x));
                const clampedY = Math.max(-maxPanY, Math.min(maxPanY, transform.y));

                projection
                    .scale(baseScale * k)
                    .translate([
                        config.width / 2 + clampedX,
                        config.height / 2 + clampedY
                    ]);

                renderAll();
            })
    );
}

function renderAll() {
    drawPoints(tempCtx, lastData, d => config.fieldMap.temp.color(d[config.fieldMap.temp.field]));
    drawPoints(ndviCtx, lastData, d => config.fieldMap.ndvi.color(d[config.fieldMap.ndvi.field]));
    drawPoints(precipCtx, lastData, d => config.fieldMap.precip.color(d[config.fieldMap.precip.field]));
    updateStats();
}

function updateStats() {
    const visible = lastData.filter(d => {
        const [x, y] = projection([d.lon, d.lat]);
        return x >= 0 && x <= config.width && y >= 0 && y <= config.height;
    });

    const rolling = getCurrentYearMonth() >= "2005-03";
    const f = v => v != null ? v.toFixed(2) : '--';
    const fd = v => v != null ? (v > 0 ? '+' : '') + v.toFixed(2) : '--';

    Object.entries(config.fieldMap).forEach(([key, { field, roll }]) => {
        const val = d3.mean(visible.map(d => d[field]).filter(v => v != null));
        const r = rolling ? d3.mean(visible.map(d => d[roll]).filter(v => v != null)) : null;
        const delta = (rolling && val != null && r != null) ? val - r : null;

        d3.select(`#stat-${key}`).html(`
                        <table class="table table-sm table-borderless mb-0">
                            <tbody>
                                <tr><td class="text-end">Ø Aktuell:</td><td class="text-start">${f(val)}</td></tr>
                                <tr><td class="text-end">Ø 5 Jahre:</td><td class="text-start">${f(r)}</td></tr>
                                <tr><td class="text-end">Δ:</td><td class="text-start">${fd(delta)}</td></tr>
                            </tbody>
                        </table>
                    `);
    });
}

function update(idx) {
    const time = times[idx];

    document.getElementById("sliderLabel").textContent = time;
    const percent = idx / (times.length - 1);
    const trackWidth = document.getElementById("timeSlider").getBoundingClientRect().width;
    document.getElementById("sliderLabel").style.left = `${percent * trackWidth}px`;

    d3.json(`big_test_monthly_json_with_roll_fix/${time}.json`).then(data => {
        lastData = data;
        renderAll();
    });
}

function showAllTooltips(ev, point) {
    const fields = ['temp', 'ndvi', 'precip'];

    fields.forEach(key => {
        const tooltip = d3.select(`#tooltip-${key}`);
        const cfg = config.fieldMap[key];
        const value = point[cfg.field] != null ? point[cfg.field].toFixed(2) : '--';
        const roll = point[cfg.roll] != null ? point[cfg.roll].toFixed(2) : '--';
        const delta = (value !== '--' && roll !== '--') ? ((value - roll).toFixed(2)) : '--';
        const deltaText = delta !== '--' ? (delta > 0 ? '+' : '') + delta : '--';

        const html = `
            <strong>${cfg.label}</strong><br>
            Lat: ${point.lat.toFixed(2)}<br>
            Lon: ${point.lon.toFixed(2)}<br>
            Wert: ${value}<br>
            Ø 5 Jahre: ${roll}<br>
            Δ: ${deltaText}
        `;

        const [px, py] = projection([point.lon, point.lat]);
        const canvas = document.getElementById(`${key}Canvas`);
        const canvasRect = canvas.getBoundingClientRect();

        tooltip
            .html(html)
            .style('left', `${canvasRect.left + px + window.scrollX + 10}px`)
            .style('top', `${canvasRect.top + py + window.scrollY - 30}px`)
            .classed('show', true);
    });
}

function hideAllTooltips() {
    ['temp', 'ndvi', 'precip'].forEach(key => {
        d3.select(`#tooltip-${key}`).classed('show', false);
    });
}