'use strict';

const MAP_TOTAL = 40;

// ===== 특별 칸 (부루마블 빈도: 5칸마다 1개) =====
// 미니멀 라인 아이콘 + 포인트 컬러
const SPECIAL_CELLS = {
  0:  { label: '출발', color: '#F59E0B', bg: '#FFFBEB', icon:
    '<line x1="6" y1="21" x2="6" y2="3.5" stroke="#F59E0B" stroke-width="2.2" stroke-linecap="round"/><path d="M6 4 L17.5 4 L14.5 7.8 L17.5 11.5 L6 11.5 Z" fill="#FCD34D" stroke="#F59E0B" stroke-width="1.5" stroke-linejoin="round"/><circle cx="10.5" cy="7.7" r="1.4" fill="#F59E0B"/>' },
  5:  { label: '쉼터', color: '#10B981', bg: '#ECFDF5', icon:
    '<rect x="3.5" y="11" width="17" height="3" rx="1.2" fill="#A7F3D0" stroke="#10B981" stroke-width="1.5"/><path d="M3.5 9 H20.5" stroke="#10B981" stroke-width="2" stroke-linecap="round"/><line x1="6" y1="14" x2="5" y2="20" stroke="#10B981" stroke-width="2" stroke-linecap="round"/><line x1="18" y1="14" x2="19" y2="20" stroke="#10B981" stroke-width="2" stroke-linecap="round"/>' },
  10: { label: '큰나무', color: '#22C55E', bg: '#F0FDF4', icon:
    '<path d="M12 3 L18 11 L14.5 11 L19.5 17 L4.5 17 L9.5 11 L6 11 Z" fill="#86EFAC" stroke="#22C55E" stroke-width="1.5" stroke-linejoin="round"/><rect x="10.5" y="17" width="3" height="4" rx="0.5" fill="#A16207"/>' },
  15: { label: '카페', color: '#F97316', bg: '#FFF7ED', icon:
    '<path d="M5 9 H16 V14 A4 4 0 0 1 12 18 H9 A4 4 0 0 1 5 14 Z" fill="#FED7AA" stroke="#F97316" stroke-width="1.5" stroke-linejoin="round"/><path d="M16 10 H18.5 A2.2 2.2 0 0 1 18.5 14.4 H16" fill="none" stroke="#F97316" stroke-width="1.5"/><path d="M8 6.5 Q9 5 8 3M11.5 6.5 Q12.5 5 11.5 3" fill="none" stroke="#FB923C" stroke-width="1.3" stroke-linecap="round"/>' },
  20: { label: '동화성', color: '#A855F7', bg: '#FAF5FF', icon:
    '<path d="M4 21 V10 H7 V7 H10 V10 H14 V7 H17 V10 H20 V21 Z" fill="#E9D5FF" stroke="#A855F7" stroke-width="1.5" stroke-linejoin="round"/><rect x="10" y="16" width="4" height="5" rx="0.5" fill="#A855F7" fill-opacity="0.45"/><path d="M11 7 V4.5 H13 V7" fill="#C084FC"/><circle cx="12" cy="3.5" r="1" fill="#FCD34D"/>' },
  25: { label: '놀이터', color: '#EC4899', bg: '#FDF2F8', icon:
    '<circle cx="9" cy="8" r="4.5" fill="#FBCFE8" stroke="#EC4899" stroke-width="1.5"/><circle cx="15.5" cy="9.5" r="3.5" fill="#F9A8D4" stroke="#EC4899" stroke-width="1.5"/><path d="M9 12.5 Q9.5 16 9 19M15.5 13 Q15 16 15.5 18.5" fill="none" stroke="#EC4899" stroke-width="1.3" stroke-linecap="round"/>' },
  30: { label: '분수대', color: '#0EA5E9', bg: '#F0F9FF', icon:
    '<ellipse cx="12" cy="19" rx="8" ry="2.5" fill="#BAE6FD" stroke="#0EA5E9" stroke-width="1.5"/><path d="M12 16.5 V8" stroke="#38BDF8" stroke-width="1.8" stroke-linecap="round"/><path d="M12 8 Q7.5 9 6.5 13.5M12 8 Q16.5 9 17.5 13.5" fill="none" stroke="#7DD3FC" stroke-width="1.5" stroke-linecap="round"/><circle cx="12" cy="6" r="1.6" fill="#38BDF8"/>' },
  35: { label: '별빛', color: '#EAB308', bg: '#FEFCE8', icon:
    '<path d="M12 3 L14.3 8.2 L20 8.7 L15.7 12.4 L17 18 L12 14.9 L7 18 L8.3 12.4 L4 8.7 L9.7 8.2 Z" fill="#FEF08A" stroke="#EAB308" stroke-width="1.5" stroke-linejoin="round"/><circle cx="19" cy="5" r="1" fill="#FACC15"/><circle cx="5" cy="6" r="0.8" fill="#FACC15"/>' },
}

