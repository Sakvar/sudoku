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
  const [isLoading, setIsLoading] = React.useState(false);
  
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleNewGame = React.useCallback(() => {
    setGameState('selectDifficulty');
  }, []);

  const handleStartGame = React.useCallback(async (difficulty: SudokuGuruDifficulty) => {
    try {
      setIsLoading(true);
      setGameState('playing');
      setDifficultyState(difficulty);
      
      const newBoard = new Board(difficulty);
      await newBoard.initialize();
      
      setGameBoardState(newBoard);
    } catch (error) {
      console.error('Failed to start game:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleCellClick = (index: number) => {
    const cell = gameBoardState?.cells[index];
    if (cell?.isChangeable) {
      // Show input dialog or handle keyboard input
    }
  };

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
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <GameBoard 
              cells={gameBoardState?.cells} 
              onCellClick={handleCellClick}
            />
          )}
        </div>
      )}
    </div>
  )
}