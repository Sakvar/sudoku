"use client"
import Button from '@mui/material/Button';
import React, { useState, useEffect } from 'react';
import { GlobalGameState, SudokuGuruDifficulty, Board, Cell, Digits, Cells } from '@/SudokuGame';
import { Stack } from '@mui/system';
import GameBoard from '../GameBoard';
import SettingsIcon from '@mui/icons-material/Settings';
import GameSettings from '../GameSettings';
import { GameSettingsType } from '@/types';
import styles from './GameWrapper.module.css';
import { Dialog } from '@mui/material';

interface SavedGameState {
  gameState: GlobalGameState;
  difficultyState: SudokuGuruDifficulty | '';
  boardState: {
    difficulty: SudokuGuruDifficulty;
    cells: {
      value: number;
      isInitial: boolean;
      userValue: number;
      hints: boolean[];
    }[];
  } | null;
  timestamp: number;
}

export default function GameWrapper() {
  const [mounted, setMounted] = React.useState(false);
  const [gameState, setGameState] = React.useState<GlobalGameState>('notStarted');
  const [difficultyState, setDifficultyState] = React.useState<SudokuGuruDifficulty | ''>('');
  const [gameBoardState, setGameBoardState] = React.useState<Board | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [time, setTime] = useState(0);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = React.useState<GameSettingsType>(() => {
    const defaultSettings = {
      highlightRowAndColumn: true,
      highlightSameNumbers: true,
      highlightSameHints: true,
      highlightCrossForNumbers: true,
      highlightCrossForHints: false,
      hideImpossibleValuesInSelector: true,
      hideImpossibleValuesInHints: true,
      highlightCurrentQuadrant: true,
      highlightQuadrantsWithSameNumber: true,
      highlightAllObviousCells: true,
      highlightObviousCellsForCurrentNumber: true,
      autofillObviousNumbers: false,
    };
    
    const savedSettings = localStorage.getItem('sudokuGameSettings');
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      
      // Migrate old settings
      if ('highlightObviousCell' in parsedSettings) {
        parsedSettings.highlightAllObviousCells = parsedSettings.highlightObviousCell;
        delete parsedSettings.highlightObviousCell;
        
        // Save migrated settings back to localStorage
        localStorage.setItem('sudokuGameSettings', JSON.stringify(parsedSettings));
      }
      
      return { ...defaultSettings, ...parsedSettings };
    }
    
    return defaultSettings;
  });

  const handleSettingChange = (setting: keyof GameSettingsType) => {
    const newSettings = {
      ...settings,
      [setting]: !settings[setting]
    };
    setSettings(newSettings);
    localStorage.setItem('sudokuGameSettings', JSON.stringify(newSettings));
  };

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

  // Load saved game state on mount
  useEffect(() => {
    const savedState = localStorage.getItem('sudokuGameState');
    if (savedState) {
      try {
        const parsed: SavedGameState = JSON.parse(savedState);
        setGameState(parsed.gameState);
        setDifficultyState(parsed.difficultyState);
        
        // Calculate elapsed time from start timestamp
        const elapsedTime = Math.floor((Date.now() - parsed.timestamp) / 1000);
        setTime(elapsedTime);
        
        if (parsed.boardState) {
          const restoredCells = parsed.boardState.cells.map(cell => {
            const newCell = new Cell({
              initialValue: cell.isInitial ? cell.value as Digits : 0,
              solutionValue: cell.value as Digits
            });
            
            // If it's a user-entered value, set it via setUserValue
            if (!cell.isInitial && cell.value) {
              newCell.setUserValue(cell.value as Digits);
            }
            
            // Restore hints
            cell.hints.forEach((isSet, index) => {
              if (isSet) newCell.toggleHint(index + 1);
            });
            return newCell;
          });
          
          // Ensure we have a complete set of cells (81 for a Sudoku board)
          if (restoredCells.length === 81) {
            setGameBoardState(new Board(parsed.boardState.difficulty, restoredCells as Cells));
          }
        }
      } catch (error) {
        console.error('Failed to restore game state:', error);
      }
    }
  }, []);

  // First effect for game state
  useEffect(() => {
    if (gameState === 'playing' && gameBoardState) {
      const stateToSave: SavedGameState = {
        gameState,
        difficultyState,
        boardState: {
          difficulty: gameBoardState.difficulty,
          cells: gameBoardState.cells.map(cell => ({
            value: cell.value,
            isInitial: cell.getInitialValue !== 0,
            userValue: cell.getUserValue,
            hints: cell.draftValues,
          }))
        },
        timestamp: Date.now()
      };
      
      localStorage.setItem('sudokuGameState', JSON.stringify(stateToSave));
    }
  }, [gameState, difficultyState, gameBoardState]);

  const handleNewGame = () => {
    // Clear saved state when starting new game
    localStorage.removeItem('sudokuGameState');
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
      // Create a new cells array to ensure state update
      const newCells = [...gameBoardState.cells] as Cells;
      newCells[index].setUserValue(value);
      
      // Create new board with new cells
      const newBoardState = new Board(gameBoardState.difficulty, newCells);
      
      // Force a rerender of GameBoard by creating a new cells reference
      newBoardState.cells = [...newBoardState.cells] as Cells;

      // Update board state
      setGameBoardState(newBoardState);

      // Check if game is solved
      if (checkGameSolved(newCells)) {
        handleGameSolved();
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

  const handleStartGame = async (difficulty: SudokuGuruDifficulty) => {
    setIsLoading(true);
    setTime(0);

    try {
      // Create new board immediately
      const newBoard = new Board(difficulty);
      
      // Wait for the board to be fully initialized
      await newBoard.initialize(); // Make sure Board class has this method
      
      // Only save and update state after board is fully ready
      const initialState: SavedGameState = {
        gameState: 'playing',
        difficultyState: difficulty,
        boardState: {
          difficulty: difficulty,
          cells: newBoard.cells.map(cell => ({
            value: cell.value,
            isInitial: cell.getInitialValue !== 0,
            userValue: cell.getUserValue,
            hints: cell.draftValues,
          }))
        },
        timestamp: Date.now()
      };

      // Save to localStorage only after board is fully initialized
      localStorage.setItem('sudokuGameState', JSON.stringify(initialState));
      
      // Update React state after everything is ready
      setGameState('playing');
      setDifficultyState(difficulty);
      setGameBoardState(newBoard);
    } catch (error) {
      console.error('Failed to create new game:', error);
      setGameState('notStarted');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Add findObviousCells function
  const findObviousCells = (cells: Cells): Map<number, Digits> => {
    console.log('Starting findObviousCells');
    const obviousCells = new Map<number, Digits>();

    // For each empty cell
    for (let cellIndex = 0; cellIndex < 81; cellIndex++) {
      const row = Math.floor(cellIndex / 9);
      const col = cellIndex % 9;
      
      // Only analyze lower left quadrant (rows 6-8, cols 0-2)
      const isLowerLeft = row >= 6 && col < 3;
      if (!isLowerLeft) continue;

      if (cells[cellIndex].value !== 0) {
        // console.log(`\nCell #${cellIndex} (${row},${col}): Already has value ${cells[cellIndex].value}`);
        continue;
      }

      console.log(`\nCell #${cellIndex} (${row},${col}):`);
      const possibleValues = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]);
      console.log('Starting with all values:', Array.from(possibleValues));

      // Check vertical
      console.log('Checking vertical:');
      for (let r = 0; r < 9; r++) {
        const value = cells[r * 9 + col].value;
        if (value !== 0) {
          possibleValues.delete(value);
          console.log(`  Excluding ${value} (found at row ${r})`);
        }
      }
      console.log('Values after vertical check:', Array.from(possibleValues));

      // Check horizontal
      console.log('Checking horizontal:');
      for (let c = 0; c < 9; c++) {
        const value = cells[row * 9 + c].value;
        if (value !== 0) {
          possibleValues.delete(value);
          console.log(`  Excluding ${value} (found at column ${c})`);
        }
      }
      console.log('Values after horizontal check:', Array.from(possibleValues));

      // Check quadrant
      const boxStartRow = Math.floor(row / 3) * 3;
      const boxStartCol = Math.floor(col / 3) * 3;
      console.log('Checking quadrant:');
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const value = cells[(boxStartRow + r) * 9 + boxStartCol + c].value;
          if (value !== 0) {
            if (possibleValues.has(value)) {
              possibleValues.delete(value);
              console.log(`  Excluding ${value} (found at quadrant position ${r},${c})`);
            }
          }
        }
      }
      console.log('Values after quadrant check:', Array.from(possibleValues));

      // Check if any remaining value must go here
      if (possibleValues.size > 0) {
        console.log('Checking if any remaining value must go here:');
        for (const value of Array.from(possibleValues)) {
          let canGoElsewhere = false;
          
          // Check other empty cells in same box
          for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
              const otherIndex = (boxStartRow + r) * 9 + boxStartCol + c;
              if (otherIndex === cellIndex) continue;
              
              if (cells[otherIndex].value === 0) {
                let possible = true;
                // Check if value can go in this other cell
                for (let i = 0; i < 9; i++) {
                  if (cells[(boxStartRow + r) * 9 + i].value === value || 
                      cells[i * 9 + (boxStartCol + c)].value === value) {
                    possible = false;
                    break;
                  }
                }
                if (possible) {
                  canGoElsewhere = true;
                  console.log(`  Value ${value} can also go at cell ${otherIndex}`);
                  break;
                }
              }
            }
            if (canGoElsewhere) break;
          }
          
          if (!canGoElsewhere) {
            console.log(`  Value ${value} must go here - can't go anywhere else in quadrant`);
            obviousCells.set(cellIndex, value as Digits);
            break;
          }
        }
      }

      console.log('Final possible values:', Array.from(possibleValues));
      if (possibleValues.size === 1) {
        const [value] = possibleValues;
        console.log(`This is an obvious cell - only possible value is ${value}`);
        obviousCells.set(cellIndex, value as Digits);
      }
    }

    console.log('\nAll obvious cells found:', Array.from(obviousCells.entries()));
    return obviousCells;
  };

  // Add effect for autofill
  React.useEffect(() => {
    if (settings.autofillObviousNumbers && gameBoardState) {
      console.log('Checking for obvious numbers to autofill...');
      
      // Track which cells we've filled to avoid duplicates
      const filledCells = new Set<number>();
      
      // First pass: Check each empty cell for single possible value
      for (let cellIndex = 0; cellIndex < 81; cellIndex++) {
        const cell = gameBoardState.cells[cellIndex];
        if (cell.value !== 0) continue;
        
        const row = Math.floor(cellIndex / 9);
        const col = cellIndex % 9;
        const boxStartRow = Math.floor(row / 3) * 3;
        const boxStartCol = Math.floor(col / 3) * 3;
        
        const possibleValues = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        
        // Remove values from row, column, and box
        for (let i = 0; i < 9; i++) {
          possibleValues.delete(gameBoardState.cells[row * 9 + i].value);
          possibleValues.delete(gameBoardState.cells[i * 9 + col].value);
        }
        
        for (let r = 0; r < 3; r++) {
          for (let c = 0; c < 3; c++) {
            possibleValues.delete(gameBoardState.cells[(boxStartRow + r) * 9 + boxStartCol + c].value);
          }
        }
        
        if (possibleValues.size === 1) {
          const [value] = possibleValues;
          console.log(`Filling cell ${cellIndex} with ${value} (only possible value)`);
          handleCellValueChange(cellIndex, value as Digits);
          filledCells.add(cellIndex);
        }
      }
      
      // Second pass: Check each box for numbers that can only go in one spot
      for (let boxRow = 0; boxRow < 3; boxRow++) {
        for (let boxCol = 0; boxCol < 3; boxCol++) {
          const boxStartRow = boxRow * 3;
          const boxStartCol = boxCol * 3;
          
          // For each digit 1-9
          for (let digit = 1; digit <= 9; digit++) {
            // Skip if this number already exists in the box
            let exists = false;
            let possibleSpots = [];
            
            // Check each cell in the box
            for (let r = 0; r < 3; r++) {
              for (let c = 0; c < 3; c++) {
                const cellIndex = (boxStartRow + r) * 9 + boxStartCol + c;
                const cellValue = gameBoardState.cells[cellIndex].value;
                
                if (cellValue === digit) {
                  exists = true;
                  break;
                }
                
                if (cellValue === 0 && !filledCells.has(cellIndex)) {
                  const row = boxStartRow + r;
                  const col = boxStartCol + c;
                  let possible = true;
                  
                  // Check row and column
                  for (let i = 0; i < 9; i++) {
                    if (gameBoardState.cells[row * 9 + i].value === digit || 
                        gameBoardState.cells[i * 9 + col].value === digit) {
                      possible = false;
                      break;
                    }
                  }
                  
                  if (possible) {
                    possibleSpots.push(cellIndex);
                  }
                }
              }
              if (exists) break;
            }
            
            // If number isn't in box yet and has only one possible spot
            if (!exists && possibleSpots.length === 1) {
              const cellIndex = possibleSpots[0];
              console.log(`Filling cell ${cellIndex} with ${digit} (only possible position in box)`);
              handleCellValueChange(cellIndex, digit as Digits);
              filledCells.add(cellIndex);
            }
          }
        }
      }
    }
  }, [settings.autofillObviousNumbers, gameBoardState, handleCellValueChange]);

  if (!mounted) {
    return null;
  }

  return (
    <div className={styles.gameWrapper}>
      <div className={styles.gameHeader}>
        <div className={styles.title}>
          <span className={styles.difficulty}>
            Game - {difficultyState}
          </span>
          <span className={styles.timer}>
            {" - Time: "}{formatTime(time)}
          </span>
        </div>
        <Button 
          className={styles.settingsButton}
          onClick={() => setIsSettingsOpen(true)}
          aria-label="Settings"
        >
          <SettingsIcon />
        </Button>
      </div>

      {isLoading ? (
        <div className={styles.loadingContainer}>
          Loading...
        </div>
      ) : (
        <>
          <Stack spacing={2} sx={{ 
            width: '100%',
            '& .MuiButton-root': {
              height: '36px',
              borderRadius: '4px',
              textTransform: 'uppercase',
              color: 'rgb(25, 118, 210)',
              borderColor: 'rgb(25, 118, 210)',
              '&:hover': {
                borderColor: 'rgb(25, 118, 210)',
                backgroundColor: 'rgba(25, 118, 210, 0.04)'
              }
            }
          }}>
            {gameState !== 'selectDifficulty' && (
              <Button 
                variant="outlined" 
                onClick={handleNewGame}
                fullWidth
              >
                New Game
              </Button>
            )}
            
            {gameState === 'playing' && (
              <Button 
                variant="outlined"
                onClick={() => {
                  if (gameBoardState) {
                    const resetCells = gameBoardState.cells.map(cell => {
                      const newCell = new Cell({
                        initialValue: cell.getInitialValue,
                        solutionValue: cell.getInitialValue
                      });
                      return newCell;
                    });
                    
                    setGameBoardState(new Board(gameBoardState.difficulty, resetCells as Cells));
                  }
                }}
                fullWidth
              >
                Start from scratch
              </Button>
            )}

            {gameState === 'selectDifficulty' && (
              Object.values(SudokuGuruDifficulty).map((difficulty) => (
                <Button 
                  key={difficulty}
                  variant="outlined" 
                  onClick={() => handleStartGame(difficulty as SudokuGuruDifficulty)}
                  fullWidth
                >
                  {difficulty}
                </Button>
              ))
            )}
          </Stack>

          {gameState === 'playing' && (
            <div className={styles.gameBoard}>
              <GameBoard
                cells={gameBoardState?.cells || null}
                onCellValueChange={handleCellValueChange}
                onCellHintToggle={handleCellHintToggle}
                settings={settings}
              />
            </div>
          )}
        </>
      )}
      <Dialog 
        open={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <GameSettings
          settings={settings}
          onSettingChange={handleSettingChange}
          onClose={() => setIsSettingsOpen(false)}
          open={isSettingsOpen}
        />
      </Dialog>
    </div>
  )
}