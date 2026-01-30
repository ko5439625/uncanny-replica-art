export interface User {
  id: number;
  name: string;
  nickname: string;
  emoji: string;
  isAdmin: boolean;
}

export interface Rule {
  id: number;
  text: string;
  order: number;
  visible: boolean;
}

export interface BalanceGame {
  id: number;
  optionA: string;
  optionB: string;
  votesA: number[];
  votesB: number[];
  createdAt: string;
  endedAt?: string;
}

export interface AnonymousPost {
  id: number;
  content: string;
  timestamp: string;
  likes: number;
  likedBy: number[];
  authorId: number;
}

export interface UserPost {
  id: number;
  userId: number;
  content: string;
  date: string;
  reactions: {
    '👍': number[];
    '🔥': number[];
    '😂': number[];
    '❤️': number[];
  };
}

export interface MeetingRecord {
  id: number;
  meetingNumber: number;
  userId: number;
  content: string;
  createdAt: string;
}

export interface Announcement {
  text: string;
  visible: boolean;
}

export interface AppData {
  users: User[];
  currentUser: User | null;
  availability: Record<string, number[]>;
  rules: Rule[];
  balanceGame: {
    active: BalanceGame | null;
    history: BalanceGame[];
  };
  tmiPosts: {
    anonymous: AnonymousPost[];
    byUser: UserPost[];
  };
  meetingRecords: MeetingRecord[];
  announcement: Announcement;
}

// 관리자 계정 (이끄는 이)
export const ADMIN_USER: User = {
  id: 0,
  name: "관리자",
  nickname: "이끄는 이",
  emoji: "👑",
  isAdmin: true,
};

export const ADMIN_PASSWORD = "950520";
export const MEMBER_PASSWORD = "0520";

export const INITIAL_DATA: AppData = {
  users: [
    ADMIN_USER, // 관리자 계정 추가
    { id: 1, name: "사용자1", nickname: "토끼", emoji: "🐰", isAdmin: false },
    { id: 2, name: "사용자2", nickname: "곰돌이", emoji: "🐻", isAdmin: false },
    { id: 3, name: "사용자3", nickname: "여우", emoji: "🦊", isAdmin: false },
    { id: 4, name: "사용자4", nickname: "냥이", emoji: "🐱", isAdmin: false },
    { id: 5, name: "사용자5", nickname: "멍멍이", emoji: "🐶", isAdmin: false },
    { id: 6, name: "사용자6", nickname: "판다", emoji: "🐼", isAdmin: false },
    { id: 7, name: "사용자7", nickname: "사자", emoji: "🦁", isAdmin: false },
    { id: 8, name: "사용자8", nickname: "호랑이", emoji: "🐯", isAdmin: false },
    { id: 9, name: "사용자9", nickname: "코알라", emoji: "🐨", isAdmin: false },
    { id: 10, name: "사용자10", nickname: "개구리", emoji: "🐸", isAdmin: false },
  ],
  currentUser: null,
  availability: {},
  rules: [
    { id: 1, text: "야, 너 금지 ❌", order: 1, visible: true },
    { id: 2, text: "닉네임 뒤에 님 붙이기 ✨", order: 2, visible: true },
    { id: 3, text: "울기 없기 😤", order: 3, visible: true },
  ],
  balanceGame: {
    active: {
      id: 1,
      optionA: "짜장면",
      optionB: "짬뽕",
      votesA: [],
      votesB: [],
      createdAt: new Date().toISOString(),
    },
    history: [],
  },
  tmiPosts: {
    anonymous: [
      {
        id: 1,
        content: "오늘 점심 너무 맛있었다 ㅠㅠ 떡볶이 최고...",
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        likes: 5,
        likedBy: [],
        authorId: 1,
      },
      {
        id: 2,
        content: "요즘 넷플릭스 뭐 볼게 없음... 추천 좀 해주세요 🙏",
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        likes: 2,
        likedBy: [],
        authorId: 3,
      },
    ],
    byUser: [
      {
        id: 1,
        userId: 1,
        content: "오늘 카페에서 공부했는데 너무 집중 잘됐어!",
        date: "2025-01-28",
        reactions: { '👍': [], '🔥': [], '😂': [], '❤️': [] },
      },
      {
        id: 2,
        userId: 2,
        content: "주말에 등산 갔다왔는데 날씨가 너무 좋았어 ☀️",
        date: "2025-01-27",
        reactions: { '👍': [1], '🔥': [], '😂': [], '❤️': [3] },
      },
    ],
  },
  meetingRecords: [],
  announcement: {
    text: "이번 주 토요일 정모 있습니다! 🎉",
    visible: true,
  },
};
