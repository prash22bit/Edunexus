import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { MdMessage, MdSend } from 'react-icons/md';

export default function MessagesPage() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchContacts = async () => {
    try { 
      const { data } = await API.get('/messages/contacts'); 
      setContacts(data.contacts || []); 
    } catch {}
  };

  const fetchUsers = async () => {
    try {
      const { data } = await API.get('/messages/users');
      setAllUsers(data.filter(u => u._id !== user._id));
    } catch {}
  };

  useEffect(() => { 
    fetchContacts(); 
    fetchUsers(); 
  }, []);

  const fetchConversation = async (contact) => {
    setSelected(contact);
    try { 
      const { data } = await API.get(`/messages/${contact._id}`); 
      setMessages(data); 
    } catch {}
  };

  // Poll for new messages every 3 seconds
  useEffect(() => {
    if (!selected) return;
    const interval = setInterval(async () => {
      try {
        const { data } = await API.get(`/messages/${selected._id}`);
        setMessages(data);
        fetchContacts();
      } catch {}
    }, 3000);
    return () => clearInterval(interval);
  }, [selected]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async e => {
    e.preventDefault();
    if (!text.trim() || !selected) return;
    try {
      const { data } = await API.post('/messages', { receiverId: selected._id, content: text });
      setMessages(prev => [...prev, data]);
      setText('');
      setContacts(prev => {
        if (!prev.find(c => c._id === selected._id)) {
          return [selected, ...prev];
        }
        return prev;
      });
    } catch { 
      toast.error('Failed to send message'); 
    }
  };

  const formatTime = d => new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const startNewChat = (u) => {
    setShowNewChat(false);
    if (!contacts.find(c => c._id === u._id)) {
      setContacts(prev => [u, ...prev]);
    }
    fetchConversation(u);
  };

  return (
    <>
      <div className="page-header">
        <h2>Messages</h2>
        <p>Direct messaging with your instructors and students</p>
      </div>
      <div className="page-content">
        <div className="chat-container">
          {/* Contacts sidebar */}
          <div className="chat-contacts">
            <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Conversations</span>
              <button className="btn btn-primary btn-sm" onClick={() => setShowNewChat(true)}>+ New</button>
            </div>
            {contacts.length === 0 && <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No conversations yet. Start a new chat!</div>}
            {contacts.map(c => (
              <div key={c._id}
                onClick={() => fetchConversation(c)}
                style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid var(--border)', background: selected?._id === c._id ? 'rgba(99,102,241,0.1)' : 'transparent', display: 'flex', alignItems: 'center', gap: 12, transition: 'background 0.2s' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>
                  {c.name ? c.name[0].toUpperCase() : 'U'}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{c.role}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Chat window */}
          <div className="chat-window">
            {!selected ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, color: 'var(--text-muted)' }}>
                <MdMessage style={{ fontSize: '4rem', opacity: 0.2 }} />
                <p>Select a conversation to start messaging</p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                    {selected.name ? selected.name[0].toUpperCase() : 'U'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700 }}>{selected.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{selected.role}</div>
                  </div>
                </div>

                {/* Messages */}
                <div className="chat-messages">
                  {messages.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 20 }}>No messages yet. Say hello! 👋</p>}
                  {messages.map(m => {
                    const senderId = m.sender?._id || m.sender;
                    const mine = senderId === user._id;
                    return (
                      <div key={m._id} className={`chat-bubble ${mine ? 'mine' : 'theirs'}`}>
                        {m.content}
                        <time>{formatTime(m.createdAt)}</time>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form className="chat-input-bar" onSubmit={handleSend}>
                  <input className="form-control" style={{ flex: 1 }} placeholder={`Message ${selected.name}...`} value={text} onChange={e => setText(e.target.value)} />
                  <button type="submit" className="btn btn-primary" style={{ padding: '10px 16px' }}><MdSend /></button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>

      {showNewChat && (
        <div className="modal-overlay" onClick={() => setShowNewChat(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>New Conversation</h3><button className="modal-close" onClick={() => setShowNewChat(false)}>×</button></div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 16 }}>Select a user to start a conversation</p>
            {allUsers.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No users available</p>}
            {allUsers.map(u => (
              <div key={u._id} onClick={() => startNewChat(u)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>{u.name ? u.name[0].toUpperCase() : 'U'}</div>
                <div>
                  <div style={{ fontWeight: 600 }}>{u.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email} · <span className={`role-badge role-${u.role}`}>{u.role}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

