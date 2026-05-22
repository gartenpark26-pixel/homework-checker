'use strict';

const db = firebase.firestore();

// ===== 상태 =====
let profile        = null;
let filter         = '전체';
let newSubj        = '수학';
let viewDate       = '';
let hwData         = [];
let templateItems  = [];
let templateChecks = {};
let unsubFn        = null;
let unsubTemplate  = null;
let unsubChecks    = null;

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

const SUBJ_EMOJI = { '수학':'📐', '국어':'📖', '영어':'🔤', '기타':'✏️' };
const MOOD_EMOJI = ['🌱','🌿','⭐','🌟','🏆','🎉'];

// ===== 유틸 =====
function dateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function todayKey() { return dateKey(new Date()); }
function offsetDate(days) {
  const d = new Date(); d.setDate(d.getDate() + days); return dateKey(d);
}
function dateLabelShort(dateStr) {
  const today     = todayKey();
  const yesterday = offsetDate(-1);
  const tomorrow  = offsetDate(1);
  const d = new Date(dateStr + 'T00:00:00');
  const formatted = d.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' });
  if (dateStr === today)     return `오늘 · ${formatted}`;
  if (dateStr === yesterday) return `어제 · ${formatted}`;
  if (dateStr === tomorrow)  return `내일 · ${formatted}`;
  return formatted;
}
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

// ===== 프로필 선택 =====
function selectProfile(name) {
  profile  = name;
  viewDate = todayKey();
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
  startAllListening();
}

function goBack() {
  if (unsubFn)       { unsubFn();       unsubFn = null; }
  if (unsubTemplate) { unsubTemplate(); unsubTemplate = null; }
  if (unsubChecks)   { unsubChecks();   unsubChecks = null; }
  profile = null; hwData = []; templateItems = []; templateChecks = {};
  document.body.style.background = '';
  document.getElementById('screen-main').classList.add('hidden');
  document.getElementById('screen-template').classList.add('hidden');
  document.getElementById('screen-profile').classList.remove('hidden');
}

// ===== 날짜 이동 =====
function navDate(direction) {
  const d = new Date(viewDate + 'T00:00:00');
  d.setDate(d.getDate() + direction);
  viewDate = dateKey(d);
  document.getElementById('date-nav-label').textContent = dateLabelShort(viewDate);
  startListening();
}

// ===== Firestore 구독 =====
function startAllListening() {
  if (unsubTemplate) unsubTemplate();
  unsubTemplate = db.collection('templates').doc(profile)
    .onSnapshot(snap => {
      templateItems = snap.exists ? (snap.data().items || []) : [];
      render();
      if (!document.getElementById('screen-template').classList.contains('hidden')) renderTemplate();
    });
  startListening();
}

function startListening() {
  if (unsubFn)     { unsubFn();     unsubFn = null; }
  if (unsubChecks) { unsubChecks(); unsubChecks = null; }

  unsubFn = db.collection('homework')
    .where('child', '==', profile)
    .where('date',  '==', viewDate)
    .onSnapshot(snap => {
      hwData = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (a.createdAt?.toMillis()||0) - (b.createdAt?.toMillis()||0));
      render();
    }, err => console.error('Firestore 오류:', err));

  unsubChecks = db.collection('dailyChecks').doc(`${profile}_${viewDate}`)
    .onSnapshot(snap => {
      templateChecks = snap.exists ? snap.data() : {};
      render();
    });
}

// ===== 숙제 CRUD =====
async function toggleDone(id, current) {
  try { await db.collection('homework').doc(id).update({ completed: !current }); }
  catch (e) { console.error(e); }
}
async function deleteHw(id) {
  if (!confirm('이 숙제를 삭제할까요? 🗑️')) return;
  try { await db.collection('homework').doc(id).delete(); }
  catch (e) { console.error(e); }
}
async function addHw(title, subject) {
  await db.collection('homework').add({
    child: profile, subject, title, completed: false,
    date: viewDate,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  });
}

// ===== 템플릿 체크 =====
async function toggleTemplateCheck(id, current) {
  try {
    await db.collection('dailyChecks').doc(`${profile}_${viewDate}`)
      .set({ [id]: !current }, { merge: true });
  } catch (e) { console.error(e); }
}

