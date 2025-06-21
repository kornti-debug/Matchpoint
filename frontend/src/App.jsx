// App.jsx
import {BrowserRouter as Router, Routes, Route, Link} from 'react-router-dom';
import HomePage from './components/HomePage.jsx';
import Dashboard from "./components/Dashboard.jsx";
import Register from "./components/Register.jsx";
import Profile from "./components/Profile.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import MatchController from "./components/MatchController.jsx";
import GamesPage from "./components/GamesPage.jsx";
import GameDetailPage from "./components/GameDetailPage.jsx";
import GameFormPage from "./components/GameFormPage.jsx";
import Wordmark from "./assets/wordmark2.svg";
import BurgerMenu from "./components/BurgerMenu.jsx";
import {useEffect, useState} from "react";

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

    useEffect(() => {
        const handler = () => setIsAuthenticated(!!localStorage.getItem('token'));
        window.addEventListener('authChanged', handler);
        return () => window.removeEventListener('authChanged', handler);
    }, []);

    return (
        <Router>
            <div className="min-h-screen flex flex-col">
                <header className="bg-gray-800 p-4 shadow-md flex justify-between items-center">
                    <Link to="/" className="text-2xl font-bold text-blue-400 hover:text-blue-300 rounded-lg p-2 transition duration-300">
                        <img
                            src={Wordmark}
                            alt="Matchpoint"
                            className="w-32 h-auto"
                        />
                    </Link>
                    {isAuthenticated && <BurgerMenu />}
                </header>

                <main className="flex-grow flex items-center justify-center p-8">
                    <div className="bg-gray-900 rounded-lg shadow-lg sm:p-8 m-auto w-full sm:max-w-6xl min-w-[16rem] flex justify-center">
                    <Routes>
                        <Route path='/' element={<HomePage />}/>
                        <Route path='/dashboard' element={<ProtectedRoute><Dashboard /></ProtectedRoute>}/>
                        <Route path='/dashboard/games' element={<ProtectedRoute><GamesPage /></ProtectedRoute>}/>
                        <Route path='/dashboard/games/:gameId' element={<ProtectedRoute><GameDetailPage /></ProtectedRoute>}/>
                        <Route path="/dashboard/games/new" element={<ProtectedRoute><GameFormPage type="new" /></ProtectedRoute>} />
                        <Route path="/dashboard/games/:gameId/edit" element={<ProtectedRoute><GameFormPage type="edit" /></ProtectedRoute>} />
                        <Route path='/match/:roomCode/host' element={<ProtectedRoute><MatchController isHost={true} /></ProtectedRoute>}/>
                        <Route path='/match/:roomCode/player' element={<ProtectedRoute><MatchController isHost={false} /></ProtectedRoute>}/>
                        <Route path='/register' element={<Register />}/>
                        <Route path='/profile' element={<ProtectedRoute><Profile /></ProtectedRoute>}/>
                    </Routes>
                    </div>
                </main>

                <footer className="bg-gray-800 p-4 text-center text-gray-400 shadow-inner">
                    &copy; 2025 Matchpoint
                </footer>
            </div>
        </Router>
    );
}

export default App;
