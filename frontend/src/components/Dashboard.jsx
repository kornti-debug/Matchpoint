import {useState} from "react";
import {useNavigate} from "react-router-dom";



function Dashboard(){

    const [createMatchName, setCreateMatchName] = useState("")
    const [joinMatchName, setJoinMatchName] = useState("")
    const navigate = useNavigate();

    const handleCreateMatch = () => {

        console.log(createMatchName)
        navigate('/lobby');
    }

    const handleJoinMatch = () => {

        console.log(joinMatchName)
    }

    return(
        <div className="min-h-screen bg-gray-900 text-gray-100">
    <h1 className="text-5xl font-bold text-gray-400 mb-6">
        Dashboard
    </h1>
            <label htmlFor="matchName" className="block text-sm font-medium text-gray-300 mb-2">
                New Match
            </label>
            <input
                id="matchName"
                type="text"
                value={createMatchName}
                onChange={(e) => setCreateMatchName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="match name"
            />

                <button onClick={handleCreateMatch} className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg transition duration-200">
                    Create Match
                </button>

            <br/>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                Join Match
            </label>
            <input
                id="name"
                type="text"
                value={joinMatchName}
                onChange={(e) => setJoinMatchName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="join name"
            />

                <button onClick={handleJoinMatch} className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition duration-200">
                    Join Match
                </button>

        </div>
    )
}

export default Dashboard