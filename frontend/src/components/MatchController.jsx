/**
 * @fileoverview Main match controller component for Matchpoint game show
 * @author cc241070
 * @version 1.0.0
 * @description Handles real-time match state management, game flow, and UI rendering
 */

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import * as apiService from "../services/apiService.js";
import {
    connectSocket,
    onSocketEvent,
    offSocketEvent,
    disconnectSocket
} from "../services/socketClient.js";

// Import your components
import HostLobby from "./HostLobby.jsx";
import PlayerLobby from "./PlayerLobby.jsx";
import GameView from "./GameView.jsx";
import Scoreboard from "./Scoreboard.jsx";
import FinalResults from "./FinalResults.jsx";

// ============================================================================
// CONSTANTS AND TYPES
// ============================================================================

/**
 * @typedef {Object} MatchState
 * @property {string} phase - Current match phase: 'loading', 'lobby', 'game', 'scoreboard', 'finished', 'error'
 * @property {number} currentGame - Index of the current game (0-based)
 * @property {number} totalGames - Total number of games in the match
 * @property {Array} players - Array of player objects
 * @property {Object} scores - Player scores object
 * @property {Object} matchDetails - Match metadata
 * @property {Object|null} gameData - Current game data
 * @property {boolean} isLoading - Loading state flag
 * @property {string} error - Error message if any
 */

/**
 * @typedef {Object} MatchDetails
 * @property {string} matchname - Display name of the match
 * @property {string} room_code - Unique room code
 * @property {number|null} id - Match database ID
 * @property {number|null} host_id - Host user ID
 * @property {string} status - Match status: 'waiting', 'in_progress', 'finished'
 * @property {number} current_game_number - Current game index
 * @property {Array} game_sequence - Array of game IDs
 * @property {number|null} winner_id - Winner user ID
 */

// ============================================================================
// COMPONENT DEFINITION
// ============================================================================

/**
 * MatchController - Main component for managing match state and game flow
 * 
 * This component handles:
 * - Real-time match state synchronization via WebSocket
 * - Game phase transitions (lobby → game → scoreboard → finished)
 * - Player management and score tracking
 * - Host controls for match progression
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isHost - Whether the current user is the match host
 * @returns {JSX.Element} The rendered match interface
 */
