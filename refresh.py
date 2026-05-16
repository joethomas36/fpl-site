#!/usr/bin/env python3
"""
THE LADS · 2025/26 FPL · Data Refresh Script

Run this after fetch_fpl.py and fetch_players.py to regenerate data.js.

Usage:
  Place this file in ~/fpl-data/ alongside the JSON files, then:
  python3 refresh.py

Outputs:
  data.js in the current directory.
  Copy it into your site folder, then redeploy.
"""

import json
import os
import statistics
from collections import defaultdict, Counter

OUT = os.path.expanduser("~/fpl-data")

print("Loading bootstrap.json...")
with open(f"{OUT}/bootstrap.json") as f:
    boot = json.load(f)
print("Loading all_managers.json...")
with open(f"{OUT}/all_managers.json") as f:
    mgrs = json.load(f)
print("Loading player_history.json...")
with open(f"{OUT}/player_history.json") as f:
    player_history = json.load(f)

players = {e['id']: e for e in boot['elements']}
teams = {t['id']: {'name': t['name'], 'short': t['short_name']} for t in boot['teams']}

# Build per-player per-GW points lookup
pts_lookup = defaultdict(dict)
for pid_str, gws in player_history.items():
    pid = int(pid_str)
    by_round = defaultdict(lambda: {'pts': 0, 'mins': 0, 'goals': 0, 'assists': 0, 'cs': 0, 'bonus': 0, 'xg': 0.0, 'xa': 0.0})
    for entry in gws:
        r = entry['round']
        by_round[r]['pts'] += entry['total_points']
        by_round[r]['mins'] += entry['minutes']
        by_round[r]['goals'] += entry['goals_scored']
        by_round[r]['assists'] += entry['assists']
        by_round[r]['cs'] += entry['clean_sheets']
        by_round[r]['bonus'] += entry['bonus']
        by_round[r]['xg'] += float(entry['expected_goals'])
        by_round[r]['xa'] += float(entry['expected_assists'])
    for r, d in by_round.items():
        pts_lookup[pid][r] = d

gw_totals = {mid: {gw['event']: gw for gw in m['history']['current']} for mid, m in mgrs.items()}
all_gws = sorted(set().union(*[set(g.keys()) for g in gw_totals.values()]))
last_gw = max(all_gws)

print(f"Processing {len(mgrs)} managers, {len(all_gws)} GWs (latest: GW{last_gw})...")

manager_stats = {}

