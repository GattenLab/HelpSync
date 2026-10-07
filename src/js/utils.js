// ユーティリティ関数 + エリアマネージャー用データ集計

const U = {
  esc: s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'),

  fmtDead(s) {
    if (s <= 0) return '期限切れ';
    return `残り ${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  },

  prog(s, t) {
    return t === 0 ? 0 : Math.max(0, (s / t) * 100);
  },

  ESC: {
    // 2時間（120分）期限基準
    URGENT: { REMIND: 15, SI: 30, MGR: 60, CLOSE: 90 },
    NORMAL: { REMIND: 30, SI: 60, MGR: 90, CLOSE: 120 }
  },

  calcScore(a, req) {
    let score = 0;
    const expCount = (a.exp || []).length;
    score += Math.min(30, expCount * 10);
    const helpCount = a.cnt || 0;
    score += Math.min(30, helpCount * 3);
    if (a.at === 'たった今') score += 25;
    else if (a.at.includes('分前')) {
      const m = parseInt(a.at) || 0;
      score += Math.max(0, 25 - m);
    } else if (a.at === '昨日') score += 5;
    else if (a.at.includes('日前')) {
      const d = parseInt(a.at) || 0;
      score += Math.max(0, 5 - d);
    }
    const reqTasks = req.tasks || [];
    const hasExp = (a.exp || []).some(e => reqTasks.some(t => e.includes(t)));
    if (hasExp) score += 15;
    return Math.min(100, score);
  },

  getRecommended(applicants, req) {
    if (applicants.length === 0) return [];
    const scored = applicants.map(a => ({ ...a, score: U.calcScore(a, req) }));
    scored.sort((a, b) => b.score - a.score);
    const threshold = 50;
    const recCount = Math.max(1, Math.ceil(scored.length * 0.3));
    return scored.slice(0, recCount).filter(a => a.score >= threshold).map(a => a.sid);
  },

  getFillRate(req) {
    const approvedCount = (St.approved[req.id] || []).length;
    const needed = req.req || 1;
    return Math.min(1, approvedCount / needed);
  },

  getFollowWarning(req) {
    const rate = U.getFillRate(req);
    const elapsedMin = req.min || 0;
    const needed = req.req || 1;
    const approvedCount = (St.approved[req.id] || []).length;
    const isUrgent = req.urgent;
    if (rate >= 1) return { level: 'ok', msg: 'ヘルプ成立 — フォロー不要', color: 'green', icon: I.ch };
    const remaining = needed - approvedCount;
    if (rate === 0) {
      const criticalThreshold = isUrgent ? 20 : 45;
      const warnThreshold = isUrgent ? 10 : 30;
      if (elapsedMin >= criticalThreshold) return { level: 'critical', msg: `${req.tS}〜${req.tE} あなたのフォローが必要な可能性があります`, color: 'red', icon: I.alr };
      if (elapsedMin >= warnThreshold) return { level: 'warn', msg: 'まだ承認されていません — 統括が対応中', color: 'amber', icon: I.clk };
      return { level: 'info', msg: '応募待ち', color: 'blue', icon: I.clk };
    }
    return { level: 'partial', msg: `あと${remaining}名で充足`, color: 'amber', icon: I.clk };
  },

  checkEscalation(req, elapsedSec) {
    const min = Math.floor(elapsedSec / 60);
    const isUrgent = req.urgent;
    const E = U.ESC;
    if (isUrgent) {
      if (min >= E.URGENT.CLOSE) return 4;
      if (min >= E.URGENT.MGR) return 3;
      if (min >= E.URGENT.SI) return 2;
      if (min >= E.URGENT.REMIND) return 1;
      return 0;
    }
    if (min >= E.NORMAL.CLOSE) return 4;
    if (min >= E.NORMAL.MGR) return 3;
    if (min >= E.NORMAL.SI) return 2;
    if (min >= E.NORMAL.REMIND) return 1;
    return 0;
  },

  getEscLabel(level) {
    switch (level) {
      case 1: return { txt: 'リマインド済み', color: 'amber' };
      case 2: return { txt: '統括通知済み', color: 'red' };
      case 3: return { txt: 'エリアMgr通知済み', color: 'red' };
      case 4: return { txt: '自動終了', color: 'muted' };
      default: return { txt: '', color: '' };
    }
  },

  getMgrLoad(sid) {
    const sr = St.reqs.filter(r => r.sid === sid);
    const open = sr.filter(r => r.st === 'open' || r.st === 'urgent');
    const urgent = sr.filter(r => r.st === 'urgent').length;
    const noApps = sr.filter(r => (r.st === 'open' || r.st === 'urgent') && r.applicants.length === 0).length;
    const escLv3 = sr.filter(r => r.escLevel >= 3 && r.st !== 'filled' && r.st !== 'closed').length;
    const mgrCover = sr.filter(r => r.cf && r.cf.sid === 'mgr').length;

    let score = 0;
    score += open.length * 8;
    score += urgent * 15;
    score += noApps * 20;
    score += escLv3 * 18;

    return { score, open: open.length, urgent, noApps, escLv3, mgrCover };
  },

  // === 過去7日分データ集計（エリアマネージャー用）===
  getWeeklyStats() {
    const dates = DEMO_DATES;
    const stats = {};
    dates.forEach(date => {
      const dayReqs = St.reqs.filter(r => r.date === date);
      stats[date] = {
        total: dayReqs.length,
        urgent: dayReqs.filter(r => r.st === 'urgent').length,
        filled: dayReqs.filter(r => r.st === 'filled').length,
        closed: dayReqs.filter(r => r.st === 'closed').length,
        mgrCover: dayReqs.filter(r => r.cf && r.cf.sid === 'mgr').length,
        open: dayReqs.filter(r => r.st === 'open' || r.st === 'urgent').length,
      };
    });
    return stats;
  },

  getStoreWeeklyStats(sid) {
    const dates = DEMO_DATES;
    return dates.map(date => {
      const dayReqs = St.reqs.filter(r => r.date === date && r.sid === sid);
      return {
        date,
        total: dayReqs.length,
        mgrCover: dayReqs.filter(r => r.cf && r.cf.sid === 'mgr').length,
        urgent: dayReqs.filter(r => r.st === 'urgent').length,
      };
    });
  },

  getSOSStores() {
    return D.S.map(s => {
      const load = U.getMgrLoad(s.id);
      const week = U.getStoreWeeklyStats(s.id);
      const weekMgrCover = week.reduce((sum, d) => sum + d.mgrCover, 0);
      const weekUrgent = week.reduce((sum, d) => sum + d.urgent, 0);
      return {
        ...s,
        ...load,
        weekMgrCover,
        weekUrgent,
        level: load.score >= 60 ? 'high' : load.score >= 30 ? 'medium' : 'low'
      };
    }).sort((a, b) => b.score - a.score);
  },

  getMgrCoverRanking() {
    return D.S.map(s => {
      const week = U.getStoreWeeklyStats(s.id);
      const coverCount = week.reduce((sum, d) => sum + d.mgrCover, 0);
      const load = U.getMgrLoad(s.id);
      return {
        mgrName: s.mgr,
        storeName: s.name,
        sid: s.id,
        coverCount,
        score: load.score,
        urgent: load.urgent,
        noApps: load.noApps,
        open: load.open
      };
    }).sort((a, b) => b.coverCount - a.coverCount);
  },

  getCoverAlert(mgr) {
    const alerts = [];
    if (mgr.coverCount >= 2 && mgr.score >= 55) {
      alerts.push({ level: 'high', msg: '負荷スコアとカバー件数が共に高値 — ユニット統括への支援要請を推奨' });
    }
    if (mgr.coverCount >= 1 && mgr.noApps >= 2) {
      alerts.push({ level: 'high', msg: '応募ゼロが慢性化 — スタッフ配置・報酬体系の見直しを推奨' });
    }
    if (mgr.coverCount >= 1 && mgr.urgent >= 2) {
      alerts.push({ level: 'warn', msg: '緊急対応が多発 — 事前予測・予防的募集の導入を検討' });
    }
    if (mgr.coverCount >= 1 && mgr.score < 30) {
      alerts.push({ level: 'info', msg: '低負荷店舗でカバー発生 — 応募者が集まらない要因の調査を推奨' });
    }
    return alerts;
  },

  // === シフト開始時刻判定 ===
  parseDateTime(dateStr, timeStr) {
    const m = dateStr.match(/(\d+)年(\d+)月(\d+)日/);
    if (!m) return null;
    return new Date(`${m[1]}-${String(m[2]).padStart(2,'0')}-${String(m[3]).padStart(2,'0')}T${timeStr}:00`);
  },

  isShiftStarted(req, graceMin) {
    const dt = this.parseDateTime(req.date, req.tS);
    if (!dt) return false;
    const now = new Date();
    const grace = (graceMin || 0) * 60000;
    return now.getTime() > dt.getTime() + grace;
  },
  // === テンプレート送信時の日付自動判定 ===
  // 開始時刻が現在時刻を過ぎている場合は「明日」、そうでなければ「今日」
  resolveDate(tS) {
    const now = new Date();
    const [sh, sm] = tS.split(':').map(Number);
    const startMin = sh * 60 + sm;
    const nowMin = now.getHours() * 60 + now.getMinutes();
    if (startMin <= nowMin) {
      return DEMO_DATES[4]; // 明日
    }
    return TODAY;
  },
};
