import { error } from "console";


export class SudokuGame {
  globalGameState: GlobalGameState;
  
  private difficulty?: SudokuGuruDifficulty;
  private board?: Board;
  private gameStarted?: Date;
  
  newGame(difficulty: SudokuGuruDifficulty, levelNumber?:number) {
    // if (difficulty) {
      // this.globalGameState = 'error';
      this.difficulty = difficulty;
      this.board = new Board(difficulty, levelNumber);
      this.globalGameState = 'playing';
      this.gameStarted = new Date();
    // }
  }
  
  constructor() { 
    this.globalGameState = 'selectDifficulty';
  }
  
}

export class Board {
  public cells: Cells;
  private initialized: Promise<void>;
  
  constructor(difficulty: SudokuGuruDifficulty, levelNumber?:number) {
    this.cells = new Array<Cell>(81) as Cells;
    // Initialize with empty cells first
    for (let i = 0; i < 81; i++) {
      this.cells[i] = new Cell({
        initialValue: 0,
        solutionValue: 0
      });
    }
    
    // Store the initialization promise
    this.initialized = this.loadSudokuGuruLevel(difficulty, levelNumber);
  }
  
  // Add this method to wait for initialization
  async initialize() {
    await this.initialized;
  }
  
  private async loadSudokuGuruLevel(difficulty:SudokuGuruDifficulty, levelNumber?:number) {
    try {
      if (levelNumber == undefined) {
        levelNumber = Math.floor(Math.random() * 1099);
      }
      const url = `https://sudoku-guru.com/levels/${difficulty}/Level_${levelNumber}.txt`;
      const response = await fetch(url);
      const rawLevel = await response.json() as SudokuGuruLevel;
      
      rawLevel.blocks.forEach((element, index) => {
        this.cells[index] = new Cell({
          initialValue: element.num,
          solutionValue: element.andNum
        });
      });
    } catch (error) {
      console.error('Failed to load Sudoku level:', error);
    }
  }
  
  private resetBoard() {
    
  } 
}

export class Cell {
  private draftValues: boolean[] & { length: 9 };
  private userValue: Digits;
  private initialValue: Digits;
  private solutionValue: Digits;
  
  constructor({initialValue, solutionValue} : {initialValue: Digits, solutionValue: Digits}) {
    this.initialValue = initialValue;
    this.solutionValue = solutionValue;
    this.draftValues = Array(9).fill(false) as boolean[] & { length: 9 };
    this.userValue = 0;
  }
  
  get isChangeable() {
    return this.initialValue === 0;
  }
  
  get value(): Digits {
    return this.initialValue || this.userValue;
  }
  
  setUserValue(value: Digits) {
    if (this.isChangeable) {
      this.userValue = value;
      this.draftValues = Array(9).fill(false) as boolean[] & { length: 9 };
    }
  }
  
  toggleHint(hint: number) {
    if (this.isChangeable && this.userValue === 0 && hint >= 1 && hint <= 9) {
      this.draftValues[hint - 1] = !this.draftValues[hint - 1];
    }
  }
  
  clearCell() {
    if (this.isChangeable) {
      this.userValue = 0;
      this.draftValues = Array(9).fill(false) as boolean[] & { length: 9 };
    }
  }
}

export type Digits = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type Cells = Cell[] & { length: 81 };

export type GlobalGameState = 'playing' | 'won' | 'lost' | 'selectDifficulty' | 'error' | 'notStarted';

export enum SudokuGuruDifficulty {
  easy = 'easy',
  medium = 'medium',
  hard = 'hard',
  expert = 'expert',
  guru = 'guru'
}

export type SudokuGuruLevel = {
  blocks: SudokuGuruBlock[]
}
export type SudokuGuruBlock = {
  num: Digits,
  canEdit: boolean,
  andNum: Digits,
  hinNum: number[]
}
