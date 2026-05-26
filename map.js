'use strict';

// ===== 맵 데이터 =====
const MAP_TOTAL = 40;

const MAP_SQUARES = [
  { emoji: '🏁', label: '출발',      bg: '#FFF3C4' },
  { emoji: '🌸', label: '벚꽃길',   bg: '#FFE8F2' },
  { emoji: '🏠', label: '작은집',   bg: '#FFE8F0' },
  { emoji: '🍎', label: '사과밭',   bg: '#FFE8E8' },
  { emoji: '🌻', label: '해바라기', bg: '#FFFDE0' },
  { emoji: '🐰', label: '토끼굴',   bg: '#FFF0F8' },
  { emoji: '🎪', label: '서커스',   bg: '#FFF0DC' },
  { emoji: '🌊', label: '시냇가',   bg: '#E4F4FF' },
  { emoji: '🍦', label: '아이스크림', bg: '#EFFFFF' },
  { emoji: '🌈', label: '무지개',   bg: '#F0EEFF' },
  { emoji: '🌳', label: '큰나무',   bg: '#E4FFE4' },
  { emoji: '🎠', label: '목마',     bg: '#FFE4F8' },
  { emoji: '🌷', label: '꽃밭',     bg: '#FFE0EC' },
  { emoji: '🏡', label: '민들레집', bg: '#FFFAE0' },
  { emoji: '🍓', label: '딸기밭',   bg: '#FFE8E8' },
  { emoji: '🐻', label: '곰굴',     bg: '#E4F0FF' },
  { emoji: '🎯', label: '과녁',     bg: '#FFF0DC' },
  { emoji: '🌙', label: '달밤',     bg: '#F0E4FF' },
  { emoji: '⭐', label: '별자리',   bg: '#FFFAE0' },
  { emoji: '🎵', label: '음악광장', bg: '#EDFFF0' },
  { emoji: '🏰', label: '동화성',   bg: '#EEE4FF' },
  { emoji: '🎁', label: '선물',     bg: '#FFE0EC' },
  { emoji: '🦋', label: '나비정원', bg: '#EDF4FF' },
  { emoji: '🍰', label: '케이크',   bg: '#FFF0F8' },
  { emoji: '🌺', label: '열대꽃',   bg: '#FFE8E8' },
  { emoji: '🎡', label: '관람차',   bg: '#E4FFFF' },
  { emoji: '🐥', label: '병아리',   bg: '#FFFAE0' },
  { emoji: '🌿', label: '숲속길',   bg: '#E4FFE4' },
  { emoji: '🏖️', label: '해변',    bg: '#E0F4FF' },
  { emoji: '🍄', label: '버섯마을', bg: '#FFE8D6' },
  { emoji: '⛲', label: '분수대',   bg: '#E0EEFF' },
  { emoji: '🦊', label: '여우마을', bg: '#FFE8D6' },
  { emoji: '🌼', label: '데이지밭', bg: '#FFFAE0' },
  { emoji: '🎈', label: '풍선가게', bg: '#FFE0EC' },
  { emoji: '🍩', label: '도넛가게', bg: '#FFF0DC' },
  { emoji: '🌟', label: '소원별',   bg: '#FFFAE0' },
  { emoji: '🎪', label: '마을축제', bg: '#FFF0DC' },
  { emoji: '🦄', label: '유니콘',   bg: '#F4E4FF' },
  { emoji: '🌙', label: '달빛길',   bg: '#F0E4FF' },
  { emoji: '✨', label: '반짝임',   bg: '#FFFAE0' },
];

const MAP_INNER_DECOS = [
  '🌿','🌱','🍀','🌸','🌻','🌼','🍄','🦋',
  '🐝','🌺','🍃','🌾','🌲','🌴','🌵','🌷',
];

// ===== 상태 =====
const mapPts  = { '시현이': 0, '시온이': 0 };
const mapGift = { '시현이': 0, '시온이': 0 };
let unsubMapSih  = null;
let unsubMapSion = null;
let mapCurrentChild = null;
let _mapWinShown    = false;

// ===== 위치 계산 =====
function mapPos(total)   { return ((total % MAP_TOTAL) + MAP_TOTAL) % MAP_TOTAL; }

// 11×11 외부 링 (시계방향, 0번=좌상단)
function gridToSq(r, c) {
  if (r === 0)  return c;           // 상단: sq 0→10 (좌→우)
  if (c === 10) return 10 + r;      // 우측: sq 11→20 (위→아래)
  if (r === 10) return 30 - c;      // 하단: sq 21→30 (우→좌)
  return 40 - r;                    // 좌측: sq 31→39 (아래→위)
}

