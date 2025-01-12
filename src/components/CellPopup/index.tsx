import { Digits, Cell } from '@/SudokuGame';
import { GameSettingsType } from '@/types';
import { 
  Box, 
  Dialog, 
  ToggleButton, 
  Switch,
  FormControlLabel,
  styled 
} from '@mui/material';

interface CellPopupProps {
  open: boolean;
  onClose: () => void;
  selectedValue: Digits;
  hints: boolean[];
  isPencilMode: boolean;
  onPencilModeChange: (isOn: boolean) => void;
  onValueSelect: (value: Digits) => void;
  onClearCell: (value: Digits) => void;
  onHintToggle: (hint: number) => void;
  cellIndex: number;
  cells: Cell[];
  settings: GameSettingsType;
}

const NumberGrid = styled(Box)({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: 8,
  padding: 16,
});

const NumberButton = styled(ToggleButton)({
  width: 48,
  height: 48,
  fontSize: '1.2rem',
  '&.invalid': {
    opacity: 0.3,
    cursor: 'not-allowed',
    '&:hover': {
      backgroundColor: 'inherit',
    }
  }
});

const isNumberValid = (index: number, value: number, cells: Cell[]): boolean => {
  if (value === 0) return true;
  
  const row = Math.floor(index / 9);
  const col = index % 9;
  const boxStartRow = Math.floor(row / 3) * 3;
  const boxStartCol = Math.floor(col / 3) * 3;

  // Check row
  for (let i = 0; i < 9; i++) {
    if (i !== col && cells[row * 9 + i].value === value) {
      return false;
    }
  }

  // Check column
  for (let i = 0; i < 9; i++) {
    if (i !== row && cells[i * 9 + col].value === value) {
      return false;
    }
  }

  // Check 3x3 box
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const cellIndex = (boxStartRow + i) * 9 + (boxStartCol + j);
      if (cellIndex !== index && cells[cellIndex].value === value) {
        return false;
      }
    }
  }

  return true;
};

export default function CellPopup({
  open,
  onClose,
  selectedValue,
  hints,
  isPencilMode,
  onPencilModeChange,
  onValueSelect,
  onClearCell,
  onHintToggle,
  cellIndex,
  cells,
  settings,
}: CellPopupProps) {
  const handlePencilModeChange = (checked: boolean) => {
    if (checked && selectedValue !== 0) {
      onClearCell(0);
    }
    onPencilModeChange(checked);
  };

  const handleNumberClick = (value: number) => {
    if (isPencilMode) {
      onHintToggle(value);
    } else {
      onValueSelect(value as Digits);
      if (selectedValue === value) {
        onValueSelect(0);
      }
      onClose();
    }
  };

  const shouldCheckValidity = isPencilMode ? 
    settings.hideImpossibleValuesInHints : 
    settings.hideImpossibleValuesInSelector;

  return (
    <Dialog open={open} onClose={onClose}>
      <Box sx={{ p: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={isPencilMode}
              onChange={(e) => handlePencilModeChange(e.target.checked)}
            />
          }
          label="Pencil mode"
        />
        <NumberGrid>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => {
            const isValid = shouldCheckValidity ? isNumberValid(cellIndex, number, cells) : true;

            return (
              <NumberButton
                key={number}
                value={number}
                selected={isPencilMode ? hints[number - 1] : selectedValue === number}
                onClick={() => handleNumberClick(number)}
                disabled={!isValid}
                className={shouldCheckValidity && !isValid ? 'invalid' : ''}
              >
                {number}
              </NumberButton>
            );
          })}
        </NumberGrid>
      </Box>
    </Dialog>
  );
}
