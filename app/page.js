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
          ba