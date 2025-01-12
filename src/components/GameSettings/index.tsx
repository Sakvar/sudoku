import { GameSettingsType } from '@/types';
import { 
  DialogTitle, 
  DialogContent, 
  IconButton, 
  FormGroup,
  FormControlLabel,
  Checkbox,
  styled
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface GameSettingsProps {
  settings: GameSettingsType;
  onSettingChange: (key: keyof GameSettingsType, value: boolean) => void;
  onClose: () => void;
}

const StyledDialogContent = styled(DialogContent)({
  paddingTop: '8px !important',
});

const GameSettings: React.FC<GameSettingsProps> = ({ settings, onSettingChange, onClose }) => {
  return (
    <>
      <DialogTitle sx={{ m: 0, p: 2 }}>
        Game Settings
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <StyledDialogContent>
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={settings.highlightRowAndColumn}
                onChange={(e) => onSettingChange('highlightRowAndColumn', e.target.checked)}
              />
            }
            label="Highlight row and column for selected cell"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={settings.highlightSameNumbers}
                onChange={(e) => onSettingChange('highlightSameNumbers', e.target.checked)}
              />
            }
            label="Highlight same numbers as selected"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={settings.highlightSameHints}
                onChange={(e) => onSettingChange('highlightSameHints', e.target.checked)}
              />
            }
            label="Highlight hints same as selected number"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={settings.highlightCrossForNumbers}
                onChange={(e) => onSettingChange('highlightCrossForNumbers', e.target.checked)}
              />
            }
            label="Highlight cross for same numbers"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={settings.highlightCrossForHints}
                onChange={(e) => onSettingChange('highlightCrossForHints', e.target.checked)}
              />
            }
            label="Highlight cross for same hints"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={settings.hideImpossibleValuesInSelector}
                onChange={(e) => onSettingChange('hideImpossibleValuesInSelector', e.target.checked)}
              />
            }
            label="Hide impossible values in number selector"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={settings.hideImpossibleValuesInHints}
                onChange={(e) => onSettingChange('hideImpossibleValuesInHints', e.target.checked)}
              />
            }
            label="Hide impossible values in hints"
          />
        </FormGroup>
      </StyledDialogContent>
    </>
  );
};

export default GameSettings; 