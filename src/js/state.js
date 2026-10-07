// 状態管理 + localStorage永続化

function migrateReq(req) {
  if (req.origDead === undefined) {
    req.origDead = req.dead <= 60 ? req.dead * 60 : req.dead;
    req.dead = req.origDead;
  }
  if (req.urgent === undefined) req.urgent = (req.st === 'urgent');
  if (req.escLevel === undefined) req.escLevel = req.st === 'urgent' ? 2 : 0;
  if (!req.escHistory) req.escHistory = [];
  req.applicants.forEach(a => {
    if (a.cnt === undefined) a.cnt = 0;
    if (a.exp === undefined) a.exp = [];
  });
  return req;
}

const St = {
  role: null,
  view: 'role',
  step: 'dash',
  siTab: 'unit',
  siF: { sid: '', tid: '' },
  staffReg: false,
  absenceStep: 'shift',
  selectedShift: null,
  reqs: null,
  approved: {},
  banner: null,
  myAbsences: [],
  absenceReport: null,
  vr: null,
  tpl: null,
  customForm: null,
  sid: null,
  staffId: null,
  unitId: null,

  load() {
    try {
      let r = localStorage.getItem('hr_v12');
      if (r) {
        let d = JSON.parse(r);
        if (Array.isArray(d)) {
          this.reqs = d;
          this.reqs.forEach(migrateReq);
          this.myAbsences = [];
          this.sid = null;
          this.staffId = null;
          this.unitId = null;
          return;
        }
        if (d && d.reqs) {
          this.reqs = d.reqs;
          this.reqs.forEach(migrateReq);
          this.myAbsences = d.myAbsences || [];
          this.approved = d.approved || {};
          this.sid = d.sid || null;
          this.staffId = d.staffId || null;
          this.unitId = d.unitId || null;
          this.absenceReport = d.absenceReport || null;
          this.customForm = d.customForm || null;
          return;
        }
      }
    } catch (e) {}
    // 初回: デモデータ
    this.reqs = defReqs();
    this.reqs.forEach(migrateReq);
    this.myAbsences = defAbsences();
    this.absenceReport = null;
    this.customForm = null;
    this.sid = null;
    this.staffId = null;
    this.unitId = null;
    // デフォルト承認状態
    this.approved = {
      h2: ['st2'],
      h3: ['st5'],
    };
  },

  save() {
    try {
      localStorage.setItem('hr_v12', JSON.stringify({
        reqs: this.reqs,
        myAbsences: this.myAbsences || [],
        approved: this.approved || {},
        sid: this.sid,
        staffId: this.staffId,
        unitId: this.unitId,
        absenceReport: this.absenceReport,
        customForm: this.customForm
      }));
    } catch (e) {}
  },

  reset() {
    localStorage.clear();
    this.reqs = defReqs();
    this.reqs.forEach(migrateReq);
    this.approved = {};
    this.siF = { sid: '', tid: '' };
    this.myAbsences = defAbsences();
    this.absenceStep = 'shift';
    this.selectedShift = null;
    this.absenceReport = null;
    this.customForm = null;
    this.sid = null;
    this.staffId = null;
    this.unitId = null;
  }
};