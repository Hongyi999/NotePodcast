import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { LoadingPage } from './pages/LoadingPage';
import { PodcastPage } from './pages/PodcastPage';
import './styles/globals.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/loading" element={<LoadingPage />} />
        <Route path="/podcast" element={<PodcastPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

