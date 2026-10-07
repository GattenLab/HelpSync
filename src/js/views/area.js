// エリアマネージャー画面 — SOS可視化ダッシュボード

V.areaDash = function() {
  const all = St.reqs;
  const op = all.filter(r => r.st === 'open').length;
  const ur = all.filter(r => r.st === 'urgent').length;
  const fi = all.filter(r => r.st === 'filled').length;
  const cl = all.filter(r => r.st === 'closed').length;
  const mgrCover = all.filter(r => r.cf && r.cf.sid === 'mgr').length;
  const urgent = all.filter(r => r.st === 'urgent');

  // === SOSダッシュボード ===
  const sosStores = U.getSOSStores();
  const highSOS = sosStores.filter(s => s.level === 'high');
  const mediumSOS = sosStores.filter(s => s.level === 'medium');

  const sosCards = sosStores.slice(0, 6).map(s => {
    const weekTotal = s.weekMgrCover + s.weekUrgent;
    return `<div class="sos-card ${s.level === 'high' ? 'sos-high' : s.level === 'medium' ? 'sos-medium' : 'sos-low'}">
      <div class="flex jcsb aic">
        <p class="sm semi fg">${U.esc(s.name)}</p>
        <span class="xs ${s.level === 'high' ? 'red' : s.level === 'medium' ? 'amber' : 'green'} semi">
          ${s.level === 'high' ? '⚠️ 要対応' : s.level === 'medium' ? '⚡ 注意' : '✓ 安定'}
        </span>
      </div>
      <div class="flex gap2 mt1">
        <span class="xs muted">未成立${s.open}件</span>
        <span class="xs muted">緊急${s.urgent}件</span>
        ${s.mgrCover > 0 ? `<span class="xs red">カバー${s.mgrCover}件</span>` : ''}
      </div>
      <div class="mt2">
        <div class="flex jcsb xs mb1">
          <span class="muted">負荷スコア</span>
          <span class="semi ${s.level === 'high' ? 'red' : s.level === 'medium' ? 'amber' : 'green'}">${s.score}点</span>
        </div>
        <div class="heat-bar">
          <div class="heat-fill ${s.level === 'high' ? 'heat-high' : s.level === 'medium' ? 'heat-medium' : 'heat-low'}" style="width:${Math.min(100, s.score)}%"></div>
        </div>
        <div class="flex col gap1 xs muted mt2" style="padding:.5rem;background:var(--gray-50);border-radius:var(--radius-md)">
          <p class="xs semi fg">スコア内訳（計算式）</p>
          <div class="flex jcsb"><span>未成立${s.open}件</span><span>× 8 = ${s.open * 8}点</span></div>
          ${s.urgent > 0 ? `<div class="flex jcsb"><span>緊急${s.urgent}件</span><span>× 15 = ${s.urgent * 15}点</span></div>` : ''}
          ${s.noApps > 0 ? `<div class="flex jcsb"><span>応募ゼロ${s.noApps}件</span><span>× 20 = ${s.noApps * 20}点</span></div>` : ''}
          ${s.escLv3 > 0 ? `<div class="flex jcsb"><span>エスカレーション${s.escLv3}件</span><span>× 18 = ${s.escLv3 * 18}点</span></div>` : ''}
          <div class="flex jcsb" style="padding-top:.25rem;border-top:1px solid var(--gray-200)"><span class="semi fg">合計</span><span class="semi ${s.level === 'high' ? 'red' : s.level === 'medium' ? 'amber' : 'green'}">${s.score}点</span></div>
        </div>
      </div>
      ${s.weekMgrCover > 0 ? `<p class="xs muted mt1">過去7日: カバー${s.weekMgrCover}件 / 緊急${s.weekUrgent}件</p>` : ''}
    </div>`;
  }).join('');

  const sosAlert = highSOS.length > 0
    ? `<div class="card mb3 bd-r bg-r50">
        <div class="flex aic gap3">
          <div class="red">${I.sos}</div>
          <div class="g1">
            <p class="sm semi fg">${highSOS.length}店舗で高負荷が検出されています</p>
            <p class="xs muted">店長の無理なカバーが発生している可能性があります</p>
          </div>
        </div>
      </div>`
    : '';

  // === 直近7日間 店長カバー推移 ===
  const weekly = U.getWeeklyStats();
  const weekDates = Object.keys(weekly).slice(-7);
  const maxCover = Math.max(1, ...weekDates.map(d => weekly[d].mgrCover));
  const barChart = weekDates.map(d => {
    const h = (weekly[d].mgrCover / maxCover) * 100;
    const label = d.replace(/\d+年/, '').replace('（', '<br>（');
    return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:.25rem">
      <div style="width:100%;height:4rem;display:flex;align-items:flex-end">
        <div style="width:100%;height:${Math.max(4, h)}%;background:${weekly[d].mgrCover > 0 ? 'var(--red)' : 'var(--green)'};border-radius:var(--radius-sm) var(--radius-sm) 0 0;min-height:.25rem;transition:height .3s ease"></div>
      </div>
      <span class="xs muted" style="text-align:center;line-height:1.2">${label}</span>
      ${weekly[d].mgrCover > 0 ? `<span class="xs red bold">${weekly[d].mgrCover}</span>` : '<span class="xs green">0</span>'}
    </div>`;
  }).join('');

    // === 店長別 カバー実績ランキング ===
  const coverRanking = U.getMgrCoverRanking();
  const totalCover = coverRanking.reduce((s, m) => s + m.coverCount, 0);

  const rankingCards = coverRanking.map(m => {
    const alerts = U.getCoverAlert(m);
    const alertHtml = alerts.map(a => {
      const style = a.level === 'high'
        ? 'color:var(--red);background:var(--red-50);border-color:#fecaca'
        : a.level === 'warn'
        ? 'color:var(--amber);background:var(--amber-50);border-color:#fde68a'
        : 'color:var(--blue);background:var(--blue-50);border-color:#bfdbfe';
      return `<div class="flex aic gap2 xs br8 px3 py2 mt1" style="${style};border:1px solid">${a.level === 'high' ? I.alr : a.level === 'warn' ? I.clk : I.chart} ${a.msg}</div>`;
    }).join('');

    const scoreLevel = m.score >= 55 ? '高' : m.score >= 30 ? '中' : '低';
    const scoreColor = m.score >= 55 ? 'red' : m.score >= 30 ? 'amber' : 'green';

    return `<div class="card mb2 ${m.coverCount > 0 ? 'bd-r bg-r50' : ''}">
      <div class="flex jcsb aic">
        <div>
          <p class="sm semi fg">${U.esc(m.mgrName)}</p>
          <p class="xs muted">${U.esc(m.storeName)}</p>
        </div>
        <div class="tc">
          <p class="xl bold ${m.coverCount > 0 ? 'red' : 'green'}">${m.coverCount}</p>
          <p class="xs muted">件</p>
        </div>
      </div>
      <div class="flex gap2 mt1">
        <span class="xs muted">未成立${m.open}件</span>
        <span class="xs muted">緊急${m.urgent}件</span>
        <span class="xs ${scoreColor} semi">対応必要度:${scoreLevel}</span>
      </div>
      ${alertHtml}
    </div>`;
  }).join('');

  const rankingSection = `<div class="card mb3">
    <div class="flex aic gap2 mb2">
      <span class="red">${I.chart}</span>
      <p class="sm semi fg">店長別 カバー実績ランキング（過去7日）</p>
    </div>
    <div class="flex jcsb xs muted mb2" style="padding-bottom:.5rem;border-bottom:1px solid var(--gray-200)">
      <span>対象: ${coverRanking.length}店舗</span>
      <span>合計: ${totalCover}件</span>
    </div>
    ${rankingCards}
  </div>`;

  // === エリア内募集一覧 ===
  const rc = all.map(req => {
    const cfg = D.C[req.st];
    const escLabel = req.escLevel > 0 ? U.getEscLabel(req.escLevel) : null;
    return `<div data-a="view-app" data-rid="${req.id}" class="card mb3 shadow curp ${req.urgent ? 'bd-r' : ''}">
      <div class="flex jcsb">
        <div>
          <p class="sm semi fg">${U.esc(req.sName)}</p>
          <p class="xs muted">${req.date} ${req.tS}〜${req.tE}</p>
        </div>
        <span class="badge ${cfg.bg}">${cfg.l}</span>
      </div>
      <div class="flex gap2 mt2">${req.tasks.map(t => `<span class="sm bg-sec fg br8 px3 py1">${t}</span>`).join('')}</div>
      <div class="flex jcsb aic mt2">
        <div class="flex aic gap2 sm muted">${I.us} 応募 <strong class="fg">${req.applicants.length}</strong>名 / 承認 <strong class="fg">${(St.approved[req.id] || []).length}</strong>名</div>
        ${req.applicants.length > 0 ? `<span data-a="view-app" data-rid="${req.id}" class="xs green med">確認 ${I.rt}</span>` : ''}
      </div>
      ${escLabel ? `<div class="flex aic gap2 xs ${escLabel.color === 'red' ? 'red bg-r50 bd-r' : escLabel.color === 'amber' ? 'amber bg-g50 bd-a' : 'muted bg-g50'} br8 px3 py2 mt2">${escLabel.color === 'red' ? I.alr : I.clk} ${escLabel.txt}</div>` : ''}
    </div>`;
  }).join('');

  return `<div class="p4 fade">
    <div class="mb3">
      <p class="xs muted">担当エリア</p>
      <p class="base semi fg">エリア全体</p>
    </div>

    <div class="grid2 mb3">
      <div class="card tc"><p class="xl bold blue">${op}</p><p class="xs muted">募集中</p></div>
      <div class="card tc"><p class="xl bold red">${ur}</p><p class="xs muted">緊急</p></div>
      <div class="card tc"><p class="xl bold green">${fi}</p><p class="xs muted">充足</p></div>
      <div class="card tc"><p class="xl bold muted">${cl}</p><p class="xs muted">終了</p></div>
    </div>

    ${urgent.length > 0 ? `<div class="card mb3" style="border-color:#fecaca;background:var(--red-50)">
      <div class="flex aic gap3">
        <div class="red">${I.alr}</div>
        <div>
          <p class="sm semi fg">${urgent[0].sName} — 自動エスカレーション</p>
          <p class="xs muted">募集から${urgent[0].min}分経過。統括による調整も未成立。</p>
        </div>
      </div>
    </div>` : ''}



    ${mgrCover > 0 ? `<div data-a="mgr-cover-list" class="card mb3 curp" style="border-color:#fde68a;background:var(--amber-50)">
      <div class="flex aic gap3">
        <div class="amber">${I.alr}</div>
        <div class="g1">
          <p class="sm semi fg">店長カバー: ${mgrCover}件</p>
          <p class="xs muted">自店店長が直接対応したケース</p>
        </div>
        ${I.rt}
      </div>
    </div>` : ''}
    ${sosAlert}

    <div class="card mb3">
      <div class="flex aic gap2 mb2">
        <span class="red">${I.sos}</span>
        <p class="sm semi fg">SOSアラート（店舗別負荷）</p>
      </div>
      <div class="flex col gap2">${sosCards}</div>
    </div>

    ${rankingSection}

    <div class="section-hd"><h3>エリア内募集一覧</h3><span class="xs muted">${all.length}件</span></div>
    ${rc}
  </div>`;
};