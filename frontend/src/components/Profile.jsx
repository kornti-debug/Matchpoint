import { useEffect, useState } from "react";

function Profile() {
    const [username, setUsername] = useState("");

    useEffect(() => {
        // Try to get username from localStorage or fallback to userId
        const userId = localStorage.getItem('userId');
        // If you store the username elsewhere, adjust here
        setUsername(userId ? `User #${userId}` : "Unknown User");
    }, []);

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
            <div className="bg-gray-800 rounded-xl shadow-2xl p-10 flex flex-col items-center w-full max-w-md border-2 border-teal-500">
                <div className="bg-teal-500 rounded-full w-24 h-24 flex items-center justify-center mb-6">
                    <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                </div>
                <h1 className="text-4xl font-bold text-white mb-2">Profile</h1>
                <p className="text-xl text-gray-300 mb-4">Welcome, <span className="font-semibold text-teal-400">{username}</span>!</p>
            </div>
        </div>
    );
}

export default Profile;