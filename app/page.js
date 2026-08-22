'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const DEV_EMAIL = 'ggg12323u@gmail.com';
const REACTION_EMOJIS = ['🔥', '❤️', '👍', '😂', '😮', '😢'];
const AURA_PROMO_CODE = 'Au100';

const THEMES = {
  blue: { primary: '#38bdf8', secondary: '#2563eb', glow: 'rgba(56, 189, 248, 0.4)', border: 'rgba(56, 189, 248, 0.3)', bgCard: 'rgba(15, 23, 42, 0.75)', gradient: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)', locked: false },
  green: { primary: '#22c55e', secondary: '#16a34a', glow: 'rgba(34, 197, 94, 0.4)', border: 'rgba(34, 197, 94, 0.3)', bgCard: 'rgba(6, 78, 59, 0.65)', gradient: 'linear-gradient(135deg, #15803d 0%, #22c55e 100%)', locked: true },
  purple: { primary: '#c084fc', secondary: '#9333ea', glow: 'rgba(192, 132, 252, 0.4)', border: 'rgba(192, 132, 252, 0.3)', bgCard: 'rgba(88, 28, 135, 0.65)', gradient: 'linear-gradient(135deg, #7e22ce 0%, #c084fc 100%)', locked: true }
};

const Icons = {
  Back: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>,
  Send: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  Camera: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  Video: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>,
  Mic: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>,
  Stop: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>,
  Trash: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  Support: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  Pin: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14l-1.5-6H6.5L5 17z"/><path d="M9 11V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v7"/></svg>,
  Crown: () => <span style={{ filter: 'drop-shadow(0 0 6px #f59e0b)' }}>👑</span>,
  Aura: () => <span style={{ filter: 'drop-shadow(0 0 6px #c084fc)' }}>💠</span>,
  Lock: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  Sent: ({ color = 'currentColor' }) => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><circle cx="12" cy="12" r="9"/></svg>,
  Read: ({ color = 'currentColor' }) => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.2" fill={color}/></svg>
};

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return 'только что';
  if (diff < 3600) return `${Math.floor(diff / 60)} мин назад`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ч назад`;
  return `${Math.floor(diff / 86400)} дн назад`;
}

export default function Home() {
  const [session, setSession] = useState(null);
  const [loginInput, setLoginInput] = useState('');
  const [password, setPassword] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');

  const [myProfile, setMyProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('chats');
  const [themeKey, setThemeKey] = useState('blue');
  const theme = THEMES[themeKey];
  const isAura = !!myProfile?.is_aura;
  const isDeveloper = session?.user?.email === DEV_EMAIL;

  const [editFullName, setEditFullName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editBirthdate, setEditBirthdate] = useState('');
  const [editCustomStatus, setEditCustomStatus] = useState('');
  const [editEmojiStatus, setEditEmojiStatus] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [newPin, setNewPin] = useState('');

  // Экран блокировки PIN-кодом
  const [locked, setLocked] = useState(false);
  const [pinAttempt, setPinAttempt] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [publicCommunityResults, setPublicCommunityResults] = useState([]);
  const [myChats, setMyChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [activeChatData, setActiveChatData] = useState(null);
  const [pinnedMsgData, setPinnedMsgData] = useState(null);
  const [activeUser, setActiveUser] = useState(null);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [subscribersList, setSubscribersList] = useState([]);
  const activeChatRef = useRef(null);
  useEffect(() => { activeChatRef.current = activeChat; }, [activeChat]);

  const [showUserProfileModal, setShowUserProfileModal] = useState(false);
  const [viewedProfile, setViewedProfile] = useState(null);
  const [showCreateCommunityModal, setShowCreateCommunityModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [previewChat, setPreviewChat] = useState(null);

  const [communityType, setCommunityType] = useState('group');
  const [communityName, setCommunityName] = useState('');
  const [communityDesc, setCommunityDesc] = useState('');
  const [communityAvatar, setCommunityAvatar] = useState('');
  const [newMemberName, setNewMemberName] = useState('');

  const [openCommentsForMsg, setOpenCommentsForMsg] = useState(null);
  const [commentsList, setCommentsList] = useState([]);
  const [newCommentText, setNewCommentText] = useState('');

  const [tickets, setTickets] = useState([]);
  const [mySupportMessages, setMySupportMessages] = useState([]);
  const [newSupportMsg, setNewSupportMsg] = useState('');
  const [isSupportMode, setIsSupportMode] = useState(false);
  const [replyTicketText, setReplyTicketText] = useState({});

  const [stories, setStories] = useState([]);
  const [activeStory, setActiveStory] = useState(null);

  const [messages, setMessages] = useState([]);
  const [reactions, setReactions] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const [replyingMsg, setReplyingMsg] = useState(null);
  const [selectedMsgForMenu, setSelectedMsgForMenu] = useState(null);

  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const messagesContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const [customEmojis, setCustomEmojis] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);

  const [polls, setPolls] = useState([]);
  const [pollVotes, setPollVotes] = useState([]);
  const [showPollModal, setShowPollModal] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);

  const [blockedIds, setBlockedIds] = useState([]);

  // Аудиозвонки (WebRTC, сигнализация через Supabase Realtime Broadcast)
  const [callState, setCallState] = useState('idle'); // idle | outgoing | incoming | active
  const [callPeerInfo, setCallPeerInfo] = useState(null);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const currentCallIdRef = useRef(null);
  const userCallChannelRef = useRef(null);
  const pendingOfferRef = useRef(null);
  const callTimerRef = useRef(null);


  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  // Регистрация Service Worker + подписка на Web Push. Требует переменную
  // окружения NEXT_PUBLIC_VAPID_PUBLIC_KEY (см. инструкцию push-setup.md).
  useEffect(() => {
    if (!session || typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
    const setupPush = async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js');
        if (!('PushManager' in window) || !process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) return;
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return;
        let sub = await reg.pushManager.getSubscription();
        if (!sub) {
          const urlBase64ToUint8Array = (base64String) => {
            const padding = '='.repeat((4 - base64String.length % 4) % 4);
            const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
            const rawData = window.atob(base64);
            return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
          };
          sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) });
        }
        await supabase.from('push_subscriptions').upsert({ user_id: session.user.id, endpoint: sub.endpoint, subscription: sub.toJSON() }, { onConflict: 'endpoint' });
      } catch (e) { console.warn('Push setup failed', e); }
    };
    setupPush();
  }, [session]);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
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
      setEditEmojiStatus(data.emoji_status || '');
      setAvatarUrl(data.avatar_url || '');
      if (data.theme && THEMES[data.theme] && (data.is_aura || !THEMES[data.theme].locked)) setThemeKey(data.theme);
      if (data.pin_code) setLocked(true);
    }
  };

  const loadBlocked = async () => {
    if (!session) return;
    const { data } = await supabase.from('blocks').select('blocked_id').eq('owner_id', session.user.id);
    setBlockedIds((data || []).map(b => b.blocked_id));
  };

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
    if (isDeveloper) {
      const { data, error } = await supabase.from('support_tickets').select('*, profiles(username, avatar_url)').order('created_at', { ascending: false });
      if (error) console.error('tickets load error', error);
      if (data) setTickets(data);
    } else {
      const { data } = await supabase.from('support_tickets').select('*').eq('user_id', session.user.id).order('created_at', { ascending: true });
      if (data) setMySupportMessages(data);
    }
  };

  const fetchAllUsers = async () => {
    if (!session || !isDeveloper) return;
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (data) setAllUsers(data);
  };

  const toggleBanUser = async (u) => {
    await supabase.from('profiles').update({ is_banned: !u.is_banned }).eq('id', u.id);
    fetchAllUsers();
  };

  const toggleAuraUser = async (u) => {
    await supabase.from('profiles').update({ is_aura: !u.is_aura }).eq('id', u.id);
    fetchAllUsers();
  };

  const fetchMyChats = async () => {
    if (!session) return;
    const { data: parts } = await supabase.from('chat_participants').select('chat_id').eq('user_id', session.user.id);
    if (parts && parts.length > 0) {
      const chatIds = parts.map(p => p.chat_id);
      const { data: chatsData } = await supabase.from('chats').select('*').in('id', chatIds);
      const { data: allParts } = await supabase.from('chat_participants').select('chat_id, user_id, profiles(id, username, full_name, avatar_url, status_badge, custom_status, emoji_status, is_online, is_aura)').in('chat_id', chatIds);
      // Метаданные для сортировки "самые активные сверху" и счётчика непрочитанных —
      // одним запросом по всем сообщениям чатов пользователя, без обновления страницы.
      const { data: allMsgs } = await supabase.from('messages').select('chat_id, is_read, sender_id, created_at').in('chat_id', chatIds).order('created_at', { ascending: false });
      const lastMsgAt = {}; const msgCount = {}; const unreadCount = {};
      (allMsgs || []).forEach(m => {
        if (!(m.chat_id in lastMsgAt)) lastMsgAt[m.chat_id] = m.created_at;
        msgCount[m.chat_id] = (msgCount[m.chat_id] || 0) + 1;
        if (!m.is_read && m.sender_id !== session.user.id) unreadCount[m.chat_id] = (unreadCount[m.chat_id] || 0) + 1;
      });
      if (chatsData) {
        const formatted = chatsData.map(c => {
          if (c.type === 'group' || c.type === 'channel') return { chat_id: c.id, isGroupOrChannel: true, chatDetails: c, _msgCount: msgCount[c.id] || 0, _lastMsgAt: lastMsgAt[c.id] || c.created_at, _unread: unreadCount[c.id] || 0 };
          const p = allParts?.filter(x => x.chat_id === c.id) || [];
          if (p.length === 1 && p[0].user_id === session.user.id) return { chat_id: c.id, profiles: { id: session.user.id, username: 'Избранное', avatar_url: myProfile?.avatar_url, custom_status: 'Заметки' }, _msgCount: msgCount[c.id] || 0, _lastMsgAt: lastMsgAt[c.id] || c.created_at, _unread: 0 };
          const partner = p.find(x => x.user_id !== session.user.id);
          if (!partner) return null;
          return { ...partner, _msgCount: msgCount[c.id] || 0, _lastMsgAt: lastMsgAt[c.id] || c.created_at, _unread: unreadCount[c.id] || 0 };
        }).filter(Boolean).filter(item => !blockedIds.includes(item.profiles?.id))
          .sort((a, b) => (b._msgCount - a._msgCount) || (new Date(b._lastMsgAt) - new Date(a._lastMsgAt)));
        setMyChats(formatted);
      }
    } else setMyChats([]);
  };


  useEffect(() => {
    loadProfile();
    if (session) { loadBlocked(); fetchStories(); fetchSupportTickets(); fetchMyChats(); fetchAllUsers(); }
  }, [session]);

  useEffect(() => { if (session) fetchMyChats(); }, [blockedIds]);

  // Глобальная realtime-подписка — включая тикеты поддержки (раньше "чёрная дыра": не было ни подписки, ни явной ошибки при insert)
  useEffect(() => {
    if (!session) return;
    const globalChan = supabase.channel('global_updates_' + session.user.id)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => fetchMyChats())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_participants' }, () => fetchMyChats())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chats' }, () => fetchMyChats())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'stories' }, () => fetchStories())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'support_tickets' }, () => fetchSupportTickets())
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, () => { fetchMyChats(); if (isDeveloper) fetchAllUsers(); })
      .subscribe();
    return () => { supabase.removeChannel(globalChan); };
  }, [session]);

  useEffect(() => {
    if (!session) return;
    const goOnline = () => supabase.from('profiles').update({ is_online: true, last_seen: new Date().toISOString() }).eq('id', session.user.id);
    const goOffline = () => supabase.from('profiles').update({ is_online: false, last_seen: new Date().toISOString() }).eq('id', session.user.id);
    goOnline();
    const iv = setInterval(goOnline, 25000);
    window.addEventListener('beforeunload', goOffline);
    const visHandler = () => { if (document.hidden) goOffline(); else goOnline(); };
    document.addEventListener('visibilitychange', visHandler);
    return () => { clearInterval(iv); window.removeEventListener('beforeunload', goOffline); document.removeEventListener('visibilitychange', visHandler); goOffline(); };
  }, [session]);

  useEffect(() => {
    if (!session) return;
    const search = async () => {
      if (!searchQuery.trim()) { setSearchResults([]); setPublicCommunityResults([]); return; }
      const { data: u } = await supabase.from('profiles').select('*').ilike('username', `%${searchQuery}%`);
      if (u) setSearchResults(u.filter(x => !blockedIds.includes(x.id)));
      const { data: c } = await supabase.from('chats').select('*').eq('is_public', true).ilike('name', `%${searchQuery}%`);
      if (c) setPublicCommunityResults(c);
    };
    const t = setTimeout(search, 300);
    return () => clearTimeout(t);
  }, [searchQuery, session, blockedIds]);

  // Загрузка активного чата — с защитой от гонок при быстром переключении чатов
  useEffect(() => {
    if (!activeChat) { setMessages([]); setReactions([]); setActiveChatData(null); setPinnedMsgData(null); setSubscriberCount(0); setCustomEmojis([]); setPolls([]); setPollVotes([]); return; }
    const chatIdForThisEffect = activeChat;
    const isStale = () => activeChatRef.current !== chatIdForThisEffect;

    const loadChat = async (isInitial) => {
      if (isStale()) return;
      const { data: chat } = await supabase.from('chats').select('*').eq('id', chatIdForThisEffect).single();
      if (isStale()) return;
      if (chat) {
        setActiveChatData(chat);
        setCommunityAvatar(chat.avatar_url || '');
        if (chat.pinned_message_id) {
          const { data: pin } = await supabase.from('messages').select('*').eq('id', chat.pinned_message_id).single();
          if (isStale()) return;
          if (p