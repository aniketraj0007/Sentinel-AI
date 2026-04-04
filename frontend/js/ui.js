// js/ui.js - General UI Interaction with Dynamic Loading

// --- Component Loader Utility ---
async function loadComponent(containerId, filePath) {
    try {
        // Add cache busting
        const cacheBuster = `?v=${Date.now()}`;
        const response = await fetch(filePath + cacheBuster);
        if (!response.ok) throw new Error(`Failed to load ${filePath}`);
        const html = await response.text();
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = html;
            // Re-initialize icons for new content
            if (typeof lucide !== 'undefined') lucide.createIcons();
            return true;
        }
    } catch (error) {
        console.error("Component Load Error:", error);
    }
    return false;
}

// Modal Logic
function openModal() {
    const authModal = document.getElementById('auth-modal');
    const appScreen = document.getElementById('app-screen');
    if(authModal) {
        authModal.classList.remove('hidden');
        appScreen.classList.add('blurred');
        setTimeout(() => { authModal.style.opacity = '1'; }, 10);
    }
}

function closeModal() {
    const authModal = document.getElementById('auth-modal');
    const appScreen = document.getElementById('app-screen');
    if(authModal) {
        authModal.style.opacity = '0';
        appScreen.classList.remove('blurred');
        setTimeout(() => { authModal.classList.add('hidden'); }, 300);
    }
}

function showAlert(msg, isError) {
    const authAlert = document.getElementById('auth-alert');
    if(authAlert) {
        authAlert.innerText = msg;
        authAlert.classList.remove('hidden', 'success', 'error');
        authAlert.classList.add(isError ? 'error' : 'success');
    }
}

// View Routing (Dynamic Loading)
async function switchView(target) {
    const profileDropdown = document.getElementById('profile-dropdown');
    if(profileDropdown) profileDropdown.classList.remove('open');

    // Check authentication state from global window.authData
    const isAuthenticated = window.authData ? window.authData.getIsAuthenticated() : false;
    const lockedViews = ['analytics', 'alerts', 'api', 'csv-upload'];

    if (lockedViews.includes(target) && !isAuthenticated) {
        openModal();
        showAlert("Please log in to access this feature.", true);
        return;
    }

    // Load View Content
    const viewContainer = document.getElementById('view-content');
    const success = await loadComponent('view-content', `views/${target}.html`);
    
    if (success) {
        // Apply visual switches to sidebar links
        const sideLinks = document.querySelectorAll('.side-link[data-view]');
        sideLinks.forEach(l => {
            l.classList.remove('active');
            if (l.getAttribute('data-view') === target) l.classList.add('active');
        });

        // Trigger specific initializations
        if (target === 'dashboard' && window.charts) {
            const instances = window.charts.initCharts();
            if (window.dashboard) window.dashboard.initDashboard(instances);
        }
        
        if (target === 'inference' && window.scanner) {
            window.scanner.initScanner();
        }
        
        if (target === 'csv-upload' && window.csvHandler) {
            window.csvHandler.initCSVHandler();
        }

        if (target === 'profile') {
            initProfile();
        }

        if (target === 'settings') {
            initSettings();
        }

        if (target === 'api') {
            initAPIKeys();
        }

        if (target === '2fa') {
            init2FA();
        }

        if (target === 'password') {
            initPassword();
        }

        if (target === 'usage') {
            initUsage();
        }

        if (target === 'history') {
            initHistory();
        }

        // Run counters if present
        const counters = document.querySelectorAll('.counter');
        counters.forEach(c => animateValue(c, 0, parseInt(c.getAttribute('data-target'), 10), 2000));
        
        // Re-attach listeners for new view content
        attachViewListeners();
    }

    // Close sidebar on mobile
    if (window.innerWidth <= 768) {
        const sidebar = document.getElementById('sidebar');
        if(sidebar) sidebar.classList.remove('open');
    }
}

// Attach listeners to elements that might be loaded dynamically
function attachViewListeners() {
    const viewSwitches = document.querySelectorAll('.view-switch');
    viewSwitches.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            switchView(btn.getAttribute('data-target'));
        });
    });

    const actionSettings = document.querySelectorAll('.action-settings');
    actionSettings.forEach(btn => btn.addEventListener('click', openModal));
}

