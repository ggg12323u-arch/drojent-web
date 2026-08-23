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

// Переменные для светлого/тёмного режима — задают только "нейтральные" поверхности
// (фон приложения, карточки, шапки, обычный текст). Акцентные цвета (кнопки,
// градиенты, свои сообщения) не зависят от режима — как в большинстве мессенджеров.
const SURFACE_VARS = {
  dark: {
    '--bg-app': '#030712',
    '--bg-surface': '#0b0f19',
    '--bg-surface-blur': 'rgba(11, 15, 25, 0.85)',
    '--bg-toolbar': 'rgba(7, 10, 18, 0.85)',
    '--bg-card': 'rgba(30, 41, 59, 0.7)',
    '--bg-card-solid': '#1e293b',
    '--bg-muted': '#334155',
    '--input-bg': 'rgba(3, 7, 18, 0.6)',
    '--text-primary': '#f8fafc',
    '--text-secondary': '#94a3b8',
    '--text-muted': '#64748b',
    '--border-hairline': 'rgba(255,255,255,0.08)',
  },
  light: {
    '--bg-app': '#f1f5f9',
    '--bg-surface': '#ffffff',
    '--bg-surface-blur': 'rgba(255, 255, 255, 0.85)',
    '--bg-toolbar': 'rgba(248, 250, 252, 0.9)',
    '--bg-card': 'rgba(226, 232, 240, 0.7)',
    '--bg-card-solid': '#e2e8f0',
    '--bg-muted': '#cbd5e1',
    '--input-bg': '#ffffff',
    '--text-primary': '#0f172a',
    '--text-secondary': '#475569',
    '--text-muted': '#64748b',
    '--border-hairline': 'rgba(0,0,0,0.08)',
  }
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
  Crown: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1" strokeLinejoin="round" style={{ verticalAlign: '-2px', filter: 'drop-shadow(0 0 4px rgba(245,158,11,0.5))' }}><path d="M3 18h18l-1.5-9-4.5 4-3-6-3 6-4.5-4L3 18z"/></svg>,
  Aura: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="#c084fc" style={{ verticalAlign: '-2px', filter: 'drop-shadow(0 0 4px rgba(192,132,252,0.5))' }}><path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z"/></svg>,
  Verified: () => (
    <svg width="16" height="16" viewBox="0 0 22 22" style={{ verticalAlign: '-3px', flexShrink: 0 }}>
      <path fill="#38bdf8" d="M11 0l2.2 1.3 2.5-.7 1.3 2.2 2.5.7.1 2.6 2.1 1.5-1.1 2.4 1.1 2.4-2.1 1.5-.1 2.6-2.5.7-1.3 2.2-2.5-.7L11 22l-2.2-1.3-2.5.7-1.3-2.2-2.5-.7-.1-2.6L.3 14.4l1.1-2.4L.3 9.6l2.1-1.5.1-2.6 2.5-.7L6.3.6 8.8 1.3 11 0z"/>
      <path fill="#fff" d="M9.6 14.9L6.2 11.5l1.2-1.2 2.2 2.2 5-5 1.2 1.2-6.2 6.2z"/>
    </svg>
  ),
  Lock: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  ChatsTab: () => <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>,
  SettingsTab: () => <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  TicketsTab: () => <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9a2 2 0 0 0 2-2V6a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v1a2 2 0 0 0 0 4v1a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-1a2 2 0 0 0-2-2z"/><path d="M13 5v2m0 3v2m0 3v2"/></svg>,
  UsersTab: () => <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Phone: () => <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  PhoneEnd: () => <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M12 9c-2.9 0-5.6.8-8 2.2a1.5 1.5 0 0 0-.5 2.1l1.7 2.6a1.5 1.5 0 0 0 2 .5l2-1a1.5 1.5 0 0 0 .8-1.5l-.2-1.6c.7-.2 1.4-.3 2.2-.3s1.5.1 2.2.3l-.2 1.6a1.5 1.5 0 0 0 .8 1.5l2 1a1.5 1.5 0 0 0 2-.5l1.7-2.6a1.5 1.5 0 0 0-.5-2.1C17.6 9.8 14.9 9 12 9z"/></svg>,
  PollIcon: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  Plus: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Close: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  MicOff: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>,
  CameraOff: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="1" y1="1" x2="23" y2="23"/><path d="M21 21H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3m3-3h6l2 3h4a2 2 0 0 1 2 2v9.34"/><circle cx="12" cy="13" r="4"/></svg>,
  SwitchCamera: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h-6L7 6H3a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-4z"/><circle cx="12" cy="12" r="3"/><path d="M20 4l2 2-2 2M4 20l-2-2 2-2"/></svg>,
  Bell: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  BellOff: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="1" y1="1" x2="23" y2="23"/><path d="M8.7 3A6 6 0 0 1 18 8c0 2.4.4 4.2.9 5.5M18 15.3c.4.7.7 1.2.7 1.2s-.6.4-1.6.4H6s3-2 3-9M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
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
  const [colorMode, setColorMode] = useState('dark'); // 'dark' | 'light'
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
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);

  const [blockedIds, setBlockedIds] = useState([]);
  const [mutedChatIds, setMutedChatIds] = useState([]);

  // Аудио/видеозвонки (WebRTC, сигнализация через Supabase Realtime Broadcast)
  const [callState, setCallState] = useState('idle'); // idle | outgoing | incoming | active
  const callStateRef = useRef('idle');
  useEffect(() => { callStateRef.current = callState; }, [callState]);
  const [callType, setCallType] = useState('audio'); // audio | video
  const [callPeerInfo, setCallPeerInfo] = useState(null);
  const [callDuration, setCallDuration] = useState(0);
  const [localStreamTick, setLocalStreamTick] = useState(0); // дёргаем, когда поток с камеры готов, чтобы точно перерисовать <video>
  const [isMuted, setIsMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);
  const [connState, setConnState] = useState('new');
  const [iceState, setIceState] = useState('new');
  const reconnectGraceRef = useRef(null);
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localVideoRef = useRef(null);
  const currentCallIdRef = useRef(null);
  const userCallChannelRef = useRef(null);
  const pendingOfferRef = useRef(null);
  const pendingIceRef = useRef([]); // ICE-кандидаты, пришедшие раньше, чем установлено remoteDescription
  const callTimerRef = useRef(null);
  const facingModeRef = useRef('user');
  const currentCallDbIdRef = useRef(null);
  const ringTimeoutRef = useRef(null);


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
        // Если это устройство раньше было привязано к ДРУГОМУ аккаунту (тестировали с
        // нескольких аккаунтов на одном телефоне) — переотвязываем подписку на текущего.
        // Раньше это тихо не срабатывало из-за прав доступа в базе — из-за этого уведомления
        // могли уходить не тому человеку (в т.ч. звонящему — его же собственное "звонит вам").
        await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint).neq('user_id', session.user.id);
        const { error: pushErr } = await supabase.from('push_subscriptions').upsert({ user_id: session.user.id, endpoint: sub.endpoint, subscription: sub.toJSON() }, { onConflict: 'endpoint' });
        if (pushErr) console.warn('push upsert failed', pushErr);
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
      if (data.color_mode === 'light' || data.color_mode === 'dark') setColorMode(data.color_mode);
      if (data.pin_code) setLocked(true);
    }
  };

  const loadBlocked = async () => {
    if (!session) return;
    const { data } = await supabase.from('blocks').select('blocked_id').eq('owner_id', session.user.id);
    setBlockedIds((data || []).map(b => b.blocked_id));
  };

  const loadMutedChats = async () => {
    if (!session) return;
    const { data } = await supabase.from('chat_mutes').select('chat_id').eq('user_id', session.user.id);
    setMutedChatIds((data || []).map(m => m.chat_id));
  };

  const toggleMuteChat = async (chatId) => {
    if (mutedChatIds.includes(chatId)) {
      await supabase.from('chat_mutes').delete().eq('user_id', session.user.id).eq('chat_id', chatId);
      setMutedChatIds(prev => prev.filter(id => id !== chatId));
    } else {
      await supabase.from('chat_mutes').insert([{ user_id: session.user.id, chat_id: chatId }]);
      setMutedChatIds(prev => [...prev, chatId]);
    }
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

  const toggleAuraUser = async (u) => {
    await supabase.from('profiles').update({ is_aura: !u.is_aura }).eq('id', u.id);
    fetchAllUsers();
  };

  const fetchMyChats = async () => {
    if (!session) return;
    const { data: parts } = await supabase.from('chat_participants').select('chat_id').eq('user_id', session.user.id);
    if (parts && parts.length > 0) {
      const chatIds = parts.map(p => p.chat_id);
      // Раньше эти 3 запроса шли по очереди (друг за другом ждали ответ сети) —
      // теперь идут параллельно, это самое заметное ускорение открытия списка чатов.
      const [{ data: chatsData }, { data: allParts }, { data: allMsgs }] = await Promise.all([
        supabase.from('chats').select('*').in('id', chatIds),
        supabase.from('chat_participants').select('chat_id, user_id, profiles(id, username, full_name, avatar_url, status_badge, custom_status, emoji_status, is_online, is_aura)').in('chat_id', chatIds),
        // Раньше тянули ВСЮ историю сообщений по всем чатам на каждое обновление —
        // это и было главной причиной тормозов. 300 последних сообщений с запасом
        // хватает для счётчика непрочитанных и сортировки по активности.
        supabase.from('messages').select('chat_id, is_read, sender_id, created_at').in('chat_id', chatIds).order('created_at', { ascending: false }).limit(300),
      ]);
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
    if (session) { loadBlocked(); loadMutedChats(); fetchStories(); fetchSupportTickets(); fetchMyChats(); fetchAllUsers(); }
  }, [session]);

  useEffect(() => { if (session) fetchMyChats(); }, [blockedIds]);

  // Много событий (сообщение + отметка "прочитано" + обновление профиля) могут
  // прилететь пачкой за доли секунды — без дебаунса это запускало fetchMyChats
  // по несколько раз подряд и ощутимо подтормаживало интерфейс.
  const fetchMyChatsDebounceRef = useRef(null);
  const fetchMyChatsDebounced = () => {
    clearTimeout(fetchMyChatsDebounceRef.current);
    fetchMyChatsDebounceRef.current = setTimeout(() => fetchMyChats(), 250);
  };

  // Глобальная realtime-подписка — включая тикеты поддержки (раньше "чёрная дыра": не было ни подписки, ни явной ошибки при insert)
  useEffect(() => {
    if (!session) return;
    const globalChan = supabase.channel('global_updates_' + session.user.id)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => fetchMyChatsDebounced())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_participants' }, () => fetchMyChatsDebounced())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chats' }, () => fetchMyChatsDebounced())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'stories' }, () => fetchStories())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'support_tickets' }, () => fetchSupportTickets())
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, ({ new: row }) => {
        fetchMyChatsDebounced();
        if (isDeveloper) fetchAllUsers();
        // Раньше статус "в сети" в шапке чата замирал навсегда на моменте открытия
        // диалога — карточка собеседника не обновлялась. Теперь подхватываем live.
        setActiveUser(prev => (prev && prev.id === row.id) ? { ...prev, ...row } : prev);
        setViewedProfile(prev => (prev && prev.id === row.id) ? { ...prev, ...row } : prev);
      })
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
      const q = searchQuery.trim();
      if (!q) { setSearchResults([]); setPublicCommunityResults([]); return; }
      // Ищем и по username, и по имени — раньше искалось только по точному вхождению в username
      const { data: u, error: uErr } = await supabase.from('profiles').select('*').or(`username.ilike.%${q}%,full_name.ilike.%${q}%`).limit(30);
      if (uErr) console.error('search error', uErr);
      if (u) setSearchResults(u.filter(x => !blockedIds.includes(x.id)));
      const { data: c } = await supabase.from('chats').select('*').eq('is_public', true).ilike('name', `%${q}%`).limit(30);
      if (c) setPublicCommunityResults(c);
    };
    const t = setTimeout(search, 250);
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
          if (pin) setPinnedMsgData(pin); else setPinnedMsgData(null);
        } else setPinnedMsgData(null);
        if (chat.type === 'channel' || chat.type === 'group') {
          const { count } = await supabase.from('chat_participants').select('*', { count: 'exact', head: true }).eq('chat_id', chatIdForThisEffect);
          if (isStale()) return;
          setSubscriberCount(count || 0);
        }
      }
      const { data: msgs } = await supabase.from('messages').select('*').eq('chat_id', chatIdForThisEffect).order('created_at', { ascending: true });
      if (isStale()) return;
      if (msgs) {
        setMessages(msgs);
        if (isInitial) setTimeout(() => { if (!isStale()) scrollToBottom(); }, 150);
        const { data: r } = await supabase.from('message_reactions').select('*').in('message_id', msgs.map(m => m.id));
        if (isStale()) return;
        if (r) setReactions(r);
        if (msgs.length > 0) {
          const { data: pl } = await supabase.from('polls').select('*').in('message_id', msgs.map(m => m.id));
          if (isStale()) return;
          if (pl && pl.length > 0) {
            setPolls(pl);
            const { data: pv } = await supabase.from('poll_votes').select('*').in('poll_id', pl.map(p => p.id));
            if (isStale()) return;
            if (pv) setPollVotes(pv);
          } else { setPolls([]); setPollVotes([]); }
        }
      }
      const { data: emj } = await supabase.from('custom_emojis').select('*').eq('chat_id', chatIdForThisEffect);
      if (isStale()) return;
      if (emj) setCustomEmojis(emj);
      await supabase.from('messages').update({ is_read: true }).eq('chat_id', chatIdForThisEffect).neq('sender_id', session.user.id);
    };
    loadChat(true);
    const chan = supabase.channel(`chat_${chatIdForThisEffect}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `chat_id=eq.${chatIdForThisEffect}` }, () => loadChat(false))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'message_reactions' }, () => loadChat(false))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chats', filter: `id=eq.${chatIdForThisEffect}` }, () => loadChat(false))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_participants', filter: `chat_id=eq.${chatIdForThisEffect}` }, () => loadChat(false))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'poll_votes' }, () => loadChat(false))
      .subscribe();
    return () => { supabase.removeChannel(chan); };
  }, [activeChat, session]);

  useEffect(() => {
    if (!activeChat || !session) { setTypingUsers([]); return; }
    const loadTyping = async () => {
      const cutoff = new Date(Date.now() - 4000).toISOString();
      const { data } = await supabase.from('typing_status').select('user_id, profiles(username)').eq('chat_id', activeChat).gt('updated_at', cutoff).neq('user_id', session.user.id);
      setTypingUsers(data || []);
    };
    loadTyping();
    const chan = supabase.channel(`typing_${activeChat}`).on('postgres_changes', { event: '*', schema: 'public', table: 'typing_status', filter: `chat_id=eq.${activeChat}` }, loadTyping).subscribe();
    const iv = setInterval(loadTyping, 2500);
    return () => { supabase.removeChannel(chan); clearInterval(iv); };
  }, [activeChat, session]);

  const handleTyping = (val) => {
    setNewMessage(val);
    if (!activeChat || !session) return;
    supabase.from('typing_status').upsert({ chat_id: activeChat, user_id: session.user.id, updated_at: new Date().toISOString() });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => { supabase.from('typing_status').delete().eq('chat_id', activeChat).eq('user_id', session.user.id); }, 3000);
  };

  useEffect(() => {
    if (!openCommentsForMsg) { setCommentsList([]); return; }
    const loadComments = async () => {
      const { data } = await supabase.from('channel_comments').select('*, profiles(id, username, avatar_url, full_name)').eq('message_id', openCommentsForMsg.id).order('created_at', { ascending: true });
      if (data) setCommentsList(data);
    };
    loadComments();
  }, [openCommentsForMsg]);

  const sendComment = async () => {
    if (!newCommentText.trim() || !openCommentsForMsg) return;
    await supabase.from('channel_comments').insert([{ message_id: openCommentsForMsg.id, user_id: session.user.id, content: newCommentText }]);
    setNewCommentText('');
    const { data } = await supabase.from('channel_comments').select('*, profiles(id, username, avatar_url, full_name)').eq('message_id', openCommentsForMsg.id).order('created_at', { ascending: true });
    if (data) setCommentsList(data);
  };

  const usernameTaken = async (uname) => {
    const { data } = await supabase.from('profiles').select('id').ilike('username', uname).neq('id', session?.user?.id || '00000000-0000-0000-0000-000000000000');
    return data && data.length > 0;
  };

  const saveProfile = async () => {
    if (editUsername !== myProfile?.username && await usernameTaken(editUsername)) { alert('Этот username уже занят.'); return; }
    if (newPin && (newPin.length < 4 || !/^\d+$/.test(newPin))) { alert('Код-пароль — минимум 4 цифры.'); return; }
    const payload = { full_name: editFullName, username: editUsername, birthdate: editBirthdate || null, custom_status: editCustomStatus, avatar_url: avatarUrl, theme: themeKey };
    if (isAura) payload.emoji_status = editEmojiStatus;
    if (newPin) payload.pin_code = newPin;
    await supabase.from('profiles').update(payload).eq('id', session.user.id);
    setMyProfile(prev => ({ ...prev, ...payload }));
    alert('Профиль сохранен!');
    setNewPin('');
  };

  const activatePromo = async () => {
    if (promoCodeInput.trim() === AURA_PROMO_CODE) {
      const { error, data } = await supabase.from('profiles').update({ is_aura: true }).eq('id', session.user.id).select().single();
      if (error) { alert('Не удалось активировать: ' + error.message); return; }
      setMyProfile(prev => ({ ...prev, ...data })); // обновляем сразу, не дожидаясь отдельного запроса
      alert('Аура активирована! 💠');
      setPromoCodeInput('');
    } else {
      alert('Неверный промокод.');
    }
  };

  const openBuySupport = () => {
    setActiveTab('chats');
    setIsSupportMode(true);
    setNewSupportMsg('Хочу подписку Аура');
  };

  const createCommunity = async () => {
    if (!communityName.trim()) { alert('Введите название'); return; }
    if (!isDeveloper) {
      const { data: existing, error: existErr } = await supabase.from('chats').select('id').eq('owner_id', session.user.id).eq('type', communityType);
      if (existErr) { alert('Ошибка проверки лимита: ' + existErr.message); return; }
      const limit = isAura ? 3 : 1;
      if (existing && existing.length >= limit) { alert(`Лимит: ${limit} ${communityType === 'channel' ? 'канал(а/ов)' : 'групп(а/ы)'} на аккаунт${isAura ? '' : '. Оформите Аура для увеличения лимита.'}`); return; }
    }
    const { data: newC, error: createErr } = await supabase.from('chats').insert([{ type: communityType, name: communityName, description: communityDesc, owner_id: session.user.id, is_public: true }]).select().single();
    if (createErr || !newC) { alert('Не удалось создать: ' + (createErr?.message || 'неизвестная ошибка')); return; }
    const { error: joinErr } = await supabase.from('chat_participants').insert([{ chat_id: newC.id, user_id: session.user.id, role: 'owner' }]);
    if (joinErr) { alert('Чат создан, но не удалось добавить вас в участники: ' + joinErr.message); }
    setShowCreateCommunityModal(false); setCommunityName(''); setCommunityDesc(''); fetchMyChats(); setActiveChat(newC.id);
  };

  const updateCommunity = async () => {
    await supabase.from('chats').update({ name: activeChatData.name, description: activeChatData.description, avatar_url: communityAvatar, is_public: activeChatData.is_public }).eq('id', activeChat);
    alert('Сохранено'); setShowAdminModal(false); fetchMyChats();
  };

  const openAdminPanel = async () => {
    const { data } = await supabase.from('chat_participants').select('user_id, profiles(id, username, full_name, avatar_url)').eq('chat_id', activeChat);
    setSubscribersList(data || []);
    setShowAdminModal(true);
  };

  const removeSubscriber = async (userId) => {
    await supabase.from('chat_participants').delete().eq('chat_id', activeChat).eq('user_id', userId);
    openAdminPanel();
  };

  const pinMessage = async (msgId) => {
    await supabase.from('chats').update({ pinned_message_id: msgId }).eq('id', activeChat);
    setSelectedMsgForMenu(null);
  };

  const unpinMessage = async () => {
    await supabase.from('chats').update({ pinned_message_id: null }).eq('id', activeChat);
    setPinnedMsgData(null);
  };

  const addMemberToComm = async () => {
    const { data: u } = await supabase.from('profiles').select('id').eq('username', newMemberName).single();
    if (!u) { alert('Пользователь не найден'); return; }
    await supabase.from('chat_participants').insert({ chat_id: activeChat, user_id: u.id, role: 'member' });
    setNewMemberName(''); openAdminPanel();
  };

  const joinCommunity = async (comm) => {
    const { data: ex } = await supabase.from('chat_participants').select('id').eq('chat_id', comm.id).eq('user_id', session.user.id);
    if (!ex || ex.length === 0) await supabase.from('chat_participants').insert([{ chat_id: comm.id, user_id: session.user.id, role: 'member' }]);
    setActiveChat(comm.id); setActiveUser(null); setSearchQuery(''); fetchMyChats();
  };

  const leaveCommunity = async () => {
    if (!confirm('Отписаться от этого чата?')) return;
    await supabase.from('chat_participants').delete().eq('chat_id', activeChat).eq('user_id', session.user.id);
    setActiveChat(null); fetchMyChats();
  };

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

  const subscribeToPreviewChannel = async () => { if (previewChat) { await joinCommunity(previewChat); setPreviewChat(null); } };

  // ИСПРАВЛЕНО: раньше поиск "общего чата" с пользователем не отличал ЛС от каналов/групп,
  // из-за чего попытка написать человеку, с которым вы оба состоите в одном канале,
  // открывала этот канал вместо личной переписки.
  const startChatWithUser = async (targetUser) => {
    if (blockedIds.includes(targetUser.id)) { alert('Вы заблокировали этого пользователя.'); return; }
    setIsSupportMode(false); setActiveUser(targetUser); setSearchQuery('');
    const isSaved = targetUser.id === session.user.id;
    const { data: myP } = await supabase.from('chat_participants').select('chat_id').eq('user_id', session.user.id);
    const myChatIds = myP?.map(c => c.chat_id) || [];

    if (!isSaved) {
      const { data: existingContact } = await supabase.from('contacts').select('id').eq('owner_id', session.user.id).eq('contact_id', targetUser.id);
      if (!existingContact || existingContact.length === 0) {
        await supabase.from('contacts').insert([{ owner_id: session.user.id, contact_id: targetUser.id }]);
        await supabase.from('contacts').insert([{ owner_id: targetUser.id, contact_id: session.user.id }]);
      }
    }

    if (myChatIds.length > 0) {
      const { data: myDmChats } = await supabase.from('chats').select('id').in('id', myChatIds).eq('type', 'dm');
      const dmChatIds = (myDmChats || []).map(c => c.id);
      if (isSaved) {
        for (let cid of dmChatIds) {
          const { data: p } = await supabase.from('chat_participants').select('user_id').eq('chat_id', cid);
          if (p && p.length === 1 && p[0].user_id === session.user.id) { setActiveChat(cid); return; }
        }
      } else if (dmChatIds.length > 0) {
        const { data: cChat } = await supabase.from('chat_participants').select('chat_id').eq('user_id', targetUser.id).in('chat_id', dmChatIds).limit(1);
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
    const txt = type === 'text' ? newMessage : mediaUrl;
    if (type === 'text' && !txt.trim()) return;
    if (type === 'text') setNewMessage('');
    const finalContent = replyingMsg ? `💬 [Ответ]\n${txt}` : txt;
    setReplyingMsg(null);
    // Оптимистично показываем сообщение сразу, не дожидаясь ответа сети/realtime
    const tempId = 'temp_' + Date.now();
    const optimisticMsg = { id: tempId, chat_id: activeChat, sender_id: session.user.id, content: finalContent, is_read: false, created_at: new Date().toISOString(), _optimistic: true };
    setMessages(prev => [...prev, optimisticMsg]);
    setTimeout(scrollToBottom, 30);
    const { data: inserted, error } = await supabase.from('messages').insert([{ chat_id: activeChat, sender_id: session.user.id, content: finalContent }]).select().single();
    if (error) { setMessages(prev => prev.filter(m => m.id !== tempId)); alert('Не удалось отправить: ' + error.message); return; }
    setMessages(prev => prev.map(m => m.id === tempId ? inserted : m));
    fetchMyChats();
    clearTimeout(typingTimeoutRef.current);
    supabase.from('typing_status').delete().eq('chat_id', activeChat).eq('user_id', session.user.id);
  };

  // Только создатель канала/группы — админов больше нет. Остальные могут только отписаться.
  const isCreator = !!session && activeChatData?.owner_id === session.user.id;

  const canDeleteMessage = (msg) => {
    if (!session) return false;
    if (msg.sender_id === session.user.id) return true;
    if (activeChatData?.type === 'group' || activeChatData?.type === 'channel') return isCreator;
    return false;
  };

  const deleteMessage = async (msgId) => {
    const msg = messages.find(m => m.id === msgId);
    if (msg && !canDeleteMessage(msg)) { alert('Удалять чужие сообщения может только создатель.'); return; }
    await supabase.from('messages').delete().eq('id', msgId);
    setMessages(prev => prev.filter(m => m.id !== msgId));
    setSelectedMsgForMenu(null);
  };

  const deleteChat = async () => {
    if ((activeChatData?.type === 'group' || activeChatData?.type === 'channel') && !isCreator) { leaveCommunity(); return; }
    if (confirm('Удалить этот чат?')) {
      await supabase.from('chats').delete().eq('id', activeChat);
      setActiveChat(null); setActiveUser(null); fetchMyChats();
    }
  };

  const toggleReaction = async (msgId, emoji) => {
    const ex = reactions.find(r => r.message_id === msgId && r.user_id === session.user.id && r.emoji === emoji);
    setSelectedMsgForMenu(null);
    if (ex) {
      setReactions(prev => prev.filter(r => r.id !== ex.id));
      await supabase.from('message_reactions').delete().eq('id', ex.id);
    } else {
      const tempId = 'temp_' + Date.now();
      setReactions(prev => [...prev, { id: tempId, message_id: msgId, user_id: session.user.id, emoji }]);
      const { data } = await supabase.from('message_reactions').insert([{ message_id: msgId, user_id: session.user.id, emoji }]).select().single();
      if (data) setReactions(prev => prev.map(r => r.id === tempId ? data : r));
    }
  };

  const createPoll = async () => {
    if (!isAura) { alert('Опросы доступны только с подпиской Аура 💠'); return; }
    const opts = pollOptions.map(o => o.trim()).filter(Boolean);
    if (!pollQuestion.trim() || opts.length < 2) { alert('Введите вопрос и минимум 2 варианта'); return; }
    const { data: msg, error: msgErr } = await supabase.from('messages').insert([{ chat_id: activeChat, sender_id: session.user.id, content: '[POLL]' }]).select().single();
    if (msgErr || !msg) { alert('Не удалось создать опрос'); return; }
    await supabase.from('polls').insert([{ message_id: msg.id, question: pollQuestion, options: opts, created_by: session.user.id }]);
    setShowPollModal(false); setPollQuestion(''); setPollOptions(['', '']);
  };

  const votePoll = async (pollId, optionIndex) => {
    const existing = pollVotes.find(v => v.poll_id === pollId && v.user_id === session.user.id);
    if (existing) {
      if (existing.option_index === optionIndex) await supabase.from('poll_votes').delete().eq('poll_id', pollId).eq('user_id', session.user.id);
      else await supabase.from('poll_votes').update({ option_index: optionIndex }).eq('poll_id', pollId).eq('user_id', session.user.id);
    } else {
      await supabase.from('poll_votes').insert([{ poll_id: pollId, user_id: session.user.id, option_index: optionIndex }]);
    }
  };

  const blockUser = async (userId) => {
    if (!confirm('Заблокировать этого пользователя?')) return;
    await supabase.from('blocks').insert([{ owner_id: session.user.id, blocked_id: userId }]);
    setShowUserProfileModal(false);
    loadBlocked();
  };

  const unblockUser = async (userId) => {
    await supabase.from('blocks').delete().eq('owner_id', session.user.id).eq('blocked_id', userId);
    loadBlocked();
  };

  const openProfileOf = (u) => { setViewedProfile(u); setShowUserProfileModal(true); };

  // ===== Аудио/видеозвонки =====
  // TURN-сервер сильно повышает надёжность соединения (особенно в мобильных сетях).
  // Без него звонок работает "через раз" и рвётся при смене сети — это ограничение
  // чистого STUN, а не баг кода. NEXT_PUBLIC_TURN_URL можно задать через запятую
  // (несколько адресов/портов — разные сети пробивают по-разному).
  const ICE_SERVERS = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    ...(process.env.NEXT_PUBLIC_TURN_URL
      ? process.env.NEXT_PUBLIC_TURN_URL.split(',').map(u => ({
          urls: u.trim(),
          username: process.env.NEXT_PUBLIC_TURN_USERNAME,
          credential: process.env.NEXT_PUBLIC_TURN_CREDENTIAL,
        }))
      : []),
  ];

  // Раньше здесь стояло 1440p ("2K") — на практике это заставляло WebRTC гнаться
  // за недостижимым разрешением через слабый TURN-релей и картинка проваливалась
  // до 360p рывками. 720p — честный потолок, который держится стабильно.
  const VIDEO_CONSTRAINTS = { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } };

  // Форсируем высокий битрейт для видео — иначе браузер по умолчанию сильно экономит трафик
  const boostVideoQuality = async (pc) => {
    const sender = pc.getSenders().find(s => s.track && s.track.kind === 'video');
    if (!sender) return;
    try {
      const params = sender.getParameters();
      if (!params.encodings || params.encodings.length === 0) params.encodings = [{}];
      params.encodings[0].maxBitrate = 2_000_000; // ~2 Мбит/с — уверенно держится на 720p даже через TURN-релей
      params.encodings[0].scaleResolutionDownBy = 1.0;
      await sender.setParameters(params);
    } catch (e) { /* браузер может не поддерживать — не критично */ }
  };


  const sendSignal = (targetUserId, event, payload) => {
    supabase.channel(`user_calls_${targetUserId}`).send({ type: 'broadcast', event, payload });
  };

  const cleanupCall = () => {
    clearInterval(callTimerRef.current);
    callTimerRef.current = null;
    clearTimeout(ringTimeoutRef.current);
    clearTimeout(reconnectGraceRef.current);
    setCallDuration(0);
    if (pcRef.current) { try { pcRef.current.close(); } catch (e) {} pcRef.current = null; }
    if (localStreamRef.current) { localStreamRef.current.getTracks().forEach(t => t.stop()); localStreamRef.current = null; }
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    if (currentCallDbIdRef.current) supabase.from('calls').update({ status: 'ended' }).eq('id', currentCallDbIdRef.current).then(() => {});
    currentCallIdRef.current = null;
    currentCallDbIdRef.current = null;
    pendingOfferRef.current = null;
    pendingIceRef.current = [];
    setConnState('new'); setIceState('new');
    setCallState('idle'); setCallPeerInfo(null); setIsMuted(false); setIsCamOff(false); setCallType('audio');
  };

  // ICE-кандидаты, пришедшие раньше setRemoteDescription, раньше просто терялись
  // (addIceCandidate падал и глотался в try/catch) — из-за этого звонок мог
  // «дойти», но так и не соединиться. Теперь копим их и применяем после.
  const flushPendingIce = async () => {
    const queued = pendingIceRef.current;
    pendingIceRef.current = [];
    for (const c of queued) {
      try { await pcRef.current.addIceCandidate(new RTCIceCandidate(c)); } catch (e) {}
    }
  };

  // Получаем свежий (короткоживущий) пропуск на Cloudflare TURN перед каждым звонком.
  // Секретный ключ Cloudflare нигде в приложении не хранится — только на сервере Supabase.
  const fetchTurnServers = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-turn-credentials');
      if (!error && data?.iceServers) return Array.isArray(data.iceServers) ? data.iceServers : [data.iceServers];
    } catch (e) { /* TURN не настроен или недоступен — звоним хотя бы через STUN */ }
    return [];
  };

  const createPeerConnection = (targetUserId, extraIceServers = []) => {
    const pc = new RTCPeerConnection({ iceServers: [...ICE_SERVERS, ...extraIceServers] });
    pc.onicecandidate = (e) => { if (e.candidate) sendSignal(targetUserId, 'ice-candidate', { callId: currentCallIdRef.current, candidate: e.candidate }); };
    pc.ontrack = (e) => {
      if (e.track.kind === 'video' && remoteVideoRef.current) { remoteVideoRef.current.srcObject = e.streams[0]; remoteVideoRef.current.play?.().catch(() => {}); }
      if (e.track.kind === 'audio' && remoteAudioRef.current) { remoteAudioRef.current.srcObject = e.streams[0]; remoteAudioRef.current.play?.().catch(() => {}); }
    };
    pc.onconnectionstatechange = () => {
      setConnState(pc.connectionState);
      clearTimeout(reconnectGraceRef.current);
      if (pc.connectionState === 'failed') { cleanupCall(); return; }
      if (pc.connectionState === 'disconnected') {
        // Кратковременные обрывы (сменил сеть, слабый сигнал) часто восстанавливаются
        // сами за пару секунд — раньше звонок падал мгновенно при малейшей заминке.
        reconnectGraceRef.current = setTimeout(() => {
          if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') cleanupCall();
        }, 8000);
      }
    };
    pc.oniceconnectionstatechange = () => setIceState(pc.iceConnectionState);
    pcRef.current = pc;
    return pc;
  };

  const startCall = async (targetUser, type = 'audio') => {
    if (callState !== 'idle') return;
    currentCallIdRef.current = 'call_' + Date.now();
    facingModeRef.current = 'user';
    setCallType(type); setCallPeerInfo(targetUser); setCallState('outgoing');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: type === 'video' ? { facingMode: 'user', ...VIDEO_CONSTRAINTS } : false });
      localStreamRef.current = stream;
      setLocalStreamTick(t => t + 1);
      const turnServers = await fetchTurnServers();
      const pc = createPeerConnection(targetUser.id, turnServers);
      stream.getTracks().forEach(t => pc.addTrack(t, stream));
      if (type === 'video') await boostVideoQuality(pc);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      sendSignal(targetUser.id, 'incoming-call', { callId: currentCallIdRef.current, offer, callType: type, callerId: session.user.id, callerName: myProfile?.full_name || myProfile?.username, callerAvatar: myProfile?.avatar_url });
      // Пишем в базу — это будит собеседника пуш-уведомлением, даже если у него закрыто приложение
      const { data: callRow } = await supabase.from('calls').insert([{ caller_id: session.user.id, callee_id: targetUser.id, call_type: type, status: 'ringing', offer, call_id: currentCallIdRef.current }]).select().single();
      if (callRow) currentCallDbIdRef.current = callRow.id;
      ringTimeoutRef.current = setTimeout(() => { if (callStateRef.current === 'outgoing') { alert('Не отвечает'); cleanupCall(); } }, 45000);
    } catch (e) { alert((type === 'video' ? 'Камера/микрофон' : 'Микрофон') + ' недоступны: ' + e.message); cleanupCall(); }
  };

  const acceptCall = async () => {
    if (!pendingOfferRef.current) return;
    const { callId, offer, callerId, callType: incomingType, dbId } = pendingOfferRef.current;
    const type = incomingType || 'audio';
    currentCallIdRef.current = callId;
    currentCallDbIdRef.current = dbId || null;
    facingModeRef.current = 'user';
    setCallType(type);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: type === 'video' ? { facingMode: 'user', ...VIDEO_CONSTRAINTS } : false });
      localStreamRef.current = stream;
      setLocalStreamTick(t => t + 1);
      const turnServers = await fetchTurnServers();
      const pc = createPeerConnection(callerId, turnServers);
      stream.getTracks().forEach(t => pc.addTrack(t, stream));
      if (type === 'video') await boostVideoQuality(pc);
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      await flushPendingIce();
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      sendSignal(callerId, 'call-answer', { callId, answer });
      if (dbId) supabase.from('calls').update({ status: 'accepted', answer }).eq('id', dbId).then(() => {});
      setCallState('active');
      callTimerRef.current = setInterval(() => setCallDuration(d => d + 1), 1000);
    } catch (e) { alert((type === 'video' ? 'Камера/микрофон' : 'Микрофон') + ' недоступны: ' + e.message); declineCall(); }
  };

  const declineCall = () => {
    if (pendingOfferRef.current) {
      sendSignal(pendingOfferRef.current.callerId, 'call-decline', { callId: pendingOfferRef.current.callId });
      if (pendingOfferRef.current.dbId) supabase.from('calls').update({ status: 'declined' }).eq('id', pendingOfferRef.current.dbId).then(() => {});
    }
    cleanupCall();
  };

  const endCall = () => {
    if (callPeerInfo && currentCallIdRef.current) sendSignal(callPeerInfo.id, 'call-end', { callId: currentCallIdRef.current });
    cleanupCall();
  };

  const toggleMute = () => {
    if (!localStreamRef.current) return;
    localStreamRef.current.getAudioTracks().forEach(t => { t.enabled = isMuted; });
    setIsMuted(m => !m);
  };

  const toggleCamera = () => {
    if (!localStreamRef.current) return;
    localStreamRef.current.getVideoTracks().forEach(t => { t.enabled = isCamOff; });
    setIsCamOff(c => !c);
  };

  // Подключаем поток к <video> сразу, как только элемент реально появился в DOM
  // (раньше это делалось ДО смены состояния звонка — элемента ещё не существовало,
  // отсюда чёрный экран).
  useEffect(() => {
    if (callState === 'idle') return;
    if (localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
      localVideoRef.current.play?.().catch(() => {});
    }
  }, [callState, callType, localStreamTick]);

  const switchCamera = async () => {
    if (!localStreamRef.current || callType !== 'video') return;
    const nextFacing = facingModeRef.current === 'user' ? 'environment' : 'user';
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { exact: nextFacing }, ...VIDEO_CONSTRAINTS }, audio: false });
      const newTrack = newStream.getVideoTracks()[0];
      const oldTrack = localStreamRef.current.getVideoTracks()[0];
      const sender = pcRef.current?.getSenders().find(s => s.track && s.track.kind === 'video');
      if (sender) await sender.replaceTrack(newTrack);
      oldTrack?.stop();
      localStreamRef.current.removeTrack(oldTrack);
      localStreamRef.current.addTrack(newTrack);
      facingModeRef.current = nextFacing;
      if (localVideoRef.current) { localVideoRef.current.srcObject = localStreamRef.current; localVideoRef.current.play?.().catch(() => {}); }
    } catch (e) {
      alert('Не удалось переключить камеру — на этом устройстве, похоже, только одна камера.');
    }
  };

  // Личный канал звонков — подписан всегда, пока открыто приложение.
  // Плюс подписка на таблицу calls в базе — это ловит звонок, даже если приложение
  // было закрыто и открылось только что (по нажатию на push-уведомление).
  useEffect(() => {
    if (!session) return;
    const chan = supabase.channel(`user_calls_${session.user.id}`, { config: { broadcast: { self: false } } })
      .on('broadcast', { event: 'incoming-call' }, ({ payload }) => {
        if (callStateRef.current !== 'idle') { sendSignal(payload.callerId, 'call-busy', { callId: payload.callId }); return; }
        pendingOfferRef.current = payload;
        setCallPeerInfo({ id: payload.callerId, full_name: payload.callerName, avatar_url: payload.callerAvatar });
        setCallType(payload.callType || 'audio');
        setCallState('incoming');
        if (navigator.vibrate) navigator.vibrate([400, 200, 400, 200, 400]);
      })
      .on('broadcast', { event: 'call-answer' }, async ({ payload }) => {
        if (payload.callId !== currentCallIdRef.current || !pcRef.current) return;
        if (pcRef.current.signalingState === 'stable') return; // ответ уже применён
        try {
          await pcRef.current.setRemoteDescription(new RTCSessionDescription(payload.answer));
          await flushPendingIce();
          clearTimeout(ringTimeoutRef.current);
          setCallState('active');
          callTimerRef.current = callTimerRef.current || setInterval(() => setCallDuration(d => d + 1), 1000);
        } catch (e) { console.error('setRemoteDescription(answer) failed', e); }
      })
      .on('broadcast', { event: 'ice-candidate' }, async ({ payload }) => {
        if (payload.callId !== currentCallIdRef.current || !pcRef.current) return;
        if (!pcRef.current.remoteDescription) { pendingIceRef.current.push(payload.candidate); return; }
        try { await pcRef.current.addIceCandidate(new RTCIceCandidate(payload.candidate)); } catch (e) {}
      })
      .on('broadcast', { event: 'call-end' }, ({ payload }) => { if (payload.callId === currentCallIdRef.current) cleanupCall(); })
      .on('broadcast', { event: 'call-decline' }, ({ payload }) => { if (payload.callId === currentCallIdRef.current) { alert('Собеседник отклонил звонок'); cleanupCall(); } })
      .on('broadcast', { event: 'call-busy' }, ({ payload }) => { if (payload.callId === currentCallIdRef.current) { alert('Собеседник сейчас занят'); cleanupCall(); } })
      .subscribe();
    userCallChannelRef.current = chan;

    // Резервный путь через базу — на случай если приложение открылось уже после звонка
    const dbChan = supabase.channel(`db_calls_${session.user.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'calls', filter: `callee_id=eq.${session.user.id}` }, async ({ new: row }) => {
        if (row.status !== 'ringing' || callStateRef.current !== 'idle') return;
        const { data: caller } = await supabase.from('profiles').select('id, username, full_name, avatar_url').eq('id', row.caller_id).single();
        pendingOfferRef.current = { callId: row.call_id, offer: row.offer, callerId: row.caller_id, callType: row.call_type, dbId: row.id };
        setCallPeerInfo(caller || { id: row.caller_id });
        setCallType(row.call_type || 'audio');
        setCallState('incoming');
        if (navigator.vibrate) navigator.vibrate([400, 200, 400, 200, 400]);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'calls' }, ({ new: row }) => {
        if (row.id !== currentCallDbIdRef.current) return;
        // Само соединение (offer/answer/ICE) идёт ТОЛЬКО через broadcast выше —
        // здесь только реагируем на отклонение/завершение, без повторного
        // применения SDP (раньше это иногда гонялось с broadcast-путём и рвало звонок).
        if (row.status === 'declined' && callStateRef.current === 'outgoing') { alert('Собеседник отклонил звонок'); cleanupCall(); }
        if (row.status === 'ended' && callStateRef.current !== 'idle') cleanupCall();
      })
      .subscribe();

    // При открытии приложения проверяем, нет ли свежего непойманного звонка (последние 45 сек)
    (async () => {
      const cutoff = new Date(Date.now() - 45000).toISOString();
      const { data: recent } = await supabase.from('calls').select('*').eq('callee_id', session.user.id).eq('status', 'ringing').gt('created_at', cutoff).order('created_at', { ascending: false }).limit(1);
      if (recent && recent.length > 0 && callStateRef.current === 'idle') {
        const row = recent[0];
        const { data: caller } = await supabase.from('profiles').select('id, username, full_name, avatar_url').eq('id', row.caller_id).single();
        pendingOfferRef.current = { callId: row.call_id, offer: row.offer, callerId: row.caller_id, callType: row.call_type, dbId: row.id };
        setCallPeerInfo(caller || { id: row.caller_id });
        setCallType(row.call_type || 'audio');
        setCallState('incoming');
        if (navigator.vibrate) navigator.vibrate([400, 200, 400, 200, 400]);
      }
    })();

    return () => { supabase.removeChannel(chan); supabase.removeChannel(dbChan); };
  }, [session]);

  const formatDuration = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;


  const handleMediaUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    // Единая кнопка "медиа" — сами определяем фото это или видео
    if (type === 'media') type = file.type.startsWith('video/') ? 'video' : 'img';

    if (type === 'story') {
      const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
      const { data: todays } = await supabase.from('stories').select('id').eq('user_id', session.user.id).gte('created_at', todayStart.toISOString());
      const limit = isAura ? 3 : 1;
      if (todays && todays.length >= limit) { alert(`Лимит историй в сутки: ${limit}${isAura ? '' : '. Оформите Аура для увеличения лимита.'}`); e.target.value = ''; return; }
    }

    const safeExt = (file.name.split('.').pop() || 'bin').toLowerCase();
    const name = `${type}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${safeExt}`;
    const { error } = await supabase.storage.from('media').upload(name, file, { contentType: file.type || 'application/octet-stream', cacheControl: '3600', upsert: true });
    if (error) {
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
    else if (type === 'video') await sendMessage('video', `[VIDEO]:${publicUrl}`);
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
        if (!error) { const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(name); sendMessage('voice', `[VOICE]:${publicUrl}`); }
        else alert('Не удалось загрузить голосовое: ' + error.message);
      };
      mediaRecorderRef.current.start(); setIsRecording(true);
    } catch { alert('Микрофон недоступен!'); }
  };

  const stopRecording = () => { if (mediaRecorderRef.current && isRecording) { mediaRecorderRef.current.stop(); setIsRecording(false); } };

  const replyToTicket = async (ticketId) => {
    const text = replyTicketText[ticketId];
    if (!text?.trim()) return;
    const { error } = await supabase.from('support_tickets').update({ reply: text, status: 'closed' }).eq('id', ticketId);
    if (error) { alert('Не удалось отправить ответ: ' + error.message); return; }
    setReplyTicketText(prev => ({ ...prev, [ticketId]: '' }));
    fetchSupportTickets();
  };

  const sendSupportMessage = async () => {
    if (!newSupportMsg.trim()) return;
    const { error } = await supabase.from('support_tickets').insert({ user_id: session.user.id, message: newSupportMsg });
    if (error) { alert('Не удалось отправить в поддержку: ' + error.message); return; }
    setNewSupportMsg('');
    fetchSupportTickets();
  };

  const handleAuth = async (type) => {
    setLoading(true);
    if (type === 'signup') {
      if (!signupUsername || !signupEmail || !password) { setLoading(false); return alert('Заполните все поля!'); }
      const { data: taken } = await supabase.from('profiles').select('id').ilike('username', signupUsername);
      if (taken && taken.length > 0) { setLoading(false); alert('Этот username уже занят.'); return; }
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

  if (locked) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#030712', fontFamily: 'system-ui, sans-serif', padding: '16px' }}>
        <div style={{ width: '100%', maxWidth: '320px', padding: '32px 24px', background: theme.bgCard, borderRadius: '24px', border: `1px solid ${theme.border}`, textAlign: 'center', color: '#fff' }}>
          <div style={{ marginBottom: '10px', color: theme.primary }}><Icons.Lock /></div>
          <h3 style={{ margin: '0 0 16px' }}>Введите код-пароль</h3>
          <input autoFocus type="password" inputMode="numeric" value={pinAttempt} onChange={e => setPinAttempt(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: '#030712', color: '#fff', border: `1px solid ${theme.border}`, textAlign: 'center', fontSize: '20px', letterSpacing: '6px', outline: 'none', boxSizing: 'border-box' }} />
          <button onClick={() => { if (pinAttempt === myProfile?.pin_code) { setLocked(false); setPinAttempt(''); } else alert('Неверный код'); }} style={{ width: '100%', marginTop: '14px', padding: '12px', borderRadius: '12px', background: theme.gradient, border: 'none', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>Разблокировать</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', background: 'var(--bg-app)', fontFamily: 'system-ui, sans-serif', color: 'var(--text-primary)', overflow: 'hidden' }}>
      <style>{`:root { ${Object.entries(SURFACE_VARS[colorMode]).map(([k, v]) => `${k}: ${v};`).join(' ')} }`}</style>
      <div style={{ width: (activeChat || isSupportMode) ? '320px' : '100%', display: (activeChat || isSupportMode) ? 'none' : 'flex', flexDirection: 'column', borderRight: `1px solid ${theme.border}`, background: 'var(--bg-surface-blur)', backdropFilter: 'blur(16px)', height: '100%' }}>
        <div style={{ padding: '16px', borderBottom: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '20px', color: theme.primary, textShadow: `0 0 10px ${theme.glow}` }}>DroJent {isDeveloper && <Icons.Crown />} {isAura && <Icons.Aura />}</h3>
          <button onClick={async () => {
            try {
              const reg = await navigator.serviceWorker?.getRegistration?.();
              const sub = await reg?.pushManager?.getSubscription?.();
              if (sub) await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint).eq('user_id', session.user.id);
            } catch (e) {}
            supabase.auth.signOut();
          }} style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #f87171', background: 'transparent', color: '#f87171', fontSize: '12px', cursor: 'pointer' }}>Выйти</button>
        </div>

        <div style={{ padding: '10px 12px', borderBottom: `1px solid ${theme.border}`, display: 'flex', gap: '12px', overflowX: 'auto', background: 'var(--bg-toolbar)' }}>
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

        {activeTab === 'profile' ? (
          <div style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ textAlign: 'center', marginBottom: '10px' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: theme.secondary, margin: '0 auto 10px', overflow: 'hidden', border: `2px solid ${theme.primary}`, boxShadow: `0 0 15px ${theme.glow}` }}>
                {avatarUrl ? <img src={avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="avatar"/> : 'U'}
              </div>
              <label style={{ color: theme.primary, fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}>Изменить аватар<input type="file" accept="image/*" onChange={(e) => handleMediaUpload(e, 'avatar')} style={{ display: 'none' }}/></label>
              {isAura && <div style={{ marginTop: '6px', display: 'inline-block', padding: '3px 10px', borderRadius: '20px', background: 'rgba(192,132,252,0.15)', border: '1px solid #c084fc', color: '#c084fc', fontSize: '11px', fontWeight: 'bold' }}>💠 Аура активна</div>}
            </div>

            <div style={{ background: 'var(--input-bg)', padding: '12px', borderRadius: '12px', border: `1px solid ${theme.border}` }}>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Тема оформления:</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {Object.entries(THEMES).map(([key, t]) => {
                  const locked = t.locked && !isAura;
                  return (
                    <button key={key} disabled={locked} onClick={() => { setThemeKey(key); supabase.from('profiles').update({ theme: key }).eq('id', session.user.id); }} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: themeKey===key ? `2px solid var(--text-primary)` : 'none', background: locked ? 'var(--bg-muted)' : t.secondary, color: locked ? 'var(--text-muted)' : '#fff', cursor: locked ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '11px', opacity: locked ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                      {key === 'blue' ? 'Синий' : key === 'green' ? 'Зелёный' : 'Фиолетовый'} {locked && <Icons.Lock />}
                    </button>
                  );
                })}
              </div>
              {!isAura && <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '6px' }}>Зелёная и фиолетовая темы доступны с Аура 💠</div>}
            </div>

            <div style={{ background: 'var(--input-bg)', padding: '12px', borderRadius: '12px', border: `1px solid ${theme.border}` }}>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Оформление:</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => { setColorMode('dark'); supabase.from('profiles').update({ color_mode: 'dark' }).eq('id', session.user.id); }} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: colorMode === 'dark' ? `2px solid ${theme.primary}` : `1px solid ${theme.border}`, background: '#0b0f19', color: '#f8fafc', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>🌙 Тёмная</button>
                <button onClick={() => { setColorMode('light'); supabase.from('profiles').update({ color_mode: 'light' }).eq('id', session.user.id); }} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: colorMode === 'light' ? `2px solid ${theme.primary}` : `1px solid ${theme.border}`, background: '#f1f5f9', color: '#0f172a', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>☀️ Светлая</button>
              </div>
            </div>

            <input style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'var(--input-bg)', color: 'var(--text-primary)', border: `1px solid ${theme.border}`, outline: 'none', boxSizing: 'border-box' }} placeholder="Имя (Full Name)" value={editFullName} onChange={e => setEditFullName(e.target.value)} />
            <input style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'var(--input-bg)', color: 'var(--text-primary)', border: `1px solid ${theme.border}`, outline: 'none', boxSizing: 'border-box' }} placeholder="Username" value={editUsername} onChange={e => setEditUsername(e.target.value)} />
            <input type="date" style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'var(--input-bg)', color: 'var(--text-primary)', border: `1px solid ${theme.border}`, outline: 'none', boxSizing: 'border-box' }} value={editBirthdate} onChange={e => setEditBirthdate(e.target.value)} />
            <input style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'var(--input-bg)', color: 'var(--text-primary)', border: `1px solid ${theme.border}`, outline: 'none', boxSizing: 'border-box' }} placeholder="Статус" value={editCustomStatus} onChange={e => setEditCustomStatus(e.target.value)} />
            <input disabled={!isAura} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'var(--input-bg)', color: 'var(--text-primary)', border: `1px solid ${theme.border}`, outline: 'none', boxSizing: 'border-box', opacity: isAura ? 1 : 0.5 }} placeholder={isAura ? 'Эмодзи-статус (например 🎮)' : 'Эмодзи-статус — доступно с Аура 💠'} value={editEmojiStatus} onChange={e => setEditEmojiStatus(e.target.value)} maxLength={4} />

            <input type="password" inputMode="numeric" style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'var(--input-bg)', color: 'var(--text-primary)', border: `1px solid ${theme.border}`, outline: 'none', boxSizing: 'border-box' }} placeholder={myProfile?.pin_code ? 'Новый код-пароль (оставьте пустым, чтобы не менять)' : 'Задать код-пароль при входе (4+ цифры)'} value={newPin} onChange={e => setNewPin(e.target.value)} />
            {myProfile?.pin_code && (
              <button onClick={async () => { if (!confirm('Отключить код-пароль при входе?')) return; await supabase.from('profiles').update({ pin_code: null }).eq('id', session.user.id); setMyProfile(prev => ({ ...prev, pin_code: null })); setNewPin(''); }} style={{ width: '100%', padding: '8px', borderRadius: '8px', background: 'transparent', border: '1px solid #f87171', color: '#f87171', cursor: 'pointer', fontSize: '13px' }}>Отключить код-пароль</button>
            )}

            <button onClick={saveProfile} style={{ width: '100%', padding: '12px', borderRadius: '10px', background: theme.gradient, color: '#fff', fontWeight: 'bold', cursor: 'pointer', border: 'none' }}>Сохранить профиль</button>

            {!isAura && (
              <div style={{ background: 'rgba(192,132,252,0.08)', border: '1px solid #c084fc', borderRadius: '12px', padding: '14px' }}>
                <div style={{ color: '#c084fc', fontWeight: 'bold', marginBottom: '6px' }}>💠 Подписка Аура</div>
                <div style={{ fontSize: '12px', color: '#cbd5e1', marginBottom: '10px' }}>Зелёная/фиолетовая темы, опросы, эмодзи-статус, до 3 каналов и групп, до 3 историй в сутки.</div>
                <input style={{ width: '100%', padding: '8px', borderRadius: '8px', background: 'var(--bg-app)', color: 'var(--text-primary)', border: '1px solid #c084fc', outline: 'none', boxSizing: 'border-box', marginBottom: '8px' }} placeholder="Промокод" value={promoCodeInput} onChange={e => setPromoCodeInput(e.target.value)} />
                <button onClick={activatePromo} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'linear-gradient(135deg,#7e22ce,#c084fc)', border: 'none', color: '#fff', fontWeight: 'bold', cursor: 'pointer', marginBottom: '8px' }}>Активировать</button>
                <button onClick={openBuySupport} style={{ width: '100%', padding: '8px', borderRadius: '8px', background: 'transparent', border: '1px solid #94a3b8', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '12px' }}>Нет промокода? Купить Аура</button>
              </div>
            )}
          </div>
        ) : activeTab === 'tickets' ? (
          <div style={{ padding: '16px', overflowY: 'auto', flex: 1 }}>
            {tickets.length === 0 && <div style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '20px' }}>Тикетов пока нет</div>}
            {tickets.map(t => (
              <div key={t.id} style={{ padding: '12px', background: 'var(--bg-card)', borderRadius: '12px', marginBottom: '10px', border: `1px solid ${theme.border}` }}>
                <div style={{ color: theme.primary, fontSize: '12px', fontWeight: 'bold' }}>@{t.profiles?.username}</div>
                <div style={{ color: 'var(--text-primary)', fontSize: '14px', margin: '5px 0' }}>{t.message}</div>
                {t.reply && <div style={{ color: '#22c55e', fontSize: '12px' }}>Ответ: {t.reply}</div>}
                {!t.reply && (
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <input style={{ flex: 1, padding: '6px', background: 'var(--input-bg)', color: 'var(--text-primary)', border: 'none', borderRadius: '6px' }} value={replyTicketText[t.id] || ''} onChange={e => setReplyTicketText({...replyTicketText, [t.id]: e.target.value})} placeholder="Ответ..." />
                    <button onClick={() => replyToTicket(t.id)} style={{ padding: '6px 12px', background: theme.primary, color: '#000', border: 'none', borderRadius: '6px', fontWeight: 'bold' }}>Ответить</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : activeTab === 'users' ? (
          <div style={{ padding: '16px', overflowY: 'auto', flex: 1 }}>
            {allUsers.map(u => (
              <div key={u.id} style={{ padding: '12px', background: 'var(--bg-card)', borderRadius: '12px', marginBottom: '10px', border: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden', background: '#2563eb', flexShrink: 0 }}>
                  {u.avatar_url && <img src={u.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="av"/>}
                </div>
                <div style={{ flex: 1, minWidth: '120px' }}>
                  <div style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '13px' }}>{u.full_name || u.username} {u.is_online && <span style={{ color: '#22c55e' }}>●</span>} {u.is_aura && <Icons.Aura />}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>@{u.username}</div>
                </div>
                <button onClick={() => toggleAuraUser(u)} style={{ padding: '6px 10px', borderRadius: '8px', border: `1px solid ${u.is_aura ? '#c084fc' : 'var(--text-muted)'}`, background: 'transparent', color: u.is_aura ? '#c084fc' : 'var(--text-secondary)', fontSize: '11px', cursor: 'pointer' }}>{u.is_aura ? 'Снять Ауру' : 'Дать Ауру'}</button>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <button onClick={() => setShowCreateCommunityModal(true)} style={{ margin: '10px', padding: '10px', border: `1px solid ${theme.primary}`, background: 'rgba(56,189,248,0.1)', color: theme.primary, borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>➕ Создать Группу / Канал</button>
            <input style={{ margin: '0 10px 10px', padding: '10px', background: 'var(--bg-app)', border: `1px solid ${theme.border}`, color: 'var(--text-primary)', borderRadius: '10px', outline: 'none' }} placeholder="Поиск..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {(searchQuery ? [...publicCommunityResults, ...searchResults] : myChats).map((item, i) => {
                const c = item.isGroupOrChannel ? item.chatDetails : item;
                const u = item.profiles || (!item.isGroupOrChannel ? item : null);
                if (c?.type === 'group' || c?.type === 'channel') {
                  return (
                    <div key={i} onClick={() => openChannelOrGroup(c)} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-hairline)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', background: activeChat === c.id ? 'var(--border-hairline)' : 'transparent' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: c.type==='channel' ? '#8b5cf6' : '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        {c.avatar_url ? <img src={c.avatar_url} style={{ width:'100%', height:'100%', objectFit:'cover' }} alt="comm"/> : (c.type==='channel'?'📢':'👥')}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: 'var(--text-primary)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>{c.name} {c.is_verified && <Icons.Verified />}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>{c.type==='channel'?'Канал':'Группа'}</div>
                      </div>
                      {!!item._unread && (
                        <span style={{ minWidth: '20px', height: '20px', padding: '0 6px', borderRadius: '10px', background: theme.primary, color: '#000', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{item._unread}</span>
                      )}
                    </div>
                  );
                }
                if (u) {
                  return (
                    <div key={i} onClick={() => startChatWithUser(u)} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-hairline)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', background: activeUser?.id === u.id ? 'var(--border-hairline)' : 'transparent' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: u.id === session.user.id ? theme.primary : '#2563eb', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                        {u.avatar_url ? <img src={u.avatar_url} style={{width:'100%', height:'100%', objectFit:'cover'}} alt="av"/> : 'U'}
                        {u.is_online && <span style={{ position: 'absolute', bottom: 0, right: 0, width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e', border: '2px solid #0b0f19' }} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: 'var(--text-primary)', display: 'flex', gap: '5px', fontWeight: '600', alignItems: 'center' }}>
                          {u.full_name || u.username} {u.emoji_status} {u.status_badge === '👑 Developer' && <Icons.Crown />} {u.is_aura && <Icons.Aura />}
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>@{u.username}</div>
                      </div>
                      {!!item._unread && (
                        <span style={{ minWidth: '20px', height: '20px', padding: '0 6px', borderRadius: '10px', background: theme.primary, color: '#000', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{item._unread}</span>
                      )}
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

        {/* Нижний бар — иконки вместо надписей, как в мобильных мессенджерах */}
        <div style={{ display: 'flex', borderTop: `1px solid ${theme.border}`, background: 'var(--bg-toolbar)', backdropFilter: 'blur(16px)', flexShrink: 0, paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
          <button onClick={() => { setActiveTab('chats'); setIsSupportMode(false); }} style={{ flex: 1, padding: '10px 4px 8px', background: 'transparent', border: 'none', color: activeTab === 'chats' ? theme.primary : 'var(--text-muted)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
            <span style={{ display: 'flex', filter: activeTab === 'chats' ? `drop-shadow(0 0 6px ${theme.glow})` : 'none' }}><Icons.ChatsTab /></span>
            <span style={{ fontSize: '10px' }}>Чаты</span>
          </button>
          <button onClick={() => { setActiveTab('profile'); setIsSupportMode(false); }} style={{ flex: 1, padding: '10px 4px 8px', background: 'transparent', border: 'none', color: activeTab === 'profile' ? theme.primary : 'var(--text-muted)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
            <span style={{ display: 'flex', filter: activeTab === 'profile' ? `drop-shadow(0 0 6px ${theme.glow})` : 'none' }}><Icons.SettingsTab /></span>
            <span style={{ fontSize: '10px' }}>Настройки</span>
          </button>
          {isDeveloper && (
            <button onClick={() => { setActiveTab('tickets'); setIsSupportMode(false); }} style={{ flex: 1, padding: '10px 4px 8px', background: 'transparent', border: 'none', color: activeTab === 'tickets' ? theme.primary : 'var(--text-muted)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
              <span style={{ display: 'flex', filter: activeTab === 'tickets' ? `drop-shadow(0 0 6px ${theme.glow})` : 'none' }}><Icons.TicketsTab /></span>
              <span style={{ fontSize: '10px' }}>Тикеты</span>
            </button>
          )}
          {isDeveloper && (
            <button onClick={() => { setActiveTab('users'); setIsSupportMode(false); fetchAllUsers(); }} style={{ flex: 1, padding: '10px 4px 8px', background: 'transparent', border: 'none', color: activeTab === 'users' ? theme.primary : 'var(--text-muted)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
              <span style={{ display: 'flex', filter: activeTab === 'users' ? `drop-shadow(0 0 6px ${theme.glow})` : 'none' }}><Icons.UsersTab /></span>
              <span style={{ fontSize: '10px' }}>Юзеры</span>
            </button>
          )}
        </div>
      </div>

      <div style={{ flex: 1, minWidth: 0, display: (!activeChat && !isSupportMode) ? 'none' : 'flex', flexDirection: 'column', background: 'var(--bg-app)' }}>
        {isSupportMode ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '12px 16px', background: 'var(--bg-surface-blur)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: `1px solid ${theme.border}` }}>
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
              <input style={{ flex: 1, padding: '10px 16px', borderRadius: '20px', background: 'var(--bg-card-solid)', color: 'var(--text-primary)', border: 'none', outline: 'none' }} value={newSupportMsg} onChange={e => setNewSupportMsg(e.target.value)} placeholder="Опишите проблему..." />
              <button onClick={sendSupportMessage} style={{ padding: '10px 18px', borderRadius: '20px', background: theme.primary, border: 'none', cursor: 'pointer' }}><Icons.Send /></button>
            </div>
          </div>
        ) : activeChat ? (
          <>
            <div style={{ padding: '12px 16px', background: 'var(--bg-surface-blur)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${theme.border}`, flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button onClick={() => { setActiveChat(null); setActiveUser(null); }} style={{ background: 'transparent', border: 'none', color: theme.primary, cursor: 'pointer' }}><Icons.Back /></button>
                <div onClick={() => { if (activeChatData?.type === 'channel' || activeChatData?.type === 'group') openAdminPanel(); else if (activeUser) openProfileOf(activeUser); }} style={{ width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, cursor: 'pointer', background: activeChatData?.type === 'channel' ? '#8b5cf6' : activeChatData?.type === 'group' ? '#10b981' : theme.secondary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
                  {(activeChatData?.avatar_url || activeUser?.avatar_url)
                    ? <img src={activeChatData?.avatar_url || activeUser?.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="avatar" />
                    : (activeChatData?.type === 'channel' ? '📢' : activeChatData?.type === 'group' ? '👥' : (activeUser?.id === session.user.id ? '🔖' : (activeUser?.full_name || activeUser?.username || '?').charAt(0).toUpperCase()))}
                </div>
                <div>
                  <h3 onClick={() => { if (activeChatData?.type === 'channel' || activeChatData?.type === 'group') openAdminPanel(); else if (activeUser) openProfileOf(activeUser); }} style={{ margin: 0, color: theme.primary, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    {activeChatData?.type === 'group' ? activeChatData.name : activeChatData?.type === 'channel' ? activeChatData.name : (activeUser?.id === session.user.id ? 'Избранное' : activeUser?.full_name || activeUser?.username)}
                    {activeChatData?.is_verified && <Icons.Verified />}
                    {activeUser?.status_badge === '👑 Developer' && <Icons.Crown />}
                  </h3>
                  {(activeChatData?.type === 'group' || activeChatData?.type === 'channel') && (
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{subscriberCount} {activeChatData?.type === 'channel' ? 'подписчиков' : 'участников'}</div>
                  )}
                  {typingUsers.length > 0 && <div style={{ fontSize: '11px', color: theme.primary }}>{typingUsers.map(t => t.profiles?.username).join(', ')} печатает...</div>}
                  {activeChatData?.type === 'dm' && activeUser && activeUser.id !== session.user.id && typingUsers.length === 0 && (
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{activeUser.is_online ? 'в сети' : `был(а) в сети ${timeAgo(activeUser.last_seen)}`}</div>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                {activeChatData?.type === 'dm' && activeUser && activeUser.id !== session.user.id && (
                  <>
                    <button onClick={() => startCall(activeUser, 'audio')} disabled={callState !== 'idle'} style={{ background: 'transparent', border: 'none', color: theme.primary, cursor: callState === 'idle' ? 'pointer' : 'not-allowed', display: 'flex' }}><Icons.Phone /></button>
                    <button onClick={() => startCall(activeUser, 'video')} disabled={callState !== 'idle'} style={{ background: 'transparent', border: 'none', color: theme.primary, cursor: callState === 'idle' ? 'pointer' : 'not-allowed', display: 'flex' }}><Icons.Video /></button>
                  </>
                )}
                {(activeChatData?.type === 'dm' || activeChatData?.type === 'group' || activeChatData?.type === 'channel') && (
                  <button onClick={() => toggleMuteChat(activeChat)} title={mutedChatIds.includes(activeChat) ? 'Включить уведомления' : 'Отключить уведомления'} style={{ background: 'transparent', border: 'none', color: mutedChatIds.includes(activeChat) ? 'var(--text-muted)' : theme.primary, cursor: 'pointer', display: 'flex' }}>
                    {mutedChatIds.includes(activeChat) ? <Icons.BellOff /> : <Icons.Bell />}
                  </button>
                )}
                {(activeChatData?.type === 'dm' || activeChatData?.type === 'group' || activeChatData?.type === 'channel') && (
                  <button onClick={deleteChat} title={isCreator ? 'Удалить' : 'Отписаться'} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><Icons.Trash /></button>
                )}
              </div>
            </div>

            {pinnedMsgData && (
              <div style={{ padding: '8px 16px', background: 'rgba(56, 189, 248, 0.1)', borderBottom: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: theme.primary, minWidth: 0 }}>
                <Icons.Pin />
                <span style={{ fontWeight: 'bold', flexShrink: 0 }}>Закреплено:</span>
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: '1 1 0%', minWidth: 0, color: 'var(--text-primary)' }}>
                  {pinnedMsgData.content.startsWith('[IMAGE]:') ? '📷 Фото'
                    : pinnedMsgData.content.startsWith('[VIDEO]:') ? '🎥 Видео'
                    : pinnedMsgData.content.startsWith('[VOICE]:') ? '🎤 Голосовое'
                    : pinnedMsgData.content === '[POLL]' ? '📊 Опрос'
                    : pinnedMsgData.content.startsWith('[CALL]:') ? '📞 Звонок'
                    : pinnedMsgData.content}
                </span>
                {isCreator && <button onClick={unpinMessage} style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '13px', flexShrink: 0 }}>✖</button>}
              </div>
            )}

            <div ref={messagesContainerRef} style={{ flex: 1, minWidth: 0, padding: '16px', overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {messages.map(msg => {
                const isMe = msg.sender_id === session.user.id;
                const rcts = reactions.filter(r => r.message_id === msg.id);
                return (
                  <div key={msg.id} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '80%', minWidth: 0, wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                    <div onClick={() => msg.content !== '[POLL]' && setSelectedMsgForMenu(msg)} style={{ background: isMe ? theme.gradient : 'var(--bg-card)', padding: '10px 14px', borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px', color: isMe ? '#fff' : 'var(--text-primary)', cursor: msg.content === '[POLL]' ? 'default' : 'pointer', border: isMe ? 'none' : `1px solid ${theme.border}` }}>
                      {msg.content === '[POLL]' ? (() => {
                        const poll = polls.find(p => p.message_id === msg.id);
                        if (!poll) return <span style={{ color: 'var(--text-secondary)' }}>📊 Опрос загружается...</span>;
                        const votes = pollVotes.filter(v => v.poll_id === poll.id);
                        const total = votes.length;
                        const myVote = votes.find(v => v.user_id === session.user.id);
                        return (
                          <div style={{ minWidth: '220px' }}>
                            <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>📊 {poll.question}</div>
                            {poll.options.map((opt, idx) => {
                              const cnt = votes.filter(v => v.option_index === idx).length;
                              const pct = total > 0 ? Math.round((cnt / total) * 100) : 0;
                              const picked = myVote?.option_index === idx;
                              return (
                                <div key={idx} onClick={(e) => { e.stopPropagation(); votePoll(poll.id, idx); }} style={{ position: 'relative', marginBottom: '6px', padding: '8px 10px', borderRadius: '8px', background: 'rgba(0,0,0,0.25)', cursor: 'pointer', overflow: 'hidden', border: picked ? `1px solid ${theme.primary}` : '1px solid transparent' }}>
                                  <div style={{ position: 'absolute', inset: 0, width: `${pct}%`, background: 'rgba(56,189,248,0.25)' }} />
                                  <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between' }}>
                                    <span>{picked ? '✅ ' : ''}{opt}</span>
                                    <span style={{ opacity: 0.8, fontSize: '12px' }}>{pct}%</span>
                                  </div>
                                </div>
                              );
                            })}
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>{total} голосов</div>
                          </div>
                        );
                      })() : msg.content.startsWith('[IMAGE]:') ? <img src={msg.content.replace('[IMAGE]:','')} style={{maxWidth:'100%', borderRadius:'8px'}} alt="media"/>
                        : msg.content.startsWith('[VIDEO]:') ? <video controls src={msg.content.replace('[VIDEO]:','')} style={{maxWidth:'100%', borderRadius:'8px'}} />
                        : msg.content.startsWith('[VOICE]:') ? <audio controls src={msg.content.replace('[VOICE]:','')} /> : msg.content}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                        {rcts.length > 0 && (
                          <div style={{ display: 'flex', gap: '5px' }}>
                            {rcts.map(r => r.emoji.startsWith('http') ? <img key={r.id} src={r.emoji} alt="emoji" style={{ width: '16px', height: '16px' }}/> : <span key={r.id}>{r.emoji}</span>)}
                          </div>
                        )}
                        {isMe && <span style={{ marginLeft: 'auto', opacity: 0.8 }}>{msg.is_read ? <Icons.Read /> : <Icons.Sent />}</span>}
                      </div>
                    </div>
                    {activeChatData?.type === 'channel' && msg.content !== '[POLL]' && (
                      <button onClick={() => setOpenCommentsForMsg(msg)} style={{ marginTop: '4px', background: 'transparent', border: 'none', color: theme.primary, fontSize: '11px', cursor: 'pointer' }}>💬 Комментарии</button>
                    )}
                  </div>
                );
              })}
            </div>

            {activeChatData?.type === 'channel' && activeChatData.owner_id !== session.user.id ? (
              <div style={{ padding: '15px', textAlign: 'center', background: 'var(--bg-surface)', color: 'var(--text-secondary)' }}>Только создатель пишет в канал</div>
            ) : (
              <div style={{ position: 'relative', flexShrink: 0 }}>
                {showAttachMenu && (
                  <div style={{ position: 'absolute', bottom: '100%', left: '10px', marginBottom: '8px', background: 'var(--bg-surface)', border: `1px solid ${theme.border}`, borderRadius: '16px', padding: '8px', display: 'flex', flexDirection: 'column', gap: '4px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)', zIndex: 20 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '10px', cursor: 'pointer', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                      <Icons.Camera /> Фото или видео
                      <input type="file" accept="image/*,video/*" onChange={(e) => { setShowAttachMenu(false); handleMediaUpload(e, 'media'); }} style={{ display: 'none' }} />
                    </label>
                    {(activeChatData?.type === 'group' || activeChatData?.type === 'channel') && (
                      <button type="button" onClick={() => { setShowAttachMenu(false); setShowPollModal(true); }} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '10px', background: 'transparent', border: 'none', cursor: 'pointer', color: isAura ? '#fff' : 'var(--text-muted)', whiteSpace: 'nowrap', textAlign: 'left' }}>
                        📊 Опрос {!isAura && '(Аура)'}
                      </button>
                    )}
                  </div>
                )}
                <form onSubmit={e => { e.preventDefault(); sendMessage(); }} style={{ padding: '10px', background: 'var(--bg-surface)', display: 'flex', gap: '8px', alignItems: 'center', borderTop: `1px solid ${theme.border}` }}>
                  <button type="button" onClick={() => setShowAttachMenu(v => !v)} style={{ padding: '10px', background: showAttachMenu ? theme.primary : 'var(--bg-card)', borderRadius: '50%', color: showAttachMenu ? '#000' : theme.primary, border: 'none', cursor: 'pointer', display: 'flex', flexShrink: 0, transform: showAttachMenu ? 'rotate(45deg)' : 'none', transition: 'transform 0.15s' }}><Icons.Plus /></button>
                  <button type="button" onClick={isRecording ? stopRecording : startRecording} style={{ padding: '10px', background: isRecording ? '#ef4444' : 'var(--bg-card)', border: 'none', borderRadius: '50%', color: isRecording ? '#fff' : 'var(--text-primary)', cursor: 'pointer', flexShrink: 0 }}>{isRecording ? <Icons.Stop/> : <Icons.Mic/>}</button>
                  <input style={{ flex: 1, minWidth: 0, padding: '12px', borderRadius: '20px', background: 'var(--bg-app)', color: 'var(--text-primary)', border: `1px solid ${theme.border}`, outline: 'none' }} value={newMessage} onChange={e => handleTyping(e.target.value)} placeholder="Сообщение..." />
                  <button type="submit" style={{ padding: '12px 18px', borderRadius: '20px', background: theme.gradient, border: 'none', cursor: 'pointer', flexShrink: 0 }}><Icons.Send /></button>
                </form>
              </div>
            )}
          </>
        ) : null}
      </div>

      {previewChat && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 6000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: '20px', width: '100%', maxWidth: '320px', border: `1px solid ${theme.border}`, textAlign: 'center' }}>
            <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: '#8b5cf6', margin: '0 auto 12px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>
              {previewChat.avatar_url ? <img src={previewChat.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="ch"/> : '📢'}
            </div>
            <h3 style={{ color: 'var(--text-primary)', margin: '0 0 4px' }}>{previewChat.name}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '0 0 8px' }}>{previewChat.description}</p>
            <p style={{ color: theme.primary, fontSize: '12px', marginBottom: '16px' }}>{previewChat.subscriberCount} подписчиков</p>
            <button onClick={subscribeToPreviewChannel} style={{ width: '100%', padding: '12px', background: theme.gradient, border: 'none', borderRadius: '10px', color: '#fff', fontWeight: 'bold', cursor: 'pointer', marginBottom: '8px' }}>Подписаться</button>
            <button onClick={() => setPreviewChat(null)} style={{ width: '100%', padding: '8px', background: 'transparent', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer' }}>Отмена</button>
          </div>
        </div>
      )}

      {showPollModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 6000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: 'var(--bg-surface)', padding: '20px', borderRadius: '20px', width: '100%', maxWidth: '320px', border: `1px solid ${theme.border}` }}>
            <h3 style={{ color: theme.primary, marginTop: 0 }}>📊 Новый опрос</h3>
            {!isAura && <div style={{ color: '#f87171', fontSize: '12px', marginBottom: '10px' }}>Опросы доступны только с Аура 💠</div>}
            <input value={pollQuestion} onChange={e => setPollQuestion(e.target.value)} placeholder="Вопрос" style={{ width: '100%', padding: '8px', marginBottom: '8px', background: 'var(--bg-app)', color: 'var(--text-primary)', border: `1px solid ${theme.border}`, borderRadius: '8px', boxSizing: 'border-box' }} />
            {pollOptions.map((opt, idx) => (
              <input key={idx} value={opt} onChange={e => setPollOptions(prev => prev.map((o, i) => i === idx ? e.target.value : o))} placeholder={`Вариант ${idx + 1}`} style={{ width: '100%', padding: '8px', marginBottom: '8px', background: 'var(--bg-app)', color: 'var(--text-primary)', border: `1px solid ${theme.border}`, borderRadius: '8px', boxSizing: 'border-box' }} />
            ))}
            {pollOptions.length < 6 && <button onClick={() => setPollOptions(prev => [...prev, ''])} style={{ width: '100%', padding: '6px', marginBottom: '10px', background: 'transparent', border: `1px dashed ${theme.border}`, color: theme.primary, borderRadius: '8px', cursor: 'pointer' }}>➕ Вариант</button>}
            <button onClick={createPoll} disabled={!isAura} style={{ width: '100%', padding: '10px', background: isAura ? theme.gradient : 'var(--bg-muted)', border: 'none', borderRadius: '8px', color: isAura ? '#fff' : 'var(--text-muted)', fontWeight: 'bold', cursor: isAura ? 'pointer' : 'not-allowed' }}>Создать</button>
            <button onClick={() => setShowPollModal(false)} style={{ width: '100%', padding: '8px', marginTop: '8px', background: 'transparent', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer' }}>Отмена</button>
          </div>
        </div>
      )}

      {openCommentsForMsg && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 6000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: 'var(--bg-surface)', borderRadius: '20px', border: `1px solid ${theme.border}`, width: '100%', maxWidth: '360px', height: '80vh', display: 'flex', flexDirection: 'column', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${theme.border}`, paddingBottom: '10px' }}>
              <h4 style={{ margin: 0, color: theme.primary }}>Комментарии</h4>
              <button onClick={() => setOpenCommentsForMsg(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}>✖</button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '10px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {commentsList.map(c => (
                <div key={c.id} onClick={() => c.profiles && openProfileOf(c.profiles)} style={{ background: 'var(--bg-card)', padding: '8px 12px', borderRadius: '10px', cursor: c.profiles ? 'pointer' : 'default' }}>
                  <div style={{ fontSize: '11px', color: theme.primary, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    @{c.profiles?.username}
                    {c.user_id === activeChatData?.owner_id && <span style={{ padding: '1px 6px', borderRadius: '10px', background: 'rgba(245,158,11,0.15)', color: '#f59e0b', fontSize: '10px' }}>Создатель</span>}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{c.content}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '8px', paddingTop: '10px', borderTop: `1px solid ${theme.border}` }}>
              <input style={{ flex: 1, padding: '8px 12px', borderRadius: '12px', background: 'var(--bg-app)', color: 'var(--text-primary)', border: `1px solid ${theme.border}`, outline: 'none' }} placeholder="Написать комментарий..." value={newCommentText} onChange={e => setNewCommentText(e.target.value)} />
              <button onClick={sendComment} style={{ padding: '8px 14px', background: theme.primary, border: 'none', borderRadius: '12px', color: '#000', fontWeight: 'bold', cursor: 'pointer' }}>➔</button>
            </div>
          </div>
        </div>
      )}

      {/* Админ-панель канала/группы — только для создателя: имя, юзернейм, аватар, публичность, подписчики */}
      {showAdminModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: 'var(--bg-surface)', padding: '20px', borderRadius: '20px', width: '320px', maxHeight: '85vh', overflowY: 'auto', border: `1px solid ${theme.border}` }}>
            <h3 style={{ color: theme.primary, marginTop: 0 }}>{isCreator ? 'Админ-панель' : 'О чате'}</h3>
            <div style={{ textAlign: 'center', marginBottom: '10px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', margin: '0 auto 8px', overflow: 'hidden', background: 'var(--bg-muted)' }}>
                {communityAvatar && <img src={communityAvatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="ch"/>}
              </div>
              {isCreator && <label style={{ color: theme.primary, fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}>📷 Изменить аватарку<input type="file" accept="image/*" onChange={(e) => handleMediaUpload(e, 'comm_avatar')} style={{ display: 'none' }} /></label>}
            </div>
            {isCreator ? (
              <>
                <input value={activeChatData?.name || ''} onChange={(e) => setActiveChatData({...activeChatData, name: e.target.value})} style={{ width: '100%', padding: '8px', marginBottom: '10px', background: 'var(--bg-app)', color: 'var(--text-primary)', border: `1px solid ${theme.border}`, borderRadius: '8px', boxSizing: 'border-box' }} placeholder="Название" />
                <input value={activeChatData?.description || ''} onChange={(e) => setActiveChatData({...activeChatData, description: e.target.value})} style={{ width: '100%', padding: '8px', marginBottom: '10px', background: 'var(--bg-app)', color: 'var(--text-primary)', border: `1px solid ${theme.border}`, borderRadius: '8px', boxSizing: 'border-box' }} placeholder="Описание" />
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: '#cbd5e1', fontSize: '13px' }}>
                  <input type="checkbox" checked={!!activeChatData?.is_public} onChange={(e) => setActiveChatData({...activeChatData, is_public: e.target.checked})} /> Публичный (виден в поиске)
                </label>
                <button onClick={updateCommunity} style={{ width: '100%', padding: '8px', background: theme.gradient, border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: 'bold', marginBottom: '12px' }}>Сохранить изменения</button>
                <input value={newMemberName} onChange={(e) => setNewMemberName(e.target.value)} placeholder="Username участника" style={{ width: '100%', padding: '8px', marginBottom: '10px', background: 'var(--bg-app)', color: 'var(--text-primary)', border: `1px solid ${theme.border}`, borderRadius: '8px', boxSizing: 'border-box' }} />
                <button onClick={addMemberToComm} style={{ width: '100%', padding: '8px', background: theme.primary, border: 'none', borderRadius: '8px', marginBottom: '14px', cursor: 'pointer', fontWeight: 'bold' }}>Добавить участника</button>
                <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '6px', fontWeight: 'bold' }}>Подписчики ({subscribersList.length})</div>
                <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
                  {subscribersList.map(s => (
                    <div key={s.user_id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0', borderBottom: '1px solid var(--border-hairline)' }}>
                      <span onClick={() => openProfileOf(s.profiles)} style={{ flex: 1, color: 'var(--text-primary)', fontSize: '13px', cursor: 'pointer' }}>@{s.profiles?.username}{s.user_id === activeChatData?.owner_id && ' 👑'}</span>
                      {s.user_id !== activeChatData?.owner_id && <button onClick={() => removeSubscriber(s.user_id)} style={{ background: 'transparent', border: '1px solid #f87171', color: '#f87171', borderRadius: '6px', fontSize: '11px', padding: '3px 8px', cursor: 'pointer' }}>Удалить</button>}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ color: '#cbd5e1', fontSize: '13px' }}>
                <p>{activeChatData?.description}</p>
                <p style={{ color: 'var(--text-secondary)' }}>{subscriberCount} подписчиков</p>
              </div>
            )}
            <button onClick={() => setShowAdminModal(false)} style={{ width: '100%', padding: '8px', marginTop: '10px', background: 'transparent', color: '#f87171', border: 'none', cursor: 'pointer' }}>Закрыть</button>
          </div>
        </div>
      )}

      {showCreateCommunityModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--bg-surface)', padding: '20px', borderRadius: '20px', width: '300px', border: `1px solid ${theme.border}` }}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <button onClick={() => setCommunityType('group')} style={{ flex: 1, padding: '8px', background: communityType==='group'?theme.primary:'var(--bg-card-solid)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>👥 Группа</button>
              <button onClick={() => setCommunityType('channel')} style={{ flex: 1, padding: '8px', background: communityType==='channel'?theme.primary:'var(--bg-card-solid)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>📢 Канал</button>
            </div>
            <input value={communityName} onChange={e => setCommunityName(e.target.value)} placeholder="Название..." style={{ width: '100%', padding: '8px', marginBottom: '10px', background: 'var(--bg-app)', color: 'var(--text-primary)', border: `1px solid ${theme.border}`, borderRadius: '8px', boxSizing: 'border-box' }} />
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '10px' }}>{isDeveloper ? 'Без лимита (вы владелец)' : `Лимит: ${isAura ? 3 : 1} на аккаунт${!isAura ? ' (Аура — до 3)' : ''}`}</div>
            <button onClick={createCommunity} style={{ width: '100%', padding: '10px', background: theme.gradient, color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Создать</button>
            <button onClick={() => setShowCreateCommunityModal(false)} style={{ width: '100%', padding: '8px', marginTop: '5px', background: 'transparent', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer' }}>Отмена</button>
          </div>
        </div>
      )}

      {selectedMsgForMenu && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 6000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--bg-surface)', padding: '15px', borderRadius: '20px', width: '270px', border: `1px solid ${theme.border}` }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
              {REACTION_EMOJIS.map(em => <span key={em} onClick={() => toggleReaction(selectedMsgForMenu.id, em)} style={{ fontSize: '20px', cursor: 'pointer' }}>{em}</span>)}
              {customEmojis.map(ce => <img key={ce.id} onClick={() => toggleReaction(selectedMsgForMenu.id, ce.image_url)} src={ce.image_url} alt={ce.name} style={{ width: '22px', height: '22px', cursor: 'pointer' }}/>)}
              <label style={{ cursor: 'pointer', color: theme.primary, fontSize: '18px' }}>➕<input type="file" accept="image/*" onChange={(e) => handleMediaUpload(e, 'emoji')} style={{ display: 'none' }}/></label>
            </div>
            {isCreator && <button onClick={() => pinMessage(selectedMsgForMenu.id)} style={{ width: '100%', padding: '10px', background: 'var(--bg-card)', color: 'var(--text-primary)', border: 'none', borderRadius: '8px', marginBottom: '5px', cursor: 'pointer' }}>📌 Закрепить</button>}
            <button onClick={() => { setReplyingMsg(selectedMsgForMenu); setSelectedMsgForMenu(null); }} style={{ width: '100%', padding: '10px', background: 'var(--bg-card)', color: 'var(--text-primary)', border: 'none', borderRadius: '8px', marginBottom: '5px', cursor: 'pointer' }}>💬 Ответить</button>
            {canDeleteMessage(selectedMsgForMenu) && (
              <button onClick={() => deleteMessage(selectedMsgForMenu.id)} style={{ width: '100%', padding: '10px', background: 'rgba(239,68,68,0.2)', color: '#f87171', border: '1px solid #f87171', borderRadius: '8px', marginBottom: '5px', cursor: 'pointer' }}>🗑️ Удалить</button>
            )}
            <button onClick={() => setSelectedMsgForMenu(null)} style={{ width: '100%', padding: '8px', background: 'transparent', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer' }}>Отмена</button>
          </div>
        </div>
      )}

      {activeStory && (
        <div style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 7000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <button onClick={() => setActiveStory(null)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', color: '#fff', fontSize: '24px', border: 'none', cursor: 'pointer' }}>✖</button>
          <img src={activeStory.media_url} style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: '10px' }} alt="st"/>
        </div>
      )}

      {/* Оверлей звонка */}
      {callState !== 'idle' && (
        <div style={{ position: 'fixed', inset: 0, background: callType === 'video' && callState === 'active' ? '#000' : 'rgba(3,7,18,0.97)', zIndex: 9000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', gap: '16px' }}>
          {callType === 'video' ? (
            <>
              <video ref={remoteVideoRef} autoPlay playsInline style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', background: '#111', display: callState === 'active' ? 'block' : 'none' }} />
              <video ref={localVideoRef} autoPlay playsInline muted style={{ position: 'absolute', bottom: '16px', right: '16px', width: '110px', height: '150px', borderRadius: '14px', objectFit: 'cover', border: `2px solid ${theme.primary}`, background: '#111', transform: 'scaleX(-1)', zIndex: 2 }} />
            </>
          ) : null}

          {(callType === 'audio' || callState !== 'active') && (
            <div style={{ width: '96px', height: '96px', borderRadius: '50%', overflow: 'hidden', background: theme.secondary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', boxShadow: `0 0 30px ${theme.glow}`, position: 'relative', zIndex: 1 }}>
              {callPeerInfo?.avatar_url ? <img src={callPeerInfo.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="peer"/> : '👤'}
            </div>
          )}
          <h2 style={{ margin: 0, position: 'relative', zIndex: 1, textShadow: '0 1px 6px rgba(0,0,0,0.8)' }}>{callPeerInfo?.full_name || callPeerInfo?.username || 'Абонент'}</h2>
          <div style={{ color: '#e2e8f0', position: 'relative', zIndex: 1, textShadow: '0 1px 6px rgba(0,0,0,0.8)' }}>
            {callState === 'outgoing' && `${callType === 'video' ? 'Видеовызов' : 'Вызов'}...`}
            {callState === 'incoming' && `Входящий ${callType === 'video' ? 'видеозвонок' : 'звонок'}...`}
            {callState === 'active' && formatDuration(callDuration)}
          </div>
          {(callState === 'outgoing' || callState === 'active') && connState !== 'connected' && (
            <div style={{ fontSize: '11px', color: '#fbbf24', position: 'relative', zIndex: 1, textShadow: '0 1px 6px rgba(0,0,0,0.8)' }}>
              {connState === 'connecting' || connState === 'new' ? '🔄 Устанавливаем соединение...' : connState === 'disconnected' ? '⚠️ Сеть шалит, пробуем восстановить...' : `Статус: ${connState}`}
            </div>
          )}
          <div style={{ display: 'flex', gap: '16px', marginTop: '20px', position: 'relative', zIndex: 1, flexWrap: 'wrap', justifyContent: 'center', padding: '0 16px' }}>
            {callState === 'incoming' ? (
              <>
                <button onClick={declineCall} style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#ef4444', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icons.PhoneEnd /></button>
                <button onClick={acceptCall} style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#22c55e', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{callType === 'video' ? <Icons.Video /> : <Icons.Phone />}</button>
              </>
            ) : (
              <>
                {callState === 'active' && (
                  <button onClick={toggleMute} style={{ width: '54px', height: '54px', borderRadius: '50%', background: isMuted ? theme.primary : 'rgba(255,255,255,0.2)', border: 'none', color: isMuted ? '#000' : '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{isMuted ? <Icons.MicOff /> : <Icons.Mic />}</button>
                )}
                {callState === 'active' && callType === 'video' && (
                  <button onClick={toggleCamera} style={{ width: '54px', height: '54px', borderRadius: '50%', background: isCamOff ? theme.primary : 'rgba(255,255,255,0.2)', border: 'none', color: isCamOff ? '#000' : '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{isCamOff ? <Icons.CameraOff /> : <Icons.Camera />}</button>
                )}
                {callState === 'active' && callType === 'video' && (
                  <button onClick={switchCamera} style={{ width: '54px', height: '54px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icons.SwitchCamera /></button>
                )}
                <button onClick={endCall} style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#ef4444', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icons.PhoneEnd /></button>
              </>
            )}
          </div>
          <audio ref={remoteAudioRef} autoPlay />
        </div>
      )}

      {showUserProfileModal && viewedProfile && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', zIndex: 8000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: 'var(--bg-surface)', padding: '20px', borderRadius: '20px', textAlign: 'center', color: 'var(--text-primary)', border: `1px solid ${theme.border}`, width: '100%', maxWidth: '300px' }}>
            <div style={{ width: '70px', height: '70px', borderRadius: '50%', margin: '0 auto 10px', overflow: 'hidden', background: 'var(--bg-muted)' }}>
              {viewedProfile.avatar_url && <img src={viewedProfile.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="av"/>}
            </div>
            <h2 style={{ margin: '0 0 4px' }}>{viewedProfile.full_name || viewedProfile.username} {viewedProfile.status_badge === '👑 Developer' && <Icons.Crown />} {viewedProfile.is_aura && <Icons.Aura />} {viewedProfile.emoji_status}</h2>
            <p style={{ color: theme.primary, margin: '0 0 6px' }}>@{viewedProfile.username}</p>
            {viewedProfile.custom_status && <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)', margin: '0 0 6px' }}>«{viewedProfile.custom_status}»</p>}
            {viewedProfile.id !== session.user.id && <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{viewedProfile.is_online ? 'в сети' : `был(а) в сети ${timeAgo(viewedProfile.last_seen)}`}</p>}
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              {viewedProfile.id !== session.user.id && (
                blockedIds.includes(viewedProfile.id)
                  ? <button onClick={() => unblockUser(viewedProfile.id)} style={{ flex: 1, padding: '8px', background: 'transparent', border: '1px solid #22c55e', color: '#22c55e', borderRadius: '8px', cursor: 'pointer' }}>Разблокировать</button>
                  : <button onClick={() => blockUser(viewedProfile.id)} style={{ flex: 1, padding: '8px', background: 'transparent', border: '1px solid #f87171', color: '#f87171', borderRadius: '8px', cursor: 'pointer' }}>Заблокировать</button>
              )}
              <button onClick={() => setShowUserProfileModal(false)} style={{ flex: 1, padding: '8px 20px', background: theme.primary, border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Закрыть</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
