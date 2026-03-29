document.addEventListener("DOMContentLoaded", () => {
    
    // --- Auth Overlay Logic ---
    const loginForm = document.getElementById('login-form');
    const authOverlay = document.getElementById('auth-overlay');
    const appContainer = document.getElementById('app-container');

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = loginForm.querySelector('button');
        btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Authenticating...';
        
        // Simulate API login delay
        setTimeout(() => {
            authOverlay.style.opacity = '0';
            setTimeout(() => {
                authOverlay.classList.add('hidden');
                appContainer.classList.remove('hidden');
            }, 500);
        }, 1200);
    });

    // --- Logout ---
    document.getElementById('logout-btn').addEventListener('click', () => {
        appContainer.classList.add('hidden');
        authOverlay.classList.remove('hidden');
        authOverlay.style.opacity = '1';
        const btn = loginForm.querySelector('button');
        btn.innerHTML = 'Initialize System <i class="fa-solid fa-arrow-right-to-bracket ml-2"></i>';
    });


    // --- SPA View Routing ---
    const menuItems = document.querySelectorAll('.menu-item');
    const views = document.querySelectorAll('.view');

    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            // e.preventDefault();
            const targetView = item.getAttribute('data-view');
            
            // Handle active menu styling
            menuItems.forEach(m => m.classList.remove('active'));
            item.classList.add('active');

            // Handle view switching
            views.forEach(view => {
                view.classList.remove('active-view');
                if(view.id === `view-${targetView}`) {
                    view.classList.add('active-view');
                }
            });
        });
    });

    // --- ML Scanner Logic ---
    const manualScanForm = document.getElementById('manual-scan-form');
    const resultContainer = document.getElementById('scan-result-container');

    manualScanForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Show loading state
        resultContainer.innerHTML = `
            <div class="text-center">
                <div style="font-size: 3rem; color: var(--primary-light); margin-bottom: 1rem;"><i class="fa-solid fa-circle-notch fa-spin"></i></div>
                <h3>Running Random Forest...</h3>
                <p class="text-muted">Analyzing 143 data points via Sentinel API</p>
            </div>
        `;

        const amount = parseFloat(document.getElementById('scan-amount').value);
        const dist = parseFloat(document.getElementById('scan-dist').value);
        const velocity = parseInt(document.getElementById('scan-velocity').value);

        // Simulate inference latency
        setTimeout(() => {
            let isFraud = false;
            let probScore = 0;

            // Simple logic for simulation
            if (amount > 50000 || dist > 500 || velocity > 5) {
                isFraud = true;
                probScore = Math.floor(Math.random() * 10) + 90; 
            } else {
                isFraud = false;
                probScore = Math.floor(Math.random() * 5) + 95; 
            }

            renderOutput(isFraud, probScore, amount);
        }, 1500);
    });

    function renderOutput(isFraud, probScore, amount) {
        if(isFraud) {
            resultContainer.innerHTML = `
                <div class="text-center w-100" style="padding: 2rem;">
                    <div style="width: 80px; height: 80px; background: rgba(239, 68, 68, 0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem auto;">
                        <i class="fa-solid fa-triangle-exclamation" style="font-size: 2.5rem; color: var(--danger);"></i>
                    </div>
                    <h2 class="text-danger mb-2">High Risk Transaction</h2>
                    <p class="text-muted">Inference completed in 34ms</p>
                    
                    <div style="background: rgba(0,0,0,0.3); padding: 1.5rem; border-radius: 8px; margin-top: 2rem; text-align: left; border: 1px solid rgba(239,68,68,0.3);">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                            <span class="text-muted">Probability Score:</span>
                            <span class="text-danger font-bold">${probScore}% Fraud</span>
                        </div>
                        <div style="width: 100%; height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden; margin-bottom: 1.5rem;">
                            <div style="width: ${probScore}%; height: 100%; background: var(--danger);"></div>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.9rem;">
                            <span class="text-muted">Amount:</span>
                            <span>₹${amount.toLocaleString()}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.9rem;">
                            <span class="text-muted">Recommendation:</span>
                            <span class="text-danger">Block & Alert User</span>
                        </div>
                    </div>
                </div>
            `;
        } else {
            resultContainer.innerHTML = `
                <div class="text-center w-100" style="padding: 2rem;">
                    <div style="width: 80px; height: 80px; background: rgba(16, 185, 129, 0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem auto;">
                        <i class="fa-solid fa-check" style="font-size: 2.5rem; color: var(--success);"></i>
                    </div>
                    <h2 class="text-success mb-2">Transaction Safe</h2>
                    <p class="text-muted">Inference completed in 28ms</p>
                    
                    <div style="background: rgba(0,0,0,0.3); padding: 1.5rem; border-radius: 8px; margin-top: 2rem; text-align: left; border: 1px solid rgba(16,185,129,0.3);">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                            <span class="text-muted">Confidence Score:</span>
                            <span class="text-success font-bold">${probScore}% Genuine</span>
                        </div>
                        <div style="width: 100%; height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden; margin-bottom: 1.5rem;">
                            <div style="width: ${probScore}%; height: 100%; background: var(--success);"></div>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.9rem;">
                            <span class="text-muted">Amount:</span>
                            <span>₹${amount.toLocaleString()}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.9rem;">
                            <span class="text-muted">Recommendation:</span>
                            <span class="text-success">Approve</span>
                        </div>
                    </div>
                </div>
            `;
        }
    }

});

// Global function for API key toggle
function togglePassword(id) {
    const input = document.getElementById(id);
    if (input.type === "password") {
        input.type = "text";
    } else {
        input.type = "password";
    }
}
