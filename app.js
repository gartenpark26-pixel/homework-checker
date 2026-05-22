'use strict';

// ===== Firestore 인스턴스 =====
const db = firebase.firestore();

// ===== 상태 =====
let profile        = null;
let filter         = '전체';
let newSubj        = '수학';
let hwData         = [];
let templateItems  = [];
let templateChecks = {};
let unsubFn        = null;
let unsubTemplate  = null;
let unsubChecks    = null;

// ===== 테마 설정 =====
const THEMES = {
  '시현이': {
    emoji: '🦄',
    color: '#FF6B9D',
    grad:  'linear-gradient(135deg, #FF6B9D 0%, #C44DE0 100%)',
    bg:    '#FFF0F7',
  },
  '시온이': {
    emoji: '🚀',
    color: '#26C6DA',
    grad:  'linear-gradient(135deg, #26C6DA 0%, #1976D2 100%)',
    bg:    '#EDFCFE',
  },
};

const SUBJ_EMOJI = { '수학': '📐', '국어': '📖', '영어': '🔤', '기타': '✏️' };
const MOOD_EMOJI = ['🌱', '🌿', '⭐', '🌟', '🏆', '🎉'];

// ===== 유틸 =====
function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function todayLabel() {
  return new Date().toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'short',
  });
}

function esc(str) {
  return String(str).replace(/[&<>"']/g, c =>
    ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c]);
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
  profile = name;
  const t = THEMES[name];

  applyTheme(t);
  document.body.style.background = t.bg;

  document.getElementById('hdr-emoji').textContent = t.emoji + ' ';
  document.getElementById('hdr-name').textContent  = name;
  document.getElementById('hdr-date').textContent  = todayLabel();

  document.getElementById('screen-profile').classList.add('hidden');
  document.getElementById('screen-main').classList.remove('hidden');

  filter = '전체';
  document.querySelectorAll('.filter-chip').forEach(b => b.classList.remove('active'));
  document.querySelector('.filter-chip[data-subj="전체"]').classList.add('active');

  startListening();
}

function goBack() {
  if (unsubFn)       { unsubFn();       unsubFn = null; }
  if (unsubTemplate) { unsubTemplate(); unsubTemplate = null; }
  if (unsubChecks)   { unsubChecks();   unsubChecks = null; }
  profile        = null;
  hwData         = [];
  templateItems  = [];
  templateChecks = {};
  document.body.style.background = '';
  document.getElementById('screen-main').classList.add('hidden');
  document.getElementById('screen-template').classList.add('hidden');
  document.getElementById('screen-profile').classList.remove('hidden');
}

// ===== Firestore 구독 =====
function startListening() {
  if (unsubFn)       { unsubFn(); }
  if (unsubTemplate) { unsubTemplate(); }
  if (unsubChecks)   { unsubChecks(); }

  const today = todayKey();

  // 오늘의 일반 숙제
  unsubFn = db.collection('homework')
    .where('child', '==', profile)
    .where('date',  '==', today)
    .onSnapshot(
      snap => {
        hwData = snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => {
            const at = a.createdAt ? a.createdAt.toMillis() : 0;
            const bt = b.createdAt ? b.createdAt.toMillis() : 0;
            return at - bt;
          });
        render();
      },
      err => console.error('Firestore 오류:', err)
    );

  // 반복 숙제 템플릿
  unsubTemplate = db.collection('templates').doc(profile)
    .onSnapshot(snap => {
      templateItems = snap.exists ? (snap.data().items || []) : [];
      render();
      if (!document.getElementById('screen-template').classList.contains('hidden')) {
        renderTemplate();
      }
    });

  // 오늘의 템플릿 체크 상태
  unsubChecks = db.collection('dailyChecks').doc(`${profile}_${today}`)
    .onSnapshot(snap => {
      templateChecks = snap.exists ? snap.data() : {};
      render();
    });
}

// ===== Firestore 쓰기 — 일반 숙제 =====
async function toggleDone(id, current) {
  try {
    await db.collection('homework').doc(id).update({ completed: !current });
  } catch (e) {
    console.error('완료 토글 실패:', e);
  }
}

async function deleteHw(id) {
  if (!confirm('이 숙제를 삭제할까요? 🗑️')) return;
  try {
    await db.collection('homework').doc(id).delete();
  } catch (e) {
    console.error('삭제 실패:', e);
  }
}

async function addHw(title, subject) {
  await db.collection('homework').add({
    child:     profile,
    subject:   subject,
    title:     title,
    completed: false,
    date:      todayKey(),
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  });
}

// ===== Firestore 쓰기 — 템플릿 체크 =====
async function toggleTemplateCheck(id, current) {
  try {
    const docRef = db.collection('dailyChecks').doc(`${profile}_${todayKey()}`);
    await docRef.set({ [id]: !current }, { merge: true });
  } catch (e) {
    console.error('템플릿 체크 실패:', e);
  }
}

