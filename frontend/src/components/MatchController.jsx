// components/MatchController.jsx
import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import * as apiService from "../services/apiService.js";
import {
    connectSocket,
    disconnectSocket,
    onSocketEvent,
    offSocketEvent
} from "../services/socketClient.js";

// Import your components
import HostLobby from "./HostLobby.jsx";
import PlayerLobby from "./PlayerLobby.jsx";
import GameView from "./GameView.jsx";
import Scoreboard from "./Scoreboard.jsx";
import FinalResults from "./FinalResults.jsx";

function MatchController({ isHost }) {
    const { roomCode: rawRoomCode } = useParams();
    const roomCode = rawRoomCode.toLowerCase(); // NORMALIZE

    const [matchState, setMatchState] = useState({
        phase: 'loading',
        currentGame: 0,
        totalGames: 0,
        players: [],
        scores: {},
        matchDetails: {
            matchname: '',
            room_code: roomCode,
            id: null,
            host_id: null,
            status: 'loading',
            current_game_number: 0,
            game_sequence: [],
            winner_id: null,
        },
        gameData: null,
        isLoading: true,
        error: ''
    });

    const [isReviewingScoreboard, setIsReviewingScoreboard] = useState(false);
    const [forceShowScoreboard, setForceShowScoreboard] = useState(false);

    // Function to fetch match details from the API service
    const fetchMatchDetails = useCallback(async () => {
        setMatchState(prev => ({ ...prev, isLoading: true, error: '' }));
        try {
            const apiResponse = await apiService.getMatchDetails(roomCode);
            const matchData = apiResponse.match; // Extract the 'match' object

            // --- DEBUG: Console logs for clarity ---
            console.log('MatchController: fetchMatchDetails - Raw API Response:', apiResponse);
            console.log('MatchController: fetchMatchDetails - Extracted MatchData:', matchData);
            console.log('MatchController: fetchMatchDetails - Game Sequence (from MatchData):', matchData?.game_sequence, 'Type:', typeof matchData?.game_sequence, 'Is Array:', Array.isArray(matchData?.game_sequence));
            // --- END DEBUG ---

            let newPhase;
            let initialGameData = null;

            // --- FORCE SHOW SCOREBOARD OVERRIDE ---
            if (forceShowScoreboard) {
                newPhase = 'scoreboard';
            } else if (matchData?.status === 'waiting') {
                newPhase = 'lobby';
            } else if (matchData?.status === 'in_progress') {
                // CRITICAL FIX: If host explicitly set to review scoreboard (via backToScoreboard), maintain that phase.
                // Otherwise, if backend says 'in_progress' and we are not reviewing, we display the current game.
                newPhase = isReviewingScoreboard ? 'scoreboard' : 'game';

                // Fetch game data only if transitioning to the 'game' phase (i.e., not reviewing scoreboard).
                if (newPhase === 'game' && Array.isArray(matchData.game_sequence) && matchData.game_sequence.length > matchData.current_game_number && matchData.current_game_number >= 0) {
                    const currentGameId = matchData.game_sequence[matchData.current_game_number];
                    console.log(`MatchController: fetchMatchDetails - Attempting to get game data for ID: ${currentGameId}`);
                    initialGameData = await apiService.getGameData(currentGameId); // Use the correct API call
                    console.log(`MatchController: fetchMatchDetails - Successfully got gameData for ID ${currentGameId}:`, initialGameData);
                } else if (newPhase === 'game') { // This specific else if is for the case where game sequence is bad
                    console.error("MatchController: fetchMatchDetails - Match in_progress but current_game_number is invalid or no sequence (for game data fetch):", matchData);
                    newPhase = 'error';
                }
            } else if (matchData?.status === 'finished') {
                newPhase = 'finished'; // If finished, go directly to final results
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
                    current_game_number: matchData?.current_game_number || 0,
                    game_sequence: Array.isArray(matchData?.game_sequence) ? matchData.game_sequence : [], // Ensure it's an array
                    winner_id: matchData?.winner_id || null,
                },
                players: matchData?.players || [],
                scores: matchData?.scores || {},
                phase: newPhase,
                currentGame: matchData?.current_game_number || 0,
                totalGames: Array.isArray(matchData?.game_sequence) ? matchData.game_sequence.length : 0, // Calculate totalGames
                gameData: initialGameData,
                isLoading: false
            }));
            console.log('MatchController: matchState after fetch (final state set):', { apiResponse, matchData, newPhase });

            // Only reset isReviewingScoreboard if we actually transitioned away from a scoreboard state
            // or if the backend status changed to 'finished' or 'waiting' (not 'in_progress').
            // This prevents `fetchMatchDetails` from prematurely setting it to false if the host JUST clicked submit.
            if (newPhase !== 'scoreboard' && matchData?.status !== 'in_progress') { // Removed redundant `&& matchData?.status !== 'in_progress'`
                setIsReviewingScoreboard(false);
            }

        } catch (error) {
            console.error("MatchController: Error in fetchMatchDetails caught block:", error);
            setMatchState(prev => ({
                ...prev,
                error: `Failed to load match details: ${error.message}`,
                isLoading: false,
                phase: 'error'
            }));
        }
    }, [roomCode, isReviewingScoreboard, forceShowScoreboard]); // Add forceShowScoreboard as a dependency


    // --- WebSocket Integration useEffect ---
    const handleSocketIoMessage = useCallback((message) => {
        console.log(`[MatchController] handleSocketIoMessage: WebSocket Message Received. Type: ${message?.type || 'Unknown'}. Full message:`, message);
        // Any match-related update from WebSocket triggers a full re-fetch to re-sync UI.
        fetchMatchDetails();
    }, [fetchMatchDetails]);

    useEffect(() => {
        console.log('MatchController: Setting up WebSocket connection for room:', roomCode);
        connectSocket(roomCode);

        // Listen for the generic 'match_event' that your backend broadcasts
        onSocketEvent('match_event', handleSocketIoMessage);

        // Cleanup: Disconnect socket and remove listener when component unmounts
        return () => {
            console.log('MatchController: Cleaning up WebSocket connection for room:', roomCode);
            disconnectSocket(roomCode);
            offSocketEvent('match_event', handleSocketIoMessage);
        };
    }, [roomCode, handleSocketIoMessage]);


    // Initial data fetch on component mount
    useEffect(() => {
        console.log('MatchController: Initial data fetch triggered on mount.');
        fetchMatchDetails();
    }, [fetchMatchDetails]); // Only re-run if fetchMatchDetails changes (due to useCallback deps)


    // --- Game Flow Control Functions ---
    // These functions initiate API calls. The backend will then broadcast via WebSocket.
    // The `handleSocketIoMessage` will then trigger `fetchMatchDetails` to update the UI.

    const startMatch = async () => {
        // Ensure phase and status are correct for starting
        if (matchState.phase !== 'lobby' || matchState.matchDetails.status !== 'waiting') {
            console.warn("MatchController: Cannot start match: Not in lobby/waiting phase.");
            return;
        }
        if (matchState.players.length === 0) {
            console.warn("MatchController: Cannot start match: No players have joined yet.");
            return;
        }
        if (!matchState.matchDetails.id) {
            console.error("MatchController: Cannot start match: Match ID not available.");
            return;
        }
        if (!matchState.matchDetails.game_sequence || matchState.matchDetails.game_sequence.length === 0) {
            console.error("MatchController: Cannot start match: No game sequence found in match details.");
            setMatchState(prev => ({ ...prev, error: "Match has no games selected. Please re-create." }));
            return;
        }

        try {
            await apiService.startMatch(roomCode);
            console.log('MatchController: API call to start match sent. Expecting WebSocket sync for UI update.');
        } catch (error) {
            console.error('MatchController: Failed to start match (API error):', error);
            setMatchState(prev => ({ ...prev, error: `Failed to start match: ${error.message}` }));
        }
    };


    const submitGameResults = async (winners, pointsToAward) => { // 'pointsToAward' is the value sent from GameView (e.g., currentGameIndex + 1)
        if (!Array.isArray(winners) || winners.length === 0) {
            console.error("MatchController: Submit Game Results - Invalid winners array.");
            return;
        }
        if (!matchState.matchDetails.id) {
            console.error("MatchController: Submit Game Results - Match ID not available.");
            return;
        }

        const isLastGame = (matchState.currentGame + 1) >= matchState.totalGames;

        try {
            await apiService.submitGameResults(
                roomCode,
                matchState.currentGame, // This is the 0-indexed game number (index)
                winners,
                pointsToAward // Use the explicitly determined points from GameView or here
            );
            console.log(`MatchController: API call to submit game results sent with ${pointsToAward} points. Expecting WebSocket sync for scores update.`);

            // --- CRITICAL FIX: Explicitly transition to scoreboard OR finish match locally ---
            if (isLastGame) {
                console.log('MatchController: Last game submitted. Triggering nextGame API call to finish match.');
                // This call will update backend status to 'finished', which will then trigger fetchMatchDetails to change phase to 'finished'
                await apiService.nextGame(roomCode, matchState.totalGames, true);
                setIsReviewingScoreboard(false); // Reset for final results
                setForceShowScoreboard(false);
            } else {
                setForceShowScoreboard(true); // Ensure scoreboard is shown after submit and persists until next game
                setIsReviewingScoreboard(false);
                // No need to set phase here; fetchMatchDetails will handle it
                console.log('MatchController: Game results submitted. Will show scoreboard after backend update.');
            }
            // --- END CRITICAL FIX ---

        } catch (error) {
            console.error('MatchController: Failed to submit results (API error):', error);
            setMatchState(prev => ({ ...prev, error: `Failed to submit results: ${error.message}` }));
        }
    };

    const nextGame = async () => {
        const nextGameIndex = matchState.currentGame + 1; // This is the next 0-indexed game number (index)
        const totalGamesInSequence = matchState.matchDetails.game_sequence?.length || 0;
        const isMatchFinished = nextGameIndex >= totalGamesInSequence;

        if (!matchState.matchDetails.id) {
            console.error("MatchController: Next Game - Match ID not available.");
            return;
        }

        try {
            await apiService.nextGame(
                roomCode,
                nextGameIndex, // Pass the 0-indexed index of the NEXT game
                isMatchFinished
            );
            console.log('MatchController: API call to advance to next game sent. Expecting WebSocket sync for UI update.');

            // After successful nextGame API call (which updates backend status),
            // fetchMatchDetails (triggered by WebSocket) will handle the phase transition
            // to 'game' for the next game, or 'finished' if it's the end.
            setIsReviewingScoreboard(false); // Reset this flag as we are now moving past scoreboard review (to next game or final results)
            setForceShowScoreboard(false); // Allow phase to move on from scoreboard
        } catch (error) {
            console.error('MatchController: Failed to load next game (API error):', error);
            setMatchState(prev => ({ ...prev, error: `Failed to load next game: ${error.message}` }));
        }
    };

    const backToScoreboard = () => {
        // This is a local UI change for the host to review the scoreboard.
        setMatchState(prev => ({ ...prev, phase: 'scoreboard' }));
        setIsReviewingScoreboard(true); // Set to true when entering scoreboard review
        console.log('MatchController: Returning to scoreboard for review (local UI).');
    };

    const updateMatchNameHandler = async (newMatchName) => {
        if (!matchState.matchDetails.id) {
            console.error("MatchController: Update Match Name - Match ID not available.");
            return;
        }
        try {
            await apiService.updateMatchName(roomCode, newMatchName);
            console.log('MatchController: API call to update match name sent. Expecting WebSocket sync.');
        } catch (error) {
            console.error('MatchController: Error updating match name (API error):', error);
            throw error;
        }
    };

    const resumeGame = () => {
        setMatchState(prev => ({ ...prev, phase: 'game' }));
        setIsReviewingScoreboard(false);
    };

    // --- Conditional Rendering for different match phases/states ---

    if (matchState.isLoading) {
        return (
            <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center text-3xl font-bold">
                Loading Match...
            </div>
        );
    }

    if (matchState.error && matchState.phase !== 'error') {
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
            {/* The small top-left debug header is now removed definitively */}

            {matchState.phase === 'lobby' && (
                isHost ?
                    <HostLobby
                        roomCode={roomCode}
                        matchState={matchState}
                        setMatchState={setMatchState}
                        startMatch={startMatch}
                        updateMatchName={updateMatchNameHandler}
                    /> :
                    <PlayerLobby
                        roomCode={roomCode}
                        matchState={matchState}
                        setMatchState={setMatchState}
                    />
            )}

            {matchState.phase === 'game' && matchState.gameData && (
                <GameView
                    roomCode={roomCode}
                    matchState={matchState}
                    setMatchState={setMatchState}
                    isHost={isHost}
                    submitGameResults={submitGameResults}
                    backToScoreboard={backToScoreboard}
                />
            )}

            {/* Render Scoreboard explicitly when phase is 'scoreboard' */}
            {matchState.phase === 'scoreboard' && (
                <Scoreboard
                    roomCode={roomCode}
                    matchState={matchState}
                    setMatchState={setMatchState}
                    isHost={isHost}
                    nextGame={nextGame}
                    isReviewingScoreboard={isReviewingScoreboard}
                    resumeGame={resumeGame}
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
