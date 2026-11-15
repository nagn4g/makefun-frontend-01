const cache = new Map();
const pending = new Map();
export async function get(path) {
  const url = `https://make.fun/api${path}`;
  const old = cache.get(url);
  if (old && Date.now() - old.time < 60000) return old.data;
  if (pending.has(url)) return pending.get(url);
  const promise = (async () => {
    const response = await fetch(url, { method: 'GET', headers: old?.etag ? { 'If-None-Match': old.etag } : {}, signal: AbortSignal.timeout(20000) });
    if (response.status === 304 && old) { old.time = Date.now(); return old.data; }
    if (!response.ok) throw new Error(response.status === 404 ? 'This page could not be found.' : `The live API returned ${response.status}.`);
    const data = await response.json();
    cache.set(url, { data, etag: response.headers.get('ETag'), time: Date.now() });
    return data;
  })();
  pending.set(url, promise);
  try { return await promise; } finally { pending.delete(url); }
}
export const getBounties = () => get('/competitions?status=open&activity=times');
export const getBounty = slug => get(`/competitions/${encodeURIComponent(slug)}`);
export const getLeaderboard = slug => get(`/competitions/${encodeURIComponent(slug)}/leaderboard`);
export const getProfile = handle => get(`/profiles/${encodeURIComponent(handle)}`);
