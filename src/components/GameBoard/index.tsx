import { Cells, Cell } from '@/SudokuGame';
import { Box, Paper, styled } from '@mui/material';

interface GameBoardProps {
  cells: Cells | null;
  onCellClick?: (index: number) => void;
}

const Item = styled(Paper)(({ theme }) => ({
  textAlign: 'center',
  height: 40,
  width: 40,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: '#f0f0f0',
  },
}));

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

export default function GameBoard({ cells, onCellClick }: GameBoardProps) {
  if (!cells) return null;

  return (
    <Box sx={{ maxWidth: 400, margin: 'auto', mt: 4 }}>
      <BoardGrid>
        {Array.from({ length: 81 }).map((_, index) => (
          <Item 
            key={index} 
            elevation={1}
            onClick={() => onCellClick?.(index)}
          >
            <CellContent cell={cells[index]} />
          </Item>
        ))}
      </BoardGrid>
    </Box>
  );
}