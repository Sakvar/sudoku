export type GlobalGameState = 'notStarted' | 'selectDifficulty' | 'playing'; 
export interface GameSettingsType {
    highlightRowAndColumn: boolean;
    highlightSameNumbers: boolean;
    highlightSameHints: boolean;
    highlightCrossForNumbers: boolean;
    highlightCrossForHints: boolean;
    hideImpossibleValuesInSelector: boolean;
    hideImpossibleValuesInHints: boolean;
    highlightCurrentQuadrant: boolean;
  }