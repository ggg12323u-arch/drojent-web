'use client';
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const DEV_EMAIL = 'ggg12323u@gmail.com';
const THEMES = {
  blue: { primary: '#38bdf8', secondary: '#2563eb', bg: '#030712', border: '#1e293b' },
  green: { primary: '#22c55e', secondary: '#16a34a', bg: '#022c22', border: '#064e3b' },
  purple: { primary: '#c084fc', secondary: '#9333ea', bg: '#2e1065', border: '#581c87' }
};

export default function DroJentMessenger() {
  const [session, setSession] = useState(null);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [themeKey, setThemeKey] = useState('blue');
  const [activeTab, setActiveTab] = useState('chats');
  const [myProfile, setMyProfile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const theme = THEMES[themeKey];
  const scrollRef = useRef(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => setSession(s));
    supabase.auth.onAuthStateChange((_e, s) => setSession(s));
  }, []);

  useEffect(() => {
    if (!activeChat) return;
    const fetchMsgs = async () => {
      const { data } = await supabase.from('messages').select('*').eq('chat_id', activeChat).order('created_at', { ascending: true });
      if (data) {
        setMessages(data);
        setTimeout(() => scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight), 100);
      }
    };
    fetchMsgs();
    const chan = supabase.channel('chat_updates').on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `chat_id=eq.${activeChat}` }, fetchMsgs).subscribe();
    return () => supabase.removeChannel(chan);
  }, [activeChat]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeChat) return;
    const msg = newMessage;
    setNewMessage('');
    await supabase.from('messages').insert([{ chat_id: activeChat, sender_id: session.user.id, content: msg, is_read: false }]);
  };

  const uploadMedia = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const name = `${type}_${Date.now()}.${file.name.split('.').pop()}`;
    const { error } = await supabase.storage.from('media').upload(name, file);
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(name);
      if (type === 'img') await supabase.from('messages').insert([{ chat_id: activeChat, sender_id: session.user.id, content: `[IMAGE]:${publicUrl}`, is_read: false }]);
    }
  };

  if (!session) return (
    <div style={{ height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background: theme.bg, color:'#fff' }}>
      <div style={{ padding: '30px', background: '#0b0f19', borderRadius: '20px', width: '320px', border: `1px solid ${theme.primary}` }}>
        <h2 style={{ textAlign: 'center', color: theme.primary }}>DroJent 👑</h2>
        <input style={{ width:'100%', marginBottom:'10px', padding:'12px', background:'#000', color:'#fff', border:'none', borderRadius:'10px' }} placeholder="Email" id="email" />
        <input style={{ width:'100%', marginBottom:'15px', padding:'12px', background:'#000', color:'#fff', border:'none', borderRadius:'10px' }} type="password" placeholder="Пароль" id="pass" />
        <button style={{ width:'100%', padding:'12px', background: theme.primary, border:'none', borderRadius:'10px', fontWeight:'bold', cursor:'pointer' }} onClick={() => supabase.auth.signInWithPassword({ email: document.getElementById('email').value, password: document.getElementById('pass').value })}>Войти</button>
      </div>
    </div>
  );

  return (
    <div style={{ height: '100vh', display: 'flex', background: theme.bg, color: '#fff', overflow: 'hidden' }}>
      {/* Sidebar */}
      <div style={{ width: activeChat ? '0px' : '100%', display: activeChat ? 'none' : 'flex', flexDirection: 'column', borderRight: `1px solid ${theme.border}` }}>
         <div style={{ padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, color: theme.primary }}>DroJent</h3>
            <button onClick={() => supabase.auth.signOut()} style={{ background: 'transparent', color: '#f87171', border: 'none' }}>Выход</button>
         </div>
         <div style={{ flex: 1, overflowY: 'auto' }}>
            <div style={{ padding: '10px' }}>
                {/* Здесь будет список чатов */}
                <button onClick={() => setActiveChat('example-id')} style={{ width: '100%', padding: '15px', background: '#1e293b', border: 'none', color: '#fff', borderRadius: '10px', textAlign: 'left' }}>
                    Пример чата
                </button>
            </div>
         </div>
         <div style={{ padding: '10px', borderTop: `1px solid ${theme.border}` }}>
            <button onClick={() => setThemeKey(themeKey === 'blue' ? 'green' : themeKey === 'green' ? 'purple' : 'blue')} style={{ width: '100%', padding: '10px', background: theme.primary, border: 'none', borderRadius: '10px' }}>Сменить тему</button>
         </div>
      </div>

      {/* Chat Area */}
      <div style={{ flex: activeChat ? 1 : 0, display: activeChat ? 'flex' : 'none', flexDirection: 'column', background: theme.bg }}>
        <div style={{ padding: '15px', borderBottom: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center' }}>
            <button onClick={() => setActiveChat(null)} style={{ background:'transparent', border:'none', color: theme.primary, fontSize: '20px' }}>←</button>
            <h3 style={{ margin: '0 15px', color: theme.primary }}>Чат</h3>
        </div>
        
        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {messages.map(m => (
                <div key={m.id} style={{ 
                    alignSelf: m.sender_id === session.user.id ? 'flex-end' : 'flex-start', 
                    background: m.sender_id === session.user.id ? theme.secondary : '#1e293b', 
                    padding: '10px 15px', 
                    borderRadius: '15px',
                    position: 'relative',
                    paddingBottom: '20px' 
                }}>
                    {m.content.startsWith('[IMAGE]:') ? <img src={m.content.replace('[IMAGE]:','')} style={{maxWidth:'200px', borderRadius:'10px'}} alt="img"/> : m.content}
                    {/* Статус: Круг (отправлено) / Круг с точкой (прочитано) */}
                    <div style={{ position: 'absolute', bottom: '2px', right: '5px', fontSize: '10px' }}>
                        {m.sender_id === session.user.id && (m.is_read ? '◉' : '○')}
                    </div>
                </div>
            ))}
        </div>

        <div style={{ padding: '10px', display: 'flex', gap: '10px', borderTop: `1px solid ${theme.border}` }}>
            <label style={{ cursor:'pointer', padding:'10px' }}>📷<input type="file" onChange={(e) => uploadMedia(e, 'img')} style={{display:'none'}}/></label>
            <input 
                style={{ flex:1, background: '#000', color:'#fff', border: `1px solid ${theme.border}`, padding:'12px', borderRadius:'20px', outline:'none' }} 
                value={newMessage} 
                onChange={e => { setNewMessage(e.target.value); setIsTyping(true); setTimeout(()=>setIsTyping(false), 2000); }} 
                placeholder="Сообщение..." 
            />
            <button onClick={sendMessage} style={{ padding:'10px 20px', background: theme.primary, border:'none', borderRadius:'20px' }}><Icons.Send /></button>
        </div>
      </div>
    </div>
  );
}
