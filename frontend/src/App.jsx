import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import HomePage from './components/HomePage.jsx'
import Dashboard from "./components/Dashboard.jsx";
import Register from "./components/Register.jsx";
import Profile from "./components/Profile.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import HostLobby from "./components/HostLobby.jsx";
import PlayerLobby from "./components/PlayerLobby.jsx"

function App() {

    return (
        <Router>
            <Routes>
                <Route path='/' element={<HomePage />}/>
                <Route path='/dashboard' element={<ProtectedRoute><Dashboard /></ProtectedRoute>}/>
                <Route path='//match/:roomCode/host' element={<ProtectedRoute><HostLobby /></ProtectedRoute>}/>
                <Route path='//match/:roomCode/player' element={<ProtectedRoute><PlayerLobby /></ProtectedRoute>}/>
                <Route path='/register' element={<Register />}/>
                <Route path='/profile' element={<ProtectedRoute><Profile /></ProtectedRoute>}/>
            </Routes>
        </Router>
    );
}

export default App;