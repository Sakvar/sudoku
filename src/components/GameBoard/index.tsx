import { Cells, Cell, Digits } from '@/SudokuGame';
import { Box, Paper, styled } from '@mui/material';
import CellPopup from '../CellPopup';
import React from 'react';

interface GameBoardProps {
  cells: Cells | null;
  onCellValueChange: (index: number, value: Digits) => void;
  onCellHintToggle: (index: number, hint: number) => void;
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
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  fontSize: '0.7rem',
});

const HintCell = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

interface CellContentProps {
  cell: Cell;
}

const CellContent = ({ cell }: CellContentProps) => {
  // If it's an initial value, show it bold
  if (cell.initialValue !== 0) {
    return <InitialValue>{cell.initialValue}</InitialValue>;
  }

  // If user entered a main value, show it (not bold)
  if (cell.userValue !== 0) {
    return <UserValue>{cell.userValue}</UserValue>;
  }

  // If there are hints, show the hints grid
  if (cell.draftValues.some(v => v)) {
    return (
      <HintsContainer>
        {cell.draftValues.map((isSet, index) => (
          <HintCell key={index}>
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

const calculateHighlights = (cells: Cells | null, index: number, value: Digits) => {
  if (!cells) return new Set<number>();
  
  const row = Math.floor(index / 9);
  const col = index % 9;
  
  const newHighlights = new Set<number>();

  // Highlight row
  for (let i = 0; i < 9; i++) {
    newHighlights.add(row * 9 + i);
  }

  // Highlight column
  for (let i = 0; i < 9; i++) {
    newHighlights.add(i * 9 + col);
  }

  // Highlight same values if value is not zero
  if (value !== 0) {
    for (let i = 0; i < 81; i++) {
      if (cells[i].value === value) {
        newHighlights.add(i);
      }
    }
  }

  return newHighlights;
};

export default function GameBoard({ cells, onCellValueChange, onCellHintToggle }: GameBoardProps) {
  const [highlightedCells, setHighlightedCells] = React.useState<Set<number>>(new Set());
  const [selectedForEdit, setSelectedForEdit] = React.useState<number | null>(null);
  const [isPencilMode, setIsPencilMode] = React.useState(false);
  const [clickedCell, setClickedCell] = React.useState<number | null>(null);

  const handleCellClick = (index: number) => {
    if (!cells) return;

    // Show popup when clicking the previously clicked cell
    if (index === clickedCell) {
      if (cells[index].isChangeable) {
        setSelectedForEdit(index);
      }
      return;
    }

    // First click or clicking a different cell - highlight cells
    const row = Math.floor(index / 9);
    const col = index % 9;
    const value = cells[index].value;

    const newHighlights = new Set<number>();

    // Highlight row
    for (let i = 0; i < 9; i++) {
      newHighlights.add(row * 9 + i);
    }

    // Highlight column
    for (let i = 0; i < 9; i++) {
      newHighlights.add(i * 9 + col);
    }

    // Highlight same values if cell is not empty
    if (value !== 0) {
      for (let i = 0; i < 81; i++) {
        if (cells[i].value === value) {
          newHighlights.add(i);
        }
      }
    }

    setHighlightedCells(newHighlights);
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
            {cells && <CellContent cell={cells[index]} />}
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
            setHighlightedCells(calculateHighlights(cells, selectedForEdit, value));
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
        />
      )}
    </Box>
  );
}