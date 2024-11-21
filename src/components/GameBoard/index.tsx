import { Cells, Cell } from '@/SudokuGame';
import { Box, Grid, Paper, styled } from '@mui/material';

interface GameBoardProps {
  cells: Cells | null;
}

const Item = styled(Paper)(({ theme }) => ({
  textAlign: 'center',
  height: 40,
  width: 40,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '1.2rem',
  fontWeight: 'bold',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: '#f0f0f0',
  },
}));

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

export default function GameBoard({ cells }: GameBoardProps) {
  if (!cells) return null;

  return (
    <Box sx={{ maxWidth: 400, margin: 'auto', mt: 4 }}>
      <BoardGrid>
        {Array.from({ length: 81 }).map((_, index) => (
          <Item key={index} elevation={1}>
            {cells[index]?.userValue || ''}
          </Item>
        ))}
      </BoardGrid>
    </Box>
  );
}