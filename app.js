'use strict';

const db = firebase.firestore();
db.enablePersistence().catch(() => {});

// ===== 상태 =====
let profile        = null;
let filter         = '전체';
let newSubj        = '수학';
let viewDate       = '';
let viewingToday   = true;   // 사용자가 '오늘'을 보고 있는지 (자정 경과 자동 갱신 판단용)
let hwData         = [];
let templateItems  = [];
let templateChecks = {};
let unsubFn        = null;
let unsubTemplate  = null;
let unsubChecks    = null;
// 초기 데이터 도착 추적 (로딩 스피너 표시용)
let _tmplFired = false, _hwFired = false, _checksFired = false;
const LIST_LOADING_HTML = '<div class="daydetail-loading"><span class="daydetail-spinner"></span>불러오는 중…</div>';

// ===== 포인트 상태 =====
let pointsData   = { total: 0, history: [] };
let unsubPoints  = null;
let parentPointsData = { '시현이': { total: 0, history: [], giftCount: 0, coupons: [] }, '시온이': { total: 0, history: [], giftCount: 0, coupons: [] } };
let unsubParentPointsSihyeon = null;
let unsubParentPointsSion    = null;

// ===== 미션 상태 =====
let missionItems          = [];   // 현재 아이(profile)용
let unsubMissions         = null;
let parentMissionItems    = [];   // 부모 화면(parentChild)용
let unsubParentMissions   = null;

// ===== 쿠폰 상태 =====
let couponPool      = [];   // 공용 쿠폰 풀
let unsubCouponPool = null;

// ===== 테마 =====
const THEMES = {
  '시현이': {
    color: '#D884B0',
    grad:  'linear-gradient(135deg, #F0A8CB 0%, #C8A0E0 100%)',
    bg:    '#FEF0F7',
  },
  '시온이': {
    color: '#5BBFD9',
    grad:  'linear-gradient(135deg, #9ECFE8 0%, #8ED5C0 100%)',
    bg:    '#EEF7FF',
  },
};

const SUBJ_EMOJI   = { '수학':'📐', '국어':'📖', '영어':'🔤', '기타':'✏️' };
const MOOD_EMOJI   = ['🌱','🌿','⭐','🌟','🏆','🎉'];
const STAR_FEEDBACK = { 1:'😅 조금 했어요', 2:'😊 열심히 했어요', 3:'🌟 완벽하게 했어요' };

// ===== 유틸 =====
function dateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function todayKey() { return dateKey(new Date()); }
function offsetDate(days) {
  const d = new Date(); d.setDate(d.getDate() + days); return dateKey(d);
}
function dateLabelShort(dateStr) {
  const today = todayKey(), yesterday = offsetDate(-1), tomorrow = offsetDate(1);
  const d = new Date(dateStr + 'T00:00:00');
  const formatted = d.toLocaleDateString('ko-KR', { month:'long', day:'numeric', weekday:'short' });
  if (dateStr === today)     return `오늘 · ${formatted}`;
  if (dateStr === yesterday) return `어제 · ${formatted}`;
  if (dateStr === tomorrow)  return `내일 · ${formatted}`;
  return formatted;
}
function formatTime(ts) {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleTimeString('ko-KR', { hour:'numeric', minute:'2-digit', hour12:true });
}
function nowTimeStr() {
  return new Date().toLocaleTimeString('ko-KR', { hour:'numeric', minute:'2-digit', hour12:true });
}
// "오전 9:05" / "오후 9:25" 형식을 0~1439 분 정수로. 파싱 실패 시 -1.
function krTimeToMinutes(s) {
  if (!s) return -1;
  const m = String(s).match(/(오전|오후)\s*(\d{1,2}):(\d{2})/);
  if (!m) return -1;
  let h = parseInt(m[2], 10);
  if (m[1] === '오후' && h !== 12) h += 12;
  if (m[1] === '오전' && h === 12) h = 0;
  return h * 60 + parseInt(m[3], 10);
}
const POINT_CUTOFF_MIN = 21 * 60 + 30; // 21:30
function esc(s) {
  return String(s).replace(/[&<>"']/g, c =>
    ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c]);
}
function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
function applyTheme(t) {
  const r = document.documentElement.style;
  r.setProperty('--theme',      t.color);
  r.setProperty('--theme-bg',   t.bg);
  r.setProperty('--theme-grad', t.grad);
}
function avgStars(items) {
  const arr = items.filter(i => i.stars).map(i => i.stars);
  if (!arr.length) return null;
  const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
  return avg % 1 === 0 ? avg : parseFloat(avg.toFixed(1));
}

// ===== 포인트 =====
function loadPoints() {
  if (unsubPoints) { unsubPoints(); unsubPoints = null; }
  const childId = CHILD_IDS[profile];
  unsubPoints = db.collection('points').doc(childId)
    .onSnapshot(snap => {
      pointsData = snap.exists
        ? { total: snap.data().total || 0, history: snap.data().history || [] }
        : { total: 0, history: [] };
      renderPoints();
    }, e => console.error('포인트 로드 실패:', e));
}

function renderPoints() {
  const el = document.getElementById('points-banner');
  if (!el) return;
  el.textContent = `⭐ ${pointsData.total}포인트`;
}

async function checkAndAwardPoints(lastDoneStr) {
  if (!profile || viewDate !== todayKey()) return;
  const lastMin = krTimeToMinutes(lastDoneStr);
  if (lastMin < 0 || lastMin > POINT_CUTOFF_MIN) return;
  if (pointsData.history.some(h => h.date === todayKey())) return; // 빠른 로컬 사전 차단
  const today   = todayKey();
  const childId = CHILD_IDS[profile];
  const ref     = db.collection('points').doc(childId);
  try {
    // 트랜잭션으로 서버 상태를 원자적으로 재확인해 같은 날 중복 적립 방지
    // (다른 화면/기기에서 로컬 캐시가 아직 갱신되지 않은 경쟁 상태 대응)
    await db.runTransaction(async tx => {
      const snap    = await tx.get(ref);
      const data    = snap.exists ? snap.data() : {};
      const history = data.history || [];
      if (history.some(h => h.date === today)) return; // 서버 기준 이미 오늘 적립됨
      tx.set(ref, {
        total:   (data.total || 0) + 1,
        history: [...history, { date: today, earnedAt: lastDoneStr }],
      }, { merge: true });
    });
  } catch (e) { console.error('포인트 적립 실패:', e); }
}

function loadParentPoints() {
  if (unsubParentPointsSihyeon) { unsubParentPointsSihyeon(); unsubParentPointsSihyeon = null; }
  if (unsubParentPointsSion)    { unsubParentPointsSion();    unsubParentPointsSion    = null; }
  ['시현이', '시온이'].forEach(name => {
    const childId = CHILD_IDS[name];
    const unsub = db.collection('points').doc(childId)
      .onSnapshot(snap => {
        parentPointsData[name] = snap.exists
          ? { total: snap.data().total || 0, history: snap.data().history || [], giftCount: snap.data().giftCount || 0, coupons: snap.data().coupons || [] }
          : { total: 0, history: [], giftCount: 0, coupons: [] };
        renderParentPoints();
        // 포인트 변경 시 부모 화면의 기차 맵도 함께 갱신 (점수 라벨과 불일치 방지)
        if (typeof renderParentMapIfVisible === 'function') renderParentMapIfVisible();
        renderEarnedCoupons();
      }, e => console.error(`포인트 로드 실패(${name}):`, e));
    if (name === '시현이') unsubParentPointsSihyeon = unsub;
    else                   unsubParentPointsSion    = unsub;
  });
}

