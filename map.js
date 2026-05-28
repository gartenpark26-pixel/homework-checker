'use strict';

// ===== 맵 데이터 =====
const MAP_TOTAL = 40;

const MAP_SQUARES = [
  /* sq 0  출발 */ { emoji: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#F59E0B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="20" x2="6" y2="3"/><path d="M6 3l12 4.5-12 4.5z" fill="#F59E0B" fill-opacity="0.3"/></svg>', label: '출발', bg: '#FFF9C4' },
  /* sq 1  별빛길 */ { emoji: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#A78BFA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l1.8 5.5H20l-5 3.6 1.8 5.5L12 13l-4.8 3.6 1.8-5.5-5-3.6h6.2z" fill="#A78BFA" fill-opacity="0.15"/></svg>', label: '별빛길', bg: '#FFFFFF' },
  /* sq 2  작은집 */ { emoji: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#6EE7B7" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12L12 4l9 8"/><rect x="6" y="12" width="12" height="8" rx="1"/><rect x="10" y="15" width="4" height="5" rx="0.5"/></svg>', label: '작은집', bg: '#FFFFFF' },
  /* sq 3  벚꽃길 */ { emoji: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#F9A8D4" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="2"/><ellipse cx="12" cy="6.5" rx="1.8" ry="3"/><ellipse cx="12" cy="6.5" rx="1.8" ry="3" transform="rotate(72 12 12)"/><ellipse cx="12" cy="6.5" rx="1.8" ry="3" transform="rotate(144 12 12)"/><ellipse cx="12" cy="6.5" rx="1.8" ry="3" transform="rotate(216 12 12)"/><ellipse cx="12" cy="6.5" rx="1.8" ry="3" transform="rotate(288 12 12)"/></svg>', label: '벚꽃길', bg: '#FFFFFF' },
  /* sq 4  달 */ { emoji: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#FCD34D" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="#FCD34D" fill-opacity="0.15"/></svg>', label: '달', bg: '#FFFFFF' },
  /* sq 5  리본 */ { emoji: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#F9A8D4" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 12L5 6a3 3 0 0 1 4.5-4L12 4l2.5-2A3 3 0 0 1 19 6l-7 6z"/><path d="M12 12L5 18a3 3 0 0 0 4.5 4L12 20l2.5 2A3 3 0 0 0 19 18l-7-6z"/><circle cx="12" cy="12" r="1.5" fill="#F9A8D4" stroke="none"/></svg>', label: '리본', bg: '#FFFFFF' },
  /* sq 6  구름 */ { emoji: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#93C5FD" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" fill="#93C5FD" fill-opacity="0.2"/></svg>', label: '구름', bg: '#FFFFFF' },
  /* sq 7  시냇가 */ { emoji: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#67E8F9" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 10c2-3 4-3 6 0s4 3 6 0 4-3 6 0"/><path d="M2 16c2-3 4-3 6 0s4 3 6 0 4-3 6 0"/></svg>', label: '시냇가', bg: '#FFFFFF' },
  /* sq 8  음표 */ { emoji: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#C4B5FD" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="7" cy="18" r="2.5"/><circle cx="16" cy="15.5" r="2.5"/><line x1="9.5" y1="18" x2="9.5" y2="7"/><line x1="18.5" y1="15.5" x2="18.5" y2="4.5"/><line x1="9.5" y1="7" x2="18.5" y2="4.5"/></svg>', label: '음표', bg: '#FFFFFF' },
  /* sq 9  나비 */ { emoji: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#86EFAC" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9c-1-4-4-6-6-4S4 10 8 11.5C10 12 12 12 12 12"/><path d="M12 9c1-4 4-6 6-4s2 5-2 6.5C14 12 12 12 12 12"/><path d="M12 12c-1 3-4 5-5 7s2 3 4 1c1-1 1-3 1-3"/><path d="M12 12c1 3 4 5 5 7s-2 3-4 1c-1-1-1-3-1-3"/><line x1="12" y1="8" x2="12" y2="19"/></svg>', label: '나비', bg: '#FFFFFF' },
  /* sq 10 큰나무 */ { emoji: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#22C55E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="9" r="6" fill="#22C55E" fill-opacity="0.2"/><circle cx="12" cy="9" r="6"/><line x1="12" y1="15" x2="12" y2="21"/><line x1="9" y1="20" x2="15" y2="20"/></svg>', label: '큰나무', bg: '#E0F7E9' },
  /* sq 11 선물 */ { emoji: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#FB923C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="9" width="18" height="12" rx="1"/><rect x="3" y="6" width="18" height="4" rx="1"/><line x1="12" y1="6" x2="12" y2="21"/><path d="M12 6c-1.5-2-4-2-4-.5C8 8 10 8 12 6z"/><path d="M12 6c1.5-2 4-2 4-.5C16 8 14 8 12 6z"/></svg>', label: '선물', bg: '#FFFFFF' },
  /* sq 12 꽃밭 */ { emoji: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#F472B6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="10" r="3"/><path d="M12 4v2M12 14v2M6 10h2M14 10h2M7.76 6.76l1.41 1.41M14.83 13.83l1.41 1.41M7.76 13.24l1.41-1.41M14.83 6.17l1.41-1.41"/><line x1="12" y1="16" x2="12" y2="20"/></svg>', label: '꽃밭', bg: '#FFFFFF' },
  /* sq 13 케이크 */ { emoji: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#FDA4AF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="14" width="16" height="7" rx="1"/><rect x="6" y="10" width="12" height="5" rx="1"/><line x1="12" y1="10" x2="12" y2="5"/><path d="M11 5c0-1.5 1-2 1-2s1 .5 1 2"/></svg>', label: '케이크', bg: '#FFFFFF' },
  /* sq 14 딸기 */ { emoji: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#F87171" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 9c0-3 2.5-5 5-5s5 2 5 5c0 5-5 10-5 10S7 14 7 9z" fill="#F87171" fill-opacity="0.1"/><path d="M9.5 5c-.5-2 1-3 2.5-3s3 1 2.5 3"/></svg>', label: '딸기', bg: '#FFFFFF' },
  /* sq 15 고양이 */ { emoji: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#A78BFA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="14" r="6"/><path d="M7 10L5 4l5 4"/><path d="M17 10L19 4l-5 4"/><circle cx="9.5" cy="13.5" r="1" fill="#A78BFA" stroke="none"/><circle cx="14.5" cy="13.5" r="1" fill="#A78BFA" stroke="none"/><path d="M10 17q2 2 4 0"/></svg>', label: '고양이', bg: '#FFFFFF' },
  /* sq 16 무지개 */ { emoji: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#60A5FA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 19a9 9 0 0 1 18 0"/><path d="M6 19a6 6 0 0 1 12 0"/><path d="M9 19a3 3 0 0 1 6 0"/></svg>', label: '무지개', bg: '#FFFFFF' },
  /* sq 17 별자리 */ { emoji: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#C4B5FD" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="5" cy="6" r="1.2" fill="#C4B5FD" stroke="none"/><circle cx="12" cy="4" r="1.2" fill="#C4B5FD" stroke="none"/><circle cx="19" cy="7" r="1.2" fill="#C4B5FD" stroke="none"/><circle cx="20" cy="14" r="1.2" fill="#C4B5FD" stroke="none"/><circle cx="14" cy="18" r="1.2" fill="#C4B5FD" stroke="none"/><circle cx="6" cy="16" r="1.2" fill="#C4B5FD" stroke="none"/><line x1="5" y1="6" x2="12" y2="4"/><line x1="12" y1="4" x2="19" y2="7"/><line x1="19" y1="7" x2="20" y2="14"/><line x1="20" y1="14" x2="14" y2="18"/><line x1="14" y1="18" x2="6" y2="16"/><line x1="6" y1="16" x2="5" y2="6"/></svg>', label: '별자리', bg: '#FFFFFF' },
  /* sq 18 풍선 */ { emoji: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#F9A8D4" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="9" r="6" fill="#F9A8D4" fill-opacity="0.2"/><path d="M10 14.5q.5 2.5 2 4q1.5-1.5 2-4"/><line x1="12" y1="18.5" x2="12" y2="22"/></svg>', label: '풍선', bg: '#FFFFFF' },
  /* sq 19 왕관 */ { emoji: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#FCD34D" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18h18M3 18l2-8 4.5 4L12 6l2.5 8L19 10l2 8" fill="#FCD34D" fill-opacity="0.1"/><circle cx="12" cy="6" r="1" fill="#FCD34D" stroke="none"/></svg>', label: '왕관', bg: '#FFFFFF' },
  /* sq 20 동화성 */ { emoji: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#A855F7" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="13" width="18" height="8" rx="1" fill="#A855F7" fill-opacity="0.1"/><rect x="3" y="13" width="18" height="8" rx="1"/><rect x="5" y="9" width="4" height="5"/><rect x="10" y="7" width="4" height="7"/><rect x="15" y="9" width="4" height="5"/><path d="M6 9V6l1.5-2L9 6v3"/><path d="M11 7V4l1.5-2L14 4v3"/><path d="M16 9V6l1.5-2L19 6v3"/><rect x="10" y="17" width="4" height="4"/></svg>', label: '동화성', bg: '#F3E5F5' },
  /* sq 21 유니콘 */ { emoji: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#E879F9" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="14" r="6"/><path d="M10 10L12 3l2 7"/><circle cx="9.5" cy="14" r="1" fill="#E879F9" stroke="none"/><circle cx="14.5" cy="14" r="1" fill="#E879F9" stroke="none"/><path d="M10 17.5q2 2 4 0"/></svg>', label: '유니콘', bg: '#FFFFFF' },
  /* sq 22 아이스크림 */ { emoji: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#67E8F9" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="4" width="6" height="9" rx="3" fill="#67E8F9" fill-opacity="0.15"/><rect x="9" y="4" width="6" height="9" rx="3"/><line x1="12" y1="13" x2="12" y2="20"/><line x1="10" y1="19" x2="14" y2="19"/></svg>', label: '아이스크림', bg: '#FFFFFF' },
  /* sq 23 해바라기 */ { emoji: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#FBBF24" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="11" r="3" fill="#FBBF24" fill-opacity="0.2"/><line x1="12" y1="4" x2="12" y2="8"/><line x1="12" y1="14" x2="12" y2="18"/><line x1="5" y1="11" x2="9" y2="11"/><line x1="15" y1="11" x2="19" y2="11"/><line x1="7.5" y1="6.5" x2="10" y2="9"/><line x1="16.5" y1="6.5" x2="14" y2="9"/><line x1="7.5" y1="15.5" x2="10" y2="13"/><line x1="16.5" y1="15.5" x2="14" y2="13"/><line x1="12" y1="18" x2="12" y2="21"/></svg>', label: '해바라기', bg: '#FFFFFF' },
  /* sq 24 도넛 */ { emoji: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#FB923C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8" fill="#FB923C" fill-opacity="0.1"/><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.5"/><path d="M8 5.5Q10 4 12 4Q14 4 16 5.5" stroke-width="2.5" stroke="#FB923C" stroke-linecap="round"/></svg>', label: '도넛', bg: '#FFFFFF' },
  /* sq 25 여우 */ { emoji: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#FB923C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="14" r="6"/><path d="M8 10L5 4l6 4.5"/><path d="M16 10L19 4l-6 4.5"/><circle cx="9.5" cy="13.5" r="1" fill="#FB923C" stroke="none"/><circle cx="14.5" cy="13.5" r="1" fill="#FB923C" stroke="none"/><path d="M10 17q2 2 4 0"/></svg>', label: '여우', bg: '#FFFFFF' },
  /* sq 26 소원별 */ { emoji: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#FCD34D" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" fill="#FCD34D" fill-opacity="0.15"/></svg>', label: '소원별', bg: '#FFFFFF' },
  /* sq 27 숲속길 */ { emoji: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#4ADE80" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3L19 13H5z" fill="#4ADE80" fill-opacity="0.1"/><path d="M12 3L19 13H5z"/><path d="M9 13l-3 6h12l-3-6"/><line x1="12" y1="13" x2="12" y2="20"/></svg>', label: '숲속길', bg: '#FFFFFF' },
  /* sq 28 달빛 */ { emoji: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#818CF8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="#818CF8" fill-opacity="0.15"/><circle cx="8" cy="7" r="0.8" fill="#818CF8" stroke="none"/><circle cx="6" cy="12" r="0.8" fill="#818CF8" stroke="none"/></svg>', label: '달빛', bg: '#FFFFFF' },
  /* sq 29 반짝임 */ { emoji: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#E879F9" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5z" fill="#E879F9" fill-opacity="0.1"/><path d="M12 2l1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5z"/></svg>', label: '반짝임', bg: '#FFFFFF' },
  /* sq 30 분수대 */ { emoji: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#38BDF8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="20" rx="8" ry="2" fill="#38BDF8" fill-opacity="0.1"/><ellipse cx="12" cy="20" rx="8" ry="2"/><ellipse cx="12" cy="15.5" rx="4" ry="1.5"/><line x1="12" y1="15.5" x2="12" y2="20"/><path d="M9 14c1-4 2-6 3-7"/><path d="M15 14c-1-4-2-6-3-7"/></svg>', label: '분수대', bg: '#E3F2FD' },
  /* sq 31 버섯마을 */ { emoji: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#F87171" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 14A7 7 0 0 1 19 14z" fill="#F87171" fill-opacity="0.15"/><path d="M5 14A7 7 0 0 1 19 14z"/><line x1="9" y1="14" x2="9" y2="19"/><line x1="15" y1="14" x2="15" y2="19"/><path d="M9 19q3 2 6 0"/></svg>', label: '버섯마을', bg: '#FFFFFF' },
  /* sq 32 데이지 */ { emoji: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#FDE68A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="2.5" fill="#FDE68A" fill-opacity="0.3"/><line x1="12" y1="4" x2="12" y2="9.5"/><line x1="12" y1="14.5" x2="12" y2="20"/><line x1="4" y1="12" x2="9.5" y2="12"/><line x1="14.5" y1="12" x2="20" y2="12"/><line x1="6.5" y1="6.5" x2="10.2" y2="10.2"/><line x1="13.8" y1="13.8" x2="17.5" y2="17.5"/><line x1="17.5" y1="6.5" x2="13.8" y2="10.2"/><line x1="10.2" y1="13.8" x2="6.5" y2="17.5"/></svg>', label: '데이지', bg: '#FFFFFF' },
  /* sq 33 곰카페 */ { emoji: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#A78BFA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13" r="6"/><circle cx="8" cy="8" r="2.5"/><circle cx="16" cy="8" r="2.5"/><circle cx="10" cy="13" r="1" fill="#A78BFA" stroke="none"/><circle cx="14" cy="13" r="1" fill="#A78BFA" stroke="none"/><path d="M10 16q2 2 4 0"/></svg>', label: '곰카페', bg: '#FFFFFF' },
  /* sq 34 해변 */ { emoji: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#60A5FA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="17" cy="6" r="3" fill="#FCD34D" fill-opacity="0.2" stroke="#FCD34D"/><path d="M2 17c2-3 4-3 6 0s4 3 6 0 4-3 6 0"/><path d="M2 21c2-3 4-3 6 0s4 3 6 0 4-3 6 0"/></svg>', label: '해변', bg: '#FFFFFF' },
  /* sq 35 마법봉 */ { emoji: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#E879F9" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="18" x2="18" y2="6"/><circle cx="5" cy="5" r="1" fill="#E879F9" stroke="none"/><circle cx="19" cy="5" r="0.8" fill="#FCD34D" stroke="none"/><circle cx="19" cy="11" r="0.8" fill="#86EFAC" stroke="none"/><circle cx="13" cy="5" r="0.8" fill="#93C5FD" stroke="none"/></svg>', label: '마법봉', bg: '#FFFFFF' },
  /* sq 36 관람차 */ { emoji: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#60A5FA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="10" r="7"/><circle cx="12" cy="10" r="2"/><line x1="12" y1="3" x2="12" y2="17"/><line x1="5" y1="10" x2="19" y2="10"/><line x1="7.5" y1="5.5" x2="16.5" y2="14.5"/><line x1="16.5" y1="5.5" x2="7.5" y2="14.5"/><line x1="12" y1="17" x2="10" y2="21"/><line x1="12" y1="17" x2="14" y2="21"/></svg>', label: '관람차', bg: '#FFFFFF' },
  /* sq 37 튤립 */ { emoji: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#F472B6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 10c-3 0-5-2-5-5 0 0 2 1 5 1s5-1 5-1c0 3-2 5-5 5z" fill="#F472B6" fill-opacity="0.15"/><line x1="12" y1="10" x2="12" y2="20"/><path d="M9 15c-2 0-3-1-3-1s1-2 3-1"/><path d="M15 15c2 0 3-1 3-1s-1-2-3-1"/></svg>', label: '튤립', bg: '#FFFFFF' },
  /* sq 38 새벽별 */ { emoji: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#818CF8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l1.8 5.5H20l-5 3.6 1.8 5.5L12 13l-4.8 3.6 1.8-5.5-5-3.6h6.2z" fill="#818CF8" fill-opacity="0.1"/><path d="M12 2l1.8 5.5H20l-5 3.6 1.8 5.5L12 13l-4.8 3.6 1.8-5.5-5-3.6h6.2z"/></svg>', label: '새벽별', bg: '#FFFFFF' },
  /* sq 39 도착전야 */ { emoji: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#F59E0B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5z" fill="#F59E0B" fill-opacity="0.2"/><path d="M12 2l1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5z"/><path d="M19 17l.7 2.3 2.3.7-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.7z" stroke-width="1" stroke="#F59E0B"/></svg>', label: '도착전야', bg: '#FFFFFF' },
];

// ===== 상태 =====
const mapPts  = { '시현이': 0, '시온이': 0 };
const mapGift = { '시현이': 0, '시온이': 0 };
let unsubMapSih  = null;
let unsubMapSion = null;
let mapCurrentChild = null;
let _mapWinShown    = false;

// ===== 위치 계산 =====
function mapPos(total) { return ((total % MAP_TOTAL) + MAP_TOTAL) % MAP_TOTAL; }

function gridToSq(r, c) {
  if (r === 0)  return c;
  if (c === 10) return 10 + r;
  if (r === 10) return 30 - c;
  return 40 - r;
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

// ===== 선로 SVG (각 칸 타입별) =====
// 각 SVG는 40×40 viewBox, 레일 2개 + 침목
// 레일: y=16/24 (수평칸), x=16/24 (수직칸)
// 침목: 레일에 수직, 간격 10px
const _RAIL_COLOR  = '#B8A080';
const _TIE_COLOR   = '#8B6B45';
const _RAIL_W = 1.8;
const _TIE_W  = 3;

// 침목 생성 헬퍼
function _ties_h(ys) {  // 수평 침목들 (x 위치들)
  return ys.map(x => `<line x1="${x}" y1="13" x2="${x}" y2="27" stroke="${_TIE_COLOR}" stroke-width="${_TIE_W}" stroke-linecap="round"/>`).join('');
}
function _ties_v(xs) {  // 수직 침목들 (y 위치들)
  return xs.map(y => `<line x1="13" y1="${y}" x2="27" y2="${y}" stroke="${_TIE_COLOR}" stroke-width="${_TIE_W}" stroke-linecap="round"/>`).join('');
}

// 각 칸 타입 선로
const TRACK_SVG = {
  // 수평 (상단/하단 직선구간)
  h: `<svg class="ct" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
    ${_ties_h([7, 17, 27, 37])}
    <line x1="0" y1="16" x2="40" y2="16" stroke="${_RAIL_COLOR}" stroke-width="${_RAIL_W}"/>
    <line x1="0" y1="24" x2="40" y2="24" stroke="${_RAIL_COLOR}" stroke-width="${_RAIL_W}"/>
  </svg>`,

  // 수직 (좌측/우측 직선구간)
  v: `<svg class="ct" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
    ${_ties_v([7, 17, 27, 37])}
    <line x1="16" y1="0" x2="16" y2="40" stroke="${_RAIL_COLOR}" stroke-width="${_RAIL_W}"/>
    <line x1="24" y1="0" x2="24" y2="40" stroke="${_RAIL_COLOR}" stroke-width="${_RAIL_W}"/>
  </svg>`,

  // 코너: 좌상단 sq0 — 아래(좌측)에서 와서 오른쪽(상단)으로 꺾임
  tl: `<svg class="ct" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
    <path d="M 16,40 Q 16,16 40,16" fill="none" stroke="${_RAIL_COLOR}" stroke-width="${_RAIL_W}"/>
    <path d="M 24,40 Q 24,24 40,24" fill="none" stroke="${_RAIL_COLOR}" stroke-width="${_RAIL_W}"/>
    <line x1="13" y1="30" x2="22" y2="27" stroke="${_TIE_COLOR}" stroke-width="${_TIE_W}" stroke-linecap="round"/>
    <line x1="27" y1="14" x2="30" y2="22" stroke="${_TIE_COLOR}" stroke-width="${_TIE_W}" stroke-linecap="round"/>
  </svg>`,

  // 코너: 우상단 sq10 — 왼쪽(상단)에서 와서 아래(우측)로 꺾임
  tr: `<svg class="ct" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
    <path d="M 0,16 Q 24,16 24,40" fill="none" stroke="${_RAIL_COLOR}" stroke-width="${_RAIL_W}"/>
    <path d="M 0,24 Q 16,24 16,40" fill="none" stroke="${_RAIL_COLOR}" stroke-width="${_RAIL_W}"/>
    <line x1="10" y1="13" x2="13" y2="22" stroke="${_TIE_COLOR}" stroke-width="${_TIE_W}" stroke-linecap="round"/>
    <line x1="27" y1="27" x2="18" y2="30" stroke="${_TIE_COLOR}" stroke-width="${_TIE_W}" stroke-linecap="round"/>
  </svg>`,

  // 코너: 우하단 sq20 — 위(우측)에서 와서 왼쪽(하단)으로 꺾임
  br: `<svg class="ct" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
    <path d="M 24,0 Q 24,24 0,24" fill="none" stroke="${_RAIL_COLOR}" stroke-width="${_RAIL_W}"/>
    <path d="M 16,0 Q 16,16 0,16" fill="none" stroke="${_RAIL_COLOR}" stroke-width="${_RAIL_W}"/>
    <line x1="27" y1="10" x2="18" y2="13" stroke="${_TIE_COLOR}" stroke-width="${_TIE_W}" stroke-linecap="round"/>
    <line x1="13" y1="27" x2="10" y2="18" stroke="${_TIE_COLOR}" stroke-width="${_TIE_W}" stroke-linecap="round"/>
  </svg>`,

  // 코너: 좌하단 sq30 — 오른쪽(하단)에서 와서 위(좌측)로 꺾임
  bl: `<svg class="ct" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
    <path d="M 40,24 Q 16,24 16,0" fill="none" stroke="${_RAIL_COLOR}" stroke-width="${_RAIL_W}"/>
    <path d="M 40,16 Q 24,16 24,0" fill="none" stroke="${_RAIL_COLOR}" stroke-width="${_RAIL_W}"/>
    <line x1="30" y1="27" x2="22" y2="27" stroke="${_TIE_COLOR}" stroke-width="${_TIE_W}" stroke-linecap="round"/>
    <line x1="18" y1="13" x2="18" y2="10" stroke="${_TIE_COLOR}" stroke-width="${_TIE_W}" stroke-linecap="round"/>
  </svg>`,
};

function _getTrackSVG(sq) {
  if (sq === 0)  return TRACK_SVG.tl;
  if (sq === 10) return TRACK_SVG.tr;
  if (sq === 20) return TRACK_SVG.br;
  if (sq === 30) return TRACK_SVG.bl;
  // 상단/하단 직선
  const r = sq <= 10 ? 0 : sq <= 20 ? (sq - 10) : sq <= 30 ? 10 : (40 - sq);
  return (r === 0 || r === 10) ? TRACK_SVG.h : TRACK_SVG.v;
}

// ===== 토큰 SVG 오버레이 위치 계산 (viewBox 0 0 1100 1100) =====
function _sqToXY(sq) {
  let r, c;
  if (sq <= 10) { r = 0; c = sq; }
  else if (sq <= 20) { r = sq - 10; c = 10; }
  else if (sq <= 30) { r = 10; c = 30 - sq; }
  else { r = 40 - sq; c = 0; }
  return { x: c * 100 + 50, y: r * 100 + 50 };
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
            <div class="map-inner-sub">포인트를 모아 동물마을을 한 바퀴!</div>
            <div class="map-inner-cards">
              <div class="map-icard sih-icard">
                <span class="mic-emoji">🐰</span>
                <span class="mic-name">시현이</span>
                <span class="mic-pt">${mapPts['시현이']}pt</span>
                <span class="mic-gift">${mapGift['시현이'] > 0 ? '🎁×' + mapGift['시현이'] : '아직 없음'}</span>
              </div>
              <div class="map-icard sio-icard">
                <span class="mic-emoji">🐻</span>
                <span class="mic-name">시온이</span>
                <span class="mic-pt">${mapPts['시온이']}pt</span>
                <span class="mic-gift">${mapGift['시온이'] > 0 ? '🎁×' + mapGift['시온이'] : '아직 없음'}</span>
              </div>
            </div>
            <div class="map-inner-legend">
              <span>🏁 0칸</span><span>🌳 10칸</span><span>🏰 20칸</span><span>⛲ 30칸</span>
            </div>
          </div>`;
        }
        continue;
      }

      const sq  = gridToSq(r, c);
      const sd  = MAP_SQUARES[sq];
      const isLandmark = (sq === 0 || sq === 10 || sq === 20 || sq === 30);

      html += `<div class="map-cell${isLandmark ? ' map-lm' : ''}${sq === 0 ? ' map-start' : ''}"
        style="grid-column:${c + 1};grid-row:${r + 1};background:${sd.bg}"
        title="${sq}. ${sd.label}">
        ${_getTrackSVG(sq)}
        <div class="map-emo">${sd.emoji}</div>
        <div class="map-num">${sq}</div>
      </div>`;
    }
  }

  // 토큰 오버레이 SVG (position:absolute, 전체 커버)
  const sp_xy = _sqToXY(sp);
  const op_xy = _sqToXY(op);
  const same  = sp === op;

  let tokensHtml = '';
  if (same) {
    tokensHtml = `
      <g transform="translate(${sp_xy.x - 20},${sp_xy.y})">
        <circle r="24" fill="#FFD6E7" stroke="#F9A8D4" stroke-width="4"/>
        <text text-anchor="middle" dominant-baseline="middle" font-size="24" y="1">🐰</text>
      </g>
      <g transform="translate(${sp_xy.x + 20},${sp_xy.y})">
        <circle r="24" fill="#D6E8FF" stroke="#93C5FD" stroke-width="4"/>
        <text text-anchor="middle" dominant-baseline="middle" font-size="24" y="1">🐻</text>
      </g>`;
  } else {
    tokensHtml = `
      <g transform="translate(${sp_xy.x},${sp_xy.y})">
        <circle r="28" fill="#FFD6E7" stroke="#F9A8D4" stroke-width="4"/>
        <text text-anchor="middle" dominant-baseline="middle" font-size="28" y="1">🐰</text>
      </g>
      <g transform="translate(${op_xy.x},${op_xy.y})">
        <circle r="28" fill="#D6E8FF" stroke="#93C5FD" stroke-width="4"/>
        <text text-anchor="middle" dominant-baseline="middle" font-size="28" y="1">🐻</text>
      </g>`;
  }

  html += `<svg class="map-tok-svg" viewBox="0 0 1100 1100" xmlns="http://www.w3.org/2000/svg">${tokensHtml}</svg>`;
  return html;
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
