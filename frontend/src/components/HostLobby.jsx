// components/HostLobby.jsx
import React, { useState, useEffect } from 'react'; // Added useEffect for match name update sync
import * as apiService from '../services/apiService.js'; // Keep import for potential future use

function HostLobby({ roomCode, matchState, setMatchState, startMatch, updateMatchName }) { // Added updateMatchName prop
    const [playerName, setPlayerName] = useState(''); // Kept for your future local-only mode idea

    // State for match name editing
    const [tempMatchName, setTempMatchName] = useState(matchState.matchDetails.matchname || '');
    const [isEditingMatchName, setIsEditingMatchName] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);

    // Sync tempMatchName with actual matchDetails.matchname when it changes (e.g., from WebSocket update)
    useEffect(() => {
        setTempMatchName(matchState.matchDetails.matchname || '');
    }, [matchState.matchDetails.matchname]);

    const handleUpdateMatchName = async () => {
        if (!tempMatchName.trim()) {
            console.warn("HostLobby: Match name cannot be empty.");
            return;
        }
        if (tempMatchName === matchState.matchDetails.matchname) {
            setIsEditingMatchName(false); // No change, just close edit mode
            return;
        }

        try {
            console.log(`HostLobby: Attempting to update match name to "${tempMatchName}" for room "${roomCode}"`);
            await updateMatchName(tempMatchName); // Calls updateMatchNameHandler from MatchController
            setIsEditingMatchName(false);
            // MatchController will handle updating matchState via WebSocket broadcast
        } catch (error) {
            console.error('HostLobby: Failed to update match name:', error);
            // Error handling already in MatchController, but can show local message if needed
            setMatchState(prev => ({ ...prev, error: `Failed to update name: ${error.message}` }));
        }
    };


    const handleJoinAsHostPlayer = () => {
        if (!playerName.trim()) return;
        // This is a local-only client-side addition for testing.
        // In a real scenario, this would be an API call to joinMatch.
        const newPlayer = { id: `local-host-player-${Date.now()}`, name: playerName.trim(), user_id: Math.floor(Math.random() * 1000000), total_score: 0 };
        setMatchState(prev => ({
            ...prev,
            players: [...prev.players, newPlayer],
            scores: { ...prev.scores, [newPlayer.id]: 0 }
        }));
        setPlayerName('');
        console.warn("HostLobby: 'Add Me as Player' is for local UI testing only. Real players join via Dashboard.");
    };

    const handleCopyCode = () => {
        const el = document.createElement('textarea');
        el.value = roomCode;
        document.body.appendChild(el);
        el.select();
        try {
            document.execCommand('copy');
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (err) {
            console.error('Failed to copy text:', err);
            setCopySuccess(false);
        }
        document.body.removeChild(el);
    };

    return (
        <div className="bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-2xl text-center border-2 border-blue-600">
            {/* Match Name Section */}
            <div className="flex flex-col items-center justify-center space-y-3 mb-6">
                <label htmlFor="matchName" className="block text-xl font-medium text-gray-300">
                    Match Name:
                </label>
                {isEditingMatchName ? (
                    <div className="flex w-full max-w-md">
                        <input
                            id="matchName"
                            type="text"
                            value={tempMatchName}
                            onChange={(e) => setTempMatchName(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    handleUpdateMatchName();
                                }
                            }}
                            className="flex-grow p-3 rounded-l-lg bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            onClick={handleUpdateMatchName}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-r-lg shadow-md transition duration-300"
                        >
                            Save
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-4 w-full max-w-md justify-center">
                        <p className="text-2xl font-semibold text-white">{matchState.matchDetails.matchname || 'Unnamed Match'}</p>
                        <button
                            onClick={() => setIsEditingMatchName(true)}
                            className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg shadow-md transition duration-300 flex items-center"
                        >
                            <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.38-2.828-2.829z"></path></svg>
                            Edit
                        </button>
                    </div>
                )}
            </div>

            {/* Room Code Section */}
            <div className="flex items-center justify-center space-x-3 mb-6">
                <p className="text-xl text-gray-300">Room Code: <span className="font-mono text-blue-300 text-2xl bg-gray-700 p-2 rounded-md tracking-wider">{roomCode}</span></p>
                <button
                    onClick={handleCopyCode}
                    className={`px-4 py-2 rounded-lg transition duration-200 font-medium flex items-center gap-2 shadow-md
                        ${copySuccess ? 'bg-green-500 text-white' : 'bg-gray-600 hover:bg-gray-700 text-white'}`}
                >
                    {copySuccess ? (
                        <>
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                            Copied!
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"></path><path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"></path></svg>
                            Copy Code
                        </>
                    )}
                </button>
            </div>

            <p className="text-lg text-gray-400 mb-6">Share this code with players to join!</p>

            {/* Players Joined Section */}
            <div className="border-t border-gray-700 pt-6 mt-6">
                <h3 className="text-2xl font-semibold mb-3 text-white">Players Joined:</h3>
                {matchState.players.length === 0 ? (
                    <p className="text-gray-400">No players yet. Waiting...</p>
                ) : (
                    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {matchState.players.map(player => (
                            <li key={player.id} className="bg-gray-700 text-gray-200 p-3 rounded-lg shadow-sm">
                                {player.name} {player.total_score !== undefined ? `(${player.total_score} pts)` : ''}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Start Match Button */}
            <div className="border-t border-gray-700 pt-6 mt-6">
                <button
                    onClick={startMatch}
                    disabled={matchState.players.length === 0 || matchState.totalGames === 0} // Disable if no players or no games selected
                    className={`w-full text-white font-bold py-4 px-8 rounded-lg shadow-lg transition duration-300 transform hover:scale-105
                        ${matchState.players.length === 0 || matchState.totalGames === 0 ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                >
                    Start Match ({matchState.totalGames} Games)
                </button>
                {(matchState.players.length === 0 || matchState.totalGames === 0) && (
                    <p className="text-red-400 mt-2">
                        {matchState.players.length === 0 ? 'At least one player must join.' : ''}
                        {matchState.players.length === 0 && matchState.totalGames === 0 ? ' And ' : ''}
                        {matchState.totalGames === 0 ? 'The match must have selected games.' : ''}
                    </p>
                )}
                {/* Kept for your future local-only mode idea, uncomment if needed */}
                {/*
                <div className="border-t border-gray-700 pt-6 mt-6">
                    <h3 className="text-2xl font-semibold mb-3 text-white">Join as a Player (for Host Testing):</h3>
                    <input
                        type="text"
                        placeholder="Your Player Name"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        className="w-full p-3 mb-4 rounded-lg bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={handleJoinAsHostPlayer}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 transform hover:scale-105"
                    >
                        Add Me as Player (Local Only)
                    </button>
                </div>
                */}
            </div>
        </div>
    );
}

export default HostLobby;
