export {};

const API = 'http://localhost:4000/api/auth';

function showTab(tab: 'login' | 'register'): void {
    const isLogin = tab === 'login';
    (document.getElementById('form-login') as HTMLElement).classList.toggle('hidden', !isLogin);
    (document.getElementById('form-register') as HTMLElement).classList.toggle('hidden', isLogin);
    (document.getElementById('check-email') as HTMLElement).classList.add('hidden');
    (document.getElementById('tab-login') as HTMLElement).classList.toggle('active', isLogin);
    (document.getElementById('tab-register') as HTMLElement).classList.toggle('active', !isLogin);
}

async function handleLogin(e: Event): Promise<void> {
    e.preventDefault();
    const username = (document.getElementById('login-username') as HTMLInputElement).value.trim();
    const password = (document.getElementById('login-password') as HTMLInputElement).value;
    const errorEl = document.getElementById('login-error') as HTMLElement;
    errorEl.textContent = '';

    try {
        const res = await fetch(`${API}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ username, password }),
        });
        const data = await res.json();
        if (!res.ok) {
            errorEl.textContent = data.error;
            return;
        }
        window.location.href = 'game.html';
    } catch {
        errorEl.textContent = 'Could not connect to server.';
    }
}

async function handleRegister(e: Event): Promise<void> {
    e.preventDefault();
    const username = (document.getElementById('reg-username') as HTMLInputElement).value.trim();
    const email = (document.getElementById('reg-email') as HTMLInputElement).value.trim();
    const password = (document.getElementById('reg-password') as HTMLInputElement).value;
    const confirm = (document.getElementById('reg-confirm') as HTMLInputElement).value;
    const errorEl = document.getElementById('register-error') as HTMLElement;
    errorEl.textContent = '';

    if (password !== confirm) {
        errorEl.textContent = 'Passwords do not match.';
        return;
    }

    try {
        const res = await fetch(`${API}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ username, email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
            errorEl.textContent = data.error;
            return;
        }

        (document.getElementById('form-register') as HTMLElement).classList.add('hidden');
        (document.getElementById('tab-login') as HTMLElement).classList.remove('active');
        (document.getElementById('tab-register') as HTMLElement).classList.remove('active');
        const msg = document.getElementById('check-email-msg') as HTMLElement;
        msg.textContent = `We sent a confirmation email to ${email}. Click the link inside to activate your account.`;
        (document.getElementById('check-email') as HTMLElement).classList.remove('hidden');
    } catch {
        errorEl.textContent = 'Could not connect to server.';
    }
}

(window as any).showTab = showTab;
(window as any).handleLogin = handleLogin;
(window as any).handleRegister = handleRegister;