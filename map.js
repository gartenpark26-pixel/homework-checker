'use strict';

const MAP_TOTAL = 40;

// 랜드마크 칸(0,10,20,30)만 아이콘 사용 - Sanrio/카카오 무드 SVG
const LANDMARK_ICONS = {
  0: `<svg class="lm-icon" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
    <!-- 출발역: 귀여운 기차역 -->
    <rect x="4" y="22" width="28" height="5" rx="2.5" fill="#FDE68A" stroke="#F59E0B" stroke-width="1.2"/>
    <rect x="6" y="13" width="20" height="10" rx="3" fill="#FEF9C3" stroke="#F59E0B" stroke-width="1.2"/>
    <rect x="6" y="13" width="6" height="10" rx="2" fill="#FCD34D" fill-opacity="0.5"/>
    <circle cx="11" cy="22" r="2.5" fill="white" stroke="#F59E0B" stroke-width="1.2"/>
    <circle cx="22" cy="22" r="2.5" fill="white" stroke="#F59E0B" stroke-width="1.2"/>
    <rect x="23" y="7" width="2" height="8" rx="1" fill="#F59E0B"/>
    <path d="M25 7 l5 2.5 -5 2.5z" fill="#EF4444"/>
    <circle cx="8" cy="6" r="1.8" fill="#FCD34D"/>
    <circle cx="18" cy="4" r="2.2" fill="#FCD34D"/>
    <circle cx="27" cy="7" r="1.5" fill="#FCD34D"/>
  </svg>`,

  10: `<svg class="lm-icon" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
    <!-- 큰나무: 귀여운 둥근 나무 캐릭터 -->
    <circle cx="18" cy="13" r="11" fill="#86EFAC" stroke="#22C55E" stroke-width="1.5"/>
    <circle cx="13" cy="10" r="5" fill="#A3E635" stroke="#65A30D" stroke-width="1"/>
    <circle cx="23" cy="10" r="5" fill="#A3E635" stroke="#65A30D" stroke-width="1"/>
    <circle cx="18" cy="8" r="5" fill="#BBF7D0" stroke="#22C55E" stroke-width="1"/>
    <!-- 얼굴 -->
    <circle cx="15" cy="14" r="1.2" fill="#15803D"/>
    <circle cx="21" cy="14" r="1.2" fill="#15803D"/>
    <path d="M15 17 Q18 20 21 17" fill="none" stroke="#15803D" stroke-width="1.2" stroke-linecap="round"/>
    <circle cx="17" cy="15.5" r="1" fill="#FCA5A5" stroke="none" opacity="0.7"/>
    <circle cx="19" cy="15.5" r="1" fill="#FCA5A5" stroke="none" opacity="0.7"/>
    <!-- 나무줄기 -->
    <rect x="15" y="23" width="6" height="8" rx="2" fill="#92400E"/>
  </svg>`,

  20: `<svg class="lm-icon" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
    <!-- 동화성: 핑크 성 -->
    <rect x="5" y="16" width="26" height="14" rx="2" fill="#FAE8FF" stroke="#D946EF" stroke-width="1.2"/>
    <!-- 탑들 -->
    <rect x="5" y="10" width="7" height="8" rx="1" fill="#F5D0FE" stroke="#D946EF" stroke-width="1"/>
    <rect x="14" y="7" width="8" height="11" rx="1" fill="#F5D0FE" stroke="#D946EF" stroke-width="1"/>
    <rect x="24" y="10" width="7" height="8" rx="1" fill="#F5D0FE" stroke="#D946EF" stroke-width="1"/>
    <!-- 뾰족 지붕 -->
    <path d="M5 10 L8.5 4 L12 10z" fill="#E879F9" stroke="#A21CAF" stroke-width="0.8"/>
    <path d="M14 7 L18 1 L22 7z" fill="#E879F9" stroke="#A21CAF" stroke-width="0.8"/>
    <path d="M24 10 L27.5 4 L31 10z" fill="#E879F9" stroke="#A21CAF" stroke-width="0.8"/>
    <!-- 문 -->
    <path d="M16 30 Q18 26 20 30z" fill="#D946EF" fill-opacity="0.3"/>
    <rect x="16" y="23" width="4" height="7" rx="2" fill="#D946EF" fill-opacity="0.3" stroke="#D946EF" stroke-width="0.8"/>
    <!-- 별 장식 -->
    <text x="18" y="22" text-anchor="middle" font-size="5">⭐</text>
    <circle cx="8" cy="4" r="1.2" fill="#FDE047"/>
    <circle cx="28" cy="4" r="1.2" fill="#FDE047"/>
    <circle cx="18" cy="1" r="1.5" fill="#FDE047"/>
  </svg>`,

  30: `<svg class="lm-icon" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
    <!-- 분수대: 파란 분수 -->
    <ellipse cx="18" cy="31" rx="12" ry="3.5" fill="#BAE6FD" stroke="#38BDF8" stroke-width="1.2"/>
    <ellipse cx="18" cy="25" rx="7" ry="2.5" fill="#E0F2FE" stroke="#0EA5E9" stroke-width="1"/>
    <rect x="16" y="17" width="4" height="9" rx="1.5" fill="#7DD3FC"/>
    <!-- 물줄기 -->
    <path d="M18 17 Q12 10 8 14" fill="none" stroke="#38BDF8" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M18 17 Q24 10 28 14" fill="none" stroke="#38BDF8" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M18 17 Q10 8 10 12" fill="none" stroke="#7DD3FC" stroke-width="1.2" stroke-linecap="round"/>
    <path d="M18 17 Q26 8 26 12" fill="none" stroke="#7DD3FC" stroke-width="1.2" stroke-linecap="round"/>
    <path d="M18 17 Q17 6 18 8" fill="none" stroke="#BAE6FD" stroke-width="1.5" stroke-linecap="round"/>
    <!-- 물방울 -->
    <circle cx="8" cy="14" r="2" fill="#38BDF8" opacity="0.7"/>
    <circle cx="28" cy="14" r="2" fill="#38BDF8" opacity="0.7"/>
    <circle cx="10" cy="12" r="1.5" fill="#7DD3FC" opacity="0.6"/>
    <circle cx="26" cy="12" r="1.5" fill="#7DD3FC" opacity="0.6"/>
    <circle cx="18" cy="8" r="2" fill="#BAE6FD" opacity="0.8"/>
  </svg>`,
};

