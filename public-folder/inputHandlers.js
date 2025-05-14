import { highlightWord, focusFirstEmptyCell, highlightClueForCell } from './puzzle.js';
import { gameState } from './gameState.js'
import { checkAnswers } from './crossword.js'
import { startTimer, isTimerRunning } from './timer.js';
//ayrg

export function addAutoCheckListeners(puzzle) {
  gameState.currentPuzzle = puzzle;
  document.querySelectorAll('.cell:not(.black-cell)').forEach(input => {
    input.addEventListener('input', handleInput);
    input.addEventListener('keydown', handleKeyDown);
    input.addEventListener('focus', handleFocus);
  });
}

function handleInput(e) {
  if (!isTimerRunning()) {
    startTimer();
  }

  const input = e.target;
  const row = parseInt(input.dataset.row);
  const col = parseInt(input.dataset.col);

  let value = input.value.charAt(0)

  if (/^[a-zA-Z]$/.test(value)) {
    input.value = value;
    
    setTimeout(() => {
      //const clues = gameState.puzzle.clues[gameState.currentDirection];
      const clue = findClueContainingCell(gameState.currentRow, gameState.currentCol, gameState.currentDirection, gameState.puzzle);
      if (clue && isWordComplete(clue, gameState.currentDirection, gameState.puzzle)) {
        moveToNextWord(clue.row, clue.col, gameState.currentDirection, gameState.puzzle);
      } else{
      newMoveToNextCell(row, col, gameState.currentDirection, gameState.puzzle);
      }
    }, 0);
  } else {
    input.value = '';
  }

  const inputs = document.querySelectorAll('.cell:not(.black-cell)');
  const allFilled = Array.from(inputs).every(cell => cell.value.trim() !== '');

  if (allFilled) {
    console.log("all filled")
    checkAnswers();
  }
}

function handleKeyDown(e) {
  const input = e.target;
  const row = parseInt(input.dataset.row);
  const col = parseInt(input.dataset.col);
  const directions = {
      ArrowLeft: [0, -1],
      ArrowRight: [0, 1],
      ArrowUp: [-1, 0],
      ArrowDown: [1, 0]
  };

  if (e.key === 'Backspace') {
    const prevRow = row;
    const prevCol = col;
    const direction = gameState.currentDirection;

    if (input.value === '') {
      setTimeout(() => {
        const clue = findClueContainingCell(prevRow, prevCol, direction, gameState.puzzle);

        if (clue && isWordEmpty(clue, direction, gameState.puzzle)) {
          console.log("Word is now empty. Moving to previous clue...");
          moveToPreviousWord(clue.row, clue.col, direction, gameState.puzzle);
        } else {
          newMoveToPreviousCell(prevRow, prevCol, direction, gameState.puzzle);
        }
      }, 0);
    } else {
      input.value = '';
      e.preventDefault();
    }
  }

  if (directions[e.key]) {
    e.preventDefault();
    const [dRow, dCol] = directions[e.key];
    const nextInput = document.querySelector(
    `input[data-row="${row + dRow}"][data-col="${col + dCol}"]`
    );
    if (nextInput && !nextInput.classList.contains("black-cell")) {
    nextInput.focus();
    gameState.currentRow = row + dRow;
    gameState.currentCol = col + dCol;
    }
  }

  if (e.key === 'Tab') {
    const clue = findClueContainingCell(gameState.currentRow, gameState.currentCol, gameState.currentDirection, gameState.puzzle);
    setTimeout(() => {
      //const clues = gameState.puzzle.clues[gameState.currentDirection];
      moveToNextWord(clue.row, clue.col, gameState.currentDirection, gameState.puzzle);
    }, 0);
    return;
  }
}

