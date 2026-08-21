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
 