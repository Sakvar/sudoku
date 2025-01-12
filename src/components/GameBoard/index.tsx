import { Cells, Cell, Digits } from '@/SudokuGame';
import { Box, Paper, styled } from '@mui/material';
import CellPopup from '../CellPopup';
import React from 'react';
import { GameSettingsType } from '@/types';

interface GameBoardProps {
  cells: Cells | null;
  onCellValueChange: (index: number, value: Digits) => void;
  onCellHintToggle: (index: number, hint: number) => void;
  settings: GameSettingsType;
}

const Item = styled(Paper)({
  textAlign: 'center',
  height: 40,
  width: 40,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  cursor: 'pointer',
  '&.highlighted': {
    backgroundColor: '#e3f2fd',
    '&:hover': {
      backgroundColor: '#bbdefb',
    },
  },
  '&.clicked': {
    backgroundColor: '#bbdefb',
    '&:hover': {
      backgroundColor: '#90caf9',
    },
  },
  '&:hover': {
    backgroundColor: '#f0f0f0',
  },
});

const InitialValue = styled('span')({
  fontSize: '1.2rem',
  fontWeight: 'bold',
});

const UserValue = styled('span')({
  fontSize: '1.2rem',
  color: '#666',
});

const HintsContainer = styled('div')({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gridTemplateRows: 'repeat(3, 1fr)',
  position: 'absolute',
  top: 1,
  left: 1,
  right: 1,
  bottom: 1,
  fontSize: '0.5rem',
  gap: 0,
  lineHeight: '1',
  '& > span': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#666',
    padding: 0,
  }
});

const HintCell = styled('div')<{ $isHighlighted?: boolean }>(({ $isHighlighted }) => ({
  fontSize: '0.8em',
  color: $isHighlighted ? '#fff' : 'inherit',
  fontWeight: $isHighlighted ? '700' : 'normal',
  backgroundColor: $isHighlighted ? '#2196f3' : 'transparent',
  borderRadius: '4px',
  padding: '1px 3px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: $isHighlighted ? '#1976d2' : 'transparent',
  }
}));

interface CellContentProps {
  cell: Cell;
  highlightedHints?: Set<number>;
  settings: GameSettingsType;
}

export default function GameBoard({ cells, onCellValueChange, onCellHintToggle, settings }: GameBoardProps) {
  const [highlightedCells, setHighlightedCells] = React.useState<Set<number>>(new Set());
  const [highlightedHints, setHighlightedHints] = React.useState<Set<number>>(new Set());
  const [selectedForEdit, setSelectedForEdit] = React.useState<number | null>(null);
  const [isPencilMode, setIsPencilMode] = React.useState(false);
  const [clickedCell, setClickedCell] = React.useState<number | null>(null);

  const calculateHighlights = React.useCallback((cells: Cells | null, index: number, value: Digits, settings: GameSettingsType) => {
    if (!cells) return {
      cellHighlights: new Set<number>(),
      hintHighlights: new Set<number>()
    };
    
    const row = Math.floor(index / 9);
    const col = index % 9;
    
    const cellHighlights = new Set<number>();
    const hintHighlights = new Set<number>();

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
          }
        }

        // Then highlight crosses for all matching cells if enabled
        if (settings.highlightCrossForNumbers) {
          matchingCells.forEach(cellIndex => {
            const matchRow = Math.floor(cellIndex / 9);
            const matchCol = cellIndex % 9;
            // Highlight entire row and column
            for (let i = 0; i < 9; i++) {
              cellHighlights.add(matchRow * 9 + i);
              cellHighlights.add(i * 9 + matchCol);
            }
          });
        }
      }
      
      if (settings.highlightSameHints) {
        hintHighlights.add(value);
      }
    } 
    
    // Hint highlights
    else if (settings.highlightSameHints) {
      const selectedCellHints = cells[index].draftValues;
      const clickedHintIndex = selectedCellHints.findIndex(isSet => isSet);
      
      if (clickedHintIndex !== -1 && selectedCellHints.filter(isSet => isSet).length === 1) {
        hintHighlights.add(clickedHintIndex + 1);
        
        // First find all cells with the same hint
        const matchingCells: number[] = [];
        for (let i = 0; i < 81; i++) {
          if (i !== index && cells[i].value === 0 && cells[i].draftValues[clickedHintIndex]) {
            cellHighlights.add(i);
            matchingCells.push(i);
          }
        }

        // Then highlight crosses for all matching cells if enabled
        if (settings.highlightCrossForHints) {
          matchingCells.forEach(cellIndex => {
            const matchRow = Math.floor(cellIndex / 9);
            const matchCol = cellIndex % 9;
            // Highlight entire row and column
            for (let i = 0; i < 9; i++) {
              cellHighlights.add(matchRow * 9 + i);
              cellHighlights.add(i * 9 + matchCol);
            }
          });
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

  const handleCellClick = React.useCallback((index: number) => {
    if (!cells) return;

    if (index === clickedCell) {
      if (cells[index].isChangeable) {
        setSelectedForEdit(index);
      }
      return;
    }

    setClickedCell(index);
    setSelectedForEdit(null);
  }, [cells, clickedCell]);

  return (
    <Box sx={{ maxWidth: 400, margin: 'auto', mt: 4 }}>
      <BoardGrid>
        {Array.from({ length: 81 }).map((_, index) => (
          <Item 
            key={index} 
            elevation={1}
            className={`
              ${highlightedCells.has(index) ? 'highlighted' : ''}
              ${index === clickedCell ? 'clicked' : ''}
            `}
            onClick={() => handleCellClick(index)}
          >
            {cells && <CellContent 
              cell={cells[index]}
              highlightedHints={highlightedHints}
              settings={settings}
            />}
          </Item>
        ))}
      </BoardGrid>
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
    </Box>
  );
}

const BoardGrid = styled(Box)({
  display: 'grid',
  gridTemplateColumns: 'repeat(9, 1fr)',
  gap: 1,
  padding: 2,
  backgroundColor: '#ccc',
  '& > *:nth-of-type(3n)': {
    borderRight: '2px solid #666',
  },
  '& > *:nth-of-type(n+19):nth-of-type(-n+27)': {
    borderBottom: '2px solid #666',
  },
  '& > *:nth-of-type(n+46):nth-of-type(-n+54)': {
    borderBottom: '2px solid #666',
  },
});

const CellContent = React.memo(({ cell, highlightedHints, settings }: CellContentProps) => {
  if (cell.getInitialValue !== 0) {
    return <InitialValue>{cell.getInitialValue}</InitialValue>;
  }

  if (cell.getUserValue !== 0) {
    return <UserValue>{cell.getUserValue}</UserValue>;
  }

  if (cell.draftValues.some(v => v)) {
    return (
      <HintsContainer>
        {cell.draftValues.map((isSet, index) => {
          const shouldHighlight = settings.highlightSameHints && highlightedHints?.has(index + 1);
          return (
            <HintCell 
              key={index}
              $isHighlighted={isSet && shouldHighlight}
            >
              {isSet ? index + 1 : ''}
            </HintCell>
          );
        })}
      </HintsContainer>
    );
  }

  return null;
});

CellContent.displayName = 'CellContent';