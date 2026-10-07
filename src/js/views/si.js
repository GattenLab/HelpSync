// ユニット統括画面

V.siDash = function() {
  const uid = St.unitId || 'u1';
  const unit = St.reqs.filter(r => r.uid === uid);
  const stores = D.S.filter(s => s.unitId === uid);
  const unitInfo = D.U.find(u => u.id === uid);
  const unitLabel = unitInfo ? `${unitInfo.name}（${unitInfo.stores.length}店舗）` : 'ユニットA（吉祥寺・西荻窪）';
  const newApp = unit.reduce((s, r) => s + r.applicants.filter(a => !(St.approved[r.id] || []).includes(a.sid)).length, 0);
  const escCount = unit.filter(r => r.escLevel >= 2).length;

  const sc = stores.map(s => {
    const sr = St.reqs.filter(r => r.sid === s.id);
    const u = sr.filter(r => r.st === 'urgent').length;
    const o = sr.filter(r => r.st === 'open').length;
    const esc = sr.some(r => r.escLevel >= 2 && r.st !== 'filled' && r.st !== 'closed');
    return `<div class="card shadow ${esc ? 'bd-r bg-r50' : ''}">
      <div class="flex jcsb aic">
        <p class="sm semi fg">${U.esc(s.name)}</p>
        ${esc ? '<span class="badge st-urgent">要対応</span>' : ''}
      </div>
      <div class="flex gap2 mt2">
        ${u > 0 ? '<span class="badge st-urgent">緊急' + u + '</span>' : ''}
        ${o > 0 ? '<span class="badge st-open">募集中' + o + '</span>' : ''}
        ${u === 0 && o === 0 ? '<span class="badge st-filled">充足</span>' : ''}
      </div>
    </div>`;
  }).join('');

  const open = unit.filter(r => r.st === 'open' || r.st === 'urgent');
  const rc = open.map(req => {
    const cfg = D.C[req.st];
    const escLabel = req.escLevel > 0 ? U.getEscLabel(req.escLevel) : null;
    return `<div class="card mb3 shadow ${req.urgent ? 'bd-r' : ''}">
      <div class="flex jcsb">
        <div>
          <p class="sm semi fg">${U.esc(req.sName)}</p>
          <p class="xs muted">${req.date} ${req.tS}〜${req.tE}</p>
        </div>
        <span class="badge ${cfg.bg}">${cfg.l}</span>
      </div>
      <div class="flex gap2 mt2">${req.tasks.map(t => `<span class="sm bg-sec fg br8 px3 py1">${t}</span>`).join('')}</div>
      ${req.st !== 'filled' && req.dead > 0 ? `<div class="mt2">
        <div class="flex jcsb xs muted">
          <span class="flex aic gap1">${I.clk} 残り時間</span>
          <span data-dead="${req.id}">${U.fmtDead(req.dead)}</span>
        </div>
        <div class="progress-track"><div data-prog class="progress-bar" style="background:${req.dead <= 300 ? 'var(--red)' : req.dead <= 600 ? '#f59e0b' : 'var(--blue)'};width:${U.prog(req.dead, req.origDead || 1800)}%"></div></div>
      </div>` : ''}
      <div class="flex jcsb aic mt2">
        <div class="flex aic gap2 sm muted">${req.cf && req.cf.sid === 'mgr' ? '<span class="green">' + I.us + '</span> <strong class="fg">店長カバー</strong>' : `${I.us} 応募 ${req.applicants.length}名 / 承認 ${(St.approved[req.id] || []).length}名`}</div>
        ${req.applicants.length > 0 ? `<span data-a="view-app" data-rid="${req.id}" class="xs green med curp">確認 ${I.rt}</span>` : ''}
      </div>
      ${escLabel ? `<div class="flex aic gap2 xs ${escLabel.color === 'red' ? 'red bg-r50 bd-r' : escLabel.color === 'amber' ? 'amber bg-g50 bd-a' : 'muted bg-g50'} br8 px3 py2 mt2">${escLabel.color === 'red' ? I.alr : I.clk} ${escLabel.txt}</div>` : ''}
    </div>`;
  }).join('');

  const mgrLoads = stores.map(s => {
    const l = U.getMgrLoad(s.id);
    return { ...s, ...l };
  }).sort((a, b) => b.score - a.score);

  const loadCards = mgrLoads.map(m => {
    const level = m.score >= 60 ? '高' : m.score >= 30 ? '中' : '低';
    const color = m.score >= 60 ? 'red' : m.score >= 30 ? 'amber' : 'green';
    return `<div class="card mb2">
      <div class="flex jcsb aic">
        <p class="sm semi fg">${U.esc(m.name)}</p>
        <span class="xs ${color} semi">対応必要度: ${level}</span>
      </div>
      <div class="flex gap2 mt1">
        <span class="xs muted">未成立${m.open}件</span>
        <span class="xs muted">緊急${m.urgent}件</span>
        
        ${m.mgrCover > 0 ? `<span class="xs red">店長カバー${m.mgrCover}件</span>` : ''}
      </div>
    </div>`;
  }).join('');

  return `<div class="p4 fade">
    <div class="flex jcsb aic mb3">
      <div><p class="xs muted">担当ユニット</p><p class="base semi fg">${U.esc(unitLabel)}</p></div>
      ${newApp > 0 ? `<div class="flex aic gap2 red bg-r50 bd-r br8 px3 py2 sm semi">${I.alr} 新着応募${newApp}件</div>` : ''}
    </div>
    <div class="grid2 mb3">${sc}</div>
    <div class="card mb3"><p class="sm semi fg mb2">店長対応必要度</p>${loadCards}</div>
    <div data-a="si-new" class="btn mb3 curp">${I.pl}
      <div class="g1 tl">
        <p>ユニット内ヘルプ募集</p>
        <p class="xs" style="color:rgba(255,255,255,.7)">店長代行で募集を発行</p>
      </div>
      ${I.rt}
    </div>
    <div class="section-hd"><h3>未成立案件</h3><span class="xs muted">${open.length}件</span></div>
    ${open.length === 0 ? '<div class="card tc"><p class="sm muted">未成立のヘルプはありません</p></div>' : rc}
  </div>`;
};

