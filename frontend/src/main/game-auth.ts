import { API_BASE } from './config.js';

const API = `${API_BASE}/api/auth`;

async function checkAuth(): Promise<void> {
    try {
        const res = await fetch(`${API}/me`, { credentials: 'include' });
        if (!res.ok) {
            window.location.href = 'login.html';
            return;
        }
        const data = await res.json();
        const welcomeEl = document.getElementById('welcome');
        if (welcomeEl) welcomeEl.textContent = 'Hi, ' + data.username;
    } catch {
        window.location.href = 'login.html';
    }
}

async function logout(): Promise<void> {
    await fetch(`${API}/logout`, { method: 'POST', credentials: 'include' });
    window.location.href = 'login.html';
}

(window as any).logout = logout;

checkAuth();

// --- INACTIVITY LOGOUT (1 minute) ---
const INACTIVITY_MS = 60_000;
let inactivityTimer: number;

function resetInactivityTimer(): void {
    clearTimeout(inactivityTimer);
    inactivityTimer = window.setTimeout(async () => {
        await logout();
    }, INACTIVITY_MS);
}

const activityEvents: string[] = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
activityEvents.forEach(event => window.addEventListener(event, resetInactivityTimer));

resetInactivityTimer();