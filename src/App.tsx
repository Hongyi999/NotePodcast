import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { PodcastPage } from './pages/PodcastPage';
import './styles/globals.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/podcast" element={<PodcastPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

