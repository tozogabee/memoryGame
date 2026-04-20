import { API_BASE } from './config.js';

const API = `${API_BASE}/api/scores/ranking`;

async function loadRanking(): Promise<void> {
    const tbody = document.getElementById('ranking-body') as HTMLElement;
    try {
        const res = await fetch(API);
        const data: { username: string; score: number; duration_seconds: number; created_at: string }[] = await res.json();

        if (!data.length) {
            tbody.innerHTML = '<tr><td colspan="5" class="loading">No scores yet. Be the first!</td></tr>';
            return;
        }

        tbody.innerHTML = data.map((entry, i) => {
            const date = new Date(entry.created_at).toLocaleDateString();
            const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : String(i + 1);
            return `
                <tr class="${i < 3 ? 'top-' + (i + 1) : ''}">
                    <td class="rank">${medal}</td>
                    <td class="username">${entry.username}</td>
                    <td class="score">${entry.score}</td>
                    <td class="duration">${entry.duration_seconds}s</td>
                    <td class="date">${date}</td>
                </tr>`;
        }).join('');
    } catch {
        tbody.innerHTML = '<tr><td colspan="5" class="loading">Could not load ranking.</td></tr>';
    }
}

loadRanking();
