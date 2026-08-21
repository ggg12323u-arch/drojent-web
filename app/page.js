'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const DEV_EMAIL = 'ggg12323u@gmail.com';
const NEON_EMOJIS = ['⚡', '💎', '🔥', '😭', '♥️', '😅'];

const THEMES = {
  blue: { primary: '#38bdf8', secondary: '#2563eb', border: 'rgba(56, 189, 248, 0.3)', bgCard: 'rgba(15, 23, 42, 0.8)' },
  green: { primary: '#22c55e', secondary: '#16a34a', border: 'rgba(34, 197, 94, 0.3)', bgCard: 'rgba(6, 78, 59, 0.8)' },
  purple: { primary: '#c084fc', secondary: '#9333ea', border: 'rgba(192, 132, 252, 0.3)', bgCard: 'rgba(88, 28, 135, 0.8)' }
};

const Icons = {
  Back: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>,
  Send: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  Camera: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  Mic: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>,
  Stop: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>,
  Trash: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  Crown: () => <span style={{ filter: 'drop-shadow(0 0 6px #f59e0b)' }}>👑</span>
};

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

  const [editFullName, setEditFullName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editCustomStatus, setEditCustomStatus] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [publicCommunityResults, setPublicCommunityResults] = useState([]);
  const [myChats, setMyChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [activeChatData, setActiveChatData] = useState(null);
  const [pinnedMsgData, setPinnedMsgData] = useState(null);
  const [subscribersCount, setSubscribersCount] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const [showUserProfileModal, setShowUserProfileModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showCreateCommunityModal, setShowCreateCommunityModal] = useState(false);
  const [communityType, setCommunityType] = useState('group');
  const [communityName, setCommunityName] = useState('');
  const [membersList, setCommentsList] = useState([]);

  const [stories, setStories] = useState([]);
  const [activeStory, setActiveStory] = useState(null);

  const [messages, setMessages] = useState([]);
  const [reactions, setReactions] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedMsgForMenu, setSelectedMsgForMenu] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async () => {
    if (!session) return;
    const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
    if (data) {
      setMyProfile(data);
      setEditFullName(data.full_name || '');
      setEditUsername(data.username || '');
      setEditCustomStatus(data.custom_status || '');
      setAvatarUrl(data.avatar_url || '');
    }
  };

  // Истории ТОЛЬКО от контактов (от людей, с кем есть личный диалог)
  const fetchContactStories = async () => {
    if (!session) return;
    const { data: myParts } = await supabase.from('chat_participants').select('chat_id').eq('user_id', session.user.id);
    if (!myParts) return;

    const chatIds = myParts.map(p => p.chat_id);
    const { data: otherParts } = await supabase.from('chat_participants').select('user_id').in('chat_id', chatIds).neq('user_id', session.user.id);
    const contactIds = otherParts?.map(p => p.user_id) || [];
    contactIds.push(session.user.id); // Свои истории тоже видны

    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data } = await supabase.from('stories').select('*, profiles(username, avatar_url)').in('user_id', contactIds).gte('created_at', yesterday).order('created_at', { ascending: false });
    if (data) setStories(data);
  };

  const fetchMyChats = async () => {
    if (!session) return;
    const { data: parts } = await supabase.from('chat_participants').select('chat_id, is_banned').eq('user_id', session.user.id).eq('is_banned', false);
    if (parts && parts.length > 0) {
      const chatIds = parts.map(p => p.chat_id);
      const { data: chatsData } = await supabase.from('chats').select('*').in('id', chatIds);
      const { data: allParts } = await supabase.from('chat_participants').select('chat_id, user_id, profiles(id, username, full_name, avatar_url, status_badge, custom_status)').in('chat_id', chatIds);
      
      if (chatsData) {
        const formatted = chatsData.map(c => {
          if (c.type === 'group' || c.type === 'channel') return { chat_id: c.id, isGroupOrChannel: true, chatDetails: c };
          const p = allParts?.filter(x => x.chat_id === c.id) || [];
          if (p.length === 1 && p[0].user_id === session.user.id) return { chat_id: c.id, profiles: { id: session.user.id, username: 'Избранное', avatar_url: myProfile?.avatar_url } };
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
      fetchContactStories();
      fetchMyChats();

      // Realtime оптимизация: обновляем список диалогов без обновления страницы!
      const globalChan = supabase.channel('global_updates')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'chats' }, fetchMyChats)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_participants' }, fetchMyChats)
        .subscribe();

      return () => { supabase.removeChannel(globalChan); };
    }
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
    if (!activeChat) { setMessages([]); setReactions([]); setActiveChatData(null); setPinnedMsgData(null); return; }
    
    const loadChat = async () => {
      const { data: chat } = await supabase.from('chats').select('*').eq('id', activeChat).single();
      if (chat) {
        setActiveChatData(chat);
        if (chat.pinned_message_id) {
          const { data: pin } = await supabase.from('messages').select('*').eq('id', chat.pinned_message_id).single();
          if (pin) setPinnedMsgData(pin);
        } else setPinnedMsgData(null);
      }

      // Счётчик подписчиков и статус подписки
      const { data: subs } = await supabase.from('chat_participants').select('user_id').eq('chat_id', activeChat);
      if (subs) {
        setSubscribersCount(subs.length);
        setIsSubscribed(subs.some(s => s.user_id === session.user.id));
      }

      const { data: msgs } = await supabase.from('messages').select('*').eq('chat_id', activeChat).order('created_at', { ascending: true });
      if (msgs) { 
        setMessages(msgs); 
        const { data: r } = await supabase.from('message_reactions').select('*').in('message_id', msgs.map(m => m.id));
        if (r) setReactions(r);
      }
      await supabase.from('messages').update({ is_read: true }).eq('chat_id', activeChat).neq('sender_id', session.user.id);
    };

    loadChat();

    const chan = supabase.channel(`chat_realtime_${activeChat}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `chat_id=eq.${activeChat}` }, loadChat)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chats', filter: `id=eq.${activeChat}` }, loadChat)
      .subscribe();

    return () => { supabase.removeChannel(chan); };
  }, [activeChat, session]);

  // Функция Подписки на Канал / Вступления
  const toggleSubscribe = async () => {
    if (isSubscribed) {
      await supabase.from('chat_participants').delete().eq('chat_id', activeChat).eq('user_id', session.user.id);
      setIsSubscribed(false);
      setSubscribersCount(prev => prev - 1);
    } else {
      await supabase.from('chat_participants').insert([{ chat_id: activeChat, user_id: session.user.id }]);
      setIsSubscribed(true);
      setSubscribersCount(prev => prev + 1);
    }
    fetchMyChats();
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    setIsTyping(true);
    setTimeout(() => setIsTyping(false), 2000);
  };

  const sendMessage = async (type = 'text', mediaUrl = '') => {
    if (activeChatData?.type === 'channel' && activeChatData.owner_id !== session.user.id) return;
    const txt = type === 'text' ? newMessage : mediaUrl;
    if (type === 'text' && !txt.trim()) return;

    if (type === 'text') setNewMessage('');
    await supabase.from('messages').insert([{ chat_id: activeChat, sender_id: session.user.id, content: txt, is_read: false }]);
  };

  const deleteMessage = async (msgId) => {
    const isOwner = activeChatData?.owner_id === session.user.id;
    const msg = messages.find(m => m.id === msgId);

    if (msg.sender_id === session.user.id || isOwner) {
      await supabase.from('messages').delete().eq('id', msgId);
      setMessages(prev => prev.filter(m => m.id !== msgId));
    } else {
      alert('Только администратор может удалять чужие сообщения!');
    }
    setSelectedMsgForMenu(null);
  };

  const pinMessage = async (msgId) => {
    await supabase.from('chats').update({ pinned_message_id: msgId }).eq('id', activeChat);
    setSelectedMsgForMenu(null);
  };

  const unpinMessage = async () => {
    await supabase.from('chats').update({ pinned_message_id: null }).eq('id', activeChat);
    setPinnedMsgData(null);
  };

  const handleMediaUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const name = `${type}_${Date.now()}.${file.name.split('.').pop()}`;
    const { error } = await supabase.storage.from('media').upload(name, file);
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(name);
      if (type === 'story') { await supabase.from('stories').insert([{ user_id: session.user.id, media_url: publicUrl }]); fetchContactStories(); }
      else if (type === 'avatar') { setAvatarUrl(publicUrl); }
      else sendMessage('image', `[IMAGE]:${publicUrl}`);
    } else alert('Ошибка отправки: ' + error.message);
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
        const { error } = await supabase.storage.from('media').upload(name, audioBlob);
        if (!error) {
          const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(name);
          sendMessage('voice', `[VOICE]:${publicUrl}`);
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
      if (error) alert('Ошибка: ' + error.message);
    }
    setLoading(false);
  };

  if (!session) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#030712', fontFamily: 'system-ui, sans-serif', padding: '16px' }}>
        <div style={{ width: '100%', maxWidth: '380px', padding: '32px 24px', background: theme.bgCard, backdropFilter: 'blur(16px)', borderRadius: '24px', border: `1px solid ${theme.border}`, color: '#f8fafc' }}>
          <h2 style={{ margin: '0 0 8px 0', textAlign: 'center', color: theme.primary }}>DroJent</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input style={{ padding: '12px', borderRadius: '12px', border: `1px solid ${theme.border}`, background: 'rgba(3, 7, 18, 0.6)', color: '#fff' }} placeholder="Username или Email" value={loginInput} onChange={e => setLoginInput(e.target.value)} />
            <input style={{ padding: '12px', borderRadius: '12px', border: `1px solid ${theme.border}`, background: 'rgba(3, 7, 18, 0.6)', color: '#fff' }} type="password" placeholder="Пароль" value={password} onChange={e => setPassword(e.target.value)} />
            <button disabled={loading} style={{ padding: '12px', borderRadius: '12px', border: 'none', background: theme.secondary, color: '#fff', fontWeight: 'bold' }} onClick={() => handleAuth('login')}>Войти</button>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '10px', paddingTop: '10px' }}>
              <input style={{ padding: '10px', borderRadius: '10px', background: 'rgba(3,7,18,0.6)', color: '#fff', width: '100%', marginBottom: '8px', border: `1px solid ${theme.border}` }} placeholder="Username" value={signupUsername} onChange={e => setSignupUsername(e.target.value)} />
              <input style={{ padding: '10px', borderRadius: '10px', background: 'rgba(3,7,18,0.6)', color: '#fff', width: '100%', marginBottom: '8px', border: `1px solid ${theme.border}` }} placeholder="Email" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} />
              <button disabled={loading} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: `1px solid ${theme.primary}`, background: 'transparent', color: theme.primary }} onClick={() => handleAuth('signup')}>Регистрация</button>
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
      <div style={{ width: activeChat ? '320px' : '100%', display: activeChat ? 'none' : 'flex', flexDirection: 'column', borderRight: `1px solid ${theme.border}`, background: 'rgba(11, 15, 25, 0.85)', backdropFilter: 'blur(12px)', height: '100%' }}>
        <div style={{ padding: '16px', borderBottom: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '20px', color: theme.primary }}>DroJent {isDeveloper && <Icons.Crown />}</h3>
          <button onClick={() => supabase.auth.signOut()} style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #f87171', background: 'transparent', color: '#f87171', fontSize: '12px' }}>Выйти</button>
        </div>

        {/* Стримы / Истории ТОЛЬКО от контактов */}
        <div style={{ padding: '10px 12px', borderBottom: `1px solid ${theme.border}`, display: 'flex', gap: '12px', overflowX: 'auto' }}>
          <label style={{ cursor: 'pointer', flexShrink: 0, textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: `2px dashed ${theme.primary}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.primary }}>➕</div>
            <input type="file" accept="image/*" onChange={(e) => handleMediaUpload(e, 'story')} style={{ display: 'none' }} />
          </label>
          {stories.map(st => (
            <div key={st.id} onClick={() => setActiveStory(st)} style={{ cursor: 'pointer', flexShrink: 0, textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: `2px solid ${theme.primary}`, overflow: 'hidden' }}>
                <img src={st.media_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="st"/>
              </div>
            </div>
          ))}
        </div>

        {/* Вкладки */}
        <div style={{ display: 'flex', borderBottom: `1px solid ${theme.border}`, background: 'rgba(7, 10, 18, 0.8)' }}>
          <button onClick={() => setActiveTab('chats')} style={{ flex: 1, padding: '12px', background: 'transparent', border: 'none', color: activeTab === 'chats' ? theme.primary : '#64748b', borderBottom: activeTab === 'chats' ? `2px solid ${theme.primary}` : 'none', fontWeight: 'bold' }}>Чаты</button>
          <button onClick={() => setActiveTab('profile')} style={{ flex: 1, padding: '12px', background: 'transparent', border: 'none', color: activeTab === 'profile' ? theme.primary : '#64748b', borderBottom: activeTab === 'profile' ? `2px solid ${theme.primary}` : 'none', fontWeight: 'bold' }}>Профиль</button>
        </div>

        {activeTab === 'profile' ? (
          <div style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: theme.secondary, margin: '0 auto 10px', overflow: 'hidden', border: `2px solid ${theme.primary}` }}>
                {avatarUrl ? <img src={avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="avatar"/> : 'U'}
              </div>
              <label style={{ color: theme.primary, fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}>Изменить аватар<input type="file" accept="image/*" onChange={(e) => handleMediaUpload(e, 'avatar')} style={{ display: 'none' }}/></label>
            </div>

            <div style={{ background: 'rgba(3, 7, 18, 0.6)', padding: '12px', borderRadius: '12px', border: `1px solid ${theme.border}` }}>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>Выбор Темы:</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setThemeKey('blue')} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: '#0284c7', color: '#fff', fontWeight: 'bold' }}>Синий</button>
                <button onClick={() => setThemeKey('green')} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: '#16a34a', color: '#fff', fontWeight: 'bold' }}>Зелёный</button>
                <button onClick={() => setThemeKey('purple')} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: '#9333ea', color: '#fff', fontWeight: 'bold' }}>Фиолетовый</button>
              </div>
            </div>

            <input style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(3,7,18,0.6)', color: '#fff', border: `1px solid ${theme.border}` }} placeholder="Имя" value={editFullName} onChange={e => setEditFullName(e.target.value)} />
            <input style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(3,7,18,0.6)', color: '#fff', border: `1px solid ${theme.border}` }} placeholder="Username" value={editUsername} onChange={e => setEditUsername(e.target.value)} />
            <button onClick={() => supabase.from('profiles').update({ full_name: editFullName, username: editUsername, avatar_url: avatarUrl }).eq('id', session.user.id)} style={{ width: '100%', padding: '12px', borderRadius: '10px', background: theme.primary, color: '#000', fontWeight: 'bold' }}>Сохранить</button>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <input style={{ margin: '10px', padding: '10px', background: '#030712', border: `1px solid ${theme.border}`, color: '#fff', borderRadius: '10px' }} placeholder="Поиск людей и каналов..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {(searchQuery ? [...publicCommunityResults, ...searchResults] : myChats).map((item, i) => {
                const c = item.isGroupOrChannel ? item.chatDetails : item;
                const u = item.profiles || (!item.isGroupOrChannel ? item : null);
                if (c?.type === 'group' || c?.type === 'channel') {
                  return (
                    <div key={i} onClick={() => { setActiveChat(c.id); }} style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: c.type==='channel' ? '#8b5cf6' : '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{c.type==='channel'?'📢':'👥'}</div>
                      <div>
                        <div style={{ color: '#fff' }}>{c.name} {c.is_verified && '✅'}</div>
                        <div style={{ color: '#94a3b8', fontSize: '11px' }}>{c.type==='channel'?'Канал':'Группа'}</div>
                      </div>
                    </div>
                  );
                }
                if (u) {
                  return (
                    <div key={i} onClick={() => { setActiveChat(u.id); setActiveUser(u); }} style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: theme.secondary, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         {u.avatar_url ? <img src={u.avatar_url} style={{width:'100%', height:'100%', objectFit:'cover'}} alt="av"/> : 'U'}
                      </div>
                      <div>
                        <div style={{ color: '#fff' }}>{u.full_name || u.username} {u.status_badge === '👑 Developer' && <Icons.Crown />}</div>
                        <div style={{ color: '#94a3b8', fontSize: '11px' }}>@{u.username}</div>
                      </div>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>
        )}
      </div>

      {/* CHAT AREA */}
      <div style={{ flex: 1, display: !activeChat ? 'none' : 'flex', flexDirection: 'column', background: '#030712' }}>
        {activeChat && (
          <>
            {/* Шапка чата */}
            <div style={{ padding: '12px 16px', background: 'rgba(11, 15, 25, 0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${theme.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button onClick={() => { setActiveChat(null); setActiveUser(null); }} style={{ background: 'transparent', border: 'none', color: theme.primary }}><Icons.Back /></button>
                <div>
                  <h3 style={{ margin: 0, color: theme.primary, display: 'flex', alignItems: 'center', gap: '5px' }}>
                    {activeChatData?.type === 'group' ? `👥 ${activeChatData.name}` : activeChatData?.type === 'channel' ? `📢 ${activeChatData.name}` : (activeUser?.id === session.user.id ? '🔖 Избранное' : activeUser?.full_name || activeUser?.username)}
                    {activeChatData?.is_verified && '✅'}
                  </h3>
                  {activeChatData?.type === 'channel' && <div style={{ fontSize: '11px', color: '#94a3b8' }}>{subscribersCount} подписчиков</div>}
                  {isTyping && <div style={{ fontSize: '10px', color: theme.primary }}>печатает...</div>}
                </div>
              </div>

              {/* Кнопка Подписаться для Каналов */}
              {activeChatData?.type === 'channel' && activeChatData.owner_id !== session.user.id && (
                <button onClick={toggleSubscribe} style={{ padding: '6px 14px', borderRadius: '12px', border: 'none', background: isSubscribed ? 'rgba(239,68,68,0.2)' : theme.primary, color: isSubscribed ? '#f87171' : '#000', fontWeight: 'bold' }}>
                  {isSubscribed ? 'Отписаться' : 'Подписаться'}
                </button>
              )}
            </div>

            {/* Закрепленное сообщение с кнопкой открепления */}
            {pinnedMsgData && (
              <div style={{ padding: '8px 16px', background: 'rgba(56, 189, 248, 0.1)', borderBottom: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: theme.primary }}>
                <div>📌 <b>Закреплено:</b> {pinnedMsgData.content}</div>
                {activeChatData?.owner_id === session.user.id && (
                  <button onClick={unpinMessage} style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer' }}>Открепить</button>
                )}
              </div>
            )}

            {/* Лента сообщений */}
            <div ref={messagesContainerRef} style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {messages.map(msg => {
                const isMe = msg.sender_id === session.user.id;
                const rcts = reactions.filter(r => r.message_id === msg.id);
                return (
                  <div key={msg.id} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                    <div onClick={() => setSelectedMsgForMenu(msg)} style={{ background: isMe ? theme.secondary : 'rgba(30, 41, 59, 0.75)', padding: '10px 14px', borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px', color: '#fff', cursor: 'pointer' }}>
                      {msg.content.startsWith('[IMAGE]:') ? <img src={msg.content.replace('[IMAGE]:','')} style={{maxWidth:'100%', borderRadius:'8px'}} alt="media"/> : msg.content.startsWith('[VOICE]:') ? <audio controls src={msg.content.replace('[VOICE]:','')} /> : msg.content}
                      
                      {/* Кастомный статус прочтения (Круг / Круг с точкой) */}
                      <div style={{ fontSize: '10px', textAlign: 'right', marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                        {isMe && (
                          <span style={{ fontSize: '12px' }}>
                            {msg.is_read ? '🔘' : '⚪'}
                          </span>
                        )}
                      </div>

                      {rcts.length > 0 && <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>{rcts.map(r => <span key={r.id}>{r.emoji}</span>)}</div>}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Ввод сообщения */}
            {activeChatData?.type === 'channel' && activeChatData.owner_id !== session.user.id ? (
              <div style={{ padding: '15px', textAlign: 'center', background: '#0b0f19', color: '#94a3b8' }}>Только владелец пишет в канал</div>
            ) : (
              <form onSubmit={e => { e.preventDefault(); sendMessage(); }} style={{ padding: '10px', background: '#0b0f19', display: 'flex', gap: '8px', alignItems: 'center', borderTop: `1px solid ${theme.border}` }}>
                <label style={{ cursor: 'pointer', padding: '10px', background: 'rgba(30, 41, 59, 0.8)', borderRadius: '50%', color: theme.primary }}><Icons.Camera /><input type="file" accept="image/*" onChange={(e) => handleMediaUpload(e, 'img')} style={{display:'none'}}/></label>
                <button type="button" onClick={isRecording ? stopRecording : startRecording} style={{ padding: '10px', background: isRecording ? '#ef4444' : 'rgba(30, 41, 59, 0.8)', border: 'none', borderRadius: '50%', color: theme.primary }}>{isRecording ? <Icons.Stop/> : <Icons.Mic/>}</button>
                <input style={{ flex: 1, padding: '12px', borderRadius: '20px', background: '#030712', color: '#fff', border: `1px solid ${theme.border}`, outline: 'none' }} value={newMessage} onChange={handleInputChange} placeholder="Сообщение..." />
                <button type="submit" style={{ padding: '12px 18px', borderRadius: '20px', background: theme.primary, border: 'none' }}><Icons.Send /></button>
              </form>
            )}
          </>
        )}
      </div>

      {/* Меню Неоновых Эмодзи и Управления */}
      {selectedMsgForMenu && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 6000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#0b0f19', padding: '15px', borderRadius: '20px', width: '260px', border: `1px solid ${theme.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              {NEON_EMOJIS.map(em => <span key={em} onClick={() => toggleReaction(selectedMsgForMenu.id, em)} style={{ fontSize: '20px', cursor: 'pointer' }}>{em}</span>)}
            </div>
            <button onClick={() => pinMessage(selectedMsgForMenu.id)} style={{ width: '100%', padding: '10px', background: 'rgba(30,41,59,0.8)', color: '#fff', border: 'none', borderRadius: '8px', marginBottom: '5px' }}>📌 Закрепить</button>
            <button onClick={() => deleteMessage(selectedMsgForMenu.id)} style={{ width: '100%', padding: '10px', background: 'rgba(239,68,68,0.2)', color: '#f87171', border: '1px solid #f87171', borderRadius: '8px', marginBottom: '5px' }}>🗑️ Удалить</button>
            <button onClick={() => setSelectedMsgForMenu(null)} style={{ width: '100%', padding: '8px', background: 'transparent', color: '#94a3b8', border: 'none' }}>Отмена</button>
          </div>
        </div>
      )}

      {/* Просмотр Истории */}
      {activeStory && (
        <div style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 7000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <button onClick={() => setActiveStory(null)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', color: '#fff', fontSize: '24px', border: 'none' }}>✖</button>
          <img src={activeStory.media_url} style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: '10px' }} alt="st"/>
        </div>
      )}
    </div>
  );
}
