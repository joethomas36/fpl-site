/* ============================================
   THE LADS · 2025/26 FPL · APP LOGIC
   ============================================ */

const D = window.FPL_DATA;
const MGRS = D.managers;
const ALL_GWS = D.all_gws;
const LAST_GW = D.last_gw;

const YOU_NAME = 'Joe Thomas';
const KIERAN_NAME = 'Kieran Norton-Walder';

// Sort managers by total points
const RANKED_MIDS = Object.keys(MGRS).sort((a, b) => MGRS[b].total - MGRS[a].total);
RANKED_MIDS.forEach((mid, i) => { MGRS[mid].rank = i + 1; });
const YOU_MID = RANKED_MIDS.find(mid => MGRS[mid].name === YOU_NAME);
const KIERAN_MID = RANKED_MIDS.find(mid => MGRS[mid].name === KIERAN_NAME);
const LEADER_MID = RANKED_MIDS[0];

// Short name helper
function shortName(name) {
  if (!name) return '';
  if (name === KIERAN_NAME) return 'Kieran N-W';
  if (name === 'Kieran Gulliver-Brown') return 'Kieran G-B';
  if (name === 'brendan turner') return 'brendan';
  const parts = name.split(' ');
  return parts[0];
}

// Colors per manager (consistent across charts)
const MGR_COLORS = {};
const PALETTE = ['#ffd400', '#e30613', '#00b341', '#00a3e0', '#ff7a00', '#8b3ffd', '#ff3d8a', '#f4f1e8', '#5dcaa5', '#f0997b', '#85b7eb', '#c0dd97', '#fac775'];
RANKED_MIDS.forEach((mid, i) => { MGR_COLORS[mid] = PALETTE[i % PALETTE.length]; });

// ========================================
// CHART GLOBAL CONFIG
// ========================================
Chart.defaults.color = '#c9c5b8';
Chart.defaults.borderColor = '#3a3a3a';
Chart.defaults.font.family = 'Inter, sans-serif';
Chart.defaults.font.size = 11;

// ========================================
// TAB SWITCHING
// ========================================
function switchTab(tabId) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tabId));
  document.querySelectorAll('.tab-content').forEach(t => t.classList.toggle('active', t.id === `tab-${tabId}`));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
document.querySelectorAll('.tab-btn').forEach(b => b.addEventListener('click', () => switchTab(b.dataset.tab)));

// ========================================
// HEADER META
// ========================================
document.getElementById('meta-gw').textContent = LAST_GW;
document.getElementById('meta-leader').textContent = shortName(MGRS[LEADER_MID].name);
document.getElementById('footer-gw').textContent = LAST_GW;

// ========================================
// TICKER (SCROLLING BREAKING BANTER)
// ========================================
function buildTicker() {
  const items = [];

  // Kroupi narrative
  items.push(`KIERAN'S KROUPI BENCH SHAME COUNTER: ${D.kroupi.kieran_benched_pts} PTS LEFT ON THE BENCH`);

  // Leader
  items.push(`${shortName(MGRS[LEADER_MID].name).toUpperCase()} LEADS THE LADS WITH ${MGRS[LEADER_MID].total} PTS`);

  // Worst hit-taker
  const worstHits = RANKED_MIDS.slice().sort((a,b) => MGRS[b].hits_total - MGRS[a].hits_total)[0];
  items.push(`${shortName(MGRS[worstHits].name).toUpperCase()} HAS THROWN AWAY ${MGRS[worstHits].hits_total} POINTS IN HITS`);

  // Best bench
  const bestBench = RANKED_MIDS.slice().sort((a,b) => MGRS[a].bench_total - MGRS[b].bench_total)[0];
  items.push(`${shortName(MGRS[bestBench].name).toUpperCase()} ONLY ${MGRS[bestBench].bench_total} BENCH PTS · BROKE FPL`);

  // Highest GW score
  let topGw = { pts: 0, name: '', gw: 0 };
  RANKED_MIDS.forEach(mid => {
    if (MGRS[mid].best_gw.pts > topGw.pts) topGw = { pts: MGRS[mid].best_gw.pts, name: MGRS[mid].name, gw: MGRS[mid].best_gw.gw };
  });
  items.push(`HIGHEST GW SCORE: ${shortName(topGw.name).toUpperCase()} ${topGw.pts} IN GW${topGw.gw}`);

  // Worst chip use
  items.push(`BRENDAN TC'D WOLTEMADE IN GW10 · NEVER FORGET`);

  // Set & forget
  const noHits = RANKED_MIDS.filter(mid => MGRS[mid].hits_total === 0).map(mid => shortName(MGRS[mid].name));
  if (noHits.length) items.push(`SET & FORGET CLUB: ${noHits.join(' & ').toUpperCase()}`);

  const html = items.map(t => `<span>${t}</span>`).join('');
  // duplicate for seamless loop
  document.getElementById('ticker-track').innerHTML = html + html;
}
buildTicker();

// ========================================
// HEADLINE HERO
// ========================================
function buildHero() {
  const lead = MGRS[LEADER_MID];
  const second = MGRS[RANKED_MIDS[1]];
  const gap = lead.total - second.total;
  const youData = MGRS[YOU_MID];
  const youGap = lead.total - youData.total;

  const headlines = [
    {
      h: `${shortName(lead.name).toUpperCase()} WIRTZ-ING THE TITLE`,
      s: `${lead.total} pts · leading by ${gap} from ${shortName(second.name)} with ${ALL_GWS.length === 38 ? 'the season done' : `${38 - LAST_GW} GW${38-LAST_GW===1?'':'s'} left`}. You're ${youGap} behind in ${MGRS[YOU_MID].rank}${ord(MGRS[YOU_MID].rank)}.`
    },
    {
      h: `KROUPI JR · A VINDICATION TOUR`,
      s: `Kieran was right all along. The £4.6m forward has banged in ${D.kroupi.goals} goals for ${D.kroupi.season_pts} points — the most of any sub-£5m forward in the game. Five lads now own him. Kieran was first.`
    },
    {
      h: `THE LADS · ${ALL_GWS.length} GAMEWEEKS OF CARNAGE`,
      s: `13 managers, 535 transfers, 38 chips played, hundreds of points binned, one shrine to a French teenager. This is the season in numbers.`
    }
  ];
  // Rotate every 8s
  let idx = 0;
  function show() {
    document.getElementById('hero-headline').textContent = headlines[idx].h;
    document.getElementById('hero-subline').textContent = headlines[idx].s;
    idx = (idx + 1) % headlines.length;
  }
  show();
  setInterval(show, 8000);
}
buildHero();

function ord(n) { const s=['th','st','nd','rd'], v=n%100; return (s[(v-20)%10]||s[v]||s[0]); }

// ========================================
// MINI TABLE (HEADLINES)
// ========================================
function buildMiniTable() {
  const html = RANKED_MIDS.map(mid => {
    const m = MGRS[mid];
    const youCls = m.name === YOU_NAME ? 'is-you' : '';
    return `
      <div class="mini-row ${youCls}" onclick="selectManager('${mid}'); switchTab('managers');">
        <div class="mini-rank">${m.rank}</div>
        <div class="mini-name">${shortName(m.name)}</div>
        <div class="mini-pts">${m.total}</div>
      </div>`;
  }).join('');
  document.getElementById('mini-table').innerHTML = html;
}
buildMiniTable();

