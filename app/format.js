export const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const money = value => new Intl.NumberFormat('en-US', {style:'currency',currency:'USD',maximumFractionDigits:2}).format(Number(value)||0);
export const date = value => value && Number.isFinite(Date.parse(value)) ? new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric',hour:'2-digit',minute:'2-digit',timeZone:'UTC'}).format(new Date(value)) + ' UTC' : 'Not announced';
export function timeLeft(value) { const ms = Date.parse(value)-Date.now(); if(!Number.isFinite(ms)) return 'No deadline'; if(ms<=0) return 'Closed'; const m=Math.ceil(ms/60000); return m>=1440 ? `${Math.floor(m/1440)}d ${Math.floor(m%1440/60)}h left` : `${Math.floor(m/60)}h ${m%60}m left`; }
export const bountyURL = slug => '#/bounty/'+encodeURIComponent(slug);
export const items = d => Array.isArray(d) ? d : d.items || d.competitions || [];
export const detail = d => d.competition || d.bounty || d;
export const pot = d => d.potUsd ?? d.rewardAmount ?? 0;
export const status = d => Date.parse(d.deadline)<=Date.now() ? 'Closed' : Date.parse(d.opensAt || d.publishedAt)>Date.now() ? 'Upcoming' : 'Open';
export function prose(text) { return String(text || '').split(/\n\n+/).map(p=>/^#{1,3} /.test(p)?`<h3>${esc(p.replace(/^#{1,3} /,''))}</h3>`:`<p>${esc(p).replace(/\n/g,'<br>')}</p>`).join(''); }
export function pager(page, total, size) { const pages=Math.max(1,Math.ceil(total/size)); return `<div class="pagination"><span>${total} results · Page ${page+1} of ${pages}</span><div><button data-page="${page-1}" ${page===0?'disabled':''}>← Previous</button><button data-page="${page+1}" ${page+1>=pages?'disabled':''}>Next →</button></div></div>`; }