// Counter Animations
function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        let val = Math.floor(progress * (end - start) + start);
        const valNumEl = obj.querySelector('.val-num');
        if (valNumEl) {
            valNumEl.innerHTML = val.toLocaleString('en-IN');
        } else {
            obj.innerHTML = val.toLocaleString('en-IN');
        }
        if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
}

// Initialization
async function initUI() {
    // 0. Apply Saved Preferences (Theme, etc.)
    applySavedSettings();

    // 1. Load Permanent Components
    await loadComponent('navbar', 'components/top-nav.html');
    await loadComponent('sidebar', 'components/sidebar.html');
    await loadComponent('auth-modal', 'components/auth-modal.html');
    await loadComponent('quick-scan-modal', 'components/quick-scan-modal.html');
    await loadComponent('complete-profile-modal', 'components/complete-profile-modal.html');

    // 2. Load Initial View
    await switchView('dashboard');

    // 3. Setup Global UI Listeners
    setupGlobalListeners();

    // 4. Initial Global Profile Sync
    syncNavbarProfile();

    // 5. Apply Language Preferences
    applyLanguage();
}

function setupGlobalListeners() {
    // Sidebar Toggle (Delegated for dynamic content)
    document.addEventListener('click', (e) => {
        const toggle = e.target.closest('#sidebar-toggle');
        if (toggle) {
            const sidebar = document.getElementById('sidebar');
            if (sidebar) {
                sidebar.classList.toggle('closed');
            }
        }
    });

    // Tab Switching (Delegated to handle dynamic content)
    document.addEventListener('click', (e) => {
        const target = e.target;
        
        if (target.id === 'tab-signup') {
            switchAuthTab(false);
        } else if (target.id === 'tab-login') {
            switchAuthTab(true);
        } else if (target.closest('#btn-close-modal')) {
            closeModal();
        } else if (target.closest('#btn-guest')) {
            closeModal();
        } else if (target.closest('#btn-login-drop')) {
            e.preventDefault();
            openModal();
        } else if (target.closest('#profile-trigger')) {
            if (e.target.tagName !== 'A') {
                document.getElementById('profile-dropdown').classList.toggle('open');
            }
        }
    });

    // Close dropdowns on outside click
    document.addEventListener('click', (e) => {
        const profileTrigger = document.getElementById('profile-trigger');
        if (profileTrigger && !profileTrigger.contains(e.target)) {
            const dropdown = document.getElementById('profile-dropdown');
            if(dropdown) dropdown.classList.remove('open');
        }
    });

    // Global Context/Dropdown/Sidebar View Routing
    document.addEventListener('click', (e) => {
        const link = e.target.closest('.side-link[data-view]') || 
                     e.target.closest('.view-switch[data-target]') || 
                     e.target.closest('.menu-item[data-target]');
                     
        if (link) {
            e.preventDefault();
            const view = link.getAttribute('data-view') || link.getAttribute('data-target');
            if (view) switchView(view);
            
            // Auto-close profile dropdown if it was a menu item
            if (link.classList.contains('menu-item')) {
                const dropdown = document.getElementById('profile-dropdown');
                if(dropdown) dropdown.classList.remove('open');
            }
        }
    });
}

function switchAuthTab(isLogin) {
    const tabLogin = document.getElementById('tab-login');
    const tabSignup = document.getElementById('tab-signup');
    const fieldName = document.querySelector('.field-name');
    const authTitle = document.getElementById('auth-title');
    const authSubtitle = document.getElementById('auth-subtitle');
    const authBtnText = document.getElementById('auth-btn-text');
    const authAlert = document.getElementById('auth-alert');
    const fieldPwd = document.getElementById('field-pwd');
    const authForm = document.getElementById('auth-form');

    if (isLogin) {
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
        window.uiData.isLoginMode = true;
    } else {
        tabSignup.classList.add('active');
        tabLogin.classList.remove('active');
        fieldName.classList.remove('hidden'); 
        fieldPwd.classList.add('hidden'); 
        document.getElementById('inp-name').required = true;
        document.getElementById('inp-pwd').required = false;
        authTitle.innerText = "Create an Account";
        authSubtitle.innerText = "Enter your details to receive a secure signup link.";
        authBtnText.innerText = "Send Verification Link";
        authAlert.classList.add('hidden');
        authForm.reset();
        window.uiData.isLoginMode = false;
    }
}