// ===== 이벤트 칸 (도달 시 축하 + 공용 풀에서 랜덤 쿠폰) =====
const EVENT_CELLS = [10, 20, 30];

/* ====================================================== */
/* ===== 아래 선로/기차 토큰 코드는 절대 수정 안 함 ===== */
/* ====================================================== */
const _RC = '#C4B0F0';
const _TC = '#A090D8';
const _RW = 2;
const _TW = 3.5;

function _ties_h(xs) {
  return xs.map(x => `<line x1="${x}" y1="13" x2="${x}" y2="27" stroke="${_TC}" stroke-width="${_TW}" stroke-linecap="round"/>`).join('');
}
function _ties_v(ys) {
  return ys.map(y => `<line x1="13" y1="${y}" x2="27" y2="${y}" stroke="${_TC}" stroke-width="${_TW}" stroke-linecap="round"/>`).join('');
}

const TRACK_SVG = {
  h: `<svg class="ct" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
    ${_ties_h([7,17,27,37])}
    <line x1="0" y1="16" x2="40" y2="16" stroke="${_RC}" stroke-width="${_RW}"/>
    <line x1="0" y1="24" x2="40" y2="24" stroke="${_RC}" stroke-width="${_RW}"/>
  </svg>`,
  v: `<svg class="ct" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
    ${_ties_v([7,17,27,37])}
    <line x1="16" y1="0" x2="16" y2="40" stroke="${_RC}" stroke-width="${_RW}"/>
    <line x1="24" y1="0" x2="24" y2="40" stroke="${_RC}" stroke-width="${_RW}"/>
  </svg>`,
  tl: `<svg class="ct" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
    <path d="M 16,40 Q 16,16 40,16" fill="none" stroke="${_RC}" stroke-width="${_RW}"/>
    <path d="M 24,40 Q 24,24 40,24" fill="none" stroke="${_RC}" stroke-width="${_RW}"/>
    <line x1="13" y1="30" x2="22" y2="26" stroke="${_TC}" stroke-width="${_TW}" stroke-linecap="round"/>
    <line x1="26" y1="13" x2="30" y2="22" stroke="${_TC}" stroke-width="${_TW}" stroke-linecap="round"/>
  </svg>`,
  tr: `<svg class="ct" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
    <path d="M 0,16 Q 24,16 24,40" fill="none" stroke="${_RC}" stroke-width="${_RW}"/>
    <path d="M 0,24 Q 16,24 16,40" fill="none" stroke="${_RC}" stroke-width="${_RW}"/>
    <line x1="10" y1="13" x2="13" y2="22" stroke="${_TC}" stroke-width="${_TW}" stroke-linecap="round"/>
    <line x1="27" y1="27" x2="18" y2="30" stroke="${_TC}" stroke-width="${_TW}" stroke-linecap="round"/>
  </svg>`,
  br: `<svg class="ct" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
    <path d="M 24,0 Q 24,24 0,24" fill="none" stroke="${_RC}" stroke-width="${_RW}"/>
    <path d="M 16,0 Q 16,16 0,16" fill="none" stroke="${_RC}" stroke-width="${_RW}"/>
    <line x1="27" y1="10" x2="18" y2="13" stroke="${_TC}" stroke-width="${_TW}" stroke-linecap="round"/>
    <line x1="13" y1="27" x2="10" y2="18" stroke="${_TC}" stroke-width="${_TW}" stroke-linecap="round"/>
  </svg>`,
  bl: `<svg class="ct" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
    <path d="M 40,24 Q 16,24 16,0" fill="none" stroke="${_RC}" stroke-width="${_RW}"/>
    <path d="M 40,16 Q 24,16 24,0" fill="none" stroke="${_RC}" stroke-width="${_RW}"/>
    <line x1="30" y1="27" x2="22" y2="27" stroke="${_TC}" stroke-width="${_TW}" stroke-linecap="round"/>
    <line x1="18" y1="13" x2="18" y2="10" stroke="${_TC}" stroke-width="${_TW}" stroke-linecap="round"/>
  </svg>`,
};

