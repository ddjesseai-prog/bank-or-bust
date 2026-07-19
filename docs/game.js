'use strict';

/* Bank or Bust — v1 casual mode. Spec: DESIGN.md (11 promoted decisions).
   All tunable constants live in C. */

const C = {
  BUST_START: 2, BUST_STEP: 3, BUST_CAP: 45,          // decision #1
  NEAR_MISS: 5,                                        // decision #11
  GREED_N: 7, SLOPE: 2, JACK_BASE: 5, JACK_CAP: 15,    // decision #3
  SMALL_BASE: 70, SMALL_FLOOR: 60, MED: 25,
  SMALL_AMT: n => 10 + 2 * n,
  MED_AMT: n => 25 + 5 * n,
  JACK_AMT: n => 60 + 10 * n,
  STREAK2: 1.10, STREAK3: 1.25,                        // decision #5
  ANT_BASE: 1200, ANT_MAX: 1500, REVEAL: 400,          // decision #8
  ALARM: 800, GHOST: 1200, COMEDOWN: 2000,
  CAP_N: 16, BANK_GROW: 8, BANK_GROW_CAP: 80,          // decision #6
  VIG_STEP: 2, VIG_CAP: 20,
  HB_LOW: 60, HB_MID: 90, HB_MAX: 140,                 // decision #4
};

// ---------- pure game math ----------
function bustPct(n) { return Math.min(C.BUST_START + C.BUST_STEP * (n - 1), C.BUST_CAP); }

function weights(n) {
  if (n < C.GREED_N) return { jack: C.JACK_BASE, med: C.MED, small: C.SMALL_BASE };
  const jack = Math.min(C.JACK_BASE + C.SLOPE * (n - 6), C.JACK_CAP);
  const small = Math.max(C.SMALL_BASE - C.SLOPE * (n - 6), C.SMALL_FLOOR);
  return { jack, med: C.MED, small };
}

function rng() { // decision #9: casual mode = crypto-random, unpredictable
  const a = new Uint32Array(1);
  crypto.getRandomValues(a);
  return a[0] / 4294967296;
}

function resolvePull(n, streak, rand = rng) {
  const threshold = bustPct(n);
  const roll = rand() * 100;
  if (roll < threshold) return { bust: true, roll, threshold };
  const margin = roll - threshold; // decision #11
  const w = weights(n);
  const r2 = rand() * 100;
  let tier, amount, newStreak;
  if (r2 < w.jack) { tier = 'jackpot'; amount = C.JACK_AMT(n); newStreak = streak + 1; }
  else if (r2 < w.jack + w.med) { tier = 'medium'; amount = C.MED_AMT(n); newStreak = 0; }
  else { tier = 'small'; amount = C.SMALL_AMT(n); newStreak = 0; }
  return { bust: false, roll, threshold, margin, nearMiss: margin <= C.NEAR_MISS, tier, amount, streak: newStreak };
}

function applyPull(pot, res) { // returns [newPot, streakBonusTier]
  let p = pot + res.amount, bonus = 0;
  if (res.streak === 2) { p = Math.round(p * C.STREAK2); bonus = 2; }
  else if (res.streak === 3) { p = Math.round(p * C.STREAK3); bonus = 3; }
  return [p, bonus];
}

function anticipationMs(n) {
  if (n <= 4) return C.ANT_BASE;
  if (n >= 9) return C.ANT_MAX;
  const b = bustPct(n); // band 14–23 maps 1200→1500
  return Math.round(C.ANT_BASE + ((b - 14) / 9) * (C.ANT_MAX - C.ANT_BASE));
}

function heartbeatBpm(n) {
  const b = bustPct(n);
  if (b <= 11) return 0;
  if (b <= 23) return Math.round(C.HB_LOW + ((b - 14) / 9) * (C.HB_MID - C.HB_LOW));
  return Math.min(Math.round(C.HB_MID + ((b - 26) / 19) * (C.HB_MAX - C.HB_MID)), C.HB_MAX);
}

