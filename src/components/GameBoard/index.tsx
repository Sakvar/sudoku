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
}

const CellContent = ({ cell, highlightedHints }: CellContentProps) => {
  if (cell.getInitialValue !== 0) {
    return <InitialValue>{cell.getInitialValue}</InitialValue>;
  }

  if (cell.getUserValue !== 0) {
    return <UserValue>{cell.getUserValue}</UserValue>;
  }

  if (cell.draftValues.some(v => v)) {
    return (
      <HintsContainer>
        {cell.draftValues.map((isSet, index) => (
          <HintCell 
            key={index}
            $isHighlighted={isSet && highlightedHints?.has(index + 1)}
          >
            {isSet ? index + 1 : ''}
          </HintCell>
        ))}
      </HintsContainer>
    );
  }

  return null;
};

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

const calculateHighlights = (cells: Cells | null, index: number, value: Digits, settings: GameSettingsType) => {
  if (!cells) return new Set<number>();
  
  const row = Math.floor(index / 9);
  const col = index % 9;
  
  const newHighlights = new Set<number>();

  // Only highlight row and column if enabled
  if (settings.highlightRowAndColumn) {
    // Highlight row
    for (let i = 0; i < 9; i++) {
      newHighlights.add(row * 9 + i);
    }

    // Highlight column
    for (let i = 0; i < 9; i++) {
      newHighlights.add(i * 9 + col);
    }
  }

  // Highlight same values if enabled and value is not zero
  if (value !== 0 && settings.highlightSameNumbers) {
    for (let i = 0; i < 81; i++) {
      if (cells[i].value === value) {
        newHighlights.add(i);
      }
    }
  }

  return newHighlights;
};

export default function GameBoard({ cells, onCellValueChange, onCellHintToggle, settings }: GameBoardProps) {
  const [highlightedCells, setHighlightedCells] = React.useState<Set<number>>(new Set());
  const [highlightedHints, setHighlightedHints] = React.useState<Set<number>>(new Set());
  const [selectedForEdit, setSelectedForEdit] = React.useState<number | null>(null);
  const [isPencilMode, setIsPencilMode] = React.useState(false);
  const [clickedCell, setClickedCell] = React.useState<number | null>(null);

  const handleCellClick = (index: number) => {
    if (!cells) return;

    if (index === clickedCell) {
      if (cells[index].isChangeable) {
        setSelectedForEdit(index);
      }
      return;
    }

    const row = Math.floor(index / 9);
    const col = index % 9;
    const selectedCell = cells[index];
    const value = selectedCell.value;

    const newHighlights = new Set<number>();
    const newHintHighlights = new Set<number>();

    // Apply highlighting based on settings
    if (settings.highlightRowAndColumn) {
      // Highlight row and column
      for (let i = 0; i < 9; i++) {
        newHighlights.add(row * 9 + i);
        newHighlights.add(i * 9 + col);
      }
    }

    // Highlight matching values if enabled
    if (value !== 0 && settings.highlightSameNumbers) {
      newHintHighlights.add(value);
      
      for (let i = 0; i < 81; i++) {
        const currentCell = cells[i];
        if (currentCell.value === value) {
          newHighlights.add(i);
        }
      }
    }

    setHighlightedCells(newHighlights);
    setHighlightedHints(newHintHighlights);
    setClickedCell(index);
    setSelectedForEdit(null);
  };

  const handlePopupClose = () => {
    setSelectedForEdit(null);
  };

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
            />}
          </Item>
        ))}
      </BoardGrid>

      {selectedForEdit !== null && cells?.[selectedForEdit] && (
        <CellPopup
          open={true}
          onClose={handlePopupClose}
          selectedValue={cells[selectedForEdit].value}
          hints={cells[selectedForEdit].draftValues}
          isPencilMode={isPencilMode}
          onPencilModeChange={setIsPencilMode}
          onValueSelect={(value) => {
            onCellValueChange(selectedForEdit, value);
            setHighlightedCells(calculateHighlights(cells, selectedForEdit, value, settings));
            setClickedCell(selectedForEdit);
            setSelectedForEdit(null);
          }}
          onClearCell={(value) => {
            onCellValueChange(selectedForEdit, value);
          }}
          onHintToggle={(hint) => {
            onCellHintToggle(selectedForEdit, hint);
          }}
          cellIndex={selectedForEdit}
          cells={cells}
          settings={settings}
        />
      )}
    </Box>
  );
}