for mid, m in mgrs.items():
    history = m['history']['current']
    chips = m['history']['chips']
    total_pts = sum(gw['points'] for gw in history)
    bench = sum(gw['points_on_bench'] for gw in history)
    hits = sum(gw['event_transfers_cost'] for gw in history)
    transfers = sum(gw['event_transfers'] for gw in history)

    captain_log = []
    vice_log = []
    for gw_str, pick_data in m['picks'].items():
        gw = int(gw_str)
        cap = next((p for p in pick_data['picks'] if p['is_captain']), None)
        vice = next((p for p in pick_data['picks'] if p['is_vice_captain']), None)
        if cap:
            cap_pts = pts_lookup.get(cap['element'], {}).get(gw, {}).get('pts', 0)
            captain_log.append({
                'gw': gw, 'player_id': cap['element'],
                'player_name': players[cap['element']]['web_name'],
                'multiplier': cap['multiplier'], 'raw_pts': cap_pts,
                'mult_pts': cap_pts * cap['multiplier'],
                'is_tc': cap['multiplier'] == 3
            })
        if vice:
            v_pts = pts_lookup.get(vice['element'], {}).get(gw, {}).get('pts', 0)
            vice_log.append({'gw': gw, 'player_id': vice['element'], 'player_name': players[vice['element']]['web_name'], 'raw_pts': v_pts})

    cap_returns = [c['raw_pts'] for c in captain_log]
    cap_blanks = sum(1 for r in cap_returns if r <= 4)
    cap_hauls = sum(1 for r in cap_returns if r >= 10)
    cap_total_raw = sum(cap_returns)
    cap_avg_raw = statistics.mean(cap_returns) if cap_returns else 0

    vice_wins = []
    for c, v in zip(captain_log, vice_log):
        if c['gw'] == v['gw'] and not c['is_tc']:
            if v['raw_pts'] > c['raw_pts']:
                lost = v['raw_pts'] - c['raw_pts']
                vice_wins.append({'gw': c['gw'], 'cap': c['player_name'], 'cap_pts': c['raw_pts'], 'vice': v['player_name'], 'vice_pts': v['raw_pts'], 'lost': lost})
    total_vc_regret = sum(v['lost'] for v in vice_wins)

    biggest_bench_miss = {'gw': None, 'player': None, 'pts': 0}
    for gw_str, pick_data in m['picks'].items():
        gw = int(gw_str)
        if pick_data.get('active_chip') == 'bboost':
            continue
        for p in pick_data['picks']:
            if p['multiplier'] == 0:
                p_pts = pts_lookup.get(p['element'], {}).get(gw, {}).get('pts', 0)
                if p_pts > biggest_bench_miss['pts']:
                    biggest_bench_miss = {'gw': gw, 'player': players[p['element']]['web_name'], 'pts': p_pts}

    tc_results, bb_results, fh_results, wc_results = [], [], [], []
    for c in chips:
        gw = c['event']
        pts_that_gw = gw_totals[mid].get(gw, {}).get('points', 0)
        if c['name'] == '3xc':
            cap = next(p for p in m['picks'][str(gw)]['picks'] if p['is_captain'])
            cap_pts = pts_lookup.get(cap['element'], {}).get(gw, {}).get('pts', 0)
            tc_results.append({'gw': gw, 'player': players[cap['element']]['web_name'], 'player_pts': cap_pts, 'tc_pts': cap_pts * 3, 'team_pts': pts_that_gw})
        elif c['name'] == 'bboost':
            bench_total = sum(pts_lookup.get(p['element'], {}).get(gw, {}).get('pts', 0) for p in m['picks'][str(gw)]['picks'] if p['position'] >= 12)
            bb_results.append({'gw': gw, 'team_pts': pts_that_gw, 'bench_pts': bench_total})
        elif c['name'] == 'freehit':
            fh_results.append({'gw': gw, 'team_pts': pts_that_gw})
        elif c['name'] == 'wildcard':
            wc_results.append({'gw': gw, 'team_pts': pts_that_gw})

    player_gw_count = Counter()
    for gw_str, pick_data in m['picks'].items():
        for p in pick_data['picks']:
            player_gw_count[p['element']] += 1

    top_owned = player_gw_count.most_common(5)
    favourite_player = {'id': top_owned[0][0], 'name': players[top_owned[0][0]]['web_name'], 'gws': top_owned[0][1]} if top_owned else None

    transfer_analysis = []
    for t in m['transfers']:
        in_id = t['element_in']
        out_id = t['element_out']
        gw = t['event']
        in_pts_5gw = sum(pts_lookup.get(in_id, {}).get(g, {}).get('pts', 0) for g in range(gw, min(gw+5, last_gw+1)))
        out_pts_5gw = sum(pts_lookup.get(out_id, {}).get(g, {}).get('pts', 0) for g in range(gw, min(gw+5, last_gw+1)))
        transfer_analysis.append({
            'gw': gw, 'in_id': in_id, 'in_name': players[in_id]['web_name'], 'in_cost': t['element_in_cost']/10,
            'out_id': out_id, 'out_name': players[out_id]['web_name'], 'out_cost': t['element_out_cost']/10,
            'in_pts_5gw': in_pts_5gw, 'out_pts_5gw': out_pts_5gw, 'net_5gw': in_pts_5gw - out_pts_5gw
        })

    best_transfer = max(transfer_analysis, key=lambda x: x['net_5gw']) if transfer_analysis else None
    worst_transfer = min(transfer_analysis, key=lambda x: x['net_5gw']) if transfer_analysis else None

    best_gw = max(history, key=lambda x: x['points'])
    worst_gw = min(history, key=lambda x: x['points'])
    worst_bench_gw = max(history, key=lambda x: x['points_on_bench'])

    manager_stats[mid] = {
        'name': m['manager_name'], 'team_name': m['team_name'], 'total': total_pts,
        'bench_total': bench, 'hits_total': hits, 'transfers_total': transfers,
        'gw_history': [{'gw': h['event'], 'pts': h['points'], 'bench': h['points_on_bench'], 'rank': h['overall_rank'], 'transfers': h['event_transfers'], 'hits': h['event_transfers_cost'], 'value': h['value']/10} for h in history],
        'captain_log': captain_log, 'vice_log': vice_log,
        'cap_blanks': cap_blanks, 'cap_hauls': cap_hauls,
        'cap_total_raw': cap_total_raw, 'cap_avg_raw': round(cap_avg_raw, 2),
        'vc_regret': total_vc_regret, 'vc_regret_count': len(vice_wins),
        'biggest_bench_miss': biggest_bench_miss,
        'tc_results': tc_results, 'bb_results': bb_results, 'fh_results': fh_results, 'wc_results': wc_results,
        'chips': [(c['name'], c['event']) for c in chips],
        'best_gw': {'gw': best_gw['event'], 'pts': best_gw['points']},
        'worst_gw': {'gw': worst_gw['event'], 'pts': worst_gw['points']},
        'worst_bench_gw': {'gw': worst_bench_gw['event'], 'bench': worst_bench_gw['points_on_bench']},
        'mean': round(statistics.mean([h['points'] for h in history]), 1),
        'std': round(statistics.stdev([h['points'] for h in history]), 1),
        'favourite_player': favourite_player,
        'best_transfer': best_transfer, 'worst_transfer': worst_transfer,
        'transfer_log': transfer_analysis,
        'final_value': history[-1]['value']/10 if history else 100.0
    }