function bankScale(n) { // band 9+, capped at n=16 (decision #6)
  if (n < 9) return 1;
  return 1 + Math.min(C.BANK_GROW * (Math.min(n, C.CAP_N) - 8), C.BANK_GROW_CAP) / 100;
}

function vignetteAmt(n) {
  if (n < 9) return 0;
  return Math.min(C.VIG_STEP * (Math.min(n, C.CAP_N) - 8), C.VIG_CAP) / 100;
}

// ---------- audio (WebAudio, degrade gracefully) ----------
const audio = {
  ctx: null, hbTimer: null,
  init() { if (!this.ctx) { try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { /* no audio */ } } },
  tone(freq, ms, type = 'sine', gain = 0.15, sweepTo = null) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (sweepTo) o.frequency.exponentialRampToValueAtTime(sweepTo, t + ms / 1000);
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + ms / 1000);
    o.connect(g); g.connect(this.ctx.destination);
    o.start(t); o.stop(t + ms / 1000);
  },
  click() { this.tone(700, 70, 'square', 0.06); },
  reward(tier) {
    if (tier === 'small') this.tone(500, 90, 'sine', 0.1);
    else if (tier === 'medium') { this.tone(600, 100, 'sine', 0.12); setTimeout(() => this.tone(800, 120, 'sine', 0.12), 90); }
    else { [660, 880, 1100, 1320].forEach((f, i) => setTimeout(() => this.tone(f, 150, 'sine', 0.14), i * 90)); }
  },
  nearMiss(loud) { this.tone(300, 260, 'sawtooth', loud ? 0.2 : 0.1, 140); },
  alarm() { this.tone(240, C.ALARM, 'sawtooth', 0.2, 70); },
  bankChime() { [523, 659, 784].forEach((f, i) => setTimeout(() => this.tone(f, 200, 'sine', 0.12), i * 110)); },
  setHeartbeat(bpm) {
    clearInterval(this.hbTimer); this.hbTimer = null;
    if (!bpm || !this.ctx) return;
    const thump = () => { this.tone(52, 110, 'sine', 0.22); setTimeout(() => this.tone(48, 90, 'sine', 0.13), 140); };
    thump();
    this.hbTimer = setInterval(thump, Math.round(60000 / bpm));
  },
};

function haptic(pattern) { if (navigator.vibrate) { try { navigator.vibrate(pattern); } catch (e) {} } }

