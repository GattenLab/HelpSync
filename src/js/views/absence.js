V.absenceForm = function() {
  const st = D.ST.find(s => s.id === St.staffId) || D.ST[0];
  if (St.absenceStep === 'shift') {
    const shifts = st.shifts || [];
    if (shifts.length === 0) {
      return `<div class="p4 fade">
        <h2 class="base semi fg">欠勤を報告</h2>
        <p class="sm muted mt1">勤務予定が登録されていません</p>
    <div class="card mt2" style="border-color:#fde68a;background:var(--amber-50)">
      <p class="xs muted">※実際の運用では勤怠管理システムからシフトを連携します。</p>
    </div>
        <div class="mt3"><button data-a="absence-cancel" class="btn2 w100 bg-w fg bd">戻る</button></div>
      </div>`;
    }
    return `<div class="p4 fade">
      <h2 class="base semi fg">欠勤を報告</h2>
      <p class="sm muted mt1">欠勤するシフトを選んでください</p>
      <div class="mt3 gap3 flex col">
        ${shifts.map((s, i) => `<button data-a="absence-sel-shift" data-idx="${i}" class="card mb2 curp ${St.selectedShift === i ? 'bd-g bg-g5' : ''}" style="width:100%;background:var(--white);font-family:inherit;text-align:left">
          <div class="flex jcsb">
            <div>
              <p class="xs muted">${D.S.find(s2 => s2.id === st.sid)?.name || ""}</p>
              <div class="flex aic gap2">
                <p class="sm semi fg">${s.date}</p>
                ${s.date === TODAY ? '<span class="badge st-urgent" style="font-size:.625rem;padding:.0625rem .375rem">今日</span>' : s.date === DEMO_DATES[4] ? '<span class="badge st-open" style="font-size:.625rem;padding:.0625rem .375rem">明日</span>' : '<span class="badge st-filled" style="font-size:.625rem;padding:.0625rem .375rem">明後日</span>'}
              </div>
              <p class="xs muted mt1">${s.tS}〜${s.tE} · ${s.tasks.join('・')}</p>
            </div>
            ${St.selectedShift === i ? '<div style="width:1.25rem;height:1.25rem;border-radius:var(--radius-full);background:var(--green);color:var(--white);display:flex;align-items:center;justify-content:center;flex-shrink:0">' + I.ch + '</div>' : ''}
          </div>
        </button>`).join('')}
      </div>
      <div class="flex gap3 mt3">
        <button data-a="absence-cancel" class="btn2 g1 bg-w fg bd">キャンセル</button>
        <button data-a="absence-next" class="btn2 g1 ${St.selectedShift !== null ? 'bg-g white' : 'bg-sec muted'}" ${St.selectedShift === null ? 'disabled' : ''}>次へ</button>
      </div>
    </div>`;
  }
  const reasons = [
    { key: 'sick', label: '体調不良', desc: '発熱・体調不良で出勤できない' },
    { key: 'personal', label: '急用・私用', desc: '家族の急病・急な用事など' },
    { key: 'delay', label: '交通遅延・その他', desc: '電車遅延・事故などで遅刻・欠勤' }
  ];
  return `<div class="p4 fade">
    <h2 class="base semi fg">欠勤を報告</h2>
    <p class="sm muted mt1">理由を選んで送信してください</p>
    <div class="mt3 gap3 flex col">
      ${reasons.map(r => `<button data-a="absence-submit" data-reason="${r.key}" class="card mb2 curp" style="width:100%;background:var(--white);font-family:inherit;text-align:left">
        <div class="flex jcsb">
          <div>
            <p class="sm semi fg">${r.label}</p>
            <p class="xs muted mt1">${r.desc}</p>
          </div>
        </div>
      </button>`).join('')}
    </div>
    <div class="mt3"><button data-a="absence-cancel" class="btn2 w100 bg-w fg bd">キャンセル</button></div>
  </div>`;
};