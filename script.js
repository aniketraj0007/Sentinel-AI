document.addEventListener("DOMContentLoaded", () => {

    // Initialize Icons
    lucide.createIcons();

    // ==========================================
    // SIDEBAR TOGGLE
    // ==========================================
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    let isSidebarOpen = true;

    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            isSidebarOpen = !isSidebarOpen;
            if (isSidebarOpen) {
                sidebar.classList.remove('closed');
            } else {
                sidebar.classList.add('closed');
            }
        });
    }

    // Elements
    const authModal = document.getElementById('auth-modal');
    const appScreen = document.getElementById('app-screen');
    const authForm = document.getElementById('auth-form');
    
    // Buttons
    const logoutBtn = document.getElementById('btn-logout');
    const loginDropBtn = document.getElementById('btn-login-drop');
    const guestBtn = document.getElementById('btn-guest');
    const closeBtn = document.getElementById('btn-close-modal');
    
    const settingsBtns = document.querySelectorAll('.action-settings');

    const tabLogin = document.getElementById('tab-login');
    const tabSignup = document.getElementById('tab-signup');
    const fieldName = document.querySelector('.field-name');
    const authTitle = document.getElementById('auth-title');
    const authSubtitle = document.getElementById('auth-subtitle');
    const authBtnText = document.getElementById('auth-btn-text');
    const authAlert = document.getElementById('auth-alert');
    const fieldPwd = document.getElementById('field-pwd');

    let isLoginMode = true;
    let isAuthenticated = false; // Tracks if user is actually logged in, or just guest

    // --- Modal Logic ---
    function openModal() {
        authModal.classList.remove('hidden');
        appScreen.classList.add('blurred');
        setTimeout(() => { authModal.style.opacity = '1'; }, 10);
    }

    function closeModal() {
        authModal.style.opacity = '0';
        appScreen.classList.remove('blurred');
        setTimeout(() => { authModal.classList.add('hidden'); }, 300);
    }

    guestBtn.addEventListener('click', () => {
        closeModal();
    });

    closeBtn.addEventListener('click', () => {
        closeModal();
    });

    settingsBtns.forEach(btn => btn.addEventListener('click', openModal));
    loginDropBtn.addEventListener('click', (e) => { e.preventDefault(); openModal(); });

    // --- Tab Switching ---
    tabSignup.addEventListener('click', () => {
        isLoginMode = false;
        tabSignup.classList.add('active');
        tabLogin.classList.remove('active');
        fieldName.classList.remove('hidden'); // Show name on Phase 1
        fieldPwd.classList.add('hidden'); // Hide password on Phase 1
        document.getElementById('inp-name').required = true;
        document.getElementById('inp-pwd').required = false;
        authTitle.innerText = "Create an Account";
        authSubtitle.innerText = "Enter your details to receive a secure signup link.";
        authBtnText.innerText = "Send Verification Link";
        authAlert.classList.add('hidden');
        authForm.reset();
    });

    tabLogin.addEventListener('click', () => {
        isLoginMode = true;
        tabLogin.classList.add('active');
        tabSignup.classList.remove('active');
        fieldName.classList.add('hidden');
        fieldPwd.classList.remove('hidden');
        document.getElementById('inp-name').required = false;
        document.getElementById('inp-pwd').required = true;
        authTitle.innerText = "Log in to SecurePay-AI";
        authSubtitle.innerText = "Welcome back! Please enter your details.";
        authBtnText.innerText = "Log In";
        authAlert.classList.add('hidden');
        authForm.reset();
    });

    function showAlert(msg, isError) {
        authAlert.innerText = msg;
        authAlert.classList.remove('hidden', 'success', 'error');
        authAlert.classList.add(isError ? 'error' : 'success');
    }

    // ==========================================
    // FIREBASE AUTH CONFIGURATION
    // ==========================================
    const firebaseConfig = {
        apiKey: "AIzaSyBavw2AOG6Xtu83YUWqNzOzjQLGU7UnJ1g",
        authDomain: "pay-ai-4745f.firebaseapp.com",
        projectId: "pay-ai-4745f",
        storageBucket: "pay-ai-4745f.firebasestorage.app",
        messagingSenderId: "82512155832",
        appId: "1:82512155832:web:ea85cb118d78fb5fb0104d"
    };

    if (typeof firebase !== 'undefined') {
        if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
    }
    const auth = typeof firebase !== 'undefined' ? firebase.auth() : null;

    // --- Auth Logic (Firebase Mixed Local/Cloud Flow) ---
    function updateAuthUI(user) {
        const avatar = document.getElementById('avatar-img');
        const lockedLinks = document.querySelectorAll('.locked-link');
        
        if (user) { 
            isAuthenticated = true;
            if(avatar) {
                avatar.src = `https://ui-avatars.com/api/?name=${user.displayName || user.email}&background=a855f7&color=fff`;
                avatar.title = `Logged in as ${user.displayName || user.email}`;
            }
            loginDropBtn.classList.add('hidden');
            logoutBtn.classList.remove('hidden');

            lockedLinks.forEach(link => {
                link.title = "";
                const lockIcon = link.querySelector('.lucide-lock');
                if(lockIcon) lockIcon.style.display = 'none';
                link.classList.remove('locked-link');
            });
            closeModal();
        } else {
            isAuthenticated = false;
            if(avatar) {
                avatar.src = `https://ui-avatars.com/api/?name=Guest&background=06b6d4&color=fff`;
                avatar.title = `Unauthenticated Guest`;
            }
            loginDropBtn.classList.remove('hidden');
            logoutBtn.classList.add('hidden');
        }
    }

    if (auth) {
        auth.onAuthStateChanged((user) => {
            updateAuthUI(user);
        });

        // Detect Magic Link Landing
        if (auth.isSignInWithEmailLink(window.location.href)) {
            let email = window.localStorage.getItem('emailForSignIn');
            if (!email) {
                email = window.prompt("Confirm your signup email:");
            }
            if (email) {
                auth.signInWithEmailLink(email, window.location.href)
                .then((result) => {
                    // Phase 2: Show "Complete Your Profile" modal
                    document.getElementById('complete-profile-modal').classList.remove('hidden');
                    appScreen.classList.add('blurred');
                    
                    // Pre-fill name from localStorage
                    const storedName = window.localStorage.getItem('nameForCompletion');
                    if(storedName) document.getElementById('final-name').value = storedName;
                })
                .catch(err => {
                    console.error("Magic Link Error:", err);
                    showAlert("Link expired or invalid. Please try again.", true);
                });
            }
        }
    } else {
        updateAuthUI(null);
    }

    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('inp-email').value;
        const pwd = document.getElementById('inp-pwd').value;
        
        // Admin Backdoor
        if (isLoginMode && email === "admin@gmail.com" && pwd === "1234") {
            isAuthenticated = true;
            updateAuthUI({ email, displayName: 'Admin' });
            showAlert("Admin Login Successful ✅", false);
            return;
        }

        if(!auth) {
            showAlert("Firebase SDK not loaded. Check internet connection.", true);
            return;
        }

        authBtnText.innerText = isLoginMode ? 'Logging in...' : 'Sending Link...';

        try {
            if (isLoginMode) {
                await auth.signInWithEmailAndPassword(email, pwd);
                showAlert("Login Successful ✅", false);
            } else {
                // --- PHASE 1: Send Magic Link ---
                // We use only the base domain to ensure whitelist matches exactly
                let currentUrl = window.location.origin + window.location.pathname;
                
                // Safety: Localhost is more stable for redirects than 127.0.0.1
                if (currentUrl.includes("127.0.0.1")) {
                   currentUrl = currentUrl.replace("127.0.0.1", "localhost");
                }

                console.log("SENDING MAGIC LINK TO:", currentUrl);

                const actionCodeSettings = {
                    url: currentUrl,
                    handleCodeInApp: true
                };
                
                await auth.sendSignInLinkToEmail(email, actionCodeSettings);
                window.localStorage.setItem('emailForSignIn', email);
                window.localStorage.setItem('nameForCompletion', name); // Store name too!
                showAlert("Signup link sent! Check your inbox 📧", false);
                authBtnText.innerText = 'Check Email';
            }
        } catch (error) {
            console.error(error);
            showAlert(error.message, true);
            authBtnText.innerText = isLoginMode ? 'Log In' : 'Send Verification Link';
        }
    });

    // Sign in with Google
    const btnGoogle = document.getElementById('btn-google');
    if (btnGoogle) {
        btnGoogle.addEventListener('click', async (e) => {
            e.preventDefault();
            if (!auth) {
                showAlert("Firebase SDK not loaded.", true);
                return;
            }
            try {
                const provider = new firebase.auth.GoogleAuthProvider();
                await auth.signInWithPopup(provider);
                showAlert("Google Sign-In Successful ✅", false);
            } catch (error) {
                console.error("Google Auth Error:", error);
                showAlert(error.message, true);
            }
        });
    }

    // Phase 2 Signup: Complete Profile & Set Password
    const completeForm = document.getElementById('complete-profile-form');
    if (completeForm) {
        completeForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('btn-final-signup');
            const name = document.getElementById('final-name').value;
            const newPwd = document.getElementById('final-pwd').value;
            const user = auth.currentUser;

            if (user) {
                btn.innerText = "Finalizing...";
                try {
                    await user.updateProfile({ displayName: name });
                    await user.updatePassword(newPwd);
                    document.getElementById('complete-profile-modal').classList.add('hidden');
                    appScreen.classList.remove('blurred');
                    showAlert("Account fully setup! Welcome ✅", false);
                    openModal();
                    setTimeout(() => closeModal(), 1500);
                } catch (err) {
                    alert(err.message);
                    btn.innerText = "Finish Account Setup";
                }
            }
        });
    }

    logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        if(auth) await auth.signOut();
        isAuthenticated = false;
        document.getElementById('profile-dropdown').classList.remove('open');
        updateAuthUI(null);
        switchView('dashboard');
    });

    // --- Profile Dropdown ---
    const profileTrigger = document.getElementById('profile-trigger');
    const profileDropdown = document.getElementById('profile-dropdown');
    profileTrigger.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') return;
        profileDropdown.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
        if (!profileTrigger.contains(e.target)) {
            profileDropdown.classList.remove('open');
        }
    });

    // --- View Routing ---
    const sideLinks = document.querySelectorAll('.side-link[data-view]');
    const views = document.querySelectorAll('.view');
    const viewSwitches = document.querySelectorAll('.view-switch');

    function switchView(target) {
        profileDropdown.classList.remove('open');

        // Check locks
        const viewEl = document.getElementById(`view-${target}`);
        const linkEl = document.querySelector(`.side-link[data-view="${target}"]`) || document.querySelector(`.view-switch[data-target="${target}"]`);
        
        if (linkEl && linkEl.classList.contains('locked-link') && !isAuthenticated) {
            openModal();
            showAlert("Please log in to access this feature.", true);
            return;
        }

        // Apply visual switches
        sideLinks.forEach(l => l.classList.remove('active'));
        if (linkEl && linkEl.classList.contains('side-link')) linkEl.classList.add('active');

        views.forEach(v => {
            v.classList.add('hidden');
            v.classList.remove('active-view');
            if (v.id === `view-${target}`) {
                v.classList.remove('hidden');
                setTimeout(() => { v.classList.add('active-view'); }, 50);
            }
        });
    }

    sideLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            switchView(link.getAttribute('data-view'));
        });
    });

    viewSwitches.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            switchView(btn.getAttribute('data-target'));
        });
    });

    // --- Counters ---
    function animateValue(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            let val = Math.floor(progress * (end - start) + start);
            const prefix = obj.getAttribute('data-prefix') || '';
            obj.innerHTML = prefix + val.toLocaleString('en-US');
            if (progress < 1) window.requestAnimationFrame(step);
        };
        window.requestAnimationFrame(step);
    }

    const counters = document.querySelectorAll('.counter');
    counters.forEach(c => animateValue(c, 0, parseInt(c.getAttribute('data-target'), 10), 2000));

    // --- Chart.js Setup ---
    Chart.defaults.color = '#94a3b8';
    Chart.defaults.font.family = "'Inter', sans-serif";
    Chart.defaults.scale.grid.color = 'rgba(255,255,255,0.05)';

    // 1. Line Chart (Time Series)
    const ctxLine = document.getElementById('timeSeriesChart');
    let lineChart;
    if (ctxLine) {
        const labels = Array.from({length: 12}, (_, i) => new Date(Date.now() - (11 - i) * 60000).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}));
        const dataSafe = Array.from({length: 12}, () => Math.floor(Math.random() * 50) + 120);
        const dataFraud = Array.from({length: 12}, () => Math.floor(Math.random() * 8) + 2);

        lineChart = new Chart(ctxLine.getContext('2d'), {
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
        new Chart(ctxPie.getContext('2d'), {
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

    // 3. Bar Chart (Analytics)
    const ctxBar = document.getElementById('barChart');
    if (ctxBar) {
        new Chart(ctxBar.getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Fraud Attempts Blocked',
                    data: [1200, 1900, 1500, 2200, 1800, 2600],
                    backgroundColor: 'rgba(168, 85, 247, 0.8)',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { x: { grid: { display: false } } }
            }
        });
    }

    // --- Mock Data Generators & Live Updates ---
    
    // Live Alerts
    const alertsBox = document.getElementById('alerts-box');
    const alertTypes = [
        { title: "Velocity Exceeded", loc: "Mumbai, IN", amt: "₹94,500", crit: true },
        { title: "IP Proxy Detected", loc: "Delhi, IN", amt: "₹3,200", crit: false },
        { title: "Unusual Merchant Match", loc: "Pune, IN", amt: "₹1,45,000", crit: true },
        { title: "Failed 3DS Verification", loc: "Bangalore, IN", amt: "₹8,500", crit: false }
    ];

    function addAlert() {
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
    for(let i=0; i<4; i++) addAlert();

    // Transactions Table Array
    const txnTable = document.querySelector('#live-txn-table tbody');
    function addTxn() {
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
    for(let i=0; i<5; i++) addTxn();

    // --- Live Dashboard Stats Incrementing ---
    const totalTxnEl = document.querySelectorAll('.m-value')[0];
    const fraudAmtEl = document.querySelectorAll('.m-value')[1];
    let txnTotal = 3824901;
    let fraudTotal = 1245000;

    // Loop Interval for Dashboard Activity
    setInterval(() => {
        // Increment Live Stats smoothly
        if(totalTxnEl) {
            txnTotal += Math.floor(Math.random() * 8) + 1;
            totalTxnEl.innerText = txnTotal.toLocaleString();
        }
        if(fraudAmtEl) {
            fraudTotal += Math.floor(Math.random() * 5);
            fraudAmtEl.innerText = fraudTotal.toLocaleString('en-IN');
        }

        // Line chart update
        if (lineChart && document.getElementById('view-dashboard').classList.contains('active-view')) {
            const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            lineChart.data.labels.push(time);
            lineChart.data.labels.shift();

            lineChart.data.datasets[0].data.push(Math.floor(Math.random() * 50) + 120);
            lineChart.data.datasets[0].data.shift();

            const isSpike = Math.random() > 0.8;
            lineChart.data.datasets[1].data.push(isSpike ? Math.floor(Math.random() * 30) + 15 : Math.floor(Math.random() * 5));
            lineChart.data.datasets[1].data.shift();
            lineChart.update('none');

            // Point 3: Gauge Update
            const rGauge = document.getElementById('risk-gauge');
            const rVal = document.getElementById('risk-val');
            const gText = document.getElementById('global-risk-text');
            const score = isSpike ? Math.floor(Math.random() * 20) + 75 : Math.floor(Math.random() * 15) + 8;
            
            if(rGauge && rVal) {
                const degrees = (score / 100) * 180;
                rGauge.style.transform = `rotate(${degrees}deg)`;
                rVal.innerText = `${score}%`;
                
                // Dynamic Risk Coloring (<30 Green, 30-70 Yellow, >70 Red)
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

    // --- XAI Inference Scanner Demo ---
    const btnRunInference = document.getElementById('btn-run-inference');
    if (btnRunInference) {
        btnRunInference.addEventListener('click', () => {
            document.getElementById('inference-empty').classList.add('hidden');
            document.getElementById('inference-result').classList.add('hidden');
            document.getElementById('inference-loading').classList.remove('hidden');

            setTimeout(() => {
                document.getElementById('inference-loading').classList.add('hidden');
                document.getElementById('inference-result').classList.remove('hidden');

                const rScoreEl = document.getElementById('r-score');
                const rActionEl = document.getElementById('r-action');
                const rJsonEl = document.getElementById('r-json');

                let riskScore = 92; 
                rScoreEl.innerText = riskScore;
                
                const responsePayload = {
                    inference_id: "req_xyz_" + Math.random().toString(36).substr(2, 6),
                    time_ms: 104,
                    model_version: "v4.2.1-deep-fraud",
                    feature_attributions: [
                        { feature: "origin_ip", impact: "+45%", note: "Known botnet range proxy." },
                        { feature: "device_fingerprint", impact: "+30%", note: "Seen 30 times today across users." },
                        { feature: "amount", impact: "+12%", note: "Deviates 400% from user historicals." }
                    ],
                    action: "BLOCK"
                };

                rJsonEl.innerText = JSON.stringify(responsePayload, null, 2);
                lucide.createIcons();
            }, 1800);
        });
    }
    
    // --- Quick Scan Modal Logic ---
    const btnQuickScan = document.getElementById('btn-quick-scan');
    const scanModal = document.getElementById('quick-scan-modal');
    const btnCloseScan = document.getElementById('btn-close-scan');
    const btnRunCheck = document.getElementById('btn-run-check');
    
    const scanFormView = document.getElementById('scan-form-view');
    const scanResultView = document.getElementById('scan-result-view');
    const scanSpinner = document.getElementById('scan-spinner');
    const scanDone = document.getElementById('scan-done');
    const scanAmt = document.getElementById('scan-amt');

    if(btnQuickScan) {
        btnQuickScan.addEventListener('click', () => {
            if(scanModal) scanModal.classList.remove('hidden');
            if(appScreen) appScreen.classList.add('blurred');
            
            // Reset state
            scanFormView.classList.remove('hidden');
            scanResultView.classList.add('hidden');
            scanDone.classList.add('hidden');
            scanSpinner.classList.add('hidden');
        });
    }

    if(btnCloseScan) {
        btnCloseScan.addEventListener('click', () => {
            if(scanModal) scanModal.classList.add('hidden');
            if(appScreen) appScreen.classList.remove('blurred');
        });
    }

    if(btnRunCheck) {
        btnRunCheck.addEventListener('click', () => {
            if(!scanAmt.value) return;
            scanFormView.classList.add('hidden');
            scanResultView.classList.remove('hidden');
            scanSpinner.classList.remove('hidden');

            setTimeout(() => {
                scanSpinner.classList.add('hidden');
                scanDone.classList.remove('hidden');
                
                const amt = parseInt(scanAmt.value);
                const isHighRisk = amt > 20000;
                const riskVal = isHighRisk ? Math.floor(Math.random() * 15) + 85 : Math.floor(Math.random() * 20) + 5;
                
                const riskText = document.getElementById('scan-output-risk');
                const reasonBadge = document.getElementById('scan-reason-badge');
                const reasonText = document.getElementById('scan-reason-text');
                const reasonBox = document.getElementById('scan-reason-box');

                riskText.innerText = riskVal + "%";
                riskText.style.color = isHighRisk ? 'var(--brand-danger)' : 'var(--brand-success)';
                
                if (isHighRisk) {
                    reasonBadge.innerText = "HIGH RISK";
                    reasonBadge.style.color = "#ef4444";
                    reasonBadge.style.background = "rgba(239, 68, 68, 0.15)";
                    reasonBox.style.background = "rgba(239, 68, 68, 0.1)";
                    reasonBox.style.borderColor = "rgba(239, 68, 68, 0.3)";
                    reasonText.innerText = "Reason: Unusually high transaction amount detected compared to account historical ticket size.";
                } else {
                    reasonBadge.innerText = "SAFE";
                    reasonBadge.style.color = "#10b981";
                    reasonBadge.style.background = "rgba(16, 185, 129, 0.15)";
                    reasonBox.style.background = "rgba(16, 185, 129, 0.1)";
                    reasonBox.style.borderColor = "rgba(16, 185, 129, 0.3)";
                    reasonText.innerText = "Reason: Activity matches normal purchasing patterns with reliable device fingerprint data.";
                }
            }, 1200);
        });
    }

    // Point 5: Improved Locked Feature Behavior
    const lockedItems = document.querySelectorAll('.locked-link');
    lockedItems.forEach(item => {
        item.addEventListener('click', (e) => {
            if (!isAuthenticated) {
                e.preventDefault();
                openModal(); // Open login modal
                showAlert("Login required to access this feature 🔒", true);
            }
        });
    });

});
