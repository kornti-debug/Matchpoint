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
            winner_id: null, // Ensure winner_id is part of initial state
        },
        gameData: null,
        isLoading: true,
        error: ''
    });

    const [isReviewingScoreboard, setIsReviewingScoreboard] = useState(false);

    const fetchMatchDetails = useCallback(async () => {
        setMatchState(prev => ({ ...prev, isLoading: true, error: '' }));
        try {
            const apiResponse = await apiService.getMatchDetails(roomCode);
            const matchData = apiResponse.match;

            let newPhase;
            let initialGameData = null;

            if (matchData?.status === 'waiting') {
                newPhase = 'lobby';
            } else if (matchData?.status === 'in_progress') {
                newPhase = 'game'; // Default to game view if in progress
                if (matchData.game_sequence && matchData.game_sequence.length > matchData.current_game_number) {
                    const currentGameId = matchData.game_sequence[matchData.current_game_number];
                    initialGameData = await apiService.getGameData(currentGameId);
                } else {
                    console.error("Match in_progress but current_game_number is invalid or no sequence:", matchData);
                    newPhase = 'error';
                }
            } else if (matchData?.status === 'finished') {
                newPhase = 'finished'; // If finished, go directly to final results
            } else {
                newPhase = 'error';
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
                    game_sequence: matchData?.game_sequence || [],
                    winner_id: matchData?.winner_id || null, // <-- Ensure winner_id is fetched
                    ...matchData
                },
                players: matchData?.players || [],
                scores: matchData?.scores || {},
                phase: newPhase,
                currentGame: matchData?.current_game_number || 0,
                totalGames: matchData?.game_sequence?.length || 0,
                gameData: initialGameData,
                isLoading: false
            }));
            console.log('MatchController: matchState after fetch:', { apiResponse, matchData, newPhase });

            setIsReviewingScoreboard(false);

        } catch (error) {
            console.error("Error fetching match details:", error);
            setMatchState(prev => ({
                ...prev,
                error: `Failed to load match details: ${error.message}`,
                isLoading: false,
                phase: 'error'
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
            await apiService.startMatch(roomCode);

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
                currentGame: 0,
                gameData: game,
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


    const submitGameResults = async (winners) => {
        if (!Array.isArray(winners) || winners.length === 0) {
            console.error("Submit Game Results: Invalid winners array.");
            return;
        }

        const pointsAwarded = matchState.currentGame + 1; // 0-indexed game 0 gives 1 point

        // --- NEW LOGIC: Check if this is the last game ---
        const isLastGame = (matchState.currentGame + 1) >= matchState.totalGames;
        let nextStatus = isLastGame ? 'finished' : 'scoreboard'; // If last game, go to finished, else scoreboard
        // --- END NEW LOGIC ---

        try {
            // Save results to DB (this call updates scores in match_players)
            const { updatedPlayers, updatedScores } = await apiService.saveGameResults(
                roomCode,
                matchState.currentGame,
                winners,
                pointsAwarded
            );

            // If it's the last game, we also need to update the match status in the DB to 'finished'
            // and trigger the final winner calculation/storage via nextGame API endpoint.
            // We call nextGame here to ensure backend transitions match status to 'finished' and records winner_id.
            if (isLastGame) {
                const { newStatus, newCurrentGameNumber, gameData } = await apiService.nextGame(
                    roomCode,
                    matchState.totalGames, // Use totalGames as the final index for 'finished' status
                    true // isMatchFinished = true
                );
                nextStatus = newStatus; // Ensure frontend phase matches backend's final status
                console.log('Last game submitted. Backend transitioned match to:', newStatus);

                // --- IMPORTANT: Trigger a fresh fetch for FinalResults to get winner_id ---
                // After the match is set to 'finished' by the backend, refetch details
                // to ensure we get the winner_id for display.
                await fetchMatchDetails(); // This will re-populate matchState with latest winner_id etc.
                // The phase will then be 'finished' from the refetch.
            }


            setMatchState(prev => ({
                ...prev,
                scores: updatedScores,
                players: updatedPlayers,
                phase: nextStatus // Set phase to 'finished' if it's the last game, else 'scoreboard'
            }));
            setIsReviewingScoreboard(false);
            console.log('Game results saved. Transitioning to:', nextStatus);


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
            // Call backend to advance match status and get next game data
            const { newStatus, newCurrentGameNumber, gameData } = await apiService.nextGame(
                roomCode,
                nextGameIndex,
                isMatchFinished
            );

            setMatchState(prev => ({
                ...prev,
                phase: newStatus === 'finished' ? 'finished' : 'game',
                currentGame: newCurrentGameNumber,
                gameData: gameData,
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

    if (matchState.error && matchState.phase !== 'error') { // Only show generic loading error if not explicitly in error phase
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
