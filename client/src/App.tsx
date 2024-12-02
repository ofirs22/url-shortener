import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar'
import ShortenerForm from './components/ShortenerForm'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import UrlsList from './components/UrlList'


const App: React.FC = () => {
  return (
    <Router>
      <Navbar />
      <div style={{ padding: '20px' }}>
        <Routes>
          <Route path="/" element={<ShortenerForm />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/urls" element= {<UrlsList />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;


