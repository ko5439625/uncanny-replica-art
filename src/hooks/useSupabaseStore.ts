import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Rule, AppData, ADMIN_USER, INITIAL_DATA } from '@/types';

const CURRENT_USER_KEY = 'smalltalk-current-user';

interface DbUser {
  id: number;
  name: string;
  nickname: string;
  emoji: string;
  is_admin: boolean;
  password: string;
}

interface DbRule {
  id: number;
  text: string;
  order_num: number;
  visible: boolean;
}

interface DbBalanceGame {
  id: number;
  option_a: string;
  option_b: string;
  is_active: boolean;
  created_at: string;
  ended_at: string | null;
}

interface DbBalanceVote {
  game_id: number;
  user_id: number;
  vote: 'A' | 'B';
}

interface DbAnonymousPost {
  id: number;
  content: string;
  author_id: number;
  created_at: string;
}

interface DbAnonymousPostLike {
  post_id: number;
  user_id: number;
}

interface DbUserPost {
  id: number;
  user_id: number;
  content: string;
  date: string;
  created_at: string;
}

interface DbUserPostReaction {
  post_id: number;
  user_id: number;
  emoji: string;
}

interface DbAnnouncement {
  id: number;
  text: string;
  visible: boolean;
}

export function useSupabaseStore() {
  const [data, setData] = useState<AppData>(INITIAL_DATA);
  const [loading, setLoading] = useState(true);

  // 현재 사용자 로컬 저장소에서 복원
  useEffect(() => {
    const savedUser = localStorage.getItem(CURRENT_USER_KEY);
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setData(prev => ({ ...prev, currentUser: user }));
      } catch (e) {
        console.error('Failed to restore current user:', e);
      }
    }
  }, []);

  // 데이터 로드
  const loadData = useCallback(async () => {
    try {
      const [
        usersRes,
        rulesRes,
        gamesRes,
        votesRes,
        anonymousPostsRes,
        anonymousLikesRes,
        userPostsRes,
        userReactionsRes,
        announcementRes,
        availabilityRes,
      ] = await Promise.all([
        supabase.from('users').select('*').order('id'),
        supabase.from('rules').select('*').order('order_num'),
        supabase.from('balance_games').select('*').order('created_at', { ascending: false }),
        supabase.from('balance_votes').select('*'),
        supabase.from('anonymous_posts').select('*').order('created_at', { ascending: false }),
        supabase.from('anonymous_post_likes').select('*'),
        supabase.from('user_posts').select('*').order('created_at', { ascending: false }),
        supabase.from('user_post_reactions').select('*'),
        supabase.from('announcement').select('*').limit(1),
        supabase.from('availability').select('*'),
      ]);

      const users: User[] = (usersRes.data as DbUser[] || []).map(u => ({
        id: u.id,
        name: u.name,
        nickname: u.nickname,
        emoji: u.emoji,
        isAdmin: u.is_admin,
      }));

      const rules: Rule[] = (rulesRes.data as DbRule[] || []).map(r => ({
        id: r.id,
        text: r.text,
        order: r.order_num,
        visible: r.visible,
      }));

      const games = gamesRes.data as DbBalanceGame[] || [];
      const votes = votesRes.data as DbBalanceVote[] || [];
      const activeGame = games.find(g => g.is_active);
      const historyGames = games.filter(g => !g.is_active);

      const anonymousPosts = anonymousPostsRes.data as DbAnonymousPost[] || [];
      const anonymousLikes = anonymousLikesRes.data as DbAnonymousPostLike[] || [];
      
      const userPosts = userPostsRes.data as DbUserPost[] || [];
      const userReactions = userReactionsRes.data as DbUserPostReaction[] || [];

      const announcement = (announcementRes.data as DbAnnouncement[] || [])[0];
      
      const availabilityData = availabilityRes.data as { date: string; user_id: number }[] || [];
      const availability: Record<string, number[]> = {};
      availabilityData.forEach(a => {
        if (!availability[a.date]) availability[a.date] = [];
        availability[a.date].push(a.user_id);
      });

      setData(prev => ({
        users,
        currentUser: prev.currentUser,
        availability,
        rules,
        balanceGame: {
          active: activeGame ? {
            id: activeGame.id,
            optionA: activeGame.option_a,
            optionB: activeGame.option_b,
            votesA: votes.filter(v => v.game_id === activeGame.id && v.vote === 'A').map(v => v.user_id),
            votesB: votes.filter(v => v.game_id === activeGame.id && v.vote === 'B').map(v => v.user_id),
            createdAt: activeGame.created_at,
          } : null,
          history: historyGames.map(g => ({
            id: g.id,
            optionA: g.option_a,
            optionB: g.option_b,
            votesA: votes.filter(v => v.game_id === g.id && v.vote === 'A').map(v => v.user_id),
            votesB: votes.filter(v => v.game_id === g.id && v.vote === 'B').map(v => v.user_id),
            createdAt: g.created_at,
            endedAt: g.ended_at || undefined,
          })),
        },
        tmiPosts: {
          anonymous: anonymousPosts.map(p => ({
            id: p.id,
            content: p.content,
            timestamp: p.created_at,
            likes: anonymousLikes.filter(l => l.post_id === p.id).length,
            likedBy: anonymousLikes.filter(l => l.post_id === p.id).map(l => l.user_id),
            authorId: p.author_id,
          })),
          byUser: userPosts.map(p => ({
            id: p.id,
            userId: p.user_id,
            content: p.content,
            date: p.date,
            reactions: {
              '👍': userReactions.filter(r => r.post_id === p.id && r.emoji === '👍').map(r => r.user_id),
              '🔥': userReactions.filter(r => r.post_id === p.id && r.emoji === '🔥').map(r => r.user_id),
              '😂': userReactions.filter(r => r.post_id === p.id && r.emoji === '😂').map(r => r.user_id),
              '❤️': userReactions.filter(r => r.post_id === p.id && r.emoji === '❤️').map(r => r.user_id),
            },
          })),
        },
        announcement: announcement ? {
          text: announcement.text,
          visible: announcement.visible,
        } : { text: '', visible: false },
      }));

      setLoading(false);
    } catch (e) {
      console.error('Failed to load data:', e);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Realtime 구독
  useEffect(() => {
    const channel = supabase
      .channel('db-changes')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => {
        loadData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadData]);

  // Auth
  const login = useCallback((userId: number) => {
    setData(prev => {
      const user = prev.users.find(u => u.id === userId) || null;
      if (user) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      }
      return { ...prev, currentUser: user };
    });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(CURRENT_USER_KEY);
    setData(prev => ({ ...prev, currentUser: null }));
  }, []);

  // Availability
  const toggleAvailability = useCallback(async (date: string) => {
    if (!data.currentUser) return;
    const userId = data.currentUser.id;
    const current = data.availability[date] || [];
    const isAvailable = current.includes(userId);

    if (isAvailable) {
      await supabase.from('availability').delete().eq('date', date).eq('user_id', userId);
    } else {
      await supabase.from('availability').insert({ date, user_id: userId });
    }
    loadData();
  }, [data.currentUser, data.availability, loadData]);

  // Rules
  const addRule = useCallback(async (text: string) => {
    const maxOrder = Math.max(...data.rules.map(r => r.order), 0);
    await supabase.from('rules').insert({ text, order_num: maxOrder + 1 });
    loadData();
  }, [data.rules, loadData]);

  const updateRule = useCallback(async (id: number, text: string) => {
    await supabase.from('rules').update({ text }).eq('id', id);
    loadData();
  }, [loadData]);

  const deleteRule = useCallback(async (id: number) => {
    await supabase.from('rules').delete().eq('id', id);
    loadData();
  }, [loadData]);

  const reorderRules = useCallback(async (rules: Rule[]) => {
    for (let i = 0; i < rules.length; i++) {
      await supabase.from('rules').update({ order_num: i + 1 }).eq('id', rules[i].id);
    }
    loadData();
  }, [loadData]);

  // Balance Game
  const voteBalanceGame = useCallback(async (option: 'A' | 'B') => {
    if (!data.currentUser || !data.balanceGame.active) return;
    const userId = data.currentUser.id;
    const gameId = data.balanceGame.active.id;

    const existingVote = await supabase
      .from('balance_votes')
      .select('*')
      .eq('game_id', gameId)
      .eq('user_id', userId)
      .maybeSingle();

    if (existingVote.data) {
      if (existingVote.data.vote === option) {
        await supabase.from('balance_votes').delete().eq('game_id', gameId).eq('user_id', userId);
      } else {
        await supabase.from('balance_votes').update({ vote: option }).eq('game_id', gameId).eq('user_id', userId);
      }
    } else {
      await supabase.from('balance_votes').insert({ game_id: gameId, user_id: userId, vote: option });
    }
    loadData();
  }, [data.currentUser, data.balanceGame.active, loadData]);

  const createBalanceGame = useCallback(async (optionA: string, optionB: string) => {
    // 기존 활성 게임 종료
    await supabase.from('balance_games').update({ is_active: false, ended_at: new Date().toISOString() }).eq('is_active', true);
    // 새 게임 생성
    await supabase.from('balance_games').insert({ option_a: optionA, option_b: optionB, is_active: true });
    loadData();
  }, [loadData]);

  const endBalanceGame = useCallback(async () => {
    await supabase.from('balance_games').update({ is_active: false, ended_at: new Date().toISOString() }).eq('is_active', true);
    loadData();
  }, [loadData]);

  // TMI Posts
  const addAnonymousPost = useCallback(async (content: string) => {
    if (!data.currentUser) return;
    await supabase.from('anonymous_posts').insert({ content, author_id: data.currentUser.id });
    loadData();
  }, [data.currentUser, loadData]);

  const likeAnonymousPost = useCallback(async (postId: number) => {
    if (!data.currentUser) return;
    const userId = data.currentUser.id;

    const existing = await supabase
      .from('anonymous_post_likes')
      .select('*')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .maybeSingle();

    if (existing.data) {
      await supabase.from('anonymous_post_likes').delete().eq('post_id', postId).eq('user_id', userId);
    } else {
      await supabase.from('anonymous_post_likes').insert({ post_id: postId, user_id: userId });
    }
    loadData();
  }, [data.currentUser, loadData]);

  const addUserPost = useCallback(async (content: string) => {
    if (!data.currentUser) return;
    const today = new Date().toISOString().split('T')[0];
    await supabase.from('user_posts').insert({ user_id: data.currentUser.id, content, date: today });
    loadData();
  }, [data.currentUser, loadData]);

  const deleteUserPost = useCallback(async (postId: number) => {
    if (!data.currentUser) return;
    await supabase.from('user_post_reactions').delete().eq('post_id', postId);
    await supabase.from('user_posts').delete().eq('id', postId).eq('user_id', data.currentUser.id);
    loadData();
  }, [data.currentUser, loadData]);

  const reactToUserPost = useCallback(async (postId: number, emoji: '👍' | '🔥' | '😂' | '❤️') => {
    if (!data.currentUser) return;
    const userId = data.currentUser.id;

    const existing = await supabase
      .from('user_post_reactions')
      .select('*')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .eq('emoji', emoji)
      .maybeSingle();

    if (existing.data) {
      await supabase.from('user_post_reactions').delete().eq('post_id', postId).eq('user_id', userId).eq('emoji', emoji);
    } else {
      await supabase.from('user_post_reactions').insert({ post_id: postId, user_id: userId, emoji });
    }
    loadData();
  }, [data.currentUser, loadData]);

  // Announcement
  const updateAnnouncement = useCallback(async (text: string, visible: boolean) => {
    await supabase.from('announcement').update({ text, visible, updated_at: new Date().toISOString() }).eq('id', 1);
    loadData();
  }, [loadData]);

  // Users
  const updateUser = useCallback(async (id: number, updates: Partial<User>) => {
    const dbUpdates: Partial<DbUser> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.nickname !== undefined) dbUpdates.nickname = updates.nickname;
    if (updates.emoji !== undefined) dbUpdates.emoji = updates.emoji;
    if (updates.isAdmin !== undefined) dbUpdates.is_admin = updates.isAdmin;

    await supabase.from('users').update(dbUpdates).eq('id', id);
    
    // 현재 사용자 업데이트
    if (data.currentUser?.id === id) {
      const updatedUser = { ...data.currentUser, ...updates };
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
      setData(prev => ({ ...prev, currentUser: updatedUser }));
    }
    loadData();
  }, [data.currentUser, loadData]);

  const addUser = useCallback(async (name: string, nickname: string, emoji: string) => {
    await supabase.from('users').insert({ name, nickname, emoji, is_admin: false });
    loadData();
  }, [loadData]);

  const deleteUser = useCallback(async (id: number) => {
    await supabase.from('users').delete().eq('id', id);
    loadData();
  }, [loadData]);

  // 비밀번호 검증
  const verifyPassword = useCallback(async (userId: number, password: string): Promise<boolean> => {
    const { data: user } = await supabase
      .from('users')
      .select('password')
      .eq('id', userId)
      .maybeSingle();
    
    return user?.password === password;
  }, []);

  // 비밀번호 변경
  const changePassword = useCallback(async (userId: number, newPassword: string) => {
    await supabase.from('users').update({ password: newPassword }).eq('id', userId);
  }, []);

  return {
    data,
    loading,
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
    deleteUserPost,
    reactToUserPost,
    updateAnnouncement,
    updateUser,
    addUser,
    deleteUser,
    verifyPassword,
    changePassword,
  };
}