// ===== 화면 열기/닫기 =====
function openMapScreen() {
  mapCurrentChild = profile; // app.js 전역
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
    const cid = CHILD_IDS[name]; // app.js 전역
    const unsub = db.collection('points').doc(cid).onSnapshot(snap => {
      const d = snap.exists ? snap.data() : {};
      mapPts[name]  = d.total      || 0;
      mapGift[name] = d.giftCount  || 0;
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
  const html = [];

  for (let r = 0; r < 11; r++) {
    for (let c = 0; c < 11; c++) {
      const isOuter = (r === 0 || r === 10 || c === 0 || c === 10);
      if (!isOuter) {
        if (r === 1 && c === 1) {
          html.push(
            '<div class="map-inner">' +
            '<div class="map-inner-title">🌈 동물마을 🌈</div>' +
            '<div class="map-inner-sub">🐾 행복한 여행 🐾</div>' +
            '<div class="map-inner-chars">🐰 🐻</div>' +
            '</div>'
          );
        }
        continue;
      }
      const sq  = gridToSq(r, c);
      const sd  = MAP_SQUARES[sq];
      const sih = sp === sq;
      const sio = op === sq;
      const isLandmark = (sq === 0 || sq === 10 || sq === 20 || sq === 30);
      const edgeCls = r === 0 ? 'map-et' : c === 10 ? 'map-er' : r === 10 ? 'map-eb' : 'map-el';
      const tok = (sih ? '<span class="map-tok sih-tok" title="시현이">🐰</span>' : '')
                + (sio ? '<span class="map-tok sio-tok" title="시온이">🐻</span>' : '');
      html.push(
        `<div class="map-cell map-cs ${edgeCls}${isLandmark ? ' map-lm' : ''}${sq === 0 ? ' map-start' : ''}` +
        `" style="grid-column:${c + 1};grid-row:${r + 1};background:${sd.bg}" title="${sd.label}">` +
        `<div class="map-trow">${tok}</div>` +
        `<div class="map-emo">${sd.emoji}</div>` +
        `<div class="map-num">${sq}</div>` +
        `</div>`
      );
    }
  }
  return html.join('');
}

function renderChildMap() {
  const board = document.getElementById('map-board');
  if (!board) return;
  board.innerHTML = _buildBoard(mapPts['시현이'], mapPts['시온이']);

  const myTotal = mapPts[mapCurrentChild];
  const pos     = mapPos(myTotal);
  const round   = Math.floor(myTotal / MAP_TOTAL) + 1;
  const el = document.getElementById('map-pts-label');
  if (el) el.textContent = `⭐ ${myTotal}포인트 · ${pos}번 칸 · ${round}바퀴째`;
}

function renderParentMapIfVisible() {
  const body = document.getElementById('parent-map-body');
  if (!body || body.classList.contains('hidden')) return;
  const board = document.getElementById('parent-map-board');
  if (!board) return;

  // parentPointsData는 app.js 전역
  const sihTotal  = (typeof parentPointsData !== 'undefined') ? (parentPointsData['시현이'].total || 0) : 0;
  const sionTotal = (typeof parentPointsData !== 'undefined') ? (parentPointsData['시온이'].total || 0) : 0;
  board.innerHTML = _buildBoard(sihTotal, sionTotal);

  const info = document.getElementById('parent-map-info');
  if (info) {
    info.innerHTML =
      `🐰 시현이: <b>${sihTotal}pts</b> (${mapPos(sihTotal)}번칸)` +
      `&nbsp;·&nbsp;` +
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

// ===== 승리 체크 & 축하 =====
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
  const title   = document.getElementById('mapwin-title');
  const msg     = document.getElementById('mapwin-msg');
  const cnt     = document.getElementById('mapwin-count');
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
  const name = mapCurrentChild;
  const cid  = CHILD_IDS[name];
  const newGift = mapGift[name] + 1;
  try {
    await db.collection('points').doc(cid).set({
      total:     firebase.firestore.FieldValue.increment(-MAP_TOTAL),
      giftCount: newGift,
    }, { merge: true });
  } catch (e) { console.error('승리 처리 실패:', e); }
}

// ===== 폭죽 =====
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

// ===== 부모 포인트 업데이트 후킹 (기존 코드 수정 없이) =====
(function () {
  const orig = window.renderParentPoints;
  if (typeof orig === 'function') {
    window.renderParentPoints = function () {
      orig.apply(this, arguments);
      renderParentMapIfVisible();
    };
  }
})();
