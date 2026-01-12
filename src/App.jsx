import { HashRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import AuthGuard from './components/AuthGuard';
import Home from './pages/Home';

import Investors from './pages/Investors';

import Dashboard from './pages/Dashboard';

import Treasury from './pages/Treasury';

import Team from './pages/Team';
import Thesis from './pages/Thesis';
import Contact from './pages/Contact';

function App() {
  return (
    <HashRouter>
      <AuthGuard>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/thesis" element={<Thesis />} />
          <Route path="/team" element={<Team />} />
          <Route path="/investors" element={<Investors />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/treasury" element={<Treasury />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </AuthGuard>
    </HashRouter>
  );
}

export default App;