function renderParentPoints() {
  const sihEl = document.getElementById('parent-pts-sihyeon');
  const sionEl = document.getElementById('parent-pts-sion');
  if (sihEl) sihEl.textContent = `${parentPointsData['시현이'].total}포인트`;
  if (sionEl) sionEl.textContent = `${parentPointsData['시온이'].total}포인트`;

  const histEl  = document.getElementById('parent-pts-history');
  const labelEl = document.getElementById('pts-history-label');
  if (!histEl) return;

  const emoji = parentChild === '시현이' ? '🐰' : '🐻';
  if (labelEl) labelEl.textContent = `${emoji} ${parentChild} 최근 7일 내역`;

  const data = parentPointsData[parentChild];
  const rows = [];
  for (let i = 6; i >= 0; i--) {
    const d  = new Date(); d.setDate(d.getDate() - i);
    const ds = dateKey(d);
    const entry  = data.history.find(h => h.date === ds);
    const label  = d.toLocaleDateString('ko-KR', { month:'numeric', day:'numeric', weekday:'short' });
    const isPast = ds < todayKey();
    if (entry) {
      rows.push(`<div class="pts-hist-row earned">
        <span class="pts-hist-date">${label}</span>
        <span class="pts-hist-badge">⭐ +1포인트</span>
        <span class="pts-hist-time">${entry.earnedAt}</span>
      </div>`);
    } else {
      rows.push(`<div class="pts-hist-row ${isPast ? 'missed' : 'today-future'}">
        <span class="pts-hist-date">${label}</span>
        <span class="pts-hist-badge">${isPast ? '미적립' : '진행 중'}</span>
        <span class="pts-hist-time"></span>
      </div>`);
    }
  }
  histEl.innerHTML = rows.join('');
}

async function adjustPoints(childName, delta) {
  const childId = CHILD_IDS[childName];
  if (delta < 0 && (parentPointsData[childName]?.total || 0) <= 0) return;
  try {
    await db.collection('points').doc(childId).set({
      total: firebase.firestore.FieldValue.increment(delta),
    }, { merge: true });
  } catch (e) { console.error('포인트 조정 실패:', e); }
}

// ===== 미션 (아이) =====
function loadMissions() {
  if (unsubMissions) { unsubMissions(); unsubMissions = null; }
  unsubMissions = db.collection('missions').where('child', '==', profile)
    .onSnapshot(snap => {
      missionItems = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (a.createdAt?.toMillis()||0) - (b.createdAt?.toMillis()||0));
      updateMissionBadge();
      if (!document.getElementById('screen-mission').classList.contains('hidden')) renderMissions();
    }, e => console.error('미션 로드 실패:', e));
}

function updateMissionBadge() {
  const badge = document.getElementById('mission-badge');
  if (!badge) return;
  const n = missionItems.filter(m => m.status === 'active').length;
  badge.textContent = n;
  badge.classList.toggle('hidden', n === 0);
}

function openMissionScreen() {
  document.getElementById('screen-main').classList.add('hidden');
  document.getElementById('screen-mission').classList.remove('hidden');
  renderMissions();
}
function closeMissionScreen() {
  document.getElementById('screen-mission').classList.add('hidden');
  document.getElementById('screen-main').classList.remove('hidden');
}

function renderMissions() {
  const listEl  = document.getElementById('mission-list');
  const emptyEl = document.getElementById('mission-empty');
  if (!listEl) return;
  const visible = missionItems.filter(m => m.status === 'active' || m.status === 'pending');
  if (visible.length === 0) {
    listEl.innerHTML = '';
    emptyEl.classList.remove('hidden');
    return;
  }
  emptyEl.classList.add('hidden');
  listEl.innerHTML = visible.map(m => {
    const reward = m.reward || 1;
    const right = m.status === 'pending'
      ? `<span class="mission-pending">승인 대기 중 ⏳</span>`
      : `<button class="mission-done-btn" onclick="completeMission('${m.id}')">완료</button>`;
    return `
      <div class="mission-item${m.status === 'pending' ? ' pending' : ''}">
        <div class="mission-body">
          <div class="mission-title">${esc(m.title)}</div>
          <div class="mission-reward">⭐ ${reward}포인트</div>
        </div>
        ${right}
      </div>`;
  }).join('');
}

async function completeMission(id) {
  try {
    await db.collection('missions').doc(id).update({
      status: 'pending',
      completedAt:      firebase.firestore.FieldValue.serverTimestamp(),
      completedTimeStr: nowTimeStr(),
    });
  } catch (e) { console.error('미션 완료 처리 실패:', e); }
}

// ===== 미션 (부모) =====
function loadParentMissions() {
  if (unsubParentMissions) { unsubParentMissions(); unsubParentMissions = null; }
  unsubParentMissions = db.collection('missions').where('child', '==', parentChild)
    .onSnapshot(snap => {
      parentMissionItems = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (a.createdAt?.toMillis()||0) - (b.createdAt?.toMillis()||0));
      renderParentMissions();
    }, e => console.error('미션 로드 실패(부모):', e));
}

function renderParentMissions() {
  const listEl = document.getElementById('parent-mission-list');
  if (!listEl) return;
  const titleEl = document.getElementById('mission-mgmt-title');
  if (titleEl) titleEl.textContent = `🎯 미션 관리 · ${parentChild === '시현이' ? '🐰' : '🐻'} ${parentChild}`;
  if (parentMissionItems.length === 0) {
    listEl.innerHTML = '<p class="mission-none">등록된 미션이 없어요</p>';
    return;
  }
  const order = { pending: 0, active: 1, done: 2 };
  const sorted = [...parentMissionItems].sort((a, b) => (order[a.status] ?? 9) - (order[b.status] ?? 9));
  listEl.innerHTML = sorted.map(m => {
    const reward = m.reward || 1;
    let right;
    if (m.status === 'pending')   right = `<button class="mission-approve-btn" onclick="approveMission('${m.id}')">승인 ✓</button>`;
    else if (m.status === 'done') right = `<span class="mission-status done">완료됨</span>`;
    else                          right = `<span class="mission-status active">진행 중</span>`;
    return `
      <div class="parent-mission-item status-${m.status}">
        <div class="mission-body">
          <div class="mission-title">${esc(m.title)}</div>
          <div class="mission-reward">⭐ ${reward}</div>
        </div>
        ${right}
        <button class="mission-del-btn" onclick="deleteMission('${m.id}')" aria-label="삭제">🗑️</button>
      </div>`;
  }).join('');
}

