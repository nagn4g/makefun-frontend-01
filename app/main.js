import {getBounties,getBounty,getLeaderboard,getProfile,getServerNow} from './api.js';
import {renderBoard,renderBounty,listOf,potOf,availableRewards} from './views.js';
import {esc,formatTimeLeft,money} from './format.js';
const root = document.querySelector('#app');
let controller, routeKey = '', page = 0, query = '';
window.__shotReady = false;
async function markRendered(signal) {
  await document.fonts.ready;
  if (signal.aborted) return;
  root.setAttribute('aria-busy', 'false');
  window.__shotReady = true;
}
function bindPagination(draw) {
  root.querySelector('[data-prev]')?.addEventListener('click', () => { page--; draw(); });
  root.querySelector('[data-next]')?.addEventListener('click', () => { page++; draw(); });
}
async function route() {
  controller?.abort(); controller = new AbortController();
  const {signal} = controller;
  window.__shotReady = false; page = 0;
  routeKey = location.hash || '#/';
  root.setAttribute('aria-busy', 'true');
  root.innerHTML = '<div class="loading" role="status">Loading live data…</div>';
  try {
    const parts = routeKey.slice(2).split('/').map(decodeURIComponent);
    if (parts[0] === 'bounty' && parts[1] && parts.length <= 3 && (!parts[2] || parts[2] === 'leaderboard')) {
      if (parts[2] === 'leaderboard') {
        const [module,data] = await Promise.all([import('./secondary.js'),getLeaderboard(parts[1],signal)]);
        if (signal.aborted) return;
        const draw = () => { root.innerHTML = module.renderLeaderboard(data,parts[1],page); bindPagination(draw); };
        draw(); document.title = 'Leaderboard · make.fun';
      } else {
        const data = await getBounty(parts[1],signal);
        if (signal.aborted) return;
        root.innerHTML = renderBounty(data);
        document.title = `${data.competition?.title ?? data.title ?? 'Bounty'} · make.fun`;
      }
    } else if (parts[0] === 'u' && parts.length <= 2) {
      if (!parts[1]) {
        root.innerHTML = '<section class="panel"><h1>Find a maker</h1><form><label>Handle <input name="handle" required placeholder="Your make.fun handle" autocomplete="username"></label><button>View profile →</button></form></section>';
        root.querySelector('form').onsubmit = event => { event.preventDefault(); const handle = new FormData(event.target).get('handle').trim().replace(/^@/,''); if (handle) location.hash = `#/u/${encodeURIComponent(handle)}`; };
        document.title = 'Find a maker · make.fun';
      } else {
        const [module,data] = await Promise.all([import('./secondary.js'),getProfile(parts[1],signal)]);
        if (signal.aborted) return;
        root.innerHTML = module.renderProfile(data,parts[1]);
        root.querySelector('img')?.addEventListener('error',event => { event.target.hidden = true; });
        document.title = `@${parts[1]} · make.fun`;
      }
    } else if (!parts[0]) {
      const data = await getBounties(signal);
      if (signal.aborted) return;
      const draw = () => {
        root.innerHTML = renderBoard(data,query,page);
        root.querySelector('#search').addEventListener('input', event => {
          query = event.target.value; page = 0;
          const start = event.target.selectionStart;
          draw(); const input = root.querySelector('#search'); input.focus();
          if (input.type !== 'search') input.setSelectionRange(start,start);
        });
        bindPagination(draw);
      };
      draw(); document.title = 'Bounties · make.fun';
    } else throw new Error('Unknown route');
    await markRendered(signal);
  } catch (error) {
    if (signal.aborted) return;
    document.title = 'Page unavailable · make.fun';
    root.innerHTML = `<section class="empty"><h1>Could not load this page</h1><p>${esc(error.message)}</p><button id="retry">Retry</button> <a href="#/">Back to bounties</a></section>`;
    root.querySelector('#retry').onclick = route;
    root.setAttribute('aria-busy','false');
    // Error pages deliberately do not satisfy the live-data screenshot gate.
  }
}
async function refreshLiveMetrics() {
  const signal = controller?.signal, key = routeKey;
  if (!signal || signal.aborted) return;
  for (const node of root.querySelectorAll('[data-countdown]')) node.textContent = formatTimeLeft(node.dataset.countdown,getServerNow());
  if (key !== '#/' && !/^#\/bounty\/[^/]+$/.test(key)) return;
  try {
    const data = key === '#/' ? await getBounties(signal) : await getBounty(decodeURIComponent(key.split('/')[2]),signal);
    if (signal.aborted || routeKey !== key) return;
    const rows = key === '#/' ? listOf(data) : [data.competition ?? data];
    for (const node of root.querySelectorAll('[data-pot]')) {
      if (node.dataset.pot === '__available') { node.textContent = money(availableRewards(rows)); continue; }
      const bounty = rows.find(item => item.slug === node.dataset.pot);
      if (bounty) node.textContent = money(potOf(bounty)); // Dollar amounts, as on initial render.
    }
  } catch { /* Preserve the last successful data while offline. */ }
}
addEventListener('hashchange',route);
document.querySelector('#skip-link').addEventListener('click',event => { event.preventDefault(); root.focus(); });
setInterval(refreshLiveMetrics,60000);
route();
