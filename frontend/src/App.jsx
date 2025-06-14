// App.jsx
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import HomePage from './components/HomePage.jsx';
import Dashboard from "./components/Dashboard.jsx";
import Register from "./components/Register.jsx";
import Profile from "./components/Profile.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import MatchController from "./components/MatchController.jsx";

function App() {
    return (
        <Router>
            <Routes>
                <Route path='/' element={<HomePage />}/>
                <Route path='/dashboard' element={<ProtectedRoute><Dashboard /></ProtectedRoute>}/>
                <Route path='/match/:roomCode/host' element={<ProtectedRoute><MatchController isHost={true} /></ProtectedRoute>}/>
                <Route path='/match/:roomCode/player' element={<ProtectedRoute><MatchController isHost={false} /></ProtectedRoute>}/>
                <Route path='/register' element={<Register />}/>
                <Route path='/profile' element={<ProtectedRoute><Profile /></ProtectedRoute>}/>
            </Routes>
        </Router>
    );
}

export default App;
