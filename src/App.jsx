import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import { ISSProvider } from './context/ISSContext';
import { NewsProvider } from './context/NewsContext';
import Layout from './components/Layout';
import ISSPage from './pages/ISSPage';
import NewsPage from './pages/NewsPage';
import ChartsPage from './pages/ChartsPage';
import OverviewPage from './pages/OverviewPage';
import ChatBot from './components/ChatBot';
import './App.css';

export default function App() {
  return (
    <ThemeProvider>
      <ISSProvider>
        <NewsProvider>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<OverviewPage />} />
                <Route path="/iss" element={<ISSPage />} />
                <Route path="/news" element={<NewsPage />} />
                <Route path="/charts" element={<ChartsPage />} />
              </Routes>
            </Layout>
            <ChatBot />
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: '#1a1a2e',
                  color: '#f0f0ff',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                },
              }}
            />
          </Router>
        </NewsProvider>
      </ISSProvider>
    </ThemeProvider>
  );
}
