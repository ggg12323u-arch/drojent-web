'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const DEV_EMAIL = 'ggg12323u@gmail.com';
const REACTION_EMOJIS = ['🔥', '❤️', '👍', '😂', '😮', '😢'];

// Палитры тем
const THEMES = {
  blue: {
    primary: '#38bdf8',
    secondary: '#2563eb',
    glow: 'rgba(56, 189, 248, 0.4)',
    border: 'rgba(56, 189, 248, 0.3)',
    bgCard: 'rgba(15, 23, 42, 0.75)',
    gradient: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)'
  },
  green: {
    primary: '#22c55e',
    secondary: '#16a34a',
    glow: 'rgba(34, 197, 94, 0.4)',
    border: 'rgba(34, 197, 94, 0.3)',
    bgCard: 'rgba(6, 78, 59, 0.65)',
    gradient: 'linear-gradient(135deg, #15803d 0%, #22c55e 100%)'
  },
  purple: {
    primary: '#c084fc',
    secondary: '#9333ea',
    glow: 'rgba(192, 132, 252, 0.4)',
    border: 'rgba(192, 132, 252, 0.3)',
    bgCard: 'rgba(88, 28, 135, 0.65)',
    gradient: 'linear-gradient(135deg, #7e22ce 0%, #c084fc 100%)'
  }
};

const Icons = {
  Back: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>,
  Send: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  Camera: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  Mic: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>,
  Stop: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>,
  Trash: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  Support: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  Pin: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14l-1.5-6H6.5L5 17z"/><path d="M9 11V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v7"/></svg>,
  Crown: () => <span style={{ filter: 'drop-shadow(0 0 6px #f59e0b)' }}>👑</span>,
  // Новые иконки статуса доставки: круг = отправлено, круг с точкой = прочитано
  Sent: ({ color = 'currentColor' }) => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><circle cx="12" cy="12" r="9"/></svg>,
  Read: ({ color = 'currentColor' }) => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.2" fill={color}/></svg>
};

