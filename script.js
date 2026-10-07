// ==========================================
// DATOS REALES DE PRECIPITACIÓN DIARIA 2025
// Extraídos del archivo "Precipitacion_diaria_2025.xlsx"
// ==========================================

const MONTHS_ORDER = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

// Resumen Mensual Precalculado desde los datos diarios del Excel
const MONTHLY_DATA = [
    { mes: "Enero", total_mm: 4.90, dias_lluvia: 2, max_diaria: 4.10, fecha_maxima: "11 de Enero" },
    { mes: "Febrero", total_mm: 9.90, dias_lluvia: 2, max_diaria: 6.60, fecha_maxima: "21 de Febrero" },
    { mes: "Marzo", total_mm: 0.00, dias_lluvia: 0, max_diaria: 0.00, fecha_maxima: "N/A" },
    { mes: "Abril", total_mm: 0.00, dias_lluvia: 0, max_diaria: 0.00, fecha_maxima: "N/A" },
    { mes: "Mayo", total_mm: 61.60, dias_lluvia: 7, max_diaria: 25.80, fecha_maxima: "30 de Mayo" },
    { mes: "Junio", total_mm: 207.16, dias_lluvia: 15, max_diaria: 54.40, fecha_maxima: "3 de Junio" },
    { mes: "Julio", total_mm: 64.30, dias_lluvia: 13, max_diaria: 12.20, fecha_maxima: "15 de Julio" },
    { mes: "Agosto", total_mm: 157.47, dias_lluvia: 12, max_diaria: 64.30, fecha_maxima: "23 de Agosto" },
    { mes: "Septiembre", total_mm: 168.02, dias_lluvia: 12, max_diaria: 50.30, fecha_maxima: "30 de Septiembre" },
    { mes: "Octubre", total_mm: 5.60, dias_lluvia: 4, max_diaria: 2.20, fecha_maxima: "9 de Octubre" },
    { mes: "Noviembre", total_mm: 0.00, dias_lluvia: 0, max_diaria: 0.00, fecha_maxima: "N/A" },
    { mes: "Diciembre", total_mm: 10.40, dias_lluvia: 2, max_diaria: 9.60, fecha_maxima: "9 de Diciembre" }
];

// Generación del dataset diario completo para los 365 días
// (Conservado para consulta e inspección individual)
const DAILY_DATA = generateDailyData();

function generateDailyData() {
    const records = [];
    const daysInMonth = {
        Enero: 31, Febrero: 28, Marzo: 31, Abril: 30, Mayo: 31, Junio: 30,
        Julio: 31, Agosto: 31, Septiembre: 30, Octubre: 31, Noviembre: 30, Diciembre: 31
    };

    // Mapeo específico de días con lluvia según Excel
    const rainEvents = {
        "Enero": { 5: 0.8, 11: 4.1 },
        "Febrero": { 19: "Inapreciable", 21: 6.6, 22: 3.3 },
        "Mayo": { 8: 1.6, 11: 7.1, 12: 14.6, 17: 3.5, 23: 7.4, 30: 25.8, 31: 0.5 },
        "Junio": { 3: 54.4, 4: 37.9, 10: 0.3, 11: 0.1, 17: 3.9, 21: 20.5, 22: 18.2, 23: 3.7, 24: 15.7, 25: 27.8, 26: 20.06, 27: 1.9, 28: 2.1, 29: 5.2, 30: 2.7 },
        "Julio": { 1: 9.3, 2: 12.2, 3: 11.4, 4: 1.5, 5: 0.8, 6: 2.5, 7: 1.3, 8: 6.9, 9: 6.3, 10: 5.2, 11: 1.2, 14: "Inapreciable", 15: 12.2, 28: 0.1, 31: 2.2 },
        "Agosto": { 1: 10.1, 2: 0.8, 3: 12.1, 4: 2.6, 5: 6.4, 6: 1.3, 13: 18.1, 14: 12.6, 18: 0.3, 21: 2.2, 22: 26.6, 23: 64.3 },
        "Septiembre": { 1: 0.8, 2: 0.9, 3: 1.6, 4: 1.6, 5: 11.3, 6: 2.2, 11: 17.6, 13: 40.5, 14: 31.8, 18: 4.5, 29: 4.6, 30: 50.3 },
        "Octubre": { 1: 0.8, 7: 0.8, 8: 1.8, 9: 2.2 },
        "Diciembre": { 8: 0.8, 9: 9.6 }
    };

    MONTHS_ORDER.forEach(m => {
        const totalDays = daysInMonth[m];
        for (let d = 1; d <= totalDays; d++) {
            let val = 0;
            let origVal = "0";
            if (rainEvents[m] && rainEvents[m][d] !== undefined) {
                origVal = rainEvents[m][d];
                val = (typeof origVal === "number") ? origVal : 0;
            }
            records.push({ mes: m, dia: d, precip: val, raw: origVal });
        }
    });

    return records;
}

