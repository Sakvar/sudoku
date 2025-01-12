import { GameSettingsType } from '@/types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  FormGroup,
  FormControlLabel,
  Checkbox,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface GameSettingsProps {
  settings: GameSettingsType;
  onSettingChange: (setting: keyof GameSettingsType) => void;
  onClose: () => void;
  open: boolean;
}

export default function GameSettings({ settings, onSettingChange, onClose, open }: GameSettingsProps) {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ 
        m: 0, 
        p: 2,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        Settings
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
      <DialogContent dividers>
        <FormGroup>
          {Object.entries(settings).map(([key, value]) => (
            <FormControlLabel
              key={key}
              control={
                <Checkbox
                  checked={value}
                  onChange={() => onSettingChange(key as keyof GameSettingsType)}
                />
              }
              label={formatSettingLabel(key)}
            />
          ))}
        </FormGroup>
      </DialogContent>
    </Dialog>
  );
}

function formatSettingLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .replace(/([A-Z])\s/g, (match) => match.toLowerCase());
} 