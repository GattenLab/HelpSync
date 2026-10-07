// === js/notify.js ===
// Notification API ラッパー + Service Worker 連携

const Notify = {
  swRegistration: null,

  async init() {
    if (!('serviceWorker' in navigator)) return;
    try {
      this.swRegistration = await navigator.serviceWorker.ready;
    } catch (e) {
      console.log('SW not ready yet');
    }
  },

  async requestPermission() {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;
    const perm = await Notification.requestPermission();
    return perm === 'granted';
  },

  async show(title, body, tag, requireInteraction) {
    const granted = await this.requestPermission();
    if (!granted) return;
    const options = {
      body: body,
      tag: tag || 'helpsync',
      icon: './icon-192-maskable.png',
      badge: './icon-192-maskable.png',
      requireInteraction: requireInteraction || false,
      vibrate: [200, 100, 200],
      data: { url: window.location.href }
    };
    if (this.swRegistration) {
      this.swRegistration.showNotification(title, options);
    } else {
      new Notification(title, options);
    }
  },

  // エスカレーション通知
  async escalate(req, newLevel) {
    const labels = {
      1: 'リマインド',
      2: '統括通知',
      3: 'エリアMgr通知',
      4: '自動終了'
    };
    const label = labels[newLevel] || '通知';
    await this.show(
      `【${label}】${req.sName}`,
      `${req.date} ${req.tS}〜${req.tE} のヘルプ募集が${label}されました`,
      `esc-${req.id}-${newLevel}`,
      newLevel >= 2
    );
  },

  // 新着応募通知
  async newApplicant(req, applicantName) {
    await this.show(
      `新着応募: ${req.sName}`,
      `${applicantName}さんが応募しました — ${req.tS}〜${req.tE}`,
      `app-${req.id}`,
      false
    );
  },

  // 期限切れ間近通知
  async deadlineWarning(req, secondsLeft) {
    const min = Math.floor(secondsLeft / 60);
    await this.show(
      `期限切れ間近: ${req.sName}`,
      `残り${min}分 — ${req.tS}〜${req.tE} のヘルプ募集`,
      `dead-${req.id}`,
      true
    );
  }
};
