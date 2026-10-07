// 店長カバー一覧モーダル

V.mgrCoverList = function() {
  const covers = St.reqs.filter(r => r.cf && r.cf.sid === 'mgr');
  const rows = covers.length === 0
    ? '<div class="tc py16"><p class="sm muted">店長カバーはありません</p></div>'
    : covers.map(r => `<div class="card mb3 shadow">
      <div class="flex jcsb">
        <div>
          <p class="sm semi fg">${U.esc(r.sName)}</p>
          <p class="xs muted">${r.date} ${r.tS}〜${r.tE}</p>
        </div>
        <span class="badge st-filled">充足</span>
      </div>
      <div class="flex gap2 mt2">${r.tasks.map(t => `<span class="sm bg-sec fg br8 px3 py1">${t}</span>`).join('')}</div>
      <div class="flex aic gap2 mt2 xs muted"><span class="green">${I.us}</span>カバー担当: <strong class="fg">${U.esc(r.cf.name)}</strong></div>
    </div>`).join('');

  return `<div class="modal fade">
    ${V.brand()}
    <div class="modal-hd">
      <div>
        <p class="sm semi fg">店長カバー一覧</p>
        <p class="xs muted">${covers.length}件</p>
      </div>
      <button data-a="close-apps" class="btn2" style="width:2rem;height:2rem;padding:0;background:#eef3ec">✕</button>
    </div>
    <div class="modal-bd">${rows}</div>
    <div class="modal-ft"><button data-a="close-apps" class="btn2 w100 bg-sec fg">閉じる</button></div>
  </div>`;
};