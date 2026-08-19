'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Подключаем Supabase
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

  // 1. Проверяем авторизацию
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Загружаем сообщения и подключаем Realtime
  useEffect(() => {
    if (!session) return;

    // Загрузить старые сообщения
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*, profiles(username)')
        .order('created_at', { ascending: true });
      if (data) setMessages(data);
    };

    fetchMessages();

    // Слушать новые сообщения онлайн
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

  // Регистрация / Вход
  const handleAuth = async (type) => {
    if (type === 'signup') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username } }
      });
      if (error) alert(error.message);
      else alert('Регистрация успешна!');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert(error.message);
    }
  };

  // Отправка сообщения
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // Берем дефолтный чат или создаем/используем первый
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
      <div style={{ maxWidth: '400px', margin: '50px auto', fontFamily: 'sans-serif', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2>Вход в DroJent</h2>
        <input style={{ width: '100%', marginBottom: '10px', padding: '8px', boxSizing: 'border-box' }} placeholder="Имя пользователя (при регистрации)" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input style={{ width: '100%', marginBottom: '10px', padding: '8px', boxSizing: 'border-box' }} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input style={{ width: '100%', marginBottom: '10px', padding: '8px', boxSizing: 'border-box' }} type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} />
        <div style={{ display: 'flex', gap: '10px' }}>
          <button style={{ flex: 1, padding: '10px' }} onClick={() => handleAuth('login')}>Войти</button>
          <button style={{ flex: 1, padding: '10px' }} onClick={() => handleAuth('signup')}>Регистрация</button>
        </div>
      </div>
    );
  }

  // Экран чата
  return (
    <div style={{ maxWidth: '600px', margin: '20px auto', fontFamily: 'sans-serif', border: '1px solid #ccc', borderRadius: '8px', height: '80vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '10px 20px', background: '#f0f0f0', borderBottom: '1px solid #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>Общий чат DroJent</h3>
        <button onClick={() => supabase.auth.signOut()}>Выйти</button>
      </div>

      <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{ marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8em', color: '#888', display: 'block' }}>{new Date(msg.created_at).toLocaleTimeString()}</span>
            <div style={{ background: msg.sender_id === session.user.id ? '#e3f2fd' : '#f5f5f5', padding: '8px 12px', borderRadius: '6px', display: 'inline-block', maxWidth: '80%' }}>
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={sendMessage} style={{ display: 'flex', padding: '10px', borderTop: '1px solid #ccc' }}>
        <input style={{ flex: 1, padding: '10px', marginRight: '10px' }} placeholder="Напишите сообщение..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
        <button type="submit" style={{ padding: '10px 20px' }}>Отправить</button>
      </form>
    </div>
  );
}