function showToast(msg, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? 'check-circle' : (type === 'error' ? 'alert-circle' : 'info');
    toast.innerHTML = `
        <i data-lucide="${icon}" class="icon-sm"></i>
        <span>${msg}</span>
    `;
    
    container.appendChild(toast);
    if(window.lucide) window.lucide.createIcons();
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(50px)';
        setTimeout(() => toast.remove(), 500);
    }, 4000);
}

// Export functions to window
window.ui = {
    openModal,
    closeModal,
    showAlert,
    showToast,
    switchView,
    initUI,
    loadComponent
};

window.uiData = {
    isLoginMode: true
};
// --- Profile Management Logic ---
function initProfile() {
    const profileForm = document.getElementById('profile-form');
    const avatarInput = document.getElementById('avatar-input');
    const previewImg = document.getElementById('profile-preview');
    const editBtn = document.getElementById('btn-edit-photo');
    
    // Summary displays
    const summaryName = document.getElementById('summary-display-name');
    const summaryEmail = document.getElementById('summary-display-email');
    const summaryPlan = document.getElementById('summary-display-plan');

    // Load existing data
    const savedData = JSON.parse(localStorage.getItem('userProfile')) || {
        name: "Aniket Singh",
        email: "aniket@gmail.com",
        company: "SecurePay-AI",
        avatar: "https://ui-avatars.com/api/?name=Aniket+Singh&background=06b6d4&color=fff",
        plan: "Free Tier"
    };

    document.getElementById('prof-name').value = savedData.name;
    document.getElementById('prof-email').value = savedData.email;
    document.getElementById('prof-company').value = savedData.company || "";
    if (previewImg) previewImg.src = savedData.avatar;
    
    // Sync summary
    if (summaryName) summaryName.innerText = savedData.name;
    if (summaryEmail) summaryEmail.innerText = savedData.email;
    if (summaryPlan) summaryPlan.innerText = savedData.plan || "Free Tier";

    // Handle Image Preview
    if (avatarInput) {
        avatarInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (f) => {
                    previewImg.src = f.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    if (editBtn && avatarInput) {
        editBtn.addEventListener('click', () => avatarInput.click());
    }

    // Handle Form Submission
    if (profileForm) {
        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const updatedData = {
                ...savedData,
                name: document.getElementById('prof-name').value,
                email: document.getElementById('prof-email').value,
                company: document.getElementById('prof-company').value,
                avatar: previewImg.src
            };
            
            localStorage.setItem('userProfile', JSON.stringify(updatedData));
            syncNavbarProfile();
            
            // Sync summary instantly
            if (summaryName) summaryName.innerText = updatedData.name;
            if (summaryEmail) summaryEmail.innerText = updatedData.email;

            // Show Feedback
            showToast("Profile Updated Successfully ✅", "success");
            
            const saveBtn = document.getElementById('btn-save-profile');
            const originalContent = saveBtn.innerHTML;
            saveBtn.innerHTML = '<i data-lucide="check" class="icon-sm mr-2"></i> Saved!';
            if(window.lucide) window.lucide.createIcons();
            
            setTimeout(() => {
                saveBtn.innerHTML = originalContent;
                if(window.lucide) window.lucide.createIcons();
            }, 2000);
        });
    }
}

function syncNavbarProfile() {
    const savedData = JSON.parse(localStorage.getItem('userProfile'));
    if (!savedData) return;

    const navName = document.querySelector('.user-name');
    const navEmail = document.querySelector('.user-email');
    const navAvatar = document.getElementById('avatar-img');

    if (navName) navName.innerText = savedData.name;
    if (navEmail) navEmail.innerText = savedData.email;
    if (navAvatar) navAvatar.src = savedData.avatar;
}

