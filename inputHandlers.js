import { highlightWord, focusFirstEmptyCell, highlightClueForCell, clearHighlights } from './puzzle.js';
import { gameState } from './gameState.js'
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
    e.preventDefault();
    const input = e.target;
    input.value = input.value.charAt(0); // force 1 char
    const value = input.value;

    const row = parseInt(input.dataset.row);
    const col = parseInt(input.dataset.col);  

    if (value) {
        if (isCurrentWordComplete(row, col, gameState.currentDirection)) {
            console.log("complete");
            moveToNextWord(puzzle);
        } else {
            moveToNextCell(row, col, gameState.currentDirection);
        }
    }

    if (row !== null && col !== null) {
        highlightWord(row, col, gameState.currentDirection, gameState.currentPuzzle);
    }
}

function handleKeyDown(e) {
    const input = e.target;
    const row = parseInt(input.dataset.row);
    const col = parseInt(input.dataset.col);

    if (/^[a-zA-Z]$/.test(e.key)) {
        return;
    }

    if (e.key === 'Backspace') {
        if (input.value === '') {
        moveToPreviousCell(row, col, gameState.currentDirection);
        } else {
        input.value = '';
        e.preventDefault();
        }
    }

    const directions = {
        ArrowLeft: [0, -1],
        ArrowRight: [0, 1],
        ArrowUp: [-1, 0],
        ArrowDown: [1, 0]
    };

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
        console.log('tab')
        e.preventDefault();
        moveToNextWord();
        return;
    }
}

function handleFocus(e) {
    const input = e.target;
    gameState.currentRow = parseInt(input.dataset.row);
    gameState.currentCol = parseInt(input.dataset.col);

    const right = document.querySelector(`input[data-row="${gameState.currentRow}"][data-col="${gameState.currentCol + 1}"]`);
    const down = document.querySelector(`input[data-row="${gameState.currentRow + 1}"][data-col="${gameState.currentCol}"]`);
    gameState.currentDirection = right && !right.classList.contains("black-cell") ? "across" : "down";

    const clue = findCurrentClue(gameState.currentRow, gameState.currentCol, gameState.currentDirection);
    if (clue) {
      gameState.currentClueStartRow = clue.row;
      gameState.currentClueStartCol = clue.col;
      gameState.currentClueDirection = gameState.currentDirection;
    }

    highlightWord(gameState.currentRow, gameState.currentCol, gameState.currentDirection, gameState.currentPuzzle);
}
//istg
function moveToNextCell(row, col, direction) {
    const [dRow, dCol] = direction === 'across' ? [0, 1] : [1, 0];
    let nextRow = row + dRow;
    let nextCol = col + dCol;
  
    const nextCell = document.querySelector(`input[data-row="${nextRow}"][data-col="${nextCol}"]`);
    
    // 1. Move forward if cell is valid and not black
    if (nextCell && !nextCell.classList.contains("black-cell")) {
      nextCell.focus();
      gameState.currentRow = nextRow;
      gameState.currentCol = nextCol;
      return;
    }
  
    // 2. Find next clue in current direction
    const currentClueList = [...gameState.currentPuzzle.clues[direction]].sort((a, b) => a.number - b.number);
    const currentClueIndex = currentClueList.findIndex(
      clue => clue.row === gameState.currentClueStartRow && clue.col === gameState.currentClueStartCol
    );
  
    for (let i = currentClueIndex + 1; i < currentClueList.length; i++) {
      const clue = currentClueList[i];
      const input = document.querySelector(`input[data-row="${clue.row}"][data-col="${clue.col}"]`);
      if (input && !input.classList.contains('black-cell') && !input.value) {
        gameState.currentClueStartRow = clue.row;
        gameState.currentClueStartCol = clue.col;
        gameState.currentClueDirection = direction;
        gameState.currentDirection = direction;
        focusFirstEmptyCell(clue.row, clue.col, direction, gameState.currentPuzzle);
        highlightWord(clue.row, clue.col, direction, gameState.currentPuzzle);
        highlightClueForCell(clue.row, clue.col, gameState.currentPuzzle);
        return;
      }
    }
  
    // 3. If at end of clues, go to first clue in other direction
    const altDirection = direction === 'across' ? 'down' : 'across';
    const altCluesSorted = [...gameState.currentPuzzle.clues[altDirection]].sort((a, b) => a.number - b.number);
    
    for (const clue of altCluesSorted) {
      const input = document.querySelector(`input[data-row="${clue.row}"][data-col="${clue.col}"]`);
      if (input && !input.classList.contains('black-cell') && !input.value) {
        gameState.currentClueStartRow = clue.row;
        gameState.currentClueStartCol = clue.col;
        gameState.currentClueDirection = altDirection;
        gameState.currentDirection = altDirection;
        focusFirstEmptyCell(clue.row, clue.col, altDirection, gameState.currentPuzzle);
        highlightWord(clue.row, clue.col, altDirection, gameState.currentPuzzle);
        highlightClueForCell(clue.row, clue.col, gameState.currentPuzzle);
        return;
      }
    }
  }
