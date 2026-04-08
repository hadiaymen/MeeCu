import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SocketProvider } from './context/SocketContext';
import Landing from './pages/Landing';
import Matching from './pages/Matching';
import TextChat from './pages/TextChat';
import Watermark from './components/Watermark';
import './index.css';

function App() {
  return (
    <SocketProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/matching" element={<Matching />} />
          <Route path="/chat" element={<TextChat />} />
        </Routes>
        <Watermark />
      </BrowserRouter>
    </SocketProvider>
  );
}

export default App;