// ========================================
// STAT ROTATOR
// ========================================
function buildRotator() {
  // worst single bench
  let worstBench = { pts: 0, mid: null, gw: 0 };
  RANKED_MIDS.forEach(mid => {
    const w = MGRS[mid].worst_bench_gw;
    if (w.bench > worstBench.pts) worstBench = { pts: w.bench, mid, gw: w.gw };
  });
  // biggest miss (single benched player)
  let biggestMiss = { pts: 0, mid: null };
  RANKED_MIDS.forEach(mid => {
    const m = MGRS[mid].biggest_bench_miss;
    if (m.pts > biggestMiss.pts) biggestMiss = { ...m, mid };
  });
  // most captaincy hauls
  const capHauls = RANKED_MIDS.slice().sort((a,b) => MGRS[b].cap_hauls - MGRS[a].cap_hauls)[0];
  // worst captain rate
  const capBlanks = RANKED_MIDS.slice().sort((a,b) => MGRS[b].cap_blanks - MGRS[a].cap_blanks)[0];
  // most differential
  // most hits
  const mostHits = RANKED_MIDS.slice().sort((a,b) => MGRS[b].hits_total - MGRS[a].hits_total)[0];
  // most weeks at top
  const mostWeeks = RANKED_MIDS.slice().sort((a,b) => MGRS[b].weeks_at_top - MGRS[a].weeks_at_top)[0];
  // best transfer
  let bestT = { net_5gw: -999, mid: null };
  RANKED_MIDS.forEach(mid => {
    if (MGRS[mid].best_transfer && MGRS[mid].best_transfer.net_5gw > bestT.net_5gw) bestT = { ...MGRS[mid].best_transfer, mid };
  });
  // value rise
  const richest = RANKED_MIDS.slice().sort((a,b) => MGRS[b].final_value - MGRS[a].final_value)[0];
  // most consistent
  const consistent = RANKED_MIDS.slice().sort((a,b) => MGRS[a].std - MGRS[b].std)[0];

  const stats = [
    { num: worstBench.pts, name: shortName(MGRS[worstBench.mid].name), detail: `points left on the bench in GW${worstBench.gw}` },
    { num: biggestMiss.pts, name: `${biggestMiss.player} · ${shortName(MGRS[biggestMiss.mid].name)}`, detail: `the single biggest bench miss of the season` },
    { num: MGRS[capHauls].cap_hauls, name: shortName(MGRS[capHauls].name), detail: `captaincy hauls (10+ pts) — most in the league` },
    { num: MGRS[capBlanks].cap_blanks, name: shortName(MGRS[capBlanks].name), detail: `captain blanks (≤4 pts) — worst armband in the lads` },
    { num: MGRS[mostHits].hits_total, name: shortName(MGRS[mostHits].name), detail: `points binned on transfer hits this season` },
    { num: MGRS[mostWeeks].weeks_at_top, name: shortName(MGRS[mostWeeks].name), detail: `weeks at the top of the mini-league` },
    { num: `+${bestT.net_5gw}`, name: `${bestT.in_name} → ${bestT.out_name}`, detail: `${shortName(MGRS[bestT.mid].name)}'s best transfer (5GW window)` },
    { num: `£${MGRS[richest].final_value}m`, name: shortName(MGRS[richest].name), detail: `richest squad in the league right now` },
    { num: `±${MGRS[consistent].std}`, name: shortName(MGRS[consistent].name), detail: `most consistent week-to-week scorer` },
    { num: D.kroupi.kieran_benched_pts, name: 'KIERAN N-W', detail: `Kroupi points he benched · the bench shame` },
  ];

  let idx = 0;
  function show() {
    const s = stats[idx];
    const stat = document.getElementById('rotator-stat');
    stat.style.opacity = 0;
    setTimeout(() => {
      stat.textContent = s.num;
      document.getElementById('rotator-name').textContent = s.name.toUpperCase();
      document.getElementById('rotator-detail').textContent = s.detail;
      stat.style.opacity = 1;
    }, 200);
    idx = (idx + 1) % stats.length;
  }
  show();
  setInterval(show, 4500);
}
buildRotator();

// ========================================
// TOP AWARDS STRIP
// ========================================
function buildTopAwards() {
  // worst bench miss biggest
  let worstBench = { pts: 0, mid: null };
  RANKED_MIDS.forEach(mid => {
    if (MGRS[mid].bench_total > worstBench.pts) worstBench = { pts: MGRS[mid].bench_total, mid };
  });

  // wally with the most hits
  const mostHits = RANKED_MIDS.slice().sort((a,b) => MGRS[b].hits_total - MGRS[a].hits_total)[0];

  // best bench (least)
  const bestBench = RANKED_MIDS.slice().sort((a,b) => MGRS[a].bench_total - MGRS[b].bench_total)[0];

  // top of the table for most weeks
  const mostWeeks = RANKED_MIDS.slice().sort((a,b) => MGRS[b].weeks_at_top - MGRS[a].weeks_at_top)[0];

  // biggest captain hauler
  const capHauls = RANKED_MIDS.slice().sort((a,b) => MGRS[b].cap_hauls - MGRS[a].cap_hauls)[0];

  const cards = [
    { icon: '🪑', title: 'BENCH WARMER', winner: shortName(MGRS[worstBench.mid].name), detail: `${worstBench.pts} bench pts wasted · could've changed his season` },
    { icon: '💸', title: 'WALLY WITH THE HITS', winner: shortName(MGRS[mostHits].name), detail: `${MGRS[mostHits].hits_total} pts binned · the most reckless transfer policy in the lads` },
    { icon: '🧠', title: 'GAFFER OF THE LADS', winner: shortName(MGRS[mostWeeks].name), detail: `${MGRS[mostWeeks].weeks_at_top} weeks at the top · ran the league` },
    { icon: '⚓', title: 'BENCH WHISPERER', winner: shortName(MGRS[bestBench].name), detail: `only ${MGRS[bestBench].bench_total} pts left on the bench all season · what is this sorcery` },
    { icon: '👑', title: 'CAPTAIN MARVEL', winner: shortName(MGRS[capHauls].name), detail: `${MGRS[capHauls].cap_hauls} captain hauls · proper armband selection` },
  ];

  document.getElementById('top-awards').innerHTML = cards.map(c => `
    <div class="award-card">
      <div class="award-icon">${c.icon}</div>
      <div class="award-title">${c.title}</div>
      <div class="award-winner">${c.winner}</div>
      <div class="award-detail">${c.detail}</div>
    </div>
  `).join('');
}
buildTopAwards();

// ========================================
// BIGGEST/LOWEST GW SCORES
// ========================================
function buildGwScoreLists() {
  // collect all GWs across all managers
  const all = [];
  RANKED_MIDS.forEach(mid => {
    MGRS[mid].gw_history.forEach(h => {
      all.push({ ...h, mid, name: MGRS[mid].name });
    });
  });
  const top = all.slice().sort((a,b) => b.pts - a.pts).slice(0, 6);
  const bot = all.slice().sort((a,b) => a.pts - b.pts).slice(0, 6);

  const renderRow = (r, isBad) => `
    <div class="gw-row">
      <div class="gw-tag">GW${r.gw}</div>
      <div class="gw-name">${shortName(r.name)}</div>
      <div class="gw-pts ${isBad?'bad':''}">${r.pts}</div>
    </div>`;
  document.getElementById('biggest-gws').innerHTML = top.map(r => renderRow(r, false)).join('');
  document.getElementById('lowest-gws').innerHTML = bot.map(r => renderRow(r, true)).join('');
}
buildGwScoreLists();

