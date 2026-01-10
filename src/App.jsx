import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import AuthGuard from './components/AuthGuard';
import Home from './pages/Home';

import Investors from './pages/Investors';

import Dashboard from './pages/Dashboard';

import Treasury from './pages/Treasury';

function App() {
  return (
    <BrowserRouter basename="/website">
      <AuthGuard>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/investors" element={<Investors />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/treasury" element={<Treasury />} />
        </Routes>
      </AuthGuard>
    </BrowserRouter>
  );
}

export default App;