// 선로 색상 - 밝은 파스텔 라벤더
const _RC = '#C4B0F0';  // rail color (라벤더)
const _TC = '#A090D8';  // tie color  (중간 보라)
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
  // 좌상단(sq0): 아래→오른쪽
  tl: `<svg class="ct" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
    <path d="M 16,40 Q 16,16 40,16" fill="none" stroke="${_RC}" stroke-width="${_RW}"/>
    <path d="M 24,40 Q 24,24 40,24" fill="none" stroke="${_RC}" stroke-width="${_RW}"/>
    <line x1="13" y1="30" x2="22" y2="26" stroke="${_TC}" stroke-width="${_TW}" stroke-linecap="round"/>
    <line x1="26" y1="13" x2="30" y2="22" stroke="${_TC}" stroke-width="${_TW}" stroke-linecap="round"/>
  </svg>`,
  // 우상단(sq10): 왼쪽→아래
  tr: `<svg class="ct" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
    <path d="M 0,16 Q 24,16 24,40" fill="none" stroke="${_RC}" stroke-width="${_RW}"/>
    <path d="M 0,24 Q 16,24 16,40" fill="none" stroke="${_RC}" stroke-width="${_RW}"/>
    <line x1="10" y1="13" x2="13" y2="22" stroke="${_TC}" stroke-width="${_TW}" stroke-linecap="round"/>
    <line x1="27" y1="27" x2="18" y2="30" stroke="${_TC}" stroke-width="${_TW}" stroke-linecap="round"/>
  </svg>`,
  // 우하단(sq20): 위→왼쪽
  br: `<svg class="ct" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
    <path d="M 24,0 Q 24,24 0,24" fill="none" stroke="${_RC}" stroke-width="${_RW}"/>
    <path d="M 16,0 Q 16,16 0,16" fill="none" stroke="${_RC}" stroke-width="${_RW}"/>
    <line x1="27" y1="10" x2="18" y2="13" stroke="${_TC}" stroke-width="${_TW}" stroke-linecap="round"/>
    <line x1="13" y1="27" x2="10" y2="18" stroke="${_TC}" stroke-width="${_TW}" stroke-linecap="round"/>
  </svg>`,
  // 좌하단(sq30): 오른쪽→위
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

