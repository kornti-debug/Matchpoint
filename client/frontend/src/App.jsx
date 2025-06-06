import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import HomePage from './components/HomePage.jsx'
import Dashboard from "./components/Dashboard.jsx";

function App() {

    return (
        <Router>
            <Routes>
                <Route path='/' element={<HomePage />}/>
                <Route path='/dashboard' element={<Dashboard />}/>
            </Routes>
        </Router>
    );
}

export default App;