function moveToPreviousCell(row, col, direction) {
  const [dRow, dCol] = direction === 'across' ? [0, -1] : [-1, 0];
  const prevInput = document.querySelector(`input[data-row="${row + dRow}"][data-col="${col + dCol}"]`);

  if (prevInput && !prevInput.classList.contains('black-cell')) {
    prevInput.focus();
    gameState.currentRow += dRow;
    gameState.currentCol += dCol;

    const clue = findCurrentClue(gameState.currentRow, gameState.currentCol, gameState.currentDirection, gameState.currentPuzzle);
    if (clue) {
        gameState.currentClueStartRow = clue.row;
        gameState.currentClueStartCol = clue.col;
        gameState.currentClueDirection = gameState.currentDirection;
    }
  }
}

function isCurrentWordComplete(row, col, direction) {
    const puzzle = gameState.currentPuzzle;
    if (!puzzle || !puzzle.grid) return false;
  
    let [dRow, dCol] = direction === 'across' ? [0, 1] : [1, 0];
    let startRow = row;
    let startCol = col;
  
    console.log("Checking completion for direction:", direction);
  
    while (
      isValidCell(startRow - dRow, startCol - dCol) &&
      puzzle.grid[startRow - dRow][startCol - dCol] !== '#'
    ) {
        startRow -= dRow;
        startCol -= dCol;
    }
    while (
        isValidCell(startRow, startCol) &&
        puzzle.grid[startRow][startCol] !== '#'
    ) {
      const cell = document.querySelector(`input[data-row="${startRow}"][data-col="${startCol}"]`);
  
      if (cell && !cell.value) {
        console.log("Found empty cell!");
        return false;
      }
      startRow += dRow;
      startCol += dCol;
    }
  
    console.log("Word is complete!");
    return true;
  }

function moveToNextWord() {
    const { currentClueStartRow, currentClueStartCol, currentClueDirection, currentPuzzle } = gameState;
    
    const allClues = [
      ...currentPuzzle.clues.across.map(c => ({ ...c, direction: 'across' })),
      ...currentPuzzle.clues.down.map(c => ({ ...c, direction: 'down' }))
    ].sort((a, b) => a.number - b.number);

    const currentClue = findCurrentClue(currentClueStartRow, currentClueStartCol, currentClueDirection);
    const currentIndex = allClues.findIndex(clue =>
      clue.row === currentClue.row &&
      clue.col === currentClue.col &&
      clue.direction === currentClue.direction
    );

    for (let i = currentIndex + 1; i < allClues.length; i++) {
        const clue = allClues[i];
        const input = document.querySelector(`input[data-row="${clue.row}"][data-col="${clue.col}"]`);
        if (input && !input.value) {
            clearHighlights();
            gameState.currentClueStartRow = clue.row;
            gameState.currentClueStartCol = clue.col;
            gameState.currentClueDirection = clue.direction;
            gameState.currentDirection = clue.direction;
            focusFirstEmptyCell(clue.row, clue.col, clue.direction, gameState.currentPuzzle);
            highlightWord(clue.row, clue.col, clue.direction, gameState.currentPuzzle);
            highlightClueForCell(clue.row, clue.col, gameState.currentPuzzle);
            
            // Ensure the input is visible and enabled before focusing
            if (input.offsetParent !== null && !input.disabled) {
              // Use setTimeout to ensure the DOM is ready
              setTimeout(() => {
                  input.focus();
              }, 0);
          }

            return;
        }
    }
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