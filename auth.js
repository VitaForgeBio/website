(function() {
    // SHA-256 hash for "VF2026"
    const PASSWORD_HASH = "027423da46570e51952674e5562f81283c315fcaf0ae00e7240132b456adde30";
    const SESSION_KEY = "vf_access_granted";

    // --- IMMEDIATE PROTECTION ---
    // REMOVED "opacity: 0 !important" from this line:
    if (!sessionStorage.getItem(SESSION_KEY)) {
        const style = document.createElement('style');
        style.id = 'auth-style-blocker';
        style.innerHTML = 'body { visibility: hidden !important; }'; 
        document.head.appendChild(style);
    }

    async function hashString(message) {
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    window.addEventListener('DOMContentLoaded', () => {
        const unlockPage = () => {
            const blocker = document.getElementById('auth-style-blocker');
            if (blocker) blocker.remove();
            
            document.body.style.visibility = 'visible';
            // Opacity transition logic isn't strictly necessary for visibility, 
            // but if you keep it in CSS, ensure body starts at opacity 1 or handles transition class.
            
            window.dispatchEvent(new Event('vf-app-start'));
        };

        if (sessionStorage.getItem(SESSION_KEY)) {
            unlockPage();
            return;
        }

        // --- RENDER LOGIN UI ---
        const loginOverlay = document.createElement('div');
        loginOverlay.id = 'vf-login-overlay';
        
        const css = `
            #vf-login-overlay {
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: radial-gradient(circle at center, #1a2f45 0%, #050b14 70%);
                z-index: 2147483647; display: flex; flex-direction: column;
                justify-content: center; align-items: center; 
                visibility: visible; /* CRITICAL: Overrides body hidden */
                opacity: 1;
                font-family: 'Segoe UI', Roboto, sans-serif;
            }
            .vf-login-box {
                background: #0f1d2e; padding: 3rem; border-radius: 20px;
                border: 1px solid #00f0ff; text-align: center; width: 90%; max-width: 400px;
                box-shadow: 0 0 30px rgba(0, 240, 255, 0.1);
            }
            .vf-login-input {
                width: 100%; padding: 15px; font-size: 1.2rem; margin: 20px 0;
                background: rgba(0,0,0,0.3); border: 1px solid #333; color: white;
                border-radius: 8px; text-align: center; outline: none; box-sizing: border-box;
            }
            .vf-login-input:focus { border-color: #00f0ff; }
            .vf-login-btn {
                width: 100%; padding: 15px; font-size: 1.1rem;
                background: linear-gradient(90deg, #ff4d00, #ff7700);
                color: white; border: none; border-radius: 8px; cursor: pointer;
                font-weight: bold; letter-spacing: 2px; text-transform: uppercase;
            }
            .vf-login-btn:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(255, 77, 0, 0.4); }
            .vf-error { color: #ff4444; margin-top: 15px; display: none; }
        `;
        
        const styleTag = document.createElement('style');
        styleTag.innerHTML = css;
        document.head.appendChild(styleTag);

        loginOverlay.innerHTML = `
            <div class="vf-login-box">
                <h1 style="color:white; margin:0 0 10px 0;">Restricted Access</h1>
                <p style="color:#888;">VitaForge Internal System</p>
                <input type="password" class="vf-login-input" placeholder="Enter Access Code">
                <button class="vf-login-btn">LAUNCH SYSTEM</button>
                <div class="vf-error">INVALID ACCESS CODE</div>
            </div>
        `;
        
        document.body.appendChild(loginOverlay);

        const input = loginOverlay.querySelector('input');
        const btn = loginOverlay.querySelector('button');
        const error = loginOverlay.querySelector('.vf-error');

        const attemptLogin = async () => {
            const userHash = await hashString(input.value);
            // Hash for "VF2026"
            if (userHash === PASSWORD_HASH) {
                sessionStorage.setItem(SESSION_KEY, 'true');
                loginOverlay.style.opacity = '0';
                loginOverlay.style.transition = 'opacity 0.5s';
                setTimeout(() => {
                    loginOverlay.remove();
                    unlockPage();
                }, 500);
            } else {
                error.style.display = 'block';
                input.value = '';
                input.focus();
            }
        };

        btn.addEventListener('click', attemptLogin);
        input.addEventListener('keypress', (e) => { if (e.key === 'Enter') attemptLogin(); });
    });
})();