// ===== 렌더링 — 메인 화면 =====
function render() {
  const mergedItems = [
    ...hwData.map(h => ({ ...h, itemType: 'manual' })),
    ...templateItems.map(t => ({
      id:        t.id,
      itemType:  'template',
      subject:   t.subject,
      title:     t.title,
      completed: templateChecks[t.id] || false,
    })),
  ];

  const total   = mergedItems.length;
  const done    = mergedItems.filter(h => h.completed).length;
  const pct     = total > 0 ? Math.round(done / total * 100) : 0;
  const moodIdx = Math.round((done / Math.max(total, 1)) * (MOOD_EMOJI.length - 1));

  document.getElementById('cnt-done').textContent  = done;
  document.getElementById('cnt-total').textContent = total;
  document.getElementById('prog-fill').style.width  = pct + '%';
  document.getElementById('prog-pct').textContent   = pct + '%';
  document.getElementById('prog-mood').textContent  = MOOD_EMOJI[moodIdx];

  const visible = filter === '전체'
    ? mergedItems
    : mergedItems.filter(h => h.subject === filter);

  const listEl    = document.getElementById('hw-list');
  const emptyEl   = document.getElementById('empty-state');
  const allDoneEl = document.getElementById('all-done-state');
  const emptyText = document.getElementById('empty-text');

  if (done === total && total > 0) {
    allDoneEl.classList.remove('hidden');
  } else {
    allDoneEl.classList.add('hidden');
  }

  if (visible.length === 0) {
    listEl.innerHTML = '';
    emptyEl.classList.remove('hidden');
    if (total === 0) {
      emptyText.innerHTML = '오늘 숙제가 없어요!<br><small>+ 버튼으로 추가해보세요 🎒</small>';
    } else {
      emptyText.innerHTML = `<b>${filter}</b> 숙제가 없어요!<br><small>다른 과목을 선택해보세요</small>`;
    }
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
        <button class="check-btn" onclick="${onCheck}"
                aria-label="${h.completed ? '완료 취소' : '완료 체크'}">
          ${h.completed ? '✓' : ''}
        </button>
        <div class="hw-body">
          <div class="hw-subj">${SUBJ_EMOJI[h.subject] || ''} ${esc(h.subject)}</div>
          <div class="hw-title">${esc(h.title)}</div>
        </div>
        ${rightEl}
      </div>
    `;
  }).join('');
}

// ===== 과목 필터 =====
function setFilter(subj, btn) {
  filter = subj;
  document.querySelectorAll('.filter-chip').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  render();
}

// ===== 모달 — 일반 숙제 추가 =====
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
    input.classList.remove('shake');
    void input.offsetWidth;
    input.classList.add('shake');
    input.focus();
    return;
  }

  const btn    = document.getElementById('btn-add');
  btn.disabled    = true;
  btn.textContent = '추가 중…';

  try {
    await addHw(title, newSubj);
    closeModal();
  } catch (e) {
    console.error('추가 실패:', e);
    alert('숙제 추가에 실패했어요. 다시 시도해주세요.');
    btn.disabled    = false;
    btn.textContent = '추가하기';
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

  if (templateItems.length === 0) {
    listEl.innerHTML = '';
    emptyEl.classList.remove('hidden');
    return;
  }

  emptyEl.classList.add('hidden');
  listEl.innerHTML = templateItems.map((t, idx) => `
    <div class="hw-item" id="tmpl-item-${t.id}">
      <span class="tmpl-order">${idx + 1}</span>
      <div class="hw-body">
        <div class="hw-subj">${SUBJ_EMOJI[t.subject] || ''} ${esc(t.subject)}</div>
        <div class="hw-title">${esc(t.title)}</div>
      </div>
      <button class="del-btn" onclick="deleteTmplItem('${t.id}')" aria-label="삭제">🗑️</button>
    </div>
  `).join('');
}

async function deleteTmplItem(id) {
  if (!confirm('이 반복 숙제를 삭제할까요? 🗑️')) return;
  const newItems = templateItems.filter(t => t.id !== id);
  try {
    await db.collection('templates').doc(profile).set({ items: newItems });
  } catch (e) {
    console.error('템플릿 삭제 실패:', e);
    alert('삭제에 실패했어요. 다시 시도해주세요.');
  }
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
    input.classList.remove('shake');
    void input.offsetWidth;
    input.classList.add('shake');
    input.focus();
    return;
  }

  const btn = document.getElementById('btn-add-tmpl');
  btn.disabled    = true;
  btn.textContent = '추가 중…';

  try {
    const newItem  = { id: genId(), subject: tmplSubj, title };
    const newItems = [...templateItems, newItem];
    await db.collection('templates').doc(profile).set({ items: newItems });
    closeTmplModal();
  } catch (e) {
    console.error('템플릿 추가 실패:', e);
    alert('추가에 실패했어요. 다시 시도해주세요.');
    btn.disabled    = false;
    btn.textContent = '추가하기';
  }
}

// ===== Service Worker 등록 =====
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
