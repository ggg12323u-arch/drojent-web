'use client';

import { useState, useEffect } from 'react';
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
  const [activeChat, setActiveChat] = useState(null);
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;

    const searchUsers = async () => {
      if (!searchQuery.trim()) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .neq('id', session.user.id)
          .limit(10);
        if (data) setSearchResults(data);
        return;
      }

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', session.user.id)
        .ilike('username', `%${searchQuery}%`);

      if (data) setSearchResults(data);
    };

    const timer = setTimeout(searchUsers, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, session]);

  useEffect(() => {
    if (!activeChat) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*, profiles(username)')
        .eq('chat_id', activeChat)
        .order('created_at', { ascending: true });
      if (data) setMessages(data);
    };

    fetchMessages();

    const channel = supabase
      .channel(`chat:${activeChat}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `chat_id=eq.${activeChat}`
      }, (payload) => {
        setMessages((prev) => [...prev, payload.new]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeChat]);

  const startChatWithUser = async (targetUser) => {
    setActiveUser(targetUser);
    
    const { data: myChats } = await supabase
      .from('chat_participants')
      .select('chat_id')
      .eq('user_id', session.user.id);

    const myChatIds = myChats?.map(c => c.chat_id) || [];

    if (myChatIds.length > 0) {
      const { data: commonChat } = await supabase
        .from('chat_participants')
        .select('chat_id')
        .eq('user_id', targetUser.id)
        .in('chat_id', myChatIds)
        .limit(1);

      if (commonChat && commonChat.length > 0) {
        setActiveChat(commonChat[0].chat_id);
        return;
      }
    }

    const { data: newChat } = await supabase.from('chats').insert([{}]).select().single();
    if (newChat) {
      await supabase.from('chat_participants').insert([
        { chat_id: newChat.id, user_id: session.user.id },
        { chat_id: newChat.id, user_id: targetUser.id }
      ]);
      setActiveChat(newChat.id);
    }
  };

  const handleAuth = async (type) => {
    setLoading(true);
    if (type === 'signup') {
      if (!username.trim()) {
        alert('Укажите Username!');
        setLoading(false);
        return;
      }
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username } }
      });
      if (error) alert(error.message);
      else alert('Регистрация успешна! Нажми "Войти"');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert(error.message);
    }
    setLoading(false);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    await supabase.from('messages').insert([
      {
        chat_id: activeChat,
        sender_id: session.user.id,
        content: newMessage,
      },
    ]);

    setNewMessage('');
  };

  // Экран логина
  if (!session) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#030712',
        fontFamily: 'system-ui, sans-serif',
        padding: '16px',
        boxSizing: 'border-box'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '380px',
          padding: '32px 24px',
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(12px)',
          borderRadius: '20px',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          boxShadow: '0 0 25px rgba(56, 189, 248, 0.15)',
          color: '#f8fafc'
        }}>
          <h2 style={{
            margin: '0 0 8px 0',
            textAlign: 'center',
            fontSize: '28px',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #38bdf8 0%, #3b82f6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 10px rgba(56,189,248,0.5))'
          }}>DroJent</h2>
          <p style={{ margin: '0 0 24px 0', color: '#94a3b8', fontSize: '13px', textAlign: 'center' }}>Neon Cyber Messenger</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input 
              style={{
                padding: '12px 16px',
                borderRadius: '10px',
                border: '1px solid rgba(56, 189, 248, 0.2)',
                background: '#0b0f19',
                color: '#fff',
                outline: 'none',
                fontSize: '14px'
              }} 
              placeholder="Username (для регистрации)" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
            />
            <input 
              style={{
                padding: '12px 16px',
                borderRadius: '10px',
                border: '1px solid rgba(56, 189, 248, 0.2)',
                background: '#0b0f19',
                color: '#fff',
                outline: 'none',
                fontSize: '14px'
              }} 
              type="email" 
              placeholder="Email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
            <input 
              style={{
                padding: '12px 16px',
                borderRadius: '10px',
                border: '1px solid rgba(56, 189, 248, 0.2)',
                background: '#0b0f19',
                color: '#fff',
                outline: 'none',
                fontSize: '14px'
              }} 
              type="password" 
              placeholder="Пароль" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button 
                disabled={loading} 
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                  color: '#fff',
                  fontWeight: 'bold',
                  boxShadow: '0 0 15px rgba(37, 99, 235, 0.4)',
                  cursor: 'pointer'
                }} 
                onClick={() => handleAuth('login')}
              >
                Войти
              </button>
              <button 
                disabled={loading} 
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid rgba(56, 189, 248, 0.4)',
                  background: 'transparent',
                  color: '#38bdf8',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }} 
                onClick={() => handleAuth('signup')}
              >
                Регистрация
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      display: 'flex',
      background: '#030712',
      fontFamily: 'system-ui, sans-serif',
      color: '#f8fafc',
      overflow: 'hidden'
    }}>
      {/* Левая панель (Контакты) */}
      <div style={{
        width: activeChat ? '320px' : '100%',
        maxWidth: '100%',
        display: activeChat ? 'none' : 'flex',
        flexDirection: 'column',
        borderRight: '1px solid rgba(56, 189, 248, 0.15)',
        background: '#0b0f19',
        height: '100%'
      }} className="sidebar">
        
        <div style={{
          padding: '16px',
          borderBottom: '1px solid rgba(56, 189, 248, 0.15)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{
            margin: 0,
            fontSize: '20px',
            fontWeight: '800',
            color: '#38bdf8',
            textShadow: '0 0 10px rgba(56, 189, 248, 0.5)'
          }}>DroJent</h3>
          <button 
            onClick={() => supabase.auth.signOut()} 
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              background: 'transparent',
              color: '#f87171',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Выйти
          </button>
        </div>

        <div style={{ padding: '12px', borderBottom: '1px solid rgba(56, 189, 248, 0.1)' }}>
          <input 
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '10px',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              background: '#030712',
              color: '#fff',
              fontSize: '13px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
            placeholder="🔍 Поиск по @username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {searchResults.length === 0 ? (
            <div style={{ padding: '20px', color: '#64748b', fontSize: '13px', textAlign: 'center' }}>Пользователи не найдены</div>
          ) : (
            searchResults.map((u) => (
              <div 
                key={u.id} 
                onClick={() => startChatWithUser(u)}
                style={{
                  padding: '14px 16px',
                  borderBottom: '1px solid rgba(255,255,255,0.03)',
                  cursor: 'pointer',
                  background: activeUser?.id === u.id ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  boxShadow: '0 0 10px rgba(56,189,248,0.3)'
                }}>
                  {u.username?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '14px', color: '#f1f5f9' }}>@{u.username || 'user'}</div>
                  <div style={{ fontSize: '12px', color: '#38bdf8' }}>Открыть чат</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Правая панель (Чат) */}
      <div style={{
        flex: 1,
        display: !activeChat ? 'none' : 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#030712'
      }} className="chat-area">
        {activeChat ? (
          <>
            <div style={{
              padding: '14px 16px',
              borderBottom: '1px solid rgba(56, 189, 248, 0.15)',
              background: '#0b0f19',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <button 
                onClick={() => { setActiveChat(null); setActiveUser(null); }}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  background: 'transparent',
                  color: '#38bdf8',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                ← Назад
              </button>
              <h3 style={{ margin: 0, fontSize: '16px', color: '#38bdf8' }}>Чат с @{activeUser?.username || 'пользователем'}</h3>
            </div>

            <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {messages.map((msg) => {
                const isMe = msg.sender_id === session.user.id;
                return (
                  <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      background: isMe ? 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)' : '#1e293b',
                      color: '#fff',
                      padding: '10px 14px',
                      borderRadius: isMe ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                      maxWidth: '80%',
                      fontSize: '14px',
                      boxShadow: isMe ? '0 0 12px rgba(37, 99, 235, 0.3)' : 'none',
                      border: isMe ? 'none' : '1px solid rgba(255,255,255,0.05)'
                    }}>
                      {msg.content}
                    </div>
                  </div>
                );
              })}
            </div>

            <form onSubmit={sendMessage} style={{
              padding: '12px 16px',
              borderTop: '1px solid rgba(56, 189, 248, 0.15)',
              background: '#0b0f19',
              display: 'flex',
              gap: '10px'
            }}>
              <input 
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: '24px',
                  border: '1px solid rgba(56, 189, 248, 0.2)',
                  background: '#030712',
                  color: '#fff',
                  outline: 'none',
                  fontSize: '14px'
                }} 
                placeholder="Написать сообщение..." 
                value={newMessage} 
                onChange={(e) => setNewMessage(e.target.value)} 
              />
              <button 
                type="submit" 
                style={{
                  padding: '12px 20px',
                  borderRadius: '24px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #38bdf8 0%, #2563eb 100%)',
                  color: '#fff',
                  fontWeight: 'bold',
                  boxShadow: '0 0 10px rgba(56, 189, 248, 0.4)',
                  cursor: 'pointer'
                }}
              >
                ➔
              </button>
            </form>
          </>
        ) : null}
      </div>

      <style jsx global>{`
        @media (min-width: 640px) {
          .sidebar {
            display: flex !important;
            width: 320px !important;
          }
          .chat-area {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
}