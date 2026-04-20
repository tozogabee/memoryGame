import { API_BASE } from './config.js';

fetch(`${API_BASE}/api/auth/me`, { credentials: 'include' })
    .then(r => { if (r.ok) window.location.href = 'game.html'; })
    .catch(() => {});