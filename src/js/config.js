// デモ日付ユーティリティ — 「今日」を基準に前後3日を生成
function generateDemoDates() {
  const today = new Date();
  const days = ['日', '月', '火', '水', '木', '金', '土'];
  const dates = [];
  for (let i = -3; i <= 3; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const day = d.getDate();
    const w = days[d.getDay()];
    dates.push(`${y}年${m}月${day}日（${w}）`);
  }
  return dates;
}
const DEMO_DATES = generateDemoDates();
const TODAY = DEMO_DATES[3];  // 配列の中央 = 今日
