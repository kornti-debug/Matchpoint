// components/MatchController.jsx
import {useEffect, useState, useCallback} from "react";
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
            room_code: roomCode,
            id: null,
            host_id: null,
            status: 'waiting',
            current_game_number: 1,
        },
        gameData: null,
        isLoading: true,
        error: ''
    });

    // --- NEW STATE VARIABLE ---
    const [isReviewingScoreboard, setIsReviewingScoreboard] = useState(false);
    // --- END NEW STATE VARIABLE ---


    // Function to fetch match details from the API service
    const fetchMatchDetails = useCallback(async () => {
        setMatchState(prev => ({ ...prev, isLoading: true, error: '' }));
        try {
            const apiResponse = await apiService.getMatchDetails(roomCode);
            const matchData = apiResponse.match;

            setMatchState(prev => ({
                ...prev,
                matchDetails: {
                    matchname: matchData?.matchname || `Match ${roomCode}`,
                    room_code: matchData?.room_code || roomCode,
                    id: matchData?.id || null,
                    host_id: matchData?.host_id || null,
                    status: matchData?.status || 'waiting',
                    current_game_number: matchData?.current_game_number || 1,
                    ...matchData
                },
                players: matchData?.players || [],
                scores: matchData?.scores || {},
                phase: matchData?.status || 'lobby',
                currentGame: matchData?.current_game_number || 1,
                totalGames: 15,
                isLoading: false
            }));
            console.log('MatchController: matchState after fetch:', apiResponse);

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
    }, [roomCode]);

    useEffect(() => {
        console.log('MatchController mounted with roomCode:', roomCode);
        fetchMatchDetails();
    }, [fetchMatchDetails]);


    // --- Game Flow Control Functions (primarily for Host) ---

    const startMatch = async () => {
        if (matchState.phase !== 'lobby' && matchState.phase !== 'waiting') {
            console.warn("Cannot start match: Not in lobby/waiting phase.");
            return;
        }
        if (matchState.players.length === 0) {
            console.warn("Cannot start match: No players have joined yet.");
            return;
        }

        try {
            // TODO: Implement actual backend call to start match and transition status
            const gameData = await apiService.getGameData(1); // Fetch real game data
            setMatchState(prev => ({
                ...prev,
                phase: 'game',
                currentGame: 1,
                gameData: gameData,
                scores: prev.players.reduce((acc, player) => ({...acc, [player.id]: prev.scores[player.id] || 0}), {})
            }));
            // After starting, ensure we're not in review mode
            setIsReviewingScoreboard(false); // <--- NEW: Reset this flag
            console.log('Match started in frontend (mocked transition).');

        } catch (error) {
            console.error('Failed to start match:', error);
            setMatchState(prev => ({ ...prev, error: `Failed to start match: ${error.message}` }));
        }
    };


    const submitGameResults = async (winners, points) => {
        if (!Array.isArray(winners) || winners.length === 0) {
            console.error("Submit Game Results: Invalid winners array.");
            return;
        }

        try {
            const { updatedPlayers, updatedScores } = await apiService.saveGameResults(
                roomCode,
                matchState.currentGame,
                winners,
                points
            );

            setMatchState(prev => ({
                ...prev,
                scores: updatedScores,
                players: updatedPlayers,
                phase: 'scoreboard'
            }));
            // --- NEW: Set isReviewingScoreboard to false because we are ready to advance ---
            setIsReviewingScoreboard(false);
            console.log('Game results saved to DB (real API). Transitioning to Scoreboard for next game.');

        } catch (error) {
            console.error('Failed to submit results:', error);
            setMatchState(prev => ({ ...prev, error: `Failed to submit results: ${error.message}` }));
        }
    };

    const nextGame = async () => {
        const nextGameNumber = matchState.currentGame + 1;

        if (nextGameNumber > matchState.totalGames) {
            setMatchState(prev => ({ ...prev, phase: 'finished' }));
            setIsReviewingScoreboard(false); // <--- NEW: Reset this flag
            return;
        }

        try {
            // This is currently a mock call, but will eventually update match status in DB
            const gameData = await apiService.getGameData(nextGameNumber); // Fetch real game data
            setMatchState(prev => ({
                ...prev,
                phase: 'game',
                currentGame: nextGameNumber,
                gameData: gameData,
                matchDetails: {
                    ...prev.matchDetails, // Keep all other matchDetails properties
                    current_game_number: nextGameNumber // Update this specific property
                }
            }));
            // After advancing, ensure we're not in review mode
            setIsReviewingScoreboard(false); // <--- NEW: Reset this flag
            console.log('Advanced to next game in frontend (mocked transition).');

        } catch (error) {
            console.error('Failed to load next game:', error);
            setMatchState(prev => ({ ...prev, error: `Failed to load next game: ${error.message}` }));
        }
    };

    // --- MODIFIED backToScoreboard function ---
    const backToScoreboard = () => {
        setMatchState(prev => ({ ...prev, phase: 'scoreboard' }));
        // --- NEW: Set isReviewingScoreboard to true to indicate we're just reviewing ---
        setIsReviewingScoreboard(true);
        console.log('Returning to scoreboard for review.');
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

    return (
        <div className="flex-grow flex items-center justify-center p-4">
            {matchState.phase === 'lobby' || matchState.phase === 'waiting' ? (
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
                    submitGameResults={submitGameResults}
                    backToScoreboard={backToScoreboard}
                />
            )}

            {matchState.phase === 'scoreboard' && (
                <Scoreboard
                    roomCode={roomCode}
                    matchState={matchState}
                    setMatchState={setMatchState}
                    isHost={isHost}
                    nextGame={nextGame}
                    // --- NEW PROP: Pass isReviewingScoreboard to Scoreboard ---
                    isReviewingScoreboard={isReviewingScoreboard}
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
