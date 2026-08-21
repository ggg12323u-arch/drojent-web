'use client';
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const DEV_EMAIL = 'ggg12323u@gmail.com';
const REACTION_EMOJIS = ['🔥', '❤️', '👍', '😂', '😮', '😢'];

const Icons = {
  Back: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>,
  Send: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  Camera: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  Mic: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>,
  Stop: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>,
  Trash: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  Support: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
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
  const [activeUser, setActiveUser] = useState(null);
  
  const [showUserProfileModal, setShowUserProfileModal] = useState(false);
  const [showCreateCommunityModal, setShowCreateCommunityModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  
  const [communityType, setCommunityType] = useState('group');
  const [communityName, setCommunityName] = useState('');
  const [communityDesc, setCommunityDesc] = useState('');
  const [newMemberName, setNewMemberName] = useState('');

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

  const [editingMsg, setEditingMsg] = useState(null);
  const [replyingMsg, setReplyingMsg] = useState(null);
  const [forwardingMsg, setForwardingMsg] = useState(null);
  const [selectedMsgForMenu, setSelectedMsgForMenu] = useState(null);

  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const messagesContainerRef = useRef(null);

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

  useEffect(() => {
    loadProfile();
    if(session) { fetchStories(); fetchSupportTickets(); fetchMyChats(); }
  }, [session]);

  const fetchStories = async () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data } = await supabase.from('stories').select('*, profiles(username, avatar_url)').gte('created_at', yesterday).order('created_at', { ascending: false });
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

  const fetchMyChats = async () => {
    if (!session) return;
    const { data: parts } = await supabase.from('chat_participants').select('chat_id').eq('user_id', session.user.id);
    if (parts && parts.length > 0) {
      const chatIds = parts.map(p => p.chat_id);
      const { data: chatsData } = await supabase.from('chats').select('*').in('id', chatIds);
      const { data: allParts } = await supabase.from('chat_participants').select('chat_id, user_id, profiles(id, username, full_name, avatar_url, status_badge, custom_status)').in('chat_id', chatIds);
      
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
    if (!activeChat) { setMessages([]); setReactions([]); setActiveChatData(null); return; }
    const loadChat = async () => {
      const { data: chat } = await supabase.from('chats').select('*').eq('id', activeChat).single();
      if (chat) setActiveChatData(chat);
      const { data: msgs } = await supabase.from('messages').select('*').eq('chat_id', activeChat).order('created_at', { ascending: true });
      if (msgs) { 
        setMessages(msgs); 
        setTimeout(scrollToBottom, 150); 
        const { data: r } = await supabase.from('message_reactions').select('*').in('message_id', msgs.map(m => m.id));
        if (r) setReactions(r);
      }
      await supabase.from('messages').update({ is_read: true }).eq('chat_id', activeChat).neq('sender_id', session.user.id);
    };
    loadChat();
    const chan = supabase.channel(`chat_${activeChat}`).on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `chat_id=eq.${activeChat}` }, loadChat).on('postgres_changes', { event: '*', schema: 'public', table: 'message_reactions' }, loadChat).subscribe();
    return () => { supabase.removeChannel(chan); };
  }, [activeChat, session]);

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
    await supabase.from('chats').update({ name: activeChatData.name, description: activeChatData.description }).eq('id', activeChat);
    alert('Сохранено'); setShowAdminModal(false); fetchMyChats();
  };

  const addMemberToComm = async () => {
    const { data: u } = await supabase.from('profiles').select('id').eq('username', newMemberName).single();
    if (!u) { alert('Пользователь не найден'); return; }
    await supabase.from('chat_participants').insert({ chat_id: activeChat, user_id: u.id });
    setNewMemberName(''); alert('Добавлен!');
  };

  const joinCommunity = async (comm) => {
    const { data: ex } = await supabase.from('chat_participants').select('id').eq('chat_id', comm.id).eq('user_id', session.user.id);
    if (!ex || ex.length === 0) await supabase.from('chat_participants').insert([{ chat_id: comm.id, user_id: session.user.id }]);
    setActiveChat(comm.id); setActiveUser(null); setSearchQuery(''); fetchMyChats();
  };

  const startChatWithUser = async (targetUser) => {
    setIsSupportMode(false); setActiveUser(targetUser); setSearchQuery('');
    const isSaved = targetUser.id === session.user.id;
    const { data: myP } = await supabase.from('chat_participants').select('chat_id').eq('user_id', session.user.id);
    const myChatIds = myP?.map(c => c.chat_id) || [];

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
    const name = `${type}_${Date.now()}.${file.name.split('.').pop()}`;
    const { error } = await supabase.storage.from('media').upload(name, file);
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(name);
      if(type === 'story') { await supabase.from('stories').insert([{ user_id: session.user.id, media_url: publicUrl }]); fetchStories(); }
      else if(type === 'avatar') setAvatarUrl(publicUrl);
      else sendMessage('image', `[IMAGE]:${publicUrl}`);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = e => { if(e.data.size > 0) audioChunksRef.current.push(e.data); };
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
        <div style={{ width: '100%', maxWidth: '380px', padding: '32px 24px', background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(16px)', borderRadius: '24px', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#f8fafc' }}>
          <h2 style={{ margin: '0 0 8px 0', textAlign: 'center', color: '#38bdf8' }}>DroJent</h2>
          <p style={{ margin: '0 0 24px 0', color: '#94a3b8', fontSize: '13px', textAlign: 'center' }}>Вход</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input style={{ padding: '12px', borderRadius: '12px', border: '1px solid rgba(56, 189, 248, 0.2)', background: 'rgba(3, 7, 18, 0.6)', color: '#fff' }} placeholder="Username или Email" value={loginInput} onChange={e => setLoginInput(e.target.value)} />
            <input style={{ padding: '12px', borderRadius: '12px', border: '1px solid rgba(56, 189, 248, 0.2)', background: 'rgba(3, 7, 18, 0.6)', color: '#fff' }} type="password" placeholder="Пароль" value={password} onChange={e => setPassword(e.target.value)} />
            <button disabled={loading} style={{ padding: '12px', borderRadius: '12px', border: 'none', background: '#2563eb', color: '#fff', fontWeight: 'bold' }} onClick={() => handleAuth('login')}>Войти</button>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '10px', paddingTop: '10px' }}>
              <input style={{ padding: '10px', borderRadius: '10px', background: 'rgba(3,7,18,0.6)', color: '#fff', width: '100%', marginBottom: '8px' }} placeholder="Придумайте Username" value={signupUsername} onChange={e => setSignupUsername(e.target.value)} />
              <input style={{ padding: '10px', borderRadius: '10px', background: 'rgba(3,7,18,0.6)', color: '#fff', width: '100%', marginBottom: '8px' }} placeholder="Email" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} />
              <button disabled={loading} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #38bdf8', background: 'transparent', color: '#38bdf8' }} onClick={() => handleAuth('signup')}>Регистрация</button>
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
      <div style={{ width: (activeChat || isSupportMode) ? '320px' : '100%', display: (activeChat || isSupportMode) ? 'none' : 'flex', flexDirection: 'column', borderRight: '1px solid rgba(56, 189, 248, 0.15)', background: 'rgba(11, 15, 25, 0.85)', backdropFilter: 'blur(12px)', height: '100%' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid rgba(56, 189, 248, 0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '20px', color: '#38bdf8' }}>DroJent {isDeveloper && <Icons.Crown />}</h3>
          <button onClick={() => supabase.auth.signOut()} style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #f87171', background: 'transparent', color: '#f87171', fontSize: '12px' }}>Выйти</button>
        </div>

        {/* Stories */}
        <div style={{ padding: '10px 12px', borderBottom: '1px solid rgba(56, 189, 248, 0.1)', display: 'flex', gap: '12px', overflowX: 'auto' }}>
          <label style={{ cursor: 'pointer', flexShrink: 0, textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '2px dashed #38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>➕</div>
            <input type="file" accept="image/*" onChange={(e)=>handleMediaUpload(e, 'story')} style={{ display: 'none' }} />
          </label>
          {stories.map(st => (
            <div key={st.id} onClick={() => setActiveStory(st)} style={{ cursor: 'pointer', flexShrink: 0, textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '2px solid #38bdf8', overflow: 'hidden' }}>
                <img src={st.media_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="st"/>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(56, 189, 248, 0.15)', background: 'rgba(7, 10, 18, 0.8)' }}>
          <button onClick={() => { setActiveTab('chats'); setIsSupportMode(false); }} style={{ flex: 1, padding: '12px', background: 'transparent', border: 'none', color: activeTab === 'chats' ? '#38bdf8' : '#64748b', borderBottom: activeTab === 'chats' ? '2px solid #38bdf8' : 'none' }}>Чаты</button>
          <button onClick={() => { setActiveTab('profile'); setIsSupportMode(false); }} style={{ flex: 1, padding: '12px', background: 'transparent', border: 'none', color: activeTab === 'profile' ? '#38bdf8' : '#64748b', borderBottom: activeTab === 'profile' ? '2px solid #38bdf8' : 'none' }}>Профиль</button>
          {isDeveloper && <button onClick={() => { setActiveTab('tickets'); setIsSupportMode(false); }} style={{ flex: 1, padding: '12px', background: 'transparent', border: 'none', color: activeTab === 'tickets' ? '#38bdf8' : '#64748b', borderBottom: activeTab === 'tickets' ? '2px solid #38bdf8' : 'none' }}>Тикеты</button>}
        </div>

        {activeTab === 'profile' ? (
          <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
            <div style={{ textAlign: 'center', marginBottom: '15px' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#2563eb', margin: '0 auto 10px', overflow: 'hidden' }}>
                {avatarUrl ? <img src={avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : 'U'}
              </div>
              <label style={{ color: '#38bdf8', fontSize: '12px', cursor: 'pointer' }}>Изменить аватар<input type="file" accept="image/*" onChange={(e)=>handleMediaUpload(e,'avatar')} style={{ display: 'none' }}/></label>
            </div>
            <input style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(3,7,18,0.6)', color: '#fff', marginBottom: '10px', border: '1px solid #1e293b' }} placeholder="Имя (Full Name)" value={editFullName} onChange={e => setEditFullName(e.target.value)} />
            <input style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(3,7,18,0.6)', color: '#fff', marginBottom: '10px', border: '1px solid #1e293b' }} placeholder="Username" value={editUsername} onChange={e => setEditUsername(e.target.value)} />
            <input style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(3,7,18,0.6)', color: '#fff', marginBottom: '10px', border: '1px solid #1e293b' }} placeholder="Статус" value={editCustomStatus} onChange={e => setEditCustomStatus(e.target.value)} />
            <button onClick={saveProfile} style={{ width: '100%', padding: '12px', borderRadius: '10px', background: '#38bdf8', color: '#000', fontWeight: 'bold' }}>Сохранить</button>
          </div>
        ) : activeTab === 'tickets' ? (
          <div style={{ padding: '16px', overflowY: 'auto', flex: 1 }}>
            {tickets.map(t => (
              <div key={t.id} style={{ padding: '12px', background: 'rgba(30,41,59,0.6)', borderRadius: '10px', marginBottom: '10px' }}>
                <div style={{ color: '#38bdf8', fontSize: '12px' }}>@{t.profiles?.username}</div>
                <div style={{ color: '#fff', fontSize: '14px', margin: '5px 0' }}>{t.message}</div>
                {!t.reply && (
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <input style={{ flex: 1, padding: '5px', background: '#000', color: '#fff', border: 'none' }} value={replyTicketText[t.id] || ''} onChange={e => setReplyTicketText({...replyTicketText, [t.id]: e.target.value})} />
                    <button onClick={() => { replyToTicket(t.id); }}>Ответить</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <button onClick={() => setShowCreateCommunityModal(true)} style={{ margin: '10px', padding: '10px', border: '1px solid #38bdf8', background: 'rgba(56,189,248,0.1)', color: '#38bdf8', borderRadius: '10px' }}>➕ Создать Группу/Канал</button>
            <input style={{ margin: '0 10px 10px', padding: '10px', background: '#030712', border: '1px solid #1e293b', color: '#fff', borderRadius: '10px' }} placeholder="Поиск..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {(searchQuery ? [...publicCommunityResults, ...searchResults] : myChats).map((item, i) => {
                const c = item.isGroupOrChannel ? item.chatDetails : item;
                const u = item.profiles || (!item.isGroupOrChannel ? item : null);
                if (c?.type === 'group' || c?.type === 'channel') {
                  return (
                    <div key={i} onClick={() => { setActiveChat(c.id); setIsSupportMode(false); }} style={{ padding: '12px 16px', borderBottom: '1px solid #1e293b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
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
                    <div key={i} onClick={() => startChatWithUser(u)} style={{ padding: '12px 16px', borderBottom: '1px solid #1e293b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: u.id === session.user.id ? '#38bdf8' : '#2563eb', overflow: 'hidden' }}>
                         {u.avatar_url ? <img src={u.avatar_url} style={{width:'100%', height:'100%', objectFit:'cover'}}/> : 'U'}
                      </div>
                      <div>
                        <div style={{ color: '#fff', display: 'flex', gap: '5px' }}>
                          {u.full_name || u.username} {u.status_badge === '👑 Developer' && <Icons.Crown />}
                        </div>
                        <div style={{ color: '#94a3b8', fontSize: '11px' }}>@{u.username}</div>
                      </div>
                    </div>
                  );
                }
              })}
            </div>
            {!isDeveloper && (
              <div onClick={() => { setIsSupportMode(true); setActiveChat(null); }} style={{ padding: '15px', background: 'rgba(56,189,248,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', color: '#38bdf8', fontWeight: 'bold' }}>
                <Icons.Support /> Служба поддержки
              </div>
            )}
          </div>
        )}
      </div>

      {/* MAIN CHAT AREA */}
      <div style={{ flex: 1, display: (!activeChat && !isSupportMode) ? 'none' : 'flex', flexDirection: 'column', background: '#030712' }}>
        {isSupportMode ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '12px 16px', background: '#0b0f19', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid #1e293b' }}>
              <button onClick={() => setIsSupportMode(false)} style={{ background: 'transparent', border: 'none' }}><Icons.Back /></button>
              <h3 style={{ margin: 0, color: '#38bdf8' }}>Служба поддержки</h3>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {mySupportMessages.map(t => (
                <div key={t.id} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <div style={{ alignSelf: 'flex-end', background: '#2563eb', padding: '10px', borderRadius: '10px' }}>{t.message}</div>
                  {t.reply && <div style={{ alignSelf: 'flex-start', background: 'rgba(56,189,248,0.2)', padding: '10px', borderRadius: '10px', color: '#38bdf8' }}>Ответ: {t.reply}</div>}
                </div>
              ))}
            </div>
            <div style={{ padding: '10px', display: 'flex', gap: '10px', borderTop: '1px solid #1e293b' }}>
              <input style={{ flex: 1, padding: '10px', borderRadius: '20px', background: '#1e293b', color: '#fff', border: 'none' }} value={newSupportMsg} onChange={e => setNewSupportMsg(e.target.value)} placeholder="Вопрос..." />
              <button onClick={() => { if(newSupportMsg) { supabase.from('support_tickets').insert({ user_id: session.user.id, message: newSupportMsg }); setNewSupportMsg(''); } }} style={{ padding: '10px 15px', borderRadius: '20px', background: '#38bdf8', border: 'none' }}><Icons.Send /></button>
            </div>
          </div>
        ) : activeChat ? (
          <>
            <div style={{ padding: '12px 16px', background: '#0b0f19', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button onClick={() => { setActiveChat(null); setActiveUser(null); }} style={{ background: 'transparent', border: 'none' }}><Icons.Back /></button>
                <h3 onClick={() => { if(activeChatData?.owner_id === session.user.id) setShowAdminModal(true); else if(activeUser) setShowUserProfileModal(true); }} style={{ margin: 0, color: '#38bdf8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  {activeChatData?.type === 'group' ? `👥 ${activeChatData.name}` : activeChatData?.type === 'channel' ? `📢 ${activeChatData.name}` : (activeUser?.id === session.user.id ? '🔖 Избранное' : activeUser?.full_name || activeUser?.username)}
                  {activeChatData?.is_verified && '✅'}
                  {activeUser?.status_badge === '👑 Developer' && <Icons.Crown />}
                </h3>
              </div>
              <button onClick={deleteChat} style={{ background: 'transparent', border: 'none' }}><Icons.Trash /></button>
            </div>

            <div ref={messagesContainerRef} style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {messages.map(msg => {
                const isMe = msg.sender_id === session.user.id;
                const rcts = reactions.filter(r => r.message_id === msg.id);
                return (
                  <div key={msg.id} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                    <div onClick={() => setSelectedMsgForMenu(msg)} style={{ background: isMe ? '#2563eb' : '#1e293b', padding: '10px 14px', borderRadius: '15px', color: '#fff', cursor: 'pointer' }}>
                      {msg.content.startsWith('[IMAGE]:') ? <img src={msg.content.replace('[IMAGE]:','')} style={{maxWidth:'100%', borderRadius:'8px'}} /> : msg.content.startsWith('[VOICE]:') ? <audio controls src={msg.content.replace('[VOICE]:','')} /> : msg.content}
                      {rcts.length > 0 && <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>{rcts.map(r => <span key={r.id}>{r.emoji}</span>)}</div>}
                    </div>
                  </div>
                );
              })}
            </div>

            {activeChatData?.type === 'channel' && activeChatData.owner_id !== session.user.id ? (
              <div style={{ padding: '15px', textAlign: 'center', background: '#0b0f19', color: '#94a3b8' }}>Только владелец пишет в канал</div>
            ) : (
              <form onSubmit={e => { e.preventDefault(); sendMessage(); }} style={{ padding: '10px', background: '#0b0f19', display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
                <label style={{ cursor: 'pointer', padding: '10px', background: '#1e293b', borderRadius: '50%' }}><Icons.Camera /><input type="file" accept="image/*" onChange={(e)=>handleMediaUpload(e,'img')} style={{display:'none'}}/></label>
                <button type="button" onClick={isRecording ? stopRecording : startRecording} style={{ padding: '10px', background: isRecording ? '#ef4444' : '#1e293b', border: 'none', borderRadius: '50%' }}>{isRecording ? <Icons.Stop/> : <Icons.Mic/>}</button>
                <input style={{ flex: 1, padding: '12px', borderRadius: '20px', background: '#030712', color: '#fff', border: '1px solid #1e293b', outline: 'none' }} value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Сообщение..." />
                <button type="submit" style={{ padding: '12px 15px', borderRadius: '20px', background: '#38bdf8', border: 'none' }}><Icons.Send /></button>
              </form>
            )}
          </>
        ) : null}
      </div>

      {/* MODALS */}
      {showAdminModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#0b0f19', padding: '20px', borderRadius: '15px', width: '300px', border: '1px solid #38bdf8' }}>
            <h3 style={{ color: '#fff', marginTop: 0 }}>Управление</h3>
            <input value={activeChatData.name} onChange={(e) => setActiveChatData({...activeChatData, name: e.target.value})} style={{ width: '100%', padding: '8px', marginBottom: '10px', background: '#030712', color: '#fff' }} placeholder="Название" />
            <input value={activeChatData.description || ''} onChange={(e) => setActiveChatData({...activeChatData, description: e.target.value})} style={{ width: '100%', padding: '8px', marginBottom: '10px', background: '#030712', color: '#fff' }} placeholder="Описание" />
            <input value={newMemberName} onChange={(e) => setNewMemberName(e.target.value)} placeholder="Username для добавления" style={{ width: '100%', padding: '8px', marginBottom: '10px', background: '#030712', color: '#fff' }} />
            <button onClick={addMemberToComm} style={{ width: '100%', padding: '8px', background: '#38bdf8', border: 'none', borderRadius: '5px', marginBottom: '10px' }}>Добавить участника</button>
            <button onClick={updateCommunity} style={{ width: '100%', padding: '8px', background: '#2563eb', border: 'none', borderRadius: '5px', color: '#fff' }}>Сохранить изменения</button>
            <button onClick={() => setShowAdminModal(false)} style={{ width: '100%', padding: '8px', marginTop: '10px', background: 'transparent', color: '#f87171', border: 'none' }}>Закрыть</button>
          </div>
        </div>
      )}

      {showCreateCommunityModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#0b0f19', padding: '20px', borderRadius: '15px', width: '300px', border: '1px solid #38bdf8' }}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <button onClick={()=>setCommunityType('group')} style={{ flex: 1, padding: '5px', background: communityType==='group'?'#38bdf8':'#1e293b' }}>Группа</button>
              <button onClick={()=>setCommunityType('channel')} style={{ flex: 1, padding: '5px', background: communityType==='channel'?'#38bdf8':'#1e293b' }}>Канал</button>
            </div>
            <input value={communityName} onChange={e=>setCommunityName(e.target.value)} placeholder="Название" style={{ width:'100%', padding:'8px', marginBottom:'10px', background:'#030712', color:'#fff' }} />
            <button onClick={createCommunity} style={{ width:'100%', padding:'8px', background:'#38bdf8' }}>Создать</button>
            <button onClick={()=>setShowCreateCommunityModal(false)} style={{ width:'100%', padding:'8px', marginTop:'5px', background:'transparent', color:'#fff' }}>Отмена</button>
          </div>
        </div>
      )}

      {selectedMsgForMenu && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 6000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#0b0f19', padding: '15px', borderRadius: '15px', width: '250px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              {REACTION_EMOJIS.map(em => <span key={em} onClick={()=>toggleReaction(selectedMsgForMenu.id, em)} style={{fontSize:'20px', cursor:'pointer'}}>{em}</span>)}
            </div>
            <button onClick={() => { setReplyingMsg(selectedMsgForMenu); setSelectedMsgForMenu(null); }} style={{ width:'100%', padding:'10px', background:'#1e293b', color:'#fff', border:'none', marginBottom:'5px' }}>Ответить</button>
            <button onClick={() => deleteMessage(selectedMsgForMenu.id)} style={{ width:'100%', padding:'10px', background:'rgba(239,68,68,0.2)', color:'#f87171', border:'none', marginBottom:'5px' }}>Удалить</button>
            <button onClick={() => setSelectedMsgForMenu(null)} style={{ width:'100%', padding:'10px', background:'transparent', color:'#fff', border:'none' }}>Отмена</button>
          </div>
        </div>
      )}

      {activeStory && (
        <div style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 7000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <button onClick={() => setActiveStory(null)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', color: '#fff', fontSize: '24px', border: 'none' }}>✖</button>
          <img src={activeStory.media_url} style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: '10px' }} />
        </div>
      )}

      {showUserProfileModal && activeUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#0b0f19', padding: '20px', borderRadius: '15px', textAlign: 'center', color: '#fff' }}>
            <h2>{activeUser.full_name || activeUser.username} {activeUser.status_badge === '👑 Developer' && <Icons.Crown />}</h2>
            <p>@{activeUser.username}</p>
            <p>{activeUser.custom_status}</p>
            <button onClick={() => setShowUserProfileModal(false)} style={{ padding: '8px 20px', background: '#38bdf8', border: 'none', borderRadius: '5px' }}>Закрыть</button>
          </div>
        </div>
      )}
    </div>
  );
}