function _getTrackSVG(sq) {
  if (sq === 0)  return TRACK_SVG.tl;
  if (sq === 10) return TRACK_SVG.tr;
  if (sq === 20) return TRACK_SVG.br;
  if (sq === 30) return TRACK_SVG.bl;
  const r = sq <= 10 ? 0 : sq <= 20 ? sq - 10 : sq <= 30 ? 10 : 40 - sq;
  return (r === 0 || r === 10) ? TRACK_SVG.h : TRACK_SVG.v;
}

function _trainToken(x, y, emoji, color, strokeColor, name) {
  return `<g transform="translate(${x},${y})">
    <ellipse rx="36" ry="7" cy="30" fill="rgba(0,0,0,0.10)"/>
    <rect x="-34" y="-10" width="68" height="28" rx="10" fill="${color}" stroke="${strokeColor}" stroke-width="3"/>
    <rect x="-26" y="-24" width="10" height="16" rx="4" fill="${color}" stroke="${strokeColor}" stroke-width="2"/>
    <circle cx="-21" cy="-29" r="5" fill="white" opacity="0.75"/>
    <circle cx="-14" cy="-34" r="4" fill="white" opacity="0.55"/>
    <circle cx="-8" cy="-37" r="3" fill="white" opacity="0.35"/>
    <rect x="30" y="-6" width="12" height="16" rx="4" fill="${strokeColor}" opacity="0.6"/>
    <circle cx="40" cy="-1" r="3.5" fill="#FDE68A"/>
    <rect x="-12" y="-8" width="26" height="20" rx="5" fill="white" stroke="${strokeColor}" stroke-width="2"/>
    <text x="1" y="6" text-anchor="middle" dominant-baseline="middle" font-size="18">${emoji}</text>
    <circle cx="-20" cy="20" r="9" fill="white" stroke="${strokeColor}" stroke-width="2.5"/>
    <circle cx="-20" cy="20" r="4" fill="${strokeColor}" opacity="0.3"/>
    <circle cx="16" cy="20" r="9" fill="white" stroke="${strokeColor}" stroke-width="2.5"/>
    <circle cx="16" cy="20" r="4" fill="${strokeColor}" opacity="0.3"/>
    <rect x="-22" y="32" width="44" height="16" rx="8" fill="${strokeColor}" opacity="0.85"/>
    <text x="0" y="41" text-anchor="middle" dominant-baseline="middle" font-size="11" fill="white" font-weight="700">${name}</text>
  </g>`;
}
/* ====================================================== */
/* ===== 위 선로/기차 토큰 코드 끝 ===== */
/* ====================================================== */

const mapPts  = { '시현이': 0, '시온이': 0 };
const mapGift = { '시현이': 0, '시온이': 0 };
let unsubMapSih  = null;
let unsubMapSion = null;
let mapCurrentChild = null;
let _mapWinShown    = false;
const mapEventsClaimed = { '시현이': {}, '시온이': {} };
let _eventShown = false;