V.siForm = function() {
  const uid = St.unitId || 'u1';
  const sb = D.S.filter(s => s.unitId === uid).map(s => `<button type="button" data-a="si-sel-s" data-sid="${s.id}" class="card py3 tc curp ${St.siF.sid === s.id ? 'bd-g bg-g5' : ''}" style="width:100%;background:var(--white);font-family:inherit;position:relative">
    <p class="sm med fg">${U.esc(s.name)}</p>
    ${St.siF.sid === s.id ? '<div style="position:absolute;top:.5rem;right:.5rem;width:1.25rem;height:1.25rem;border-radius:var(--radius-full);background:var(--green);color:var(--white);display:flex;align-items:center;justify-content:center">' + I.ch + '</div>' : ''}
  </button>`).join('');

  const tb = D.T.map(t => `<button type="button" data-a="si-sel-t" data-tid="${t.id}" class="card mb2 curp ${St.siF.tid === t.id ? 'bd-g bg-g5' : ''}" style="width:100%;background:var(--white);font-family:inherit;text-align:left;position:relative">
    <div class="flex jcsb">
      <div>
        <p class="sm semi fg">${U.esc(t.label)}</p>
        <p class="xs muted mt1">${t.tS}〜${t.tE} · ${t.tasks.join('・')}</p>
      </div>
      ${St.siF.tid === t.id ? '<div style="width:1.25rem;height:1.25rem;border-radius:var(--radius-full);background:var(--green);color:var(--white);display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-left:.5rem">' + I.ch + '</div>' : ''}
    </div>
  </button>`).join('');

  return `<div class="p4 fade">
    <h2 class="base semi fg">ユニット内ヘルプ募集</h2>
    <p class="sm muted mt1">店長代行で募集を発行</p>
    <div class="mt3"><p class="xs med muted mb2">対象店舗</p><div class="grid2">${sb}</div></div>
    <div class="mt3"><p class="xs med muted mb2">テンプレートを選択</p>${tb}</div>
    <div class="mt3">
      <p class="xs med muted mb2">または</p>
      <button data-a="custom-mode" class="btn2 w100 bg-w fg bd" style="padding:1rem">
        <div class="flex aic gap3">
          <div class="flex aic jcc" style="width:2rem;height:2rem;border-radius:var(--radius-full);background:var(--green-10);color:var(--green)">${I.pl}</div>
          <div class="tl">
            <p class="sm semi fg">自由に作成する</p>
            <p class="xs muted">日付・時間・業務を自分で指定</p>
          </div>
        </div>
      </button>
    </div>
    <div class="flex gap3 mt3">
      <button data-a="si-can" class="btn2 g1 bg-w fg bd">キャンセル</button>
      <button data-a="si-sub" class="btn2 g1 btn-img" ${!St.siF.sid || !St.siF.tid ? 'disabled' : ''}><img src="./btn-request.png" alt="応援を依頼する"></button>
    </div>
  </div>`;
};

