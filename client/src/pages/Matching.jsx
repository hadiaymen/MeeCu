import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';

export default function Matching() {
  const navigate = useNavigate();
  const location = useLocation();
  const { socket } = useSocket();
  const [status, setStatus] = useState('Finding someone from your campus…');
  const [onlineCount, setOnlineCount] = useState(247);

  const userData = location.state;
  // Stabilize userData reference so useEffect doesn't re-fire
  const userDataRef = useRef(userData);

  useEffect(() => {
    // Pulse online count
    const interval = setInterval(() => {
      setOnlineCount(prev => prev + (Math.random() > 0.5 ? 1 : -1));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!socket || !userDataRef.current) return;

    const currentUserData = userDataRef.current;

    const handleMatchFound = ({ roomId, partner }) => {
      setStatus('Match Found! Connecting…');
      setTimeout(() => {
        navigate('/chat', { 
          state: { 
            roomId,
            userData: currentUserData,
            partner
          },
          replace: true
        });
      }, 500);
    };

    socket.on('matched', handleMatchFound);

    // Join the queue — only runs once because socket is stable
    socket.emit('join_queue', currentUserData);

    return () => {
      socket.off('matched', handleMatchFound);
      // Tell the server to remove us from the waiting queue on unmount
      socket.emit('leave_queue', socket.id);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  if (!userData) {
    return <Navigate to="/" />;
  }

  const cancelSearch = () => {
    // Emit leave-queue before navigating so the server removes us immediately
    if (socket) socket.emit('leave-queue', socket.id);
    navigate('/');
  };

  return (
    <>
      <div className="liquid-bg-matching"></div>

      <nav className="relative z-10 flex items-center justify-between px-6 py-4 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <img src="/icon.png" className="app-logo" alt="MeeCu Logo" />
          <span style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.02em' }}>MeeCU</span>
        </div>
        <div className="mode-pill-matching">
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
            {userData.matchPreference === 'dept' ? 'school' : 'shuffle'}
          </span>
          {userData.matchPreference === 'dept' ? 'Same Dept' : 'Random Match'}
        </div>
      </nav>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 pb-8">
        
        <div className="glass-card w-full max-w-sm p-8 flex flex-col items-center text-center fade-in">

          <div className="orb-wrapper mb-8">
            <div className="orb-ring orb-ring-1"></div>
            <div className="orb-ring orb-ring-2"></div>
            <div className="orb-ring orb-ring-3"></div>
            <div className="orb-core">
              <span className="material-symbols-outlined orb-icon">person_search</span>
            </div>
          </div>

          <h2 style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2 }} className="mb-3">
            {status.split('from')[0]}<br />
            {status.includes('from') ? `from ${status.split('from')[1]}` : ''}
          </h2>

          <div className="status-line w-full mb-6">
            <span>
              {userData.matchPreference === 'dept' 
                ? `Searching in ${userData.department} department` 
                : 'Searching across all departments'}
            </span>
          </div>

          <div className="search-bar mb-8 w-full">
            <div className="search-fill"></div>
          </div>

          <div className="scan-dots mb-8">
            <div className="scan-dot"></div>
            <div className="scan-dot"></div>
            <div className="scan-dot"></div>
          </div>

          <div className="flex gap-6 mb-8" style={{ width: '100%' }}>
            <div className="flex-1 text-center" style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '16px', padding: '12px 8px', border: '1.5px solid rgba(255,255,255,0.07)' }}>
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-primary)' }}>{onlineCount}</div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#9CA3AF', letterSpacing: '0.04em', textTransform: 'uppercase', marginTop: '2px' }}>Online</div>
            </div>
            <div className="flex-1 text-center" style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '16px', padding: '12px 8px', border: '1.5px solid rgba(255,255,255,0.07)' }}>
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-secondary)' }}>~2s</div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#9CA3AF', letterSpacing: '0.04em', textTransform: 'uppercase', marginTop: '2px' }}>Avg Wait</div>
            </div>
            <div className="flex-1 text-center" style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '16px', padding: '12px 8px', border: '1.5px solid rgba(255,255,255,0.07)' }}>
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-tertiary)' }}>8</div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#9CA3AF', letterSpacing: '0.04em', textTransform: 'uppercase', marginTop: '2px' }}>Depts</div>
            </div>
          </div>

          <button className="btn-cancel w-full" onClick={cancelSearch}>
            Cancel Search
          </button>
        </div>
      </main>
    </>
  );
}
