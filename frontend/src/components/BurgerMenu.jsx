import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function BurgerMenu() {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    // Helper to close menu and navigate
    const handleNav = (to) => {
        setOpen(false);
        navigate(to);
    };

    // Logout handler
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        window.dispatchEvent(new Event('authChanged'));
        setOpen(false);
        navigate('/');
    };

    return (
        <div className="relative">
            {/* Burger Icon */}
            <button
                className="md:hidden flex items-center px-3 py-2 border rounded text-gray-200 border-gray-400 hover:text-white hover:border-white focus:outline-none"
                onClick={() => setOpen(true)}
                aria-label="Toggle navigation menu"
            >
                <svg className="fill-current h-6 w-6" viewBox="0 0 20 20">
                    <title>Menu</title>
                    <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
                </svg>
            </button>

            {/* Nav Links (hidden on mobile, shown on md+) */}
            <ul className="hidden md:flex items-center space-x-4">
                <li>
                    <Link to="/dashboard" className="text-white font-semibold py-2 px-4 rounded-lg transition duration-300 hover:text-teal-500">
                        Dashboard
                    </Link>
                </li>
                <li>
                    <Link to="/dashboard/games" className="text-white font-semibold py-2 px-4 rounded-lg transition duration-300 hover:text-teal-500">
                        Manage Games
                    </Link>
                </li>
                <li>
                    <Link to="/profile" className="text-white font-semibold py-2 px-4 rounded-lg transition duration-300 hover:text-teal-500">
                        Profile
                    </Link>
                </li>
                <li>
                    <button
                        onClick={handleLogout}
                        className="text-white font-semibold py-2 px-4 rounded-lg transition duration-300 hover:text-teal-500"
                    >
                        Logout
                    </button>
                </li>
            </ul>

            {/* Sliding Drawer Menu (mobile) */}
            <div
                className={`fixed top-0 right-0 h-full w-64 bg-gray-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out md:hidden ${open ? 'translate-x-0' : 'translate-x-full'}`}
                style={{ willChange: 'transform' }}
            >
                {/* Close button */}
                <button
                    className="absolute top-4 right-4 text-gray-400 hover:text-white text-3xl focus:outline-none"
                    onClick={() => setOpen(false)}
                    aria-label="Close menu"
                >
                    &times;
                </button>
                <div className="flex flex-col h-full">
                    <nav className="flex-1 flex flex-col justify-center items-center space-y-6 pt-10 pb-10">
                        <button
                            onClick={() => handleNav('/dashboard')}
                            className="w-full text-center text-white text-xl font-semibold py-3 px-4 rounded-lg transition duration-300 hover:text-teal-500"
                        >
                            Dashboard
                        </button>
                        <button
                            onClick={() => handleNav('/dashboard/games')}
                            className="w-full text-center text-white text-xl font-semibold py-3 px-4 rounded-lg transition duration-300 hover:text-teal-500"
                        >
                            Manage Games
                        </button>
                        <button
                            onClick={() => handleNav('/profile')}
                            className="w-full text-center text-white text-xl font-semibold py-3 px-4 rounded-lg transition duration-300 hover:text-teal-500"
                        >
                            Profile
                        </button>
                    </nav>
                    <div className="pb-8 flex justify-center">
                        <button
                            onClick={handleLogout}
                            className="w-full text-center text-white text-xl font-semibold py-3 px-4 rounded-lg transition duration-300 hover:text-teal-500"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Overlay for closing menu when clicking outside */}
            {open && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden"
                    onClick={() => setOpen(false)}
                />
            )}
        </div>
    );
}

export default BurgerMenu;