// ===== 랜드마크 칸 레이블 =====
const LANDMARK_LABELS = { 0:'출발역', 10:'큰나무', 20:'동화성', 30:'분수대' };

// ===== 토큰 SVG: 기차에 탑승한 캐릭터 =====
// 기차 모양 + 캐릭터가 창문 안에 보이는 형태
function _trainToken(x, y, emoji, color, strokeColor, name) {
  return `<g transform="translate(${x},${y})">
    <!-- 그림자 -->
    <ellipse rx="36" ry="7" cy="30" fill="rgba(0,0,0,0.10)"/>
    <!-- 기차 몸통 -->
    <rect x="-34" y="-10" width="68" height="28" rx="10" fill="${color}" stroke="${strokeColor}" stroke-width="3"/>
    <!-- 굴뚝 -->
    <rect x="-26" y="-24" width="10" height="16" rx="4" fill="${color}" stroke="${strokeColor}" stroke-width="2"/>
    <!-- 연기 -->
    <circle cx="-21" cy="-29" r="5" fill="white" opacity="0.75"/>
    <circle cx="-14" cy="-34" r="4" fill="white" opacity="0.55"/>
    <circle cx="-8" cy="-37" r="3" fill="white" opacity="0.35"/>
    <!-- 기차 앞면 -->
    <rect x="30" y="-6" width="12" height="16" rx="4" fill="${strokeColor}" opacity="0.6"/>
    <!-- 헤드라이트 -->
    <circle cx="40" cy="-1" r="3.5" fill="#FDE68A"/>
    <!-- 창문 (캐릭터 표시) -->
    <rect x="-12" y="-8" width="26" height="20" rx="5" fill="white" stroke="${strokeColor}" stroke-width="2"/>
    <!-- 캐릭터 이모지 -->
    <text x="1" y="6" text-anchor="middle" dominant-baseline="middle" font-size="18">${emoji}</text>
    <!-- 바퀴 -->
    <circle cx="-20" cy="20" r="9" fill="white" stroke="${strokeColor}" stroke-width="2.5"/>
    <circle cx="-20" cy="20" r="4" fill="${strokeColor}" opacity="0.3"/>
    <circle cx="16" cy="20" r="9" fill="white" stroke="${strokeColor}" stroke-width="2.5"/>
    <circle cx="16" cy="20" r="4" fill="${strokeColor}" opacity="0.3"/>
    <!-- 이름 레이블 -->
    <rect x="-22" y="32" width="44" height="16" rx="8" fill="${strokeColor}" opacity="0.85"/>
    <text x="0" y="41" text-anchor="middle" dominant-baseline="middle" font-size="11" fill="white" font-weight="700">${name}</text>
  </g>`;
}

// ===== 상태 =====
const mapPts  = { '시현이': 0, '시온이': 0 };
const mapGift = { '시현이': 0, '시온이': 0 };
let unsubMapSih  = null;
let unsubMapSion = null;
let mapCurrentChild = null;
let _mapWinShown    = false;

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

// ===== 화면 열기/닫기 =====
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
      renderChildMap();
      if (name === mapCurrentChild) _checkMapWin(name);
    });
    if (name === '시현이') unsubMapSih = unsub;
    else                   unsubMapSion = unsub;
  });
}

