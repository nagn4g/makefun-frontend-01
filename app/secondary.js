import {esc,money} from './format.js';
import {listOf,unwrap,bountyUrl,pager} from './views.js';
const score = value => value == null || !Number.isFinite(Number(value)) ? '—' : (Number(value) / 1e6).toFixed(3);
export function renderLeaderboard(data,slug,page = 0) {
  const entries = listOf(data);
  return `<a class="back" href="${bountyUrl(slug)}">← Back to bounty</a><div class="section-head"><div><p class="eyebrow">THE MAKERS BEHIND THE WORK</p><h1>Leaderboard</h1><p>${esc(slug)} · ${entries.length} entries</p></div><span class="badge">LIVE RANKINGS</span></div><section class="panel table-scroll"><table><thead><tr><th>Rank</th><th>Maker / Entry</th><th>Win rate</th><th>Prize rank</th></tr></thead><tbody>${entries.slice(page*50,page*50+50).map((entry,index) => {
    const handle = entry.handle ?? entry.user?.handle;
    return `<tr><td class="rank">${esc(entry.rank ?? page*50+index+1)}</td><td>${handle ? `<a href="#/u/${encodeURIComponent(handle)}">@${esc(handle)}</a>` : '—'}<div>${esc(entry.title ?? entry.entry_title ?? entry.solution?.title)}</div></td><td>${score(entry.values?.judge)}</td><td>${esc(entry.prize_rank)}</td></tr>`;
  }).join('') || '<tr><td colspan="4">No entries yet. Be the first to build.</td></tr>'}</tbody></table></section>${pager(page,entries.length,50)}`;
}
export function renderProfile(raw,handle) {
  const profile = unwrap(raw);
  if (!profile || profile.error || (!profile.handle && !profile.display_name && !profile.name && !profile.record && !profile.stats)) throw new Error('Unknown maker');
  const record = profile.record ?? profile.stats ?? {};
  const wallet = profile.wallet?.address ?? profile.wallet_address ?? (typeof profile.wallet === 'string' ? profile.wallet : null);
  const solutions = profile.solutions ?? profile.entries ?? [];
  const avatar = profile.avatar?.url ?? profile.image;
  // Use the API's avatar URL; reject non-HTTPS sources.
  let avatarUrl = '';
  try { const url = new URL(avatar, 'https://make.fun'); if (avatar && url.protocol === 'https:') avatarUrl = url.href; } catch {}
  return `<a class="back" href="#/">← Explore bounties</a><section class="profile-head panel">${avatarUrl ? `<img class="avatar" src="${esc(avatarUrl)}" alt="" loading="lazy">` : '<div class="avatar placeholder" aria-label="No avatar">—</div>'}<div><p class="eyebrow">MAKER PROFILE</p><h1>${esc(profile.display_name ?? profile.name ?? handle)}</h1><p class="mint">@${esc(profile.handle ?? handle)}</p><p>${esc(profile.bio)}</p><div class="meta">GitHub: ${esc(profile.github_login)} · Discord: ${esc(profile.discord)}</div><div class="wallet">Wallet: ${wallet ? `<a href="${esc(profile.wallet?.explorer_url)}" target="_blank" rel="noreferrer">${esc(wallet)} ↗</a>` : '—'}</div></div></section><section class="record">${[['Entered',record.competitions_entered],['Placed',record.competitions_placed],['Won',record.competitions_won],['Best rank',record.best_placement],['Prize $',money(record.prize_usd,2)]].map(([label,value]) => `<div class="panel"><small>${label}</small><strong>${esc(value)}</strong></div>`).join('')}</section><h2>Solutions</h2><section class="panel">${solutions.map(solution => `<a class="solution" href="${bountyUrl(solution.competition_slug ?? solution.bounty_slug ?? solution.competition?.slug ?? solution.slug)}"><div><h3>${esc(solution.title ?? solution.entry_title)}</h3><p>${esc(solution.competition_title ?? solution.competition?.title ?? solution.competition_slug)}</p><p>Score: ${score(solution.score?.value)} · Bounty: ${money(solution.competition?.reward_usd)} · Prize: ${money(solution.prize_usd,2)}</p></div><span>View bounty ↗</span></a>`).join('') || '<p class="empty">No solutions yet.</p>'}</section>`;
}