function MatchController({ isHost }) {
    const {roomCode} = useParams();

    // ============================================================================
    // STATE MANAGEMENT
    // ============================================================================

    /**
     * Main match state containing all match-related data
     * @type {[MatchState, Function]}
     */
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

    /**
     * Controls whether the scoreboard is being reviewed (host-only feature)
     * @type {[boolean, Function]}
     */
    const [isReviewingScoreboard, setIsReviewingScoreboard] = useState(false);
    /**
     * Force flag to show scoreboard (debug/testing feature)
     * @type {[boolean, Function]}
     */
    const [forceShowScoreboard, setForceShowScoreboard] = useState(false);

    // ============================================================================
    // REFS FOR IMMEDIATE STATE ACCESS
    // ============================================================================

    /** @type {React.MutableRefObject<boolean>} Ref to track forceShowScoreboard for immediate access */
    const forceShowScoreboardRef = useRef(false);

    // Update ref when state changes
    useEffect(() => {
        forceShowScoreboardRef.current = forceShowScoreboard;
    }, [forceShowScoreboard]);

    // ============================================================================
    // CORE FUNCTIONS
    // ============================================================================

    /**
     * Fetches and updates match details from the API
     * Handles phase transitions based on match status and game data
     * 
     * @async
     * @function fetchMatchDetails
     * @returns {Promise<void>}
     */
    const fetchMatchDetails = useCallback(async () => {
        setMatchState(prev => ({ ...prev, isLoading: true, error: '' }));
        try {
            const apiResponse = await apiService.getMatchDetails(roomCode);
            const matchData = apiResponse.match; // Extract the 'match' object

            let newPhase;
            let initialGameData = null;

            // --- FORCE SHOW SCOREBOARD OVERRIDE ---
            if (forceShowScoreboardRef.current) {
                console.log('MatchController: forceShowScoreboard is true, showing scoreboard');
                newPhase = 'scoreboard';
            } else if (matchData?.status === 'waiting') {
                newPhase = 'lobby';
            } else if (matchData?.status === 'in_progress') {
                // FIXED: After submitting game results, we should show scoreboard
                // Check if we just submitted results (forceShowScoreboard is set) or if host is reviewing
                if (forceShowScoreboardRef.current || isReviewingScoreboard) {
                    console.log('MatchController: forceShowScoreboard or isReviewingScoreboard is true, showing scoreboard');
                    newPhase = 'scoreboard';
                } else {
                    console.log('MatchController: Neither flag is set, showing game. forceShowScoreboard:', forceShowScoreboardRef.current, 'isReviewingScoreboard:', isReviewingScoreboard);
                    // Only show game if we're not in a scoreboard state
                    newPhase = 'game';
                }

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
    }, [roomCode, isReviewingScoreboard]);


    // --- WebSocket Integration useEffect ---
    /**
     * Handles incoming WebSocket messages and triggers match data refresh
     * 
     * @param {Object} message - WebSocket message object
     */
    const handleSocketIoMessage = useCallback((message) => {
        console.log(`[MatchController] handleSocketIoMessage: WebSocket Message Received. Type: ${message?.type || 'Unknown'}. Full message:`, message);
        // Any match-related update from WebSocket triggers a full re-fetch to re-sync UI.
        fetchMatchDetails();
    }, [fetchMatchDetails]);

    useEffect(() => {
        connectSocket(roomCode);

        // Listen for the generic 'match_event' that your backend broadcasts
        onSocketEvent('match_event', handleSocketIoMessage);

        // Cleanup: Disconnect socket and remove listener when component unmounts
        return () => {
            disconnectSocket(roomCode);
            offSocketEvent('match_event', handleSocketIoMessage);
        };
    }, [roomCode]); // Remove handleSocketIoMessage from dependencies to prevent re-initialization


    // Initial data fetch on component mount
    useEffect(() => {
        console.log('MatchController: Initial data fetch triggered on mount.');
        fetchMatchDetails();
    }, [fetchMatchDetails]); // Only re-run if fetchMatchDetails changes (due to useCallback deps)


    // --- Game Flow Control Functions ---
    // These functions initiate API calls. The backend will then broadcast via WebSocket.
    // The `handleSocketIoMessage` will then trigger `fetchMatchDetails` to update the UI.

    /**
     * Starts the match and transitions from lobby to first game
     * Validates match state before starting
     * 
     * @async
     * @function startMatch
     * @returns {Promise<void>}
     */
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


    /**
     * Submits game results and awards points to winners
     * Handles transition to scoreboard or next game
     * 
     * @async
     * @function submitGameResults
     * @param {Array} winners - Array of winner user IDs
     * @param {number} pointsToAward - Points to award for this game
     * @returns {Promise<void>}
     */
    const submitGameResults = async (winners, pointsToAward) => {
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
                matchState.currentGame,
                winners,
                pointsToAward
            );
            console.log(`MatchController: Game results submitted with ${pointsToAward} points. Expecting WebSocket sync.`);

            // Handle transition based on whether this is the last game
            if (isLastGame) {
                console.log('MatchController: Last game submitted. Triggering match finish.');
                await apiService.nextGame(roomCode, matchState.totalGames, true);
                setIsReviewingScoreboard(false);
                setForceShowScoreboard(false);
                forceShowScoreboardRef.current = false;
            } else {
                console.log('MatchController: Setting forceShowScoreboard to true for scoreboard transition');
                setForceShowScoreboard(true);
                forceShowScoreboardRef.current = true; // Set ref immediately
                setIsReviewingScoreboard(false);
                console.log('MatchController: Game results submitted. Will show scoreboard after backend update.');
            }

        } catch (error) {
            console.error('MatchController: Failed to submit results:', error);
            setMatchState(prev => ({ ...prev, error: `Failed to submit results: ${error.message}` }));
        }
    };

    /**
     * Advances to the next game in the sequence or finishes the match
     * Handles transition from scoreboard to next game or final results
     * 
     * @async
     * @function nextGame
     * @returns {Promise<void>}
     */
    const nextGame = async () => {
        const nextGameIndex = matchState.currentGame + 1;
        const totalGamesInSequence = matchState.matchDetails.game_sequence?.length || 0;
        const isMatchFinished = nextGameIndex >= totalGamesInSequence;

        if (!matchState.matchDetails.id) {
            console.error("MatchController: Next Game - Match ID not available.");
            return;
        }

        try {
            await apiService.nextGame(
                roomCode,
                nextGameIndex,
                isMatchFinished
            );
            console.log('MatchController: API call to advance to next game sent. Expecting WebSocket sync.');

            // Reset review flags as we move past scoreboard
            setIsReviewingScoreboard(false);
            setForceShowScoreboard(false);
        } catch (error) {
            console.error('MatchController: Failed to load next game:', error);
            setMatchState(prev => ({ ...prev, error: `Failed to load next game: ${error.message}` }));
        }
    };

    /**
     * Returns to scoreboard for review (host-only feature)
     * Allows host to review scores before proceeding to next game
     * 
     * @function backToScoreboard
     */
    const backToScoreboard = () => {
        setMatchState(prev => ({ ...prev, phase: 'scoreboard' }));
        setIsReviewingScoreboard(true);
        console.log('MatchController: Returning to scoreboard for review (local UI).');
    };

    /**
     * Updates the match name via API call
     * 
     * @async
     * @function updateMatchNameHandler
     * @param {string} newMatchName - New name for the match
     * @returns {Promise<void>}
     */
    const updateMatchNameHandler = async (newMatchName) => {
        if (!matchState.matchDetails.id) {
            console.error("MatchController: Update Match Name - Match ID not available.");
            return;
        }
        try {
            await apiService.updateMatchName(roomCode, newMatchName);
            console.log('MatchController: API call to update match name sent. Expecting WebSocket sync.');
        } catch (error) {
            console.error('MatchController: Error updating match name:', error);
            throw error;
        }
    };

    /**
     * Resumes the current game from scoreboard review
     * Transitions back to game phase
     * 
     * @function resumeGame
     */
    const resumeGame = () => {
        setMatchState(prev => ({ ...prev, phase: 'game' }));
        setIsReviewingScoreboard(false);
    };

    // ============================================================================
    // RENDER LOGIC
    // ============================================================================

    // Loading state
    if (matchState.isLoading) {
        return (
            <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center text-3xl font-bold">
                Loading Match...
            </div>
        );
    }

    // Error state
    if (matchState.error && matchState.phase !== 'error') {
        return (
            <div className="min-h-screen bg-gray-900 text-red-500 flex flex-col items-center justify-center text-xl p-4">
                <p className="mb-4 font-bold">An error occurred during match initialization or phase transition.</p>
                <p>{matchState.error}</p>
                <button
                    onClick={fetchMatchDetails}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Retry
                </button>
            </div>
        );
    }

    // Phase-based rendering
    switch (matchState.phase) {
        case 'lobby':
            return isHost ? (
                <HostLobby
                    roomCode={roomCode}
                    matchState={matchState}
                    startMatch={startMatch}
                    updateMatchName={updateMatchNameHandler}
                />
            ) : (
                <PlayerLobby
                    roomCode={roomCode}
                    matchState={matchState}
                    setMatchState={setMatchState}
                />
            );

        case 'game':
            return (
                <GameView
                    roomCode={roomCode}
                    matchState={matchState}
                    isHost={isHost}
                    submitGameResults={submitGameResults}
                    backToScoreboard={backToScoreboard}
                />
            );

        case 'scoreboard':
            return (
                <Scoreboard
                    roomCode={roomCode}
                    matchState={matchState}
                    isHost={isHost}
                    nextGame={nextGame}
                    isReviewingScoreboard={isReviewingScoreboard}
                    resumeGame={resumeGame}
                />
            );

        case 'finished':
            return (
                <FinalResults
                    roomCode={roomCode}
                    matchState={matchState}
                    isHost={isHost}
                />
            );

        default:
            return (
                <div className="min-h-screen bg-gray-900 text-red-500 flex items-center justify-center text-xl">
                    Unknown match phase: {matchState.phase}
                </div>
            );
    }
}

export default MatchController;