// ========================================
// RANK HISTORY CHART
// ========================================
function buildRankChart() {
  const datasets = RANKED_MIDS.map(mid => ({
    label: shortName(MGRS[mid].name),
    data: MGRS[mid].mini_rank_history.map(r => ({ x: r.gw, y: r.rank })),
    borderColor: MGR_COLORS[mid],
    backgroundColor: MGR_COLORS[mid],
    tension: 0.25,
    pointRadius: 0,
    pointHoverRadius: 5,
    borderWidth: mid === YOU_MID ? 3 : 1.5,
  }));

  new Chart(document.getElementById('rank-chart'), {
    type: 'line',
    data: { datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'nearest', intersect: false },
      plugins: {
        legend: { position: 'bottom', labels: { boxWidth: 10, padding: 8, font: { size: 10 } } },
        tooltip: { 
          callbacks: { label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y}${ord(ctx.parsed.y)}` }
        }
      },
      scales: {
        x: { type: 'linear', title: { display: true, text: 'Gameweek', color: '#888' }, ticks: { stepSize: 2 } },
        y: { reverse: true, min: 1, max: 13, ticks: { stepSize: 1 }, title: { display: true, text: 'League position', color: '#888' } }
      }
    }
  });
}
buildRankChart();

// ========================================
// FULL TABLE
// ========================================
function buildFullTable() {
  const t = document.getElementById('full-league-table');
  const head = `<thead>
    <tr>
      <th>#</th>
      <th>Manager</th>
      <th>Team Name</th>
      <th class="right">Pts</th>
      <th class="right">Avg</th>
      <th class="right">Bench</th>
      <th class="right">Hits</th>
      <th class="right">Trf</th>
      <th class="right">Best GW</th>
      <th class="right">£m</th>
    </tr></thead>`;
  const rows = RANKED_MIDS.map(mid => {
    const m = MGRS[mid];
    const isYou = m.name === YOU_NAME ? 'is-you' : '';
    return `<tr class="${isYou}" onclick="selectManager('${mid}'); switchTab('managers');">
      <td class="rank-cell">${m.rank}</td>
      <td class="name-cell">${shortName(m.name)}</td>
      <td class="team-cell">${m.team_name}</td>
      <td class="right pts-cell">${m.total}</td>
      <td class="right">${m.mean}</td>
      <td class="right">${m.bench_total}</td>
      <td class="right">${m.hits_total ? '-'+m.hits_total : '0'}</td>
      <td class="right">${m.transfers_total}</td>
      <td class="right">${m.best_gw.pts} <span style="color:#888">GW${m.best_gw.gw}</span></td>
      <td class="right">£${m.final_value}m</td>
    </tr>`;
  }).join('');
  t.innerHTML = head + '<tbody>' + rows + '</tbody>';
}
buildFullTable();

// ========================================
// POINTS BREAKDOWN CHART
// ========================================
function buildPointsBreakdownChart() {
  const labels = RANKED_MIDS.map(mid => shortName(MGRS[mid].name));
  const totals = RANKED_MIDS.map(mid => MGRS[mid].total);
  const benchData = RANKED_MIDS.map(mid => MGRS[mid].bench_total);
  const hitsData = RANKED_MIDS.map(mid => MGRS[mid].hits_total);

  new Chart(document.getElementById('points-breakdown-chart'), {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'Total', data: totals, backgroundColor: '#ffd400' },
        { label: 'Bench wasted', data: benchData, backgroundColor: '#ff7a00' },
        { label: 'Hits', data: hitsData, backgroundColor: '#e30613' }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, padding: 10 } } },
      scales: {
        x: { ticks: { color: '#c9c5b8', maxRotation: 45 } },
        y: { beginAtZero: true }
      }
    }
  });
}
buildPointsBreakdownChart();

// ========================================
// KROUPI SHRINE
// ========================================
function buildKroupi() {
  const k = D.kroupi;

  // stats grid
  const stats = [
    { n: k.season_pts, l: 'TOTAL PTS' },
    { n: k.goals, l: 'GOALS' },
    { n: `£${k.cost}m`, l: 'PRICE' },
    { n: k.starts, l: 'STARTS' },
    { n: '#1', l: 'BUDGET FWD' },
    { n: k.kieran_haul, l: 'KIERAN PTS' },
    { n: k.kieran_benched_pts, l: 'BENCHED PTS' },
  ];
  document.getElementById('kroupi-stats').innerHTML = stats.map(s => `
    <div class="kroupi-stat"><div class="kroupi-stat-num">${s.n}</div><div class="kroupi-stat-lbl">${s.l}</div></div>
  `).join('');

  // prose
  const ownerCount = Object.values(k.ownership_by_gw).reduce((set, owners) => { owners.forEach(o => set.add(o.name)); return set; }, new Set()).size;
  const firstOwnerGw = Math.min(...Object.entries(k.ownership_by_gw).filter(([gw, owners]) => owners.length > 0).map(([gw]) => +gw));
  const firstOwners = k.ownership_by_gw[firstOwnerGw];
  const secondToJoin = (() => {
    for (const gw of ALL_GWS) {
      const owners = k.ownership_by_gw[gw] || [];
      if (owners.length >= 2) return { gw, name: owners.find(o => o.name !== KIERAN_NAME).name };
    }
    return null;
  })();

  document.getElementById('kroupi-prose').innerHTML = `
    <p>The legend was born when <strong>${shortName(KIERAN_NAME)}</strong> brought in Junior Kroupi at <strong>GW${firstOwnerGw}</strong>. The lads laughed. TikTok strategy. Vibes-based selection. No proper football knowledge. Pure noise.</p>
    <p>Kroupi has now scored <strong>${k.season_pts} points</strong> at <strong>£${k.cost}m</strong>. He is the <strong>highest-scoring forward under £5m in the entire game</strong>. ${secondToJoin ? `${shortName(secondToJoin.name)} jumped on the bandwagon at GW${secondToJoin.gw} — ${secondToJoin.gw - firstOwnerGw} gameweeks late.` : ''} ${ownerCount} different lads have owned him since.</p>
    <p>And yet Kieran sits in <strong>${ord(MGRS[KIERAN_MID].rank)} place</strong>. Because he <strong>benched Kroupi 12 times</strong> and missed <strong>${k.kieran_benched_pts} points</strong> while they sat there. He was right about the player and still cocked it up. Genuine masterclass.</p>
  `;

  // Timeline
  const events = [];
  let prevOwners = [];
  let lastChip = '';
  ALL_GWS.forEach(gw => {
    const owners = k.ownership_by_gw[gw] || [];
    const ownerNames = owners.map(o => o.name).sort();
    const prevNames = prevOwners.map(o => o.name).sort();
    const newOwners = owners.filter(o => !prevOwners.find(p => p.name === o.name));
    const dropped = prevOwners.filter(p => !owners.find(o => o.name === p.name));
    if (newOwners.length) {
      newOwners.forEach(o => {
        if (o.name === KIERAN_NAME && events.length === 0) {
          events.push({ gw, text: `<strong>${shortName(KIERAN_NAME)}</strong> brings in Kroupi · the prophet has spoken` });
        } else {
          events.push({ gw, text: `<strong>${shortName(o.name)}</strong> joins the bandwagon` });
        }
      });
    }
    dropped.forEach(d => {
      events.push({ gw, text: `<strong>${shortName(d.name)}</strong> sells Kroupi · loses faith` });
    });
    prevOwners = owners;
  });

  const finalOwners = k.ownership_by_gw[LAST_GW] || [];
  events.push({ gw: LAST_GW, text: `Currently owned by <strong>${finalOwners.length} lads</strong>: ${finalOwners.map(o => shortName(o.name)).join(', ')}` });

  document.getElementById('kroupi-timeline').innerHTML = events.map(e => `
    <div class="timeline-row">
      <div class="timeline-gw">GW${e.gw}</div>
      <div class="timeline-text">${e.text}</div>
    </div>
  `).join('');

  // Kroupi chart
  const labels = k.gw_history.map(g => 'GW' + g.gw);
  const pts = k.gw_history.map(g => g.pts);
  new Chart(document.getElementById('kroupi-chart'), {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Points',
        data: pts,
        backgroundColor: pts.map(p => p >= 8 ? '#00b341' : p >= 4 ? '#ffd400' : '#888')
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => `${ctx.parsed.y} pts` } }
      },
      scales: { x: { ticks: { color: '#888' } }, y: { beginAtZero: true } }
    }
  });
  const totalK = k.gw_history.reduce((s,g) => s+g.pts, 0);
  const haulCount = k.gw_history.filter(g => g.pts >= 8).length;
  document.getElementById('kroupi-caption').textContent = `${haulCount} hauls (8+ pts) across the season. Green bars = hauls, yellow = decent, grey = blank.`;

  // Bench counter
  document.getElementById('kroupi-bench-counter').textContent = k.kieran_benched_pts;
  document.getElementById('kroupi-bench-detail').textContent = `Kieran benched Kroupi in 12 of the 27 GWs he owned him. Across those benchings, the lad scored ${k.kieran_benched_pts} points sat on the sofa. Tragic.`;
}
buildKroupi();

// ========================================
// AWARDS PAGE (FULL CEREMONY)
// ========================================
function buildAwards() {
  // helpers
  const sortBy = (key, asc=false) => {
    return RANKED_MIDS.slice().sort((a,b) => asc ? MGRS[a][key]-MGRS[b][key] : MGRS[b][key]-MGRS[a][key]);
  };
  const findExtreme = (fn, max=true) => {
    let best = { val: max ? -Infinity : Infinity, mid: null };
    RANKED_MIDS.forEach(mid => {
      const v = fn(MGRS[mid]);
      if ((max && v > best.val) || (!max && v < best.val)) best = { val: v, mid };
    });
    return best;
  };

  const champ = MGRS[RANKED_MIDS[0]];
  const wooden = MGRS[RANKED_MIDS[RANKED_MIDS.length-1]];
  const mostHits = MGRS[sortBy('hits_total')[0]];
  const noHits = RANKED_MIDS.filter(mid => MGRS[mid].hits_total === 0).map(mid => MGRS[mid]);
  const mostBench = MGRS[sortBy('bench_total')[0]];
  const leastBench = MGRS[sortBy('bench_total', true)[0]];
  const mostConsistent = MGRS[sortBy('std', true)[0]];
  const mostChaotic = MGRS[sortBy('std')[0]];
  const mostTransfers = MGRS[sortBy('transfers_total')[0]];
  const mostCapHauls = MGRS[sortBy('cap_hauls')[0]];
  const mostCapBlanks = MGRS[sortBy('cap_blanks')[0]];
  const mostVcRegret = MGRS[sortBy('vc_regret')[0]];
  const richest = MGRS[sortBy('final_value')[0]];
  const poorest = MGRS[sortBy('final_value', true)[0]];

  // Worst single bench miss
  let worstMiss = { pts: 0, mid: null };
  RANKED_MIDS.forEach(mid => {
    if (MGRS[mid].biggest_bench_miss.pts > worstMiss.pts) worstMiss = { ...MGRS[mid].biggest_bench_miss, mid };
  });

  // Best & worst transfer
  let bestT = { net_5gw: -Infinity, mid: null };
  let worstT = { net_5gw: Infinity, mid: null };
  RANKED_MIDS.forEach(mid => {
    if (MGRS[mid].best_transfer && MGRS[mid].best_transfer.net_5gw > bestT.net_5gw) bestT = { ...MGRS[mid].best_transfer, mid };
    if (MGRS[mid].worst_transfer && MGRS[mid].worst_transfer.net_5gw < worstT.net_5gw) worstT = { ...MGRS[mid].worst_transfer, mid };
  });

  // Worst TC
  let worstTC = { tc_pts: Infinity, mid: null };
  RANKED_MIDS.forEach(mid => {
    MGRS[mid].tc_results.forEach(t => {
      if (t.tc_pts < worstTC.tc_pts) worstTC = { ...t, mid };
    });
  });

  // Best TC
  let bestTC = { tc_pts: -Infinity, mid: null };
  RANKED_MIDS.forEach(mid => {
    MGRS[mid].tc_results.forEach(t => {
      if (t.tc_pts > bestTC.tc_pts) bestTC = { ...t, mid };
    });
  });

  // Worst BB
  let worstBB = { team_pts: Infinity, mid: null };
  let bestBB = { team_pts: -Infinity, mid: null };
  RANKED_MIDS.forEach(mid => {
    MGRS[mid].bb_results.forEach(b => {
      if (b.team_pts < worstBB.team_pts) worstBB = { ...b, mid };
      if (b.team_pts > bestBB.team_pts) bestBB = { ...b, mid };
    });
  });

  // Most weeks at top
  const topWeeks = MGRS[sortBy('weeks_at_top')[0]];

  // Highest GW
  let topGw = { pts: 0, mid: null };
  RANKED_MIDS.forEach(mid => {
    if (MGRS[mid].best_gw.pts > topGw.pts) topGw = { ...MGRS[mid].best_gw, mid };
  });

  // Lowest GW
  let lowGw = { pts: Infinity, mid: null };
  RANKED_MIDS.forEach(mid => {
    if (MGRS[mid].worst_gw.pts < lowGw.pts) lowGw = { ...MGRS[mid].worst_gw, mid };
  });

  const awards = [
    {
      cat: 'serious', icon: '🥇', title: 'CHAMPION OF THE LADS',
      winner: shortName(champ.name), stat: `${champ.total} pts · ${champ.weeks_at_top} weeks at #1`,
      roast: `Camped at the top all season. The rest of the lads were pretending they had a chance. They didn't.`
    },
    {
      cat: 'shame', icon: '🥄', title: 'WOODEN SPOON',
      winner: shortName(wooden.name), stat: `${wooden.total} pts · ${wooden.rank}${ord(wooden.rank)} place`,
      roast: `Bottom of the lads. ${wooden.hits_total === 0 ? 'No transfer hits at least — failed gracefully.' : `Took ${wooden.hits_total} pts in hits to get here. Truly committed to the bit.`}`
    },
    {
      cat: '', icon: '🪑', title: 'BENCH TRAGEDY',
      winner: shortName(mostBench.name), stat: `${mostBench.bench_total} pts left on the bench`,
      roast: `Could've been ${mostBench.rank > 3 ? 'a contender' : 'champion'} if he'd just played his actual XV. The bench was where his points went to die.`
    },
    {
      cat: 'serious', icon: '⚓', title: 'BENCH WHISPERER',
      winner: shortName(leastBench.name), stat: `only ${leastBench.bench_total} pts wasted`,
      roast: `Either the most attentive lad in the group chat or has cracked some code none of us know about. Suspicious. Investigate.`
    },
    {
      cat: 'shame', icon: '💸', title: 'WALLY WITH THE TRANSFERS',
      winner: shortName(mostHits.name), stat: `-${mostHits.hits_total} pts in hits · ${mostHits.transfers_total} transfers`,
      roast: `Taking that -4? Sure. Another -8 a week later? Why not. ${mostHits.hits_total} points sacrificed on the altar of the chaotic gut feel.`
    },
    {
      cat: 'serious', icon: '🧘', title: 'SET & FORGET CLUB',
      winner: noHits.map(m => shortName(m.name)).join(' & '),
      stat: 'zero transfer hits all season',
      roast: `Disciplined. Patient. Or just couldn't be bothered. Either way: 0 hits. Buddhist-tier acceptance of the team you drafted in August.`
    },
    {
      cat: '', icon: '📈', title: 'HIGHEST GAMEWEEK',
      winner: shortName(MGRS[topGw.mid].name), stat: `${topGw.pts} pts in GW${topGw.gw}`,
      roast: `Cooked. The kind of week where you screenshot it for the group chat before anyone else can post.`
    },
    {
      cat: 'shame', icon: '📉', title: 'GAMEWEEK CATASTROPHE',
      winner: shortName(MGRS[lowGw.mid].name), stat: `${lowGw.pts} pts in GW${lowGw.gw}`,
      roast: `Single-figure stuff. Hopefully nobody was on the wildcard the week before this happened.`
    },
    {
      cat: '', icon: '👑', title: 'CAPTAIN MARVEL',
      winner: shortName(mostCapHauls.name), stat: `${mostCapHauls.cap_hauls} captain hauls (10+ pts)`,
      roast: `Got the armband right when it mattered. ${mostCapHauls.cap_avg_raw} avg pts per captain pick — proper armband selection.`
    },
    {
      cat: 'shame', icon: '🤡', title: 'CAPTAIN BLUNDER',
      winner: shortName(mostCapBlanks.name), stat: `${mostCapBlanks.cap_blanks} captain blanks (≤4 pts)`,
      roast: `Captained the wrong man, in the wrong fixture, at the wrong time. Wash, rinse, repeat for ${mostCapBlanks.cap_blanks} weeks of pain.`
    },
    {
      cat: 'shame', icon: '🤦', title: 'VICE-CAPTAIN REGRET',
      winner: shortName(mostVcRegret.name), stat: `${mostVcRegret.vc_regret} pts lost · vice outscored captain ${mostVcRegret.vc_regret_count}× this season`,
      roast: `Nailed the vice-captain pick ${mostVcRegret.vc_regret_count} times. Just put the wrong armband on him. Heartbreaking.`
    },
    {
      cat: '', icon: '🎯', title: 'TRANSFER OF THE SEASON',
      winner: shortName(MGRS[bestT.mid].name), stat: `${bestT.in_name} in for ${bestT.out_name} · +${bestT.net_5gw} pts (5 GW window)`,
      roast: `Made the call, dodged the hit, banked the points. Send the bookies your CV.`
    },
    {
      cat: 'shame', icon: '🔥', title: 'TRANSFER DUMPSTER FIRE',
      winner: shortName(MGRS[worstT.mid].name), stat: `${worstT.out_name} out for ${worstT.in_name} · ${worstT.net_5gw} pts (5 GW window)`,
      roast: `Sold the right player at the worst possible time. Genuinely cursed timing.`
    },
    {
      cat: 'shame', icon: '🪦', title: 'TRIPLE CAPTAIN GRAVEYARD',
      winner: shortName(MGRS[worstTC.mid].name), stat: `${worstTC.player} TC'd in GW${worstTC.gw} · ${worstTC.player_pts} pts (×3)`,
      roast: `The chip was supposed to be the difference. Instead it was just three times zero.`
    },
    {
      cat: 'serious', icon: '💎', title: 'TRIPLE CAPTAIN MASTERCLASS',
      winner: shortName(MGRS[bestTC.mid].name), stat: `${bestTC.player} TC'd in GW${bestTC.gw} · ${bestTC.player_pts} pts (×3 = ${bestTC.tc_pts})`,
      roast: `Pulled the trigger at the right moment on the right man. Vibes were impeccable.`
    },
    {
      cat: 'shame', icon: '😴', title: 'BENCH BOOST FACEPLANT',
      winner: shortName(MGRS[worstBB.mid].name), stat: `Bench Boost in GW${worstBB.gw} · ${worstBB.team_pts} pts total`,
      roast: `Blew the chip in a blank GW. The whole squad turned up cold. Brutal.`
    },
    {
      cat: '', icon: '🪑', title: 'WORST SINGLE BENCH MISS',
      winner: `${worstMiss.player} (${shortName(MGRS[worstMiss.mid].name)})`,
      stat: `${worstMiss.pts} pts · GW${worstMiss.gw}`,
      roast: `One single benched player, ${worstMiss.pts} points. The kind of miss that lives rent-free.`
    },
    {
      cat: '', icon: '📊', title: 'MR CONSISTENT',
      winner: shortName(mostConsistent.name), stat: `±${mostConsistent.std} std dev · avg ${mostConsistent.mean}`,
      roast: `Same score every week. Could be a hero. Could be a bore. The discipline of a Geography graduate.`
    },
    {
      cat: '', icon: '🎢', title: 'CHAOS AGENT',
      winner: shortName(mostChaotic.name), stat: `±${mostChaotic.std} std dev · avg ${mostChaotic.mean}`,
      roast: `Up. Down. 90 one week, 22 the next. Probably picks the squad while pissed up after a game of 5-a-side.`
    },
    {
      cat: 'serious', icon: '💰', title: 'TEAM VALUE TYCOON',
      winner: shortName(richest.name), stat: `£${richest.final_value}m squad`,
      roast: `Bought low, sold high, watched the budget players surge. The Warren Buffett of the lads.`
    },
    {
      cat: 'shame', icon: '📉', title: 'BUDGET BIN FIRE',
      winner: shortName(poorest.name), stat: `£${poorest.final_value}m squad`,
      roast: `Bought players at peak value, watched them drop, sold at the bottom. ChatGPT could've done better. Maybe did.`
    },
    {
      cat: '', icon: '🎟️', title: 'MOST FREQUENT FLYER',
      winner: shortName(mostTransfers.name), stat: `${mostTransfers.transfers_total} transfers across the season`,
      roast: `Was on the FPL site more than the actual Premier League players. Touch some grass. Or actually don't. Carry on.`
    },
    {
      cat: 'serious', icon: '👑', title: 'WEEKS AT THE SUMMIT',
      winner: shortName(topWeeks.name), stat: `${topWeeks.weeks_at_top} of ${ALL_GWS.length} weeks at #1`,
      roast: `Held the lead from the start. Never let it go. The benchmark.`
    },
    {
      cat: '', icon: '🔮', title: 'THE TIKTOK PROPHET',
      winner: shortName(KIERAN_NAME), stat: `Kroupi Jr · 103 pts · ${D.kroupi.kieran_haul} for the boy himself`,
      roast: `Followed the vibes. Was vindicated. Then benched the lad ${(MGRS[KIERAN_MID].team_name)} for 12 GWs and lost ${D.kroupi.kieran_benched_pts} points doing it. Foresight without follow-through is the cruellest kind of right.`
    },
  ];

  document.getElementById('awards-grid').innerHTML = awards.map(a => `
    <div class="full-award-card ${a.cat}">
      <div class="full-award-icon">${a.icon}</div>
      <div class="full-award-title">${a.title}</div>
      <div class="full-award-winner">${a.winner}</div>
      <div class="full-award-stat">${a.stat}</div>
      <div class="full-award-roast">${a.roast}</div>
    </div>
  `).join('');
}
buildAwards();

// ========================================
// MANAGER PAGE
// ========================================
function buildManagerButtons() {
  document.getElementById('manager-buttons').innerHTML = RANKED_MIDS.map(mid =>
    `<button class="mgr-btn" data-mid="${mid}">${MGRS[mid].rank}. ${shortName(MGRS[mid].name)}</button>`
  ).join('');
  document.querySelectorAll('.mgr-btn').forEach(b => b.addEventListener('click', () => selectManager(b.dataset.mid)));
}
buildManagerButtons();

let currentMgrChart = null;
function selectManager(mid) {
  document.querySelectorAll('.mgr-btn').forEach(b => b.classList.toggle('active', b.dataset.mid === mid));
  const m = MGRS[mid];
  const detail = document.getElementById('manager-detail');

  // Generate roast based on stats
  const roast = generateRoast(mid);

  detail.innerHTML = `
    <div class="mgr-detail-header">
      <div class="mgr-name-big">${m.name.toUpperCase()}</div>
      <div class="mgr-team-name">"${m.team_name}"</div>
      <div class="mgr-rank-badge">${m.rank}${ord(m.rank)} OF 13 · ${m.total} PTS</div>
      <div class="mgr-stats-grid">
        <div class="mgr-stat"><div class="mgr-stat-num">${m.mean}</div><div class="mgr-stat-lbl">AVG/GW</div></div>
        <div class="mgr-stat"><div class="mgr-stat-num">${m.bench_total}</div><div class="mgr-stat-lbl">BENCH PTS</div></div>
        <div class="mgr-stat"><div class="mgr-stat-num">${m.transfers_total}</div><div class="mgr-stat-lbl">TRANSFERS</div></div>
        <div class="mgr-stat"><div class="mgr-stat-num">-${m.hits_total}</div><div class="mgr-stat-lbl">HITS</div></div>
        <div class="mgr-stat"><div class="mgr-stat-num">${m.cap_hauls}</div><div class="mgr-stat-lbl">CAP HAULS</div></div>
        <div class="mgr-stat"><div class="mgr-stat-num">${m.cap_blanks}</div><div class="mgr-stat-lbl">CAP BLANKS</div></div>
        <div class="mgr-stat"><div class="mgr-stat-num">${m.weeks_at_top}</div><div class="mgr-stat-lbl">WEEKS AT #1</div></div>
        <div class="mgr-stat"><div class="mgr-stat-num">£${m.final_value}m</div><div class="mgr-stat-lbl">SQUAD £</div></div>
      </div>
    </div>

    <div class="roast-card">
      <div class="roast-eyebrow">📝 THE ASSESSMENT</div>
      <div class="roast-text">${roast}</div>
    </div>

    <div class="banter-card">
      <div class="card-eyebrow">📈 GW-BY-GW POINTS</div>
      <div class="chart-wrap"><canvas id="mgr-gw-chart"></canvas></div>
    </div>

    <div class="grid-2">
      <div class="banter-card">
        <div class="card-eyebrow">🎯 BEST TRANSFER</div>
        ${m.best_transfer ? renderTransfer(m.best_transfer, 'good') : '<p style="color:#888">No transfers yet.</p>'}
      </div>
      <div class="banter-card">
        <div class="card-eyebrow">💩 WORST TRANSFER</div>
        ${m.worst_transfer ? renderTransfer(m.worst_transfer, 'bad') : '<p style="color:#888">No transfers yet.</p>'}
      </div>
    </div>

    <div class="banter-card">
      <div class="card-eyebrow">🎴 CHIP STRATEGY</div>
      ${renderChipLog(m)}
    </div>

    <div class="banter-card">
      <div class="card-eyebrow">⚓ CAPTAIN HISTORY (LAST 10)</div>
      ${renderCaptainLog(m)}
    </div>
  `;

  // chart
  const ctx = document.getElementById('mgr-gw-chart');
  if (currentMgrChart) currentMgrChart.destroy();
  const labels = m.gw_history.map(h => 'GW' + h.gw);
  const pts = m.gw_history.map(h => h.pts);
  const avg = m.gw_history.map(h => D.league_avg_per_gw[h.gw]);
  currentMgrChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: shortName(m.name), data: pts, backgroundColor: '#ffd400', order: 2 },
        { label: 'League avg', data: avg, type: 'line', borderColor: '#e30613', backgroundColor: 'transparent', borderWidth: 2, pointRadius: 0, tension: 0.3, order: 1 }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom', labels: { boxWidth: 10 } } },
      scales: { x: { ticks: { color: '#888', maxRotation: 45 } }, y: { beginAtZero: true } }
    }
  });
}

