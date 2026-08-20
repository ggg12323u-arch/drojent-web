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

  // Поиск пользователей по username
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

  // Загрузка сообщений и Realtime
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

  // Открыть или создать чат
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
        alert('Укажите Username при регистрации!');
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

  if (!session) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', fontFamily: 'system-ui, sans-serif', color: '#f8fafc' }}>
        <div style={{ width: '100%', maxWidth: '380px', padding: '28px', background: '#1e293b', borderRadius: '16px', border: '1px solid #334155' }}>
          <h2 style={{ margin: '0 0 8px 0', textAlign: 'center' }}>DroJent</h2>
          <p style={{ margin: '0 0 20px 0', color: '#94a3b8', fontSize: '14px', textAlign: 'center' }}>Вход и регистрация</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input 
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} 
              placeholder="Username (для регистрации)" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
            />
            <input 
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} 
              type="email" 
              placeholder="Email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
            <input 
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} 
              type="password" 
              placeholder="Пароль" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
              <button disabled={loading} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: '#3b82f6', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => handleAuth('login')}>Войти</button>
              <button disabled={loading} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #334155', background: 'transparent', color: '#fff', cursor: 'pointer' }} onClick={() => handleAuth('signup')}>Регистрация</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', display: 'flex', background: '#0f172a', fontFamily: 'system-ui, sans-serif', color: '#f8fafc' }}>
      <div style={{ width: '320px', borderRight: '1px solid #334155', background: '#1e293b', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '18px' }}>DroJent</h3>
          <button onClick={() => supabase.auth.signOut()} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #334155', background: '#0f172a', color: '#94a3b8', fontSize: '12px', cursor: 'pointer' }}>Выйти</button>
        </div>

        <div style={{ padding: '12px', borderBottom: '1px solid #334155' }}>
          <input 
            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
            placeholder="🔍 Поиск по @username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {searchResults.length === 0 ? (
            <div style={{ padding: '16px', color: '#64748b', fontSize: '13px', textAlign: 'center' }}>Никого не найдено</div>
          ) : (
            searchResults.map((u) => (
              <div 
                key={u.id} 
                onClick={() => startChatWithUser(u)}
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid #1e293b',
                  cursor: 'pointer',
                  background: activeUser?.id === u.id ? '#334155' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                  {u.username?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '14px' }}>@{u.username || 'user'}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>Открыть диалог</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {activeChat ? (
          <>
            <div style={{ padding: '16px', borderBottom: '1px solid #334155', background: '#1e293b' }}>
              <h3 style={{ margin: 0, fontSize: '16px' }}>Чат с @{activeUser?.username || 'пользователем'}</h3>
            </div>

            <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {messages.map((msg) => {
                const isMe = msg.sender_id === session.user.id;
                return (
                  <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      background: isMe ? '#2563eb' : '#334155',
                      color: '#fff',
                      padding: '10px 14px',
                      borderRadius: isMe ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                      maxWidth: '65%',
                      fontSize: '14px'
                    }}>
                      {msg.content}
                    </div>
                  </div>
                );
              })}
            </div>

            <form onSubmit={sendMessage} style={{ padding: '16px', borderTop: '1px solid #334155', background: '#1e293b', display: 'flex', gap: '10px' }}>
              <input 
                style={{ flex: 1, padding: '12px 16px', borderRadius: '24px', border: '1px solid #334155', background: '#0f172a', color: '#fff', outline: 'none' }} 
                placeholder="Написать сообщение..." 
                value={newMessage} 
                onChange={(e) => setNewMessage(e.target.value)} 
              />
              <button type="submit" style={{ padding: '12px 20px', borderRadius: '24px', border: 'none', background: '#3b82f6', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>Отправить</button>
            </form>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
            Найдите пользователя слева через поиск, чтобы открыть приватный чат
          </div>
        )}
      </div>
    </div>
  );
}