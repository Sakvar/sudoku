import { Digits } from '@/SudokuGame';
import { 
  Box, 
  Dialog, 
  ToggleButton, 
  ToggleButtonGroup,
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
});

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
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
            <NumberButton
              key={number}
              value={number}
              selected={isPencilMode ? hints[number - 1] : selectedValue === number}
              onClick={() => handleNumberClick(number)}
            >
              {number}
            </NumberButton>
          ))}
        </NumberGrid>
      </Box>
    </Dialog>
  );
}
