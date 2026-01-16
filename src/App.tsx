import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { HomePage } from './pages/HomePage';
import { LoadingPage } from './pages/LoadingPage';
import { PodcastPage } from './pages/PodcastPage';
import './styles/globals.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename="/NotePodcast">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/loading" element={<LoadingPage />} />
          <Route path="/podcast" element={<PodcastPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

