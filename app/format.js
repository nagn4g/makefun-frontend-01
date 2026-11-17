export const esc = value => String(value ?? '—').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
export function money(value, minimumFractionDigits = 0) {
  // Money fields are already dollars.
  if ((typeof value !== 'number' && typeof value !== 'string') || String(value).trim() === '') return '—';
  const dollars = Number(value);
  if (!Number.isFinite(dollars)) return '—';
  return dollars.toLocaleString('en-US', {style: 'currency', currency: 'USD', minimumFractionDigits: Number.isInteger(dollars) ? minimumFractionDigits : 2, maximumFractionDigits: 2});
}
export const formatDate = value => {
  const date = value == null ? NaN : Date.parse(value);
  return Number.isFinite(date) ? new Date(date).toISOString().replace('T', ' ').slice(0, 16) + ' UTC' : '—';
};
export function formatTimeLeft(value, now = Date.now()) {
  const deadline = value == null ? NaN : Date.parse(value);
  if (!Number.isFinite(deadline)) return '—';
  const minutes = Math.ceil((deadline - now) / 60000);
  if (minutes <= 0) return 'Closed';
  const days = Math.floor(minutes / 1440), hours = Math.floor(minutes % 1440 / 60);
  return days ? `${days}d ${hours}h` : hours ? `${hours}h ${minutes % 60}m` : `${minutes}m`;
}
export const statusByDeadline = (deadline, now = Date.now()) => !Number.isFinite(Date.parse(deadline)) ? 'UNKNOWN DEADLINE' : Date.parse(deadline) <= now ? 'CLOSED · DEADLINE' : 'OPEN';