function renderTransfer(t, type) {
  return `
    <div class="transfer-item ${type}">
      <div>GW${t.gw}: <strong>${t.in_name}</strong> in for <strong>${t.out_name}</strong></div>
      <div style="color: #888; font-size: 11px;">In pts (5 GW): ${t.in_pts_5gw} · Out pts (5 GW): ${t.out_pts_5gw}</div>
      <span class="net">${t.net_5gw >= 0 ? '+' : ''}${t.net_5gw} pts net</span>
    </div>`;
}

function renderChipLog(m) {
  const allChips = [...m.tc_results.map(c => ({...c, type: '3xC'})), ...m.bb_results.map(c => ({...c, type: 'BB'})), ...m.fh_results.map(c => ({...c, type: 'FH'})), ...m.wc_results.map(c => ({...c, type: 'WC'}))];
  allChips.sort((a,b) => a.gw - b.gw);
  const chipNames = { '3xC': 'Triple Captain', 'BB': 'Bench Boost', 'FH': 'Free Hit', 'WC': 'Wildcard' };
  if (!allChips.length) return '<p style="color:#888">No chips played yet.</p>';
  const avgPts = (gw) => D.league_avg_per_gw[gw] || 0;
  return `<div style="display: flex; flex-direction: column; gap: 6px;">${allChips.map(c => {
    const detail = c.type === '3xC' ? `<strong>${c.player}</strong> (${c.player_pts} × 3 = ${c.tc_pts})` : `${c.team_pts} pts (avg: ${avgPts(c.gw)})`;
    const diff = c.team_pts - avgPts(c.gw);
    const cls = diff > 0 ? 'good' : 'bad';
    return `<div class="transfer-item ${cls}"><strong>GW${c.gw} · ${chipNames[c.type]}</strong> · ${detail}<span class="net">${diff>=0?'+':''}${Math.round(diff)} vs avg</span></div>`;
  }).join('')}</div>`;
}