export default function Home() {
  const [session, setSession] = useState(null);
  const [loginInput, setLoginInput] = useState('');
  const [password, setPassword] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');

  const [myProfile, setMyProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('chats'); // 'chats' | 'profile' | 'tickets' | 'users'
  const [themeKey, setThemeKey] = useState('blue'); // 'blue' | 'green' | 'purple'
  const theme = THEMES[themeKey];

  const [editFullName, setEditFullName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editBirthdate, setEditBirthdate] = useState('');
  const [editCustomStatus, setEditCustomStatus] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [publicCommunityResults, setPublicCommunityResults] = useState([]);
  const [myChats, setMyChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [activeChatData, setActiveChatData] = useState(null);
  const [pinnedMsgData, setPinnedMsgData] = useState(null);
  const [activeUser, setActiveUser] = useState(null);
  const [myChatRole, setMyChatRole] = useState(null);
  const [subscriberCount, setSubscriberCount] = useState(0);

  const [showUserProfileModal, setShowUserProfileModal] = useState(false);
  const [showCreateCommunityModal, setShowCreateCommunityModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [previewChat, setPreviewChat] = useState(null); // предпросмотр канала перед подпиской

  const [communityType, setCommunityType] = useState('group');
  const [communityName, setCommunityName] = useState('');
  const [communityDesc, setCommunityDesc] = useState('');
  const [communityAvatar, setCommunityAvatar] = useState('');
  const [newMemberName, setNewMemberName] = useState('');

  // Комментарии к постам в каналах
  const [openCommentsForMsg, setOpenCommentsForMsg] = useState(null);
  const [commentsList, setCommentsList] = useState([]);
  const [newCommentText, setNewCommentText] = useState('');

  // Поддержка
  const [tickets, setTickets] = useState([]);
  const [mySupportMessages, setMySupportMessages] = useState([]);
  const [newSupportMsg, setNewSupportMsg] = useState('');
  const [isSupportMode, setIsSupportMode] = useState(false);
  const [replyTicketText, setReplyTicketText] = useState({});

  // Stories
  const [stories, setStories] = useState([]);
  const [activeStory, setActiveStory] = useState(null);

  // Сообщения
  const [messages, setMessages] = useState([]);
  const [reactions, setReactions] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const [editingMsg, setEditingMsg] = useState(null);
  const [replyingMsg, setReplyingMsg] = useState(null);
  const [forwardingMsg, setForwardingMsg] = useState(null);
  const [selectedMsgForMenu, setSelectedMsgForMenu] = useState(null);

  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const messagesContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Кастомные эмодзи чата
  const [customEmojis, setCustomEmojis] = useState([]);

  // Админ-панель разработчика: список пользователей
  const [allUsers, setAllUsers] = useState([]);

  // Печатает / онлайн
  const [typingUsers, setTypingUsers] = useState([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  const loadProfile = async () => {
    if (!session) return;
    const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
    if (data) {
      setMyProfile(data);
      setEditFullName(data.full_name || '');
      setEditUsername(data.username || '');
      setEditBirthdate(data.birthdate || '');
      setEditCustomStatus(data.custom_status || '');
      setAvatarUrl(data.avatar_url || '');
    }
  };

  // Только истории контактов (+ свои)
  const fetchStories = async () => {
    if (!session) return;
    const { data: contactRows } = await supabase.from('contacts').select('contact_id').eq('owner_id', session.user.id);
    const allowedIds = [session.user.id, ...((contactRows || []).map(c => c.contact_id))];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data } = await supabase.from('stories').select('*, profiles(username, avatar_url)').gte('created_at', yesterday).in('user_id', allowedIds).order('created_at', { ascending: false });
    if (data) setStories(data);
  };

  const fetchSupportTickets = async () => {
    if (!session) return;
    if (session.user.email === DEV_EMAIL) {
      const { data } = await supabase.from('support_tickets').select('*, profiles(username, avatar_url)').order('created_at', { ascending: false });
      if (data) setTickets(data);
    } else {
      const { data } = await supabase.from('support_tickets').select('*').eq('user_id', session.user.id).order('created_at', { ascending: true });
      if (data) setMySupportMessages(data);
    }
  };

  const fetchAllUsers = async () => {
    if (!session || session.user.email !== DEV_EMAIL) return;
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (data) setAllUsers(data);
  };

  const toggleBanUser = async (u) => {
    await supabase.from('profiles').update({ is_banned: !u.is_banned }).eq('id', u.id);
    fetchAllUsers();
  };

  const fetchMyChats = async () => {
    if (!session) return;
    const { data: parts } = await supabase.from('chat_participants').select('chat_id').eq('user_id', session.user.id);
    if (parts && parts.length > 0) {
      const chatIds = parts.map(p => p.chat_id);
      const { data: chatsData } = await supabase.from('chats').select('*').in('id', chatIds);
      const { data: allParts } = await supabase.from('chat_participants').select('chat_id, user_id, profiles(id, username, full_name, avatar_url, status_badge, custom_status, is_online)').in('chat_id', chatIds);

      if (chatsData) {
        const formatted = chatsData.map(c => {
          if (c.type === 'group' || c.type === 'channel') return { chat_id: c.id, isGroupOrChannel: true, chatDetails: c };
          const p = allParts?.filter(x => x.chat_id === c.id) || [];
          if (p.length === 1 && p[0].user_id === session.user.id) return { chat_id: c.id, profiles: { id: session.user.id, username: 'Избранное', avatar_url: myProfile?.avatar_url, custom_status: 'Заметки' } };
          const partner = p.find(x => x.user_id !== session.user.id);
          return partner || null;
        }).filter(Boolean);
        setMyChats(formatted);
      }
    } else setMyChats([]);
  };

  useEffect(() => {
    loadProfile();
    if (session) {
      fetchStories();
      fetchSupportTickets();
      fetchMyChats();
      fetchAllUsers();
    }
  }, [session]);

  // Глобальная realtime-подписка — обновляет список чатов, истории и т.д. без перезагрузки страницы
  useEffect(() => {
    if (!session) return;
    const globalChan = supabase.channel('global_updates_' + session.user.id)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => fetchMyChats())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_participants' }, () => fetchMyChats())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chats' }, () => fetchMyChats())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'stories' }, () => fetchStories())
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, () => fetchMyChats())
      .subscribe();
    return () => { supabase.removeChannel(globalChan); };
  }, [session]);

  // Онлайн-статус: heartbeat пока страница открыта
  useEffect(() => {
    if (!session) return;
    const goOnline = () => supabase.from('profiles').update({ is_online: true, last_seen: new Date().toISOString() }).eq('id', session.user.id);
    const goOffline = () => supabase.from('profiles').update({ is_online: false, last_seen: new Date().toISOString() }).eq('id', session.user.id);
    goOnline();
    const iv = setInterval(goOnline, 25000);
    window.addEventListener('beforeunload', goOffline);
    document.addEventListener('visibilitychange', () => { if (document.hidden) goOffline(); else goOnline(); });
    return () => { clearInterval(iv); window.removeEventListener('beforeunload', goOffline); goOffline(); };
  }, [session]);

  useEffect(() => {
    if (!session) return;
    const search = async () => {
      if (!searchQuery.trim()) { setSearchResults([]); setPublicCommunityResults([]); return; }
      const { data: u } = await supabase.from('profiles').select('*').ilike('username', `%${searchQuery}%`);
      if (u) setSearchResults(u);
      const { data: c } = await supabase.from('chats').select('*').eq('is_public', true).ilike('name', `%${searchQuery}%`);
      if (c) setPublicCommunityResults(c);
    };
    const t = setTimeout(search, 300);
    return () => clearTimeout(t);
  }, [searchQuery, session]);

  useEffect(() => {
    if (!activeChat) { setMessages([]); setReactions([]); setActiveChatData(null); setPinnedMsgData(null); setMyChatRole(null); setSubscriberCount(0); setCustomEmojis([]); return; }
    const loadChat = async () => {
      const { data: chat } = await supabase.from('chats').select('*').eq('id', activeChat).single();
      if (chat) {
        setActiveChatData(chat);
        setCommunityAvatar(chat.avatar_url || '');
        if (chat.pinned_message_id) {
          const { data: pin } = await supabase.from('messages').select('*').eq('id', chat.pinned_message_id).single();
          if (pin) setPinnedMsgData(pin);
        } else {
          setPinnedMsgData(null);
        }
        if (chat.type === 'channel' || chat.type === 'group') {
          const { count } = await supabase.from('chat_participants').select('*', { count: 'exact', head: true }).eq('chat_id', activeChat);
          setSubscriberCount(count || 0);
        }
      }
      const { data: role } = await supabase.from('chat_participants').select('role').eq('chat_id', activeChat).eq('user_id', session.user.id).single();
      setMyChatRole(role?.role || 'member');

      const { data: msgs } = await supabase.from('messages').select('*').eq('chat_id', activeChat).order('created_at', { ascending: true });
      if (msgs) {
        setMessages(msgs);
        setTimeout(scrollToBottom, 150);
        const { data: r } = await supabase.from('message_reactions').select('*').in('message_id', msgs.map(m => m.id));
        if (r) setReactions(r);
      }
      const { data: emj } = await supabase.from('custom_emojis').select('*').eq('chat_id', activeChat);
      if (emj) setCustomEmojis(emj);

      await supabase.from('messages').update({ is_read: true }).eq('chat_id', activeChat).neq('sender_id', session.user.id);
    };
    loadChat();
    const chan = supabase.channel(`chat_${activeChat}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `chat_id=eq.${activeChat}` }, loadChat)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'message_reactions' }, loadChat)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chats', filter: `id=eq.${activeChat}` }, loadChat)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_participants', filter: `chat_id=eq.${activeChat}` }, loadChat)
      .subscribe();
    return () => { supabase.removeChannel(chan); };
  }, [activeChat, session]);

  // Статус "печатает"
  useEffect(() => {
    if (!activeChat || !session) { setTypingUsers([]); return; }
    const loadTyping = async () => {
      const cutoff = new Date(Date.now() - 4000).toISOString();
      const { data } = await supabase.from('typing_status').select('user_id, profiles(username)').eq('chat_id', activeChat).gt('updated_at', cutoff).neq('user_id', session.user.id);
      setTypingUsers(data || []);
    };
    loadTyping();
    const chan = supabase.channel(`typing_${activeChat}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'typing_status', filter: `chat_id=eq.${activeChat}` }, loadTyping)
      .subscribe();
    const iv = setInterval(loadTyping, 2500);
    return () => { supabase.removeChannel(chan); clearInterval(iv); };
  }, [activeChat, session]);

  const handleTyping = (val) => {
    setNewMessage(val);
    if (!activeChat || !session) return;
    supabase.from('typing_status').upsert({ chat_id: activeChat, user_id: session.user.id, updated_at: new Date().toISOString() });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      supabase.from('typing_status').delete().eq('chat_id', activeChat).eq('user_id', session.user.id);
    }, 3000);
  };

  // Загрузка комментариев
  useEffect(() => {
    if (!openCommentsForMsg) { setCommentsList([]); return; }
    const loadComments = async () => {
      const { data } = await supabase.from('channel_comments').select('*, profiles(username, avatar_url)').eq('message_id', openCommentsForMsg.id).order('created_at', { ascending: true });
      if (data) setCommentsList(data);
    };
    loadComments();
  }, [openCommentsForMsg]);

  const sendComment = async () => {
    if (!newCommentText.trim() || !openCommentsForMsg) return;
    await supabase.from('channel_comments').insert([{ message_id: openCommentsForMsg.id, user_id: session.user.id, content: newCommentText }]);
    setNewCommentText('');
    const { data } = await supabase.from('channel_comments').select('*, profiles(username, avatar_url)').eq('message_id', openCommentsForMsg.id).order('created_at', { ascending: true });
    if (data) setCommentsList(data);
  };

  const saveProfile = async () => {
    await supabase.from('profiles').update({ full_name: editFullName, username: editUsername, birthdate: editBirthdate, custom_status: editCustomStatus, avatar_url: avatarUrl }).eq('id', session.user.id);
    alert('Профиль сохранен!');
    loadProfile();
  };

  const createCommunity = async () => {
    if (!communityName.trim()) return;
    const { data: existing } = await supabase.from('chats').select('id').eq('owner_id', session.user.id).eq('type', communityType);
    if (existing && existing.length > 0) { alert(`Лимит: 1 ${communityType} на аккаунт.`); return; }
    const { data: newC } = await supabase.from('chats').insert([{ type: communityType, name: communityName, description: communityDesc, owner_id: session.user.id, is_public: true }]).select().single();
    if (newC) {
      await supabase.from('chat_participants').insert([{ chat_id: newC.id, user_id: session.user.id, role: 'owner' }]);
      setShowCreateCommunityModal(false); fetchMyChats(); setActiveChat(newC.id);
    }
  };

  const updateCommunity = async () => {
    await supabase.from('chats').update({ name: activeChatData.name, description: activeChatData.description, avatar_url: communityAvatar }).eq('id', activeChat);
    alert('Сохранено'); setShowAdminModal(false); fetchMyChats();
  };

  const pinMessage = async (msgId) => {
    await supabase.from('chats').update({ pinned_message_id: msgId }).eq('id', activeChat);
    setSelectedMsgForMenu(null);
  };

  // Открепление сообщения
  const unpinMessage = async () => {
    await supabase.from('chats').update({ pinned_message_id: null }).eq('id', activeChat);
    setPinnedMsgData(null);
  };

  const addMemberToComm = async () => {
    const { data: u } = await supabase.from('profiles').select('id').eq('username', newMemberName).single();
    if (!u) { alert('Пользователь не найден'); return; }
    await supabase.from('chat_participants').insert({ chat_id: activeChat, user_id: u.id, role: 'member' });
    setNewMemberName(''); alert('Добавлен!');
  };

  const promoteToAdmin = async (username) => {
    const { data: u } = await supabase.from('profiles').select('id').eq('username', username).single();
    if (!u) { alert('Пользователь не найден'); return; }
    await supabase.from('chat_participants').update({ role: 'admin' }).eq('chat_id', activeChat).eq('user_id', u.id);
    alert('Назначен админом чата');
  };

  const joinCommunity = async (comm) => {
    const { data: ex } = await supabase.from('chat_participants').select('id').eq('chat_id', comm.id).eq('user_id', session.user.id);
    if (!ex || ex.length === 0) await supabase.from('chat_participants').insert([{ chat_id: comm.id, user_id: session.user.id, role: 'member' }]);
    setActiveChat(comm.id); setActiveUser(null); setSearchQuery(''); fetchMyChats();
  };

  // Клик по каналу/группе в поиске: канал сначала показывает предпросмотр с кнопкой "Подписаться"
  const openChannelOrGroup = async (c) => {
    const { data: ex } = await supabase.from('chat_participants').select('id').eq('chat_id', c.id).eq('user_id', session.user.id);
    const isSub = ex && ex.length > 0;
    if (c.type === 'channel' && !isSub) {
      const { count } = await supabase.from('chat_participants').select('*', { count: 'exact', head: true }).eq('chat_id', c.id);
      setPreviewChat({ ...c, subscriberCount: count || 0 });
      return;
    }
    joinCommunity(c);
  };

  const subscribeToPreviewChannel = async () => {
    if (!previewChat) return;
    await joinCommunity(previewChat);
    setPreviewChat(null);
  };

  const startChatWithUser = async (targetUser) => {
    setIsSupportMode(false); setActiveUser(targetUser); setSearchQuery('');
    const isSaved = targetUser.id === session.user.id;
    const { data: myP } = await supabase.from('chat_participants').select('chat_id').eq('user_id', session.user.id);
    const myChatIds = myP?.map(c => c.chat_id) || [];

    // Автоматически добавляем друг друга в контакты (нужно для видимости историй)
    if (!isSaved) {
      const { data: existingContact } = await supabase.from('contacts').select('id').eq('owner_id', session.user.id).eq('contact_id', targetUser.id);
      if (!existingContact || existingContact.length === 0) {
        await supabase.from('contacts').insert([{ owner_id: session.user.id, contact_id: targetUser.id }]);
        await supabase.from('contacts').insert([{ owner_id: targetUser.id, contact_id: session.user.id }]);
      }
    }

    if (myChatIds.length > 0) {
      if (isSaved) {
        for (let cid of myChatIds) {
          const { data: p } = await supabase.from('chat_participants').select('user_id').eq('chat_id', cid);
          if (p && p.length === 1 && p[0].user_id === session.user.id) { setActiveChat(cid); return; }
        }
      } else {
        const { data: cChat } = await supabase.from('chat_participants').select('chat_id').eq('user_id', targetUser.id).in('chat_id', myChatIds).limit(1);
        if (cChat && cChat.length > 0) { setActiveChat(cChat[0].chat_id); return; }
      }
    }
    const { data: nChat } = await supabase.from('chats').insert([{ type: 'dm' }]).select().single();
    if (nChat) {
      if (isSaved) await supabase.from('chat_participants').insert([{ chat_id: nChat.id, user_id: session.user.id }]);
      else await supabase.from('chat_participants').insert([{ chat_id: nChat.id, user_id: session.user.id }, { chat_id: nChat.id, user_id: targetUser.id }]);
      setActiveChat(nChat.id); fetchMyChats();
    }
  };

  const sendMessage = async (type = 'text', mediaUrl = '') => {
    if (activeChatData?.type === 'channel' && activeChatData.owner_id !== session.user.id) return;
    if (editingMsg) {
      if (!newMessage.trim()) return;
      await supabase.from('messages').update({ content: newMessage, is_edited: true }).eq('id', editingMsg.id);
      setEditingMsg(null); setNewMessage(''); return;
    }
    const txt = type === 'text' ? newMessage : mediaUrl;
    if (type === 'text' && !txt.trim()) return;
    if (type === 'text') setNewMessage('');
    const finalContent = replyingMsg ? `💬 [Ответ]\n${txt}` : txt;
    setReplyingMsg(null);
    await supabase.from('messages').insert([{ chat_id: activeChat, sender_id: session.user.id, content: finalContent }]);
    clearTimeout(typingTimeoutRef.current);
    supabase.from('typing_status').delete().eq('chat_id', activeChat).eq('user_id', session.user.id);
  };

  // Права: в группах/каналах удалять чужие сообщения может только владелец/админ чата; свои — всегда
  const isChatAdmin = !!session && (activeChatData?.owner_id === session.user.id || myChatRole === 'admin');

  const canDeleteMessage = (msg) => {
    if (!session) return false;
    if (msg.sender_id === session.user.id) return true;
    if (activeChatData?.type === 'group' || activeChatData?.type === 'channel') return isChatAdmin;
    return false;
  };

  const deleteMessage = async (msgId) => {
    const msg = messages.find(m => m.id === msgId);
    if (msg && !canDeleteMessage(msg)) { alert('Удалять чужие сообщения может только админ.'); return; }
    await supabase.from('messages').delete().eq('id', msgId);
    setMessages(prev => prev.filter(m => m.id !== msgId));
    setSelectedMsgForMenu(null);
  };

  const deleteChat = async () => {
    if ((activeChatData?.type === 'group' || activeChatData?.type === 'channel') && !isChatAdmin) {
      alert('Удалить этот чат может только админ.');
      return;
    }
    if (confirm('Удалить этот чат?')) {
      await supabase.from('chats').delete().eq('id', activeChat);
      setActiveChat(null); setActiveUser(null); fetchMyChats();
    }
  };

  const toggleReaction = async (msgId, emoji) => {
    const ex = reactions.find(r => r.message_id === msgId && r.user_id === session.user.id && r.emoji === emoji);
    if (ex) await supabase.from('message_reactions').delete().eq('id', ex.id);
    else await supabase.from('message_reactions').insert([{ message_id: msgId, user_id: session.user.id, emoji }]);
    setSelectedMsgForMenu(null);
  };

  const handleMediaUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const safeExt = (file.name.split('.').pop() || 'bin').toLowerCase();
    const name = `${type}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${safeExt}`;
    const { error } = await supabase.storage.from('media').upload(name, file, {
      contentType: file.type || 'application/octet-stream',
      cacheControl: '3600',
      upsert: true
    });
    if (error) {
      // Раньше ошибка молча проглатывалась — поэтому казалось, что "фотки не отправляются"
      alert('Не удалось загрузить файл: ' + error.message + '\nПроверьте, что бакет "media" в Supabase Storage публичный и есть policy на insert для authenticated.');
      e.target.value = '';
      return;
    }
    const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(name);
    if (type === 'story') { await supabase.from('stories').insert([{ user_id: session.user.id, media_url: publicUrl }]); fetchStories(); }
    else if (type === 'avatar') setAvatarUrl(publicUrl);
    else if (type === 'comm_avatar') setCommunityAvatar(publicUrl);
    else if (type === 'emoji') {
      await supabase.from('custom_emojis').insert([{ chat_id: activeChat, name: file.name.split('.')[0], image_url: publicUrl, created_by: session.user.id }]);
      const { data: emj } = await supabase.from('custom_emojis').select('*').eq('chat_id', activeChat);
      if (emj) setCustomEmojis(emj);
    }
    else await sendMessage('image', `[IMAGE]:${publicUrl}`);
    e.target.value = '';
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = e => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const name = `voice_${Date.now()}.webm`;
        const { error } = await supabase.storage.from('media').upload(name, audioBlob, { contentType: 'audio/webm', upsert: true });
        if (!error) {
          const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(name);
          sendMessage('voice', `[VOICE]:${publicUrl}`);
        } else {
          alert('Не удалось загрузить голосовое: ' + error.message);
        }
      };
      mediaRecorderRef.current.start(); setIsRecording(true);
    } catch { alert('Микрофон недоступен!'); }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop(); setIsRecording(false);
    }
  };

  const replyToTicket = async (ticketId) => {
    const text = replyTicketText[ticketId];
    if (!text?.trim()) return;
    await supabase.from('support_tickets').update({ reply: text, status: 'closed' }).eq('id', ticketId);
    setReplyTicketText(prev => ({ ...prev, [ticketId]: '' }));
    fetchSupportTickets();
  };

  const handleAuth = async (type) => {
    setLoading(true);
    if (type === 'signup') {
      if (!signupUsername || !signupEmail || !password) return alert('Заполните все поля!');
      const { error } = await supabase.auth.signUp({ email: signupEmail, password, options: { data: { username: signupUsername } } });
      if (error) alert(error.message); else alert('Успешно! Войдите.');
    } else {
      let targetEmail = loginInput.trim();
      if (!targetEmail.includes('@')) {
        const { data: p } = await supabase.from('profiles').select('id').eq('username', targetEmail).single();
        if (p) { const { data: em } = await supabase.rpc('get_email_by_id', { user_id: p.id }); if (em) targetEmail = em; }
      }
      const { error } = await supabase.auth.signInWithPassword({ email: targetEmail, password });
      if (error) { alert('Ошибка: ' + error.message); setLoading(false); return; }
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: prof } = await supabase.from('profiles').select('is_banned').eq('id', user.id).single();
        if (prof?.is_banned) {
          await supabase.auth.signOut();
          alert('Ваш аккаунт заблокирован.');
        }
      }
    }
    setLoading(false);
  };

  if (!session) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#030712', fontFamily: 'system-ui, sans-serif', padding: '16px' }}>
        <div style={{ width: '100%', maxWidth: '380px', padding: '32px 24px', background: theme.bgCard, backdropFilter: 'blur(16px)', borderRadius: '24px', border: `1px solid ${theme.border}`, boxShadow: `0 0 35px ${theme.glow}`, color: '#f8fafc' }}>
          <h2 style={{ margin: '0 0 8px 0', textAlign: 'center', color: theme.primary, textShadow: `0 0 12px ${theme.glow}` }}>DroJent</h2>
          <p style={{ margin: '0 0 24px 0', color: '#94a3b8', fontSize: '13px', textAlign: 'center' }}>Neon Glass Messenger</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input style={{ padding: '12px', borderRadius: '12px', border: `1px solid ${theme.border}`, background: 'rgba(3, 7, 18, 0.6)', color: '#fff', outline: 'none' }} placeholder="Username или Email" value={loginInput} onChange={e => setLoginInput(e.target.value)} />
            <input style={{ padding: '12px', borderRadius: '12px', border: `1px solid ${theme.border}`, background: 'rgba(3, 7, 18, 0.6)', color: '#fff', outline: 'none' }} type="password" placeholder="Пароль" value={password} onChange={e => setPassword(e.target.value)} />
            <button disabled={loading} style={{ padding: '12px', borderRadius: '12px', border: 'none', background: theme.gradient, color: '#fff', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => handleAuth('login')}>Войти</button>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '10px', paddingTop: '10px' }}>
              <input style={{ padding: '10px', borderRadius: '10px', background: 'rgba(3,7,18,0.6)', color: '#fff', width: '100%', marginBottom: '8px', border: `1px solid ${theme.border}`, outline: 'none', boxSizing: 'border-box' }} placeholder="Придумайте Username" value={signupUsername} onChange={e => setSignupUsername(e.target.value)} />
              <input style={{ padding: '10px', borderRadius: '10px', background: 'rgba(3,7,18,0.6)', color: '#fff', width: '100%', marginBottom: '8px', border: `1px solid ${theme.border}`, outline: 'none', boxSizing: 'border-box' }} placeholder="Email" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} />
              <button disabled={loading} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: `1px solid ${theme.primary}`, background: 'transparent', color: theme.primary, fontWeight: 'bold', cursor: 'pointer' }} onClick={() => handleAuth('signup')}>Регистрация</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isDeveloper = session.user.email === DEV_EMAIL;

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', background: '#030712', fontFamily: 'system-ui, sans-serif', color: '#f8fafc', overflow: 'hidden' }}>
      {/* SIDEBAR */}
      <div style={{ width: (activeChat || isSupportMode) ? '320px' : '100%', display: (activeChat || isSupportMode) ? 'none' : 'flex', flexDirection: 'column', borderRight: `1px solid ${theme.border}`, background: 'rgba(11, 15, 25, 0.85)', backdropFilter: 'blur(16px)', height: '100%' }}>
        <div style={{ padding: '16px', borderBottom: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '20px', color: theme.primary, textShadow: `0 0 10px ${theme.glow}` }}>DroJent {isDeveloper && <Icons.Crown />}</h3>
          <button onClick={() => supabase.auth.signOut()} style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #f87171', background: 'transparent', color: '#f87171', fontSize: '12px', cursor: 'pointer' }}>Выйти</button>
        </div>

        {/* Stories — теперь только контакты (+ свои) */}
        <div style={{ padding: '10px 12px', borderBottom: `1px solid ${theme.border}`, display: 'flex', gap: '12px', overflowX: 'auto', background: 'rgba(7, 10, 18, 0.6)' }}>
          <label style={{ cursor: 'pointer', flexShrink: 0, textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: `2px dashed ${theme.primary}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.primary }}>➕</div>
            <input type="file" accept="image/*" onChange={(e) => handleMediaUpload(e, 'story')} style={{ display: 'none' }} />
          </label>
          {stories.map(st => (
            <div key={st.id} onClick={() => setActiveStory(st)} style={{ cursor: 'pointer', flexShrink: 0, textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: `2px solid ${theme.primary}`, boxShadow: `0 0 10px ${theme.glow}`, overflow: 'hidden' }}>
                <img src={st.media_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="st"/>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: `1px solid ${theme.border}`, background: 'rgba(7, 10, 18, 0.8)' }}>
          <button onClick={() => { setActiveTab('chats'); setIsSupportMode(false); }} style={{ flex: 1, padding: '12px', background: 'transparent', border: 'none', color: activeTab === 'chats' ? theme.primary : '#64748b', borderBottom: activeTab === 'chats' ? `2px solid ${theme.primary}` : 'none', fontWeight: 'bold', cursor: 'pointer' }}>Чаты</button>
          <button onClick={() => { setActiveTab('profile'); setIsSupportMode(false); }} style={{ flex: 1, padding: '12px', background: 'transparent', border: 'none', color: activeTab === 'profile' ? theme.primary : '#64748b', borderBottom: activeTab === 'profile' ? `2px solid ${theme.primary}` : 'none', fontWeight: 'bold', cursor: 'pointer' }}>Профиль</button>
          {isDeveloper && <button onClick={() => { setActiveTab('tickets'); setIsSupportMode(false); }} style={{ flex: 1, padding: '12px', background: 'transparent', border: 'none', color: activeTab === 'tickets' ? theme.primary : '#64748b', borderBottom: activeTab === 'tickets' ? `2px solid ${theme.primary}` : 'none', fontWeight: 'bold', cursor: 'pointer' }}>Тикеты</button>}
          {isDeveloper && <button onClick={() => { setActiveTab('users'); setIsSupportMode(false); fetchAllUsers(); }} style={{ flex: 1, padding: '12px', background: 'transparent', border: 'none', color: activeTab === 'users' ? theme.primary : '#64748b', borderBottom: activeTab === 'users' ? `2px solid ${theme.primary}` : 'none', fontWeight: 'bold', cursor: 'pointer' }}>Юзеры</button>}
        </div>

        {activeTab === 'profile' ? (
          <div style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ textAlign: 'center', marginBottom: '10px' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: theme.secondary, margin: '0 auto 10px', overflow: 'hidden', border: `2px solid ${theme.primary}`, boxShadow: `0 0 15px ${theme.glow}` }}>
                {avatarUrl ? <img src={avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="avatar"/> : 'U'}
              </div>
              <label style={{ color: theme.primary, fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}>Изменить аватар<input type="file" accept="image/*" onChange={(e) => handleMediaUpload(e, 'avatar')} style={{ display: 'none' }}/></label>
            </div>
            <div style={{ background: 'rgba(3, 7, 18, 0.6)', padding: '12px', borderRadius: '12px', border: `1px solid ${theme.border}` }}>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Тема оформления:</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setThemeKey('blue')} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: '#0284c7', color: '#fff', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' }}>Синий</button>
                <button onClick={() => setThemeKey('green')} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: '#16a34a', color: '#fff', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' }}>Зелёный</button>
                <button onClick={() => setThemeKey('purple')} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: '#9333ea', color: '#fff', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' }}>Фиолетовый</button>
              </div>
            </div>
            <input style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(3,7,18,0.6)', color: '#fff', border: `1px solid ${theme.border}`, outline: 'none', boxSizing: 'border-box' }} placeholder="Имя (Full Name)" value={editFullName} onChange={e => setEditFullName(e.target.value)} />
            <input style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(3,7,18,0.6)', color: '#fff', border: `1px solid ${theme.border}`, outline: 'none', boxSizing: 'border-box' }} placeholder="Username" value={editUsername} onChange={e => setEditUsername(e.target.value)} />
            <input style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(3,7,18,0.6)', color: '#fff', border: `1px solid ${theme.border}`, outline: 'none', boxSizing: 'border-box' }} placeholder="Статус" value={editCustomStatus} onChange={e => setEditCustomStatus(e.target.value)} />
            <button onClick={saveProfile} style={{ width: '100%', padding: '12px', borderRadius: '10px', background: theme.gradient, color: '#fff', fontWeight: 'bold', cursor: 'pointer', border: 'none' }}>Сохранить профиль</button>
          </div>
        ) : activeTab === 'tickets' ? (
          <div style={{ padding: '16px', overflowY: 'auto', flex: 1 }}>
            {tickets.map(t => (
              <div key={t.id} style={{ padding: '12px', background: 'rgba(30,41,59,0.6)', borderRadius: '12px', marginBottom: '10px', border: `1px solid ${theme.border}` }}>
                <div style={{ color: theme.primary, fontSize: '12px', fontWeight: 'bold' }}>@{t.profiles?.username}</div>
                <div style={{ color: '#fff', fontSize: '14px', margin: '5px 0' }}>{t.message}</div>
                {!t.reply && (
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <input style={{ flex: 1, padding: '6px', background: '#000', color: '#fff', border: 'none', borderRadius: '6px' }} value={replyTicketText[t.id] || ''} onChange={e => setReplyTicketText({...replyTicketText, [t.id]: e.target.value})} placeholder="Ответ..." />
                    <button onClick={() => replyToTicket(t.id)} style={{ padding: '6px 12px', background: theme.primary, color: '#000', border: 'none', borderRadius: '6px', fontWeight: 'bold' }}>Ответить</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : activeTab === 'users' ? (
          <div style={{ padding: '16px', overflowY: 'auto', flex: 1 }}>
            {allUsers.map(u => (
              <div key={u.id} style={{ padding: '12px', background: 'rgba(30,41,59,0.6)', borderRadius: '12px', marginBottom: '10px', border: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden', background: '#2563eb', flexShrink: 0 }}>
                  {u.avatar_url && <img src={u.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="av"/>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: '#fff', fontWeight: '600', fontSize: '13px' }}>{u.full_name || u.username} {u.is_online && <span style={{ color: '#22c55e' }}>●</span>}</div>
                  <div style={{ color: '#94a3b8', fontSize: '11px' }}>@{u.username} {u.is_banned && <span style={{ color: '#f87171' }}>· забанен</span>}</div>
                </div>
                <button onClick={() => toggleBanUser(u)} style={{ padding: '6px 10px', borderRadius: '8px', border: `1px solid ${u.is_banned ? '#22c55e' : '#f87171'}`, background: 'transparent', color: u.is_banned ? '#22c55e' : '#f87171', fontSize: '11px', cursor: 'pointer', flexShrink: 0 }}>
                  {u.is_banned ? 'Разбанить' : 'Забанить'}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <button onClick={() => setShowCreateCommunityModal(true)} style={{ margin: '10px', padding: '10px', border: `1px solid ${theme.primary}`, background: 'rgba(56,189,248,0.1)', color: theme.primary, borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>➕ Создать Группу / Канал</button>
            <input style={{ margin: '0 10px 10px', padding: '10px', background: '#030712', border: `1px solid ${theme.border}`, color: '#fff', borderRadius: '10px', outline: 'none' }} placeholder="Поиск..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {(searchQuery ? [...publicCommunityResults, ...searchResults] : myChats).map((item, i) => {
                const c = item.isGroupOrChannel ? item.chatDetails : item;
                const u = item.profiles || (!item.isGroupOrChannel ? item : null);
                if (c?.type === 'group' || c?.type === 'channel') {
                  return (
                    <div key={i} onClick={() => openChannelOrGroup(c)} style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', background: activeChat === c.id ? 'rgba(255,255,255,0.05)' : 'transparent' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: c.type==='channel' ? '#8b5cf6' : '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        {c.avatar_url ? <img src={c.avatar_url} style={{ width:'100%', height:'100%', objectFit:'cover' }} alt="comm"/> : (c.type==='channel'?'📢':'👥')}
                      </div>
                      <div>
                        <div style={{ color: '#fff', fontWeight: '600' }}>{c.name} {c.is_verified && '✅'}</div>
                        <div style={{ color: '#94a3b8', fontSize: '11px' }}>{c.type==='channel'?'Канал':'Группа'}</div>
                      </div>
                    </div>
                  );
                }
                if (u) {
                  return (
                    <div key={i} onClick={() => startChatWithUser(u)} style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', background: activeUser?.id === u.id ? 'rgba(255,255,255,0.05)' : 'transparent' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: u.id === session.user.id ? theme.primary : '#2563eb', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                        {u.avatar_url ? <img src={u.avatar_url} style={{width:'100%', height:'100%', objectFit:'cover'}} alt="av"/> : 'U'}
                        {u.is_online && <span style={{ position: 'absolute', bottom: 0, right: 0, width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e', border: '2px solid #0b0f19' }} />}
                      </div>
                      <div>
                        <div style={{ color: '#fff', display: 'flex', gap: '5px', fontWeight: '600' }}>
                          {u.full_name || u.username} {u.status_badge === '👑 Developer' && <Icons.Crown />}
                        </div>
                        <div style={{ color: '#94a3b8', fontSize: '11px' }}>@{u.username}</div>
                      </div>
                    </div>
                  );
                }
                return null;
              })}
            </div>
            {!isDeveloper && (
              <div onClick={() => { setIsSupportMode(true); setActiveChat(null); }} style={{ padding: '15px', background: 'rgba(56,189,248,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', color: theme.primary, fontWeight: 'bold' }}>
                <div style={{ color: theme.primary }}><Icons.Support /></div> Служба поддержки
              </div>
            )}
          </div>
        )}
      </div>

      {/* MAIN CHAT AREA */}
      <div style={{ flex: 1, display: (!activeChat && !isSupportMode) ? 'none' : 'flex', flexDirection: 'column', background: '#030712' }}>
        {isSupportMode ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '12px 16px', background: 'rgba(11, 15, 25, 0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: `1px solid ${theme.border}` }}>
              <button onClick={() => setIsSupportMode(false)} style={{ background: 'transparent', border: 'none', color: theme.primary, cursor: 'pointer' }}><Icons.Back /></button>
              <h3 style={{ margin: 0, color: theme.primary }}>Служба поддержки</h3>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {mySupportMessages.map(t => (
                <div key={t.id} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <div style={{ alignSelf: 'flex-end', background: theme.gradient, padding: '10px 14px', borderRadius: '16px 16px 2px 16px', color: '#fff' }}>{t.message}</div>
                  {t.reply && <div style={{ alignSelf: 'flex-start', background: 'rgba(56,189,248,0.15)', border: `1px solid ${theme.border}`, padding: '10px 14px', borderRadius: '16px 16px 16px 2px', color: theme.primary }}>Ответ: {t.reply}</div>}
                </div>
              ))}
            </div>
            <div style={{ padding: '10px', display: 'flex', gap: '10px', borderTop: `1px solid ${theme.border}` }}>
              <input style={{ flex: 1, padding: '10px 16px', borderRadius: '20px', background: '#1e293b', color: '#fff', border: 'none', outline: 'none' }} value={newSupportMsg} onChange={e => setNewSupportMsg(e.target.value)} placeholder="Опишите проблему..." />
              <button onClick={() => { if(newSupportMsg) { supabase.from('support_tickets').insert({ user_id: session.user.id, message: newSupportMsg }); setNewSupportMsg(''); fetchSupportTickets(); } }} style={{ padding: '10px 18px', borderRadius: '20px', background: theme.primary, border: 'none', cursor: 'pointer' }}><Icons.Send /></button>
            </div>
          </div>
        ) : activeChat ? (
          <>
            <div style={{ padding: '12px 16px', background: 'rgba(11, 15, 25, 0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${theme.border}`, flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button onClick={() => { setActiveChat(null); setActiveUser(null); }} style={{ background: 'transparent', border: 'none', color: theme.primary, cursor: 'pointer' }}><Icons.Back /></button>
                <div>
                  <h3 onClick={() => { if(isChatAdmin) setShowAdminModal(true); else if(activeUser) setShowUserProfileModal(true); }} style={{ margin: 0, color: theme.primary, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    {activeChatData?.type === 'group' ? `👥 ${activeChatData.name}` : activeChatData?.type === 'channel' ? `📢 ${activeChatData.name}` : (activeUser?.id === session.user.id ? '🔖 Избранное' : activeUser?.full_name || activeUser?.username)}
                    {activeChatData?.is_verified && '✅'}
                    {activeUser?.status_badge === '👑 Developer' && <Icons.Crown />}
                  </h3>
                  {(activeChatData?.type === 'group' || activeChatData?.type === 'channel') && (
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>{subscriberCount} {activeChatData?.type === 'channel' ? 'подписчиков' : 'участников'}</div>
                  )}
                  {typingUsers.length > 0 && (
                    <div style={{ fontSize: '11px', color: theme.primary }}>{typingUsers.map(t => t.profiles?.username).join(', ')} печатает...</div>
                  )}
                  {activeChatData?.type === 'dm' && activeUser && activeUser.id !== session.user.id && typingUsers.length === 0 && (
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>{activeUser.is_online ? 'в сети' : 'не в сети'}</div>
                  )}
                </div>
              </div>
              {(activeChatData?.type === 'dm' || isChatAdmin) && (
                <button onClick={deleteChat} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><Icons.Trash /></button>
              )}
            </div>

            {/* Закреплённое сообщение — теперь можно открепить */}
            {pinnedMsgData && (
              <div style={{ padding: '8px 16px', background: 'rgba(56, 189, 248, 0.1)', borderBottom: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: theme.primary }}>
                <Icons.Pin />
                <span style={{ fontWeight: 'bold' }}>Закреплено:</span>
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1, color: '#fff' }}>{pinnedMsgData.content}</span>
                <button onClick={unpinMessage} style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '13px' }}>✖</button>
              </div>
            )}

            <div ref={messagesContainerRef} style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {messages.map(msg => {
                const isMe = msg.sender_id === session.user.id;
                const rcts = reactions.filter(r => r.message_id === msg.id);
                return (
                  <div key={msg.id} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                    <div onClick={() => setSelectedMsgForMenu(msg)} style={{ background: isMe ? theme.gradient : 'rgba(30, 41, 59, 0.75)', padding: '10px 14px', borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px', color: '#fff', cursor: 'pointer', border: isMe ? 'none' : `1px solid ${theme.border}` }}>
                      {msg.content.startsWith('[IMAGE]:') ? <img src={msg.content.replace('[IMAGE]:','')} style={{maxWidth:'100%', borderRadius:'8px'}} alt="media"/> : msg.content.startsWith('[VOICE]:') ? <audio controls src={msg.content.replace('[VOICE]:','')} /> : msg.content}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                        {rcts.length > 0 && (
                          <div style={{ display: 'flex', gap: '5px' }}>
                            {rcts.map(r => r.emoji.startsWith('http') ? <img key={r.id} src={r.emoji} alt="emoji" style={{ width: '16px', height: '16px' }}/> : <span key={r.id}>{r.emoji}</span>)}
                          </div>
                        )}
                        {isMe && (
                          <span style={{ marginLeft: 'auto', opacity: 0.8 }}>
                            {msg.is_read ? <Icons.Read /> : <Icons.Sent />}
                          </span>
                        )}
                      </div>
                    </div>
                    {activeChatData?.type === 'channel' && (
                      <button onClick={() => setOpenCommentsForMsg(msg)} style={{ marginTop: '4px', background: 'transparent', border: 'none', color: theme.primary, fontSize: '11px', cursor: 'pointer' }}>
                        💬 Комментарии
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {activeChatData?.type === 'channel' && activeChatData.owner_id !== session.user.id ? (
              <div style={{ padding: '15px', textAlign: 'center', background: '#0b0f19', color: '#94a3b8' }}>Только владелец пишет в канал</div>
            ) : (
              <form onSubmit={e => { e.preventDefault(); sendMessage(); }} style={{ padding: '10px', background: '#0b0f19', display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0, borderTop: `1px solid ${theme.border}` }}>
                <label style={{ cursor: 'pointer', padding: '10px', background: 'rgba(30, 41, 59, 0.8)', borderRadius: '50%', color: theme.primary }}><Icons.Camera /><input type="file" accept="image/*" onChange={(e) => handleMediaUpload(e, 'img')} style={{display:'none'}}/></label>
                <button type="button" onClick={isRecording ? stopRecording : startRecording} style={{ padding: '10px', background: isRecording ? '#ef4444' : 'rgba(30, 41, 59, 0.8)', border: 'none', borderRadius: '50%', color: theme.primary, cursor: 'pointer' }}>{isRecording ? <Icons.Stop/> : <Icons.Mic/>}</button>
                <input style={{ flex: 1, padding: '12px', borderRadius: '20px', background: '#030712', color: '#fff', border: `1px solid ${theme.border}`, outline: 'none' }} value={newMessage} onChange={e => handleTyping(e.target.value)} placeholder="Сообщение..." />
                <button type="submit" style={{ padding: '12px 18px', borderRadius: '20px', background: theme.gradient, border: 'none', cursor: 'pointer' }}><Icons.Send /></button>
              </form>
            )}
          </>
        ) : null}
      </div>

      {/* Предпросмотр канала перед подпиской */}
      {previewChat && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 6000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#0b0f19', padding: '24px', borderRadius: '20px', width: '100%', maxWidth: '320px', border: `1px solid ${theme.border}`, textAlign: 'center' }}>
            <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: '#8b5cf6', margin: '0 auto 12px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>
              {previewChat.avatar_url ? <img src={previewChat.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="ch"/> : '📢'}
            </div>
            <h3 style={{ color: '#fff', margin: '0 0 4px' }}>{previewChat.name}</h3>
            <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 8px' }}>{previewChat.description}</p>
            <p style={{ color: theme.primary, fontSize: '12px', marginBottom: '16px' }}>{previewChat.subscriberCount} подписчиков</p>
            <button onClick={subscribeToPreviewChannel} style={{ width: '100%', padding: '12px', background: theme.gradient, border: 'none', borderRadius: '10px', color: '#fff', fontWeight: 'bold', cursor: 'pointer', marginBottom: '8px' }}>Подписаться</button>
            <button onClick={() => setPreviewChat(null)} style={{ width: '100%', padding: '8px', background: 'transparent', color: '#94a3b8', border: 'none', cursor: 'pointer' }}>Отмена</button>
          </div>
        </div>
      )}

      {/* Окно комментариев */}
      {openCommentsForMsg && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 6000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#0b0f19', borderRadius: '20px', border: `1px solid ${theme.border}`, width: '100%', maxWidth: '360px', height: '80vh', display: 'flex', flexDirection: 'column', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${theme.border}`, paddingBottom: '10px' }}>
              <h4 style={{ margin: 0, color: theme.primary }}>Комментарии</h4>
              <button onClick={() => setOpenCommentsForMsg(null)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>✖</button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '10px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {commentsList.map(c => (
                <div key={c.id} style={{ background: 'rgba(30,41,59,0.5)', padding: '8px 12px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '11px', color: theme.primary, fontWeight: 'bold' }}>@{c.profiles?.username}</div>
                  <div style={{ fontSize: '13px', color: '#fff' }}>{c.content}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '8px', paddingTop: '10px', borderTop: `1px solid ${theme.border}` }}>
              <input style={{ flex: 1, padding: '8px 12px', borderRadius: '12px', background: '#030712', color: '#fff', border: `1px solid ${theme.border}`, outline: 'none' }} placeholder="Написать комментарий..." value={newCommentText} onChange={e => setNewCommentText(e.target.value)} />
              <button onClick={sendComment} style={{ padding: '8px 14px', background: theme.primary, border: 'none', borderRadius: '12px', color: '#000', fontWeight: 'bold', cursor: 'pointer' }}>➔</button>
            </div>
          </div>
        </div>
      )}

      {/* Админ-панель канала / группы */}
      {showAdminModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#0b0f19', padding: '20px', borderRadius: '20px', width: '300px', border: `1px solid ${theme.border}` }}>
            <h3 style={{ color: theme.primary, marginTop: 0 }}>Админ-панель</h3>
            <div style={{ textAlign: 'center', marginBottom: '10px' }}>
              <label style={{ color: theme.primary, fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}>
                📷 Изменить аватарку канала
                <input type="file" accept="image/*" onChange={(e) => handleMediaUpload(e, 'comm_avatar')} style={{ display: 'none' }} />
              </label>
            </div>
            <input value={activeChatData?.name || ''} onChange={(e) => setActiveChatData({...activeChatData, name: e.target.value})} style={{ width: '100%', padding: '8px', marginBottom: '10px', background: '#030712', color: '#fff', border: `1px solid ${theme.border}`, borderRadius: '8px' }} placeholder="Название" />
            <input value={activeChatData?.description || ''} onChange={(e) => setActiveChatData({...activeChatData, description: e.target.value})} style={{ width: '100%', padding: '8px', marginBottom: '10px', background: '#030712', color: '#fff', border: `1px solid ${theme.border}`, borderRadius: '8px' }} placeholder="Описание" />
            <input value={newMemberName} onChange={(e) => setNewMemberName(e.target.value)} placeholder="Username участника" style={{ width: '100%', padding: '8px', marginBottom: '10px', background: '#030712', color: '#fff', border: `1px solid ${theme.border}`, borderRadius: '8px' }} />
            <button onClick={addMemberToComm} style={{ width: '100%', padding: '8px', background: theme.primary, border: 'none', borderRadius: '8px', marginBottom: '10px', cursor: 'pointer', fontWeight: 'bold' }}>Добавить участника</button>
            <button onClick={() => { if (newMemberName) promoteToAdmin(newMemberName); }} style={{ width: '100%', padding: '8px', background: 'rgba(245,158,11,0.15)', border: '1px solid #f59e0b', color: '#f59e0b', borderRadius: '8px', marginBottom: '10px', cursor: 'pointer', fontWeight: 'bold' }}>Назначить админом (введи username выше)</button>
            <button onClick={updateCommunity} style={{ width: '100%', padding: '8px', background: theme.gradient, border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}>Сохранить изменения</button>
            <button onClick={() => setShowAdminModal(false)} style={{ width: '100%', padding: '8px', marginTop: '10px', background: 'transparent', color: '#f87171', border: 'none', cursor: 'pointer' }}>Закрыть</button>
          </div>
        </div>
      )}

      {showCreateCommunityModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#0b0f19', padding: '20px', borderRadius: '20px', width: '300px', border: `1px solid ${theme.border}` }}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <button onClick={() => setCommunityType('group')} style={{ flex: 1, padding: '8px', background: communityType==='group'?theme.primary:'#1e293b', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>👥 Группа</button>
              <button onClick={() => setCommunityType('channel')} style={{ flex: 1, padding: '8px', background: communityType==='channel'?theme.primary:'#1e293b', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>📢 Канал</button>
            </div>
            <input value={communityName} onChange={e => setCommunityName(e.target.value)} placeholder="Название..." style={{ width: '100%', padding: '8px', marginBottom: '10px', background: '#030712', color: '#fff', border: `1px solid ${theme.border}`, borderRadius: '8px' }} />
            <button onClick={createCommunity} style={{ width: '100%', padding: '10px', background: theme.gradient, color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Создать</button>
            <button onClick={() => setShowCreateCommunityModal(false)} style={{ width: '100%', padding: '8px', marginTop: '5px', background: 'transparent', color: '#94a3b8', border: 'none', cursor: 'pointer' }}>Отмена</button>
          </div>
        </div>
      )}

      {/* Меню взаимодействия с сообщением */}
      {selectedMsgForMenu && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 6000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#0b0f19', padding: '15px', borderRadius: '20px', width: '270px', border: `1px solid ${theme.border}` }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
              {REACTION_EMOJIS.map(em => <span key={em} onClick={() => toggleReaction(selectedMsgForMenu.id, em)} style={{ fontSize: '20px', cursor: 'pointer' }}>{em}</span>)}
              {customEmojis.map(ce => <img key={ce.id} onClick={() => toggleReaction(selectedMsgForMenu.id, ce.image_url)} src={ce.image_url} alt={ce.name} style={{ width: '22px', height: '22px', cursor: 'pointer' }}/>)}
              <label style={{ cursor: 'pointer', color: theme.primary, fontSize: '18px' }}>
                ➕<input type="file" accept="image/*" onChange={(e) => handleMediaUpload(e, 'emoji')} style={{ display: 'none' }}/>
              </label>
            </div>
            <button onClick={() => pinMessage(selectedMsgForMenu.id)} style={{ width: '100%', padding: '10px', background: 'rgba(30,41,59,0.8)', color: '#fff', border: 'none', borderRadius: '8px', marginBottom: '5px', cursor: 'pointer' }}>📌 Закрепить</button>
            <button onClick={() => { setReplyingMsg(selectedMsgForMenu); setSelectedMsgForMenu(null); }} style={{ width: '100%', padding: '10px', background: 'rgba(30,41,59,0.8)', color: '#fff', border: 'none', borderRadius: '8px', marginBottom: '5px', cursor: 'pointer' }}>💬 Ответить</button>
            {canDeleteMessage(selectedMsgForMenu) && (
              <button onClick={() => deleteMessage(selectedMsgForMenu.id)} style={{ width: '100%', padding: '10px', background: 'rgba(239,68,68,0.2)', color: '#f87171', border: '1px solid #f87171', borderRadius: '8px', marginBottom: '5px', cursor: 'pointer' }}>🗑️ Удалить</button>
            )}
            <button onClick={() => setSelectedMsgForMenu(null)} style={{ width: '100%', padding: '8px', background: 'transparent', color: '#94a3b8', border: 'none', cursor: 'pointer' }}>Отмена</button>
          </div>
        </div>
      )}

      {activeStory && (
        <div style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 7000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <button onClick={() => setActiveStory(null)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', color: '#fff', fontSize: '24px', border: 'none', cursor: 'pointer' }}>✖</button>
          <img src={activeStory.media_url} style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: '10px' }} alt="st"/>
        </div>
      )}

      {showUserProfileModal && activeUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#0b0f19', padding: '20px', borderRadius: '20px', textAlign: 'center', color: '#fff', border: `1px solid ${theme.border}` }}>
            <h2>{activeUser.full_name || activeUser.username} {activeUser.status_badge === '👑 Developer' && <Icons.Crown />}</h2>
            <p style={{ color: theme.primary }}>@{activeUser.username}</p>
            <p style={{ fontStyle: 'italic', color: '#94a3b8' }}>«{activeUser.custom_status || 'Без статуса'}»</p>
            <button onClick={() => setShowUserProfileModal(false)} style={{ padding: '8px 20px', background: theme.primary, border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Закрыть</button>
          </div>
        </div>
      )}
    </div>
  );
}
