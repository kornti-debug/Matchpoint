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

    const [matchState, setMatchState] = useState({
        phase: 'loading', // Start as loading, will be set by fetchMatchDetails
        currentGame: 0, // 0-based index
        totalGames: 0, // Will be set from game_sequence length
        players: [],
        scores: {},
        matchDetails: {
            matchname: '',
            room_code: roomCode,
            id: null,
            host_id: null,
            status: 'loading', // Backend status
            current_game_number: 0, // 0-based index
            game_sequence: [], // Array of game IDs
        },
        gameData: null,
        isLoading: true,
        error: ''
    });

    const [isReviewingScoreboard, setIsReviewingScoreboard] = useState(false);

    // --- MODIFIED fetchMatchDetails for better persistence handling ---
    const fetchMatchDetails = useCallback(async () => {
        setMatchState(prev => ({ ...prev, isLoading: true, error: '' }));
        try {
            const apiResponse = await apiService.getMatchDetails(roomCode);
            const matchData = apiResponse.match;

            // Determine frontend phase based on backend status
            let newPhase;
            let initialGameData = null;

            if (matchData?.status === 'waiting') {
                newPhase = 'lobby';
            } else if (matchData?.status === 'in_progress') {
                newPhase = 'game'; // Assume 'game' as default, might go to scoreboard if reviewing
                // If match is in progress, immediately try to fetch the current game's data
                if (matchData.game_sequence && matchData.game_sequence.length > matchData.current_game_number) {
                    const currentGameId = matchData.game_sequence[matchData.current_game_number];
                    initialGameData = await apiService.getGameData(currentGameId);
                } else {
                    // This scenario means in_progress but current_game_number is out of bounds or no sequence
                    console.error("Match in_progress but current_game_number is invalid or no sequence:", matchData);
                    newPhase = 'error'; // Fallback to error
                }
            } else if (matchData?.status === 'finished') {
                newPhase = 'finished';
            } else {
                newPhase = 'error'; // Unknown status
            }

            setMatchState(prev => ({
                ...prev,
                matchDetails: {
                    matchname: matchData?.matchname || `Match ${roomCode}`,
                    room_code: matchData?.room_code || roomCode,
                    id: matchData?.id || null,
                    host_id: matchData?.host_id || null,
                    status: matchData?.status || 'waiting',
                    current_game_number: matchData?.current_game_number || 0, // Ensure 0-based index
                    game_sequence: matchData?.game_sequence || [], // Ensure sequence is an array
                    ...matchData // Spread remaining match details
                },
                players: matchData?.players || [],
                scores: matchData?.scores || {},
                phase: newPhase, // Set phase based on backend status
                currentGame: matchData?.current_game_number || 0, // Keep 0-based index
                totalGames: matchData?.game_sequence?.length || 0, // Total games is length of sequence
                gameData: initialGameData, // Set game data if match is in progress
                isLoading: false
            }));
            console.log('MatchController: matchState after fetch:', { apiResponse, matchData, newPhase });

            // Reset review flag on every load
            setIsReviewingScoreboard(false);

        } catch (error) {
            console.error("Error fetching match details:", error);
            setMatchState(prev => ({
                ...prev,
                error: `Failed to load match details: ${error.message}`,
                isLoading: false,
                phase: 'error' // Set phase to error
            }));
        }
    }, [roomCode]);

    useEffect(() => {
        console.log('MatchController mounted with roomCode:', roomCode);
        fetchMatchDetails();
    }, [fetchMatchDetails]);


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
            await apiService.startMatch(roomCode); // This updates status in DB

            // Fetch first game's data using its ID from the sequence
            const gameSequence = matchState.matchDetails.game_sequence;
            if (!gameSequence || gameSequence.length === 0) {
                console.error("Cannot start match: No game sequence found in match details.");
                setMatchState(prev => ({ ...prev, error: "Match has no games selected. Please re-create." }));
                return;
            }
            const firstGameId = gameSequence[0];
            const game = await apiService.getGameData(firstGameId);

            setMatchState(prev => ({
                ...prev,
                phase: 'game',
                currentGame: 0, // Set current game INDEX to 0
                gameData: game, // Load fetched game data
                // Initialize scores if not already done, or ensure all joined players are in scores
                scores: prev.players.reduce((acc, player) => ({...acc, [player.id]: prev.scores[player.id] || 0}), {}),
                matchDetails: {
                    ...prev.matchDetails,
                    status: 'in_progress',
                    current_game_number: 0
                }
            }));
            setIsReviewingScoreboard(false);
            console.log('Match started in frontend (real API call).');

        } catch (error) {
            console.error('Failed to start match:', error);
            setMatchState(prev => ({ ...prev, error: `Failed to start match: ${error.message}` }));
        }
    };


    const submitGameResults = async (winners) => { // Removed 'points' param
        if (!Array.isArray(winners) || winners.length === 0) {
            console.error("Submit Game Results: Invalid winners array.");
            return;
        }

        // Calculate points based on game index (0-based index for game 0 gives 1 point)
        const pointsAwarded = matchState.currentGame + 1;

        try {
            const { updatedPlayers, updatedScores } = await apiService.saveGameResults(
                roomCode,
                matchState.currentGame, // Pass the game index
                winners,
                pointsAwarded // Pass the calculated points
            );

            setMatchState(prev => ({
                ...prev,
                scores: updatedScores,
                players: updatedPlayers,
                phase: 'scoreboard'
            }));
            setIsReviewingScoreboard(false);
            console.log('Game results saved to DB (real API). Transitioning to Scoreboard for next game.');

        } catch (error) {
            console.error('Failed to submit results:', error);
            setMatchState(prev => ({ ...prev, error: `Failed to submit results: ${error.message}` }));
        }
    };

    const nextGame = async () => {
        const nextGameIndex = matchState.currentGame + 1;
        const totalGamesInSequence = matchState.matchDetails.game_sequence?.length || 0;
        const isMatchFinished = nextGameIndex >= totalGamesInSequence;

        try {
            const { newStatus, newCurrentGameNumber, gameData } = await apiService.nextGame(
                roomCode,
                nextGameIndex,
                isMatchFinished
            );

            setMatchState(prev => ({
                ...prev,
                phase: newStatus === 'finished' ? 'finished' : 'game', // Use newStatus for phase
                currentGame: newCurrentGameNumber,
                gameData: gameData, // gameData will be null if finished
                matchDetails: {
                    ...prev.matchDetails,
                    status: newStatus,
                    current_game_number: newCurrentGameNumber
                }
            }));
            setIsReviewingScoreboard(false);
            console.log('Advanced to next game in frontend (real API call).');

        } catch (error) {
            console.error('Failed to load next game:', error);
            setMatchState(prev => ({ ...prev, error: `Failed to load next game: ${error.message}` }));
        }
    };

    const backToScoreboard = () => {
        setMatchState(prev => ({ ...prev, phase: 'scoreboard' }));
        setIsReviewingScoreboard(true);
        console.log('Returning to scoreboard for review.');
    };


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

    // --- Conditional Rendering based on phase ---
    // Check for 'loading' phase explicitly
    if (matchState.phase === 'loading') {
        return (
            <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center text-3xl font-bold">
                Loading Match...
            </div>
        );
    }

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

            {matchState.phase === 'game' && matchState.gameData && ( // Ensure gameData exists to render GameView
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

            {/* Fallback for unhandled phases or issues during rendering */}
            {matchState.phase === 'error' && (
                <div className="min-h-screen bg-gray-900 text-red-500 flex flex-col items-center justify-center text-xl p-4">
                    <p className="mb-4 font-bold">An error occurred during match initialization or phase transition.</p>
                    <p>{matchState.error}</p>
                    <button
                        onClick={fetchMatchDetails}
                        className="mt-6 bg-red-700 hover:bg-red-800 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300"
                    >
                        Try Again
                    </button>
                </div>
            )}
        </div>
    );
}

export default MatchController;