function mapPos(total) { return ((total % MAP_TOTAL) + MAP_TOTAL) % MAP_TOTAL; }

function gridToSq(r, c) {
  if (r === 0)  return c;
  if (c === 10) return 10 + r;
  if (r === 10) return 30 - c;
  return 40 - r;
}

function _sqToXY(sq) {
  let r, c;
  if (sq <= 10)      { r = 0;        c = sq;      }
  else if (sq <= 20) { r = sq - 10;  c = 10;      }
  else if (sq <= 30) { r = 10;       c = 30 - sq; }
  else               { r = 40 - sq;  c = 0;       }
  return { x: c * 100 + 50, y: r * 100 + 50 };
}

// 번호/아이콘 배지를 선로 없는 바깥쪽에 배치
function _badgePos(sq, r, c) {
  if (sq === 0)  return 'b-tl';
  if (sq === 10) return 'b-tr';
  if (sq === 20) return 'b-br';
  if (sq === 30) return 'b-bl';
  if (r === 0)   return 'b-tc';
  if (c === 10)  return 'b-rc';
  if (r === 10)  return 'b-bc';
  return 'b-lc';
}

function openMapScreen() {
  mapCurrentChild = profile;
  document.getElementById('screen-main').classList.add('hidden');
  document.getElementById('screen-map').classList.remove('hidden');
  _startMapSubs();
}

function closeMapScreen() {
  _stopMapSubs();
  document.getElementById('screen-map').classList.add('hidden');
  document.getElementById('screen-main').classList.remove('hidden');
}

function _startMapSubs() {
  _stopMapSubs();
  ['시현이', '시온이'].forEach(name => {
    const cid = CHILD_IDS[name];
    const unsub = db.collection('points').doc(cid).onSnapshot(snap => {
      const d = snap.exists ? snap.data() : {};
      mapPts[name]  = d.total     || 0;
      mapGift[name] = d.giftCount || 0;
      mapEventsClaimed[name] = d.eventsClaimed || {};
      renderChildMap();
      if (name === mapCurrentChild) { _checkMapWin(name); _checkMapEvents(name); }
    });
    if (name === '시현이') unsubMapSih = unsub;
    else                   unsubMapSion = unsub;
  });
}

function _stopMapSubs() {
  if (unsubMapSih)  { unsubMapSih();  unsubMapSih  = null; }
  if (unsubMapSion) { unsubMapSion(); unsubMapSion = null; }
}

// ===== 중앙 워드마크 (드로잉 느낌, 아이콘 없음) =====
const CENTER_WORDMARK = `<svg class="map-wordmark" viewBox="0 0 260 96" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="wmg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#F472B6"/>
      <stop offset="48%" stop-color="#A78BFA"/>
      <stop offset="100%" stop-color="#60A5FA"/>
    </linearGradient>
  </defs>
  <path d="M22 76 Q130 94 238 76" fill="none" stroke="#DCCBF5" stroke-width="3" stroke-dasharray="2 7" stroke-linecap="round"/>
  <circle cx="22" cy="76" r="3.5" fill="#C4B0F0"/>
  <circle cx="238" cy="76" r="3.5" fill="#C4B0F0"/>
  <text x="130" y="40" text-anchor="middle" font-size="30" font-weight="800" fill="url(#wmg)" style="letter-spacing:-1px">동물마을</text>
  <text x="130" y="66" text-anchor="middle" font-size="21" font-weight="700" fill="#9277C9" style="letter-spacing:3px">기 차 여 행</text>
  <text x="34" y="22" font-size="13" fill="#F9A8D4">✦</text>
  <text x="218" y="20" font-size="11" fill="#A78BFA">✦</text>
  <text x="210" y="44" font-size="9" fill="#93C5FD">✦</text>
</svg>`;

