// js/dashboard.js - Mock data generators & Live statistical updates

const alertTypes = [
    { title: "Velocity Exceeded", loc: "Mumbai, IN", amt: "₹94,500", crit: true },
    { title: "IP Proxy Detected", loc: "Delhi, IN", amt: "₹3,200", crit: false },
    { title: "Unusual Merchant Match", loc: "Pune, IN", amt: "₹1,45,000", crit: true },
    { title: "Failed 3DS Verification", loc: "Bangalore, IN", amt: "₹8,500", crit: false }
];

function addAlert() {
    const alertsBox = document.getElementById('alerts-box');
    if(!alertsBox) return;
    const al = alertTypes[Math.floor(Math.random() * alertTypes.length)];
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second:'2-digit' });

    const div = document.createElement('div');
    div.className = `alert-item ${al.crit ? 'critical' : ''}`;
    div.innerHTML = `
        <div class="alert-item-header">
            <span>${time} • ${al.loc}</span>
            <span class="${al.crit ? 'text-danger' : 'text-warning'}">${al.amt}</span>
        </div>
        <div class="alert-title">${al.title}</div>
    `;
    alertsBox.prepend(div);
    if (alertsBox.children.length > 8) alertsBox.removeChild(alertsBox.lastChild);
}

function addTxn() {
    const txnTable = document.querySelector('#live-txn-table tbody');
    if(!txnTable) return;
    const id = "TXN-" + Math.floor(Math.random() * 90000 + 10000);
    const amt = (Math.random() * 45000 + 500).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const locs = ['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Kolkata', 'Chennai', 'Hyderabad'];
    const loc = locs[Math.floor(Math.random()*locs.length)];
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second:'2-digit' });
    
    const isFraud = Math.random() > 0.85;
    const statusClass = isFraud ? 'badge-danger' : 'badge-success';
    const statusText = isFraud ? 'BLOCKED' : 'CLEARED';

    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td><code class="text-xs text-secondary">${id}</code></td>
        <td class="font-mono text-primary">₹${amt}</td>
        <td class="text-xs">${loc}</td>
        <td class="text-xs text-secondary">${time}</td>
        <td><span class="badge ${statusClass}">${statusText}</span></td>
    `;

    txnTable.prepend(tr);
    if(txnTable.children.length > 5) txnTable.removeChild(txnTable.lastChild);
}

function initDashboard(charts) {
    // Initial data
    for(let i=0; i<4; i++) addAlert();
    for(let i=0; i<5; i++) addTxn();

    // Stats
    const totalTxnEl = document.querySelectorAll('.m-value')[0];
    const fraudAmtEl = document.querySelectorAll('.m-value')[1];
    let txnTotal = 3824901;
    let fraudTotal = 1245000;

    // Loop Interval
    setInterval(() => {
        // Increment Live Stats smoothly
        if(totalTxnEl) {
            txnTotal += Math.floor(Math.random() * 8) + 1;
            const valNum = totalTxnEl.querySelector('.val-num');
            if (valNum) valNum.innerText = txnTotal.toLocaleString('en-IN');
        }
        if(fraudAmtEl) {
            fraudTotal += Math.floor(Math.random() * 5);
            const valNum = fraudAmtEl.querySelector('.val-num');
            if (valNum) valNum.innerText = fraudTotal.toLocaleString('en-IN');
        }

        // Line chart update
        if (charts.lineChart && document.getElementById('view-dashboard').classList.contains('active-view')) {
            const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            charts.lineChart.data.labels.push(time);
            charts.lineChart.data.labels.shift();

            charts.lineChart.data.datasets[0].data.push(Math.floor(Math.random() * 50) + 120);
            charts.lineChart.data.datasets[0].data.shift();

            const isSpike = Math.random() > 0.8;
            charts.lineChart.data.datasets[1].data.push(isSpike ? Math.floor(Math.random() * 30) + 15 : Math.floor(Math.random() * 5));
            charts.lineChart.data.datasets[1].data.shift();
            charts.lineChart.update('none');

            // Gauge Update
            const rGauge = document.getElementById('risk-gauge');
            const rVal = document.getElementById('risk-val');
            const gText = document.getElementById('global-risk-text');
            const score = isSpike ? Math.floor(Math.random() * 20) + 75 : Math.floor(Math.random() * 15) + 8;
            
            if(rGauge && rVal) {
                const degrees = (score / 100) * 180;
                rGauge.style.transform = `rotate(${degrees}deg)`;
                rVal.innerText = `${score}%`;
                
                // Dynamic Risk Coloring
                rGauge.classList.remove('high-risk', 'low-risk', 'med-risk');
                if (score >= 70) {
                    rGauge.classList.add('high-risk');
                    rVal.style.color = "#ef4444";
                    rGauge.style.borderColor = "#ef4444";
                    rGauge.style.boxShadow = "0 0 20px rgba(239, 68, 68, 0.4)";
                } else if (score >= 30) {
                    rGauge.classList.add('med-risk');
                    rVal.style.color = "#f59e0b";
                    rGauge.style.borderColor = "#f59e0b";
                    rGauge.style.boxShadow = "none";
                } else {
                    rGauge.classList.add('low-risk');
                    rVal.style.color = "#10b981";
                    rGauge.style.borderColor = "#10b981";
                    rGauge.style.boxShadow = "none";
                }

                if(gText) {
                    gText.innerText = score+"%";
                    gText.style.color = score >= 70 ? "#ef4444" : (score >= 30 ? "#f59e0b" : "#10b981");
                }
            }

            if(Math.random() > 0.6) addTxn();
            if(Math.random() > 0.7) addAlert();
        }
    }, 2500);
}

window.dashboard = {
    initDashboard,
    addTxn,
    addAlert
};
