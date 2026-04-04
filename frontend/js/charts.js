// js/charts.js - Chart.js Configuration & Instances

function initCharts() {
    if (typeof Chart === 'undefined') return {};

    Chart.defaults.color = '#94a3b8';
    Chart.defaults.font.family = "'Inter', sans-serif";
    Chart.defaults.scale.grid.color = 'rgba(255,255,255,0.05)';

    const charts = {};

    // 1. Line Chart (Time Series)
    const ctxLine = document.getElementById('timeSeriesChart');
    if (ctxLine) {
        const labels = Array.from({length: 12}, (_, i) => new Date(Date.now() - (11 - i) * 60000).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}));
        const dataSafe = Array.from({length: 12}, () => Math.floor(Math.random() * 50) + 120);
        const dataFraud = Array.from({length: 12}, () => Math.floor(Math.random() * 8) + 2);

        charts.lineChart = new Chart(ctxLine.getContext('2d'), {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Safe TXN',
                        data: dataSafe,
                        borderColor: '#a855f7',
                        backgroundColor: 'rgba(168, 85, 247, 0.15)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 0
                    },
                    {
                        label: 'Suspicious',
                        data: dataFraud,
                        borderColor: '#06b6d4',
                        backgroundColor: 'rgba(6, 182, 212, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 2
                    }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { position: 'top', align: 'end', labels: { boxWidth: 10 } } },
                scales: { 
                    y: { beginAtZero: true }, 
                    x: { grid: { display: false } } 
                }
            }
        });
    }

    // 2. Pie Chart
    const ctxPie = document.getElementById('pieChart');
    if (ctxPie) {
        charts.pieChart = new Chart(ctxPie.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Genuine', 'High Risk', 'Blocked Fraud'],
                datasets: [{
                    data: [85, 10, 5],
                    backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                cutout: '75%',
                plugins: { legend: { position: 'right' } }
            }
        });
    }

    // 3. Bar Chart (Analytics - Monthly)
    const ctxBar = document.getElementById('monthlyFraudChart') || document.getElementById('barChart');
    if (ctxBar) {
        charts.barChart = new Chart(ctxBar.getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Fraud Attempts Blocked',
                    data: [1200, 1900, 1500, 2200, 1800, 2600],
                    backgroundColor: 'rgba(6, 182, 212, 0.8)',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { 
                    x: { grid: { display: false } },
                    y: { grid: { color: 'rgba(255,255,255,0.05)' } }
                }
            }
        });
    }

    // 4. Fraud vs Genuine (Pie)
    const ctxPieFG = document.getElementById('pieFraudGenuine');
    if (ctxPieFG) {
        charts.pieFG = new Chart(ctxPieFG.getContext('2d'), {
            type: 'pie',
            data: {
                labels: ['Genuine', 'Fraud'],
                datasets: [{
                    data: [80, 20],
                    backgroundColor: ['#10b981', '#f43f5e'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 20 } } }
            }
        });
    }

    // 5. Risk Distribution (Doughnut)
    const ctxRisk = document.getElementById('riskDistChart');
    if (ctxRisk) {
        charts.riskDist = new Chart(ctxRisk.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Low', 'Medium', 'High'],
                datasets: [{
                    data: [40, 35, 25],
                    backgroundColor: ['#10b981', '#f59e0b', '#f43f5e'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                cutout: '70%',
                plugins: { legend: { position: 'right', labels: { boxWidth: 10 } } }
            }
        });
    }

    // 6. Location Analysis (Horizontal Bar)
    const ctxLoc = document.getElementById('locationBarChart');
    if (ctxLoc) {
        charts.location = new Chart(ctxLoc.getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['Delhi', 'Mumbai', 'USA', 'Bangalore', 'London'],
                datasets: [{
                    label: 'Fraud Incidence',
                    data: [65, 45, 85, 30, 25],
                    backgroundColor: '#6366f1',
                    borderRadius: 5
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { 
                    x: { grid: { display: false }, ticks: { display: false } },
                    y: { grid: { display: false } }
                }
            }
        });
    }

    // 7. Time of Day (Doughnut)
    const ctxTime = document.getElementById('timeAnalysisChart');
    if (ctxTime) {
        charts.timeAnalysis = new Chart(ctxTime.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Night (10PM-6AM)', 'Day (6AM-10PM)'],
                datasets: [{
                    data: [60, 40],
                    backgroundColor: ['#1e1b4b', '#fde047'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                cutout: '60%',
                plugins: { legend: { position: 'bottom' } }
            }
        });
    }

    return charts;
}

window.charts = {
    initCharts
};
