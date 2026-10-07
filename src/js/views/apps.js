V.apps = function() {
  const req = St.vr;
  if (!req) return '';
  const ok = St.approved[req.id] || [];
  const recIds = U.getRecommended(req.applicants, req);
  const rev = [...req.applicants].sort((a, b) => U.calcScore(b, req) - U.calcScore(a, req));
  const approvedCount = (St.approved[req.id] || []).length;
  const needed = req.req || 1;
  const isShort = approvedCount < needed;

  const isAreaMgr = St.role === 'area';
  const ac = rev.length === 0
    ? `<div class="tc py16">
        <div class="flex aic jcc mxa" style="width:3rem;height:3rem;border-radius:var(--radius-full);background:var(--gray-50);color:var(--gray-400)">${I.us}</div>
        <p class="sm semi fg mt2">まだ応募者はいません</p>
        <p class="xs muted">スタッフに通知済み</p>
      </div>`
    : rev.map((a, i) => {
        const isOk = ok.includes(a.sid);
        const score = U.calcScore(a, req);
        const isRec = recIds.includes(a.sid);
        const scoreColor = score >= 80 ? '#16a34a' : score >= 60 ? '#2563eb' : score >= 40 ? '#d97706' : '#9ca3af';
        return `<div class="card mb3 ${isOk ? 'bd-g2 bg-g50' : ''}">
          <div class="flex jcsb">
            <div class="flex aic gap3">
              <div class="flex aic jcc" style="width:2.25rem;height:2.25rem;border-radius:var(--radius-lg);background:var(--blue-50);color:var(--green);font-size:.75rem;font-weight:700">${i + 1}位</div>
              <div>
                <p class="sm semi fg">${U.esc(a.name)} ${isRec ? '<span class="badge st-filled" style="margin-left:.25rem">推奨</span>' : ''}</p>
                <p class="xs muted">${a.at}に応募</p>
              </div>
            </div>
            ${isOk ? '<span class="xs green semi">' + I.ch + ' 承認済み</span>' : ''}
          </div>
          <div class="mt2">
            <div class="flex jcsb xs mb1"><span class="muted">スコア</span><span class="semi" style="color:${scoreColor}">${score}点</span></div>
            <div class="score-track"><div class="score-bar" style="background:${scoreColor};width:${score}%"></div></div>
          </div>
          <div class="flex gap2 mt2">
            <div class="flex aic gap2 xs muted bg-sec br8 px2 py2"><span class="green">${I.mp}</span>ヘルプ <strong class="fg">${a.cnt || 0}回</strong></div>
            ${(a.exp || []).length > 0 ? `<div class="flex aic gap2 xs muted bg-sec br8 px2 py2"><span class="green">${I.mp}</span>経験 <strong class="fg">${a.exp.length}店舗</strong></div>` : ''}
          </div>
          ${!isAreaMgr
            ? (isOk
              ? `<button data-a="ng-app" data-rid="${req.id}" data-sid="${a.sid}" class="btn2 w100 mt3" style="background:#16a34a;color:#fff">承認済み（タップで取消）</button>`
              : `<button data-a="ok-app" data-rid="${req.id}" data-sid="${a.sid}" class="btn2 w100 mt3 bg-g white">承認する — ヘルプ成立</button>`
              )
            : (isOk
              ? '<div class="flex aic gap2 mt3 xs green semi"><span style="width:1.25rem;height:1.25rem;border-radius:var(--radius-full);background:var(--green);color:var(--white);display:flex;align-items:center;justify-content:center">' + I.ch + '</span>承認済み</div>'
              : '<div class="flex aic gap2 mt3 xs muted"><span style="width:1.25rem;height:1.25rem;border-radius:var(--radius-full);background:var(--gray-200);color:var(--white);display:flex;align-items:center;justify-content:center">—</span>未承認（店長が承認します）</div>'
              )
          }
        </div>`;
      }).join('');

  const batchBtn = !isAreaMgr && recIds.length > 0 && req.st !== 'filled'
    ? `<button data-a="ok-app-batch" data-rid="${req.id}" class="btn2 w100 mb3 bg-g white">推奨者 ${recIds.length}名を一括承認</button>`
    : '';
  const coverBtn = !isAreaMgr && (rev.length === 0 || isShort) && req.st !== 'filled'
    ? `<button data-a="mgr-cover" data-rid="${req.id}" class="btn2 w100 mb3 bg-r50 red bd-r">応募がないため、この時間は店長がカバーする</button>`
    : '';
  const scoreGuide = `<div class="card mb3" style="border-color:#bfdbfe;background:var(--blue-50)">
    <p class="xs semi fg mb1">スコアの見方（100点満点）</p>
    <div class="flex col gap1 xs muted">
      <div class="flex jcsb"><span>経験店舗数</span><span>1店舗=10点（最大30点）</span></div>
      <div class="flex jcsb"><span>過去ヘルプ回数</span><span>1回=3点（最大30点）</span></div>
      <div class="flex jcsb"><span>応募の速さ</span><span>即時25点〜遅いと減点</span></div>
      <div class="flex jcsb"><span>スキルマッチ</span><span>業務一致で15点</span></div>
    </div>
  </div>`;

  return `<div class="modal fade">
    ${V.brand()}
    <div class="modal-hd">
      <div>
        <p class="sm semi fg">応募者一覧${isAreaMgr ? ' <span class="xs muted">（閲覧専用）</span>' : ''}</p>
        <p class="xs muted">${U.esc(req.sName)} ${req.tS}〜${req.tE}</p>
      </div>
      <button data-a="close-apps" class="btn2" style="width:2rem;height:2rem;padding:0;background:#eef3ec">✕</button>
    </div>
    <div class="modal-bd">${isAreaMgr ? '<div class="card mb3" style="border-color:#bfdbfe;background:var(--blue-50)"><p class="xs semi fg">エリアマネージャーは閲覧のみ可能です。承認・カバー操作は店長が行います。</p></div>' : ''}${scoreGuide}${batchBtn}${coverBtn}${ac}</div>
    <div class="modal-ft"><button data-a="close-apps" class="btn2 w100 bg-sec fg">閉じる</button></div>
  </div>`;
};