import { io } from 'socket.io-client';
import React, { useEffect, useRef, useState, memo } from 'react';
import { useLocation, Navigate, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';

const MessageItem = memo(({ msg, userInit, strangerInit }) => (
  <div className={`bubble-row ${msg.isSelf ? 'you' : 'stranger'}`}>
    <div className={`bav ${msg.isSelf ? 'y' : 's'}`}>
      {msg.isSelf ? userInit : strangerInit}
    </div>
    <div className="bcol">
      <div className={`bubble ${msg.isSelf ? 'y' : 's'}`}>{msg.text}</div>
      <div className="btime">{msg.time}</div>
    </div>
  </div>
));
MessageItem.displayName = 'MessageItem';

export default function TextChat() {
  const location = useLocation();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const { roomId, userData, partner } = location.state || {};

  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [peerDisconnected, setPeerDisconnected] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [currentRoomId, setCurrentRoomId] = useState(roomId);
  const [currentPartner, setCurrentPartner] = useState(partner);
  
  const messagesEndRef = useRef(null);
  
  const userInit = userData?.name ? userData.name[0].toUpperCase() : 'Y';
  // Use state-based partner name for initials
  const strangerInit = currentPartner?.name ? currentPartner.name[0].toUpperCase() : 'S';

  const scrollToBottom = (behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    // For new messages, use smooth scroll
    scrollToBottom('smooth');
  }, [messages, isTyping]);
  
  useEffect(() => {
    // Initial scroll: instant
    scrollToBottom('auto');
  }, []);

  useEffect(() => {
    if (!socket) return;

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

    const handleMatched = ({ roomId: newRoomId, partner: newPartner }) => {
      setIsSearching(false);
      setPeerDisconnected(false);
      setMessages([]); // Reset messages on new match
      setCurrentRoomId(newRoomId);
      setCurrentPartner(newPartner);
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('typing-start', handleTypingStart);
    socket.on('typing-stop', handleTypingStop);
    socket.on('user_disconnected', handlePeerDisconnected);
    socket.on('matched', handleMatched);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('typing-start', handleTypingStart);
      socket.off('typing-stop', handleTypingStop);
      socket.off('user_disconnected', handlePeerDisconnected);
      socket.off('matched', handleMatched);
    };
  }, [socket]);

  const handleSendMessage = () => {
    if (peerDisconnected || isSearching || !inputText.trim()) return;
    
    const text = inputText.trim();
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    setMessages(prev => [...prev, { text, isSelf: true, time }]);
    socket.emit('send_message', { roomId: currentRoomId, message: text, timestamp: new Date() });
    socket.emit('typing-stop', currentRoomId);
    setInputText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTyping = (e) => {
    if (peerDisconnected || isSearching) return;
    setInputText(e.target.value);
    
    if (e.target.value.trim() !== '') {
      socket.emit('typing-start', currentRoomId);
    } else {
      socket.emit('typing-stop', currentRoomId);
    }
  };

  const nextChat = () => {
    if (isSearching) return;
    setIsSearching(true);
    setPeerDisconnected(false);
    setMessages([]);
    setIsTyping(false);
    socket.emit('next_user', userData);
  };

  const endChat = () => {
    navigate('/');
    // No reload needed if we handle state well, but keeping it simple for "End"
    window.location.reload(); 
  };
  
  const reportStranger = () => {
    alert('Report submitted. Thank you for keeping MeeCU safe.');
  }
  
  const blockStranger = () => {
    if (!window.confirm('Block this stranger?')) return;
    setPeerDisconnected(true);
    socket.emit('next_user', userData); // Basically skips them
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
            <div className="h-name">{isSearching ? 'Finding Match...' : (currentPartner?.name || 'Stranger')}</div>
            <div className="h-dept">{isSearching ? 'Searching Campus' : (currentPartner?.department || 'CUSAT')}</div>
          </div>
          <div className="live-pill">
            <div className="live-dot"></div>Live
          </div>
        </div>

        {/* MESSAGES */}
        <div className="messages-area">
          {isSearching ? (
            <div className="sys-msg ok">Searching for a new stranger...</div>
          ) : (
            <>
              {!peerDisconnected && <div className="sys-msg ok">✓ Connected to a stranger</div>}
              {peerDisconnected && <div className="sys-msg err">Stranger disconnected.</div>}
            </>
          )}

          {messages.map((msg, idx) => (
            <MessageItem 
              key={idx} 
              msg={msg} 
              userInit={userInit} 
              strangerInit={strangerInit} 
            />
          ))}
          <div ref={messagesEndRef} style={{ height: '1px' }} />
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
            <button className="btn-next" onClick={nextChat} disabled={isSearching}>
              <span className="material-symbols-outlined">{isSearching ? 'sync' : 'skip_next'}</span>
              {isSearching ? 'Searching...' : 'Next Chat'}
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
              placeholder={isSearching ? "Searching..." : (peerDisconnected ? "Chat ended..." : "Type a message…")}
              maxLength="500" 
              autoComplete="off" 
              autoCorrect="off" 
              spellCheck="true"
              disabled={peerDisconnected || isSearching}
            />
            <button 
              className="send-btn" 
              onClick={handleSendMessage}
              disabled={!inputText.trim() || peerDisconnected || isSearching}
            >
              <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: '18px' }}>send</span>
            </button>
          </div>
        </div>

      </div>
    </>
  );
}
