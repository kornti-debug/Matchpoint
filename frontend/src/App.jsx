import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import HomePage from './components/HomePage.jsx'
import Dashboard from "./components/Dashboard.jsx";
import MatchLobby from "./components/MatchLobby.jsx";

function App() {

    return (
        <Router>
            <Routes>
                <Route path='/' element={<HomePage />}/>
                <Route path='/dashboard' element={<Dashboard />}/>
                <Route path='/lobby' element={<MatchLobby />}/>
            </Routes>
        </Router>
    );
}

export default App;