function renderCaptainLog(m) {
  const recent = m.captain_log.slice(-10);
  return `<div style="display:flex; flex-direction:column; gap:4px; font-size:13px;">
    ${recent.map(c => {
      const cls = c.raw_pts >= 10 ? 'good' : c.raw_pts <= 4 ? 'bad' : '';
      const tag = c.is_tc ? ' <span style="color:#ff7a00;font-weight:700">[3×C]</span>' : '';
      return `<div style="display:grid; grid-template-columns: 60px 1fr 50px; padding: 6px 8px; background: var(--ss-graphite); border-left: 3px solid ${c.raw_pts >= 10 ? '#00b341' : c.raw_pts <= 4 ? '#e30613' : '#ffd400'};">
        <div style="font-family: var(--font-display); color: #ffd400;">GW${c.gw}</div>
        <div>${c.player_name}${tag}</div>
        <div style="text-align:right; font-family: var(--font-mono); font-weight: 700; color: ${c.raw_pts >= 10 ? '#00b341' : c.raw_pts <= 4 ? '#e30613' : '#fff'}">${c.raw_pts}</div>
      </div>`;
    }).join('')}
  </div>`;
}

function generateRoast(mid) {
  const m = MGRS[mid];
  const lines = [];

  if (m.rank === 1) lines.push(`<strong>${shortName(m.name)}</strong> sits at the top of the lads with <strong>${m.total} pts</strong>.`);
  else if (m.rank <= 3) lines.push(`<strong>${shortName(m.name)}</strong> is in the top three on <strong>${m.total} pts</strong>, snapping at the leader's heels.`);
  else if (m.rank <= 6) lines.push(`<strong>${shortName(m.name)}</strong> is mid-table on <strong>${m.total} pts</strong> · respectable but unremarkable.`);
  else if (m.rank <= 10) lines.push(`<strong>${shortName(m.name)}</strong> is languishing in <strong>${m.rank}${ord(m.rank)}</strong> with ${m.total} pts. The mediocrity is impressive in its way.`);
  else lines.push(`<strong>${shortName(m.name)}</strong> is fighting for the wooden spoon in <strong>${m.rank}${ord(m.rank)}</strong>.`);

  // bench commentary
  if (m.bench_total > 280) lines.push(`Has left a comical <strong>${m.bench_total} points</strong> on the bench — could've been a contender if he'd just played his XV.`);
  else if (m.bench_total < 200) lines.push(`Only <strong>${m.bench_total} bench points</strong> wasted — actually pays attention to fixtures, which is more than most can say.`);

  // hits commentary
  if (m.hits_total >= 60) lines.push(`Has thrown away a <strong>genuinely reckless ${m.hits_total} points</strong> in transfer hits. Couldn't sit still if his life depended on it.`);
  else if (m.hits_total === 0) lines.push(`Took <strong>zero hits</strong> all season. Either disciplined or asleep at the wheel.`);

  // captain
  if (m.cap_blanks >= 12) lines.push(`Captain blanked <strong>${m.cap_blanks} times</strong> — armband selection like a coin flip with a weighted coin against him.`);
  else if (m.cap_hauls >= 14) lines.push(`<strong>${m.cap_hauls} captain hauls</strong> · clearly knows when to back the right player.`);

  // VC regret
  if (m.vc_regret >= 10) lines.push(`Picked the right vice <strong>${m.vc_regret_count} times</strong> · just put the captain band on the wrong man, costing ${m.vc_regret} pts.`);

  // chips
  if (m.bb_results.length) {
    const worstBB = m.bb_results.slice().sort((a,b) => a.team_pts - b.team_pts)[0];
    if (worstBB.team_pts < 50) lines.push(`Threw a Bench Boost in GW${worstBB.gw} for <strong>${worstBB.team_pts} pts</strong>. Not ideal.`);
  }

  // value
  if (m.final_value >= 103) lines.push(`Squad worth <strong>£${m.final_value}m</strong> · proper transfer profiteer.`);

  // Kroupi link
  if (m.name === KIERAN_NAME) lines.push(`Of course, the headline of his season is <strong>Kroupi Jr</strong>. He saw the future, and then benched it for 12 weeks. Genuinely Greek-tragedy stuff.`);

  // favourite player
  if (m.favourite_player) lines.push(`His most-loved pick: <strong>${m.favourite_player.name}</strong> (${m.favourite_player.gws} GWs in the squad).`);

  return lines.join(' ');
}

