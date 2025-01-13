import { Cells, Digits, Cell } from '@/SudokuGame';
import React from 'react';
import { GameSettingsType } from '@/types';
import styles from './GameBoard.module.css';
import CellPopup from '../CellPopup';

interface GameBoardProps {
  cells: Cells | null;
  onCellValueChange: (index: number, value: Digits) => void;
  onCellHintToggle: (index: number, hint: number) => void;
  settings: GameSettingsType;
}

interface CellContentProps {
  cell: Cell;
  highlightedHints: Set<number>;
  settings: GameSettingsType;
}

export default function GameBoard({ cells, onCellValueChange, onCellHintToggle, settings }: GameBoardProps) {
  const [selectedForEdit, setSelectedForEdit] = React.useState<number | null>(null);
  const [clickedCell, setClickedCell] = React.useState<number | null>(null);
  const [highlightedCells, setHighlightedCells] = React.useState<Set<number>>(new Set());
  const [highlightedHints, setHighlightedHints] = React.useState<Set<number>>(new Set());
  const [isPencilMode, setIsPencilMode] = React.useState(false);

  const calculateHighlights = React.useCallback((cells: Cells | null, index: number, value: Digits, settings: GameSettingsType) => {
    if (!cells) return {
      cellHighlights: new Set<number>(),
      hintHighlights: new Set<number>()
    };
    
    const row = Math.floor(index / 9);
    const col = index % 9;
    const boxStartRow = Math.floor(row / 3) * 3;
    const boxStartCol = Math.floor(col / 3) * 3;
    
    const cellHighlights = new Set<number>();
    const hintHighlights = new Set<number>();

    // Highlight current 3x3 quadrant
    if (settings.highlightCurrentQuadrant) {
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          cellHighlights.add((boxStartRow + i) * 9 + (boxStartCol + j));
        }
      }
    }

    // Row and column highlights for clicked cell
    if (settings.highlightRowAndColumn) {
      for (let i = 0; i < 9; i++) {
        cellHighlights.add(row * 9 + i);
        cellHighlights.add(i * 9 + col);
      }
    }

    // Number highlights
    if (value !== 0) {
      cellHighlights.add(index);

      if (settings.highlightSameNumbers) {
        // First find all cells with the same number
        const matchingCells: number[] = [];
        for (let i = 0; i < 81; i++) {
          if (cells[i].value === value) {
            cellHighlights.add(i);
            matchingCells.push(i);
            
            // Highlight quadrants containing same number
            if (settings.highlightQuadrantsWithSameNumber) {
              const matchRow = Math.floor(i / 9);
              const matchCol = i % 9;
              const matchBoxStartRow = Math.floor(matchRow / 3) * 3;
              const matchBoxStartCol = Math.floor(matchCol / 3) * 3;
              
              // Add all cells in the matching number's quadrant
              for (let r = 0; r < 3; r++) {
                for (let c = 0; c < 3; c++) {
                  cellHighlights.add((matchBoxStartRow + r) * 9 + (matchBoxStartCol + c));
                }
              }
            }
          }
        }

        // Then highlight crosses for all matching cells if enabled
        if (settings.highlightCrossForNumbers) {
          matchingCells.forEach(cellIndex => {
            const matchRow = Math.floor(cellIndex / 9);
            const matchCol = cellIndex % 9;
            for (let i = 0; i < 9; i++) {
              cellHighlights.add(matchRow * 9 + i);
              cellHighlights.add(i * 9 + matchCol);
            }
          });
        }
      }
      
      if (settings.highlightSameHints) {
        hintHighlights.add(value);
        
        // Find cells with matching hints and highlight their crosses if enabled
        if (settings.highlightCrossForHints) {
          for (let i = 0; i < 81; i++) {
            if (cells[i].value === 0 && cells[i].draftValues[value - 1]) {
              const hintRow = Math.floor(i / 9);
              const hintCol = i % 9;
              // Highlight crosses for cells with matching hints
              for (let j = 0; j < 9; j++) {
                cellHighlights.add(hintRow * 9 + j);
                cellHighlights.add(j * 9 + hintCol);
              }
            }
          }
        }
      }
    } 
    
    // Hint highlights
    else if (settings.highlightSameHints) {
      const selectedCellHints = cells[index].draftValues;
      const clickedHintIndex = selectedCellHints.findIndex(isSet => isSet);
      
      if (clickedHintIndex !== -1 && selectedCellHints.filter(isSet => isSet).length === 1) {
        hintHighlights.add(clickedHintIndex + 1);
        cellHighlights.add(index);
        
        for (let i = 0; i < 81; i++) {
          if (i !== index && cells[i].value === 0 && cells[i].draftValues[clickedHintIndex]) {
            cellHighlights.add(i);
          }
        }
      }
    }

    return { cellHighlights, hintHighlights };
  }, []);

  // Update the useEffect to make sure we're setting the hints correctly
  React.useEffect(() => {
    if (clickedCell !== null && cells) {
      const value = cells[clickedCell].value;
      const { cellHighlights, hintHighlights } = calculateHighlights(cells, clickedCell, value, settings);
      
      setHighlightedCells(cellHighlights);
      // Always set the hint highlights if we have them
      setHighlightedHints(hintHighlights);
    }
  }, [cells, clickedCell, settings, calculateHighlights]);

  const handleCellClick = (index: number) => {
    if (cells) {
      const cell = cells[index];
      setClickedCell(index);
      
      // Calculate highlights for the clicked cell
      const { cellHighlights, hintHighlights } = calculateHighlights(cells, index, cell.value, settings);
      setHighlightedCells(cellHighlights);
      setHighlightedHints(hintHighlights);
    }
  };

  const handleCellDoubleClick = (index: number) => {
    if (cells && cells[index].isChangeable) {
      setSelectedForEdit(index);
    }
  };

  const findObviousCells = React.useCallback((cells: Cells): Set<number> => {
    console.log('Finding obvious cells...');
    const obviousCells = new Set<number>();
    
    // First pass: Check each empty cell for single possible value
    for (let i = 0; i < 81; i++) {
      if (cells[i].value !== 0) continue;
      
      const row = Math.floor(i / 9);
      const col = i % 9;
      const boxStartRow = Math.floor(row / 3) * 3;
      const boxStartCol = Math.floor(col / 3) * 3;
      
      const possibleValues = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]);
      
      // Remove values from row, column, and box
      for (let j = 0; j < 9; j++) {
        possibleValues.delete(cells[row * 9 + j].value); // row
        possibleValues.delete(cells[j * 9 + col].value); // column
      }
      
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          possibleValues.delete(cells[(boxStartRow + r) * 9 + boxStartCol + c].value);
        }
      }
      
      if (possibleValues.size === 1) {
        obviousCells.add(i);
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
              const cellValue = cells[cellIndex].value;
              
              if (cellValue === digit) {
                exists = true;
                break;
              }
              
              if (cellValue === 0) {
                // Check if this digit can go here (not in same row/column)
                const row = boxStartRow + r;
                const col = boxStartCol + c;
                let possible = true;
                
                // Check row and column
                for (let i = 0; i < 9; i++) {
                  if (cells[row * 9 + i].value === digit || cells[i * 9 + col].value === digit) {
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
            obviousCells.add(possibleSpots[0]);
          }
        }
      }
    }
    
    return obviousCells;
  }, []);

  const findObviousCellsForNumber = React.useCallback((cells: Cells, number: Digits): Set<number> => {
    const obviousCells = new Set<number>();
    
    // First pass: Check each empty cell
    for (let i = 0; i < 81; i++) {
      if (cells[i].value !== 0) continue;
      
      const row = Math.floor(i / 9);
      const col = i % 9;
      const boxStartRow = Math.floor(row / 3) * 3;
      const boxStartCol = Math.floor(col / 3) * 3;
      
      const possibleValues = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]);
      
      // Remove values from row, column, and box
      for (let j = 0; j < 9; j++) {
        possibleValues.delete(cells[row * 9 + j].value);
        possibleValues.delete(cells[j * 9 + col].value);
      }
      
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          possibleValues.delete(cells[(boxStartRow + r) * 9 + boxStartCol + c].value);
        }
      }
      
      if (possibleValues.size === 1 && possibleValues.has(number)) {
        obviousCells.add(i);
      }
    }
    
    // Second pass: Check each box for this specific number
    for (let boxRow = 0; boxRow < 3; boxRow++) {
      for (let boxCol = 0; boxCol < 3; boxCol++) {
        const boxStartRow = boxRow * 3;
        const boxStartCol = boxCol * 3;
        
        // Skip if number already exists in this box
        let exists = false;
        let possibleSpots = [];
        
        // Check each cell in the box
        for (let r = 0; r < 3; r++) {
          for (let c = 0; c < 3; c++) {
            const cellIndex = (boxStartRow + r) * 9 + boxStartCol + c;
            const cellValue = cells[cellIndex].value;
            
            if (cellValue === number) {
              exists = true;
              break;
            }
            
            if (cellValue === 0) {
              const row = boxStartRow + r;
              const col = boxStartCol + c;
              let possible = true;
              
              // Check row and column
              for (let i = 0; i < 9; i++) {
                if (cells[row * 9 + i].value === number || cells[i * 9 + col].value === number) {
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
          obviousCells.add(possibleSpots[0]);
        }
      }
    }
    
    return obviousCells;
  }, []);

  const obviousCells = React.useMemo(() => {
    console.log('Calculating obvious cells');
    if (!cells) return new Set<number>();
    
    if (settings.highlightAllObviousCells) {
      return findObviousCells(cells);
    }
    
    if (settings.highlightObviousCellsForCurrentNumber && selectedForEdit !== null) {
      const clickedNumber = cells[selectedForEdit].value;
      console.log('Clicked cell:', selectedForEdit);
      console.log('Clicked number:', clickedNumber);
      
      if (clickedNumber !== 0) {
        const obvious = findObviousCellsForNumber(cells, clickedNumber);
        console.log('Found obvious cells for', clickedNumber, ':', Array.from(obvious));
        return obvious;
      }
    }
    
    return new Set<number>();
  }, [
    cells,
    settings.highlightAllObviousCells,
    settings.highlightObviousCellsForCurrentNumber,
    selectedForEdit,
    findObviousCells,
    findObviousCellsForNumber
  ]);

  // Add obvious class to cell className
  const getCellClassName = (index: number, isHighlighted: boolean) => {
    return `${styles.cell} ${isHighlighted ? styles.highlighted : ''} ${obviousCells.has(index) ? styles.obvious : ''}`;
  };

  return (
    <div className={styles.gameBoard}>
      <div className={styles.boardGrid}>
        {Array.from({ length: 81 }).map((_, index) => (
          <div 
            key={index} 
            className={getCellClassName(index, highlightedCells.has(index))}
            onClick={() => handleCellClick(index)}
            onDoubleClick={() => handleCellDoubleClick(index)}
          >
            {cells && <CellContent 
              cell={cells[index]}
              highlightedHints={highlightedHints}
              settings={settings}
            />}
          </div>
        ))}
      </div>
      {selectedForEdit !== null && cells?.[selectedForEdit] && (
        <CellPopup
          open={true}
          onClose={() => setSelectedForEdit(null)}
          selectedValue={cells[selectedForEdit].value}
          hints={cells[selectedForEdit].draftValues}
          isPencilMode={isPencilMode}
          onPencilModeChange={setIsPencilMode}
          onValueSelect={(value) => {
            onCellValueChange(selectedForEdit, value);
            setClickedCell(selectedForEdit);
            
            if (cells) {
              const { cellHighlights, hintHighlights } = calculateHighlights(
                cells,
                selectedForEdit,
                value,
                settings
              );
              setHighlightedCells(cellHighlights);
              setHighlightedHints(
                value === 0 && settings.highlightSameHints ? hintHighlights : new Set()
              );
            }
            setSelectedForEdit(null);
          }}
          onClearCell={(value) => {
            onCellValueChange(selectedForEdit, value);
            setClickedCell(selectedForEdit);
            
            if (cells) {
              const { cellHighlights, hintHighlights } = calculateHighlights(
                cells,
                selectedForEdit,
                0,
                settings
              );
              setHighlightedCells(cellHighlights);
              setHighlightedHints(settings.highlightSameHints ? hintHighlights : new Set());
            }
          }}
          onHintToggle={(hint) => {
            onCellHintToggle(selectedForEdit, hint);
            setClickedCell(selectedForEdit);
            
            if (cells) {
              const { cellHighlights, hintHighlights } = calculateHighlights(
                cells,
                selectedForEdit,
                0,
                settings
              );
              setHighlightedCells(cellHighlights);
              setHighlightedHints(settings.highlightSameHints ? hintHighlights : new Set());
            }
          }}
          cellIndex={selectedForEdit}
          cells={cells}
          settings={settings}
        />
      )}
    </div>
  );
}

const CellContent = React.memo(({ cell, highlightedHints, settings }: CellContentProps) => {
  if (cell.getInitialValue !== 0) {
    return <span className={styles.initialValue}>{cell.getInitialValue}</span>;
  }

  if (cell.getUserValue !== 0) {
    return <span className={styles.userValue}>{cell.getUserValue}</span>;
  }

  if (cell.draftValues.some(v => v)) {
    return (
      <div className={styles.hintsContainer}>
        {cell.draftValues.map((isSet, index) => {
          const shouldHighlight = settings.highlightSameHints && highlightedHints?.has(index + 1);
          return (
            <div 
              key={index}
              className={`${styles.hint} ${isSet && shouldHighlight ? styles.highlighted : ''}`}
            >
              {isSet ? index + 1 : ''}
            </div>
          );
        })}
      </div>
    );
  }

  return null;
});

CellContent.displayName = 'CellContent';