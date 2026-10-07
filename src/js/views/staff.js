// スタッフ画面

V.staffDash = function() {
  const st = D.ST.find(s => s.id === St.staffId) || D.ST[0];
  const avail = st.avail;
  const open = St.reqs.filter(r => (r.st === 'open' || r.st === 'urgent') && avail.includes(r.sid));
  const myAbs = (St.myAbsences || []).filter(a => a.staffId === st.id).slice(0, 5);

  const absCards = myAbs.length > 0
    ? `<div class="mb3">
        <p class="xs med muted mb2">自分の欠勤報告</p>
        ${myAbs.map(a => `<div class="card mb2 ${a.status === 'resolved' ? 'bd-g2 bg-g50' : 'bd-r bg-r50'}">
          <div class="flex jcsb aic">
            <div>
              <p class="sm semi fg">${a.date} ${a.tS}〜${a.tE}</p>
              <p class="xs muted">${a.sName} · ${a.reason} · ${(a.tasks || []).join('・')}</p>
            </div>
            <span class="badge ${a.status === 'resolved' ? 'st-filled' : 'st-urgent'}">${a.status === 'resolved' ? '対応済み' : '報告済み'}</span>
          </div>
        </div>`).join('')}
      </div>`
    : '';

  const cards = open.map(req => {
    const applied = req.applicants.some(a => a.sid === st.id);
    return `<div class="card mb3 shadow">
      <div class="flex jcsb">
        <div>
          <p class="sm semi fg">${U.esc(req.sName)}</p>
          <p class="xs muted">${req.date} ${req.tS}〜${req.tE}</p>
        </div>
        <div class="tc"><p class="xs muted">応募</p><p class="base bold fg">${req.applicants.length}</p></div>
      </div>
      <div class="flex gap2 mt2">${req.tasks.map(t => `<span class="sm bg-sec fg br8 px3 py1">${t}</span>`).join('')}</div>
      ${applied
        ? `<div data-a="cancel-apply" data-rid="${req.id}" class="flex aic jcc gap2 py3 bg-g50 bd-g2 br12 green semi sm mt2 curp">${I.ch} 応募済み（タップで取消）</div>`
        : `<div data-a="apply" data-rid="${req.id}" class="btn-img mt2"><img src="./btn-apply.png" alt="応募"></div>`
      }
    </div>`;
  }).join('');

  return `<div class="p4 fade">
    <div class="flex jcsb aic mb3">
      <div><p class="xs muted">ログイン中</p><p class="base semi fg">${U.esc(st.name)}</p></div>
    </div>
    <div class="card mb3" style="border-color:#bfdbfe;background:var(--blue-50)">
      <p class="sm semi fg">${open.length}件のヘルプ募集があります</p>
    </div>
    <button data-a="staff-absence" class="btn2 w100 mb3 bg-w fg bd" style="border-color:#fecaca;color:var(--red)">${I.alr} 欠勤を報告する</button>
    ${absCards}
    <div class="card mb3" style="border-color:#fde68a;background:var(--amber-50)">
      <p class="xs muted">※実際の運用では勤怠管理システムからシフトを連携します。本デモでは仮のシフトデータを使用しています。</p>
    </div>
    <div class="section-hd"><h3>募集一覧</h3></div>
    ${open.length === 0 ? '<div class="card tc"><p class="sm muted">勤務可能店舗での募集はありません</p></div>' : cards}
  </div>`;
};