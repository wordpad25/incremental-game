// ─── Game State API Helpers ──────────────────────────────────
export const GAME_ID = 'incremental';
export const API_BASE = 'http://localhost:8787';

export function getToken() {
    try {
        const auth = localStorage.getItem('fq_auth');
        if (auth) return JSON.parse(auth).token;
    } catch { /* ignore */ }
    return '';
}

export async function loadStateFromAPI() {
    try {
        const res = await fetch(`${API_BASE}/api/games/${GAME_ID}/state`, {
            headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (!res.ok) return null;
        const data = await res.json();
        return data?.state || null;
    } catch {
        return null;
    }
}

export async function saveStateToAPI(state) {
    try {
        await fetch(`${API_BASE}/api/games/${GAME_ID}/state`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${getToken()}`,
            },
            body: JSON.stringify({ state }),
        });
    } catch { /* silent */ }
}