// ===== 보드 렌더링 =====
function _buildBoard(sihTotal, sionTotal, sihGift, sionGift) {
  const sp = mapPos(sihTotal);
  const op = mapPos(sionTotal);
  sihGift = sihGift || 0;
  sionGift = sionGift || 0;
  let html = '';

  for (let r = 0; r < 11; r++) {
    for (let c = 0; c < 11; c++) {
      const isOuter = (r === 0 || r === 10 || c === 0 || c === 10);
      if (!isOuter) {
        if (r === 1 && c === 1) {
          html += `<div class="map-inner" style="grid-column:2/span 9;grid-row:2/span 9">
            ${CENTER_WORDMARK}
            <div class="map-inner-sub">포인트를 모아 한 바퀴 돌면 선물!</div>
            <div class="map-inner-cards">
              <div class="map-icard sih-icard">
                <span class="mic-emoji">🐰</span>
                <span class="mic-name">시현이</span>
                <span class="mic-pt">${sihTotal}<small>pt</small></span>
                <span class="mic-pos">${mapPos(sihTotal)}번 칸${sihGift>0?' · 🎁'+sihGift:''}</span>
              </div>
              <div class="map-icard sio-icard">
                <span class="mic-emoji">🐻</span>
                <span class="mic-name">시온이</span>
                <span class="mic-pt">${sionTotal}<small>pt</small></span>
                <span class="mic-pos">${mapPos(sionTotal)}번 칸${sionGift>0?' · 🎁'+sionGift:''}</span>
              </div>
            </div>
          </div>`;
        }
        continue;
      }

      const sq = gridToSq(r, c);
      const sc = SPECIAL_CELLS[sq];
      const bp = _badgePos(sq, r, c);
      const bg = sc ? sc.bg : '#FFFFFF';
      const isEvent = EVENT_CELLS.includes(sq);
      const cellCls = (sc ? 'map-cell special' : 'map-cell') + (isEvent ? ' event' : '');

      let badge = '';
      if (sc) {
        badge = `<div class="cell-badge ${bp}">
          <span class="cb-icon"><svg viewBox="0 0 24 24">${sc.icon}</svg></span>
          <span class="cb-num" style="color:${sc.color}">${sq}</span>
        </div>`;
      } else {
        badge = `<div class="cell-badge ${bp}"><span class="cb-num">${sq}</span></div>`;
      }

      html += `<div class="${cellCls}"
        style="grid-column:${c+1};grid-row:${r+1};background:${bg}"
        title="${sq}번${sc?' · '+sc.label:''}${isEvent?' · 🎟️ 이벤트 칸':''}">
        ${_getTrackSVG(sq)}
        ${badge}
        ${isEvent ? '<span class="cell-spark">✨</span>' : ''}
      </div>`;
    }
  }

  const sp_xy = _sqToXY(sp);
  const op_xy = _sqToXY(op);
  const same  = sp === op;

  let tokHtml = '';
  if (same) {
    tokHtml =
      _trainToken(sp_xy.x - 38, sp_xy.y - 8, '🐰', '#FECDD3', '#F472B6', '시현이') +
      _trainToken(sp_xy.x + 38, sp_xy.y - 8, '🐻', '#BFDBFE', '#60A5FA', '시온이');
  } else {
    tokHtml =
      _trainToken(sp_xy.x, sp_xy.y, '🐰', '#FECDD3', '#F472B6', '시현이') +
      _trainToken(op_xy.x, op_xy.y, '🐻', '#BFDBFE', '#60A5FA', '시온이');
  }

  html += `<svg class="map-tok-svg" viewBox="0 0 1100 1100" xmlns="http://www.w3.org/2000/svg">${tokHtml}</svg>`;
  return html;
}

function renderChildMap() {
  const board = document.getElementById('map-board');
  if (!board) return;
  board.innerHTML = _buildBoard(mapPts['시현이'], mapPts['시온이'], mapGift['시현이'], mapGift['시온이']);
  const myTotal = mapPts[mapCurrentChild];
  const pos   = mapPos(myTotal);
  const round = Math.floor(myTotal / MAP_TOTAL) + 1;
  const el = document.getElementById('map-pts-label');
  if (el) el.textContent = `⭐ ${myTotal}포인트 · ${pos}번 칸 · ${round}바퀴째`;
}

