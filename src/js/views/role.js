V.role = function() {
  const R = [
    { id: 'mgr', l: '店長', s: '15店舗対応', i: I.bld },
    { id: 'si', l: 'ユニット統括', s: '3ユニット監視', i: I.usr },
    { id: 'staff', l: 'スタッフ', s: 'ヘルプ応募・欠勤報告', i: I.us },
    { id: 'area', l: 'エリアマネージャー', s: 'エリア全体', i: I.grid }
  ];
  return `<main class="flex col aic jcc px4 py4" style="min-height:100vh">
    <div class="w100 max28 gap4 flex col fade">
      <h1 class="flex jcc logo-hero">${I.logo}</h1>
      <div class="gap3 flex col">
        <p class="xs med muted tc" style="letter-spacing:.05em">役割を選んでください</p>
        ${R.map(r => `<div data-a="sel-role" data-r="${r.id}" class="role-btn">
          <div class="role-icon">${r.i}</div>
          <div>
            <p class="sm semi fg">${U.esc(r.l)}</p>
            <p class="xs muted">${U.esc(r.s)}</p>
          </div>
        </div>`).join('')}
      </div>
      <div data-a="reset" class="tc xs muted curp py3">データをリセット</div>
      <p class="tc xs muted">プロトタイプ — ブラウザに保存</p>
    </div>
  </main>`;
};