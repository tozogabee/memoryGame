export {};

const API = 'http://localhost:4000/api/auth';

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