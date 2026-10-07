const D = {
  // ユニット
  U: [
    { id: 'u1', name: 'ユニットA（吉祥寺・西荻窪寄り）', stores: ['a1','a2','a3','a4','a5','a6'], siName: '統括A' },
    { id: 'u2', name: 'ユニットB（三鷹・武蔵境寄り）', stores: ['b1','b2','b3','b4','b5'], siName: '統括B' },
    { id: 'u3', name: 'ユニットC（小金井・周辺）', stores: ['c1','c2','c3','c4'], siName: '統括C' },
  ],

  // 店舗
  S: [
    // ユニットA
    { id: 'a1', name: '吉祥寺本町店', unitId: 'u1', mgr: '店長01' },
    { id: 'a2', name: '吉祥寺本町2丁目店', unitId: 'u1', mgr: '店長02' },
    { id: 'a3', name: '吉祥寺東町店', unitId: 'u1', mgr: '店長03' },
    { id: 'a4', name: '吉祥寺南町4丁目店', unitId: 'u1', mgr: '店長04' },
    { id: 'a5', name: '井の頭公園前店', unitId: 'u1', mgr: '店長05' },
    { id: 'a6', name: '西荻窪駅南店', unitId: 'u1', mgr: '店長06' },
    // ユニットB
    { id: 'b1', name: '三鷹駅南店', unitId: 'u2', mgr: '店長07' },
    { id: 'b2', name: '三鷹上連雀1丁目店', unitId: 'u2', mgr: '店長08' },
    { id: 'b3', name: '下連雀4丁目店', unitId: 'u2', mgr: '店長09' },
    { id: 'b4', name: '三鷹さくら通り店', unitId: 'u2', mgr: '店長10' },
    { id: 'b5', name: '武蔵境駅前店', unitId: 'u2', mgr: '店長11' },
    // ユニットC
    { id: 'c1', name: '東小金井駅前店', unitId: 'u3', mgr: '店長12' },
    { id: 'c2', name: '武蔵小金井駅北店', unitId: 'u3', mgr: '店長13' },
    { id: 'c3', name: '武蔵野中町店', unitId: 'u3', mgr: '店長14' },
    { id: 'c4', name: '三鷹台駅南店', unitId: 'u3', mgr: '店長15' },
  ],

  // スタッフ（15名）
  ST: [
    // ユニットA
    { id: 'st1', name: 'テスト太郎', sid: 'a6', avail: ['a1','a2','a3','a4','a5','a6'], cnt: 12, exp: ['西荻窪駅南店','吉祥寺本町店','井の頭公園前店'], shifts: [
      { date: TODAY, tS: '13:00', tE: '17:00', tasks: ['レジ','品出し'] },
      { date: TODAY, tS: '10:00', tE: '15:00', tasks: ['品出し','清掃'] },
      { date: TODAY, tS: '09:00', tE: '13:00', tasks: ['レジ'] },
    ]},
    { id: 'st2', name: 'ダミー花子', sid: 'a2', avail: ['a1','a2','a3','a4','a5'], cnt: 5, exp: ['吉祥寺本町2丁目店','吉祥寺南町4丁目店'], shifts: [
      { date: TODAY, tS: '10:00', tE: '15:00', tasks: ['レジ','品出し'] },
      { date: TODAY, tS: '16:00', tE: '21:00', tasks: ['レジ','清掃'] },
    ]},
    { id: 'st3', name: '開発次郎', sid: 'a4', avail: ['a2','a3','a4','a5','a6'], cnt: 8, exp: ['吉祥寺南町4丁目店','井の頭公園前店','吉祥寺東町店'], shifts: [
      { date: TODAY, tS: '11:00', tE: '16:00', tasks: ['品出し','レジ'] },
      { date: TODAY, tS: '14:00', tE: '19:00', tasks: ['レジ'] },
    ]},
    { id: 'st4', name: 'サンプル三郎', sid: 'a1', avail: ['a1','a2','a3','a4'], cnt: 1, exp: ['吉祥寺本町店'], shifts: [
      { date: TODAY, tS: '08:00', tE: '12:00', tasks: ['品出し'] },
      { date: TODAY, tS: '13:00', tE: '18:00', tasks: ['レジ','品出し'] },
    ]},
    { id: 'st5', name: '仮名美咲', sid: 'a3', avail: ['a1','a3','a5','a6'], cnt: 3, exp: ['吉祥寺東町店','井の頭公園前店'], shifts: [
      { date: TODAY, tS: '09:00', tE: '14:00', tasks: ['レジ','清掃'] },
      { date: TODAY, tS: '15:00', tE: '20:00', tasks: ['品出し'] },
    ]},
    // ユニットB
    { id: 'st6', name: 'モック健太', sid: 'b1', avail: ['b1','b2','b3','b4','b5'], cnt: 15, exp: ['三鷹駅南店','武蔵境駅前店','下連雀4丁目店'], shifts: [
      { date: DEMO_DATES[4], tS: '10:00', tE: '15:00', tasks: ['レジ','品出し'] },
      { date: TODAY, tS: '13:00', tE: '18:00', tasks: ['レジ'] },
    ]},
    { id: 'st7', name: 'スタブ由美', sid: 'b2', avail: ['b1','b2','b3','b4'], cnt: 7, exp: ['三鷹上連雀1丁目店','三鷹さくら通り店'], shifts: [
      { date: DEMO_DATES[4], tS: '08:00', tE: '13:00', tasks: ['品出し','清掃'] },
      { date: TODAY, tS: '16:00', tE: '21:00', tasks: ['レジ'] },
    ]},
    { id: 'st8', name: 'フィクスチャ翔太', sid: 'b3', avail: ['b2','b3','b4','b5'], cnt: 4, exp: ['下連雀4丁目店','武蔵境駅前店'], shifts: [
      { date: DEMO_DATES[4], tS: '11:00', tE: '16:00', tasks: ['レジ','品出し'] },
      { date: TODAY, tS: '09:00', tE: '14:00', tasks: ['品出し'] },
    ]},
    { id: 'st9', name: 'ユニットあゆみ', sid: 'b4', avail: ['b1','b3','b4','b5'], cnt: 2, exp: ['三鷹さくら通り店'], shifts: [
      { date: DEMO_DATES[4], tS: '14:00', tE: '19:00', tasks: ['レジ','清掃'] },
      { date: TODAY, tS: '10:00', tE: '15:00', tasks: ['品出し'] },
    ]},
    { id: 'st10', name: 'インテグ大輔', sid: 'b5', avail: ['b1','b2','b4','b5'], cnt: 9, exp: ['三鷹駅南店','武蔵境駅前店','三鷹上連雀1丁目店'], shifts: [
      { date: DEMO_DATES[4], tS: '09:00', tE: '14:00', tasks: ['レジ'] },
      { date: TODAY, tS: '16:00', tE: '21:00', tasks: ['品出し','レジ'] },
    ]},
    // ユニットC
    { id: 'st11', name: 'システム恵子', sid: 'c1', avail: ['c1','c2','c3','c4'], cnt: 6, exp: ['東小金井駅前店','武蔵小金井駅北店'], shifts: [
      { date: DEMO_DATES[5], tS: '11:00', tE: '16:00', tasks: ['レジ','品出し'] },
      { date: TODAY, tS: '08:00', tE: '13:00', tasks: ['清掃'] },
    ]},
    { id: 'st12', name: 'プロト直樹', sid: 'c2', avail: ['c1','c2','c3'], cnt: 11, exp: ['武蔵小金井駅北店','武蔵野中町店','東小金井駅前店'], shifts: [
      { date: DEMO_DATES[5], tS: '13:00', tE: '18:00', tasks: ['レジ'] },
      { date: TODAY, tS: '09:00', tE: '14:00', tasks: ['品出し','清掃'] },
    ]},
    { id: 'st13', name: 'ベータ真理', sid: 'c3', avail: ['c2','c3','c4'], cnt: 3, exp: ['武蔵野中町店'], shifts: [
      { date: DEMO_DATES[5], tS: '10:00', tE: '15:00', tasks: ['レジ','品出し'] },
      { date: TODAY, tS: '14:00', tE: '19:00', tasks: ['品出し'] },
    ]},
    { id: 'st14', name: 'アルファ拓也', sid: 'c4', avail: ['c1','c3','c4'], cnt: 8, exp: ['三鷹台駅南店','東小金井駅前店'], shifts: [
      { date: DEMO_DATES[5], tS: '08:00', tE: '13:00', tasks: ['品出し','レジ'] },
      { date: TODAY, tS: '11:00', tE: '16:00', tasks: ['レジ','清掃'] },
    ]},
    { id: 'st15', name: 'デバッグ優子', sid: 'c1', avail: ['c1','c2','c4'], cnt: 5, exp: ['東小金井駅前店','三鷹台駅南店','武蔵小金井駅北店'], shifts: [
      { date: DEMO_DATES[5], tS: '16:00', tE: '21:00', tasks: ['レジ'] },
      { date: TODAY, tS: '11:00', tE: '16:00', tasks: ['品出し'] },
    ]},
  ],

  // テンプレート
  T: [
    { id: 't1', label: '欠勤（体調不良）', tasks: ['レジ','品出し'], tS: '13:00', tE: '17:00', r: '体調不良', urgent: true },
    { id: 't2', label: '欠勤（急用・私用）', tasks: ['レジ','品出し'], tS: '13:00', tE: '17:00', r: '急用', urgent: true },
    { id: 't3', label: '欠勤（交通遅延・その他）', tasks: ['レジ'], tS: '13:00', tE: '15:00', r: '遅延', urgent: true },
    { id: 't4', label: '昼ピーク（レジ強化）', tasks: ['レジ'], tS: '11:00', tE: '14:00', r: '繁忙', urgent: false },
    { id: 't5', label: '夕方ピーク（レジ＋品出し）', tasks: ['レジ','品出し'], tS: '16:00', tE: '19:00', r: '繁忙', urgent: false },
    { id: 't6', label: '納品日（品出し増）', tasks: ['品出し'], tS: '08:00', tE: '12:00', r: '繁忙', urgent: false },
    { id: 't7', label: '早朝開店準備', tasks: ['品出し','清掃'], tS: '06:00', tE: '09:00', r: '繁忙', urgent: false },
    { id: 't8', label: '深夜閉店作業', tasks: ['レジ','清掃'], tS: '21:00', tE: '24:00', r: '繁忙', urgent: false },
  ],

  // ステータス定義
  C: {
    urgent: { l: '緊急', bg: 'st-urgent' },
    open: { l: '募集中', bg: 'st-open' },
    filled: { l: '充足', bg: 'st-filled' },
    closed: { l: '終了', bg: 'st-closed' }
  }
};