// Auto-select first manager
selectManager(YOU_MID);

// ========================================
// H2H EXPLORER
// ========================================
function buildH2H() {
  const opts = RANKED_MIDS.map(mid => `<option value="${mid}">${MGRS[mid].name}</option>`).join('');
  const sel1 = document.getElementById('h2h-mgr1');
  const sel2 = document.getElementById('h2h-mgr2');
  sel1.innerHTML = opts;
  sel2.innerHTML = opts;
  sel1.value = YOU_MID;
  sel2.value = KIERAN_MID;

  function update() {
    const a = sel1.value, b = sel2.value;
    if (a === b) {
      document.getElementById('h2h-result').innerHTML = `<div class="h2h-result-card"><p style="color:#888;text-align:center">Pick two different lads.</p></div>`;
      return;
    }
    const rec = D.h2h[a][b];
    const ma = MGRS[a], mb = MGRS[b];
    const summary = generateH2HSummary(a, b, rec);
    document.getElementById('h2h-result').innerHTML = `
      <div class="h2h-result-card">
        <div class="h2h-score-row">
          <div>
            <div class="h2h-score-num">${rec.w}</div>
            <div class="h2h-score-name">${shortName(ma.name).toUpperCase()}</div>
          </div>
          <div>
            <div class="h2h-score-label">W-D-L</div>
            <div style="font-size:14px;color:#888;font-family:var(--font-mono);margin-top:6px">${rec.d} draws</div>
          </div>
          <div>
            <div class="h2h-score-num">${rec.l}</div>
            <div class="h2h-score-name">${shortName(mb.name).toUpperCase()}</div>
          </div>
        </div>
        <div class="h2h-score-row">
          <div>
            <div class="h2h-score-num">${rec.pf}</div>
            <div class="h2h-score-name">PTS FOR</div>
          </div>
          <div>
            <div class="h2h-score-label">AGGREGATE</div>
            <div style="font-size:18px;color:${rec.pf > rec.pa ? '#00b341' : '#e30613'};font-family:var(--font-display);margin-top:6px">${rec.pf > rec.pa ? '+' : ''}${rec.pf - rec.pa}</div>
          </div>
          <div>
            <div class="h2h-score-num">${rec.pa}</div>
            <div class="h2h-score-name">PTS AGAINST</div>
          </div>
        </div>
        <div class="h2h-summary">${summary}</div>
      </div>
    `;
  }
  sel1.addEventListener('change', update);
  sel2.addEventListener('change', update);
  update();

  // Heatmap
  const tableEl = document.getElementById('h2h-heatmap');
  let html = '<table><thead><tr><th></th>';
  RANKED_MIDS.forEach(mid => { html += `<th>${shortName(MGRS[mid].name)}</th>`; });
  html += '</tr></thead><tbody>';
  RANKED_MIDS.forEach(mid1 => {
    html += `<tr><th>${shortName(MGRS[mid1].name)}</th>`;
    RANKED_MIDS.forEach(mid2 => {
      if (mid1 === mid2) {
        html += `<td style="background:#222;color:#444">—</td>`;
      } else {
        const r = D.h2h[mid1][mid2];
        const total = r.w + r.d + r.l;
        const pct = total ? (r.w / total) : 0;
        // color from red (low) to green (high)
        const r1 = Math.round(227 * (1 - pct));
        const g1 = Math.round(180 * pct);
        const bg = `rgb(${r1}, ${g1}, 30, 0.6)`;
        html += `<td style="background:${bg}; color:#fff" title="${r.w}W-${r.d}D-${r.l}L">${r.w}-${r.l}</td>`;
      }
    });
    html += '</tr>';
  });
  html += '</tbody></table>';
  tableEl.innerHTML = html;

  // Biggest H2H humiliations
  const beatdowns = [];
  RANKED_MIDS.forEach(mid1 => {
    MGRS[mid1].gw_history.forEach(h1 => {
      RANKED_MIDS.forEach(mid2 => {
        if (mid1 >= mid2) return; // avoid duplicates
        const h2 = MGRS[mid2].gw_history.find(g => g.gw === h1.gw);
        if (!h2) return;
        const margin = Math.abs(h1.pts - h2.pts);
        if (margin >= 40) {
          const winnerMid = h1.pts > h2.pts ? mid1 : mid2;
          const loserMid = h1.pts > h2.pts ? mid2 : mid1;
          const winnerPts = Math.max(h1.pts, h2.pts);
          const loserPts = Math.min(h1.pts, h2.pts);
          beatdowns.push({ gw: h1.gw, winnerMid, loserMid, winnerPts, loserPts, margin });
        }
      });
    });
  });
  beatdowns.sort((a,b) => b.margin - a.margin);
  document.getElementById('biggest-h2h-margins').innerHTML = beatdowns.slice(0, 10).map(b => `
    <div class="beatdown-row">
      <div class="beatdown-gw">GW${b.gw}</div>
      <div class="beatdown-name">${shortName(MGRS[b.winnerMid].name)}</div>
      <div class="beatdown-score">${b.winnerPts} - ${b.loserPts}</div>
      <div class="beatdown-name loser">${shortName(MGRS[b.loserMid].name)}</div>
      <div class="beatdown-margin">+${b.margin}</div>
    </div>
  `).join('');
}
buildH2H();

