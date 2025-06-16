// components/MatchController.jsx
import {useEffect, useState, useCallback} from "react"; // Added useCallback for fetchMatchDetails
import {useParams} from "react-router-dom";
import * as apiService from "../services/apiService.js";

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
            id: null, // Ensure ID is initialized
            host_id: null, // Ensure host_id is initialized
            status: 'waiting', // Ensure status is initialized
            current_game_number: 1, // Ensure current_game_number is initialized
        },
        gameData: null,
        isLoading: true, // Start with loading true
        error: ''
    });

    // Function to fetch match details from the API service
    // Wrapped in useCallback because it's a dependency of useEffect
    const fetchMatchDetails = useCallback(async () => {
        setMatchState(prev => ({ ...prev, isLoading: true, error: '' }));
        try {
            const apiResponse = await apiService.getMatchDetails(roomCode); // Get the full API response
            const matchData = apiResponse.match; // Access the 'match' object from the response

            setMatchState(prev => ({
                ...prev,
                matchDetails: {
                    // Use optional chaining for safety, but data.match should exist
                    matchname: matchData?.matchname || `Match ${roomCode}`,
                    room_code: matchData?.room_code || roomCode,
                    id: matchData?.id || null,
                    host_id: matchData?.host_id || null,
                    status: matchData?.status || 'waiting',
                    current_game_number: matchData?.current_game_number || 1,
                    // Spread operator to ensure all properties from matchData are included
                    ...matchData
                },
                // --- CORRECTED LINES ---
                players: matchData?.players || [], // Access players from matchData
                scores: matchData?.scores || {},   // Access scores from matchData
                // --- END CORRECTED LINES ---
                phase: matchData?.status || 'lobby', // Phase should come from match status
                currentGame: matchData?.current_game_number || 1, // Current game number from match
                totalGames: 15, // Total games typically hardcoded or fetched separately
                isLoading: false
            }));
            console.log('MatchController: matchState after fetch:', apiResponse); // Log the full API response here

            // If the match starts in game phase, fetch the game data
            if (matchData?.status === 'in_progress' && matchData?.current_game_number) {
                const game = await apiService.getGameData(matchData.current_game_number);
                setMatchState(prev => ({ ...prev, gameData: game }));
            }


        } catch (error) {
            console.error("Error fetching match details:", error);
            setMatchState(prev => ({
                ...prev,
                error: `Failed to load match details: ${error.message}`,
                isLoading: false
            }));
        }
    }, [roomCode]); // roomCode is a dependency

    // This effect runs once on component mount to fetch match details
    // It now correctly depends on fetchMatchDetails
    useEffect(() => {
        console.log('MatchController mounted with roomCode:', roomCode);
        fetchMatchDetails();
    }, [fetchMatchDetails]); // fetchMatchDetails is now a dependency


    // --- Game Flow Control Functions (primarily for Host) ---

    // Function to start the match (Host action)
    const startMatch = async () => {
        // Prevent starting if already in a game or no players
        if (matchState.phase !== 'lobby' && matchState.phase !== 'waiting') { // Also allow 'waiting'
            console.warn("Cannot start match: Not in lobby/waiting phase.");
            return;
        }
        if (matchState.players.length === 0) {
            console.warn("Cannot start match: No players have joined yet.");
            return;
        }
        // Save the start to backend (will implement later)
        // For now, just transition state
        try {
            // Fetch data for the first game (Game 1)
            const gameData = await apiService.getGameData(1);
            setMatchState(prev => ({
                ...prev,
                phase: 'game',          // Transition to game phase
                currentGame: 1,         // Set current game to 1
                gameData: gameData,     // Load game data
                // Ensure all joined players are in scores, initialized if not present
                scores: prev.players.reduce((acc, player) => ({...acc, [player.id]: prev.scores[player.id] || 0}), {})
            }));
            console.log('Match started in frontend (mocked transition).');

        } catch (error) {
            console.error('Failed to start match:', error);
            setMatchState(prev => ({ ...prev, error: `Failed to start match: ${error.message}` }));
        }
    };

    // Function to submit game results (Host action)
    const submitGameResults = async (winners, points) => {
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

            // Update player objects with new total_score as well for consistency
            const updatedPlayers = matchState.players.map(player => ({
                ...player,
                total_score: newScores[player.id] // Ensure player object also reflects new score
            }));


            setMatchState(prev => ({
                ...prev,
                scores: newScores,  // Update scores in state
                players: updatedPlayers, // Update players list with new scores
                phase: 'scoreboard' // Transition to scoreboard phase
            }));

            // Save results to the database via API service (this is still mock)
            await apiService.saveGameResults(roomCode, matchState.currentGame, winners, points, newScores);
            console.log('Game results saved to DB (mocked for now):', newScores);

        } catch (error) {
            console.error('Failed to submit results:', error);
            setMatchState(prev => ({ ...prev, error: `Failed to submit results: ${error.message}` }));
        }
    };

    // Function to advance to the next game (Host action)
    const nextGame = async () => {
        const nextGameNumber = matchState.currentGame + 1;

        if (nextGameNumber > matchState.totalGames) {
            setMatchState(prev => ({ ...prev, phase: 'finished' }));
            return;
        }

        try {
            // Fetch data for the next game (this is now real API call for game data)
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
            {matchState.phase === 'lobby' || matchState.phase === 'waiting' ? ( // Handle 'waiting' from backend status
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
            ) : null}


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