// --- Settings & Theme Logic ---
function initSettings() {
    const settingsForm = document.getElementById('settings-form');
    const toggleDarkMode = document.getElementById('toggle-dark-mode');
    const langSelect = document.getElementById('setting-lang');
    const notifFraud = document.getElementById('notif-fraud');
    const notifEmail = document.getElementById('notif-email');
    const notifPush = document.getElementById('notif-push');
    const prefDefaultView = document.getElementById('pref-default-view');
    const prefAutoRefresh = document.getElementById('pref-auto-refresh');

    // Load current state
    const savedSettings = JSON.parse(localStorage.getItem('appSettings')) || {
        theme: 'dark',
        lang: 'en',
        notifFraud: true,
        notifEmail: false,
        notifPush: true,
        defaultView: 'summary',
        autoRefresh: true
    };

    // Set UI state initially to match SAVED state
    if (toggleDarkMode) toggleDarkMode.checked = savedSettings.theme === 'dark';
    if (langSelect) langSelect.value = savedSettings.lang;
    if (notifFraud) notifFraud.checked = savedSettings.notifFraud;
    if (notifEmail) notifEmail.checked = savedSettings.notifEmail;
    if (notifPush) notifPush.checked = savedSettings.notifPush;
    if (prefDefaultView) prefDefaultView.value = savedSettings.defaultView || 'summary';
    if (prefAutoRefresh) prefAutoRefresh.checked = savedSettings.autoRefresh !== false;

    // Change theme immediately on toggle (but don't save to localStorage yet)
    if (toggleDarkMode) {
        toggleDarkMode.addEventListener('change', (e) => {
            const theme = e.target.checked ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', theme);
        });
    }

    // Change language immediately on selection (but don't save to localStorage yet)
    if (langSelect) {
        langSelect.addEventListener('change', (e) => {
            applyLanguage(e.target.value);
        });
    }

    // Handle form submission (Save Changes)
    if (settingsForm) {
        settingsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const newSettings = {
                theme: toggleDarkMode.checked ? 'dark' : 'light',
                lang: langSelect.value,
                notifFraud: notifFraud.checked,
                notifEmail: notifEmail.checked,
                notifPush: notifPush.checked,
                defaultView: prefDefaultView.value,
                autoRefresh: prefAutoRefresh.checked
            };

            // Apply theme immediately (final confirm)
            document.documentElement.setAttribute('data-theme', newSettings.theme);
            
            // Save to storage
            localStorage.setItem('appSettings', JSON.stringify(newSettings));

            // Apply Language change immediately
            applyLanguage();
            
            // Show Status
            if (window.ui && window.ui.showToast) {
                window.ui.showToast("Settings Saved Successfully 🚀", "success");
            } else {
                alert("Settings Saved Successfully 🚀");
            }
            
            // Update UI feedback on save button
            const saveBtn = settingsForm.querySelector('button[type="submit"]');
            const originalContent = saveBtn.innerHTML;
            saveBtn.innerHTML = '<i data-lucide="check" class="icon-sm mr-2"></i> Saved!';
            if(window.lucide) window.lucide.createIcons();
            
            setTimeout(() => {
                saveBtn.innerHTML = originalContent;
                if(window.lucide) window.lucide.createIcons();
            }, 2000);
        });

        // Cancel logic: Re-apply SAVED settings to UI if Cancel is clicked
        const cancelBtn = settingsForm.querySelector('.btn-cancel-settings');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                // Revert theme to what was actually saved
                document.documentElement.setAttribute('data-theme', savedSettings.theme);
                // switchView handles the navigation
            });
        }
    }
}

function saveSettings(newFields) {
    const current = JSON.parse(localStorage.getItem('appSettings')) || {
        theme: 'dark',
        lang: 'en',
        notifFraud: true,
        notifEmail: false
    };
    const updated = { ...current, ...newFields };
    localStorage.setItem('appSettings', JSON.stringify(updated));
}

