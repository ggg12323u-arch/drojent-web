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
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*, profiles(username)')
        .order('created_at', { ascending: true });
      if (data) setMessages(data);
    };

    fetchMessages();

    const channel = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        setMessages((prev) => [...prev, payload.new]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);

  const handleAuth = async (type) => {
    setLoading(true);
    if (type === 'signup') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username: username || email.split('@')[0] } }
      });
      if (error) alert(error.message);
      else alert('Регистрация успешна! Теперь нажми "Войти"');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert(error.message);
    }
    setLoading(false);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const { data: chats } = await supabase.from('chats').select('id').limit(1);
    let chatId = chats?.[0]?.id;

    if (!chatId) {
      const { data: newChat } = await supabase.from('chats').insert([{}]).select().single();
      chatId = newChat.id;
    }

    await supabase.from('messages').insert([
      {
        chat_id: chatId,
        sender_id: session.user.id,
        content: newMessage,
      },
    ]);

    setNewMessage('');
  };

  // Экран входа
  if (!session) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0f172a',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#f8fafc'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '400px',
          padding: '32px',
          background: '#1e293b',
          borderRadius: '16px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
          border: '1px solid #334155'
        }}>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '600', textAlign: 'center' }}>DroJent</h2>
          <p style={{ margin: '0 0 24px 0', color: '#94a3b8', fontSize: '14px', textAlign: 'center' }}>Вход в веб-мессенджер</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input 
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid #334155',
                background: '#0f172a',
                color: '#fff',
                fontSize: '14px',
                outline: 'none'
              }} 
              placeholder="Имя пользователя (для регистрации)" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
            />
            <input 
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid #334155',
                background: '#0f172a',
                color: '#fff',
                fontSize: '14px',
                outline: 'none'
              }} 
              type="email" 
              placeholder="Email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
            <input 
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid #334155',
                background: '#0f172a',
                color: '#fff',
                fontSize: '14px',
                outline: 'none'
              }} 
              type="password" 
              placeholder="Пароль" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />

            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button 
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#3b82f6',
                  color: '#fff',
                  fontWeight: '600',
                  cursor: 'pointer',
                  opacity: loading ? 0.7 : 1
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
                  borderRadius: '8px',
                  border: '1px solid #334155',
                  background: 'transparent',
                  color: '#f8fafc',
                  fontWeight: '600',
                  cursor: 'pointer',
                  opacity: loading ? 0.7 : 1
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

  // Экран чата
  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      background: '#0f172a',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#f8fafc'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '800px',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#1e293b',
        borderLeft: '1px solid #334155',
        borderRight: '1px solid #334155'
      }}>
        {/* Шапка */}
        <div style={{
          padding: '16px 24px',
          background: '#0f172a',
          borderBottom: '1px solid #334155',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px' }}>Общий чат DroJent</h3>
            <span style={{ fontSize: '12px', color: '#10b981' }}>online</span>
          </div>
          <button 
            onClick={() => supabase.auth.signOut()}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              border: '1px solid #334155',
              background: '#1e293b',
              color: '#94a3b8',
              cursor: 'pointer',
              fontSize: '13px'
            }}
          >
            Выйти
          </button>
        </div>

        {/* Список сообщений */}
        <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {messages.map((msg) => {
            const isMe = msg.sender_id === session.user.id;
            return (
              <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                <span style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px', paddingLeft: '4px', paddingRight: '4px' }}>
                  {msg.profiles?.username || 'Пользователь'} • {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <div style={{
                  background: isMe ? '#2563eb' : '#334155',
                  color: '#fff',
                  padding: '10px 14px',
                  borderRadius: isMe ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                  maxWidth: '70%',
                  wordBreak: 'break-word',
                  fontSize: '14px',
                  lineHeight: '1.4'
                }}>
                  {msg.content}
                </div>
              </div>
            );
          })}
        </div>

        {/* Форма отправки */}
        <form onSubmit={sendMessage} style={{ padding: '16px', borderTop: '1px solid #334155', background: '#0f172a', display: 'flex', gap: '12px' }}>
          <input 
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: '24px',
              border: '1px solid #334155',
              background: '#1e293b',
              color: '#fff',
              fontSize: '14px',
              outline: 'none'
            }} 
            placeholder="Напишите сообщение..." 
            value={newMessage} 
            onChange={(e) => setNewMessage(e.target.value)} 
          />
          <button 
            type="submit" 
            style={{
              padding: '12px 24px',
              borderRadius: '24px',
              border: 'none',
              background: '#3b82f6',
              color: '#fff',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Отправить
          </button>
        </form>
      </div>
    </div>
  );
}
