'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function Home() {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [myChats, setMyChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  // Автоскролл вниз при новом сообщении
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMyChats = async () => {
    if (!session) return;
    const { data: participants } = await supabase.from('chat_participants').select('chat_id').eq('user_id', session.user.id);
    if (participants && participants.length > 0) {
      const chatIds = participants.map(p => p.chat_id);
      const { data: otherParticipants } = await supabase
        .from('chat_participants')
        .select('chat_id, user_id, profiles(id, username)')
        .in('chat_id', chatIds);
      
      // Сбор диалогов (включая свой собственный для Избранного)
      if (otherParticipants) {
        const uniqueChats = [];
        chatIds.forEach(id => {
          const parts = otherParticipants.filter(p => p.chat_id === id);
          if (parts.length === 1 && parts[0].user_id === session.user.id) {
            uniqueChats.push({ chat_id: id, profiles: { id: session.user.id, username: 'Избранное' } });
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

  useEffect(() => { fetchMyChats(); }, [session]);

  // Поиск по username
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

  // Мгновенный Realtime подписок
  useEffect(() => {
    if (!activeChat) { setMessages([]); return; }

    const fetchMessages = async () => {
      const { data } = await supabase.from('messages').select('*').eq('chat_id', activeChat).order('created_at', { ascending: true });
      if (data) setMessages(data);
      await supabase.from('messages').update({ is_read: true }).eq('chat_id', activeChat).neq('sender_id', session.user.id);
    };

    fetchMessages();

    // Быстрый канал обновлений Realtime
    const channel = supabase
      .channel(`realtime:chat_${activeChat}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages', 
        filter: `chat_id=eq.${activeChat}` 
      }, (payload) => {
        setMessages((prev) => {
          if (prev.some(m => m.id === payload.new.id)) return prev;
          return [...prev, payload.new];
        });
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${activeChat}`
      }, (payload) => {
        setMessages((prev) => prev.filter(m => m.id !== payload.old.id));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeChat, session]);

  // Открыть или создать Избранное / Личный чат
  const startChatWithUser = async (targetUser) => {
    setActiveUser(targetUser);
    setSearchQuery('');
    
    const isSavedMessages = targetUser.id === session.user.id;

    const { data: myPart } = await supabase.from('chat_participants').select('chat_id').eq('user_id', session.user.id);
    const myChatIds = myPart?.map(c => c.chat_id) || [];

    if (myChatIds.length > 0) {
      if (isSavedMessages) {
        // Поиск индивидуального чата сам-с-собой
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

    // Создаем новый чат
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
    const textToSend = type === 'text' ? newMessage : mediaUrl;
    if (type === 'text' && !textToSend.trim()) return;
    if (!activeChat) return;

    if (type === 'text') setNewMessage('');

    // Мгновенно добавляем в локальное состояние, чтобы не ждать отклика сервера
    const tempMsg = {
      id: Date.now().toString(),
      chat_id: activeChat,
      sender_id: session.user.id,
      content: textToSend,
      is_read: false,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempMsg]);

    const { data } = await supabase.from('messages').insert([{
      chat_id: activeChat,
      sender_id: session.user.id,
      content: textToSend,
      is_read: false
    }]).select().single();

    if (data) {
      setMessages(prev => prev.map(m => m.id === tempMsg.id ? data : m));
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;

    // Быстро показываем локальное фото
    const localUrl = URL.createObjectURL(file);
    sendMessage('image', `[IMAGE]:${localUrl}`);

    const { error } = await supabase.storage.from('media').upload(fileName, file);
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(fileName);
      await supabase.from('messages').insert([{
        chat_id: activeChat,
        sender_id: session.user.id,
        content: `[IMAGE]:${publicUrl}`,
        is_read: false
      }]);
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

        const localUrl = URL.createObjectURL(audioBlob);
        sendMessage('voice', `[VOICE]:${localUrl}`);

        const { error } = await supabase.storage.from('media').upload(fileName, audioBlob);
        if (!error) {
          const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(fileName);
          await supabase.from('messages').insert([{
            chat_id: activeChat,
            sender_id: session.user.id,
            content: `[VOICE]:${publicUrl}`,
            is_read: false
          }]);
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

  const deleteMessage = async (msgId) => {
    if (confirm('Удалить сообщение?')) {
      setMessages(prev => prev.filter(m => m.id !== msgId));
      await supabase.from('messages').delete().eq('id', msgId);
    }
  };

  const deleteChat = async () => {
    if (confirm('Удалить этот чат?')) {
      await supabase.from('chats').delete().eq('id', activeChat);
      setActiveChat(null);
      setActiveUser(null);
      fetchMyChats();
    }
  };

  const handleAuth = async (type) => {
    setLoading(true);
    if (type === 'signup') {
      if (!username.trim()) { alert('Укажите Username!'); setLoading(false); return; }
      const { error } = await supabase.auth.signUp({ email, password, options: { data: { username } } });
      if (error) alert(error.message);
      else alert('Регистрация успешна! Нажми "Войти"');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert(error.message);
    }
    setLoading(false);
  };

  if (!session) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#030712', fontFamily: 'system-ui, sans-serif', padding: '16px' }}>
        <div style={{ width: '100%', maxWidth: '380px', padding: '32px 24px', background: 'rgba(15, 23, 42, 0.8)', borderRadius: '20px', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#f8fafc' }}>
          <h2 style={{ margin: '0 0 8px 0', textAlign: 'center', fontSize: '28px', color: '#38bdf8' }}>DroJent</h2>
          <p style={{ margin: '0 0 24px 0', color: '#94a3b8', fontSize: '13px', textAlign: 'center' }}>Neon Cyber Messenger</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input style={{ padding: '12px', borderRadius: '10px', border: '1px solid rgba(56, 189, 248, 0.2)', background: '#0b0f19', color: '#fff', outline: 'none' }} placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
            <input style={{ padding: '12px', borderRadius: '10px', border: '1px solid rgba(56, 189, 248, 0.2)', background: '#0b0f19', color: '#fff', outline: 'none' }} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input style={{ padding: '12px', borderRadius: '10px', border: '1px solid rgba(56, 189, 248, 0.2)', background: '#0b0f19', color: '#fff', outline: 'none' }} type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} />
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button disabled={loading} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: '#2563eb', color: '#fff', fontWeight: 'bold' }} onClick={() => handleAuth('login')}>Войти</button>
              <button disabled={loading} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #38bdf8', background: 'transparent', color: '#38bdf8', fontWeight: 'bold' }} onClick={() => handleAuth('signup')}>Регистрация</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const displayedList = searchQuery.trim() ? searchResults : myChats.map(c => c.profiles);

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', background: '#030712', fontFamily: 'system-ui, sans-serif', color: '#f8fafc', overflow: 'hidden' }}>
      
      {/* Левая панель */}
      <div style={{ width: activeChat ? '320px' : '100%', display: activeChat ? 'none' : 'flex', flexDirection: 'column', borderRight: '1px solid rgba(56, 189, 248, 0.15)', background: '#0b0f19', height: '100%' }} className="sidebar">
        
        <div style={{ padding: '16px', borderBottom: '1px solid rgba(56, 189, 248, 0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '20px', color: '#38bdf8' }}>DroJent</h3>
          <button onClick={() => supabase.auth.signOut()} style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #f87171', background: 'transparent', color: '#f87171', fontSize: '12px' }}>Выйти</button>
        </div>

        {/* Кнопка "Избранное" */}
        <div 
          onClick={() => startChatWithUser({ id: session.user.id, username: 'Избранное' })}
          style={{ padding: '12px 16px', borderBottom: '1px solid rgba(56, 189, 248, 0.15)', cursor: 'pointer', background: 'rgba(56, 189, 248, 0.05)', display: 'flex', alignItems: 'center', gap: '12px' }}
        >
          <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#38bdf8', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '18px' }}>🔖</div>
          <div>
            <div style={{ fontWeight: '600', fontSize: '14px', color: '#38bdf8' }}>Избранное</div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>Заметки и файлы для себя</div>
          </div>
        </div>

        <div style={{ padding: '12px', borderBottom: '1px solid rgba(56, 189, 248, 0.1)' }}>
          <input style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(56, 189, 248, 0.2)', background: '#030712', color: '#fff', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} placeholder="🔍 Поиск по @username..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {displayedList.length === 0 ? (
            <div style={{ padding: '20px', color: '#64748b', fontSize: '13px', textAlign: 'center' }}>
              {searchQuery.trim() ? 'Никто не найден' : 'Найдите пользователя через поиск'}
            </div>
          ) : (
            displayedList.map((u) => u && (
              <div key={u.id} onClick={() => startChatWithUser(u)} style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.03)', cursor: 'pointer', background: activeUser?.id === u.id ? 'rgba(56, 189, 248, 0.1)' : 'transparent', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: u.id === session.user.id ? '#38bdf8' : '#2563eb', color: u.id === session.user.id ? '#000' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                  {u.id === session.user.id ? '🔖' : (u.username?.[0]?.toUpperCase() || 'U')}
                </div>
                <div style={{ fontWeight: '600', fontSize: '14px', color: '#f1f5f9' }}>
                  {u.id === session.user.id ? 'Избранное' : `@${u.username || 'user'}`}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Правая панель (Чат) */}
      <div style={{ flex: 1, display: !activeChat ? 'none' : 'flex', flexDirection: 'column', height: '100%', background: '#030712' }} className="chat-area">
        {activeChat && (
          <>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(56, 189, 248, 0.15)', background: '#0b0f19', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                <button onClick={() => { setActiveChat(null); setActiveUser(null); }} style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #38bdf8', background: 'transparent', color: '#38bdf8', fontSize: '12px', flexShrink: 0 }}>← Назад</button>
                <h3 style={{ margin: 0, fontSize: '15px', color: '#38bdf8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {activeUser?.id === session.user.id ? '🔖 Избранное' : `@${activeUser?.username}`}
                </h3>
              </div>
              <button onClick={deleteChat} style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #f87171', background: 'transparent', color: '#f87171', fontSize: '12px', flexShrink: 0 }}>🗑️</button>
            </div>

            <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {messages.map((msg) => {
                const isMe = msg.sender_id === session.user.id;
                const time = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const isImage = msg.content.startsWith('[IMAGE]:');
                const isVoice = msg.content.startsWith('[VOICE]:');

                return (
                  <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                    <div onClick={() => isMe && deleteMessage(msg.id)} style={{ background: isMe ? '#2563eb' : '#1e293b', color: '#fff', padding: '10px 14px', borderRadius: isMe ? '16px 16px 2px 16px' : '16px 16px 16px 2px', maxWidth: '85%', fontSize: '14px' }}>
                      {isImage ? (
                        <img src={msg.content.replace('[IMAGE]:', '')} alt="Photo" style={{ maxWidth: '100%', borderRadius: '8px', maxHeight: '250px', display: 'block' }} />
                      ) : isVoice ? (
                        <audio controls src={msg.content.replace('[VOICE]:', '')} style={{ maxWidth: '200px', display: 'block' }} />
                      ) : (
                        <div>{msg.content}</div>
                      )}
                      <div style={{ fontSize: '10px', color: isMe ? '#93c5fd' : '#94a3b8', marginTop: '4px', textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                        <span>{time}</span>
                        {isMe && <span style={{ fontWeight: 'bold' }}>{msg.is_read ? '✓✓' : '✓'}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={(e) => { e.preventDefault(); sendMessage('text'); }} style={{ padding: '12px 10px', borderTop: '1px solid rgba(56, 189, 248, 0.15)', background: '#0b0f19', display: 'flex', gap: '6px', alignItems: 'center' }}>
              <label style={{ cursor: 'pointer', padding: '8px', background: '#1e293b', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
                📷
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
              </label>

              <button type="button" onClick={isRecording ? stopRecording : startRecording} style={{ padding: '8px', background: isRecording ? '#ef4444' : '#1e293b', border: 'none', borderRadius: '50%', color: '#fff', cursor: 'pointer', fontSize: '14px' }}>
                {isRecording ? '⏹️' : '🎙️'}
              </button>

              <input style={{ flex: 1, minWidth: 0, padding: '10px 14px', borderRadius: '24px', border: '1px solid rgba(56, 189, 248, 0.2)', background: '#030712', color: '#fff', outline: 'none', fontSize: '14px' }} placeholder={isRecording ? "Запись..." : "Сообщение..."} value={newMessage} onChange={(e) => setNewMessage(e.target.value)} disabled={isRecording} />
              <button type="submit" style={{ padding: '10px 16px', borderRadius: '24px', border: 'none', background: '#38bdf8', color: '#000', fontWeight: 'bold' }}>➔</button>
            </form>
          </>
        )}
      </div>

      <style jsx global>{`
        @media (min-width: 640px) {
          .sidebar { display: flex !important; width: 320px !important; }
          .chat-area { display: flex !important; }
        }
      `}</style>
    </div>
  );
}