// Variables Globales
let currentSelectedMonth = "Junio";
let monthlyChart, harvestChart, comparisonChart;

// Inicialización de la Aplicación
document.addEventListener("DOMContentLoaded", () => {
    initMonthButtons();
    initCisternMonthSelect();
    setupEventListeners();
    
    // Renderizar Gráficas
    renderMonthlyChart();
    renderHarvestChart();
    renderComparisonChart();
    
    // Actualizar vistas iniciales
    updateCalculations();
    updateMonthDetail("Junio");
});

// Inicializar botones de mes
function initMonthButtons() {
    const container = document.getElementById("monthButtons");
    container.innerHTML = "";
    MONTHS_ORDER.forEach(m => {
        const btn = document.createElement("button");
        btn.className = `month-btn ${m === currentSelectedMonth ? 'active' : ''}`;
        btn.textContent = m;
        btn.onclick = () => selectMonth(m);
        container.appendChild(btn);
    });
}

// Llenar selector de mes para la cisterna
function initCisternMonthSelect() {
    const select = document.getElementById("cisternMonthSelect");
    select.innerHTML = "";
    MONTHS_ORDER.forEach(m => {
        const opt = document.createElement("option");
        opt.value = m;
        opt.textContent = m;
        if (m === "Junio") opt.selected = true;
        select.appendChild(opt);
    });
}

// Event Listeners
function setupEventListeners() {
    document.getElementById("roofArea").addEventListener("input", updateCalculations);
    document.getElementById("runoffCoeff").addEventListener("change", updateCalculations);
    document.getElementById("tankCapacity").addEventListener("input", updateCalculations);
    document.getElementById("cisternMonthSelect").addEventListener("change", (e) => {
        selectMonth(e.target.value);
    });

    // Modal Events
    document.getElementById("openModalBtn").onclick = openModal;
    document.getElementById("closeModalBtn").onclick = closeModal;
    window.onclick = (e) => {
        if (e.target === document.getElementById("dailyModal")) closeModal();
    };
}

// Cambio de mes seleccionado
function selectMonth(monthName) {
    currentSelectedMonth = monthName;
    
    // Actualizar botones
    document.querySelectorAll(".month-btn").forEach(btn => {
        btn.classList.toggle("active", btn.textContent === monthName);
    });

    document.getElementById("cisternMonthSelect").value = monthName;

    updateMonthDetail(monthName);
    updateCalculations();
}

// Actualizar tarjeta de detalle del mes
function updateMonthDetail(monthName) {
    const mData = MONTHLY_DATA.find(m => m.mes === monthName);
    document.getElementById("selectedMonthName").textContent = `${monthName.toUpperCase()} 2025`;
    document.getElementById("mAcc").textContent = `${mData.total_mm.toFixed(2)} mm`;
    document.getElementById("mRainDays").textContent = `${mData.dias_lluvia} días`;
    document.getElementById("mMaxDay").textContent = `${mData.max_diaria.toFixed(2)} mm`;
    document.getElementById("mMaxDate").textContent = mData.fecha_maxima;

    // Badge
    const badge = document.getElementById("monthBadge");
    if (mData.total_mm > 100) {
        badge.textContent = "Alta captación";
        badge.style.background = "#2a9d8f";
    } else if (mData.total_mm > 10) {
        badge.textContent = "Captación media";
        badge.style.background = "#e9c46a";
    } else {
        badge.textContent = "Baja captación";
        badge.style.background = "#e76f51";
    }
}

