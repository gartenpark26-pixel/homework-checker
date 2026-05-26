'use strict';

// ===== 맵 데이터 =====
const MAP_TOTAL = 40;

const MAP_SQUARES = [
  /* sq 0  출발    */ { emoji: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#C8986A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="21" x2="7" y2="4"/><path d="M7 4l11 3.5L7 11z" fill="#C8986A" fill-opacity="0.25"/></svg>', label: '출발', bg: '#FFF3C4' },
  /* sq 1  벚꽃길  */ { emoji: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#C08898" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="2"/><ellipse cx="12" cy="6.5" rx="1.8" ry="2.8"/><ellipse cx="17.5" cy="12" rx="2.8" ry="1.8"/><ellipse cx="12" cy="17.5" rx="1.8" ry="2.8"/><ellipse cx="6.5" cy="12" rx="2.8" ry="1.8"/></svg>', label: '벚꽃길', bg: '#FFE8F2' },
  /* sq 2  작은집  */ { emoji: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#C8986A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12L12 4l9 8"/><path d="M5 12v8h14v-8"/><path d="M10 20v-5h4v5"/></svg>', label: '작은집', bg: '#FFE8F0' },
  /* sq 3  사과밭  */ { emoji: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#C08898" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 9c-1 0-3 1.5-3 4 0 4 3 8 7 8s7-4 7-8c0-2.5-2-4-3-4-1 0-2 .5-4 .5S9 9 8 9z"/><line x1="12" y1="9" x2="12" y2="5"/><path d="M12 5c1-2 3.5-2 4-1"/></svg>', label: '사과밭', bg: '#FFE8E8' },
  /* sq 4  해바라기 */ { emoji: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#7BA88E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="10" r="3"/><line x1="12" y1="4" x2="12" y2="7"/><line x1="12" y1="13" x2="12" y2="16"/><line x1="6" y1="10" x2="9" y2="10"/><line x1="15" y1="10" x2="18" y2="10"/><line x1="7.9" y1="5.9" x2="10" y2="8"/><line x1="16.1" y1="5.9" x2="14" y2="8"/><line x1="10" y1="12" x2="7.9" y2="14.1"/><line x1="14" y1="12" x2="16.1" y2="14.1"/><line x1="12" y1="16" x2="12" y2="21"/></svg>', label: '해바라기', bg: '#FFFDE0' },
  /* sq 5  토끼굴  */ { emoji: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#C08898" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="14" r="6"/><ellipse cx="8.5" cy="7" rx="2" ry="4"/><ellipse cx="15.5" cy="7" rx="2" ry="4"/><circle cx="10" cy="14" r="0.8" fill="#C08898" stroke="none"/><circle cx="14" cy="14" r="0.8" fill="#C08898" stroke="none"/><path d="M10.5 17Q12 18.5 13.5 17"/></svg>', label: '토끼굴', bg: '#FFF0F8' },
  /* sq 6  서커스  */ { emoji: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#9B88C0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 18L12 4l10 14z"/><line x1="2" y1="18" x2="22" y2="18"/><line x1="7" y1="11" x2="7" y2="18"/><line x1="12" y1="9" x2="12" y2="18"/><line x1="17" y1="11" x2="17" y2="18"/><line x1="12" y1="4" x2="12" y2="2"/></svg>', label: '서커스', bg: '#FFF0DC' },
  /* sq 7  시냇가  */ { emoji: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#6B9AAA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 10C3.5 6 6.5 6 8 10C9.5 14 12.5 14 14 10C15.5 6 18.5 6 20 10"/><path d="M2 16C3.5 12 6.5 12 8 16C9.5 20 12.5 20 14 16C15.5 12 18.5 12 20 16"/></svg>', label: '시냇가', bg: '#E4F4FF' },
  /* sq 8  아이스크림 */ { emoji: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#6B9AAA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="9" r="5"/><path d="M7 9l5 12 5-12"/></svg>', label: '아이스크림', bg: '#EFFFFF' },
  /* sq 9  무지개  */ { emoji: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#9B88C0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 17a10 10 0 0 1 20 0"/><path d="M5 17a7 7 0 0 1 14 0"/><path d="M8 17a4 4 0 0 1 8 0"/></svg>', label: '무지개', bg: '#F0EEFF' },
  /* sq 10 큰나무 (랜드마크) */ { emoji: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#7BA88E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12,3 21,13 3,13" fill="#7BA88E" fill-opacity="0.15"/><polygon points="12,3 21,13 3,13"/><polygon points="12,9 20,19 4,19" fill="#7BA88E" fill-opacity="0.15"/><polygon points="12,9 20,19 4,19"/><rect x="10" y="19" width="4" height="3" rx="1"/></svg>', label: '큰나무', bg: '#E4FFE4' },
  /* sq 11 목마    */ { emoji: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#C08898" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="10" r="7"/><circle cx="12" cy="10" r="2"/><line x1="12" y1="3" x2="12" y2="17"/><line x1="5" y1="10" x2="19" y2="10"/><line x1="7.1" y1="5.1" x2="16.9" y2="14.9"/><line x1="16.9" y1="5.1" x2="7.1" y2="14.9"/><line x1="12" y1="17" x2="9" y2="21"/><line x1="12" y1="17" x2="15" y2="21"/><line x1="9" y1="21" x2="15" y2="21"/></svg>', label: '목마', bg: '#FFE4F8' },
  /* sq 12 꽃밭    */ { emoji: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#C08898" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="20" x2="12" y2="12"/><path d="M8 8C8 8 8 4 12 4 16 4 16 8 16 8 16 12 12 13 12 13 12 13 8 12 8 8Z"/><path d="M12 14C10 13 8 14 7 16"/><path d="M12 14C14 13 16 14 17 16"/></svg>', label: '꽃밭', bg: '#FFE0EC' },
  /* sq 13 민들레집 */ { emoji: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#C8986A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="11" r="2.5"/><line x1="12" y1="8.5" x2="12" y2="4"/><line x1="12" y1="13.5" x2="12" y2="21"/><line x1="9.5" y1="11" x2="4" y2="11"/><line x1="14.5" y1="11" x2="20" y2="11"/><line x1="10.2" y1="9.2" x2="6" y2="5"/><line x1="13.8" y1="12.8" x2="18" y2="17"/><line x1="13.8" y1="9.2" x2="18" y2="5"/><line x1="10.2" y1="12.8" x2="6" y2="17"/></svg>', label: '민들레집', bg: '#FFFAE0' },
  /* sq 14 딸기밭  */ { emoji: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#C08898" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 9C7 6.2 9.2 4 12 4C14.8 4 17 6.2 17 9C17 14 12 20 12 20S7 14 7 9Z"/><path d="M10 4C10 2.5 12 2 12 2S14 2.5 14 4"/><line x1="9" y1="10" x2="15" y2="10"/><line x1="8.5" y1="13" x2="15.5" y2="13"/></svg>', label: '딸기밭', bg: '#FFE8E8' },
  /* sq 15 곰굴    */ { emoji: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#A89068" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13" r="7"/><circle cx="7.5" cy="7" r="3"/><circle cx="16.5" cy="7" r="3"/><circle cx="9.5" cy="12.5" r="1" fill="#A89068" stroke="none"/><circle cx="14.5" cy="12.5" r="1" fill="#A89068" stroke="none"/><path d="M10 17Q12 19 14 17"/><ellipse cx="12" cy="15.5" rx="2.5" ry="1.5"/></svg>', label: '곰굴', bg: '#E4F0FF' },
  /* sq 16 과녁    */ { emoji: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#C8986A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5.5"/><circle cx="12" cy="12" r="2.5" fill="#C8986A" fill-opacity="0.25"/></svg>', label: '과녁', bg: '#FFF0DC' },
  /* sq 17 달밤    */ { emoji: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#9B88C0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/><circle cx="18" cy="5" r="1" fill="#9B88C0" stroke="none"/><circle cx="20" cy="9" r="0.7" fill="#9B88C0" stroke="none"/><circle cx="4" cy="8" r="0.7" fill="#9B88C0" stroke="none"/></svg>', label: '달밤', bg: '#F0E4FF' },
  /* sq 18 별자리  */ { emoji: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#9B88C0" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="5" cy="6" r="1.2" fill="#9B88C0" stroke="none"/><circle cx="11" cy="4" r="1.2" fill="#9B88C0" stroke="none"/><circle cx="17" cy="7" r="1.2" fill="#9B88C0" stroke="none"/><circle cx="20" cy="13" r="1.2" fill="#9B88C0" stroke="none"/><circle cx="14" cy="17" r="1.2" fill="#9B88C0" stroke="none"/><circle cx="7" cy="15" r="1.2" fill="#9B88C0" stroke="none"/><line x1="5" y1="6" x2="11" y2="4"/><line x1="11" y1="4" x2="17" y2="7"/><line x1="17" y1="7" x2="20" y2="13"/><line x1="20" y1="13" x2="14" y2="17"/><line x1="14" y1="17" x2="7" y2="15"/><line x1="7" y1="15" x2="5" y2="6"/></svg>', label: '별자리', bg: '#FFFAE0' },
  /* sq 19 음악광장 */ { emoji: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#7BA88E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="8.5" cy="18" r="2.5"/><line x1="11" y1="18" x2="11" y2="7"/><line x1="11" y1="7" x2="19" y2="5"/><line x1="19" y1="5" x2="19" y2="16"/><circle cx="16.5" cy="16" r="2.5"/></svg>', label: '음악광장', bg: '#EDFFF0' },
  /* sq 20 동화성 (랜드마크) */ { emoji: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#9B88C0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="13" width="18" height="8" rx="1"/><rect x="5" y="9" width="4" height="5"/><rect x="10" y="7" width="4" height="7"/><rect x="15" y="9" width="4" height="5"/><path d="M5 9V7M7 9V7M10 7V5M12 7V5M14 7V5M15 9V7M17 9V7M19 9V7"/><rect x="10" y="17" width="4" height="4"/></svg>', label: '동화성', bg: '#EEE4FF' },
  /* sq 21 선물    */ { emoji: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#C08898" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="9" width="18" height="12" rx="1"/><rect x="3" y="6" width="18" height="4" rx="1"/><line x1="12" y1="6" x2="12" y2="21"/><path d="M12 6C10.5 4.5 8 4.5 8 6.5C8 8 10 8.5 12 6Z"/><path d="M12 6C13.5 4.5 16 4.5 16 6.5C16 8 14 8.5 12 6Z"/></svg>', label: '선물', bg: '#FFE0EC' },
  /* sq 22 나비정원 */ { emoji: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#9B88C0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9C10 5 6 3 4 5C2 7 4 11 8 11.5C10 12 12 12 12 12"/><path d="M12 9C14 5 18 3 20 5C22 7 20 11 16 11.5C14 12 12 12 12 12"/><path d="M12 12C10 14 7 17 6 19C7 21 10 20 12 18C12 16 12 14 12 14"/><path d="M12 12C14 14 17 17 18 19C17 21 14 20 12 18C12 16 12 14 12 14"/><line x1="12" y1="7" x2="12" y2="19"/></svg>', label: '나비정원', bg: '#EDF4FF' },
  /* sq 23 케이크  */ { emoji: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#C08898" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="14" width="16" height="7" rx="1"/><rect x="6" y="10" width="12" height="5" rx="1"/><line x1="12" y1="10" x2="12" y2="5"/><path d="M11 5C11 3.5 12 3 12 3C12 3 13 3.5 13 5"/></svg>', label: '케이크', bg: '#FFF0F8' },
  /* sq 24 열대꽃  */ { emoji: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#C08898" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="2.5"/><ellipse cx="12" cy="6.5" rx="1.8" ry="2.8"/><ellipse cx="12" cy="6.5" rx="1.8" ry="2.8" transform="rotate(60 12 12)"/><ellipse cx="12" cy="6.5" rx="1.8" ry="2.8" transform="rotate(120 12 12)"/><ellipse cx="12" cy="6.5" rx="1.8" ry="2.8" transform="rotate(180 12 12)"/><ellipse cx="12" cy="6.5" rx="1.8" ry="2.8" transform="rotate(240 12 12)"/><ellipse cx="12" cy="6.5" rx="1.8" ry="2.8" transform="rotate(300 12 12)"/></svg>', label: '열대꽃', bg: '#FFE8E8' },
  /* sq 25 관람차  */ { emoji: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#6B9AAA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="10" r="7"/><circle cx="12" cy="10" r="2"/><line x1="12" y1="3" x2="12" y2="17"/><line x1="5" y1="10" x2="19" y2="10"/><line x1="7.1" y1="5.1" x2="16.9" y2="14.9"/><line x1="16.9" y1="5.1" x2="7.1" y2="14.9"/><line x1="12" y1="17" x2="9" y2="21"/><line x1="12" y1="17" x2="15" y2="21"/><line x1="9" y1="21" x2="15" y2="21"/></svg>', label: '관람차', bg: '#E4FFFF' },
  /* sq 26 병아리  */ { emoji: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#C8986A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="14" r="6"/><circle cx="12" cy="8.5" r="3.5"/><circle cx="10" cy="7.5" r="0.8" fill="#C8986A" stroke="none"/><circle cx="14" cy="7.5" r="0.8" fill="#C8986A" stroke="none"/><path d="M11 9.5L12 10.5L13 9.5"/><path d="M8 18.5L6 20M16 18.5L18 20"/></svg>', label: '병아리', bg: '#FFFAE0' },
  /* sq 27 숲속길  */ { emoji: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#7BA88E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12,4 19,16 5,16"/><line x1="12" y1="16" x2="12" y2="21"/><polygon points="5,14 10,6 15,14"/><line x1="10" y1="14" x2="10" y2="19"/><path d="M9 21Q11 19.5 13 21"/></svg>', label: '숲속길', bg: '#E4FFE4' },
  /* sq 28 해변    */ { emoji: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#6B9AAA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 16C4 13 6 13 8 16C10 19 12 19 14 16C16 13 18 13 20 16"/><path d="M2 20C4 17 6 17 8 20"/><circle cx="17" cy="7" r="3"/><line x1="17" y1="3.5" x2="17" y2="1.5"/><line x1="20.1" y1="9.9" x2="21.5" y2="11.3"/><line x1="21.5" y1="7" x2="23" y2="7"/></svg>', label: '해변', bg: '#E0F4FF' },
  /* sq 29 버섯마을 */ { emoji: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#A89068" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 14A7 7 0 0 1 19 14Z"/><line x1="5" y1="14" x2="19" y2="14"/><line x1="9" y1="14" x2="9" y2="19"/><line x1="15" y1="14" x2="15" y2="19"/><path d="M9 19Q12 21 15 19"/><circle cx="10" cy="10" r="1.3" fill="#A89068" fill-opacity="0.4" stroke="none"/><circle cx="14" cy="9" r="1.3" fill="#A89068" fill-opacity="0.4" stroke="none"/></svg>', label: '버섯마을', bg: '#FFE8D6' },
  /* sq 30 분수대 (랜드마크) */ { emoji: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#6B9AAA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="20" rx="9" ry="2"/><ellipse cx="12" cy="15.5" rx="5" ry="1.5"/><line x1="12" y1="15.5" x2="12" y2="20"/><path d="M8 13C9 9 11 7 12 6C13 7 15 9 16 13"/><path d="M6 11C7.5 8 9.5 7 12 6"/><path d="M18 11C16.5 8 14.5 7 12 6"/></svg>', label: '분수대', bg: '#E0EEFF' },
  /* sq 31 여우마을 */ { emoji: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#C8986A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="14" r="6"/><path d="M7 10L5 4L11 8.5"/><path d="M17 10L19 4L13 8.5"/><circle cx="9.5" cy="13.5" r="1" fill="#C8986A" stroke="none"/><circle cx="14.5" cy="13.5" r="1" fill="#C8986A" stroke="none"/><path d="M10 17.5Q12 19.5 14 17.5"/><ellipse cx="12" cy="16" rx="2" ry="1.2" fill="#C8986A" fill-opacity="0.2" stroke="none"/></svg>', label: '여우마을', bg: '#FFE8D6' },
  /* sq 32 데이지밭 */ { emoji: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#7BA88E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="2.5"/><line x1="12" y1="4" x2="12" y2="9.5"/><line x1="12" y1="14.5" x2="12" y2="20"/><line x1="4" y1="12" x2="9.5" y2="12"/><line x1="14.5" y1="12" x2="20" y2="12"/><line x1="6.3" y1="6.3" x2="10" y2="10"/><line x1="14" y1="14" x2="17.7" y2="17.7"/><line x1="17.7" y1="6.3" x2="14" y2="10"/><line x1="10" y1="14" x2="6.3" y2="17.7"/></svg>', label: '데이지밭', bg: '#FFFAE0' },
  /* sq 33 풍선가게 */ { emoji: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#9B88C0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="9" r="6"/><path d="M9.5 14.5Q10.5 17 12 19Q13.5 17 14.5 14.5"/><line x1="12" y1="19" x2="12" y2="22"/><path d="M11 22Q12 21 13 22"/></svg>', label: '풍선가게', bg: '#FFE0EC' },
  /* sq 34 도넛가게 */ { emoji: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#C08898" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.5"/><path d="M8 5.5Q10 4 12 4Q14 4 16 5.5" stroke-width="2.5" stroke-linecap="round"/></svg>', label: '도넛가게', bg: '#FFF0DC' },
  /* sq 35 소원별  */ { emoji: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#9B88C0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L14 10L22 12L14 14L12 22L10 14L2 12L10 10Z" fill="#9B88C0" fill-opacity="0.15"/><path d="M12 2L14 10L22 12L14 14L12 22L10 14L2 12L10 10Z"/></svg>', label: '소원별', bg: '#FFFAE0' },
  /* sq 36 마을축제 */ { emoji: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#C8986A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 9C8 6.8 10 5 12 5C14 5 16 6.8 16 9V15C16 17.2 14 19 12 19C10 19 8 17.2 8 15V9Z"/><line x1="12" y1="5" x2="12" y2="3"/><line x1="12" y1="19" x2="12" y2="21"/><line x1="8" y1="12" x2="4" y2="11"/><line x1="8" y1="12" x2="4" y2="13"/><line x1="16" y1="12" x2="20" y2="11"/><line x1="16" y1="12" x2="20" y2="13"/></svg>', label: '마을축제', bg: '#FFF0DC' },
  /* sq 37 유니콘  */ { emoji: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#9B88C0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="14" r="6"/><path d="M9 10L12 3L15 10"/><circle cx="9.5" cy="14" r="1" fill="#9B88C0" stroke="none"/><circle cx="14.5" cy="14" r="1" fill="#9B88C0" stroke="none"/><path d="M10 17.5Q12 19.5 14 17.5"/><circle cx="20" cy="4" r="1.2" fill="#9B88C0" stroke="none"/><circle cx="18.5" cy="8" r="0.8" fill="#9B88C0" stroke="none"/><circle cx="22" cy="7" r="0.6" fill="#9B88C0" stroke="none"/></svg>', label: '유니콘', bg: '#F4E4FF' },
  /* sq 38 달빛길  */ { emoji: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#9B88C0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/><path d="M4 20Q8 17.5 12 20Q16 22.5 20 20"/><circle cx="19" cy="4" r="0.8" fill="#9B88C0" stroke="none"/><circle cx="22" cy="9" r="0.6" fill="#9B88C0" stroke="none"/></svg>', label: '달빛길', bg: '#F0E4FF' },
  /* sq 39 반짝임  */ { emoji: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="#9B88C0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L13.2 9L20 10L13.2 11L12 18L10.8 11L4 10L10.8 9Z" fill="#9B88C0" fill-opacity="0.15"/><path d="M12 2L13.2 9L20 10L13.2 11L12 18L10.8 11L4 10L10.8 9Z"/><path d="M19 17L19.5 19.5L22 20L19.5 20.5L19 23L18.5 20.5L16 20L18.5 19.5Z"/><path d="M4 4L4.4 5.8L6 6L4.4 6.2L4 8L3.6 6.2L2 6L3.6 5.8Z"/></svg>', label: '반짝임', bg: '#FFFAE0' },
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
