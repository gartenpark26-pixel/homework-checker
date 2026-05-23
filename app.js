'use strict';

const db = firebase.firestore();
db.enablePersistence().catch(() => {});

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
      : `<button class="del-btn" onclick="hideTmplForDay('${h.id}')" aria-label="오늘 숨기기" title="오늘만 숨기기">🗑️</button>`;

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
          <div class="hw-subj">${SUBJ_EMOJI[h.subject]||''} ${esc(h.subject)}${h.itemType==='template'?' <span class="repeat-badge">🔁</span>':''}</div>
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
  document.getElementById('overlay-tmpl').classList.remove('on');
  document.getElementById('modal-tmpl').classList.remove('on');
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
  closeTmplModal();
  db.collection('templates').doc(profile)
    .set({ items: [...templateItems, { id: genId(), subject: tmplSubj, title, weekendSkip: tmplWeekendSkip }] })
    .catch(e => { console.error(e); alert('반복 숙제 추가에 실패했어요.'); });
}

// ===== PIN =====
let pinBuffer     = '';
let pinMode       = 'verify';
let pinSetupFirst = '';
let pinTarget     = 'parent';
let pinStoredVal  = null;
const childPinsCache = {};
let parentPinCache = null;

function openPinModal() {
  pinTarget = 'parent';
  pinBuffer = ''; pinSetupFirst = '';
  pinStoredVal = parentPinCache;
  pinMode = pinStoredVal ? 'verify' : 'setup1';
  document.getElementById('pin-title').textContent = '🔒 부모 확인';
  document.getElementById('pin-hint').textContent  = pinStoredVal ? 'PIN 번호를 입력해주세요' : '새 PIN을 설정해주세요 (4자리)';
  updatePinDots();
  document.getElementById('overlay-pin').classList.add('on');
  document.getElementById('modal-pin').classList.add('on');
}
function openChildPinModal(childName) {
  pinTarget = childName;
  pinBuffer = ''; pinSetupFirst = '';
  pinStoredVal = childPinsCache[childName] ?? null;
  pinMode = pinStoredVal ? 'verify' : 'setup1';
  document.getElementById('pin-title').textContent = `🔒 ${childName} 확인`;
  document.getElementById('pin-hint').textContent  = pinStoredVal ? 'PIN 번호를 입력해주세요' : '새 PIN을 설정해주세요 (4자리)';
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
        db.collection('childPins').doc(pinTarget).set({ pin: pinBuffer });
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
    await db.collection('childPins').doc(childName).delete();
    childPinsCache[childName] = null;
    alert(`${childName}의 PIN이 초기화되었어요.`);
  } catch (e) { console.error(e); alert('초기화에 실패했어요.'); }
}
function preloadChildPins() {
  ['시현이', '시온이'].forEach(name => {
    db.collection('childPins').doc(name).get()
      .then(snap => { childPinsCache[name] = snap.exists ? snap.data().pin : null; })
      .catch(() => { childPinsCache[name] = null; });
  });
  // 부모 PIN: Firestore 우선, 없으면 localStorage에서 자동 마이그레이션
  db.collection('parentPin').doc('main').get()
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
}
function closeParentView() {
  if (unsubParent)       { unsubParent();       unsubParent       = null; }
  if (unsubChecksParent) { unsubChecksParent(); unsubChecksParent = null; }
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
    const tmplVisible = parentTmplItems.filter(t => !(calIsWe && t.weekendSkip));
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
  const tmplForChild = parentTmplItems.filter(t => !(detailIsWeekend && t.weekendSkip));
  const tmplChecks = parentChecksCache[dateStr] || {};

  const allItems = [
    ...hw.map(h => ({
      title: h.title, subject: h.subject, completed: h.completed, type: 'manual',
      completedAt: h.completedAt, completedTimeStr: h.completedTimeStr || null, stars: h.stars || null,
    })),
    ...tmplForChild.map(t => ({
      title: t.title, subject: t.subject,
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
              <div class="hw-subj">${SUBJ_EMOJI[item.subject]||''} ${esc(item.subject)}${item.type==='template'?' <span class="repeat-badge">🔁</span>':''}</div>
              <div class="hw-title">${esc(item.title)}</div>
              ${timeLine}
              ${starLine}
            </div>
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
