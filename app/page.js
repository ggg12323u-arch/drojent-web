'use client';
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const DEV_EMAIL = 'ggg12323u@gmail.com';
const REACTION_EMOJIS = ['🔥', '❤️', '👍', '😂', '😮', '😢'];

const Icons = {
  Back: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>,
  Send: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  Camera: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  Mic: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>,
  Stop: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>,
  Trash: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  Support: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  Pin: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14l-1.5-6H6.5L5 17z"/><path d="M9 11V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v7"/></svg>,
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
  const [pinnedMsgData, setPinnedMsgData] = useState(null);
  const [activeUser, setActiveUser] = useState(null);

  const [showUserProfileModal, setShowUserProfileModal] = useState(false);
  const [showCreateCommunityModal, setShowCreateCommunityModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [communityType, setCommunityType] = useState('group');
  const [communityName, setCommunityName] = useState('');
  const [communityDesc, setCommunityDesc] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [participants, setParticipants] = useState([]);

  const [tickets, setTickets] = useState([]);
  const [mySupportMessages, setMySupportMessages] = useState('');
  const [isSupportMode, setIsSupportMode] = useState(false);
  const [replyTicketText, setReplyTicketText] = useState({});

  const [stories, setStories] = useState([]);
  const [activeStory, setActiveStory] = useState(null);
  const [messages, setMessages] = useState([]);
  const [reactions, setReactions] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [typing, setTyping] = useState(null);
  const [loading, setLoading] = useState(false);

  const [editingMsg, setEditingMsg] = useState(null);
  const [replyingMsg, setReplyingMsg] = useState(null);
  const [selectedMsgForMenu, setSelectedMsgForMenu] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTo(0, messagesContainerRef.current.scrollHeight);
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

  // Сториз только для контактов (у кого есть общие чаты)
  const fetchContactStories = async () => {
    if (!session) return;
    const { data: chats } = await supabase.from('chat_participants').select('chat_id').eq('user_id', session.user.id);
    const chatIds = chats?.map(c => c.chat_id) || [];
    const { data: parts } = await supabase.from('chat_participants').select('user_id').in('chat_id', chatIds);
    const contactIds = [...new Set(parts?.map(p => p.user_id) || [])];
    const yesterday = new Date(Date.now() - 86400000).toISOString();
    const { data } = await supabase.from('stories').select('*, profiles(username, avatar_url)').in('user_id', contactIds).gte('created_at', yesterday).order('created_at', { ascending: false });
    if (data) setStories(data);
  };

  const fetchMyChats = async () => {
    if (!session) return;
    const { data: parts } = await supabase.from('chat_participants').select('chat_id').eq('user_id', session.user.id).eq('is_banned', false);
    if (parts && parts.length > 0) {
      const chatIds = parts.map(p => p.chat_id);
      const { data: chatsData } = await supabase.from('chats').select('*').in('id', chatIds);
      setMyChats(chatsData || []);
    }
  };

  useEffect(() => {
    loadProfile();
    if (session) {
      fetchContactStories();
      fetchMyChats();
    }
  }, [session]);

  // Realtime чата с индикацией прочтения и печати
  useEffect(() => {
    if (!activeChat) return;

    const loadChatData = async () => {
      const { data: chat } = await supabase.from('chats').select('*').eq('id', activeChat).single();
      setActiveChatData(chat);
      const { data: msgs } = await supabase.from('messages').select('*').eq('chat_id', activeChat).order('created_at', { ascending: true });
      setMessages(msgs || []);
      const { data: parts } = await supabase.from('chat_participants').select('*, profiles(*)').eq('chat_id', activeChat);
      setParticipants(parts || []);
      setTimeout(scrollToBottom, 150);
    };

    loadChatData();

    const chan = supabase.channel(`chat_${activeChat}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `chat_id=eq.${activeChat}` }, loadChatData)
      .on('broadcast', { event: 'typing' }, (p) => { setTyping(p.payload.user); setTimeout(() => setTyping(null), 2000); })
      .subscribe();

    return () => supabase.removeChannel(chan);
  }, [activeChat]);

  const sendMessage = async (type = 'text', content = '') => {
    const finalContent = content || newMessage;
    if (!finalContent.trim() && type === 'text') return;
    if (type === 'text') setNewMessage('');
    await supabase.from('messages').insert({ chat_id: activeChat, sender_id: session.user.id, content: finalContent, is_read: false });
    supabase.channel(`chat_${activeChat}`).send({ type: 'broadcast', event: 'typing', payload: { user: myProfile?.username } });
  };

  const handleMediaUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const name = `${type}_${Date.now()}.${file.name.split('.').pop()}`;
    const { error } = await supabase.storage.from('media').upload(name, file);
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(name);
      if (type === 'story') { await supabase.from('stories').insert({ user_id: session.user.id, media_url: publicUrl }); fetchContactStories(); }
      else sendMessage('image', `[IMAGE]:${publicUrl}`);
    }
  };

  const kickUser = async (userId) => {
    if (activeChatData?.owner_id !== session.user.id) return alert('Вы не админ!');
    await supabase.from('chat_participants').delete().eq('chat_id', activeChat).eq('user_id', userId);
    setParticipants(participants.filter(p => p.user_id !== userId));
  };

  const handleAuth = async (type) => {
    setLoading(true);
    if (type === 'signup') {
      const { error } = await supabase.auth.signUp({ email: signupEmail, password, options: { data: { username: signupUsername } } });
      if (error) alert(error.message); else alert('Успешно!');
    } else {
      let email = loginInput;
      if (!email.includes('@')) {
        const { data: p } = await supabase.from('profiles').select('id').eq('username', email).single();
        if (p) { const { data: em } = await supabase.rpc('get_email_by_id', { user_id: p.id }); if(em) email = em; }
      }
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert(error.message);
    }
    setLoading(false);
  };

  if (!session) return ( /* Твой дизайн входа */ <div/> );

  return (
    <div style={{ height: '100vh', display: 'flex', background: THEME.bg, color: '#fff', overflow: 'hidden' }}>
      {/* SIDEBAR */}
      <div style={{ width: activeChat ? '0px' : '100%', display: activeChat ? 'none' : 'flex', flexDirection: 'column', borderRight: `1px solid ${THEME.border}` }}>
         <div style={{ padding: '15px', borderBottom: `1px solid ${THEME.border}` }}><h3>Чаты</h3></div>
         <div style={{ flex: 1, overflowY: 'auto' }}>
            {myChats.map(c => (
                <div key={c.id} onClick={() => setActiveChat(c.id)} style={{ padding: '15px', borderBottom: `1px solid ${THEME.border}`, cursor: 'pointer' }}>
                    {c.name}
                </div>
            ))}
         </div>
      </div>

      {/* CHAT */}
      {activeChat && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${THEME.border}` }}>
              <button onClick={() => setActiveChat(null)}>←</button>
              <h3>{activeChatData?.name} {typing && <small style={{color:THEME.primary}}>печатает...</small>}</h3>
              {activeChatData?.owner_id === session.user.id && <button onClick={() => setShowAdmin(true)}>⚙️</button>}
          </div>

          <div ref={messagesContainerRef} style={{ flex: 1, overflowY: 'auto', padding: '15px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {messages.map(m => (
              <div key={m.id} style={{ 
                  alignSelf: m.sender_id === session.user.id ? 'flex-end' : 'flex-start',
                  background: m.sender_id === session.user.id ? THEME.primary : '#1e293b',
                  padding: '10px', borderRadius: '10px', maxWidth: '80%', position: 'relative'
              }}>
                {m.content.startsWith('[IMAGE]') ? <img src={m.content.replace('[IMAGE]:','')} style={{maxWidth:'200px'}} alt="img"/> : m.content}
                {m.sender_id === session.user.id && (
                    <div style={{ fontSize: '9px', textAlign: 'right' }}>{m.is_read ? '◉' : '○'}</div>
                )}
                {/* Опция удаления (только админ или владелец сообщения) */}
                {(m.sender_id === session.user.id || activeChatData?.owner_id === session.user.id) && 
                    <button onClick={() => deleteMessage(m.id)} style={{fontSize:'8px', background:'red', border:'none'}}>Удалить</button>}
              </div>
            ))}
          </div>

          <form onSubmit={e => { e.preventDefault(); sendMessage(); }} style={{ padding: '10px', borderTop: `1px solid ${THEME.border}`, display: 'flex' }}>
            <input style={{ flex: 1, background: '#000', color: '#fff', border: 'none', padding: '10px' }} value={newMessage} onChange={e => setNewMessage(e.target.value)} />
            <button type="submit">Отправить</button>
          </form>
        </div>
      )}
    </div>
  );
}