function applySavedSettings() {
    const settings = JSON.parse(localStorage.getItem('appSettings'));
    if (settings && settings.theme) {
        document.documentElement.setAttribute('data-theme', settings.theme);
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
}

// --- Translation Engine (Lightweight) ---
function applyLanguage(forceLang = null) {
    const settings = JSON.parse(localStorage.getItem('appSettings'));
    const lang = forceLang || (settings ? settings.lang : 'en');

    const lib = {
        'hi': {
            'Dashboard': 'डैशबोर्ड',
            'Fraud Detection': 'धोखाधड़ी पहचान',
            'Analytics': 'एनालिटिक्स',
            'CSV Batch Scan': 'CSV बैच स्कैन',
            'Alerts': 'अलर्ट्स',
            'API Access': 'API एक्सेस',
            'Settings': 'सेटिंग्स',
            'Profile': 'प्रोफ़ाइल',
            'Billing': 'बिलिंग',
            'Logout': 'लॉगआउट',
            'App Settings': 'ऐप सेटिंग्स',
            'Quick Scan': 'त्वरित स्कैन',
            'Overview': 'अवलोकन',
            'System': 'सिस्टम',
            'Two Factor Authentication': 'दो-चरण प्रमाणीकरण'
        },
        'es': {
            'Dashboard': 'Tablero',
            'Fraud Detection': 'Detección',
            'Analytics': 'Analítica',
            'CSV Batch Scan': 'Escaneo CSV',
            'Alerts': 'Alertas',
            'API Access': 'Acceso API',
            'Settings': 'Ajustes',
            'Profile': 'Perfil',
            'Billing': 'Facturación',
            'Logout': 'Cerrar sesión',
            'App Settings': 'Configuración',
            'Quick Scan': 'Escaneo Rápido',
            'Overview': 'Visión General',
            'System': 'Sistema',
            'Two Factor Authentication': 'Autenticación de Dos Factores'
        }
    };

    const dict = lib[lang] || {};

    // 1. Translate Sidebar Links & Labels
    document.querySelectorAll('.link-text, .label-text').forEach(el => {
        if (!el.hasAttribute('data-i18n')) el.setAttribute('data-i18n', el.innerText.trim());
        const key = el.getAttribute('data-i18n');
        el.innerText = dict[key] || key;
    });

    // 2. Translate Navbar Items
    const qsBtn = document.getElementById('btn-quick-scan');
    if (qsBtn) {
        if (!qsBtn.hasAttribute('data-i18n')) {
            const textContent = qsBtn.innerText.trim();
            qsBtn.setAttribute('data-i18n', textContent);
        }
        const key = qsBtn.getAttribute('data-i18n');
        const translated = dict[key] || key;
        const icon = qsBtn.querySelector('i');
        qsBtn.innerHTML = '';
        if (icon) qsBtn.appendChild(icon);
        qsBtn.appendChild(document.createTextNode(' ' + translated));
    }

    // 3. Translate View Headers
    const viewHeader = document.querySelector('.view-header h1');
    if (viewHeader) {
        if (!viewHeader.hasAttribute('data-i18n')) viewHeader.setAttribute('data-i18n', viewHeader.innerText.trim());
        const key = viewHeader.getAttribute('data-i18n');
        viewHeader.innerText = dict[key] || key;
    }
    
    // 4. Translate Dropdown Menus
    document.querySelectorAll('.menu-item').forEach(el => {
        // Skip icons
        const originalText = Array.from(el.childNodes)
            .filter(node => node.nodeType === 3) // Text nodes
            .map(node => node.textContent.trim())
            .join(' ');
        
        if (originalText) {
            if (!el.hasAttribute('data-i18n')) el.setAttribute('data-i18n', originalText);
            const key = el.getAttribute('data-i18n');
            const translated = dict[key] || key;
            const icon = el.querySelector('i');
            el.innerHTML = '';
            if (icon) el.appendChild(icon);
            el.appendChild(document.createTextNode(' ' + translated));
        }
    });

    if(window.lucide) window.lucide.createIcons();
}

// --- API Key Management Logic ---
function initAPIKeys() {
    const btnGen = document.getElementById('btn-generate-key');
    const container = document.getElementById('api-keys-container');

    if (btnGen) {
        btnGen.addEventListener('click', () => {
            const newKey = `sk_live_${Math.random().toString(36).substr(2, 20)}`;
            const html = `
                <div class="p-4 blur-bg rounded-xl border-subtle bg-white/5 relative group animate-fade-in">
                    <div class="text-secondary mb-1 text-[10px] uppercase tracking-widest font-bold">New Key</div>
                    <div class="flex items-center justify-between gap-4">
                        <code class="text-neon tracking-wider text-xs font-mono">${newKey}</code>
                        <div class="flex gap-1">
                            <button class="btn-icon btn-copy-key"><i data-lucide="copy" class="icon-sm"></i></button>
                            <button class="btn-icon text-danger btn-delete-key"><i data-lucide="trash-2" class="icon-sm"></i></button>
                        </div>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', html);
            if(window.lucide) window.lucide.createIcons();
            attachKeyListeners();
        });
    }

    function attachKeyListeners() {
        document.querySelectorAll('.btn-copy-key').forEach(btn => {
            btn.onclick = (e) => {
                const key = e.target.closest('.group') ? e.target.closest('.group').querySelector('code').innerText : "";
                if(key) navigator.clipboard.writeText(key).then(() => {
                    const original = btn.innerHTML;
                    btn.innerHTML = '<i data-lucide="check" class="text-success icon-sm"></i>';
                    if(window.lucide) window.lucide.createIcons();
                    setTimeout(() => { btn.innerHTML = original; if(window.lucide) window.lucide.createIcons(); }, 1000);
                });
            };
        });

        document.querySelectorAll('.btn-delete-key').forEach(btn => {
            btn.onclick = () => btn.closest('.group').remove();
        });
    }

    attachKeyListeners();
}

// --- Change Password Logic ---
function initPassword() {
    const pwdForm = document.getElementById('password-form');
    if (!pwdForm) return;

    pwdForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const oldPass = document.getElementById('old-pwd').value;
        const newPass = document.getElementById('new-pwd').value;
        const confirmPass = document.getElementById('confirm-pwd').value;

        // 1. Client-side Validation
        if (newPass !== confirmPass) {
            showToast("Passwords do not match ❌", "error");
            return;
        }

        if (newPass.length < 8) {
            showToast("Password must be at least 8 chars 🔒", "error");
            return;
        }

        const updateBtn = document.getElementById('btn-update-pwd');
        const originalContent = updateBtn.innerHTML;
        updateBtn.innerHTML = '<i data-lucide="loader" class="icon-sm animate-spin mr-2"></i> Updating...';
        updateBtn.disabled = true;
        if(window.lucide) window.lucide.createIcons();

        try {
            const auth = window.authData ? window.authData.auth : (window.firebase ? window.firebase.auth() : null);
            const user = auth ? auth.currentUser : null;

            if (!user) {
                showToast("User session not found 🔒", "error");
                return;
            }

            // Step 1: Re-authenticate
            const credential = firebase.auth.EmailAuthProvider.credential(user.email, oldPass);
            await user.reauthenticateWithCredential(credential);

            // Step 2: Update Password
            await user.updatePassword(newPass);

            // Step 3: Success
            showToast("Password Updated Successfully ✅", "success");
            pwdForm.reset();
            
            setTimeout(() => switchView('dashboard'), 1500);

        } catch (error) {
            console.error("Password Update Error:", error);
            showToast(error.message, "error");
        } finally {
            updateBtn.innerHTML = originalContent;
            updateBtn.disabled = false;
            if(window.lucide) window.lucide.createIcons();
        }
    });
}

// --- 2FA Security Logic ---
function init2FA() {
    const toggle2FA = document.getElementById('toggle-2fa');
    const setupArea = document.getElementById('2fa-setup-area');
    const enabledView = document.getElementById('2fa-enabled-view');
    const statusText = document.getElementById('2fa-status-text');
    const verifyBtn = document.getElementById('btn-verify-2fa');
    const otpInput = document.getElementById('otp-input');

    if (!toggle2FA) return;

    // Load current state
    const settings = JSON.parse(localStorage.getItem('appSettings')) || {};
    const isEnabled = settings.is2FAEnabled === true;

    // Set UI state initially
    if (isEnabled) {
        toggle2FA.checked = true;
        if (statusText) {
            statusText.innerText = 'ENABLED ✅';
            statusText.classList.replace('text-danger', 'text-success');
        }
        if (enabledView) enabledView.classList.remove('hidden');
    }

    // Toggle setup area
    toggle2FA.addEventListener('change', (e) => {
        if (e.target.checked) {
            if (setupArea) setupArea.classList.remove('hidden');
            if (enabledView) enabledView.classList.add('hidden');
        } else {
            if (setupArea) setupArea.classList.add('hidden');
            if (enabledView) enabledView.classList.add('hidden');
            if (statusText) {
                statusText.innerText = 'DISABLED 🛑';
                statusText.classList.remove('text-success');
                statusText.classList.add('text-danger');
            }
            
            // Save immediately on disable
            saveSettings({ is2FAEnabled: false });
            showToast("Two Factor Authentication Disabled 🔒", "info");
        }
    });

    // Verification Logic
    if (verifyBtn) {
        verifyBtn.addEventListener('click', () => {
            const code = otpInput ? otpInput.value.trim() : "";
            if (code.length !== 6) {
                showToast("Please enter a valid 6-digit code ❌", "error");
                return;
            }

            const originalContent = verifyBtn.innerHTML;
            verifyBtn.innerHTML = '<i data-lucide="loader" class="icon-sm animate-spin mr-2"></i> Verifying...';
            if(window.lucide) window.lucide.createIcons();

            setTimeout(() => {
                if (setupArea) setupArea.classList.add('hidden');
                if (enabledView) enabledView.classList.remove('hidden');
                if (statusText) {
                    statusText.innerText = 'ENABLED ✅';
                    statusText.classList.remove('text-danger');
                    statusText.classList.add('text-success');
                }

                // Save to storage
                saveSettings({ is2FAEnabled: true });
                showToast("Two Factor Authentication Active! 🚀", "success");

                verifyBtn.innerHTML = originalContent;
                if(window.lucide) window.lucide.createIcons();
            }, 1500);
        });
    }
}

// --- Usage Stats Logic (Chart.js) ---
function initUsage() {
    const canvas = document.getElementById('usageChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Create Gradients
    const gradIndigo = ctx.createLinearGradient(0, 0, 0, 400);
    gradIndigo.addColorStop(0, 'rgba(99, 102, 241, 0.4)');
    gradIndigo.addColorStop(1, 'rgba(99, 102, 241, 0)');

    const gradCyan = ctx.createLinearGradient(0, 0, 0, 400);
    gradCyan.addColorStop(0, 'rgba(6, 182, 212, 0.4)');
    gradCyan.addColorStop(1, 'rgba(6, 182, 212, 0)');

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [
                {
                    label: 'API Hits',
                    data: [110, 150, 130, 220, 180, 120, 90],
                    borderColor: '#6366f1',
                    backgroundColor: gradIndigo,
                    fill: true,
                    tension: 0.4,
                    borderWidth: 3,
                    pointRadius: 4,
                    pointBackgroundColor: '#6366f1',
                    pointHoverRadius: 6
                },
                {
                    label: 'Fraud Scans',
                    data: [60, 40, 80, 55, 90, 70, 85],
                    borderColor: '#06b6d4',
                    backgroundColor: gradCyan,
                    fill: true,
                    tension: 0.4,
                    borderWidth: 3,
                    pointRadius: 4,
                    pointBackgroundColor: '#06b6d4',
                    pointHoverRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    titleFont: { size: 12, weight: 'bold' },
                    padding: 12,
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1,
                    displayColors: true,
                    boxPadding: 6
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 10 } }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 10 } }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });

    if(window.lucide) window.lucide.createIcons();
}

// --- Payment History Logic ---
function initHistory() {
    if(window.lucide) window.lucide.createIcons();
}

/**
 * Simulates a PDF invoice download for the user.
 * @param {string} txnId - The transaction ID to "download"
 */
window.simulateInvoiceDownload = function(txnId) {
    showToast(`Generating Invoice for ${txnId}...`, "info");
    
    setTimeout(() => {
        showToast(`Invoice ${txnId}.pdf downloaded successfully! ✅`, "success");
    }, 1500);
};