# Mini-league rank per GW
mini_rank = {}
for gw in all_gws:
    standings = [(mid, sum(h['pts'] for h in manager_stats[mid]['gw_history'] if h['gw'] <= gw)) for mid in manager_stats]
    standings.sort(key=lambda x: -x[1])
    for r, (mid, _) in enumerate(standings, 1):
        mini_rank.setdefault(mid, {})[gw] = r

for mid in manager_stats:
    manager_stats[mid]['mini_rank_history'] = [{'gw': gw, 'rank': mini_rank[mid][gw]} for gw in all_gws]
    manager_stats[mid]['weeks_at_top'] = sum(1 for gw in all_gws if mini_rank[mid][gw] == 1)

# H2H
h2h = {}
for mid1 in manager_stats:
    h2h[mid1] = {}
    for mid2 in manager_stats:
        if mid1 == mid2: continue
        w = d = l = pf = pa = 0
        for gw in all_gws:
            p1 = next((h['pts'] for h in manager_stats[mid1]['gw_history'] if h['gw'] == gw), None)
            p2 = next((h['pts'] for h in manager_stats[mid2]['gw_history'] if h['gw'] == gw), None)
            if p1 is None or p2 is None: continue
            if p1 > p2: w += 1
            elif p1 < p2: l += 1
            else: d += 1
            pf += p1; pa += p2
        h2h[mid1][mid2] = {'w': w, 'd': d, 'l': l, 'pf': pf, 'pa': pa}

ownership = Counter()
captaincy = Counter()
for mid, m in mgrs.items():
    for gw_str, pick_data in m['picks'].items():
        for p in pick_data['picks']:
            ownership[p['element']] += 1
            if p['is_captain']: captaincy[p['element']] += 1

league_avg_per_gw = {}
for gw in all_gws:
    scores = [h['pts'] for mid in manager_stats for h in manager_stats[mid]['gw_history'] if h['gw'] == gw]
    league_avg_per_gw[gw] = round(statistics.mean(scores), 1) if scores else 0

KROUPI_ID = 100
kroupi_data = {
    'season_pts': players[KROUPI_ID]['total_points'],
    'goals': players[KROUPI_ID]['goals_scored'],
    'cost': players[KROUPI_ID]['now_cost']/10,
    'starts': players[KROUPI_ID]['starts'],
    'gw_history': [{'gw': r, 'pts': d['pts'], 'goals': d['goals'], 'mins': d['mins']} for r, d in sorted(pts_lookup[KROUPI_ID].items())],
    'ownership_by_gw': {},
    'kieran_haul': 0,
    'kieran_benched_pts': 0,
}
for gw in all_gws:
    owners = []
    for mid, m in mgrs.items():
        if str(gw) in m['picks']:
            for p in m['picks'][str(gw)]['picks']:
                if p['element'] == KROUPI_ID:
                    owners.append({'mid': mid, 'name': mgrs[mid]['manager_name'], 'started': p['multiplier'] >= 1})
                    break
    kroupi_data['ownership_by_gw'][gw] = owners

kieran_id = next(mid for mid, m in mgrs.items() if 'Kieran Norton' in m['manager_name'])
for gw_str, pick_data in mgrs[kieran_id]['picks'].items():
    gw = int(gw_str)
    for p in pick_data['picks']:
        if p['element'] == KROUPI_ID:
            k_pts = pts_lookup.get(KROUPI_ID, {}).get(gw, {}).get('pts', 0)
            if p['multiplier'] >= 1: kroupi_data['kieran_haul'] += k_pts * p['multiplier']
            else: kroupi_data['kieran_benched_pts'] += k_pts
            break

output = {
    'last_gw': last_gw, 'all_gws': all_gws, 'managers': manager_stats, 'h2h': h2h,
    'mini_rank_history': mini_rank, 'league_avg_per_gw': league_avg_per_gw,
    'most_owned_in_league': [{'id': pid, 'name': players[pid]['web_name'], 'count': c, 'total_pts': players[pid]['total_points'], 'cost': players[pid]['now_cost']/10} for pid, c in ownership.most_common(20)],
    'most_captained': [{'id': pid, 'name': players[pid]['web_name'], 'count': c} for pid, c in captaincy.most_common(10)],
    'kroupi': kroupi_data,
    'players': {pid: {'name': p['web_name'], 'team': teams[p['team']]['short'], 'cost': p['now_cost']/10, 'total_pts': p['total_points'], 'pos': p['element_type']} for pid, p in players.items() if pid in pts_lookup},
}

with open('data.js', 'w') as f:
    f.write('window.FPL_DATA = ')
    json.dump(output, f, separators=(',', ':'))
    f.write(';\n')

size_mb = os.path.getsize('data.js') / (1024*1024)
print(f"\n✅ data.js generated ({size_mb:.2f} MB)")
print(f"   Last GW: {last_gw}")
print(f"   Leader: {sorted(manager_stats.items(), key=lambda x: -x[1]['total'])[0][1]['name']} ({sorted(manager_stats.items(), key=lambda x: -x[1]['total'])[0][1]['total']} pts)")
print(f"\nNext: copy data.js into your site folder and redeploy.")