async function addMission() {
  const input = document.getElementById('mission-input');
  const title = input.value.trim();
  if (!title) { input.focus(); return; }
  const reward = parseInt(document.getElementById('mission-reward').value, 10) || 1;
  input.value = '';
  try {
    await db.collection('missions').add({
      child: parentChild, title, reward, status: 'active',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
  } catch (e) { console.error('미션 추가 실패:', e); alert('미션 추가에 실패했어요.'); }
}

async function approveMission(id) {
  const missionRef = db.collection('missions').doc(id);
  try {
    // 트랜잭션: 미션 승인 + 포인트 적립을 원자적으로 (중복 적립 방지)
    await db.runTransaction(async tx => {
      const mSnap = await tx.get(missionRef);
      if (!mSnap.exists) return;
      const m = mSnap.data();
      if (m.status === 'done') return; // 이미 승인됨
      const reward  = m.reward || 1;
      const pRef    = db.collection('points').doc(CHILD_IDS[m.child]);
      const pSnap   = await tx.get(pRef);
      const total   = pSnap.exists ? (pSnap.data().total || 0) : 0;
      tx.set(pRef, { total: total + reward }, { merge: true });
      tx.update(missionRef, {
        status: 'done',
        approvedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
    });
  } catch (e) { console.error('미션 승인 실패:', e); alert('승인 처리에 실패했어요.'); }
}

async function deleteMission(id) {
  if (!confirm('이 미션을 삭제할까요? 🗑️')) return;
  try { await db.collection('missions').doc(id).delete(); }
  catch (e) { console.error('미션 삭제 실패:', e); }
}

// ===== 쿠폰 (부모) =====
function loadCouponPool() {
  if (unsubCouponPool) { unsubCouponPool(); unsubCouponPool = null; }
  unsubCouponPool = db.collection('settings').doc('coupons')
    .onSnapshot(snap => {
      couponPool = snap.exists ? (snap.data().pool || []) : [];
      renderCouponPool();
    }, e => console.error('쿠폰 풀 로드 실패:', e));
}

function renderCouponPool() {
  const el = document.getElementById('coupon-pool-list');
  if (!el) return;
  if (couponPool.length === 0) {
    el.innerHTML = '<p class="mission-none">쿠폰을 추가하면 이벤트 칸에서 랜덤 지급돼요</p>';
    return;
  }
  el.innerHTML = couponPool.map((label, i) =>
    `<span class="coupon-chip">${esc(label)}<button class="coupon-chip-del" onclick="removeCoupon(${i})" aria-label="삭제">×</button></span>`
  ).join('');
}

async function addCoupon() {
  const input = document.getElementById('coupon-input');
  const label = input.value.trim();
  if (!label) { input.focus(); return; }
  input.value = '';
  try {
    await db.collection('settings').doc('coupons')
      .set({ pool: firebase.firestore.FieldValue.arrayUnion(label) }, { merge: true });
  } catch (e) { console.error('쿠폰 추가 실패:', e); alert('쿠폰 추가에 실패했어요.'); }
}

async function removeCoupon(index) {
  const label = couponPool[index];
  if (label === undefined) return;
  try {
    await db.collection('settings').doc('coupons')
      .set({ pool: firebase.firestore.FieldValue.arrayRemove(label) }, { merge: true });
  } catch (e) { console.error('쿠폰 삭제 실패:', e); }
}

function renderEarnedCoupons() {
  const el = document.getElementById('coupon-earned-list');
  if (!el) return;
  const labelEl = document.getElementById('coupon-earned-label');
  const emoji = parentChild === '시현이' ? '🐰' : '🐻';
  if (labelEl) labelEl.textContent = `보유 쿠폰 · ${emoji} ${parentChild}`;
  const coupons = (parentPointsData[parentChild] && parentPointsData[parentChild].coupons) || [];
  if (coupons.length === 0) {
    el.innerHTML = '<p class="mission-none">아직 받은 쿠폰이 없어요</p>';
    return;
  }
  el.innerHTML = coupons.map((c, i) =>
    `<div class="coupon-earned-item">
      <span class="coupon-earned-txt">🎟️ ${esc(c.label)}</span>
      <span class="coupon-earned-date">${esc(c.date || '')}</span>
      <button class="coupon-use-btn" onclick="useCoupon(${i})">사용</button>
    </div>`
  ).join('');
}

async function useCoupon(index) {
  const coupons = (((parentPointsData[parentChild] || {}).coupons) || []).slice();
  if (index < 0 || index >= coupons.length) return;
  const c = coupons[index];
  if (!confirm(`'${c.label}' 쿠폰을 사용 처리할까요? (목록에서 사라져요)`)) return;
  coupons.splice(index, 1);
  try {
    await db.collection('points').doc(CHILD_IDS[parentChild]).set({ coupons }, { merge: true });
  } catch (e) { console.error('쿠폰 사용 처리 실패:', e); alert('처리에 실패했어요.'); }
}

// ===== 프로필 선택 =====
function selectProfile(name) {
  profile  = name;
  viewDate = todayKey();
  viewingToday = true;
  const t  = THEMES[name];
  applyTheme(t);
  document.body.style.background = t.bg;
  document.getElementById('hdr-name').textContent = name;
  document.getElementById('date-nav-label').textContent = dateLabelShort(viewDate);
  document.getElementById('screen-profile').classList.add('hidden');
  document.getElementById('screen-main').classList.remove('hidden');
  filter = '전체';
  document.querySelectorAll('.filter-chip').forEach(b => b.classList.remove('active'));
  document.querySelector('.filter-chip[data-subj="전체"]').classList.add('active');
  // 첫 스냅샷 도착 전(연결 핸드셰이크 구간) 빈 화면 대신 스피너 표시
  document.getElementById('empty-state').classList.add('hidden');
  document.getElementById('all-done-state').classList.add('hidden');
  document.getElementById('hw-list').innerHTML = LIST_LOADING_HTML;
  startAllListening();
  loadPoints();
  loadMissions();
}

function goBack() {
  if (unsubFn)       { unsubFn();       unsubFn = null; }
  if (unsubTemplate) { unsubTemplate(); unsubTemplate = null; }
  if (unsubChecks)   { unsubChecks();   unsubChecks = null; }
  if (unsubPoints)   { unsubPoints();   unsubPoints = null; }
  if (unsubMissions) { unsubMissions(); unsubMissions = null; }
  profile = null; hwData = []; templateItems = []; templateChecks = {}; pointsData = { total: 0, history: [] }; missionItems = [];
  document.body.style.background = '';
  document.getElementById('screen-main').classList.add('hidden');
  document.getElementById('screen-template').classList.add('hidden');
  document.getElementById('screen-mission').classList.add('hidden');
  document.getElementById('screen-profile').classList.remove('hidden');
}

// ===== 날짜 이동 =====
function navDate(direction) {
  const d = new Date(viewDate + 'T00:00:00');
  d.setDate(d.getDate() + direction);
  viewDate = dateKey(d);
  viewingToday = (viewDate === todayKey());
  document.getElementById('date-nav-label').textContent = dateLabelShort(viewDate);
  startListening();
}

// ===== 자정 경과 시 viewDate 자동 갱신 =====
// 앱을 켜둔 채(백그라운드) 날짜가 바뀌면 viewDate가 어제로 고정돼,
// 완료 기록이 어제 문서에 저장되고 오늘 화면엔 미완료로 보이는 문제 방지.
function refreshDateIfStale() {
  if (!profile || !viewingToday) return;
  if (document.getElementById('screen-main').classList.contains('hidden')) return;
  const today = todayKey();
  if (viewDate === today) return;
  viewDate = today;
  document.getElementById('date-nav-label').textContent = dateLabelShort(viewDate);
  startListening();
}
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') refreshDateIfStale();
});
window.addEventListener('focus', refreshDateIfStale);

// ===== Firestore 구독 =====
function startAllListening() {
  if (unsubTemplate) unsubTemplate();
  _tmplFired = false;
  unsubTemplate = db.collection('templates').doc(profile)
    .onSnapshot(snap => {
      templateItems = snap.exists ? (snap.data().items || []) : [];
      _tmplFired = true;
      render();
      if (!document.getElementById('screen-template').classList.contains('hidden')) renderTemplate();
    });
  startListening();
}

function startListening() {
  if (unsubFn)     { unsubFn();     unsubFn = null; }
  if (unsubChecks) { unsubChecks(); unsubChecks = null; }
  _hwFired = false; _checksFired = false;

  unsubFn = db.collection('homework')
    .where('child', '==', profile)
    .where('date',  '==', viewDate)
    .onSnapshot(snap => {
      hwData = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (a.createdAt?.toMillis()||0) - (b.createdAt?.toMillis()||0));
      _hwFired = true;
      render();
    }, err => console.error('Firestore 오류:', err));

  unsubChecks = db.collection('dailyChecks').doc(`${profile}_${viewDate}`)
    .onSnapshot(snap => {
      templateChecks = snap.exists ? snap.data() : {};
      _checksFired = true;
      render();
    });
}

// ===== 숙제 CRUD =====
async function toggleDone(id, current) {
  try {
    if (!current) {
      await db.collection('homework').doc(id).update({
        completed: true,
        completedAt:     firebase.firestore.FieldValue.serverTimestamp(),
        completedTimeStr: nowTimeStr(),
      });
    } else {
      await db.collection('homework').doc(id).update({
        completed: false,
        completedAt:      firebase.firestore.FieldValue.delete(),
        completedTimeStr: firebase.firestore.FieldValue.delete(),
        stars:            firebase.firestore.FieldValue.delete(),
      });
    }
  } catch (e) { console.error(e); }
}

async function deleteHw(id) {
  if (!confirm('이 숙제를 삭제할까요? 🗑️')) return;
  try { await db.collection('homework').doc(id).delete(); }
  catch (e) { console.error(e); }
}

async function deleteDayDetailHw(id, dateStr) {
  if (!confirm('정말 삭제할까요? 🗑️')) return;
  try {
    await db.collection('homework').doc(id).delete();
    if (parentHwCache[dateStr]) {
      parentHwCache[dateStr] = parentHwCache[dateStr].filter(h => h.id !== id);
    }
    openDayDetail(dateStr);
  } catch (e) { console.error(e); alert('삭제에 실패했어요.'); }
}

async function hideTmplForDayParent(id, dateStr) {
  if (!confirm('이 반복 숙제를 오늘만 숨길까요? 🗑️')) return;
  try {
    await db.collection('dailyChecks').doc(`${parentChild}_${dateStr}`)
      .set({ [`hidden_${id}`]: true }, { merge: true });
    if (!parentChecksCache[dateStr]) parentChecksCache[dateStr] = {};
    parentChecksCache[dateStr][`hidden_${id}`] = true;
    openDayDetail(dateStr);
  } catch (e) { console.error(e); alert('처리에 실패했어요.'); }
}

async function addHw(title, subject) {
  await db.collection('homework').add({
    child: profile, subject, title, completed: false,
    date: viewDate,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  });
}

// ===== 별점 =====
async function setStars(id, stars, itemType) {
  try {
    if (itemType === 'manual') {
      await db.collection('homework').doc(id).update({ stars });
    } else {
      await db.collection('dailyChecks').doc(`${profile}_${viewDate}`)
        .set({ [`${id}_stars`]: stars }, { merge: true });
    }
  } catch (e) { console.error(e); }
}

// ===== 템플릿 체크 =====
async function toggleTemplateCheck(id, current) {
  try {
    const docRef = db.collection('dailyChecks').doc(`${profile}_${viewDate}`);
    if (!current) {
      await docRef.set({ [id]: true, [`${id}_time`]: nowTimeStr() }, { merge: true });
    } else {
      await docRef.set({
        [id]: false,
        [`${id}_time`]:  firebase.firestore.FieldValue.delete(),
        [`${id}_stars`]: firebase.firestore.FieldValue.delete(),
      }, { merge: true });
    }
  } catch (e) { console.error(e); }
}

function hideTmplForDay(id) {
  if (!confirm('오늘만 이 항목을 숨길까요? 내일부터 다시 표시돼요.')) return;
  db.collection('dailyChecks').doc(`${profile}_${viewDate}`)
    .set({ [`hidden_${id}`]: true }, { merge: true })
    .catch(e => console.error(e));
}

// ===== 렌더링 =====
function renderStars(id, stars, itemType, disabled) {
  const btns = [1,2,3].map(n =>
    `<button class="star-btn${(stars||0) >= n ? ' on' : ''}"
             ${disabled ? '' : `onclick="setStars('${id}',${n},'${itemType}')"`}
             aria-label="별 ${n}개">★</button>`
  ).join('');
  const feedback = stars
    ? `<span class="star-feedback">${STAR_FEEDBACK[stars]}</span>`
    : `<span class="star-hint">평가해보세요</span>`;
  return `<div class="hw-stars${disabled ? ' disabled' : ''}">${btns}${feedback}</div>`;
}

function render() {
  const viewDow = new Date(viewDate + 'T00:00:00').getDay();
  const isWeekend = viewDow === 0 || viewDow === 6;
  const merged = [
    ...hwData.map(h => ({ ...h, itemType: 'manual' })),
    ...templateItems
      .filter(t => !templateChecks[`hidden_${t.id}`] && !(isWeekend && t.weekendSkip))
      .map(t => ({
        id: t.id, itemType: 'template',
        subject: t.subject, title: t.title,
        completed:        templateChecks[t.id] || false,
        completedTimeStr: templateChecks[`${t.id}_time`] || null,
        stars:            templateChecks[`${t.id}_stars`] || null,
      })),
  ];

  const total   = merged.length;
  const done    = merged.filter(h => h.completed).length;
  const pct     = total > 0 ? Math.round(done / total * 100) : 0;
  const moodIdx = Math.round((done / Math.max(total, 1)) * (MOOD_EMOJI.length - 1));

  document.getElementById('cnt-done').textContent  = done;
  document.getElementById('cnt-total').textContent = total;
  document.getElementById('prog-fill').style.width  = pct + '%';
  document.getElementById('prog-pct').textContent   = pct + '%';
  document.getElementById('prog-mood').textContent  = MOOD_EMOJI[moodIdx];

  const visible   = filter === '전체' ? merged : merged.filter(h => h.subject === filter);
  const listEl    = document.getElementById('hw-list');
  const emptyEl   = document.getElementById('empty-state');
  const allDoneEl = document.getElementById('all-done-state');
  const emptyText = document.getElementById('empty-text');

  allDoneEl.classList.toggle('hidden', !(done === total && total > 0));
  if (done === total && total > 0 && viewDate === todayKey()) {
    const times = merged
      .filter(h => h.completed)
      .map(h => h.completedTimeStr || (h.completedAt ? formatTime(h.completedAt) : null));
    if (times.every(t => krTimeToMinutes(t) >= 0)) {
      const lastDoneStr = times.reduce((a, b) => krTimeToMinutes(b) > krTimeToMinutes(a) ? b : a);
      checkAndAwardPoints(lastDoneStr);
    }
  }

  if (visible.length === 0) {
    listEl.innerHTML = '';
    // 첫 데이터(템플릿/숙제/체크)가 모두 도착하기 전이면 빈 메시지 대신 스피너
    if (!(_tmplFired && _hwFired && _checksFired)) {
      emptyEl.classList.add('hidden');
      listEl.innerHTML = LIST_LOADING_HTML;
      return;
    }
    emptyEl.classList.remove('hidden');
    emptyText.innerHTML = total === 0
      ? '숙제가 없어요!<br><small>+ 버튼으로 추가해보세요 🎒</small>'
      : `<b>${filter}</b> 숙제가 없어요!<br><small>다른 과목을 선택해보세요</small>`;
    return;
  }
  emptyEl.classList.add('hidden');

  listEl.innerHTML = visible.map(h => {
    const onCheck = h.itemType === 'template'
      ? `toggleTemplateCheck('${h.id}', ${h.completed})`
      : `toggleDone('${h.id}', ${h.completed})`;
    const rightEl = '';

    const timeStr = h.completedTimeStr || (h.itemType === 'manual' ? formatTime(h.completedAt) : '');
    const timeLine = h.completed && timeStr
      ? `<div class="hw-meta">${timeStr} 완료 ✓</div>`
      : '';
    const starLine = renderStars(h.id, h.stars, h.itemType, !h.completed);

    return `
      <div class="hw-item ${h.completed ? 'done' : ''}" id="hw-${h.id}">
        <button class="check-btn" onclick="${onCheck}" aria-label="${h.completed?'완료 취소':'완료 체크'}">
          ${h.completed ? '✓' : ''}
        </button>
        <div class="hw-body">
          <div class="hw-subj">${SUBJ_EMOJI[h.subject]||''} ${esc(h.subject)}${h.itemType==='template'?' <span class="repeat-badge"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg></span>':''}</div>
          <div class="hw-title">${esc(h.title)}</div>
          ${timeLine}
        </div>
        ${rightEl}
        ${starLine}
      </div>`;
  }).join('');
}

// ===== 과목 필터 =====
function setFilter(subj, btn) {
  filter = subj;
  document.querySelectorAll('.filter-chip').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  render();
}

// ===== 모달 — 숙제 추가 =====
function openModal() {
  document.getElementById('hw-input').value = '';
  document.getElementById('hw-input').classList.remove('shake');
  newSubj = '수학';
  document.querySelectorAll('.subj-btn').forEach(b => b.classList.remove('active'));
  document.querySelector('.subj-btn[data-s="수학"]').classList.add('active');
  document.getElementById('btn-add').disabled    = false;
  document.getElementById('btn-add').textContent = '추가하기';
  document.getElementById('overlay').classList.add('on');
  document.getElementById('modal').classList.add('on');
  setTimeout(() => document.getElementById('hw-input').focus(), 380);
}
function closeModal() {
  const btn = document.getElementById('btn-add');
  btn.disabled = false; btn.textContent = '추가하기';
  document.getElementById('overlay').classList.remove('on');
  document.getElementById('modal').classList.remove('on');
}
function pickSubj(btn) {
  newSubj = btn.dataset.s;
  document.querySelectorAll('.subj-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}
function submitHw() {
  const input = document.getElementById('hw-input');
  const title = input.value.trim();
  if (!title) {
    input.classList.remove('shake'); void input.offsetWidth; input.classList.add('shake');
    input.focus(); return;
  }
  closeModal();
  addHw(title, newSubj).catch(e => { console.error(e); alert('숙제 추가에 실패했어요.'); });
}

// ===== 템플릿 화면 =====
let tmplSubj = '수학';
let tmplWeekendSkip = false;
let tmplEditId = null;
function openTemplate() {
  document.getElementById('screen-main').classList.add('hidden');
  document.getElementById('screen-template').classList.remove('hidden');
  renderTemplate();
}
function closeTemplate() {
  document.getElementById('screen-template').classList.add('hidden');
  document.getElementById('screen-main').classList.remove('hidden');
}
function renderTemplate() {
  const listEl  = document.getElementById('tmpl-list');
  const emptyEl = document.getElementById('tmpl-empty');
  if (templateItems.length === 0) { listEl.innerHTML = ''; emptyEl.classList.remove('hidden'); return; }
  emptyEl.classList.add('hidden');
  listEl.innerHTML = templateItems.map((t, idx) => `
    <div class="hw-item" id="tmpl-item-${t.id}">
      <span class="tmpl-order">${idx + 1}</span>
      <div class="hw-body">
        <div class="hw-subj">${SUBJ_EMOJI[t.subject]||''} ${esc(t.subject)}</div>
        <div class="hw-title">${esc(t.title)}</div>
      </div>
      <button class="tmpl-weekend-btn${t.weekendSkip ? ' skip' : ''}" onclick="toggleWeekendSkip('${t.id}')" title="${t.weekendSkip ? '평일만 표시 중' : '매일 표시 중'}">${t.weekendSkip ? '평일만' : '매일'}</button>
      <button class="edit-btn" onclick="openTmplEditModal('${t.id}')" aria-label="수정">✏️</button>
      <button class="del-btn" onclick="deleteTmplItem('${t.id}')" aria-label="삭제">🗑️</button>
    </div>`).join('');
}
function toggleWeekendSkip(id) {
  const updated = templateItems.map(t =>
    t.id === id ? { ...t, weekendSkip: !t.weekendSkip } : t
  );
  db.collection('templates').doc(profile)
    .set({ items: updated })
    .catch(e => console.error(e));
}
async function deleteTmplItem(id) {
  if (!confirm('이 반복 숙제를 삭제할까요? 🗑️')) return;
  try { await db.collection('templates').doc(profile).set({ items: templateItems.filter(t => t.id !== id) }); }
  catch (e) { console.error(e); alert('삭제에 실패했어요.'); }
}

// ===== 모달 — 템플릿 추가 =====
function openTmplModal() {
  document.getElementById('tmpl-input').value = '';
  document.getElementById('tmpl-input').classList.remove('shake');
  tmplSubj = '수학';
  tmplWeekendSkip = false;
  document.querySelectorAll('.tmpl-subj-btn').forEach(b => b.classList.remove('active'));
  document.querySelector('.tmpl-subj-btn[data-s="수학"]').classList.add('active');
  const wBtn = document.getElementById('btn-weekend-toggle');
  wBtn.classList.remove('skip'); wBtn.textContent = '주말 포함';
  document.getElementById('btn-add-tmpl').disabled    = false;
  document.getElementById('btn-add-tmpl').textContent = '추가하기';
  document.getElementById('overlay-tmpl').classList.add('on');
  document.getElementById('modal-tmpl').classList.add('on');
  setTimeout(() => document.getElementById('tmpl-input').focus(), 380);
}
function toggleTmplWeekend() {
  tmplWeekendSkip = !tmplWeekendSkip;
  const btn = document.getElementById('btn-weekend-toggle');
  btn.classList.toggle('skip', tmplWeekendSkip);
  btn.textContent = tmplWeekendSkip ? '평일만' : '주말 포함';
}
function closeTmplModal() {
  tmplEditId = null;
  document.getElementById('overlay-tmpl').classList.remove('on');
  document.getElementById('modal-tmpl').classList.remove('on');
}
function openTmplEditModal(id) {
  const item = templateItems.find(t => t.id === id);
  if (!item) return;
  tmplEditId = id;
  document.getElementById('tmpl-input').value = item.title;
  document.getElementById('tmpl-input').classList.remove('shake');
  tmplSubj = item.subject || '수학';
  tmplWeekendSkip = item.weekendSkip || false;
  document.querySelectorAll('.tmpl-subj-btn').forEach(b => b.classList.remove('active'));
  const subBtn = document.querySelector(`.tmpl-subj-btn[data-s="${tmplSubj}"]`);
  if (subBtn) subBtn.classList.add('active');
  const wBtn = document.getElementById('btn-weekend-toggle');
  wBtn.classList.toggle('skip', tmplWeekendSkip);
  wBtn.textContent = tmplWeekendSkip ? '평일만' : '주말 포함';
  document.getElementById('btn-add-tmpl').disabled = false;
  document.getElementById('btn-add-tmpl').textContent = '수정하기';
  document.getElementById('overlay-tmpl').classList.add('on');
  document.getElementById('modal-tmpl').classList.add('on');
  setTimeout(() => document.getElementById('tmpl-input').focus(), 380);
}
function pickTmplSubj(btn) {
  tmplSubj = btn.dataset.s;
  document.querySelectorAll('.tmpl-subj-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}
function submitTmpl() {
  const input = document.getElementById('tmpl-input');
  const title = input.value.trim();
  if (!title) {
    input.classList.remove('shake'); void input.offsetWidth; input.classList.add('shake');
    input.focus(); return;
  }
  const editId = tmplEditId;
  closeTmplModal();
  if (editId) {
    const updated = templateItems.map(t =>
      t.id === editId ? { ...t, subject: tmplSubj, title, weekendSkip: tmplWeekendSkip } : t
    );
    db.collection('templates').doc(profile)
      .set({ items: updated })
      .catch(e => { console.error(e); alert('반복 숙제 수정에 실패했어요.'); });
  } else {
    db.collection('templates').doc(profile)
      .set({ items: [...templateItems, { id: genId(), subject: tmplSubj, title, weekendSkip: tmplWeekendSkip }] })
      .catch(e => { console.error(e); alert('반복 숙제 추가에 실패했어요.'); });
  }
}

// ===== PIN =====
let pinBuffer     = '';
let pinMode       = 'verify';
let pinSetupFirst = '';
let pinTarget     = 'parent';
let pinStoredVal  = null;
const childPinsCache = {};
let parentPinCache = null;
const CHILD_IDS = { '시현이': 'sihyeon', '시온이': 'sion' };
let pinsLoadedDone = false;
let pinsLoadedResolve;
const pinsLoaded = new Promise(r => { pinsLoadedResolve = r; });

async function openPinModal() {
  pinTarget = 'parent';
  pinBuffer = ''; pinSetupFirst = '';
  document.getElementById('pin-title').textContent = '🔒 부모 확인';
  if (!pinsLoadedDone) {
    document.getElementById('pin-hint').textContent = 'PIN 확인 중…';
    updatePinDots();
    document.getElementById('overlay-pin').classList.add('on');
    document.getElementById('modal-pin').classList.add('on');
    await Promise.race([pinsLoaded, new Promise(r => setTimeout(r, 3000))]);
    pinsLoadedDone = true;
  }
  pinStoredVal = parentPinCache;
  pinMode = pinStoredVal ? 'verify' : 'setup1';
  document.getElementById('pin-hint').textContent = pinStoredVal ? 'PIN 번호를 입력해주세요' : '새 PIN을 설정해주세요 (4자리)';
  updatePinDots();
  document.getElementById('overlay-pin').classList.add('on');
  document.getElementById('modal-pin').classList.add('on');
}
async function openChildPinModal(childName) {
  pinTarget = childName;
  pinBuffer = ''; pinSetupFirst = '';
  document.getElementById('pin-title').textContent = `🔒 ${childName} 확인`;
  if (!pinsLoadedDone) {
    document.getElementById('pin-hint').textContent = 'PIN 확인 중…';
    updatePinDots();
    document.getElementById('overlay-pin').classList.add('on');
    document.getElementById('modal-pin').classList.add('on');
    await Promise.race([pinsLoaded, new Promise(r => setTimeout(r, 3000))]);
    pinsLoadedDone = true;
  }
  pinStoredVal = childPinsCache[childName] ?? null;
  pinMode = pinStoredVal ? 'verify' : 'setup1';
  document.getElementById('pin-hint').textContent = pinStoredVal ? 'PIN 번호를 입력해주세요' : '새 PIN을 설정해주세요 (4자리)';
  updatePinDots();
  document.getElementById('overlay-pin').classList.add('on');
  document.getElementById('modal-pin').classList.add('on');
}
function cancelPin() {
  document.getElementById('overlay-pin').classList.remove('on');
  document.getElementById('modal-pin').classList.remove('on');
  pinBuffer = '';
}
function pinInput(digit) {
  if (pinBuffer.length >= 4) return;
  pinBuffer += digit;
  updatePinDots();
  if (pinBuffer.length === 4) setTimeout(handlePinComplete, 120);
}
function pinBackspace() {
  pinBuffer = pinBuffer.slice(0, -1);
  updatePinDots();
}
function updatePinDots() {
  document.querySelectorAll('.pin-dot').forEach((dot, i) =>
    dot.classList.toggle('filled', i < pinBuffer.length));
}
function handlePinComplete() {
  if (pinMode === 'setup1') {
    pinSetupFirst = pinBuffer; pinBuffer = ''; pinMode = 'setup2';
    document.getElementById('pin-hint').textContent = 'PIN을 한 번 더 입력해주세요';
    updatePinDots();
    return;
  }
  if (pinMode === 'verify') {
    if (pinBuffer === pinStoredVal) {
      cancelPin();
      pinTarget === 'parent' ? openParentView() : selectProfile(pinTarget);
    } else {
      document.getElementById('pin-dots').classList.add('shake');
      document.getElementById('pin-hint').textContent = '틀렸어요. 다시 입력해주세요';
      setTimeout(() => {
        document.getElementById('pin-dots').classList.remove('shake');
        document.getElementById('pin-hint').textContent = 'PIN 번호를 입력해주세요';
        pinBuffer = ''; updatePinDots();
      }, 600);
    }
  } else { // setup2
    if (pinBuffer === pinSetupFirst) {
      if (pinTarget === 'parent') {
        parentPinCache = pinBuffer;
        db.collection('parentPin').doc('main').set({ pin: pinBuffer });
      } else {
        childPinsCache[pinTarget] = pinBuffer;
        db.collection('settings').doc('pins').set({ [CHILD_IDS[pinTarget]]: pinBuffer }, { merge: true });
      }
      cancelPin();
      pinTarget === 'parent' ? openParentView() : selectProfile(pinTarget);
    } else {
      document.getElementById('pin-dots').classList.add('shake');
      document.getElementById('pin-hint').textContent = '일치하지 않아요. 처음부터 다시 입력해주세요';
      setTimeout(() => {
        document.getElementById('pin-dots').classList.remove('shake');
        pinBuffer = ''; pinSetupFirst = ''; pinMode = 'setup1';
        document.getElementById('pin-hint').textContent = '새 PIN을 설정해주세요 (4자리)';
        updatePinDots();
      }, 600);
    }
  }
}
async function resetChildPin(childName) {
  if (!confirm(`${childName}의 PIN을 초기화할까요?`)) return;
  try {
    await db.collection('settings').doc('pins').set(
      { [CHILD_IDS[childName]]: firebase.firestore.FieldValue.delete() }, { merge: true }
    );
    childPinsCache[childName] = null;
    alert(`${childName}의 PIN이 초기화되었어요.`);
  } catch (e) { console.error(e); alert('초기화에 실패했어요.'); }
}
function preloadChildPins() {
  // 아이 PIN: settings/pins 문서에서 sihyeon, sion 필드로 읽기
  const childPromise = db.collection('settings').doc('pins').get()
    .then(snap => {
      const data = snap.exists ? snap.data() : {};
      childPinsCache['시현이'] = data.sihyeon || null;
      childPinsCache['시온이'] = data.sion    || null;
    })
    .catch(() => {
      childPinsCache['시현이'] = null;
      childPinsCache['시온이'] = null;
    });

  // 부모 PIN: Firestore 우선, 없으면 localStorage에서 자동 마이그레이션
  const parentPromise = db.collection('parentPin').doc('main').get()
    .then(snap => {
      if (snap.exists) {
        parentPinCache = snap.data().pin;
        localStorage.removeItem('hw_parent_pin');
      } else {
        const local = localStorage.getItem('hw_parent_pin');
        if (local) {
          parentPinCache = local;
          db.collection('parentPin').doc('main').set({ pin: local })
            .then(() => localStorage.removeItem('hw_parent_pin'))
            .catch(() => {});
        }
      }
    })
    .catch(() => { parentPinCache = localStorage.getItem('hw_parent_pin'); });

  Promise.all([childPromise, parentPromise]).then(() => { pinsLoadedDone = true; pinsLoadedResolve(); });
}

// ===== 부모 화면 =====
let parentChild   = '시현이';
let calYear       = 0;
let calMonth      = 0;
let parentHwCache      = {};
let unsubParent        = null;
let unsubChecksParent  = null;
let parentTmplItems    = [];
let parentChecksCache  = {};
let monthChecksPromise = Promise.resolve();

function openParentView() {
  const now = new Date();
  calYear = now.getFullYear(); calMonth = now.getMonth() + 1;
  parentChild = '시현이';
  document.getElementById('screen-profile').classList.add('hidden');
  document.getElementById('screen-parent').classList.remove('hidden');
  updateParentChildTabs();
  loadCalendarData();
  loadParentPoints();
  loadParentMissions();
  loadCouponPool();
}
function closeParentView() {
  if (unsubParent)             { unsubParent();             unsubParent             = null; }
  if (unsubChecksParent)       { unsubChecksParent();       unsubChecksParent       = null; }
  if (unsubParentPointsSihyeon){ unsubParentPointsSihyeon();unsubParentPointsSihyeon= null; }
  if (unsubParentPointsSion)   { unsubParentPointsSion();   unsubParentPointsSion   = null; }
  if (unsubParentMissions)     { unsubParentMissions();     unsubParentMissions     = null; }
  if (unsubCouponPool)         { unsubCouponPool();         unsubCouponPool         = null; }
  document.getElementById('screen-parent').classList.add('hidden');
  document.getElementById('screen-profile').classList.remove('hidden');
}
function setParentChild(name) {
  parentChild = name;
  updateParentChildTabs();
  loadCalendarData();
  renderParentPoints();
  loadParentMissions();
  renderEarnedCoupons();
}
function updateParentChildTabs() {
  document.querySelectorAll('.parent-child-tab').forEach(b =>
    b.classList.toggle('active', b.dataset.child === parentChild));
  applyTheme(THEMES[parentChild]);
}

function loadCalendarData() {
  if (unsubParent)       { unsubParent();       unsubParent       = null; }
  if (unsubChecksParent) { unsubChecksParent(); unsubChecksParent = null; }
  parentHwCache = {}; parentTmplItems = []; parentChecksCache = {};
  renderCalendar();
  unsubParent = db.collection('homework').where('child', '==', parentChild)
    .onSnapshot(snap => {
      parentHwCache = {};
      snap.docs.forEach(d => {
        const data = d.data();
        if (!parentHwCache[data.date]) parentHwCache[data.date] = [];
        parentHwCache[data.date].push({ id: d.id, ...data });
      });
      renderCalendar();
    }, e => console.error('캘린더 로드 실패:', e));
  loadMonthChecks();
}

function loadMonthChecks() {
  if (unsubChecksParent) { unsubChecksParent(); unsubChecksParent = null; }
  const yr = calYear, mo = calMonth, child = parentChild;
  const mm = `${yr}-${String(mo).padStart(2,'0')}`;
  const nextMo = mo === 12 ? 1 : mo + 1;
  const nextYr = mo === 12 ? yr + 1 : yr;
  const nextMm = `${nextYr}-${String(nextMo).padStart(2,'0')}`;

  let resolved = false;
  monthChecksPromise = new Promise(resolve => {
    db.collection('templates').doc(child).get().then(tmplSnap => {
      if (calYear !== yr || calMonth !== mo || parentChild !== child) { if (!resolved) { resolved = true; resolve(); } return; }
      parentTmplItems = tmplSnap.exists ? (tmplSnap.data().items || []) : [];
      unsubChecksParent = db.collection('dailyChecks')
        .where(firebase.firestore.FieldPath.documentId(), '>=', `${child}_${mm}-01`)
        .where(firebase.firestore.FieldPath.documentId(), '<',  `${child}_${nextMm}-01`)
        .onSnapshot(checksSnap => {
          if (calYear !== yr || calMonth !== mo || parentChild !== child) return;
          parentChecksCache = {};
          checksSnap.docs.forEach(d => {
            parentChecksCache[d.id.slice(child.length + 1)] = d.data();
          });
          if (!resolved) { resolved = true; resolve(); }
          renderCalendar();
        }, e => { console.error('dailyChecks 로드 실패:', e); if (!resolved) { resolved = true; resolve(); } });
    }).catch(e => { console.error('템플릿 로드 실패:', e); if (!resolved) { resolved = true; resolve(); } });
  });
}

function navCalendar(dir) {
  calMonth += dir;
  if (calMonth > 12) { calMonth = 1; calYear++; }
  if (calMonth < 1)  { calMonth = 12; calYear--; }
  parentTmplItems = []; parentChecksCache = {};
  renderCalendar();
  loadMonthChecks();
}

function renderCalendar() {
  const y = calYear, m = calMonth;
  document.getElementById('cal-month-label').textContent = `${y}년 ${m}월`;
  const firstWeekday = new Date(y, m - 1, 1).getDay();
  const lastDate     = new Date(y, m, 0).getDate();
  const today        = todayKey();

  let html = '<div class="cal-weekdays">';
  ['일','월','화','수','목','금','토'].forEach(d => html += `<span>${d}</span>`);
  html += '</div><div class="cal-grid">';

  for (let i = 0; i < firstWeekday; i++) html += '<div class="cal-cell empty"></div>';

  for (let date = 1; date <= lastDate; date++) {
    const ds       = `${y}-${String(m).padStart(2,'0')}-${String(date).padStart(2,'0')}`;
    const hw       = parentHwCache[ds] || [];
    const checks   = parentChecksCache[ds] || {};
    const calDow   = new Date(ds + 'T00:00:00').getDay();
    const calIsWe  = calDow === 0 || calDow === 6;
    const tmplVisible = parentTmplItems.filter(t => !(calIsWe && t.weekendSkip) && !checks[`hidden_${t.id}`]);
    const tmplDone = tmplVisible.filter(t => checks[t.id] === true).length;
    const tot      = hw.length + tmplVisible.length;
    const don      = hw.filter(h => h.completed).length + tmplDone;
    const isFuture = ds > today;
    const avg      = avgStars([
      ...hw,
      ...tmplVisible.map(t => ({ stars: checks[`${t.id}_stars`] || null })),
    ]);

    let doneBadge = '';
    if (tot > 0 && !isFuture) {
      doneBadge = don === tot
        ? '<span class="cal-star">🌟</span>'
        : `<span class="cal-pct">${Math.round(don/tot*100)}%</span>`;
    }
    const starBadge = avg && !isFuture
      ? `<span class="cal-avg-stars">⭐${avg}</span>`
      : '';

    html += `<div class="cal-cell${ds===today?' today':''}${hw.length>0?' has-hw':''}" onclick="openDayDetail('${ds}')">
      <span class="cal-date-num">${date}</span>
      <div class="cal-badges">${doneBadge}${starBadge}</div>
    </div>`;
  }
  html += '</div>';
  document.getElementById('cal-grid-wrap').innerHTML = html;
}

async function openDayDetail(dateStr) {
  // 즉시 팝업 오픈 + 스피너
  const d = new Date(dateStr + 'T00:00:00');
  document.getElementById('daydetail-date').textContent =
    d.toLocaleDateString('ko-KR', { year:'numeric', month:'long', day:'numeric', weekday:'short' });
  document.getElementById('daydetail-summary').textContent = '';
  document.getElementById('daydetail-list').innerHTML =
    '<div class="daydetail-loading"><span class="daydetail-spinner"></span>불러오는 중…</div>';
  document.getElementById('overlay-daydetail').classList.add('on');
  document.getElementById('modal-daydetail').classList.add('on');

  // 최대 3초 대기 후 부분 데이터라도 표시
  await Promise.race([monthChecksPromise, new Promise(r => setTimeout(r, 3000))]);

  const hw = parentHwCache[dateStr] || [];
  const detailDow = new Date(dateStr + 'T00:00:00').getDay();
  const detailIsWeekend = detailDow === 0 || detailDow === 6;
  const tmplChecks = parentChecksCache[dateStr] || {};
  const tmplForChild = parentTmplItems.filter(t => !(detailIsWeekend && t.weekendSkip) && !tmplChecks[`hidden_${t.id}`]);

  const allItems = [
    ...hw.map(h => ({
      id: h.id, title: h.title, subject: h.subject, completed: h.completed, type: 'manual',
      completedAt: h.completedAt, completedTimeStr: h.completedTimeStr || null, stars: h.stars || null,
    })),
    ...tmplForChild.map(t => ({
      id: t.id, title: t.title, subject: t.subject,
      completed:        tmplChecks[t.id] || false, type: 'template',
      completedTimeStr: tmplChecks[`${t.id}_time`] || null,
      stars:            tmplChecks[`${t.id}_stars`] || null,
    })),
  ];

  const tot    = allItems.length;
  const don    = allItems.filter(i => i.completed).length;
  const avg    = avgStars(allItems);
  const starStr = avg ? ` · 평균 ⭐${avg}` : '';
  document.getElementById('daydetail-summary').textContent =
    tot > 0 ? `${don} / ${tot} 완료${starStr}` : '이날 숙제가 없어요';

  document.getElementById('daydetail-list').innerHTML = allItems.length === 0
    ? '<p class="daydetail-empty">기록이 없어요</p>'
    : allItems.map(item => {
        const timeStr = item.completedTimeStr || (item.type === 'manual' ? formatTime(item.completedAt) : '');
        const timeLine = item.completed && timeStr
          ? `<div class="hw-meta">${timeStr} 완료 ✓</div>`
          : '';
        const starLine = item.stars
          ? `<div class="daydetail-stars">${'★'.repeat(item.stars)}${'☆'.repeat(3-item.stars)} ${STAR_FEEDBACK[item.stars]}</div>`
          : '';
        return `
          <div class="daydetail-item${item.completed?' done':''}">
            <span class="daydetail-check">${item.completed?'✓':'○'}</span>
            <div style="flex:1;min-width:0">
              <div class="hw-subj">${SUBJ_EMOJI[item.subject]||''} ${esc(item.subject)}${item.type==='template'?' <span class="repeat-badge"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg></span>':''}</div>
              <div class="hw-title">${esc(item.title)}</div>
              ${timeLine}
              ${starLine}
            </div>
            ${item.type === 'manual'
              ? `<button class="del-btn" onclick="deleteDayDetailHw('${item.id}','${dateStr}')" aria-label="삭제">🗑️</button>`
              : `<button class="del-btn" onclick="hideTmplForDayParent('${item.id}','${dateStr}')" aria-label="오늘 숨기기">🗑️</button>`}
          </div>`;
      }).join('');
}
function closeDayDetail() {
  document.getElementById('overlay-daydetail').classList.remove('on');
  document.getElementById('modal-daydetail').classList.remove('on');
}

// ===== Service Worker =====
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
    navigator.serviceWorker.addEventListener('message', e => {
      if (e.data?.type === 'SW_UPDATED') window.location.reload();
    });
  });
}

preloadChildPins();
