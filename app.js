'use strict';

// ===== Firestore 인스턴스 =====
const db = firebase.firestore();

// ===== 상태 =====
let profile   = null;
let filter    = '전체';
let newSubj   = '수학';
let hwData    = [];
let unsubFn   = null;

// ===== 테마 설정 =====
const THEMES = {
  '씽씽이': {
    emoji: '🦄',
    color: '#FF6B9D',
    grad:  'linear-gradient(135deg, #FF6B9D 0%, #C44DE0 100%)',
    bg:    '#FFF0F7',
  },
  '동동이': {
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

  // 화면 전환
  document.getElementById('screen-profile').classList.add('hidden');
  document.getElementById('screen-main').classList.remove('hidden');

  // 필터 초기화
  filter = '전체';
  document.querySelectorAll('.filter-chip').forEach(b => b.classList.remove('active'));
  document.querySelector('.filter-chip[data-subj="전체"]').classList.add('active');

  startListening();
}

function goBack() {
  if (unsubFn) { unsubFn(); unsubFn = null; }
  profile = null;
  hwData  = [];
  document.body.style.background = '';
  document.getElementById('screen-main').classList.add('hidden');
  document.getElementById('screen-profile').classList.remove('hidden');
}

// ===== Firestore 구독 =====
function startListening() {
  if (unsubFn) unsubFn();

  const today = todayKey();
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
}

// ===== Firestore 쓰기 =====
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

// ===== 렌더링 =====
function render() {
  const total    = hwData.length;
  const doneList = hwData.filter(h => h.completed);
  const done     = doneList.length;
  const pct      = total > 0 ? Math.round(done / total * 100) : 0;
  const moodIdx  = Math.round((done / Math.max(total, 1)) * (MOOD_EMOJI.length - 1));

  // 진행률 업데이트
  document.getElementById('cnt-done').textContent  = done;
  document.getElementById('cnt-total').textContent = total;
  document.getElementById('prog-fill').style.width  = pct + '%';
  document.getElementById('prog-pct').textContent   = pct + '%';
  document.getElementById('prog-mood').textContent  = MOOD_EMOJI[moodIdx];

  // 현재 필터에 맞는 항목
  const visible = filter === '전체'
    ? hwData
    : hwData.filter(h => h.subject === filter);

  const listEl     = document.getElementById('hw-list');
  const emptyEl    = document.getElementById('empty-state');
  const allDoneEl  = document.getElementById('all-done-state');
  const emptyText  = document.getElementById('empty-text');

  // 전부 완료 배너
  if (done === total && total > 0) {
    allDoneEl.classList.remove('hidden');
  } else {
    allDoneEl.classList.add('hidden');
  }

  // 빈 상태
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
  listEl.innerHTML = visible.map(h => `
    <div class="hw-item ${h.completed ? 'done' : ''}" id="hw-${h.id}">
      <button class="check-btn"
              onclick="toggleDone('${h.id}', ${h.completed})"
              aria-label="${h.completed ? '완료 취소' : '완료 체크'}">
        ${h.completed ? '✓' : ''}
      </button>
      <div class="hw-body">
        <div class="hw-subj">${SUBJ_EMOJI[h.subject] || ''} ${esc(h.subject)}</div>
        <div class="hw-title">${esc(h.title)}</div>
      </div>
      <button class="del-btn"
              onclick="deleteHw('${h.id}')"
              aria-label="삭제">🗑️</button>
    </div>
  `).join('');
}

// ===== 과목 필터 =====
function setFilter(subj, btn) {
  filter = subj;
  document.querySelectorAll('.filter-chip').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  render();
}

// ===== 모달 =====
function openModal() {
  // 초기화
  document.getElementById('hw-input').value = '';
  document.getElementById('hw-input').classList.remove('shake');
  newSubj = '수학';
  document.querySelectorAll('.subj-btn').forEach(b => b.classList.remove('active'));
  document.querySelector('.subj-btn[data-s="수학"]').classList.add('active');
  document.getElementById('btn-add').disabled    = false;
  document.getElementById('btn-add').textContent = '추가하기';

  document.getElementById('overlay').classList.add('on');
  document.getElementById('modal').classList.add('on');

  // 키보드가 올라온 뒤 포커스
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
    void input.offsetWidth; // reflow로 animation 재시작
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

// ===== Service Worker 등록 =====
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
