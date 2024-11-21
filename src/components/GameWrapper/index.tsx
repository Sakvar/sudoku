"use client"
import Button from '@mui/material/Button';
import React from 'react';
import { GlobalGameState, SudokuGuruDifficulty, Board } from '@/SudokuGame';
import { Stack } from '@mui/system';
import GameBoard from '../GameBoard';

export default function GameWrapper() {
  const [mounted, setMounted] = React.useState(false);
  const [gameState, setGameState] = React.useState<GlobalGameState>('notStarted');
  const [difficultyState, setDifficultyState] = React.useState<SudokuGuruDifficulty | ''>('');
  const [gameBoardState, setGameBoardState] = React.useState<Board | null>(null);
  
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleNewGame = React.useCallback(() => {
    setGameState('selectDifficulty');
  }, []);

  const handleStartGame = React.useCallback((difficulty: SudokuGuruDifficulty) => {
    setGameState('playing');
    setDifficultyState(difficulty);
    const newBoard = new Board(difficulty);
    setGameBoardState(newBoard);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div>
      <div>
        Game - {difficultyState}
      </div>
      {gameState === 'notStarted' && (
        <div className="startButton">
          <Button variant="outlined" onClick={handleNewGame}>New Game</Button>
        </div>
      )}
      
      {gameState === 'selectDifficulty' && (
        <Stack spacing={2}>
          {Object.values(SudokuGuruDifficulty).map((difficulty) => (
            <Button 
              key={difficulty}
              variant="outlined" 
              onClick={handleStartGame.bind(null, difficulty as SudokuGuruDifficulty)}
            >
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </Button>
          ))}
        </Stack>
      )}
      
      {gameState === 'playing' && (
        <div className="gameBoard">
          <GameBoard cells={gameBoardState?.cells} />
        </div>
      )}
    </div>
  )
}