function renderParentMapIfVisible() {
  const body = document.getElementById('parent-map-body');
  if (!body || body.classList.contains('hidden')) return;
  const board = document.getElementById('parent-map-board');
  if (!board) return;
  const sihTotal  = (typeof parentPointsData !== 'undefined') ? (parentPointsData['시현이'].total || 0) : 0;
  const sionTotal = (typeof parentPointsData !== 'undefined') ? (parentPointsData['시온이'].total || 0) : 0;
  const sihGift   = (typeof parentPointsData !== 'undefined') ? (parentPointsData['시현이'].giftCount || 0) : 0;
  const sionGift  = (typeof parentPointsData !== 'undefined') ? (parentPointsData['시온이'].giftCount || 0) : 0;
  board.innerHTML = _buildBoard(sihTotal, sionTotal, sihGift, sionGift);
  const info = document.getElementById('parent-map-info');
  if (info) {
    info.innerHTML =
      `🐰 시현이: <b>${sihTotal}pts</b> (${mapPos(sihTotal)}번칸)&nbsp;·&nbsp;` +
      `🐻 시온이: <b>${sionTotal}pts</b> (${mapPos(sionTotal)}번칸)`;
  }
}

function toggleParentMap() {
  const body = document.getElementById('parent-map-body');
  const btn  = document.getElementById('parent-map-toggle');
  if (!body) return;
  const isHidden = body.classList.contains('hidden');
  body.classList.toggle('hidden', !isHidden);
  if (btn) btn.textContent = isHidden ? '접기 ▲' : '펼치기 ▼';
  if (isHidden) renderParentMapIfVisible();
}

function _checkMapWin(name) {
  const total = mapPts[name];
  const gifts = mapGift[name];
  if (total > 0 && Math.floor(total / MAP_TOTAL) > gifts && !_mapWinShown) {
    _mapWinShown = true;
    _showMapWin(name);
  }
}

function _showMapWin(name) {
  const newGift = mapGift[name] + 1;
  const title = document.getElementById('mapwin-title');
  const msg   = document.getElementById('mapwin-msg');
  const cnt   = document.getElementById('mapwin-count');
  if (title) title.textContent = `🎉 ${name} 축하해요!`;
  if (msg)   msg.textContent   = '동물마을 한 바퀴 완주! 선물을 받았어요 🎁';
  if (cnt)   cnt.textContent   = `누적 선물 ${newGift}번째 🎁`;
  _spawnConfetti();
  document.getElementById('overlay-mapwin').classList.add('on');
  document.getElementById('modal-mapwin').classList.add('on');
}

async function confirmMapWin() {
  document.getElementById('overlay-mapwin').classList.remove('on');
  document.getElementById('modal-mapwin').classList.remove('on');
  _mapWinShown = false;
  const name    = mapCurrentChild;
  const cid     = CHILD_IDS[name];
  const newGift = mapGift[name] + 1;
  try {
    // 누적 보존: total은 차감하지 않고 선물 개수만 1 증가.
    // 위치=total%40, 바퀴=floor(total/40)로 계산되며,
    // 2바퀴 이상 누적분은 스냅샷 재호출 시 _checkMapWin이 한 바퀴씩 다시 지급.
    await db.collection('points').doc(cid).set({
      giftCount: newGift,
    }, { merge: true });
  } catch (e) { console.error('승리 처리 실패:', e); }
}

// ===== 맵 이벤트 (10/20/30칸 도달 → 축하 + 공용 풀 랜덤 쿠폰) =====
function _nextUnclaimedEvent(total, claimed) {
  const maxLap = Math.floor(total / MAP_TOTAL);
  for (let lap = 0; lap <= maxLap; lap++) {
    for (const c of EVENT_CELLS) {
      if (lap * MAP_TOTAL + c > total) continue;
      const key = `${lap}_${c}`;
      if (!claimed[key]) return { cell: c, key };
    }
  }
  return null;
}

