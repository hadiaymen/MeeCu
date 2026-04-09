import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DEPARTMENTS = [
  { value: 'CS', label: 'Computer Science' },
  { value: 'ECE', label: 'Electronics & Communication' },
  { value: 'ME', label: 'Mechanical Engineering' },
  { value: 'CE', label: 'Civil Engineering' },
  { value: 'EEE', label: 'Electrical Engineering' },
  { value: 'MBA', label: 'Management Studies' },
  { value: 'MCA', label: 'Computer Applications' },
  { value: 'Other', label: 'Other' }
];

export default function Landing() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [matchPreference, setMatchPreference] = useState('random'); // 'dept' or 'random'
  const [onlineCount, setOnlineCount] = useState(247);
  const [nameError, setNameError] = useState(false);
  const [deptError, setDeptError] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    // PWA Install Prompt Listener
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });

    // Randomize online count slightly
    const base = 241;
    setOnlineCount(base + Math.floor(Math.random() * 20 - 5));
    
    // Update it periodically
    const interval = setInterval(() => {
      setOnlineCount(prev => prev + (Math.random() > 0.5 ? 1 : -1));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the PWA install prompt');
        }
        setDeferredPrompt(null);
      });
    }
  };

  const handleSubmit = () => {
    setNameError(false);
    setDeptError(false);
    
    if (!name.trim()) {
      setNameError(true);
      return;
    }
    if (!department) {
      setDeptError(true);
      return;
    }
    
    navigate('/matching', { 
      state: { 
        name: name.trim(), 
        department, 
        matchPreference 
      } 
    });
  };

  return (
    <>
      <div className="liquid-bg-landing"></div>

      <nav className="relative z-10 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2.5">
          <img src="/icon.png" className="app-logo" alt="MeeCu Logo" />
          <span style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.02em' }}>MeeCU</span>
        </div>
        <div className="online-badge">
          <div className="online-dot"></div>
          <span>{onlineCount} Online</span>
        </div>
      </nav>

      <main className="relative z-10 flex flex-col items-center justify-center px-4 pb-10" style={{ minHeight: 'calc(100dvh - 70px)' }}>
        
        <div className="card-main w-full max-w-sm p-7 relative" style={{ marginTop: '-10px' }}>
          <div className="red-glow-hero"></div>

          <div className="text-center mb-7 anim-1">
            <h1 style={{ fontSize: '28px', fontWeight: 900, lineHeight: 1.15, letterSpacing: '-0.03em' }} className="mb-2">
              Meet Someone New<br />
              <span style={{ color: 'var(--color-primary)' }}>Through Chat</span>
            </h1>
            <p style={{ color: '#9CA3AF', fontSize: '13.5px', lineHeight: 1.55, fontWeight: 400 }}>
              Anonymous. Safe. Only for your campus community.
            </p>
          </div>

          <div className="flex flex-col gap-3 mb-5 anim-2">
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.07em', color: '#9CA3AF', textTransform: 'uppercase' }} className="block mb-1.5">
                Your Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex"
                className="glass-input w-full px-4 py-3 rounded-2xl text-white"
                style={{ fontSize: '15px', fontWeight: 600, borderColor: nameError ? 'var(--color-primary)' : '' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.07em', color: '#9CA3AF', textTransform: 'uppercase' }} className="block mb-1.5">
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="glass-input w-full px-4 py-3 rounded-2xl text-white"
                style={{ fontSize: '15px', fontWeight: 600, appearance: 'none', borderColor: deptError ? 'var(--color-primary)' : '' }}
              >
                <option value="" style={{ background: '#1a1c24' }}>Select department…</option>
                {DEPARTMENTS.map(dept => (
                  <option key={dept.value} value={dept.value} style={{ background: '#1a1c24' }}>{dept.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-6 anim-3">
            <label style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.07em', color: '#9CA3AF', textTransform: 'uppercase' }} className="block mb-2">
              Match Mode
            </label>
            <div className="toggle-container">
              <button 
                className={`toggle-btn ${matchPreference === 'random' ? 'active' : ''}`} 
                onClick={() => setMatchPreference('random')}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px', verticalAlign: '-3px', marginRight: '5px' }}>shuffle</span>
                Random
              </button>
              <button 
                className={`toggle-btn ${matchPreference === 'dept' ? 'active' : ''}`} 
                onClick={() => setMatchPreference('dept')}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px', verticalAlign: '-3px', marginRight: '5px' }}>school</span>
                Same Dept
              </button>
            </div>
          </div>

          <div className="anim-4">
            <button 
              onClick={handleSubmit} 
              className="btn-primary w-full py-4 rounded-full text-white font-bold flex items-center justify-center gap-2" 
              style={{ fontSize: '16px', letterSpacing: '0.01em' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>chat</span>
              Start Chat
            </button>

            {deferredPrompt && (
              <button 
                onClick={handleInstallClick}
                className="mt-3 btn-ghost w-full py-3 rounded-full font-bold flex items-center justify-center gap-2" 
                style={{ fontSize: '14px', letterSpacing: '0.02em', color: '#9CA3AF' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>download</span>
                Install App (PWA)
              </button>
            )}
          </div>
        </div>

        <div className="w-full max-w-sm mt-5 flex flex-col gap-3">
          <div className="feature-card px-5 py-4 flex items-start gap-4 anim-4">
            <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'rgba(255,45,155,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span className="material-symbols-outlined" style={{ fontSize: '19px', color: 'var(--color-primary)' }}>verified_user</span>
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: '14px', marginBottom: '3px' }}>Verified Only</p>
              <p style={{ color: '#9CA3AF', fontSize: '12.5px', lineHeight: 1.5 }}>Access restricted to @cusat.ac.in emails for a safe environment.</p>
            </div>
          </div>
          <div className="feature-card px-5 py-4 flex items-start gap-4 anim-5">
            <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'rgba(0,212,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span className="material-symbols-outlined" style={{ fontSize: '19px', color: 'var(--color-secondary)' }}>lock</span>
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: '14px', marginBottom: '3px' }}>End-to-End Private</p>
              <p style={{ color: '#9CA3AF', fontSize: '12.5px', lineHeight: 1.5 }}>Messages are never stored. Privacy is our top priority.</p>
            </div>
          </div>
          <div className="feature-card px-5 py-4 flex items-start gap-4 anim-6">
            <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'rgba(160,32,240,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span className="material-symbols-outlined" style={{ fontSize: '19px', color: 'var(--color-tertiary)' }}>bolt</span>
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: '14px', marginBottom: '3px' }}>Instant Match</p>
              <p style={{ color: '#9CA3AF', fontSize: '12.5px', lineHeight: 1.5 }}>No profiles, no waiting. Just connect with another student instantly.</p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