function handleFocus(e) {
  const input = e.target;

  gameState.currentRow = parseInt(input.dataset.row);
  gameState.currentCol = parseInt(input.dataset.col);

  //const right = document.querySelector(`input[data-row="${gameState.currentRow}"][data-col="${gameState.currentCol + 1}"]`);
  //const down = document.querySelector(`input[data-row="${gameState.currentRow + 1}"][data-col="${gameState.currentCol}"]`);
 
  highlightWord(gameState.currentRow, gameState.currentCol, gameState.currentDirection, gameState.currentPuzzle);
}

function findClueContainingCell(row, col, direction, puzzle) {
  const clues = puzzle.clues[direction];
  const grid = puzzle.grid;

  for (const clue of clues) {
    let r = clue.row;
    let c = clue.col;
    const [dRow, dCol] = direction === 'across' ? [0, 1] : [1, 0];

    // Walk through the cells in the clue's word
    while (
      r < grid.length && c < grid[0].length &&
      grid[r][c] !== "#"
    ) {
      if (r === row && c === col) {
        return clue;
      }
      r += dRow;
      c += dCol;
    }
  }

  return null;
}

function newMoveToNextCell(row, col, direction, puzzle) {
  const rows = puzzle.size.rows;
  const cols = puzzle.size.cols;

  while (true) {
    if (direction === "across") {
      col++;
      if (col >= cols) {
        col = 0;
        row++;
        if (row >= rows) {
          row = 0;
          col = 0;
        }; // Reached end of puzzle
      }
    } else {
      row++;
      if (row >= rows) {
        row = 0;
        col++;
        if (col >= cols) {
          row = 0;
          col = 0;
        }; // Reached end of puzzle
      }
    }

    const nextInput = document.querySelector(`input[data-row="${row}"][data-col="${col}"]`);
    if (nextInput && !nextInput.classList.contains("black-cell")) {
      gameState.currentRow = row;
      gameState.currentCol = col;

      setTimeout(() => {
        nextInput.focus();
      }, 0);

      break;
    }
  }
}

function newMoveToPreviousCell(row, col, direction, puzzle) {
  const rows = puzzle.size.rows;
  const cols = puzzle.size.cols;

  while (true) {
    if (direction === "across") {
      col--;
      if (col < 0) {
        col = cols - 1;
        row --;
        if (row < 0) {
          col = cols -1;
          row = rows -1;
        }; // Reached end of puzzle
      }
    } else {
      row--;
      if (row < 0) {
        row = rows - 1;
        col--;
        if (col < 0) {
          col = cols - 1;
          row = rows - 1;
        }; // Reached end of puzzle
      }
    }

    const nextInput = document.querySelector(`input[data-row="${row}"][data-col="${col}"]`);
    if (nextInput && !nextInput.classList.contains("black-cell")) {
      nextInput.focus();
      break;
    }
  }
}

function moveToNextWord(row, col, direction, puzzle) {
  const clues = puzzle.clues[direction];
  const currentClue = clues.find(clue => clue.row === row && clue.col === col);
  
  if (!currentClue) {
    console.warn("Current clue not found at row:", row, "col:", col);
    return;
  }

  // Ensure the current word is complete
  //if (!isWordComplete(currentClue, direction, puzzle)){
  //  return;
  //}
  
  // Sort clues numerically
  const sortedClues = [...clues].sort((a, b) => a.number - b.number);

  const currentIndex = sortedClues.findIndex(clue => clue.number === currentClue.number);
  // Try to move to the first empty cell of the next clue
  for (let i = currentIndex + 1; i < sortedClues.length; i++) {
    const nextClue = sortedClues[i];
    const wordCells = getWordCells(nextClue.row, nextClue.col, direction, puzzle);

    for (const [r, c] of wordCells) {
      const cell = document.querySelector(`input[data-row="${r}"][data-col="${c}"]`);
      if (cell && !cell.value) {
        gameState.currentRow = r;
        gameState.currentCol = c;
        gameState.currentDirection = direction;
        gameState.currentClueStartRow = nextClue.row;
        gameState.currentClueStartCol = nextClue.col;
        focusFirstEmptyCell(nextClue.row, nextClue.col, direction);
        highlightWord(nextClue.row, nextClue.col, direction);
        highlightClueForCell(nextClue.row, nextClue.col);
        return;
      }
    }
  }

  console.log("All clues completed or no next empty clue found.");
}

