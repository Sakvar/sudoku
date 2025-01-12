"use client"
import Button from '@mui/material/Button';
import React, { useState, useEffect } from 'react';
import { GlobalGameState, SudokuGuruDifficulty, Board, Cell, Digits } from '@/SudokuGame';
import { Stack } from '@mui/system';
import GameBoard from '../GameBoard';

export default function GameWrapper() {
  const [mounted, setMounted] = React.useState(false);
  const [gameState, setGameState] = React.useState<GlobalGameState>('notStarted');
  const [difficultyState, setDifficultyState] = React.useState<SudokuGuruDifficulty | ''>('');
  const [gameBoardState, setGameBoardState] = React.useState<Board | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [time, setTime] = useState(0);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (gameState === 'playing' && !intervalId) {
      const id = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
      setIntervalId(id);
    } else if (gameState !== 'playing' && intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [gameState, intervalId]);

  const handleNewGame = () => {
    setGameState('selectDifficulty');
    setGameBoardState(null);
    setTime(0);
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  };

  const checkGameSolved = (cells: Cell[]): boolean => {
    // Check if all cells are filled
    if (cells.some(cell => cell.value === 0)) {
      return false;
    }

    // Check each row
    for (let row = 0; row < 9; row++) {
      const rowValues = new Set();
      for (let col = 0; col < 9; col++) {
        rowValues.add(cells[row * 9 + col].value);
      }
      if (rowValues.size !== 9) return false;
    }

    // Check each column
    for (let col = 0; col < 9; col++) {
      const colValues = new Set();
      for (let row = 0; row < 9; row++) {
        colValues.add(cells[row * 9 + col].value);
      }
      if (colValues.size !== 9) return false;
    }

    // Check each 3x3 box
    for (let boxRow = 0; boxRow < 3; boxRow++) {
      for (let boxCol = 0; boxCol < 3; boxCol++) {
        const boxValues = new Set();
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) {
            const row = boxRow * 3 + i;
            const col = boxCol * 3 + j;
            boxValues.add(cells[row * 9 + col].value);
          }
        }
        if (boxValues.size !== 9) return false;
      }
    }

    return true;
  };

  const handleCellValueChange = (index: number, value: Digits) => {
    if (gameBoardState) {
      gameBoardState.cells[index].setUserValue(value);
      const newBoardState = new Board(gameBoardState.difficulty, gameBoardState.cells);
      setGameBoardState(newBoardState);

      // Check if game is solved after each move
      if (checkGameSolved(newBoardState.cells)) {
        handleGameSolved();
        // You might want to show a victory message
        alert(`Congratulations! You solved the puzzle in ${time} seconds!`);
      }
    }
  };

  const handleCellHintToggle = (index: number, hint: number) => {
    if (gameBoardState) {
      gameBoardState.cells[index].toggleHint(hint);
      setGameBoardState(new Board(gameBoardState.difficulty, gameBoardState.cells));
    }
  };

  const handleGameSolved = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    setGameState('notStarted');
  };

  const handleStartGame = (difficulty: SudokuGuruDifficulty) => {
    setGameState('playing');
    setDifficultyState(difficulty);
    setIsLoading(true);
    setTime(0); // Reset timer

    try {
      // Create new board immediately
      const newBoard = new Board(difficulty);
      setGameBoardState(newBoard);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to create new game:', error);
      setGameState('notStarted');
      setIsLoading(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div>
      <div>
        Game - {difficultyState} - Time: {time}s
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
              cells={gameBoardState?.cells || null}
              onCellValueChange={handleCellValueChange}
              onCellHintToggle={handleCellHintToggle}
            />
          )}
        </div>
      )}
    </div>
  )
}