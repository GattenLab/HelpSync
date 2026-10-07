// ログイン選択画面 — 役割選択後に誰としてログインするか

V.login = function() {
  const role = St.role;
  let title, subtitle, items;

  if (role === 'mgr') {
    title = '店舗を選択';
    subtitle = 'あなたの担当店舗を選んでください';
    items = D.S.map(s => ({
      id: s.id,
      label: s.name,
      sub: D.U.find(u => u.id === s.unitId)?.name || '',
      icon: I.bld
    }));
  } else if (role === 'si') {
    title = 'ユニットを選択';
    subtitle = '担当ユニットを選んでください';
    items = D.U.map(u => ({
      id: u.id,
      label: u.name,
      sub: u.stores.length + '店舗',
      icon: I.usr
    }));
  } else if (role === 'staff') {
    title = '自分を選択';
    subtitle = '名前を選んでログインしてください';
    items = D.ST.map(s => {
      const store = D.S.find(st => st.id === s.sid);
      return {
        id: s.id,
        label: s.name,
        sub: store?.name || '',
        icon: I.us
      };
    });
  } else {
    // areaはそのまま進む
    St.view = 'app';
    setTimeout(() => A.render(), 0);
    return '';
  }

  return `${V.brand()}<main class="flex col px4 py4 fade" style="min-height:calc(100vh - 3.5rem - 1px)">
    <div class="w100 max28 mxa gap4 flex col">
      <div>
        <button data-a="back-role" class="btn2 bg-w fg bd mb3" style="padding:.5rem 1rem;font-size:.75rem">← 役割選択に戻る</button>
        <h1 class="lg semi fg">${U.esc(title)}</h1>
        <p class="sm muted mt1">${U.esc(subtitle)}</p>
      </div>
      <div class="gap3 flex col">
        ${items.map(it => `<div data-a="sel-login" data-id="${it.id}" class="role-btn">
          <div class="role-icon">${it.icon}</div>
          <div>
            <p class="sm semi fg">${U.esc(it.label)}</p>
            <p class="xs muted">${U.esc(it.sub)}</p>
          </div>
        </div>`).join('')}
      </div>
    </div>
  </main>`;
};