// ---------- persistence ----------
const store = {
  get(k, d) { try { const v = localStorage.getItem('bob_' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('bob_' + k, JSON.stringify(v)); } catch (e) {} },
};

function updateDayStreak() { // decision #8: streak calendar, cosmetic-only
  const today = new Date().toISOString().slice(0, 10);
  const s = store.get('days', { last: null, count: 0 });
  if (s.last === today) return s.count || 1;
  const y = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
  s.count = (s.last === y) ? s.count + 1 : 1;
  s.last = today;
  store.set('days', s);
  return s.count;
}

// ---------- UI + state machine ----------
const S = { phase: 'idle', n: 0, pot: 0, streak: 0, maxStreak: 0, session: 0 };
const $ = id => document.getElementById(id);

function fmt(v) { return '$' + v.toLocaleString('en-US'); }

function refreshStats() {
  $('stat-best').textContent = fmt(store.get('best', 0));
  $('stat-bars').textContent = store.get('bars', 0);
  $('stat-session').textContent = fmt(S.session);
  $('stat-days').textContent = updateDayStreak();
}

function setLadder(n) { // decision #4 + #6: feel ladder, one curve end to end
  const dial = $('dial');
  dial.classList.toggle('amber', n >= 7 && n <= 8);
  dial.classList.toggle('red', n >= 9);
  document.documentElement.style.setProperty('--bank-scale', bankScale(n));
  document.documentElement.style.setProperty('--vignette', vignetteAmt(n));
  audio.setHeartbeat(heartbeatBpm(n));
}

function setInfo(n) {
  $('pull-info').textContent = n > 0 ? `PULL ${n} · BUST ${bustPct(n)}%` : 'TAP NEW RUN';
}

function showOverlay(kind, title, body, sub, next) {
  $('overlay-title').textContent = title;
  $('overlay-title').className = kind;
  $('overlay-body').innerHTML = body + (sub ? `<div class="sub-line">${sub}</div>` : '');
  $('overlay').classList.remove('hidden');
  let done = false;
  const finish = () => { if (done) return; done = true; $('overlay').classList.add('hidden'); $('overlay').onclick = null; next(); };
  $('overlay').onclick = finish;           // tap to skip
  setTimeout(finish, C.COMEDOWN);          // auto-advance <=2s (decision #8)
}

function toIdle() {
  S.phase = 'idle'; S.n = 0; S.pot = 0; S.streak = 0; S.maxStreak = 0;
  $('pot').textContent = fmt(0);
  $('msg').innerHTML = '&nbsp;';
  $('streak-banner').textContent = '';
  $('pull-btn').textContent = 'NEW RUN';
  $('pull-btn').disabled = false;
  $('bank-btn').disabled = true;
  setLadder(0); setInfo(0); refreshStats();
}

function startRun() {
  S.phase = 'decision'; S.n = 0; S.pot = 0; S.streak = 0; S.maxStreak = 0;
  $('pull-btn').textContent = 'PULL';
  $('bank-btn').disabled = true;
  $('pot').textContent = fmt(0);
  setInfo(1);
  doPull();
}

function doPull() {
  S.phase = 'spin'; S.n += 1;
  $('pull-btn').disabled = true; $('bank-btn').disabled = true;
  $('msg').innerHTML = '&nbsp;'; $('streak-banner').textContent = '';
  setLadder(S.n); setInfo(S.n);
  const ms = anticipationMs(S.n);
  const face = $('dial-face');
  face.style.setProperty('--spin-ms', ms + 'ms');
  face.classList.remove('spinning'); void face.offsetWidth; face.classList.add('spinning');
  audio.click(); if (S.n >= 5) haptic(S.n >= 9 ? [20, 60, 20] : 20);

  setTimeout(() => {
    const res = resolvePull(S.n, S.streak);
    setTimeout(() => reveal(res), C.REVEAL);
  }, ms);
}

function reveal(res) {
  if (res.bust) return bust();
  S.streak = res.streak; S.maxStreak = Math.max(S.maxStreak, S.streak);
  const [newPot, bonus] = applyPull(S.pot, res);
  S.pot = newPot;
  $('pot').textContent = fmt(S.pot);
  const label = { small: 'CLICK', medium: 'CLUNK!', jackpot: 'JACKPOT!' }[res.tier];
  $('msg').innerHTML = `<span class="${res.tier}">+${fmt(res.amount).slice(1) ? fmt(res.amount) : ''} ${label}</span>`;
  audio.reward(res.tier);
  if (res.tier === 'jackpot') haptic([30, 50, 30, 50, 60]);
  if (res.nearMiss) { // decision #11: near-miss at margin <=5
    $('dial').classList.add('shake'); setTimeout(() => $('dial').classList.remove('shake'), 400);
    audio.nearMiss(S.n >= 9);
    $('msg').innerHTML += ' <span class="near">CLOSE CALL</span>';
    haptic(S.n >= 9 ? [40, 40, 80] : 40);
  }
  if (bonus) { // decision #5
    $('streak-banner').textContent = `STREAK x${bonus} · POT ×${bonus === 2 ? C.STREAK2 : C.STREAK3}`;
    audio.reward('jackpot');
  }
  S.phase = 'decision';
  $('pull-btn').disabled = false;
  $('bank-btn').disabled = S.pot <= 0;
}

function bust() {
  S.phase = 'bust';
  audio.alarm(); audio.setHeartbeat(0); haptic([80, 60, 80, 60, 160]);
  document.body.classList.add('flash-red');
  setTimeout(() => document.body.classList.remove('flash-red'), 500);
  const lost = S.pot;
  setTimeout(() => { // ghost card: regret is the replay fuel (decision #8)
    showOverlay('bust', 'BUSTED', `You'd have banked: ${fmt(lost)}`, null, toIdle);
  }, C.ALARM);
}

function bank() {
  if (S.phase !== 'decision' || S.pot <= 0) return;
  S.phase = 'banked';
  audio.bankChime(); audio.setHeartbeat(0); haptic(30);
  const banked = S.pot;
  S.session += banked;
  store.set('best', Math.max(store.get('best', 0), banked));
  store.set('bars', store.get('bars', 0) + Math.floor(banked / 100)); // decision #2
  store.set('lifetime', store.get('lifetime', 0) + banked);
  // honest counterfactual — one extra draw from the same source (decision #8/#9)
  const next = resolvePull(S.n + 1, S.streak);
  const sub = next.bust
    ? `Next pull would have BUSTED. Perfect bank.`
    : `Next pull was waiting: +${fmt(next.amount)} (${next.tier})…`;
  showOverlay('bank', 'BANKED', fmt(banked), sub, toIdle);
}

// ---------- wire up ----------
function main() {
  $('pull-btn').addEventListener('click', () => {
    audio.init();
    if (S.phase === 'idle') startRun();
    else if (S.phase === 'decision') doPull();
  });
  $('bank-btn').addEventListener('click', () => { audio.init(); bank(); });
  toIdle();
}

// ---------- smoke test (?smoke=1): logic-only, no timers ----------
function smokeTest() {
  const out = [];
  try {
    // structural invariants
    if (bustPct(1) !== 2 || bustPct(9) !== 26 || bustPct(16) !== 45 || bustPct(30) !== 45) throw 'bust curve';
    for (let n = 1; n <= 30; n++) {
      const w = weights(n);
      if (Math.round(w.jack + w.med + w.small) !== 100) throw 'weights sum n=' + n;
    }
    const w7 = weights(7), w11 = weights(11);
    if (w7.jack !== 7 || w7.small !== 68 || w11.jack !== 15 || w11.small !== 60) throw 'greed zone drift';
    if (bankScale(8) !== 1 || bankScale(9) !== 1.08 || bankScale(20) !== bankScale(16)) throw 'bank scale';
    if (heartbeatBpm(1) !== 0 || heartbeatBpm(5) !== 60 || heartbeatBpm(8) !== 90 || heartbeatBpm(16) !== 140) throw 'heartbeat curve';
    if (anticipationMs(1) !== 1200 || anticipationMs(9) !== 1500) throw 'anticipation';
    // streak math
    let [p] = applyPull(100, { amount: 100, streak: 2 });
    if (p !== 220) throw 'streak2 math';
    [p] = applyPull(220, { amount: 100, streak: 3 });
    if (p !== 400) throw 'streak3 math';
    // simulate 2000 runs, always-pull policy: every run must end in a bust
    let busts = 0, pulls = 0;
    for (let r = 0; r < 2000; r++) {
      let n = 1, streak = 0, pot = 0;
      for (;;) {
        const res = resolvePull(n, streak);
        pulls++;
        if (res.bust) { busts++; break; }
        if (res.margin < 0 || res.amount <= 0) throw 'bad pull result';
        [pot] = applyPull(pot, res);
        if (pot < 0) throw 'negative pot';
        streak = res.streak; n++;
        if (n > 500) throw 'run never busted';
      }
    }
    if (busts !== 2000) throw 'bust count';
    const avg = pulls / 2000;
    if (avg < 5 || avg > 14) throw 'implausible avg run length: ' + avg;
    out.push('SMOKE-OK avg-pulls=' + avg.toFixed(2));
  } catch (e) {
    out.push('SMOKE-FAIL ' + e);
  }
  const d = document.createElement('div');
  d.id = 'smoke'; d.textContent = out.join(' ');
  document.body.appendChild(d);
  document.title = out[0];
}

document.addEventListener('DOMContentLoaded', () => {
  main();
  if (location.search.includes('smoke=1')) smokeTest();
});