function moveToPreviousWord(row, col, direction, puzzle) {
  const clues = [...puzzle.clues[direction]].sort((a, b) => a.number - b.number);
  const currentClue = clues.find(c => c.row === row && c.col === col);
  if (!currentClue) return;

  const currentIndex = clues.findIndex(c => c.number === currentClue.number);
  const prevClue = clues[currentIndex - 1];

  if (!prevClue) return;

  const wordCells = getWordCells(prevClue.row, prevClue.col, direction, puzzle);
  const lastCell = wordCells[wordCells.length - 1];
  const input = document.querySelector(`input[data-row="${lastCell[0]}"][data-col="${lastCell[1]}"]`);
  if (input) {
    gameState.currentRow = lastCell[0];
    gameState.currentCol = lastCell[1];
    gameState.currentDirection = direction;
    gameState.currentClueStartRow = prevClue.row;
    gameState.currentClueStartCol = prevClue.col;

    input.focus();
    highlightWord(prevClue.row, prevClue.col, direction);
    highlightClueForCell(prevClue.row, prevClue.col);
  }
}

function getWordCells(row, col, direction, puzzle) {
  const cells = [];
  const [dRow, dCol] = direction === 'across' ? [0, 1] : [1, 0];
  const grid = puzzle.grid;
  const rows = grid.length;
  const cols = grid[0].length;

  while (
    row >= 0 && col >= 0 &&
    row < rows && col < cols &&
    grid[row][col] !== "#"
  ) {
    cells.push([row, col]);
    row += dRow;
    col += dCol;
  }

  return cells;
}

function isWordComplete(clue, direction, puzzle) {
  const [startRow, startCol] = [clue.row, clue.col];
  const [dRow, dCol] = direction === "across" ? [0, 1] : [1, 0];

  let r = startRow;
  let c = startCol;

  while (isValidCell(r, c, puzzle) && puzzle.grid[r][c] !== "#") {
    const cell = document.querySelector(`input[data-row="${r}"][data-col="${c}"]`);
    if (cell && !cell.value) {
      return false;
    }
    r += dRow;
    c += dCol;
  }
  return true;
}

function isWordEmpty(clue, direction, puzzle) {
  const [startRow, startCol] = [clue.row, clue.col];
  const [dRow, dCol] = direction === 'across' ? [0, 1] : [1, 0];

  let r = startRow;
  let c = startCol;

  while (isValidCell(r, c, puzzle) && puzzle.grid[r][c] !== '#') {
    const cell = document.querySelector(`input[data-row="${r}"][data-col="${c}"]`);
    if (cell && cell.value) return false;
    r += dRow;
    c += dCol;
  }

  return true;
}

function moveToNextClue(row, col, direction, puzzle) {
  const clues = puzzle.clues[direction];
  const currentClueIndex = clues.findIndex(clue => clue.row === row && clue.col === col);

  // Determine the next clue index, wrapping around if necessary
  const nextClueIndex = (currentClueIndex + 1) % clues.length;
  const nextClue = clues[nextClueIndex];

  // Focus on the first empty cell of the next clue
  focusFirstEmptyCell(nextClue.row, nextClue.col, direction);
}

function findCurrentClue(row, col, direction) {
  const clues = gameState.currentPuzzle.clues[direction];
  return clues.find(clue => clue.row === row && clue.col === col);
}

export function isValidCell(row, col) {
  return (
    gameState.currentPuzzle &&
    row >= 0 && row < gameState.currentPuzzle.grid.length &&
    col >= 0 && col < gameState.currentPuzzle.grid[0].length
  );
}