async function _checkMapEvents(name) {
  if (_eventShown || _mapWinShown) return;
  if (name !== mapCurrentChild) return;
  const total = mapPts[name] || 0;
  const next  = _nextUnclaimedEvent(total, mapEventsClaimed[name] || {});
  if (!next) return;
  _eventShown = true;
  const pRef    = db.collection('points').doc(CHILD_IDS[name]);
  const poolRef = db.collection('settings').doc('coupons');
  let drawn = null, alreadyDone = false;
  try {
    // 트랜잭션: 서버에서 청구 여부 재확인 후 랜덤 추첨 (중복 지급 방지, 다기기 안전)
    await db.runTransaction(async tx => {
      const pSnap    = await tx.get(pRef);
      const poolSnap = await tx.get(poolRef);
      const pdata    = pSnap.exists ? pSnap.data() : {};
      const claimedNow = pdata.eventsClaimed || {};
      if (claimedNow[next.key]) { alreadyDone = true; return; }
      const pool    = poolSnap.exists ? (poolSnap.data().pool || []) : [];
      const coupons = pdata.coupons || [];
      if (pool.length > 0) {
        drawn = pool[Math.floor(Math.random() * pool.length)];
        coupons.push({ label: drawn, date: todayKey(), cell: next.cell });
      }
      tx.set(pRef, { coupons, eventsClaimed: { ...claimedNow, [next.key]: true } }, { merge: true });
    });
  } catch (e) { console.error('맵 이벤트 처리 실패:', e); _eventShown = false; return; }
  if (alreadyDone) { _eventShown = false; return; }
  _showMapEvent(next.cell, drawn);
}

function _showMapEvent(cell, couponLabel) {
  const sc = SPECIAL_CELLS[cell];
  const place = sc ? sc.label : (cell + '번 칸');
  const titleEl = document.getElementById('mapevent-title');
  const msgEl   = document.getElementById('mapevent-msg');
  const couEl   = document.getElementById('mapevent-coupon');
  if (titleEl) titleEl.textContent = `🎉 ${place} 도착!`;
  if (msgEl)   msgEl.textContent   = `${cell}번 칸 이벤트에 도착했어요!`;
  if (couEl) {
    if (couponLabel) { couEl.textContent = `🎟️ '${couponLabel}' 쿠폰 획득!`; couEl.classList.remove('hidden'); }
    else             { couEl.classList.add('hidden'); }
  }
  _spawnConfetti('overlay-mapevent');
  document.getElementById('overlay-mapevent').classList.add('on');
  document.getElementById('modal-mapevent').classList.add('on');
}

function confirmMapEvent() {
  document.getElementById('overlay-mapevent').classList.remove('on');
  document.getElementById('modal-mapevent').classList.remove('on');
  _eventShown = false;
  if (mapCurrentChild) _checkMapEvents(mapCurrentChild); // 다음 이벤트가 또 있으면 이어서
}

function _spawnConfetti(overlayId = 'overlay-mapwin') {
  const overlay = document.getElementById(overlayId);
  if (!overlay) return;
  overlay.querySelectorAll('.confetti-piece').forEach(el => el.remove());
  const pieces = ['🎊','🎉','⭐','🌟','✨','🎈','💫','🎁','🌸','🏆'];
  for (let i = 0; i < 28; i++) {
    const el = document.createElement('span');
    el.className = 'confetti-piece';
    el.textContent = pieces[i % pieces.length];
    el.style.cssText =
      `left:${Math.random() * 96}%;` +
      `animation-delay:${(Math.random() * 1.2).toFixed(2)}s;` +
      `font-size:${(1.0 + Math.random() * 1.4).toFixed(1)}rem`;
    overlay.appendChild(el);
  }
}

(function () {
  const orig = window.renderParentPoints;
  if (typeof orig === 'function') {
    window.renderParentPoints = function () {
      orig.apply(this, arguments);
      renderParentMapIfVisible();
    };
  }
})();
