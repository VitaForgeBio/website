import React, { useState, useEffect } from 'react';

const PASSWORD_HASH = "027423da46570e51952674e5562f81283c315fcaf0ae00e7240132b456adde30";
const SESSION_KEY = "vf_access_granted";

async function hashString(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function AuthGuard({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [inputVal, setInputVal] = useState("");
    const [error, setError] = useState(false);

    useEffect(() => {
        if (sessionStorage.getItem(SESSION_KEY)) {
            setIsAuthenticated(true);
        }
        setIsLoading(false);
    }, []);

    const handleLogin = async () => {
        const hash = await hashString(inputVal);
        if (hash === PASSWORD_HASH) {
            sessionStorage.setItem(SESSION_KEY, 'true');
            setIsAuthenticated(true);
        } else {
            setError(true);
            setInputVal("");
        }
    };

    if (isLoading) return null;

    if (isAuthenticated) {
        return <>{children}</>;
    }

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'radial-gradient(circle at center, #1a2f45 0%, #050b14 70%)',
            zIndex: 2147483647, display: 'flex', flexDirection: 'column',
            justifyContent: 'center', alignItems: 'center',
            fontFamily: "'Segoe UI', Roboto, sans-serif"
        }}>
            <div className="vf-login-box" style={{
                background: '#0f1d2e', padding: '3rem', borderRadius: '20px',
                border: '1px solid #00f0ff', textAlign: 'center', width: '90%', maxWidth: '400px',
                boxShadow: '0 0 30px rgba(0, 240, 255, 0.1)'
            }}>
                <h1 style={{ color: 'white', margin: '0 0 10px 0' }}>Restricted Access</h1>
                <p style={{ color: '#888' }}>VitaForge Internal System</p>
                <input
                    type="password"
                    className="vf-login-input"
                    placeholder="Enter Access Code"
                    style={{
                        width: '100%', padding: '15px', fontSize: '1.2rem', margin: '20px 0',
                        background: 'rgba(0,0,0,0.3)', border: '1px solid #333', color: 'white',
                        borderRadius: '8px', textAlign: 'center', outline: 'none', boxSizing: 'border-box'
                    }}
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                    autoFocus
                />
                <button
                    className="vf-login-btn"
                    style={{
                        width: '100%', padding: '15px', fontSize: '1.1rem',
                        background: 'linear-gradient(90deg, #ff4d00, #ff7700)',
                        color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer',
                        fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase'
                    }}
                    onClick={handleLogin}
                >
                    LAUNCH SYSTEM
                </button>
                {error && <div className="vf-error" style={{ color: '#ff4444', marginTop: '15px' }}>INVALID ACCESS CODE</div>}
            </div>
        </div>
    );
}