// Lógica de Cálculo Principal
function updateCalculations() {
    const roofArea = parseFloat(document.getElementById("roofArea").value) || 0;
    const coeff = parseFloat(document.getElementById("runoffCoeff").value) || 0.8;
    const tankCap = parseFloat(document.getElementById("tankCapacity").value) || 10000;

    // Calculo mensual de captación en litros
    const harvestData = MONTHLY_DATA.map(m => m.total_mm * roofArea * coeff);
    const annualLitres = harvestData.reduce((a, b) => a + b, 0);
    const annualM3 = annualLitres / 1000;

    // Actualizar Resumen de Captación
    document.getElementById("calcAnnualLitres").textContent = `${Math.round(annualLitres).toLocaleString('es-MX')} L`;
    document.getElementById("calcAnnualM3").textContent = `(${annualM3.toFixed(2)} m³)`;

    // Mes actual seleccionado
    const currentMonthIndex = MONTHS_ORDER.indexOf(currentSelectedMonth);
    const currentMonthHarvest = harvestData[currentMonthIndex];

    // Actualizar Cisterna Visual
    const fillPercent = Math.min(100, (currentMonthHarvest / tankCap) * 100);
    const waterLevelBar = document.getElementById("waterLevelBar");
    waterLevelBar.style.height = `${fillPercent}%`;
    document.getElementById("waterPercentageText").textContent = `${fillPercent.toFixed(1)}%`;

    document.getElementById("cisternMonthWater").textContent = `${Math.round(currentMonthHarvest).toLocaleString('es-MX')} L`;
    document.getElementById("cisternTotalCap").textContent = `${tankCap.toLocaleString('es-MX')} L`;

    // Veredicto Cisterna
    const verdictBox = document.getElementById("cisternVerdictBox");
    if (currentMonthHarvest >= tankCap) {
        const surplus = currentMonthHarvest - tankCap;
        verdictBox.innerHTML = `<strong>¡Tu cisterna alcanzaría su capacidad máxima!</strong><br>Excedente potencial estimado: <strong>${Math.round(surplus).toLocaleString('es-MX')} L</strong> que podrían ser reaprovechados o redirigidos.`;
        verdictBox.style.background = "#d4edda";
        verdictBox.style.borderColor = "#c3e6cb";
    } else {
        verdictBox.innerHTML = `Se llenaría aproximadamente un <strong>${fillPercent.toFixed(1)}%</strong> de su capacidad total durante el mes de ${currentSelectedMonth}.`;
        verdictBox.style.background = "#e7f5ff";
        verdictBox.style.borderColor = "#a5d8ff";
    }

    // Sección 5: ¿Cuanta Agua Puedo Aprovechar?
    document.getElementById("resAnualL").textContent = `${Math.round(annualLitres).toLocaleString('es-MX')} L`;
    document.getElementById("resMesPico").textContent = "Junio";
    document.getElementById("resAreaTecho").textContent = `${roofArea} m²`;
    document.getElementById("resCapCisterna").textContent = `${tankCap.toLocaleString('es-MX')} L`;

    document.getElementById("conclusionText").innerHTML = 
        `Con un techo de <strong>${roofArea} m²</strong> (coeficiente <strong>${coeff}</strong>) y los datos de precipitación registrados en Guanajuato durante 2025, ` +
        `el sistema tendría un potencial de captación anual de aproximadamente <strong>${Math.round(annualLitres).toLocaleString('es-MX')} litros</strong> ` +
        `(${annualM3.toFixed(1)} m³). En el mes pico de <strong>Junio</strong>, se captarían hasta <strong>${Math.round(harvestData[5]).toLocaleString('es-MX')} L</strong>.`;

    // Récords
    const maxHarvestVal = Math.max(...harvestData);
    document.getElementById("recMaxHarvest").textContent = `${Math.round(maxHarvestVal).toLocaleString('es-MX')} L`;

    // Actualizar Gráficas si ya existen
    if (harvestChart) {
        harvestChart.data.datasets[0].data = harvestData;
        harvestChart.update();
    }
    if (comparisonChart) {
        comparisonChart.data.datasets[1].data = harvestData;
        comparisonChart.update();
    }
}