V.siCustom = function() {
  const uid = St.unitId || 'u1';
  const stores = D.S.filter(s => s.unitId === uid);

  // customForm の初期化
  if (!St.customForm) {
    St.customForm = { date: TODAY, tS: '09:00', tE: '17:00', tasks: [], req: 1, urgent: false, note: '' };
  }
  const cf = St.customForm;

  // 店舗選択
  const sb = stores.map(s => {
    const active = cf.sid === s.id ? 'bd-g bg-g5' : '';
    return `<button type="button" data-a="si-sel-s" data-sid="${s.id}" class="card py3 tc curp ${active}" style="width:100%;background:var(--white);font-family:inherit;position:relative;border:none">
      <p class="sm med fg">${U.esc(s.name)}</p>
      ${cf.sid === s.id ? '<div style="position:absolute;top:.5rem;right:.5rem;width:1.25rem;height:1.25rem;border-radius:var(--radius-full);background:var(--green);color:var(--white);display:flex;align-items:center;justify-content:center">' + I.ch + '</div>' : ''}
    </button>`;
  }).join('');

  // 日付選択
  const dateOpts = [TODAY, DEMO_DATES[4], DEMO_DATES[5]].map((d, i) => {
    const label = i === 0 ? '今日' : i === 1 ? '明日' : '明後日';
    const active = cf.date === d ? 'bd-g bg-g5' : '';
    return `<button data-a="set-date" data-date="${d}" class="card py3 tc curp ${active}" style="width:100%;font-family:inherit;border:none;${active ? 'background:var(--green);color:var(--white)' : 'background:var(--white)'}">
      <p class="sm med fg">${label}</p>
      <p class="xs muted">${d.replace(/\d+年/, '')}</p>
    </button>`;
  }).join('');

  // 時間プリセット
  // 時間帯クイック選択
  const timePresets = [
    { label: '早朝', sub: '5:00〜9:00', tS: '05:00', tE: '09:00' },
    { label: '朝', sub: '8:00〜12:00', tS: '08:00', tE: '12:00' },
    { label: '昼', sub: '11:00〜15:00', tS: '11:00', tE: '15:00' },
    { label: '夕方', sub: '16:00〜19:00', tS: '16:00', tE: '19:00' },
    { label: '夜', sub: '19:00〜23:00', tS: '19:00', tE: '23:00' },
    { label: '深夜', sub: '22:00〜2:00', tS: '22:00', tE: '02:00' },
    { label: '深夜早', sub: '0:00〜5:00', tS: '00:00', tE: '05:00' },
    { label: '今から', sub: '2時間後まで', tS: '09:00', tE: '17:00', special: 'now' }
  ];
  const tpBtns = timePresets.map(p => {
    const active = cf.tS === p.tS && cf.tE === p.tE ? 'bd-g' : '';
    return `<button data-a="set-time-preset" data-ts="${p.tS}" data-te="${p.tE}" data-special="${p.special || ''}" class="card py3 tc curp ${active}" style="font-family:inherit;border:none;min-width:0;${active ? 'background:var(--green);color:var(--white)' : 'background:var(--white)'}">
      <p class="sm med ${active ? 'white' : 'fg'}">${active ? I.ch + ' ' : ''}${p.label}</p>
      <p class="xs ${active ? 'white' : 'muted'}" style="opacity:${active ? '.9' : '1'}">${p.sub}</p>
    </button>`;
  }).join('');

  // 時刻微調整
  const adjBtn = 'btn2';
  const adjBtnStyle = 'width:2.5rem;height:2.5rem;padding:0;font-size:1.25rem;font-weight:700;border-radius:var(--radius-full)';
  const timeDisplay = `<div class="card" style="background:var(--green-10);border-color:var(--green)">
    <div class="flex jcsb aic" style="padding:.75rem 1rem">
      <div class="tc g1">
        <p class="xs muted mb1">開始</p>
        <p class="xl bold fg">${cf.tS}</p>
        <div class="flex jcc gap2 mt1">
          <button data-a="adj-start-minus" class="${adjBtn} bg-w fg bd" style="${adjBtnStyle}">−</button>
          <button data-a="adj-start-plus" class="${adjBtn} bg-w fg bd" style="${adjBtnStyle}">+</button>
        </div>
      </div>
      <div style="width:1px;height:3rem;background:var(--gray-200)"></div>
      <div class="tc g1">
        <p class="xs muted mb1">終了</p>
        <p class="xl bold fg">${cf.tE}</p>
        <div class="flex jcc gap2 mt1">
          <button data-a="adj-end-minus" class="${adjBtn} bg-w fg bd" style="${adjBtnStyle}">−</button>
          <button data-a="adj-end-plus" class="${adjBtn} bg-w fg bd" style="${adjBtnStyle}">+</button>
        </div>
      </div>
    </div>
    <p class="xs muted tc" style="padding-bottom:.75rem">15分単位で調整</p>
  </div>`;
  // 業務選択
  const taskList = ['レジ', '品出し', '清掃', '接客', 'その他'];
  const taskBtns = taskList.map(t => {
    const active = cf.tasks.includes(t);
    return `<button data-a="toggle-task" data-task="${t}" class="card py2 tc curp ${active ? 'bd-g' : ''}" style="flex:1;font-family:inherit;border:none;min-width:0;${active ? 'background:var(--green);color:var(--white)' : 'background:var(--white)'}">
      <p class="xs med ${active ? 'white' : 'muted'}">${active ? I.ch + ' ' : ''}${t}</p>
    </button>`;
  }).join('');

  // 人数選択
  const countBtns = [1, 2, 3].map(n => {
    const active = cf.req === n;
    return `<button data-a="set-count" data-count="${n}" class="card py2 tc curp ${active ? 'bd-g' : ''}" style="flex:1;font-family:inherit;border:none;min-width:0;${active ? 'background:var(--green);color:var(--white)' : 'background:var(--white)'}">
      <p class="sm med ${active ? 'white' : 'muted'}">${active ? I.ch + ' ' : ''}${n}名</p>
    </button>`;
  }).join('');

  // 確認エリア
  const confirmArea = cf.sid && cf.tasks.length > 0 ? `<div class="bg-sec br12 p4 mb3">
    <p class="sm semi fg mb2">送信内容の確認</p>
    <div class="flex jcsb sm mb1"><span class="muted">店舗</span><span class="semi">${U.esc(D.S.find(s => s.id === cf.sid)?.name || '')}</span></div>
    <div class="flex jcsb sm mb1"><span class="muted">日付</span><span class="semi">${cf.date}</span></div>
    <div class="flex jcsb sm mb1"><span class="muted">時間</span><span class="semi">${cf.tS} 〜 ${cf.tE}</span></div>
    <div class="flex jcsb sm mb1"><span class="muted">業務</span><span class="semi">${cf.tasks.join('・') || '—'}</span></div>
    <div class="flex jcsb sm mb1"><span class="muted">必要人数</span><span class="semi">${cf.req}名</span></div>
    <div class="flex jcsb sm aic mt2" style="padding-top:.75rem;border-top:1px solid var(--gray-200)">
      <span class="muted">緊急モード</span>
      <button data-a="toggle-urgent" class="btn2 ${cf.urgent ? 'bg-g white' : 'bg-w fg bd'}" style="padding:.5rem 1rem;font-size:.75rem">${cf.urgent ? 'ON' : 'OFF'}</button>
    </div>
    ${cf.urgent ? '<p class="xs red mt1">15分でリマインド・30分で統括通知・60分でエリアMgr・90分で自動終了</p>' : '<p class="xs muted mt1">30分でリマインド・60分で統括通知・90分でエリアMgr・120分で自動終了</p>'}
    ${cf.note ? `<div class="flex jcsb sm mt2"><span class="muted">補足メモ</span><span class="semi">${U.esc(cf.note)}</span></div>` : ''}
  </div>` : '';

  const canSubmit = cf.sid && cf.tasks.length > 0 && cf.tS && cf.tE;

  return `<div class="p4 fade">
    <div class="flex aic gap2 mb3">
      <button data-a="tpl-mode" class="btn2 bg-w fg bd" style="padding:.5rem 1rem;font-size:.75rem">← テンプレートに戻る</button>
    </div>
    <h2 class="base semi fg">自由に作成</h2>
    <p class="sm muted mt1">店舗・日付・時間・業務を指定して募集</p>

    <div class="mt3">
      <p class="xs med muted mb2">対象店舗</p>
      <div class="grid2">${sb}</div>
    </div>

    <div class="mt3">
      <p class="xs med muted mb2">日付</p>
      <div class="grid3">${dateOpts}</div>
    </div>

    <div class="mt3">
      <p class="xs med muted mb2">時間帯を選ぶ</p>
      <div class="grid2">${tpBtns}</div>
    </div>
    <div class="mt3">${timeDisplay}</div>

    <div class="mt3">
      <p class="xs med muted mb2">業務</p>
      <div class="flex gap2">${taskBtns}</div>
    </div>

    <div class="mt3">
      <p class="xs med muted mb2">必要人数</p>
      <div class="flex gap2">${countBtns}</div>
    </div>

    <div class="mt3">
      <p class="xs med muted mb2">補足メモ（任意）</p>
      <input data-a="set-note" type="text" class="card w100" style="padding:.75rem;font-family:inherit;border:none;background:var(--white)" placeholder="例：納品日のため品出しが多めです" value="${U.esc(cf.note || '')}">
    </div>

    ${confirmArea}

    <div class="flex gap3 mt3">
      <button data-a="cancel-form" class="btn2 g1 bg-w fg bd">キャンセル</button>
      <button data-a="submit-custom" class="btn2 g1 btn-img" ${!canSubmit ? 'disabled' : ''}><img src="./btn-request.png" alt="応援を依頼する"></button>
    </div>
  </div>`;
};