function generateH2HSummary(midA, midB, rec) {
  const ma = MGRS[midA], mb = MGRS[midB];
  const total = rec.w + rec.d + rec.l;
  const wPct = total ? Math.round(100 * rec.w / total) : 0;
  let s = `<strong>${shortName(ma.name)}</strong> has won <strong>${rec.w}</strong> of ${total} weekly head-to-heads vs <strong>${shortName(mb.name)}</strong> (<strong>${wPct}%</strong>). `;
  if (rec.pf > rec.pa) s += `Aggregate score: <strong>${rec.pf}-${rec.pa}</strong> in their favour.`;
  else if (rec.pf < rec.pa) s += `Aggregate score: <strong>${rec.pa}-${rec.pf}</strong> against. `;
  else s += `Aggregate score level at <strong>${rec.pf}-${rec.pa}</strong>.`;
  return s;
}

// ========================================
// NERD ZONE
// ========================================
function buildNerd() {
  // Captaincy table
  const capTable = document.getElementById('captaincy-table');
  capTable.innerHTML = `<thead><tr><th>Manager</th><th class="right">Hauls (10+)</th><th class="right">Blanks (≤4)</th><th class="right">Avg pts</th><th class="right">VC regret</th></tr></thead><tbody>${
    RANKED_MIDS.slice().sort((a,b) => MGRS[b].cap_avg_raw - MGRS[a].cap_avg_raw).map(mid => {
      const m = MGRS[mid];
      return `<tr><td class="name">${shortName(m.name)}</td><td class="right good">${m.cap_hauls}</td><td class="right bad">${m.cap_blanks}</td><td class="right">${m.cap_avg_raw}</td><td class="right ${m.vc_regret > 8 ? 'bad' : ''}">${m.vc_regret} (${m.vc_regret_count}×)</td></tr>`;
    }).join('')
  }</tbody>`;

  // Bench table
  const benchTable = document.getElementById('bench-table');
  benchTable.innerHTML = `<thead><tr><th>Manager</th><th class="right">Total bench pts</th><th class="right">Worst single GW</th><th class="right">Biggest single miss</th></tr></thead><tbody>${
    RANKED_MIDS.slice().sort((a,b) => b.bench_total - a.bench_total === 0 ? 0 : MGRS[b].bench_total - MGRS[a].bench_total).map(mid => {
      const m = MGRS[mid];
      return `<tr><td class="name">${shortName(m.name)}</td><td class="right bad">${m.bench_total}</td><td class="right">${m.worst_bench_gw.bench} (GW${m.worst_bench_gw.gw})</td><td class="right">${m.biggest_bench_miss.player || '—'} ${m.biggest_bench_miss.pts ? `(${m.biggest_bench_miss.pts} in GW${m.biggest_bench_miss.gw})` : ''}</td></tr>`;
    }).join('')
  }</tbody>`;

  // Hits ROI - estimate value of hits
  const hitsTable = document.getElementById('hits-roi-table');
  hitsTable.innerHTML = `<thead><tr><th>Manager</th><th class="right">Transfers</th><th class="right">Hits</th><th class="right">Net 5GW transfers</th><th class="right">ROI</th></tr></thead><tbody>${
    RANKED_MIDS.map(mid => {
      const m = MGRS[mid];
      const totalNet = m.transfer_log.reduce((s,t) => s + t.net_5gw, 0);
      const roi = m.hits_total ? (totalNet - m.hits_total).toFixed(0) : totalNet.toFixed(0);
      const roiClass = roi >= 0 ? 'good' : 'bad';
      return `<tr><td class="name">${shortName(m.name)}</td><td class="right">${m.transfers_total}</td><td class="right bad">-${m.hits_total}</td><td class="right">${totalNet >= 0 ? '+' : ''}${totalNet}</td><td class="right ${roiClass}">${roi >= 0 ? '+' : ''}${roi}</td></tr>`;
    }).join('')
  }</tbody>`;

  // Chip ROI
  const chipTable = document.getElementById('chip-roi-table');
  let chipRows = '';
  const chipNames = { '3xc': 'Triple Cap', 'bboost': 'Bench Boost', 'freehit': 'Free Hit', 'wildcard': 'Wildcard' };
  RANKED_MIDS.forEach(mid => {
    const m = MGRS[mid];
    m.chips.forEach(([name, gw]) => {
      const teamPts = m.gw_history.find(h => h.gw === gw)?.pts || 0;
      const avg = D.league_avg_per_gw[gw] || 0;
      const diff = teamPts - avg;
      const cls = diff >= 0 ? 'good' : 'bad';
      chipRows += `<tr><td class="name">${shortName(m.name)}</td><td>${chipNames[name] || name}</td><td class="right">GW${gw}</td><td class="right">${teamPts}</td><td class="right">${Math.round(avg)}</td><td class="right ${cls}">${diff >= 0 ? '+' : ''}${Math.round(diff)}</td></tr>`;
    });
  });
  chipTable.innerHTML = `<thead><tr><th>Manager</th><th>Chip</th><th class="right">GW</th><th class="right">Team pts</th><th class="right">League avg</th><th class="right">Diff</th></tr></thead><tbody>${chipRows}</tbody>`;

  // Transfers leaderboard
  const allTransfers = [];
  RANKED_MIDS.forEach(mid => {
    MGRS[mid].transfer_log.forEach(t => {
      allTransfers.push({ ...t, mid });
    });
  });
  const bestTransfers = allTransfers.slice().sort((a,b) => b.net_5gw - a.net_5gw).slice(0, 8);
  const worstTransfers = allTransfers.slice().sort((a,b) => a.net_5gw - b.net_5gw).slice(0, 8);

  document.getElementById('transfers-leaderboard').innerHTML = `
    <div class="transfers-split">
      <div class="transfer-list good">
        <h3>🎯 BEST TRANSFERS (5GW NET)</h3>
        ${bestTransfers.map(t => `
          <div class="transfer-item good">
            <div><strong>${shortName(MGRS[t.mid].name)}</strong> · GW${t.gw}</div>
            <div style="color: #888; font-size: 11px;">${t.in_name} in for ${t.out_name}</div>
            <span class="net">+${t.net_5gw} pts</span>
          </div>
        `).join('')}
      </div>
      <div class="transfer-list bad">
        <h3>💩 WORST TRANSFERS (5GW NET)</h3>
        ${worstTransfers.map(t => `
          <div class="transfer-item bad">
            <div><strong>${shortName(MGRS[t.mid].name)}</strong> · GW${t.gw}</div>
            <div style="color: #888; font-size: 11px;">${t.in_name} in for ${t.out_name}</div>
            <span class="net">${t.net_5gw} pts</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}
buildNerd();

// Make functions accessible
window.switchTab = switchTab;
window.selectManager = selectManager;
