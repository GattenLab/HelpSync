V.shell = function() {
  const L = { mgr: '店長', si: 'ユニット統括', area: 'エリアマネージャー' };
  const LS = { mgr: '店長', si: 'ユニット統括', area: 'エリアMgr' };   // 幅が狭い端末向けの短縮表記（エリアMgrは他画面のエスカレーション表記と統一）
  let c = '';
  if (St.view === 'absence') c = V.absenceForm();
  else if (St.role === 'mgr') c = St.step === 'sent' ? V.mSent() : St.step === 'form' ? V.mForm() : St.step === 'custom' ? V.mCustom() : V.mDash();
  else if (St.role === 'si') c = St.siTab === 'create' ? (St.step === 'custom' ? V.siCustom() : V.siForm()) : V.siDash();
  else if (St.role === 'staff') c = V.staffDash();
  else if (St.role === 'area') c = V.areaDash();
  return `${V.hd(L[St.role] || '', LS[St.role] || '')}<div class="pb8">${c}</div>`;
};

// ロゴのみのヘッダー — ログイン・欠勤報告・モーダルなど、役割ラベルや切替ボタンが不要な画面用（見た目は V.hd と揃える）
V.brand = function() {
  return `<header><div class="hd-solo">${I.logo}</div></header>`;
};

// アプリ画面のヘッダー — 左=役割ラベル / 中央=ロゴ / 右=切替ボタン（旧: 緑タイル+「ヘルプ調整」の文字表記はロゴに置換）
V.hd = function(role, roleShort) {
  return `<header><div>
    <div class="hd-side">
      <span class="hd-role hd-role-full muted">${role}</span>
      <span class="hd-role hd-role-short muted">${roleShort}</span>
    </div>
    ${I.logo}
    <div class="hd-side hd-side-r">
      <button data-a="switch" class="sm med green" style="border:1px solid rgba(45,132,81,.2);border-radius:var(--radius-md);padding:.25rem .625rem;background:transparent;cursor:pointer">切替</button>
    </div>
  </div></header>`;
};

