'use client';
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const DEV_EMAIL = 'ggg12323u@gmail.com';

export default function Home() {
  const [session, setSession] = useState(null);
  const [myProfile, setMyProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('chats');
  
  // States
  const [editFullName, setEditFullName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [activeChat, setActiveChat] = useState(null);
  const [activeChatData, setActiveChatData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');

  // ... (Остальные стейты те же самые, что в предыдущей версии) ...
  const [loginInput, setLoginInput] = useState('');
  const [password, setPassword] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [myChats, setMyChats] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [editBirthdate, setEditBirthdate] = useState('');
  const [editCustomStatus, setEditCustomStatus] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async () => {
    if(!session) return;
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

  useEffect(() => { loadProfile(); }, [session]);

  const saveProfile = async () => {
    await supabase.from('profiles').update({ 
        full_name: editFullName, 
        username: editUsername, 
        birthdate: editBirthdate, 
        custom_status: editCustomStatus, 
        avatar_url: avatarUrl 
    }).eq('id', session.user.id);
    alert('Профиль обновлен');
    loadProfile();
  };

  const updateCommunity = async () => {
      await supabase.from('chats').update({ name: activeChatData.name, description: activeChatData.description }).eq('id', activeChat);
      alert('Данные обновлены');
      setShowAdminModal(false);
  };

  const addMember = async () => {
      const { data: user } = await supabase.from('profiles').select('id').eq('username', newMemberName).single();
      if (!user) { alert('Пользователь не найден'); return; }
      await supabase.from('chat_participants').insert({ chat_id: activeChat, user_id: user.id });
      setNewMemberName('');
      alert('Добавлен');
  };

  // --- Рендер (Вставил логику шапки с проверкой на DroJent) ---
  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', background: '#030712', fontFamily: 'system-ui, sans-serif', color: '#f8fafc', overflow: 'hidden' }}>
        {/* SIDEBAR (остается без изменений, только адаптирован) */}
        
        {/* CHAT AREA */}
        <div style={{ flex: 1, display: !activeChat ? 'none' : 'flex', flexDirection: 'column', height: '100%' }}>
            {activeChat && (
                <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(56, 189, 248, 0.15)', background: '#0b0f19', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                        <button onClick={() => { setActiveChat(null); }} style={{ padding: '6px', background: 'transparent', border: 'none', color: '#38bdf8' }}>←</button>
                        <h3 onClick={() => activeChatData?.owner_id === session.user.id && setShowAdminModal(true)} style={{ margin: 0, fontSize: '15px', color: '#38bdf8', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                            {activeChatData?.name} {activeChatData?.is_verified && '✅'}
                        </h3>
                    </div>
                </div>
            )}
            
            {/* АДМИН-ПАНЕЛЬ (Модалка) */}
            {showAdminModal && (
                <div style={{ position: 'fixed', inset:0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: '#0b0f19', padding: '20px', borderRadius: '15px', width: '300px', border: '1px solid #38bdf8' }}>
                        <input value={activeChatData.name} onChange={(e) => setActiveChatData({...activeChatData, name: e.target.value})} style={{ width: '100%', padding: '8px', marginBottom: '10px', background: '#030712', color: '#fff' }} />
                        <input value={newMemberName} onChange={(e) => setNewMemberName(e.target.value)} placeholder="Username для добавления" style={{ width: '100%', padding: '8px', marginBottom: '10px', background: '#030712', color: '#fff' }} />
                        <button onClick={addMember} style={{ width: '100%', padding: '8px', background: '#38bdf8' }}>Добавить участника</button>
                        <button onClick={updateCommunity} style={{ width: '100%', padding: '8px', marginTop: '10px', background: '#2563eb' }}>Сохранить</button>
                        <button onClick={() => setShowAdminModal(false)} style={{ width: '100%', padding: '8px', marginTop: '10px' }}>Закрыть</button>
                    </div>
                </div>
            )}

            {/* MESSAGE LIST */}
            <div ref={messagesContainerRef} style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {messages.map(m => (
                    <div key={m.id} style={{ alignSelf: m.sender_id === session.user.id ? 'flex-end' : 'flex-start', background: m.sender_id === session.user.id ? '#2563eb' : '#1e293b', padding: '10px', borderRadius: '12px' }}>
                        {m.content}
                    </div>
                ))}
            </div>

            {/* INPUT */}
            <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} style={{ padding: '10px', borderTop: '1px solid #1e293b', display: 'flex', flexShrink: 0 }}>
                <input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} style={{ flex: 1, background: 'transparent', color: '#fff', border: 'none', outline: 'none' }} placeholder="Сообщение..." />
                <button type="submit">➔</button>
            </form>
        </div>
    </div>
  );
}
