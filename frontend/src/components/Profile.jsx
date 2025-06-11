
import {Link, useNavigate} from "react-router-dom";



function Profile(){

    const navigate = useNavigate()



    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');

    }



    return(
        <div className="min-h-screen bg-gray-900 text-gray-100">
            <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition duration-200"
            >
                Logout
            </button>
            <Link
                to="/dashboard"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-200 transform hover:scale-105"
            >
                Dashboard
            </Link>
            <h1 className="text-5xl font-bold text-gray-400 mb-6">
                Profile
            </h1>


        </div>
    )
}

export default Profile