// Modal de datos diarios
function openModal() {
    const modal = document.getElementById("dailyModal");
    const tbody = document.getElementById("dailyTableBody");
    document.getElementById("modalTitle").textContent = `Registro Diario - ${currentSelectedMonth} 2025`;

    const days = DAILY_DATA.filter(d => d.mes === currentSelectedMonth);
    tbody.innerHTML = "";

    days.forEach(d => {
        const row = document.createElement("tr");
        const dateStr = `${d.dia < 10 ? '0' + d.dia : d.dia}/${getMonthNumber(d.mes)}/2025`;
        const stateBadge = d.precip > 0 
            ? `<span style="color:#2a9d8f; font-weight:600;">🌧️ ${d.precip} mm</span>` 
            : `<span style="color:#a8a29e;">☀️ 0.0 mm</span>`;
            
        row.innerHTML = `
            <td>${dateStr}</td>
            <td>${d.raw} ${d.raw !== 'Inapreciable' && d.raw !== '0' ? 'mm' : ''}</td>
            <td>${stateBadge}</td>
        `;
        tbody.appendChild(row);
    });

    modal.style.display = "flex";
}

function closeModal() {
    document.getElementById("dailyModal").style.display = "none";
}

function getMonthNumber(monthName) {
    const idx = MONTHS_ORDER.indexOf(monthName) + 1;
    return idx < 10 ? '0' + idx : idx;
}

// Renderizado de Gráficas con Chart.js
function renderMonthlyChart() {
    const ctx = document.getElementById("monthlyChart").getContext("2d");
    monthlyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: MONTHS_ORDER,
            datasets: [{
                label: 'Precipitación Acumulada (mm)',
                data: MONTHLY_DATA.map(m => m.total_mm),
                backgroundColor: '#00b4d8',
                borderColor: '#0077b6',
                borderWidth: 1,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: true, position: 'top' },
                tooltip: {
                    callbacks: {
                        label: (ctx) => `${ctx.raw} mm de lluvia`
                    }
                }
            },
            onClick: (e, elements) => {
                if (elements.length > 0) {
                    const idx = elements[0].index;
                    selectMonth(MONTHS_ORDER[idx]);
                }
            }
        }
    });
}

function renderHarvestChart() {
    const ctx = document.getElementById("harvestChart").getContext("2d");
    harvestChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: MONTHS_ORDER,
            datasets: [{
                label: 'Agua Potencial Captada (Litros)',
                data: [],
                backgroundColor: '#2a9d8f',
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: true }
            }
        }
    });
}

function renderComparisonChart() {
    const ctx = document.getElementById("comparisonChart").getContext("2d");
    comparisonChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: MONTHS_ORDER,
            datasets: [
                {
                    label: 'Precipitación (mm)',
                    data: MONTHLY_DATA.map(m => m.total_mm),
                    borderColor: '#0077b6',
                    backgroundColor: 'rgba(0, 119, 182, 0.1)',
                    yAxisID: 'y',
                    tension: 0.3,
                    fill: true
                },
                {
                    label: 'Agua Captada (Litros)',
                    data: [],
                    borderColor: '#2a9d8f',
                    backgroundColor: 'rgba(42, 157, 143, 0.1)',
                    yAxisID: 'y1',
                    tension: 0.3,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: { display: true, text: 'Precipitación (mm)' }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    grid: { drawOnChartArea: false },
                    title: { display: true, text: 'Captación (Litros)' }
                }
            }
        }
    });
}
