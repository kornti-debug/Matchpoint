import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import HomePage from './components/HomePage.jsx'
import Dashboard from "./components/Dashboard.jsx";
import MatchLobby from "./components/MatchLobby.jsx";
import Register from "./components/Register.jsx";
import Profile from "./components/Profile.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

function App() {

    return (
        <Router>
            <Routes>
                <Route path='/' element={<HomePage />}/>
                <Route path='/dashboard' element={<ProtectedRoute><Dashboard /></ProtectedRoute>}/>
                <Route path='/lobby' element={<ProtectedRoute><MatchLobby /></ProtectedRoute>}/>
                <Route path='/register' element={<Register />}/>
                <Route path='/profile' element={<ProtectedRoute><Profile /></ProtectedRoute>}/>
            </Routes>
        </Router>
    );
}

export default App;