function defReqs() {
  return [
    // === 高負荷: a6 西荻窪（応募ゼロ3件 + 緊急1件）===
    { id: 'h1', sid: 'a6', sName: '西荻窪駅南店', uid: 'u1',
      date: TODAY, tS: '13:00', tE: '17:00',
      tasks: ['レジ','品出し'], st: 'urgent', posted: '25分前', req: 2,
      min: 25, dead: 5700, origDead: 7200, urgent: true,
      escLevel: 2, escHistory: [{ level: 2, atMin: 25, notified: ['si'] }],
      applicants: [] ,
      isCustom: false,
      note: '',
      },

    { id: 'h5', sid: 'a6', sName: '西荻窪駅南店', uid: 'u1',
      date: TODAY, tS: '09:00', tE: '13:00',
      tasks: ['開店準備','品出し'], st: 'open', posted: '1時間前', req: 1,
      min: 60, dead: 3600, origDead: 7200, urgent: false,
      escLevel: 1, escHistory: [{ level: 1, atMin: 15, notified: [] }],
      applicants: [] ,
      isCustom: false,
      note: '',
      },

    { id: 'h7', sid: 'a6', sName: '西荻窪駅南店', uid: 'u1',
      date: TODAY, tS: '17:00', tE: '21:00',
      tasks: ['レジ','惣菜'], st: 'open', posted: '30分前', req: 1,
      min: 30, dead: 5400, origDead: 7200, urgent: false,
      escLevel: 0, escHistory: [],
      applicants: [] ,
      isCustom: false,
      note: '',
      },

    // === パンク寸前: b1 三鷹北口（エスカレーション到達 + 応募ゼロ）===
    { id: 'h4', sid: 'b1', sName: '三鷹駅南店', uid: 'u2',
      date: TODAY, tS: '10:00', tE: '15:00',
      tasks: ['レジ','品出し'], st: 'urgent', posted: '27分前', req: 1,
      min: 27, dead: 5580, origDead: 7200, urgent: true,
      escLevel: 3, escHistory: [
        { level: 2, atMin: 15, notified: ['si'] },
        { level: 3, atMin: 27, notified: ['area'] }
      ], applicants: [] ,
      isCustom: false,
      note: '',
      },

    { id: 'h9', sid: 'b1', sName: '三鷹駅南店', uid: 'u2',
      date: TODAY, tS: '15:00', tE: '19:00',
      tasks: ['品出し','惣菜'], st: 'open', posted: '20分前', req: 1,
      min: 20, dead: 6000, origDead: 7200, urgent: false,
      escLevel: 0, escHistory: [],
      applicants: [
        { sid: 'st7', name: 'スタブ由美', at: '5分前', ok: false, cnt: 2, exp: ['三鷹駅南店'] }
      ] ,
      isCustom: false,
      note: '',
      },

    // === 正常: a2 アトレ（充足 + 応募あり）===
    { id: 'h2', sid: 'a2', sName: '吉祥寺本町2丁目店', uid: 'u1',
      date: TODAY, tS: '10:00', tE: '15:00',
      tasks: ['レジ','品出し'], st: 'filled', posted: '昨日', req: 1,
      min: 1440, dead: 0, origDead: 7200, urgent: false,
      escLevel: 4, escHistory: [
        { level: 2, atMin: 15, notified: ['si'] },
        { level: 4, atMin: 30, notified: ['manager'] }
      ], applicants: [
        { sid: 'st2', name: 'ダミー花子', at: '昨日', ok: true, cnt: 5, exp: ['吉祥寺本町2丁目店','吉祥寺南町4丁目店'] }
      ], cf: { sid: 'st2', name: 'ダミー花子', time: '10:00〜15:00' } ,
      isCustom: false,
      note: '',
      },

    { id: 'h8', sid: 'a2', sName: '吉祥寺本町2丁目店', uid: 'u1',
      date: TODAY, tS: '17:00', tE: '21:00',
      tasks: ['レジ','惣菜'], st: 'open', posted: '10分前', req: 1,
      min: 10, dead: 6600, origDead: 7200, urgent: false,
      escLevel: 0, escHistory: [],
      applicants: [
        { sid: 'st3', name: '開発次郎', at: '8分前', ok: false, cnt: 8, exp: ['吉祥寺南町4丁目店','井の頭公園前店'] },
        { sid: 'st4', name: 'サンプル三郎', at: '3分前', ok: false, cnt: 1, exp: ['吉祥寺本町店'] }
      ] ,
      isCustom: false,
      note: '',
      },

    // === 正常: a4 コピス（充足 + 応募あり）===
    { id: 'h3', sid: 'a4', sName: '吉祥寺南町4丁目店', uid: 'u1',
      date: TODAY, tS: '11:00', tE: '15:00',
      tasks: ['レジ','品出し'], st: 'filled', posted: '2時間前', req: 1,
      min: 120, dead: 0, origDead: 7200, urgent: false,
      escLevel: 0, escHistory: [],
      applicants: [
        { sid: 'st5', name: '仮名美咲', at: '1時間前', ok: true, cnt: 3, exp: ['吉祥寺東町店','井の頭公園前店'] }
      ], cf: { sid: 'st5', name: '仮名美咲', time: '11:00〜15:00' } ,
      isCustom: false,
      note: '',
      },

    { id: 'h10', sid: 'a4', sName: '吉祥寺南町4丁目店', uid: 'u1',
      date: TODAY, tS: '18:00', tE: '22:00',
      tasks: ['レジ','清掃'], st: 'open', posted: '15分前', req: 1,
      min: 15, dead: 6300, origDead: 7200, urgent: false,
      escLevel: 0, escHistory: [],
      applicants: [
        { sid: 'st6', name: 'モック健太', at: '10分前', ok: false, cnt: 4, exp: ['吉祥寺南町4丁目店'] }
      ] ,
      isCustom: false,
      note: '',
      },

    // === 期限切れ: c2 東小金井 ===
    { id: 'h6', sid: 'c2', sName: '東小金井駅前店', uid: 'u3',
      date: TODAY, tS: '09:00', tE: '13:00',
      tasks: ['レジ','品出し'], st: 'closed', posted: '1時間前', req: 1,
      min: 60, dead: 3600, origDead: 7200, urgent: false,
      escLevel: 4, escHistory: [
        { level: 2, atMin: 15, notified: ['si'] },
        { level: 3, atMin: 30, notified: ['area'] },
        { level: 4, atMin: 45, notified: ['manager'] }
      ], applicants: [] ,
      isCustom: false,
      note: '',
      },

    // === 追加: a1 吉祥寺本町（応募多数・充足）===
    { id: 'h11', sid: 'a1', sName: '吉祥寺本町店', uid: 'u1',
      date: TODAY, tS: '08:00', tE: '12:00',
      tasks: ['品出し','レジ'], st: 'filled', posted: '昨日', req: 1,
      min: 1440, dead: 0, origDead: 7200, urgent: false,
      escLevel: 0, escHistory: [],
      applicants: [
        { sid: 'st4', name: 'サンプル三郎', at: '昨日', ok: true, cnt: 1, exp: ['吉祥寺本町店'] }
      ], cf: { sid: 'st4', name: 'サンプル三郎', time: '08:00〜12:00' } ,
      isCustom: false,
      note: '',
      },

    { id: 'h12', sid: 'a1', sName: '吉祥寺本町店', uid: 'u1',
      date: TODAY, tS: '14:00', tE: '18:00',
      tasks: ['レジ','品出し'], st: 'open', posted: '40分前', req: 1,
      min: 40, dead: 4800, origDead: 7200, urgent: false,
      escLevel: 1, escHistory: [{ level: 1, atMin: 15, notified: [] }],
      applicants: [
        { sid: 'st5', name: '仮名美咲', at: '20分前', ok: false, cnt: 3, exp: ['吉祥寺東町店','井の頭公園前店'] }
      ] ,
      isCustom: false,
      note: '',
      },

    // === 追加: a3 吉祥寺東町（緊急・応募ゼロ）===
    { id: 'h13', sid: 'a3', sName: '吉祥寺東町店', uid: 'u1',
      date: TODAY, tS: '10:00', tE: '14:00',
      tasks: ['レジ','清掃'], st: 'urgent', posted: '35分前', req: 1,
      min: 35, dead: 5100, origDead: 7200, urgent: true,
      escLevel: 2, escHistory: [{ level: 2, atMin: 20, notified: ['si'] }],
      applicants: [] ,
      isCustom: false,
      note: '',
      },

    { id: 'h14', sid: 'a3', sName: '吉祥寺東町店', uid: 'u1',
      date: TODAY, tS: '16:00', tE: '20:00',
      tasks: ['品出し'], st: 'open', posted: '5分前', req: 1,
      min: 5, dead: 6900, origDead: 7200, urgent: false,
      escLevel: 0, escHistory: [],
      applicants: [] ,
      isCustom: false,
      note: '',
      },

    // === 追加: a5 井の頭公園前（充足・応募あり）===
    { id: 'h15', sid: 'a5', sName: '井の頭公園前店', uid: 'u1',
      date: TODAY, tS: '09:00', tE: '13:00',
      tasks: ['レジ','品出し'], st: 'filled', posted: '3時間前', req: 1,
      min: 180, dead: 0, origDead: 7200, urgent: false,
      escLevel: 0, escHistory: [],
      applicants: [
        { sid: 'st1', name: 'テスト太郎', at: '2時間前', ok: true, cnt: 12, exp: ['西荻窪駅南店','吉祥寺本町店'] }
      ], cf: { sid: 'st1', name: 'テスト太郎', time: '09:00〜13:00' } ,
      isCustom: false,
      note: '',
      },

    // === 追加: b2 三鷹上連雀（募集中・応募あり）===
    { id: 'h16', sid: 'b2', sName: '三鷹上連雀1丁目店', uid: 'u2',
      date: TODAY, tS: '11:00', tE: '15:00',
      tasks: ['レジ','品出し'], st: 'open', posted: '18分前', req: 1,
      min: 18, dead: 6120, origDead: 7200, urgent: false,
      escLevel: 0, escHistory: [],
      applicants: [
        { sid: 'st8', name: 'フィクスチャ翔太', at: '10分前', ok: false, cnt: 4, exp: ['下連雀4丁目店'] }
      ] ,
      isCustom: false,
      note: '',
      },

    // === 追加: b3 下連雀（緊急・店長カバー）===
    { id: 'h17', sid: 'b3', sName: '下連雀4丁目店', uid: 'u2',
      date: TODAY, tS: '13:00', tE: '17:00',
      tasks: ['レジ','品出し'], st: 'filled', posted: '50分前', req: 1,
      min: 50, dead: 4200, origDead: 7200, urgent: true,
      escLevel: 3, escHistory: [
        { level: 2, atMin: 10, notified: ['si'] },
        { level: 3, atMin: 25, notified: ['area'] }
      ], applicants: [],
      cf: { sid: 'mgr', name: '店長（自店カバー）', time: '13:00〜17:00' } ,
      isCustom: false,
      note: '',
      },

    // === 追加: b4 三鷹さくら通り（募集中・応募ゼロ）===
    { id: 'h18', sid: 'b4', sName: '三鷹さくら通り店', uid: 'u2',
      date: TODAY, tS: '15:00', tE: '19:00',
      tasks: ['品出し','清掃'], st: 'open', posted: '12分前', req: 1,
      min: 12, dead: 6480, origDead: 7200, urgent: false,
      escLevel: 0, escHistory: [],
      applicants: [] ,
      isCustom: false,
      note: '',
      },

    // === 追加: b5 武蔵境（緊急・応募ゼロ）===
    { id: 'h19', sid: 'b5', sName: '武蔵境駅前店', uid: 'u2',
      date: TODAY, tS: '17:00', tE: '21:00',
      tasks: ['レジ','品出し'], st: 'urgent', posted: '22分前', req: 1,
      min: 22, dead: 5880, origDead: 7200, urgent: true,
      escLevel: 2, escHistory: [{ level: 2, atMin: 15, notified: ['si'] }],
      applicants: [] ,
      isCustom: false,
      note: '',
      },

    // === 追加: c1 東小金井（募集中・応募あり）===
    { id: 'h20', sid: 'c1', sName: '東小金井駅前店', uid: 'u3',
      date: TODAY, tS: '10:00', tE: '14:00',
      tasks: ['レジ','品出し'], st: 'open', posted: '8分前', req: 1,
      min: 8, dead: 6720, origDead: 7200, urgent: false,
      escLevel: 0, escHistory: [],
      applicants: [
        { sid: 'st11', name: 'システム恵子', at: '5分前', ok: false, cnt: 6, exp: ['東小金井駅前店'] }
      ] ,
      isCustom: false,
      note: '',
      },

    // === 追加: c3 武蔵野中町（期限切れ）===
    { id: 'h21', sid: 'c3', sName: '武蔵野中町店', uid: 'u3',
      date: TODAY, tS: '12:00', tE: '16:00',
      tasks: ['品出し','レジ'], st: 'closed', posted: '2時間前', req: 1,
      min: 120, dead: 0, origDead: 7200, urgent: false,
      escLevel: 4, escHistory: [
        { level: 2, atMin: 15, notified: ['si'] },
        { level: 3, atMin: 30, notified: ['area'] },
        { level: 4, atMin: 60, notified: ['manager'] }
      ], applicants: [] ,
      isCustom: false,
      note: '',
      },

    // === 追加: c4 三鷹台（募集中・応募あり）===
    { id: 'h22', sid: 'c4', sName: '三鷹台駅南店', uid: 'u3',
      date: TODAY, tS: '14:00', tE: '18:00',
      tasks: ['レジ','清掃'], st: 'open', posted: '3分前', req: 1,
      min: 3, dead: 7020, origDead: 7200, urgent: false,
      escLevel: 0, escHistory: [],
      applicants: [
        { sid: 'st14', name: 'アルファ拓也', at: 'たった今', ok: false, cnt: 8, exp: ['三鷹台駅南店'] }
      ],
      isCustom: false,
      note: '',
    },

    // === 過去カバー実績: 西荻窪駅南店（高負荷店）===
    { id: 'h23', sid: 'a6', sName: '西荻窪駅南店', uid: 'u1',
      date: TODAY, tS: '13:00', tE: '17:00',
      tasks: ['レジ','品出し'], st: 'filled', posted: '昨日', req: 1,
      min: 1440, dead: 0, origDead: 7200, urgent: true,
      escLevel: 3, escHistory: [
        { level: 2, atMin: 15, notified: ['si'] },
        { level: 3, atMin: 25, notified: ['area'] }
      ], applicants: [],
      cf: { sid: 'mgr', name: '店長（自店カバー）', time: '13:00〜17:00' } ,
      isCustom: false,
      note: '',
      },

    { id: 'h24', sid: 'a6', sName: '西荻窪駅南店', uid: 'u1',
      date: TODAY, tS: '09:00', tE: '13:00',
      tasks: ['開店準備','品出し'], st: 'filled', posted: '昨日', req: 1,
      min: 1440, dead: 0, origDead: 7200, urgent: true,
      escLevel: 2, escHistory: [{ level: 2, atMin: 20, notified: ['si'] }],
      applicants: [],
      cf: { sid: 'mgr', name: '店長（自店カバー）', time: '09:00〜13:00' } ,
      isCustom: false,
      note: '',
      },

    { id: 'h25', sid: 'a6', sName: '西荻窪駅南店', uid: 'u1',
      date: TODAY, tS: '17:00', tE: '21:00',
      tasks: ['レジ','惣菜'], st: 'filled', posted: '昨日', req: 1,
      min: 1440, dead: 0, origDead: 7200, urgent: false,
      escLevel: 1, escHistory: [{ level: 1, atMin: 15, notified: [] }],
      applicants: [],
      cf: { sid: 'mgr', name: '店長（自店カバー）', time: '17:00〜21:00' } ,
      isCustom: false,
      note: '',
      },

    // === 過去カバー実績: 三鷹駅南店（中負荷店）===
    { id: 'h26', sid: 'b1', sName: '三鷹駅南店', uid: 'u2',
      date: TODAY, tS: '10:00', tE: '15:00',
      tasks: ['レジ','品出し'], st: 'filled', posted: '昨日', req: 1,
      min: 1440, dead: 0, origDead: 7200, urgent: true,
      escLevel: 3, escHistory: [
        { level: 2, atMin: 15, notified: ['si'] },
        { level: 3, atMin: 27, notified: ['area'] }
      ], applicants: [],
      cf: { sid: 'mgr', name: '店長（自店カバー）', time: '10:00〜15:00' } ,
      isCustom: false,
      note: '',
      },

    { id: 'h27', sid: 'b1', sName: '三鷹駅南店', uid: 'u2',
      date: TODAY, tS: '15:00', tE: '19:00',
      tasks: ['品出し','惣菜'], st: 'filled', posted: '昨日', req: 1,
      min: 1440, dead: 0, origDead: 7200, urgent: false,
      escLevel: 0, escHistory: [], applicants: [],
      cf: { sid: 'mgr', name: '店長（自店カバー）', time: '15:00〜19:00' } ,
      isCustom: false,
      note: '',
      },

    // === 過去カバー実績: 下連雀4丁目店（中負荷店）===
    { id: 'h28', sid: 'b3', sName: '下連雀4丁目店', uid: 'u2',
      date: TODAY, tS: '13:00', tE: '17:00',
      tasks: ['レジ','品出し'], st: 'filled', posted: '昨日', req: 1,
      min: 1440, dead: 0, origDead: 7200, urgent: true,
      escLevel: 3, escHistory: [
        { level: 2, atMin: 10, notified: ['si'] },
        { level: 3, atMin: 25, notified: ['area'] }
      ], applicants: [],
      cf: { sid: 'mgr', name: '店長（自店カバー）', time: '13:00〜17:00' },
      isCustom: false,
      note: '',
    }
  ];
}

function defAbsences() {
  return [
    { id: 'abs1', staffId: 'st1', sid: 'a6', sName: '西荻窪駅南店', staffName: 'テスト太郎',
      reason: '体調不良', date: TODAY, tS: '13:00', tE: '17:00',
      tasks: ['レジ','品出し'], at: Date.now() - 300000, status: 'resolved' },
    { id: 'abs2', staffId: 'st6', sid: 'b1', sName: '三鷹駅南店', staffName: 'モック健太',
      reason: '体調不良', date: TODAY, tS: '10:00', tE: '15:00',
      tasks: ['レジ','品出し'], at: Date.now() - 600000, status: 'resolved' },
    { id: 'abs3', staffId: 'st11', sid: 'c1', sName: '武蔵小金井駅北店', staffName: 'システム恵子',
      reason: '急用・私用', date: TODAY, tS: '11:00', tE: '16:00',
      tasks: ['レジ','品出し'], at: Date.now() - 900000, status: 'resolved' },
  ];
}