const A = {
  timerId: null,

  init() {
    St.load();
    // デモ欠勤報告（山田花子）— 初回のみ
    if (!St.absenceReport && St.reqs.length > 0) {
      St.absenceReport = {
        id: 'abs-demo', sid: 'a6', sName: '西荻窪駅南店',
        staffName: 'テスト太郎', reason: '体調不良',
        date: TODAY, tS: '13:00', tE: '17:00',
        tasks: ['レジ','品出し'], at: Date.now() - 300000, status: 'reported'
      };
      St.save();
    }
    this.render();
    this.startTimer();
  },

  startTimer() {
    if (this.timerId) return;
    this.timerId = setInterval(() => {
      let changed = false;
      St.reqs.forEach(req => {
        if (req.dead > 0 && req.st !== 'filled' && req.st !== 'closed') {
          req.dead--;
          const elapsed = (req.origDead || 7200) - req.dead;
          req.min = Math.floor(elapsed / 60);
          // シフト開始時刻を過ぎたら自動終了（猶予15分）
          if (U.isShiftStarted(req, 15)) {
            req.st = 'closed';
            req.dead = 0;
            changed = true;
          }
          const newLevel = U.checkEscalation(req, elapsed);
          if (newLevel > req.escLevel) {
            req.escLevel = newLevel;
            req.escHistory.push({ level: newLevel, atMin: req.min });
            changed = true;
            if (newLevel >= 2 && req.st === 'open') { req.st = 'urgent'; changed = true; }
            if (newLevel >= 4) { req.st = 'closed'; changed = true; }
          }
        }
      });
      if (changed) {
        St.save();
        if (St.view === 'app' || St.view === 'apps') this.render();
      } else if (St.view === 'app' && (St.role === 'mgr' || St.role === 'si' || St.role === 'area')) {
        this.updateCountdowns();
      }
    }, 1000);
  },

  updateCountdowns() {
    const els = document.querySelectorAll('[data-dead]');
    els.forEach(el => {
      const rid = el.dataset.dead;
      const req = St.reqs.find(r => r.id === rid);
      if (req && req.dead > 0) {
        el.textContent = U.fmtDead(req.dead);
        const bar = el.closest('.card')?.querySelector('[data-prog]');
        if (bar) {
          const pg = U.prog(req.dead, req.origDead || 1800);
          const pc = req.dead <= 300 ? 'var(--red)' : req.dead <= 600 ? '#f59e0b' : 'var(--blue)';
          bar.style.width = pg + '%';
          bar.style.background = pc;
        }
      }
    });
  },

  render() {
    const app = document.getElementById('app');
    if (!app) return;
    let h = '';
    if (St.view === 'role') h = V.role();
    else if (St.view === 'login') h = V.login();
    else if (St.view === 'app') h = V.shell();
    else if (St.view === 'apps') h = V.apps();
    else if (St.view === 'absence') h = V.brand() + V.absenceForm();
    else if (St.view === 'mgrCoverList') h = V.mgrCoverList();
    app.innerHTML = h;
    this.bind();
  },

  bind() {
    document.onclick = e => {
      const el = e.target.closest('[data-a]');
      if (!el) return;
      const a = el.dataset.a;

      switch (a) {
        case 'sel-role':
          St.role = el.dataset.r;
          St.view = 'login';
          this.render();
          break;
        case 'sel-login': {
          const id = el.dataset.id;
          if (St.role === 'mgr') St.sid = id;
          else if (St.role === 'si') St.unitId = id;
          else if (St.role === 'staff') St.staffId = id;
          St.view = 'app';
          St.save();
          this.render();
          break;
        }
        case 'back-role':
          St.role = null;
          St.view = 'role';
          this.render();
          break;
        case 'switch':
          St.role = null;
          St.view = 'role';
          St.banner = null;
          this.render();
          break;
        case 'reset':
          if (confirm('データをリセットしますか？')) { St.reset(); this.render(); }
          break;
        case 'mgr-new':
          if (St.role !== 'mgr') return;
          St.step = 'form';
          this.render();
          break;
        case 'sel-tpl': {
          const t = D.T.find(x => x.id === el.dataset.tid);
          if (!t) return;
          St.tpl = { id: t.id, name: (t.r === '体調不良' || t.r === '急用' || t.r === '遅延') ? '田中 一郎' : '', tS: t.tS, tE: t.tE, tasks: [...t.tasks], urgent: t.urgent !== false, label: t.label };
          this.render();
          break;
        }
        case 'cancel-form':
          St.step = 'dash';
          St.tpl = null;
          this.render();
          break;
        case 'submit-req':
          if (St.role !== 'mgr' || !St.tpl || St._s) return;
          St._s = true;
          {
            const isUrgent = St.tpl.urgent !== false;
            const deadSec = 7200;
            const sid = St.sid || 'a6';
            const sInfo = D.S.find(s => s.id === sid);
            const sName = sInfo?.name || '西荻窪駅南店';
            const uid = sInfo?.unitId || 'u1';
            const nr = { id: 'h' + Date.now(), sid: sid, sName: sName, uid: uid, date: U.resolveDate(St.tpl.tS), tS: St.tpl.tS, tE: St.tpl.tE, tasks: [...St.tpl.tasks], st: 'open', posted: 'たった今', req: 1, min: 0, dead: deadSec, origDead: deadSec, urgent: isUrgent, escLevel: 0, escHistory: [], applicants: [] };
            St.reqs.unshift(nr);
            St.approved[nr.id] = [];
            St.step = 'sent';
            St._s = false;
            St.save();
            this.render();
            setTimeout(() => { if (St.step === 'sent') { St.step = 'dash'; St.tpl = null; this.render(); } }, 5000);
          }
          break;
        case 'return':
          St.step = 'dash';
          St.tpl = null;
          this.render();
          break;
        case 'view-app': {
          const rid = el.dataset.rid;
          St.vr = St.reqs.find(r => r.id === rid);
          St.view = 'apps';
          this.render();
          break;
        }
        case 'si-new':
          if (St.role !== 'si') return;
          St.siTab = 'create';
          this.render();
          break;
        case 'si-sel-s':
          if (St.role !== 'si') return;
          St.siF.sid = el.dataset.sid;
          if (St.customForm) St.customForm.sid = el.dataset.sid;
          this.render();
          break;
        case 'si-sel-t':
          if (St.role !== 'si') return;
          St.siF.tid = el.dataset.tid;
          this.render();
          break;
        case 'si-can':
          St.siF = { sid: '', tid: '' };
          St.siTab = 'unit';
          this.render();
          break;
        case 'si-sub':
          if (St.role !== 'si' || St._s) return;
          St._s = true;
          if (!St.siF.sid || !St.siF.tid) { St._s = false; alert('店舗とテンプレートを選択してください'); return; }
          {
            const tp = D.T.find(t => t.id === St.siF.tid);
            const st = D.S.find(s => s.id === St.siF.sid);
            const uid = St.unitId || 'u1';
            const deadSec = 7200;
            const nr = { id: 'h' + Date.now(), sid: st.id, sName: st.name, uid: uid, date: U.resolveDate(tp.tS), tS: tp.tS, tE: tp.tE, tasks: [...tp.tasks], st: 'open', posted: 'たった今', req: 1, min: 0, dead: deadSec, origDead: deadSec, urgent: false, escLevel: 0, escHistory: [], applicants: [] };
            St.reqs.unshift(nr);
            St.approved[nr.id] = [];
            St._s = false;
            St.siF = { sid: '', tid: '' };
            St.siTab = 'unit';
            St.save();
            this.render();
          }
          break;
        case 'apply': {
          const rid = el.dataset.rid;
          const st = D.ST.find(s => s.id === St.staffId) || D.ST[0];
          const req = St.reqs.find(r => r.id === rid);
          if (req && !req.applicants.find(a => a.sid === st.id)) {
            req.applicants.unshift({ sid: st.id, name: st.name, at: 'たった今', ok: false, cnt: st.cnt || 0, exp: st.exp || [] });
            St.save();
          }
          this.render();
          break;
        }
        case 'cancel-apply': {
          const rid = el.dataset.rid;
          const st = D.ST.find(s => s.id === St.staffId) || D.ST[0];
          const req = St.reqs.find(r => r.id === rid);
          if (req) { req.applicants = req.applicants.filter(a => a.sid !== st.id); St.save(); }
          this.render();
          break;
        }
        case 'mgr-cover-list':
          St.view = 'mgrCoverList';
          this.render();
          break;
        case 'close-apps':
          St.view = 'app';
          St.vr = null;
          this.render();
          break;
        case 'ok-app': {
          if (St.role === 'area') return;
          const rid = el.dataset.rid, sid = el.dataset.sid;
          const req = St.reqs.find(r => r.id === rid);
          const ap = req.applicants.find(x => x.sid === sid);
          St.approved[rid] = [...(St.approved[rid] || []), sid];
          if (!req.cf) { req.cf = { sid: ap.sid, name: ap.name, time: req.tS + '〜' + req.tE }; }
          const needed = req.req || 1;
          if ((St.approved[rid] || []).length >= needed) { req.st = 'filled'; }
          St.save();
          this.render();
          break;
        }
        case 'ng-app': {
          const rid = el.dataset.rid, sid = el.dataset.sid;
          St.approved[rid] = (St.approved[rid] || []).filter(x => x !== sid);
          delete St.reqs.find(r => r.id === rid).cf;
          St.save();
          this.render();
          break;
        }
        case 'urgent-toggle':
          if (St.tpl) { St.tpl.urgent = !St.tpl.urgent; this.render(); }
          break;
        case 'custom-mode':
          St.step = 'custom';
          St.customForm = { date: TODAY, tS: '09:00', tE: '17:00', tasks: [], req: 1, urgent: false, note: '' };
          this.render();
          break;
        case 'tpl-mode':
          St.step = 'form';
          St.customForm = null;
          this.render();
          break;
        case 'set-date':
          if (St.customForm) { St.customForm.date = el.dataset.date; this.render(); }
          break;

        case 'set-time-preset':
          if (!St.customForm) break;
          if (el.dataset.special === 'now') {
            const now = new Date();
            const nh = String(now.getHours()).padStart(2,'0');
            const nm = String(Math.floor(now.getMinutes() / 15) * 15).padStart(2,'0');
            const eh = String(Math.min(24, now.getHours() + 2)).padStart(2,'0');
            St.customForm.tS = nh + ':' + nm;
            St.customForm.tE = eh + ':' + nm;
          } else {
            St.customForm.tS = el.dataset.ts;
            St.customForm.tE = el.dataset.te;
          }
          this.render();
          break;
        case 'adj-start-minus':
          if (St.customForm) {
            const [h, m] = St.customForm.tS.split(':').map(Number);
            let total = h * 60 + m - 15;
            if (total < 0) total = 0;
            const nh = Math.floor(total / 60);
            const nm = total % 60;
            St.customForm.tS = String(nh).padStart(2,'0') + ':' + String(nm).padStart(2,'0');
            this.render();
          }
          break;
        case 'adj-start-plus':
          if (St.customForm) {
            const [h, m] = St.customForm.tS.split(':').map(Number);
            let total = h * 60 + m + 15;
            if (total > 1440) total = 1440;
            const nh = Math.floor(total / 60);
            const nm = total % 60;
            if (nh >= 24) St.customForm.tS = '24:00';
            else St.customForm.tS = String(nh).padStart(2,'0') + ':' + String(nm).padStart(2,'0');
            this.render();
          }
          break;
        case 'adj-end-minus':
          if (St.customForm) {
            const [h, m] = St.customForm.tE.split(':').map(Number);
            let total = h * 60 + m - 15;
            if (total < 0) total = 0;
            const nh = Math.floor(total / 60);
            const nm = total % 60;
            St.customForm.tE = String(nh).padStart(2,'0') + ':' + String(nm).padStart(2,'0');
            this.render();
          }
          break;
        case 'adj-end-plus':
          if (St.customForm) {
            const [h, m] = St.customForm.tE.split(':').map(Number);
            let total = h * 60 + m + 15;
            if (total > 1440) total = 1440;
            const nh = Math.floor(total / 60);
            const nm = total % 60;
            if (nh >= 24) St.customForm.tE = '24:00';
            else St.customForm.tE = String(nh).padStart(2,'0') + ':' + String(nm).padStart(2,'0');
            this.render();
          }
          break;

        case 'toggle-task': {
          if (!St.customForm) break;
          const tsk = el.dataset.task;
          const idx = St.customForm.tasks.indexOf(tsk);
          if (idx >= 0) St.customForm.tasks.splice(idx, 1);
          else St.customForm.tasks.push(tsk);
          this.render();
          break;
        }
        case 'set-count':
          if (St.customForm) { St.customForm.req = parseInt(el.dataset.count); this.render(); }
          break;
        case 'toggle-urgent':
          if (St.customForm) { St.customForm.urgent = !St.customForm.urgent; this.render(); }
          break;
        case 'set-note':
          if (St.customForm) { St.customForm.note = el.value; }
          break;
        case 'submit-custom':
          if (St._s) return;
          St._s = true;
          {
            const cf = St.customForm;
            const sid = St.role === 'si' ? cf.sid : (St.sid || 'a6');
            const sInfo = D.S.find(s => s.id === sid);
            const sName = sInfo?.name || '';
            const uid = sInfo?.unitId || 'u1';
            const isUrgent = cf.urgent;
            const deadSec = 7200;
            const nr = { id: 'h' + Date.now(), sid: sid, sName: sName, uid: uid, date: cf.date, tS: cf.tS, tE: cf.tE, tasks: [...cf.tasks], st: 'open', posted: 'たった今', req: cf.req || 1, min: 0, dead: deadSec, origDead: deadSec, urgent: isUrgent, escLevel: 0, escHistory: [], applicants: [], isCustom: true, note: cf.note || '' };
            St.reqs.unshift(nr);
            St.approved[nr.id] = [];
            St.customForm = null;
            St._s = false;
            if (St.role === 'si') { St.siTab = 'unit'; St.siF = { sid: '', tid: '' }; }
            else { St.step = 'sent'; }
            St.save();
            this.render();
            if (St.role === 'mgr') {
              setTimeout(() => { if (St.step === 'sent') { St.step = 'dash'; this.render(); } }, 5000);
            }
          }
          break;
        case 'ok-app-batch': {
          if (St.role === 'area') return;
          const rid = el.dataset.rid;
          const req = St.reqs.find(r => r.id === rid);
          const recIds = U.getRecommended(req.applicants, req);
          recIds.forEach(sid => { if (!(St.approved[rid] || []).includes(sid)) { St.approved[rid] = [...(St.approved[rid] || []), sid]; } });
          if (recIds.length > 0 && !req.cf) { const first = req.applicants.find(a => a.sid === recIds[0]); req.cf = { sid: first.sid, name: first.name, time: req.tS + '〜' + req.tE }; }
          const needed = req.req || 1;
          if ((St.approved[rid] || []).length >= needed) { req.st = 'filled'; }
          St.save();
          this.render();
          break;
        }
        case 'mgr-cover': {
          if (St.role === 'area') return;
          const rid = el.dataset.rid;
          const req = St.reqs.find(r => r.id === rid);
          req.st = 'filled';
          req.cf = { sid: 'mgr', name: '店長（自店カバー）', time: req.tS + '〜' + req.tE };
          St.save();
          this.render();
          break;
        }
        case 'mgr-cover-absence': {
          const ar = St.absenceReport;
          if (!ar) return;
          const ma = St.myAbsences.find(a => a.id === ar.id);
          if (ma) ma.status = 'resolved';
          St.absenceReport = null;
          const req = St.reqs.find(r => r.sid === ar.sid && r.tS === ar.tS && r.st !== 'filled' && r.st !== 'closed');
          if (req) { req.st = 'filled'; req.cf = { sid: 'mgr', name: '店長（自店カバー）', time: req.tS + '〜' + req.tE }; St.save(); }
          this.render();
          break;
        }
        case 'staff-absence':
          St.absenceStep = 'shift';
          St.selectedShift = null;
          St.view = 'absence';
          this.render();
          break;
        case 'absence-sel-shift':
          St.selectedShift = parseInt(el.dataset.idx);
          this.render();
          break;
        case 'absence-next':
          if (St.selectedShift !== null) St.absenceStep = 'reason';
          this.render();
          break;
        case 'absence-submit': {
          const reason = el.dataset.reason;
          const st = D.ST.find(s => s.id === St.staffId) || D.ST[0];
          const shift = st.shifts?.[St.selectedShift];
          if (!shift) { alert('シフトを選択してください'); break; }
          const ar = { id: 'abs' + Date.now(), sid: st.sid, sName: D.S.find(s => s.id === st.sid)?.name || '', staffName: st.name, reason: reason === 'sick' ? '体調不良' : reason === 'delay' ? '交通遅延' : '急用・私用', date: shift.date, tS: shift.tS, tE: shift.tE, tasks: [...shift.tasks], at: Date.now(), status: 'reported' };
          St.absenceReport = ar;
          St.myAbsences.unshift(ar);
          St.absenceStep = 'shift';
          St.selectedShift = null;
          St.view = 'app';
          St.role = 'staff';
          St.save();
          this.render();
          break;
        }
        case 'absence-cancel':
          St.absenceStep = 'shift';
          St.selectedShift = null;
          St.view = 'app';
          St.role = 'staff';
          this.render();
          break;
        case 'mgr-absence-ok': {
          const ar = St.absenceReport;
          if (!ar) return;
          St.tpl = { id: 't1', name: ar.staffName, tS: ar.tS, tE: ar.tE, tasks: ar.tasks || ['レジ','品出し'], urgent: true };
          St.step = 'form';
          const ma = St.myAbsences.find(a => a.id === ar.id);
          if (ma) ma.status = 'resolved';
          St.absenceReport = null;
          St.save();
          this.render();
          break;
        }
        case 'mgr-absence-ng': {
          const ar = St.absenceReport;
          if (!ar) return;
          const ma = St.myAbsences.find(a => a.id === ar.id);
          if (ma) ma.status = 'resolved';
          St.absenceReport = null;
          St.save();
          this.render();
          break;
        }
      }
    };

    // テキスト入力欄（data-a付き）の変更をStateへ反映する。click同様、要素を都度探索するイベント委譲。
    document.oninput = e => {
      const el = e.target.closest('[data-a]');
      if (!el) return;
      switch (el.dataset.a) {
        case 'set-note':
          if (St.customForm) { St.customForm.note = el.value; }
          break;
      }
    };
  }
};

document.addEventListener('DOMContentLoaded', () => A.init());