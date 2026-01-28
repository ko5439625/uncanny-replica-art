import { useState, useEffect, useCallback } from 'react';
import { AppData, INITIAL_DATA, User, Rule, BalanceGame, AnonymousPost, UserPost, ADMIN_USER } from '@/types';

const STORAGE_KEY = 'smalltalk-data';

function loadData(): AppData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed: AppData = JSON.parse(stored);
      
      // 관리자 계정이 없으면 자동으로 추가
      const hasAdmin = parsed.users.some(u => u.id === ADMIN_USER.id);
      if (!hasAdmin) {
        parsed.users = [ADMIN_USER, ...parsed.users];
      }
      
      return parsed;
    }
  } catch (e) {
    console.error('Failed to load data:', e);
  }
  return INITIAL_DATA;
}

function saveData(data: AppData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save data:', e);
  }
}

export function useAppStore() {
  const [data, setData] = useState<AppData>(loadData);

  useEffect(() => {
    saveData(data);
  }, [data]);

  // Auth
  const login = useCallback((userId: number) => {
    setData(prev => ({
      ...prev,
      currentUser: prev.users.find(u => u.id === userId) || null,
    }));
  }, []);

  const logout = useCallback(() => {
    setData(prev => ({ ...prev, currentUser: null }));
  }, []);

  // Availability
  const toggleAvailability = useCallback((date: string) => {
    setData(prev => {
      if (!prev.currentUser) return prev;
      const userId = prev.currentUser.id;
      const current = prev.availability[date] || [];
      const isAvailable = current.includes(userId);
      
      return {
        ...prev,
        availability: {
          ...prev.availability,
          [date]: isAvailable
            ? current.filter(id => id !== userId)
            : [...current, userId],
        },
      };
    });
  }, []);

  // Rules
  const addRule = useCallback((text: string) => {
    setData(prev => ({
      ...prev,
      rules: [
        ...prev.rules,
        {
          id: Date.now(),
          text,
          order: prev.rules.length + 1,
          visible: true,
        },
      ],
    }));
  }, []);

  const updateRule = useCallback((id: number, text: string) => {
    setData(prev => ({
      ...prev,
      rules: prev.rules.map(r => r.id === id ? { ...r, text } : r),
    }));
  }, []);

  const deleteRule = useCallback((id: number) => {
    setData(prev => ({
      ...prev,
      rules: prev.rules.filter(r => r.id !== id),
    }));
  }, []);

  const reorderRules = useCallback((rules: Rule[]) => {
    setData(prev => ({ ...prev, rules }));
  }, []);

  // Balance Game
  const voteBalanceGame = useCallback((option: 'A' | 'B') => {
    setData(prev => {
      if (!prev.currentUser || !prev.balanceGame.active) return prev;
      const userId = prev.currentUser.id;
      const game = prev.balanceGame.active;
      
      const isInA = game.votesA.includes(userId);
      const isInB = game.votesB.includes(userId);

      let newVotesA = game.votesA;
      let newVotesB = game.votesB;

      // 같은 옵션 클릭 시 취소 (토글)
      if (option === 'A' && isInA) {
        newVotesA = game.votesA.filter(id => id !== userId);
      } else if (option === 'B' && isInB) {
        newVotesB = game.votesB.filter(id => id !== userId);
      } else {
        // 다른 옵션으로 변경하거나 새로 투표
        newVotesA = isInA ? game.votesA.filter(id => id !== userId) : game.votesA;
        newVotesB = isInB ? game.votesB.filter(id => id !== userId) : game.votesB;
        
        if (option === 'A') {
          newVotesA = [...newVotesA, userId];
        } else {
          newVotesB = [...newVotesB, userId];
        }
      }

      return {
        ...prev,
        balanceGame: {
          ...prev.balanceGame,
          active: {
            ...game,
            votesA: newVotesA,
            votesB: newVotesB,
          },
        },
      };
    });
  }, []);

  const createBalanceGame = useCallback((optionA: string, optionB: string) => {
    setData(prev => ({
      ...prev,
      balanceGame: {
        active: {
          id: Date.now(),
          optionA,
          optionB,
          votesA: [],
          votesB: [],
          createdAt: new Date().toISOString(),
        },
        history: prev.balanceGame.active
          ? [...prev.balanceGame.history, { ...prev.balanceGame.active, endedAt: new Date().toISOString() }]
          : prev.balanceGame.history,
      },
    }));
  }, []);

  const endBalanceGame = useCallback(() => {
    setData(prev => ({
      ...prev,
      balanceGame: {
        active: null,
        history: prev.balanceGame.active
          ? [...prev.balanceGame.history, { ...prev.balanceGame.active, endedAt: new Date().toISOString() }]
          : prev.balanceGame.history,
      },
    }));
  }, []);

  // TMI Posts
  const addAnonymousPost = useCallback((content: string) => {
    setData(prev => {
      if (!prev.currentUser) return prev;
      return {
        ...prev,
        tmiPosts: {
          ...prev.tmiPosts,
          anonymous: [
            {
              id: Date.now(),
              content,
              timestamp: new Date().toISOString(),
              likes: 0,
              likedBy: [],
              authorId: prev.currentUser.id,
            },
            ...prev.tmiPosts.anonymous,
          ],
        },
      };
    });
  }, []);

  const likeAnonymousPost = useCallback((postId: number) => {
    setData(prev => {
      if (!prev.currentUser) return prev;
      const userId = prev.currentUser.id;
      
      return {
        ...prev,
        tmiPosts: {
          ...prev.tmiPosts,
          anonymous: prev.tmiPosts.anonymous.map(post => {
            if (post.id !== postId) return post;
            const hasLiked = post.likedBy.includes(userId);
            return {
              ...post,
              likes: hasLiked ? post.likes - 1 : post.likes + 1,
              likedBy: hasLiked
                ? post.likedBy.filter(id => id !== userId)
                : [...post.likedBy, userId],
            };
          }),
        },
      };
    });
  }, []);

  const addUserPost = useCallback((content: string) => {
    setData(prev => {
      if (!prev.currentUser) return prev;
      return {
        ...prev,
        tmiPosts: {
          ...prev.tmiPosts,
          byUser: [
            {
              id: Date.now(),
              userId: prev.currentUser.id,
              content,
              date: new Date().toISOString().split('T')[0],
              reactions: { '👍': [], '🔥': [], '😂': [], '❤️': [] },
            },
            ...prev.tmiPosts.byUser,
          ],
        },
      };
    });
  }, []);

  const reactToUserPost = useCallback((postId: number, emoji: '👍' | '🔥' | '😂' | '❤️') => {
    setData(prev => {
      if (!prev.currentUser) return prev;
      const userId = prev.currentUser.id;
      
      return {
        ...prev,
        tmiPosts: {
          ...prev.tmiPosts,
          byUser: prev.tmiPosts.byUser.map(post => {
            if (post.id !== postId) return post;
            const hasReacted = post.reactions[emoji].includes(userId);
            return {
              ...post,
              reactions: {
                ...post.reactions,
                [emoji]: hasReacted
                  ? post.reactions[emoji].filter(id => id !== userId)
                  : [...post.reactions[emoji], userId],
              },
            };
          }),
        },
      };
    });
  }, []);

  // Announcement
  const updateAnnouncement = useCallback((text: string, visible: boolean) => {
    setData(prev => ({
      ...prev,
      announcement: { text, visible },
    }));
  }, []);

  // Users
  const updateUser = useCallback((id: number, updates: Partial<User>) => {
    setData(prev => ({
      ...prev,
      users: prev.users.map(u => u.id === id ? { ...u, ...updates } : u),
      currentUser: prev.currentUser?.id === id
        ? { ...prev.currentUser, ...updates }
        : prev.currentUser,
    }));
  }, []);

  const addUser = useCallback((name: string, nickname: string, emoji: string) => {
    setData(prev => ({
      ...prev,
      users: [
        ...prev.users,
        { id: Date.now(), name, nickname, emoji, isAdmin: false },
      ],
    }));
  }, []);

  const deleteUser = useCallback((id: number) => {
    setData(prev => ({
      ...prev,
      users: prev.users.filter(u => u.id !== id),
    }));
  }, []);

  return {
    data,
    login,
    logout,
    toggleAvailability,
    addRule,
    updateRule,
    deleteRule,
    reorderRules,
    voteBalanceGame,
    createBalanceGame,
    endBalanceGame,
    addAnonymousPost,
    likeAnonymousPost,
    addUserPost,
    reactToUserPost,
    updateAnnouncement,
    updateUser,
    addUser,
    deleteUser,
  };
}
