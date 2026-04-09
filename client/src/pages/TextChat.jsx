import { useEffect, useRef, useState } from 'react';
import { useLocation, Navigate, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';

export default function TextChat() {
  const location = useLocation();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const { roomId, userData, partner } = location.state || {};

  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [peerDisconnected, setPeerDisconnected] = useState(false);
  const [inputText, setInputText] = useState('');

  const messagesEndRef = useRef(null);

  const userInit = userData?.name ? userData.name[0].toUpperCase() : 'Y';
  const strangerInit = partner?.name ? partner.name[0].toUpperCase() : 'S';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (!socket || !roomId) return;

    const handleReceiveMessage = (message) => {
      setMessages(prev => [...prev, { text: message, isSelf: false, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      setIsTyping(false);
    };

    const handleTypingStart = () => setIsTyping(true);
    const handleTypingStop = () => setIsTyping(false);

    const handlePeerDisconnected = () => {
      setPeerDisconnected(true);
      setIsTyping(false);
    };

    socket.on('receive-message', handleReceiveMessage);
    socket.on('typing-start', handleTypingStart);
    socket.on('typing-stop', handleTypingStop);
    socket.on('peer-disconnected', handlePeerDisconnected);

    return () => {
      socket.off('receive-message', handleReceiveMessage);
      socket.off('typing-start', handleTypingStart);
      socket.off('typing-stop', handleTypingStop);
      socket.off('peer-disconnected', handlePeerDisconnected);
    };
  }, [socket, roomId]);

  const handleSendMessage = () => {
    if (peerDisconnected || !inputText.trim()) return;

    const text = inputText.trim();
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setMessages(prev => [...prev, { text, isSelf: true, time }]);
    socket.emit('send-message', { roomId, message: text, timestamp: new Date() });
    socket.emit('typing-stop', roomId);
    setInputText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTyping = (e) => {
    if (peerDisconnected) return;
    setInputText(e.target.value);

    if (e.target.value.trim() !== '') {
      socket.emit('typing-start', roomId);
    } else {
      socket.emit('typing-stop', roomId);
    }
  };

  const nextChat = () => {
    navigate('/');
    window.location.reload();
  };

  const endChat = () => {
    navigate('/');
    window.location.reload();
  };

  const reportStranger = () => {
    alert('Report submitted. Thank you for keeping MeeCU safe.');
  }

  const blockStranger = () => {
    if (!window.confirm('Block this stranger?')) return;
    setPeerDisconnected(true);
    socket.emit('leave-room', roomId);
    setIsTyping(false);
  }

  if (!userData) {
    return <Navigate to="/" />;
  }

  return (
    <>
      <div className="liquid-bg-chat"></div>

      <div className="app-chat-shell">

        {/* HEADER */}
        <div className="chat-header">
          <div className="h-avatar">
            <span className="material-symbols-outlined"
              style={{ fontSize: '19px', color: 'rgba(255,140,140,0.75)', fontVariationSettings: "'FILL' 0,'wght' 300,'GRAD' 0,'opsz' 24" }}>
              person
            </span>
          </div>
          <div className="h-info">
            <div className="h-name">{partner?.name || 'Stranger'}</div>
            <div className="h-dept">{partner?.department || 'CUSAT'}</div>
          </div>
          <div className="live-pill">
            <div className="live-dot"></div>Live
          </div>
        </div>

        {/* MESSAGES */}
        <div className="messages-area">
          <div className="sys-msg ok">✓ Connected to a stranger</div>

          {peerDisconnected && (
            <div className="sys-msg err">Stranger disconnected.</div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className={`bubble-row ${msg.isSelf ? 'you' : 'stranger'}`}>
              <div className={`bav ${msg.isSelf ? 'y' : 's'}`}>
                {msg.isSelf ? userInit : strangerInit}
              </div>
              <div className="bcol">
                <div className={`bubble ${msg.isSelf ? 'y' : 's'}`}>{msg.text}</div>
                <div className="btime">{msg.time}</div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* TYPING INDICATOR */}
        <div className="typing-wrap">
          <div className={`typing-row ${isTyping ? 'show' : ''}`}>
            <div className="bav s">{strangerInit}</div>
            <div className="typing-bub">
              <div className="tdot"></div>
              <div className="tdot"></div>
              <div className="tdot"></div>
            </div>
            <span className="typing-label">Stranger is typing…</span>
          </div>
        </div>

        {/* INPUT BAR */}
        <div className="input-bar">
          <div className="controls">
            <button className="btn-next" onClick={nextChat}>
              <span className="material-symbols-outlined">skip_next</span>
              Next Chat
            </button>
            <button className="btn-ghost-chat" onClick={endChat}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>logout</span>
              End
            </button>
            <button className="btn-icon" title="Report" onClick={reportStranger}>
              <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>flag</span>
            </button>
            <button className="btn-icon" title="Block" onClick={blockStranger}>
              <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>block</span>
            </button>
          </div>

          <div className="input-row">
            <input
              type="text"
              value={inputText}
              onChange={handleTyping}
              onKeyDown={handleKeyDown}
              className="msg-input"
              placeholder={peerDisconnected ? "Chat ended..." : "Type a message…"}
              maxLength="500"
              autoComplete="off"
              autoCorrect="off"
              spellCheck="true"
              disabled={peerDisconnected}
            />
            <button
              className="send-btn"
              onClick={handleSendMessage}
              disabled={!inputText.trim() || peerDisconnected}
            >
              <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: '18px' }}>send</span>
            </button>
          </div>
        </div>

      </div>
    </>
  );
}
