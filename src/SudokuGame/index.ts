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
  public difficulty: SudokuGuruDifficulty;
  
  constructor(difficulty: SudokuGuruDifficulty, levelNumber?: number);
  constructor(difficulty: SudokuGuruDifficulty, cells?: Cells);
  constructor(difficulty: SudokuGuruDifficulty, param?: number | Cells) {
    this.difficulty = difficulty;
    
    if (Array.isArray(param)) {
      // If cells are provided, use them directly
      this.cells = param;
      this.initialized = Promise.resolve();
    } else {
      // Initialize new game
      this.cells = new Array<Cell>(81) as Cells;
      for (let i = 0; i < 81; i++) {
        this.cells[i] = new Cell({
          initialValue: 0,
          solutionValue: 0
        });
      }
      this.initialized = this.loadSudokuGuruLevel(difficulty, param);
    }
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
  
  clone(): Board {
    const newBoard = new Board(this.difficulty);
    // Skip initialization since we're copying an existing board
    newBoard.initialized = Promise.resolve();
    newBoard.cells = [...this.cells] as Cells;
    return newBoard;
  }
}

export class Cell {
  public draftValues: boolean[] & { length: 9 };
  private userValue: Digits;
  private initialValue: Digits;
  private solutionValue: Digits;
  
  constructor({initialValue, solutionValue} : {initialValue: Digits, solutionValue: Digits}) {
    this.initialValue = initialValue;
    this.solutionValue = solutionValue;
    this.draftValues = Array(9).fill(false) as boolean[] & { length: 9 };
    this.userValue = 0;
  }
  
  get getInitialValue(): Digits {
    return this.initialValue;
  }
  
  get getUserValue(): Digits {
    return this.userValue;
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

export type Cells = [Cell, ...Cell[]] & { length: 81 };

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