// ===== 렌더링 =====
function render() {
  const merged = [
    ...hwData.map(h => ({ ...h, itemType: 'manual' })),
    ...templateItems.map(t => ({
      id: t.id, itemType: 'template',
      subject: t.subject, title: t.title,
      completed: templateChecks[t.id] || false,
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

  if (visible.length === 0) {
    listEl.innerHTML = '';
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
    const rightEl = h.itemType === 'manual'
      ? `<button class="del-btn" onclick="deleteHw('${h.id}')" aria-label="삭제">🗑️</button>`
      : `<span class="repeat-badge" title="반복 숙제">🔁</span>`;
    return `
      <div class="hw-item ${h.completed ? 'done' : ''}" id="hw-${h.id}">
        <button class="check-btn" onclick="${onCheck}" aria-label="${h.completed?'완료 취소':'완료 체크'}">
          ${h.completed ? '✓' : ''}
        </button>
        <div class="hw-body">
          <div class="hw-subj">${SUBJ_EMOJI[h.subject]||''} ${esc(h.subject)}</div>
          <div class="hw-title">${esc(h.title)}</div>
        </div>
        ${rightEl}
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
  document.getElementById('overlay').classList.remove('on');
  document.getElementById('modal').classList.remove('on');
}
function pickSubj(btn) {
  newSubj = btn.dataset.s;
  document.querySelectorAll('.subj-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}
async function submitHw() {
  const input = document.getElementById('hw-input');
  const title = input.value.trim();
  if (!title) {
    input.classList.remove('shake'); void input.offsetWidth; input.classList.add('shake');
    input.focus(); return;
  }
  const btn = document.getElementById('btn-add');
  btn.disabled = true; btn.textContent = '추가 중…';
  try { await addHw(title, newSubj); closeModal(); }
  catch (e) {
    console.error(e); alert('숙제 추가에 실패했어요.');
    btn.disabled = false; btn.textContent = '추가하기';
  }
}

// ===== 템플릿 화면 =====
let tmplSubj = '수학';
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
      <button class="del-btn" onclick="deleteTmplItem('${t.id}')" aria-label="삭제">🗑️</button>
    </div>`).join('');
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
  document.querySelectorAll('.tmpl-subj-btn').forEach(b => b.classList.remove('active'));
  document.querySelector('.tmpl-subj-btn[data-s="수학"]').classList.add('active');
  document.getElementById('btn-add-tmpl').disabled    = false;
  document.getElementById('btn-add-tmpl').textContent = '추가하기';
  document.getElementById('overlay-tmpl').classList.add('on');
  document.getElementById('modal-tmpl').classList.add('on');
  setTimeout(() => document.getElementById('tmpl-input').focus(), 380);
}
function closeTmplModal() {
  document.getElementById('overlay-tmpl').classList.remove('on');
  document.getElementById('modal-tmpl').classList.remove('on');
}
function pickTmplSubj(btn) {
  tmplSubj = btn.dataset.s;
  document.querySelectorAll('.tmpl-subj-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}
async function submitTmpl() {
  const input = document.getElementById('tmpl-input');
  const title = input.value.trim();
  if (!title) {
    input.classList.remove('shake'); void input.offsetWidth; input.classList.add('shake');
    input.focus(); return;
  }
  const btn = document.getElementById('btn-add-tmpl');
  btn.disabled = true; btn.textContent = '추가 중…';
  try {
    await db.collection('templates').doc(profile).set({ items: [...templateItems, { id: genId(), subject: tmplSubj, title }] });
    closeTmplModal();
  } catch (e) {
    console.error(e); alert('추가에 실패했어요.');
    btn.disabled = false; btn.textContent = '추가하기';
  }
}

// ===== PIN =====
let pinBuffer     = '';
let pinMode       = 'verify';
let pinSetupFirst = '';

function openPinModal() {
  pinBuffer = ''; pinSetupFirst = '';
  const stored = localStorage.getItem('hw_parent_pin');
  pinMode = stored ? 'verify' : 'setup1';
  document.getElementById('pin-title').textContent = '🔒 부모 확인';
  document.getElementById('pin-hint').textContent  = stored ? 'PIN 번호를 입력해주세요' : '새 PIN을 설정해주세요 (4자리)';
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
  const stored = localStorage.getItem('hw_parent_pin');
  if (pinMode === 'verify') {
    if (pinBuffer === stored) { cancelPin(); openParentView(); }
    else {
      document.getElementById('pin-dots').classList.add('shake');
      document.getElementById('pin-hint').textContent = '틀렸어요. 다시 입력해주세요';
      setTimeout(() => {
        document.getElementById('pin-dots').classList.remove('shake');
        document.getElementById('pin-hint').textContent = 'PIN 번호를 입력해주세요';
        pinBuffer = ''; updatePinDots();
      }, 600);
    }
  } else if (pinMode === 'setup1') {
    pinSetupFirst = pinBuffer; pinBuffer = ''; pinMode = 'setup2';
    document.getElementById('pin-hint').textContent = 'PIN을 한 번 더 입력해주세요';
    updatePinDots();
  } else {
    if (pinBuffer === pinSetupFirst) {
      localStorage.setItem('hw_parent_pin', pinBuffer);
      cancelPin(); openParentView();
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

// ===== 부모 화면 =====
let parentChild  = '시현이';
let calYear      = 0;
let calMonth     = 0;
let parentHwCache = {};

function openParentView() {
  const now = new Date();
  calYear = now.getFullYear(); calMonth = now.getMonth() + 1;
  parentChild = '시현이';
  document.getElementById('screen-profile').classList.add('hidden');
  document.getElementById('screen-parent').classList.remove('hidden');
  updateParentChildTabs();
  loadCalendarData();
}
function closeParentView() {
  document.getElementById('screen-parent').classList.add('hidden');
  document.getElementById('screen-profile').classList.remove('hidden');
}
function setParentChild(name) {
  parentChild = name;
  updateParentChildTabs();
  loadCalendarData();
}
function updateParentChildTabs() {
  document.querySelectorAll('.parent-child-tab').forEach(b =>
    b.classList.toggle('active', b.dataset.child === parentChild));
  // apply theme for parent header
  const t = THEMES[parentChild];
  applyTheme(t);
}
async function loadCalendarData() {
  try {
    const snap = await db.collection('homework').where('child', '==', parentChild).get();
    parentHwCache = {};
    snap.docs.forEach(d => {
      const data = d.data();
      if (!parentHwCache[data.date]) parentHwCache[data.date] = [];
      parentHwCache[data.date].push({ id: d.id, ...data });
    });
    renderCalendar();
  } catch (e) { console.error('캘린더 로드 실패:', e); }
}
function navCalendar(dir) {
  calMonth += dir;
  if (calMonth > 12) { calMonth = 1; calYear++; }
  if (calMonth < 1)  { calMonth = 12; calYear--; }
  renderCalendar();
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
    const ds  = `${y}-${String(m).padStart(2,'0')}-${String(date).padStart(2,'0')}`;
    const hw  = parentHwCache[ds] || [];
    const tot = hw.length;
    const don = hw.filter(h => h.completed).length;
    const isFuture = ds > today;
    let badge = '';
    if (tot > 0 && !isFuture) {
      badge = don === tot
        ? '<span class="cal-star">🌟</span>'
        : `<span class="cal-pct">${Math.round(don/tot*100)}%</span>`;
    }
    html += `<div class="cal-cell${ds===today?' today':''}${tot>0?' has-hw':''}" onclick="openDayDetail('${ds}')">
      <span class="cal-date-num">${date}</span>${badge}
    </div>`;
  }
  html += '</div>';
  document.getElementById('cal-grid-wrap').innerHTML = html;
}

async function openDayDetail(dateStr) {
  const hw = parentHwCache[dateStr] || [];
  let tmplChecks = {};
  let tmplForChild = [];
  try {
    const [checkSnap, tmplSnap] = await Promise.all([
      db.collection('dailyChecks').doc(`${parentChild}_${dateStr}`).get(),
      db.collection('templates').doc(parentChild).get(),
    ]);
    tmplChecks   = checkSnap.exists  ? checkSnap.data()           : {};
    tmplForChild = tmplSnap.exists   ? (tmplSnap.data().items||[]) : [];
  } catch (e) { console.error(e); }

  const d = new Date(dateStr + 'T00:00:00');
  document.getElementById('daydetail-date').textContent =
    d.toLocaleDateString('ko-KR', { year:'numeric', month:'long', day:'numeric', weekday:'short' });

  const allItems = [
    ...hw.map(h => ({ title:h.title, subject:h.subject, completed:h.completed, type:'manual' })),
    ...tmplForChild.map(t => ({ title:t.title, subject:t.subject, completed:tmplChecks[t.id]||false, type:'template' })),
  ];
  const tot = allItems.length;
  const don = allItems.filter(i => i.completed).length;
  document.getElementById('daydetail-summary').textContent =
    tot > 0 ? `${don} / ${tot} 완료` : '이날 숙제가 없어요';

  document.getElementById('daydetail-list').innerHTML = allItems.length === 0
    ? '<p class="daydetail-empty">기록이 없어요</p>'
    : allItems.map(item => `
        <div class="daydetail-item${item.completed?' done':''}">
          <span class="daydetail-check">${item.completed?'✓':'○'}</span>
          <div>
            <div class="hw-subj">${SUBJ_EMOJI[item.subject]||''} ${esc(item.subject)}${item.type==='template'?' <span class="repeat-badge">🔁</span>':''}</div>
            <div class="hw-title">${esc(item.title)}</div>
          </div>
        </div>`).join('');

  document.getElementById('overlay-daydetail').classList.add('on');
  document.getElementById('modal-daydetail').classList.add('on');
}
function closeDayDetail() {
  document.getElementById('overlay-daydetail').classList.remove('on');
  document.getElementById('modal-daydetail').classList.remove('on');
}

// ===== Service Worker =====
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(()=>{}));
}
