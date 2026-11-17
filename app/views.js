import {esc,money,formatDate,formatTimeLeft,statusByDeadline} from './format.js';
import {getServerNow} from './api.js';
export const unwrap = data => data?.competition ?? data?.profile ?? data;
export const listOf = data => Array.isArray(data) ? data : data?.competitions ?? data?.entries ?? data?.solutions ?? data?.items ?? [];
export const deadlineOf = bounty => bounty.deadline ?? bounty.closes_at ?? bounty.ends_at;
export const potOf = bounty => bounty.potUsd == null ? bounty.rewardAmount : Number.parseFloat(bounty.potUsd);
export const feeOf = bounty => bounty.entryFeeUsd;
export const bountyUrl = slug => `#/bounty/${encodeURIComponent(slug ?? '')}`;
export const isOpen = bounty => Number.isFinite(Date.parse(deadlineOf(bounty))) && Date.parse(deadlineOf(bounty)) > getServerNow();
export const availableRewards = rows => rows.filter(isOpen).reduce((sum,bounty) => sum + (Number.isFinite(potOf(bounty)) ? potOf(bounty) : 0),0);
export const pager = (page,total,size) => `<div class="pager"><button data-prev ${page === 0 ? 'disabled' : ''}>← Previous</button><span>Page ${page+1} of ${Math.max(1,Math.ceil(total/size))}</span><button data-next ${(page+1)*size >= total ? 'disabled' : ''}>Next →</button></div>${(page+1)*size >= total ? '<p class="end-note">End of results</p>' : ''}`;
export function metricSlots(bounty) {
  const deadline = deadlineOf(bounty);
  return `<div class="metrics"><div><small>Live pot</small><strong class="mint" data-pot="${esc(bounty.slug)}">${money(potOf(bounty))}</strong></div><div><small>Entry fee</small><strong>${feeOf(bounty) === null ? 'Free' : money(feeOf(bounty))}</strong></div><div><small>Closes in</small><strong data-countdown="${esc(deadline ?? '')}">${formatTimeLeft(deadline,getServerNow())}</strong><time>${formatDate(deadline)}</time></div></div>`;
}
function feeShare(bounty) {
  const pot = potOf(bounty), fee = feeOf(bounty) === null ? 0 : Number(feeOf(bounty));
  if (!Number.isFinite(pot) || pot <= 0 || !Number.isFinite(fee)) return 'Fee / pot —';
  return `${(fee / pot * 100).toFixed(2)}% fee / pot`;
}
export function renderBoard(data,query = '',page = 0) {
  const all = listOf(data).slice().sort((a,b) => Number(!isOpen(a)) - Number(!isOpen(b)) || (Date.parse(deadlineOf(a)) || Infinity) - (Date.parse(deadlineOf(b)) || Infinity));
  const rows = all.filter(bounty => String(bounty.title ?? '').toLowerCase().includes(query.toLowerCase()));
  return `<section class="hero"><div><p class="eyebrow">BUILD SOMETHING. WIN SOMETHING.</p><h1>Your next big<br>idea starts here<span>.</span></h1><p>Discover bounties, ship your best work, and earn rewards.</p></div><aside><small>Available rewards</small><strong data-pot="__available">${money(availableRewards(all))}</strong><span>${all.length} bounties · live on make.fun</span></aside></section><section class="board"><div class="section-head"><h2>Explore bounties <span class="badge">LIVE</span></h2><label class="search">⌕ <input id="search" type="text" placeholder="Search bounties…" value="${esc(query)}" aria-label="Search by title"></label></div><div class="list">${rows.slice(page*20,page*20+20).map(bounty => `<a class="bounty-card" href="${bountyUrl(bounty.slug)}"><div class="card-title"><span class="badge">${statusByDeadline(deadlineOf(bounty),getServerNow())}</span><h3>${esc(bounty.title)}</h3><p>${esc(bounty.summary)}</p><div class="meta">${esc(bounty.submissionCount ?? 0)} entries · ${feeShare(bounty)}</div></div>${metricSlots(bounty)}<span class="arrow" aria-hidden="true">↗</span></a>`).join('') || `<div class="empty">${all.length ? 'No bounties match your search. Try another title.' : 'No bounties available. Check back soon.'}</div>`}</div>${pager(page,rows.length,20)}</section>`;
}
// Deliberately tiny inline markup: escape first, no HTML or Markdown dependency.
export function renderMarkdown(text) {
  return esc(text).replace(/`([^`\n]+)`|\*\*([^\n]+?)\*\*|\[([^\]\n]+)\]\((https:\/\/[^\s)]+)\)/g, (match,code,bold,label,url) => {
    if (code) return `<code>${code}</code>`;
    if (bold) return `<strong>${bold}</strong>`;
    return `<a href="${url}" target="_blank" rel="noreferrer">${label}</a>`;
  }).replace(/\n/g,'<br>');
}
export function renderBounty(raw) {
  const bounty = unwrap(raw);
  if (!bounty || !bounty.slug) throw new Error('Unknown bounty');
  const rewards = bounty.rewards ?? bounty.rewardsNow ?? [];
  const rows = (Array.isArray(rewards) ? rewards : Object.entries(rewards).map(([place,amount]) => ({place,amount}))).map(reward => reward ?? {});
  return `<a class="back" href="#/">← All bounties</a><section class="detail-head"><p class="eyebrow">${statusByDeadline(deadlineOf(bounty),getServerNow())}</p><h1>${esc(bounty.title)}</h1><p>${esc(bounty.summary)}</p>${metricSlots(bounty)}<div class="meta">${esc(bounty.submissionCount ?? 0)} entries · Opens ${formatDate(bounty.opensAt)}<br>Closed at ${formatDate(bounty.closed_at)}</div><a class="button" href="${bountyUrl(bounty.slug)}/leaderboard">View leaderboard →</a></section><div class="detail-grid"><article class="panel"><h2>The challenge</h2><div class="prose">${renderMarkdown(bounty.description)}</div><h2>Rules</h2><div class="prose">${renderMarkdown(Array.isArray(bounty.rules) ? bounty.rules.join('\n') : bounty.rules)}</div></article><aside class="panel"><h2>Rewards</h2><table><thead><tr><th>Place</th><th>Prize</th></tr></thead><tbody>${rows.map((reward,index) => `<tr><td>${esc(reward.place ?? reward.rank ?? index+1)}</td><td>${money(typeof reward === 'object' && reward !== null ? reward.amountUsd ?? reward.amount : reward)}</td></tr>`).join('') || '<tr><td colspan="2">Rewards not announced</td></tr>'}</tbody></table><p class="muted">Live pot includes current rewards and entry fees.</p></aside></div>`;
}
