const API = 'https://make.fun/api';
export function createCache(ttl = 60000) { return {ttl, entries: new Map()}; }
const cache = createCache();
let serverOffset = 0, clockSynced = false;
export async function revalidateWithEtag(path, signal) {
  const old = cache.entries.get(path);
  if (old && Date.now() - old.at < cache.ttl) return old.data;
  const response = await fetch(API + path, {signal, headers: old?.etag ? {'If-None-Match': old.etag} : {}});
  const timestamp = Date.parse(response.headers.get('date'));
  if (!clockSynced && Number.isFinite(timestamp)) { serverOffset = timestamp - Date.now(); clockSynced = true; }
  if (response.status === 304 && old) { old.at = Date.now(); return old.data; }
  if (!response.ok) throw new Error(response.status === 404 ? 'Unknown bounty or maker' : `Live API returned ${response.status}`);
  const data = await response.json();
  cache.entries.set(path, {data, at: Date.now(), etag: response.headers.get('etag')});
  return data;
}
// Follow server cursors, then let views slice the complete cached list.
async function collectPages(path, key, signal) {
  let cursor, first, rows = [];
  const seen = new Set();
  do {
    const data = await revalidateWithEtag(path + (path.includes('?') ? '&' : '?') + 'limit=100' + (cursor ? '&cursor=' + encodeURIComponent(cursor) : ''), signal);
    first ??= data;
    const batch = Array.isArray(data) ? data : data[key] ?? data.items ?? [];
    if (!Array.isArray(batch)) throw new Error('Unexpected API list response');
    rows.push(...batch);
    cursor = data.next_cursor;
    if (cursor && seen.has(cursor)) throw new Error('API repeated a pagination cursor');
    seen.add(cursor);
  } while (cursor);
  return {...first, [key]: rows, next_cursor: null};
}
export const getBounties = signal => collectPages('/competitions?status=open&activity=times', 'competitions', signal);
export const getBounty = (slug, signal) => revalidateWithEtag(`/competitions/${encodeURIComponent(slug)}`, signal);
export const getLeaderboard = (slug, signal) => collectPages(`/competitions/${encodeURIComponent(slug)}/leaderboard`, 'entries', signal);
export const getProfile = (handle, signal) => revalidateWithEtag(`/profiles/${encodeURIComponent(handle)}`, signal);
export const getServerNow = () => Date.now() + serverOffset;
