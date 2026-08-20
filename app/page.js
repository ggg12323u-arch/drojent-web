'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const DEV_EMAIL = 'ggg12323u@gmail.com';
const REACTION_EMOJIS = ['🔥', '❤️', '👍', '😂', '😮', '😢'];

// Кастомные SVG иконки
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
  const [loginInput, setLoginInput] = useState(''); // Email или Username
  const [password, setPassword] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');

  const [myProfile, setMyProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('chats'); // 'chats' | 'profile' | 'tickets'

  const [editUsername, setEditUsername] = useState('');
  const [editBirthdate, setEditBirthdate] = useState('');
  const [editCustomStatus, setEditCustomStatus] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [myChats, setMyChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [activeUser, setActiveUser] = useState(null);
  const [showUserProfileModal, setShowUserProfileModal] = useState(false);

  // Поддержка и Тикеты
  const [tickets, setTickets] = useState([]);
  const [mySupportMessages, setMySupportMessages] = useState([]);
  const [newSupportMsg, setNewSupportMsg] = useState('');
  const [isSupportMode, setIsSupportMode] = useState(false);
  const [replyTicketText, setReplyTicketText] = useState({});

  // Stories
  const [stories, setStories] = useState([]);
  const [activeStory, setActiveStory] = useState(null);

  // Messages & Reactions
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    if (!session) return;
    const loadProfile = async () => {
      const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      if (data) {
        setMyProfile(data);
        setEditUsername(data.username || '');
        setEditBirthdate(data.birthdate || '');
        setEditCustomStatus(data.custom_status || '');
        setAvatarUrl(data.avatar_url || '');
      }
    };
    loadProfile();
    fetchStories();
    fetchSupportTickets();
  }, [session]);

  const fetchStories = async () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data } = await supabase
      .from('stories')
      .select('*, profiles(id, username, avatar_url, status_badge)')
      .gte('created_at', yesterday)
      .order('created_at', { ascending: false });
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
    const { data: participants } = await supabase.from('chat_participants').select('chat_id').eq('user_id', session.user.id);
    if (participants && participants.length > 0) {
      const chatIds = participants.map(p => p.chat_id);
      const { data: otherParticipants } = await supabase
        .from('chat_participants')
        .select('chat_id, user_id, profiles(id, username, birthdate, avatar_url, status_badge, custom_status)')
        .in('chat_id', chatIds);
      
      if (otherParticipants) {
        const uniqueChats = [];
        chatIds.forEach(id => {
          const parts = otherParticipants.filter(p => p.chat_id === id);
          if (parts.length === 1 && parts[0].user_id === session.user.id) {
            uniqueChats.push({ chat_id: id, profiles: { id: session.user.id, username: 'Избранное', avatar_url: myProfile?.avatar_url, custom_status: 'Заметки для себя' } });
          } else {
            const partner = parts.find(p => p.user_id !== session.user.id);
            if (partner) uniqueChats.push(partner);
          }
        });
        setMyChats(uniqueChats);
      }
    } else {
      setMyChats([]);
    }
  };

  useEffect(() => { fetchMyChats(); }, [session, myProfile]);

  useEffect(() => {
    if (!session) return;
    const searchUsers = async () => {
      if (!searchQuery.trim()) { setSearchResults([]); return; }
      const { data } = await supabase.from('profiles').select('*').ilike('username', `%${searchQuery}%`);
      if (data) setSearchResults(data);
    };
    const timer = setTimeout(searchUsers, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, session]);

  // При смене активного чата прокручиваем вниз один раз
  useEffect(() => {
    if (!activeChat) { setMessages([]); setReactions([]); return; }

    const fetchMessagesAndReactions = async () => {
      const { data: msgs } = await supabase.from('messages').select('*').eq('chat_id', activeChat).order('created_at', { ascending: true });
      if (msgs) {
        setMessages(msgs);
        setTimeout(scrollToBottom, 100);

        const msgIds = msgs.map(m => m.id);
        if (msgIds.length > 0) {
          const { data: reactData } = await supabase.from('message_reactions').select('*').in('message_id', msgIds);
          if (reactData) setReactions(reactData);
        }
      }
      await supabase.from('messages').update({ is_read: true }).eq('chat_id', activeChat).neq('sender_id', session.user.id);
    };

    fetchMessagesAndReactions();

    const msgChannel = supabase
      .channel(`realtime:chat_${activeChat}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `chat_id=eq.${activeChat}` }, () => {
        fetchMessagesAndReactions();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'message_reactions' }, () => {
        fetchMessagesAndReactions();
      })
      .subscribe();

    return () => { supabase.removeChannel(msgChannel); };
  }, [activeChat, session]);

  const startChatWithUser = async (targetUser) => {
    setIsSupportMode(false);
    if (forwardingMsg) {
      const isSaved = targetUser.id === session.user.id;
      let targetChatId = null;

      const { data: myPart } = await supabase.from('chat_participants').select('chat_id').eq('user_id', session.user.id);
      const myChatIds = myPart?.map(c => c.chat_id) || [];

      if (myChatIds.length > 0) {
        if (isSaved) {
          for (let cid of myChatIds) {
            const { data: parts } = await supabase.from('chat_participants').select('user_id').eq('chat_id', cid);
            if (parts && parts.length === 1 && parts[0].user_id === session.user.id) {
              targetChatId = cid; break;
            }
          }
        } else {
          const { data: common } = await supabase.from('chat_participants').select('chat_id').eq('user_id', targetUser.id).in('chat_id', myChatIds).limit(1);
          if (common && common.length > 0) targetChatId = common[0].chat_id;
        }
      }

      if (!targetChatId) {
        const { data: newC } = await supabase.from('chats').insert([{}]).select().single();
        if (newC) {
          targetChatId = newC.id;
          if (isSaved) {
            await supabase.from('chat_participants').insert([{ chat_id: newC.id, user_id: session.user.id }]);
          } else {
            await supabase.from('chat_participants').insert([
              { chat_id: newC.id, user_id: session.user.id },
              { chat_id: newC.id, user_id: targetUser.id }
            ]);
          }
        }
      }

      if (targetChatId) {
        await supabase.from('messages').insert([{
          chat_id: targetChatId,
          sender_id: session.user.id,
          content: `↪ Переслано: ${forwardingMsg.content}`,
          is_read: false
        }]);
        alert('Сообщение переслано!');
        setForwardingMsg(null);
        fetchMyChats();
      }
      return;
    }

    setActiveUser(targetUser);
    setSearchQuery('');
    const isSavedMessages = targetUser.id === session.user.id;

    const { data: myPart } = await supabase.from('chat_participants').select('chat_id').eq('user_id', session.user.id);
    const myChatIds = myPart?.map(c => c.chat_id) || [];

    if (myChatIds.length > 0) {
      if (isSavedMessages) {
        for (let cid of myChatIds) {
          const { data: parts } = await supabase.from('chat_participants').select('user_id').eq('chat_id', cid);
          if (parts && parts.length === 1 && parts[0].user_id === session.user.id) {
            setActiveChat(cid);
            fetchMyChats();
            return;
          }
        }
      } else {
        const { data: commonChat } = await supabase.from('chat_participants').select('chat_id').eq('user_id', targetUser.id).in('chat_id', myChatIds).limit(1);
        if (commonChat && commonChat.length > 0) { 
          setActiveChat(commonChat[0].chat_id); 
          fetchMyChats(); 
          return; 
        }
      }
    }

    const { data: newChat } = await supabase.from('chats').insert([{}]).select().single();
    if (newChat) {
      if (isSavedMessages) {
        await supabase.from('chat_participants').insert([{ chat_id: newChat.id, user_id: session.user.id }]);
      } else {
        await supabase.from('chat_participants').insert([
          { chat_id: newChat.id, user_id: session.user.id },
          { chat_id: newChat.id, user_id: targetUser.id }
        ]);
      }
      setActiveChat(newChat.id);
      fetchMyChats();
    }
  };

  const sendMessage = async (type = 'text', mediaUrl = '') => {
    if (editingMsg) {
      if (!newMessage.trim()) return;
      await supabase.from('messages').update({ content: newMessage, is_edited: true }).eq('id', editingMsg.id);
      setEditingMsg(null);
      setNewMessage('');
      return;
    }

    const textToSend = type === 'text' ? newMessage : mediaUrl;
    if (type === 'text' && !textToSend.trim()) return;
    if (!activeChat) return;

    if (type === 'text') setNewMessage('');

    let finalContent = textToSend;
    if (replyingMsg) {
      finalContent = `💬 [Ответ на: "${replyingMsg.content.slice(0, 30)}..."]\n${textToSend}`;
      setReplyingMsg(null);
    }

    await supabase.from('messages').insert([{
      chat_id: activeChat,
      sender_id: session.user.id,
      content: finalContent,
      is_read: false
    }]);

    setTimeout(scrollToBottom, 50);
  };

  const sendSupportTicket = async () => {
    if (!newSupportMsg.trim()) return;
    await supabase.from('support_tickets').insert([{ user_id: session.user.id, message: newSupportMsg }]);
    setNewSupportMsg('');
    fetchSupportTickets();
  };

  const replyToTicket = async (ticketId) => {
    const text = replyTicketText[ticketId];
    if (!text?.trim()) return;
    await supabase.from('support_tickets').update({ reply: text, status: 'closed' }).eq('id', ticketId);
    setReplyTicketText(prev => ({ ...prev, [ticketId]: '' }));
    fetchSupportTickets();
  };

  const toggleReaction = async (msgId, emoji) => {
    const existing = reactions.find(r => r.message_id === msgId && r.user_id === session.user.id && r.emoji === emoji);
    if (existing) {
      await supabase.from('message_reactions').delete().eq('id', existing.id);
    } else {
      await supabase.from('message_reactions').insert([{ message_id: msgId, user_id: session.user.id, emoji }]);
    }
    setSelectedMsgForMenu(null);
  };

  const handleStoryUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop();
    const fileName = `story_${session.user.id}_${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage.from('media').upload(fileName, file);
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(fileName);
      await supabase.from('stories').insert([{ user_id: session.user.id, media_url: publicUrl }]);
      fetchStories();
      alert('История выложена!');
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop();
    const fileName = `avatar_${session.user.id}_${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage.from('media').upload(fileName, file);
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(fileName);
      setAvatarUrl(publicUrl);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage.from('media').upload(fileName, file);
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(fileName);
      sendMessage('image', `[IMAGE]:${publicUrl}`);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const fileName = `voice_${Date.now()}.webm`;

        const { error } = await supabase.storage.from('media').upload(fileName, audioBlob);
        if (!error) {
          const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(fileName);
          sendMessage('voice', `[VOICE]:${publicUrl}`);
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      alert('Включите доступ к микрофону!');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const saveProfile = async () => {
    const statusBadge = session.user.email === DEV_EMAIL ? '👑 Developer' : 'ℹ️ User';
    const { error } = await supabase.from('profiles').update({
      username: editUsername,
      birthdate: editBirthdate || null,
      custom_status: editCustomStatus || null,
      avatar_url: avatarUrl,
      status_badge: statusBadge
    }).eq('id', session.user.id);

    if (error) alert('Ошибка сохранения: ' + error.message);
    else {
      alert('Профиль сохранен!');
      setMyProfile(prev => ({ ...prev, username: editUsername, birthdate: editBirthdate, custom_status: editCustomStatus, avatar_url: avatarUrl, status_badge: statusBadge }));
    }
  };

  const deleteMessage = async (msgId) => {
    await supabase.from('messages').delete().eq('id', msgId);
    setMessages(prev => prev.filter(m => m.id !== msgId));
    setSelectedMsgForMenu(null);
  };

  const deleteChat = async () => {
    if (confirm('Удалить этот чат?')) {
      await supabase.from('chats').delete().eq('id', activeChat);
      setActiveChat(null);
      setActiveUser(null);
      fetchMyChats();
    }
  };

  // Вход по Email ИЛИ Username
  const handleAuth = async (type) => {
    setLoading(true);
    if (type === 'signup') {
      if (!signupUsername.trim() || !signupEmail.trim() || !password) {
        alert('Заполните все поля регистрации!');
        setLoading(false);
        return;
      }
      const { error } = await supabase.auth.signUp({
        email: signupEmail,
        password,
        options: { data: { username: signupUsername } }
      });
      if (error) alert(error.message);
      else alert('Регистрация успешна! Нажмите "Войти"');
    } else {
      let targetEmail = loginInput.trim();
      if (!targetEmail.includes('@')) {
        const { data: prof } = await supabase.from('profiles').select('id').eq('username', loginInput.trim()).single();
        if (prof) {
          const { data: userData } = await supabase.rpc('get_email_by_id', { user_id: prof.id });
          if (userData) targetEmail = userData;
        }
      }

      const { error } = await supabase.auth.signInWithPassword({ email: targetEmail, password });
      if (error) alert('Ошибка входа: ' + error.message);
    }
    setLoading(false);
  };

  if (!session) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#030712', fontFamily: 'system-ui, sans-serif', padding: '16px' }}>
        <div style={{
          width: '100%',
          maxWidth: '380px',
          padding: '32px 24px',
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(16px)',
          borderRadius: '24px',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          boxShadow: '0 0 35px rgba(56, 189, 248, 0.2)',
          color: '#f8fafc'
        }}>
          <h2 style={{ margin: '0 0 8px 0', textAlign: 'center', fontSize: '28px', color: '#38bdf8', textShadow: '0 0 12px rgba(56,189,248,0.6)' }}>DroJent</h2>
          <p style={{ margin: '0 0 24px 0', color: '#94a3b8', fontSize: '13px', textAlign: 'center' }}>Neon Cyber Glass Messenger</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input 
              style={{ padding: '12px', borderRadius: '12px', border: '1px solid rgba(56, 189, 248, 0.2)', background: 'rgba(3, 7, 18, 0.6)', color: '#fff', outline: 'none' }} 
              placeholder="Username или Email" 
              value={loginInput} 
              onChange={(e) => setLoginInput(e.target.value)} 
            />
            <input 
              style={{ padding: '12px', borderRadius: '12px', border: '1px solid rgba(56, 189, 248, 0.2)', background: 'rgba(3, 7, 18, 0.6)', color: '#fff', outline: 'none' }} 
              type="password" 
              placeholder="Пароль" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />

            <button disabled={loading} style={{ padding: '12px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)', color: '#fff', fontWeight: 'bold', boxShadow: '0 0 15px rgba(37,99,235,0.4)', cursor: 'pointer', marginTop: '6px' }} onClick={() => handleAuth('login')}>
              Войти
            </button>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', margin: '10px 0', paddingTop: '10px' }}>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 8px 0', textAlign: 'center' }}>Нет аккаунта? Зарегистрируйтесь:</p>
              <input style={{ padding: '10px', borderRadius: '10px', border: '1px solid rgba(56, 189, 248, 0.2)', background: 'rgba(3, 7, 18, 0.6)', color: '#fff', outline: 'none', width: '100%', boxSizing: 'border-box', marginBottom: '8px' }} placeholder="Придумайте Username" value={signupUsername} onChange={(e) => setSignupUsername(e.target.value)} />
              <input style={{ padding: '10px', borderRadius: '10px', border: '1px solid rgba(56, 189, 248, 0.2)', background: 'rgba(3, 7, 18, 0.6)', color: '#fff', outline: 'none', width: '100%', boxSizing: 'border-box', marginBottom: '8px' }} placeholder="Ваш Email" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} />
              <button disabled={loading} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #38bdf8', background: 'transparent', color: '#38bdf8', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => handleAuth('signup')}>
                Зарегистрироваться
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isDeveloper = session.user.email === DEV_EMAIL;
  const displayedList = searchQuery.trim() ? searchResults : myChats.map(c => c.profiles);

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', background: '#030712', fontFamily: 'system-ui, sans-serif', color: '#f8fafc', overflow: 'hidden' }}>
      
      {/* Левая панель */}
      <div style={{
        width: (activeChat || isSupportMode) ? '320px' : '100%',
        display: (activeChat || isSupportMode) ? 'none' : 'flex',
        flexDirection: 'column',
        borderRight: '1px solid rgba(56, 189, 248, 0.15)',
        background: 'rgba(11, 15, 25, 0.85)',
        backdropFilter: 'blur(12px)',
        height: '100%'
      }} className="sidebar">
        
        <div style={{ padding: '16px', borderBottom: '1px solid rgba(56, 189, 248, 0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '20px', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px' }}>
            DroJent {isDeveloper && <Icons.Crown />}
          </h3>
          <button onClick={() => supabase.auth.signOut()} style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #f87171', background: 'transparent', color: '#f87171', fontSize: '12px' }}>Выйти</button>
        </div>

        {/* Панель историй (Stories) */}
        <div style={{ padding: '10px 12px', borderBottom: '1px solid rgba(56, 189, 248, 0.1)', display: 'flex', gap: '12px', overflowX: 'auto', background: 'rgba(7, 10, 18, 0.6)' }}>
          <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', flexShrink: 0 }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '2px dashed #38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
              ➕
            </div>
            <span style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>История</span>
            <input type="file" accept="image/*" onChange={handleStoryUpload} style={{ display: 'none' }} />
          </label>

          {stories.map(st => (
            <div key={st.id} onClick={() => setActiveStory(st)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', flexShrink: 0 }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', padding: '2px', border: '2px solid #38bdf8', boxShadow: '0 0 10px rgba(56,189,248,0.4)', background: '#0b0f19' }}>
                <img src={st.media_url} alt="St" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              </div>
              <span style={{ fontSize: '10px', color: '#f1f5f9', marginTop: '4px', maxWidth: '50px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                @{st.profiles?.username}
              </span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', borderBottom: '1px solid rgba(56, 189, 248, 0.15)', background: 'rgba(7, 10, 18, 0.8)' }}>
          <button onClick={() => { setActiveTab('chats'); setIsSupportMode(false); }} style={{ flex: 1, padding: '12px', background: 'transparent', border: 'none', color: activeTab === 'chats' ? '#38bdf8' : '#64748b', borderBottom: activeTab === 'chats' ? '2px solid #38bdf8' : 'none', fontWeight: 'bold', cursor: 'pointer' }}>
            💬 Чаты
          </button>
          <button onClick={() => { setActiveTab('profile'); setIsSupportMode(false); }} style={{ flex: 1, padding: '12px', background: 'transparent', border: 'none', color: activeTab === 'profile' ? '#38bdf8' : '#64748b', borderBottom: activeTab === 'profile' ? '2px solid #38bdf8' : 'none', fontWeight: 'bold', cursor: 'pointer' }}>
            ⚙️ Профиль
          </button>
          {isDeveloper && (
            <button onClick={() => { setActiveTab('tickets'); setIsSupportMode(false); }} style={{ flex: 1, padding: '12px', background: 'transparent', border: 'none', color: activeTab === 'tickets' ? '#38bdf8' : '#64748b', borderBottom: activeTab === 'tickets' ? '2px solid #38bdf8' : 'none', fontWeight: 'bold', cursor: 'pointer' }}>
              🎫 Тикеты
            </button>
          )}
        </div>

        {activeTab === 'profile' ? (
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, overflowY: 'auto' }}>
            <div style={{ textAlign: 'center', margin: '10px 0' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#2563eb', margin: '0 auto 10px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', fontWeight: 'bold', border: '2px solid #38bdf8', boxShadow: '0 0 15px rgba(56,189,248,0.4)' }}>
                {avatarUrl ? <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (isDeveloper ? <Icons.Crown /> : (myProfile?.username?.[0]?.toUpperCase() || 'U'))}
              </div>
              
              <label style={{ cursor: 'pointer', color: '#38bdf8', fontSize: '12px', fontWeight: 'bold' }}>
                📷 Изменить аватарку
                <input type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} />
              </label>

              <h3 style={{ margin: '10px 0 2px 0', color: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                @{myProfile?.username || 'user'} {isDeveloper && <Icons.Crown />}
              </h3>
              <span style={{ fontSize: '12px', color: '#38bdf8', fontWeight: 'bold' }}>
                {isDeveloper ? '👑 Developer' : 'ℹ️ User'}
              </span>
            </div>

            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Username:</label>
              <input style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.2)', background: 'rgba(3, 7, 18, 0.6)', color: '#fff', outline: 'none', boxSizing: 'border-box' }} value={editUsername} onChange={(e) => setEditUsername(e.target.value)} />
            </div>

            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Текстовый статус:</label>
              <input style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.2)', background: 'rgba(3, 7, 18, 0.6)', color: '#fff', outline: 'none', boxSizing: 'border-box' }} placeholder="Например: Занят / Пишу код" value={editCustomStatus} onChange={(e) => setEditCustomStatus(e.target.value)} />
            </div>

            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Дата рождения:</label>
              <input type="date" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.2)', background: 'rgba(3, 7, 18, 0.6)', color: '#fff', outline: 'none', boxSizing: 'border-box' }} value={editBirthdate} onChange={(e) => setEditBirthdate(e.target.value)} />
            </div>

            <button onClick={saveProfile} style={{ padding: '12px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)', color: '#fff', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
              Сохранить изменения
            </button>
          </div>
        ) : activeTab === 'tickets' ? (
          /* Панель Тикетов для Разработчика */
          <div style={{ padding: '16px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h4 style={{ margin: 0, color: '#38bdf8' }}>Обращения пользователей:</h4>
            {tickets.length === 0 ? (
              <div style={{ color: '#64748b', fontSize: '13px' }}>Тикетов пока нет</div>
            ) : (
              tickets.map(t => (
                <div key={t.id} style={{ padding: '12px', borderRadius: '12px', background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                  <div style={{ fontSize: '12px', color: '#38bdf8', fontWeight: 'bold' }}>@{t.profiles?.username || 'User'}</div>
                  <div style={{ fontSize: '14px', margin: '4px 0', color: '#fff' }}>{t.message}</div>
                  
                  {t.reply ? (
                    <div style={{ fontSize: '12px', color: '#10b981', marginTop: '6px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '4px' }}>
                      Ответ: {t.reply}
                    </div>
                  ) : (
                    <div style={{ marginTop: '8px', display: 'flex', gap: '6px' }}>
                      <input 
                        style={{ flex: 1, padding: '6px 10px', borderRadius: '6px', border: '1px solid rgba(56, 189, 248, 0.2)', background: '#030712', color: '#fff', fontSize: '12px' }}
                        placeholder="Ответить..."
                        value={replyTicketText[t.id] || ''}
                        onChange={(e) => setReplyTicketText({ ...replyTicketText, [t.id]: e.target.value })}
                      />
                      <button onClick={() => replyToTicket(t.id)} style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: '#38bdf8', color: '#000', fontWeight: 'bold', fontSize: '12px' }}>
                        Отправить
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        ) : (
          <>
            <div onClick={() => startChatWithUser({ id: session.user.id, username: 'Избранное' })} style={{ padding: '12px 16px', borderBottom: '1px solid rgba(56, 189, 248, 0.15)', cursor: 'pointer', background: 'rgba(56, 189, 248, 0.05)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#38bdf8', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '18px' }}>🔖</div>
              <div>
                <div style={{ fontWeight: '600', fontSize: '14px', color: '#38bdf8' }}>Избранное</div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>Заметки и файлы для себя</div>
              </div>
            </div>

            <div style={{ padding: '12px', borderBottom: '1px solid rgba(56, 189, 248, 0.1)' }}>
              <input style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(56, 189, 248, 0.2)', background: 'rgba(3, 7, 18, 0.6)', color: '#fff', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} placeholder="🔍 Поиск по @username..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
              {displayedList.length === 0 ? (
                <div style={{ padding: '20px', color: '#64748b', fontSize: '13px', textAlign: 'center' }}>
                  {searchQuery.trim() ? 'Никто не найден' : 'Найдите пользователя через поиск'}
                </div>
              ) : (
                displayedList.map((u) => u && (
                  <div key={u.id} onClick={() => startChatWithUser(u)} style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.03)', cursor: 'pointer', background: activeUser?.id === u.id ? 'rgba(56, 189, 248, 0.1)' : 'transparent', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: u.id === session.user.id ? '#38bdf8' : '#2563eb', color: u.id === session.user.id ? '#000' : '#fff', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                      {u.avatar_url ? <img src={u.avatar_url} alt="Av" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (u.id === session.user.id ? '🔖' : (u.username?.[0]?.toUpperCase() || 'U'))}
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '14px', color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {u.id === session.user.id ? 'Избранное' : `@${u.username || 'user'}`}
                        {u.status_badge === '👑 Developer' && <Icons.Crown />}
                        {u.status_badge !== '👑 Developer' && u.id !== session.user.id && <span>ℹ️</span>}
                      </div>
                      {u.custom_status && <div style={{ fontSize: '11px', color: '#38bdf8' }}>{u.custom_status}</div>}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Кнопка чата техподдержки */}
            {!isDeveloper && (
              <div 
                onClick={() => { setIsSupportMode(true); setActiveChat(null); }}
                style={{ padding: '14px 16px', borderTop: '1px solid rgba(56, 189, 248, 0.2)', background: 'rgba(56, 189, 248, 0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
              >
                <Icons.Support />
                <span style={{ fontWeight: 'bold', fontSize: '13px', color: '#38bdf8' }}>Служба поддержки</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Правая панель (Поддержка или Чат) */}
      <div style={{ flex: 1, display: (!activeChat && !isSupportMode) ? 'none' : 'flex', flexDirection: 'column', height: '100%', background: '#030712' }} className="chat-area">
        
        {isSupportMode ? (
          /* Окно Техподдержки для юзера */
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(56, 189, 248, 0.15)', background: 'rgba(11, 15, 25, 0.85)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button onClick={() => setIsSupportMode(false)} style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #38bdf8', background: 'transparent', color: '#38bdf8', fontSize: '12px' }}>
                <Icons.Back />
              </button>
              <h3 style={{ margin: 0, fontSize: '16px', color: '#38bdf8' }}>Служба поддержки DroJent</h3>
            </div>

            <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {mySupportMessages.length === 0 ? (
                <div style={{ color: '#64748b', textAlign: 'center', margin: 'auto' }}>Напишите свой вопрос или проблему в поддержку</div>
              ) : (
                mySupportMessages.map(t => (
                  <div key={t.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ alignSelf: 'flex-end', background: '#2563eb', padding: '10px 14px', borderRadius: '16px 16px 2px 16px', maxWidth: '80%', color: '#fff', fontSize: '14px' }}>
                      {t.message}
                    </div>
                    {t.reply && (
                      <div style={{ alignSelf: 'flex-start', background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '10px 14px', borderRadius: '16px 16px 16px 2px', maxWidth: '80%', color: '#38bdf8', fontSize: '14px' }}>
                        👑 Ответ саппорта: {t.reply}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div style={{ padding: '12px', borderTop: '1px solid rgba(56, 189, 248, 0.15)', background: '#0b0f19', display: 'flex', gap: '8px' }}>
              <input 
                style={{ flex: 1, padding: '12px 16px', borderRadius: '24px', border: '1px solid rgba(56, 189, 248, 0.2)', background: '#030712', color: '#fff', outline: 'none' }}
                placeholder="Опишите проблему..."
                value={newSupportMsg}
                onChange={(e) => setNewSupportMsg(e.target.value)}
              />
              <button onClick={sendSupportTicket} style={{ padding: '12px 20px', borderRadius: '24px', border: 'none', background: '#38bdf8', color: '#000', fontWeight: 'bold' }}>
                <Icons.Send />
              </button>
            </div>
          </div>
        ) : activeChat ? (
          /* Окно Обычного Чата */
          <>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(56, 189, 248, 0.15)', background: 'rgba(11, 15, 25, 0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                <button onClick={() => { setActiveChat(null); setActiveUser(null); }} style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #38bdf8', background: 'transparent', color: '#38bdf8', fontSize: '12px', flexShrink: 0 }}>
                  <Icons.Back />
                </button>
                <div>
                  <h3 onClick={() => setShowUserProfileModal(true)} style={{ margin: 0, fontSize: '15px', color: '#38bdf8', cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {activeUser?.id === session.user.id ? '🔖 Избранное' : `@${activeUser?.username}`}
                    {activeUser?.status_badge === '👑 Developer' && <Icons.Crown />}
                    {activeUser?.status_badge !== '👑 Developer' && activeUser?.id !== session.user.id && <span>ℹ️</span>}
                  </h3>
                  {activeUser?.custom_status && <div style={{ fontSize: '10px', color: '#94a3b8' }}>{activeUser.custom_status}</div>}
                </div>
              </div>
              <button onClick={deleteChat} style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #f87171', background: 'transparent', color: '#f87171', fontSize: '12px', flexShrink: 0 }}>
                <Icons.Trash />
              </button>
            </div>

            {/* Лента сообщений */}
            <div ref={messagesContainerRef} style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {messages.map((msg) => {
                const isMe = msg.sender_id === session.user.id;
                const time = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const isImage = msg.content.startsWith('[IMAGE]:');
                const isVoice = msg.content.startsWith('[VOICE]:');
                const msgReactions = reactions.filter(r => r.message_id === msg.id);

                return (
                  <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                    <div 
                      onClick={() => setSelectedMsgForMenu(msg)}
                      style={{
                        background: isMe ? 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)' : 'rgba(30, 41, 59, 0.7)',
                        backdropFilter: 'blur(8px)',
                        color: '#fff',
                        padding: '12px 16px',
                        borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                        maxWidth: '85%',
                        fontSize: '14px',
                        cursor: 'pointer',
                        boxShadow: isMe ? '0 0 15px rgba(37,99,235,0.3)' : '0 0 10px rgba(0,0,0,0.3)',
                        border: isMe ? 'none' : '1px solid rgba(255,255,255,0.08)'
                      }}
                    >
                      {isImage ? (
                        <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.2)' }}>
                          <img src={msg.content.replace('[IMAGE]:', '')} alt="Photo" style={{ maxWidth: '100%', maxHeight: '250px', display: 'block' }} />
                        </div>
                      ) : isVoice ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px' }}>
                          <span style={{ fontSize: '18px' }}>🎙️</span>
                          <audio controls src={msg.content.replace('[VOICE]:', '')} style={{ maxWidth: '200px', filter: 'invert(1)' }} />
                        </div>
                      ) : (
                        <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                      )}
                      
                      {msgReactions.length > 0 && (
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '6px' }}>
                          {msgReactions.map(r => (
                            <span key={r.id} style={{ fontSize: '11px', background: 'rgba(0,0,0,0.4)', padding: '2px 6px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
                              {r.emoji}
                            </span>
                          ))}
                        </div>
                      )}

                      <div style={{ fontSize: '10px', color: isMe ? '#93c5fd' : '#94a3b8', marginTop: '4px', textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                        {msg.is_edited && <span style={{ fontStyle: 'italic' }}>изм.</span>}
                        <span>{time}</span>
                        {isMe && <span style={{ fontWeight: 'bold' }}>{msg.is_read ? '✓✓' : '✓'}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {(replyingMsg || editingMsg || forwardingMsg) && (
              <div style={{ padding: '8px 16px', background: '#070a12', borderTop: '1px solid rgba(56, 189, 248, 0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                <span style={{ color: '#38bdf8' }}>
                  {editingMsg ? '✏️ Редактирование...' : replyingMsg ? `💬 Ответ на: "${replyingMsg.content.slice(0, 20)}..."` : '↪ Пересылка сообщения...'}
                </span>
                <button onClick={() => { setEditingMsg(null); setReplyingMsg(null); setForwardingMsg(null); setNewMessage(''); }} style={{ border: 'none', background: 'transparent', color: '#f87171', cursor: 'pointer' }}>✖</button>
              </div>
            )}

            <form onSubmit={(e) => { e.preventDefault(); sendMessage('text'); }} style={{ padding: '12px 10px', borderTop: '1px solid rgba(56, 189, 248, 0.15)', background: '#0b0f19', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <label style={{ cursor: 'pointer', padding: '10px', background: 'rgba(30, 41, 59, 0.8)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icons.Camera />
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
              </label>

              <button type="button" onClick={isRecording ? stopRecording : startRecording} style={{ padding: '10px', background: isRecording ? 'rgba(239, 68, 68, 0.2)' : 'rgba(30, 41, 59, 0.8)', border: 'none', borderRadius: '50%', cursor: 'pointer' }}>
                {isRecording ? <Icons.Stop /> : <Icons.Mic />}
              </button>

              <input style={{ flex: 1, minWidth: 0, padding: '12px 16px', borderRadius: '24px', border: '1px solid rgba(56, 189, 248, 0.2)', background: 'rgba(3, 7, 18, 0.6)', color: '#fff', outline: 'none', fontSize: '14px' }} placeholder={isRecording ? "Идет запись..." : "Сообщение..."} value={newMessage} onChange={(e) => setNewMessage(e.target.value)} disabled={isRecording} />
              <button type="submit" style={{ padding: '12px 18px', borderRadius: '24px', border: 'none', background: 'linear-gradient(135deg, #38bdf8 0%, #2563eb 100%)', color: '#000', fontWeight: 'bold', cursor: 'pointer' }}>
                <Icons.Send />
              </button>
            </form>
          </>
        ) : null}
      </div>

      {/* Просмотр Истории */}
      {activeStory && (
        <div style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 3000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <button onClick={() => setActiveStory(null)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer' }}>✖</button>
          <div style={{ color: '#fff', marginBottom: '10px', fontWeight: 'bold' }}>@{activeStory.profiles?.username}</div>
          <img src={activeStory.media_url} alt="Story" style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: '12px' }} />
        </div>
      )}

      {/* Меню взаимодействия с сообщением */}
      {selectedMsgForMenu && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '16px' }}>
          <div style={{ width: '100%', maxWidth: '280px', background: '#0b0f19', borderRadius: '20px', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px', background: 'rgba(30, 41, 59, 0.8)', borderRadius: '12px' }}>
              {REACTION_EMOJIS.map(em => (
                <span key={em} onClick={() => toggleReaction(selectedMsgForMenu.id, em)} style={{ fontSize: '20px', cursor: 'pointer' }}>
                  {em}
                </span>
              ))}
            </div>

            <button onClick={() => { setReplyingMsg(selectedMsgForMenu); setSelectedMsgForMenu(null); }} style={{ padding: '10px', background: 'rgba(30, 41, 59, 0.6)', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', textAlign: 'left' }}>💬 Ответить</button>
            <button onClick={() => { setForwardingMsg(selectedMsgForMenu); setSelectedMsgForMenu(null); setActiveChat(null); alert('Выберите пользователя для пересылки'); }} style={{ padding: '10px', background: 'rgba(30, 41, 59, 0.6)', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', textAlign: 'left' }}>↪ Переслать</button>
            
            {selectedMsgForMenu.sender_id === session.user.id && !selectedMsgForMenu.content.startsWith('[IMAGE]:') && !selectedMsgForMenu.content.startsWith('[VOICE]:') && (
              <button onClick={() => { setEditingMsg(selectedMsgForMenu); setNewMessage(selectedMsgForMenu.content); setSelectedMsgForMenu(null); }} style={{ padding: '10px', background: 'rgba(30, 41, 59, 0.6)', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', textAlign: 'left' }}>✏️ Изменить</button>
            )}

            {selectedMsgForMenu.sender_id === session.user.id && (
              <button onClick={() => deleteMessage(selectedMsgForMenu.id)} style={{ padding: '10px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #f87171', borderRadius: '8px', color: '#f87171', cursor: 'pointer', textAlign: 'left' }}>🗑️ Удалить</button>
            )}

            <button onClick={() => setSelectedMsgForMenu(null)} style={{ padding: '10px', background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', marginTop: '4px' }}>Отмена</button>
          </div>
        </div>
      )}

      {/* Модалка профиля собеседника */}
      {showUserProfileModal && activeUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ width: '100%', maxWidth: '320px', background: '#0b0f19', borderRadius: '20px', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '20px', textAlign: 'center', color: '#fff' }}>
            <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: '#2563eb', margin: '0 auto 10px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold' }}>
              {activeUser.avatar_url ? <img src={activeUser.avatar_url} alt="Av" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (activeUser.username?.[0]?.toUpperCase() || 'U')}
            </div>
            <h3 style={{ margin: '0 0 4px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              @{activeUser.username}
              {activeUser.status_badge === '👑 Developer' && <Icons.Crown />}
            </h3>
            <p style={{ margin: '0 0 6px 0', fontSize: '12px', color: '#38bdf8', fontWeight: 'bold' }}>
              {activeUser.status_badge || 'ℹ️ User'}
            </p>
            {activeUser.custom_status && (
              <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#e2e8f0', fontStyle: 'italic' }}>
                «{activeUser.custom_status}»
              </p>
            )}
            <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#94a3b8' }}>
              📅 Дата рождения: {activeUser.birthdate || 'Не указана'}
            </p>
            <button onClick={() => setShowUserProfileModal(false)} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: 'none', background: '#38bdf8', color: '#000', fontWeight: 'bold', cursor: 'pointer' }}>
              Закрыть
            </button>
          </div>
        </div>
      )}

      <style jsx global>{`
        @media (min-width: 640px) {
          .sidebar { display: flex !important; width: 320px !important; }
          .chat-area { display: flex !important; }
        }
      `}</style>
    </div>
  );
}