function _stopMapSubs() {
  if (unsubMapSih)  { unsubMapSih();  unsubMapSih  = null; }
  if (unsubMapSion) { unsubMapSion(); unsubMapSion = null; }
}

// ===== 보드 렌더링 =====
function _buildBoard(sihTotal, sionTotal) {
  const sp = mapPos(sihTotal);
  const op = mapPos(sionTotal);
  let html = '';

  for (let r = 0; r < 11; r++) {
    for (let c = 0; c < 11; c++) {
      const isOuter = (r === 0 || r === 10 || c === 0 || c === 10);
      if (!isOuter) {
        if (r === 1 && c === 1) {
          html += `<div class="map-inner" style="grid-column:2/span 9;grid-row:2/span 9">
            <div class="map-inner-title">🚂 동물마을 기차여행</div>
            <div class="map-inner-sub">포인트를 모아 한 바퀴 돌면 선물!</div>
            <div class="map-inner-cards">
              <div class="map-icard sih-icard">
                <span class="mic-emoji">🐰</span>
                <span class="mic-name">시현이</span>
                <span class="mic-pt">${mapPts['시현이']}pt</span>
                <span class="mic-pos">${mapPos(mapPts['시현이'])}번 칸</span>
                <span class="mic-gift">${mapGift['시현이'] > 0 ? '🎁×' + mapGift['시현이'] : '—'}</span>
              </div>
              <div class="map-icard sio-icard">
                <span class="mic-emoji">🐻</span>
                <span class="mic-name">시온이</span>
                <span class="mic-pt">${mapPts['시온이']}pt</span>
                <span class="mic-pos">${mapPos(mapPts['시온이'])}번 칸</span>
                <span class="mic-gift">${mapGift['시온이'] > 0 ? '🎁×' + mapGift['시온이'] : '—'}</span>
              </div>
            </div>
            <div class="map-inner-legend">
              <span>🏁 0</span><span>🌳 10</span><span>🏰 20</span><span>⛲ 30</span>
            </div>
          </div>`;
        }
        continue;
      }

      const sq = gridToSq(r, c);
      const isLandmark = (sq === 0 || sq === 10 || sq === 20 || sq === 30);

      // 랜드마크 배경색
      const bgMap = { 0: '#FFFBEB', 10: '#F0FDF4', 20: '#FAF5FF', 30: '#EFF6FF' };
      const bg = bgMap[sq] || '#FFFFFF';

      const lmClass = isLandmark ? ' map-lm' : '';

      if (isLandmark) {
        html += `<div class="map-cell${lmClass}"
          style="grid-column:${c+1};grid-row:${r+1};background:${bg}"
          title="${sq}. ${LANDMARK_LABELS[sq]}">
          ${_getTrackSVG(sq)}
          <div class="map-lm-icon">${LANDMARK_ICONS[sq]}</div>
          <div class="map-lm-label">${LANDMARK_LABELS[sq]}</div>
          <div class="map-num">${sq}</div>
        </div>`;
      } else {
        html += `<div class="map-cell"
          style="grid-column:${c+1};grid-row:${r+1};background:${bg}"
          title="${sq}번 칸">
          ${_getTrackSVG(sq)}
          <div class="map-num">${sq}</div>
        </div>`;
      }
    }
  }

  // 기차 토큰 오버레이
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
  board.innerHTML = _buildBoard(mapPts['시현이'], mapPts['시온이']);
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
  board.innerHTML = _buildBoard(sihTotal, sionTotal);
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
    await db.collection('points').doc(cid).set({
      total:     firebase.firestore.FieldValue.increment(-MAP_TOTAL),
      giftCount: newGift,
    }, { merge: true });
  } catch (e) { console.error('승리 처리 실패:', e); }
}

function _spawnConfetti() {
  const overlay = document.getElementById('overlay-mapwin');
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
