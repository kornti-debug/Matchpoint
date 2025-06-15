// components/MatchController.jsx
import {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import * as apiService from "../services/apiService.js"; // This will be our mock API service

// Import your components
import HostLobby from "./HostLobby.jsx";
import PlayerLobby from "./PlayerLobby.jsx";
import GameView from "./GameView.jsx";
import Scoreboard from "./Scoreboard.jsx";
import FinalResults from "./FinalResults.jsx";

function MatchController({ isHost }) {
    const { roomCode } = useParams();

    // Main state that controls everything
    const [matchState, setMatchState] = useState({
        phase: 'lobby', // 'lobby', 'game', 'scoreboard', 'finished'
        currentGame: 1,
        totalGames: 15,
        players: [],
        scores: {},
        matchDetails: {
            matchname: '',
            room_code: roomCode, // Initialize with roomCode from params
            // Add other default properties as needed
        },
        gameData: null,
        isLoading: true, // Start with loading true
        error: ''
    });



    // This effect runs once on component mount to fetch match details and (if host) initialize WebSocket
    useEffect(() => {
        console.log('MatchController mounted with roomCode:', roomCode);
        fetchMatchDetails(); // Fetch details for this room code

    }, [isHost, roomCode]); // Re-run if isHost or roomCode changes

    // Function to fetch match details from the API service
    const fetchMatchDetails = async () => {
        setMatchState(prev => ({ ...prev, isLoading: true, error: '' }));
        try {
            // Simulate API call to get match details
            const data = await apiService.getMatchDetails(roomCode);
            setMatchState(prev => ({
                ...prev,
                matchDetails: {
                    // Ensure matchname and room_code are present, merge other details
                    matchname: data.match?.matchname || `Match ${roomCode}`,
                    room_code: data.match?.room_code || roomCode,
                    ...data.match
                },
                // Pre-populate players and scores if the API returns them
                players: data.players || [],
                scores: data.scores || {},
                // Assume the API might tell us the current game or phase for persistence
                phase: data.match?.currentPhase || 'lobby',
                currentGame: data.match?.currentGame || 1,
                totalGames: data.match?.totalGames || 15,
                isLoading: false
            }));
        } catch (error) {
            console.error("Error fetching match details:", error);
            setMatchState(prev => ({
                ...prev,
                error: `Failed to load match details: ${error.message}`,
                isLoading: false
            }));
        }
    };


    // --- Game Flow Control Functions (primarily for Host) ---

    // Function to start the match (Host action)
    const startMatch = async () => {
        // Prevent starting if already in a game or no players
        if (matchState.phase !== 'lobby') {
            console.warn("Cannot start match: Not in lobby phase.");
            return;
        }
        if (matchState.players.length === 0) {
            console.warn("Cannot start match: No players have joined yet.");
            // In a real app, you might show a user-friendly message
            return;
        }

        try {
            // Fetch data for the first game (Game 1)
            const gameData = await apiService.getGameData(1);
            setMatchState(prev => ({
                ...prev,
                phase: 'game',          // Transition to game phase
                currentGame: 1,         // Set current game to 1
                gameData: gameData,     // Load game data
                // Initialize scores if not already done, or ensure all joined players are in scores
                scores: prev.players.reduce((acc, player) => ({...acc, [player.id]: prev.scores[player.id] || 0}), {})
            }));


        } catch (error) {
            console.error('Failed to start match:', error);
            setMatchState(prev => ({ ...prev, error: `Failed to start match: ${error.message}` }));
        }
    };

    // Function to submit game results (Host action)
    const submitGameResults = async (winners, points) => {
        // Ensure winners is an array of player objects (or objects with 'id')
        if (!Array.isArray(winners) || winners.length === 0) {
            console.error("Submit Game Results: Invalid winners array.");
            return;
        }

        try {
            // Calculate new scores locally
            const newScores = { ...matchState.scores };
            winners.forEach(winner => {
                newScores[winner.id] = (newScores[winner.id] || 0) + points;
            });

            setMatchState(prev => ({
                ...prev,
                scores: newScores,  // Update scores in state
                phase: 'scoreboard' // Transition to scoreboard phase
            }));

            // Save results to the database via API service
            await apiService.saveGameResults(roomCode, matchState.currentGame, winners, points, newScores);
            console.log('Game results saved to DB:', newScores);



        } catch (error) {
            console.error('Failed to submit results:', error);
            setMatchState(prev => ({ ...prev, error: `Failed to submit results: ${error.message}` }));
        }
    };

    // Function to advance to the next game (Host action)
    const nextGame = async () => {
        const nextGameNumber = matchState.currentGame + 1;

        if (nextGameNumber > matchState.totalGames) {
            // If all games are played, transition to 'finished' phase
            setMatchState(prev => ({ ...prev, phase: 'finished' }));
            // Notify clients that match is finished
            return;
        }

        try {
            // Fetch data for the next game
            const gameData = await apiService.getGameData(nextGameNumber);
            setMatchState(prev => ({
                ...prev,
                phase: 'game',          // Transition back to game phase
                currentGame: nextGameNumber, // Update current game number
                gameData: gameData      // Load new game data
            }));

        } catch (error) {
            console.error('Failed to load next game:', error);
            setMatchState(prev => ({ ...prev, error: `Failed to load next game: ${error.message}` }));
        }
    };

    // Function to go back to scoreboard (Host action - if needed for review)
    const backToScoreboard = () => {
        setMatchState(prev => ({ ...prev, phase: 'scoreboard' }));
        // Could also send a WebSocket message if players need to be forced back
    };



    // Conditional rendering based on loading state and errors
    if (matchState.isLoading) {
        return (
            <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center text-3xl font-bold">
                Loading Match...
            </div>
        );
    }

    if (matchState.error) {
        return (
            <div className="min-h-screen bg-gray-900 text-red-500 flex flex-col items-center justify-center text-xl p-4">
                <p className="mb-4 font-bold">Error:</p>
                <p>{matchState.error}</p>
                <button
                    onClick={fetchMatchDetails}
                    className="mt-6 bg-red-700 hover:bg-red-800 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300"
                >
                    Try Again
                </button>
            </div>
        );
    }

    // Render components based on the current phase
    return (
        <div className="flex-grow flex items-center justify-center p-4">
            {matchState.phase === 'lobby' && (
                isHost ?
                    <HostLobby
                        roomCode={roomCode}
                        matchState={matchState}
                        setMatchState={setMatchState}
                        startMatch={startMatch}
                    /> :
                    <PlayerLobby
                        roomCode={roomCode}
                        matchState={matchState}
                        setMatchState={setMatchState}
                    />
            )}

            {matchState.phase === 'game' && (
                <GameView
                    roomCode={roomCode}
                    matchState={matchState}
                    setMatchState={setMatchState}
                    isHost={isHost}
                    submitGameResults={submitGameResults} // Only relevant for host
                    backToScoreboard={backToScoreboard} // Only relevant for host
                />
            )}

            {matchState.phase === 'scoreboard' && (
                <Scoreboard
                    roomCode={roomCode}
                    matchState={matchState}
                    setMatchState={setMatchState}
                    isHost={isHost}
                    nextGame={nextGame} // Only relevant for host
                />
            )}

            {matchState.phase === 'finished' && (
                <FinalResults
                    roomCode={roomCode}
                    matchState={matchState}
                    setMatchState={setMatchState}
                    isHost={isHost}
                />
            )}
        </div>
    );
}

export default MatchController;
