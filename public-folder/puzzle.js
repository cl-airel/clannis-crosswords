let lastClickedCell = null, lastDirection = "across";

import { addAutoCheckListeners, isValidCell } from './inputHandlers.js'
import { setupChecker, getRandomImage, loadLeaderboard } from './crossword.js';
import { gameState } from './gameState.js'

export async function loadPuzzle() {
  console.log("Puzzle ID:", document.body.dataset.puzzleId)
  gameState.puzzleId = document.body.dataset.puzzleId;
  const filePath = `puzzle-archive/${gameState.puzzleId}.json`;

  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`Puzzle ${filePath} not found :(`)
    }
  const puzzle = await response.json();

  gameState.currentPuzzle = puzzle;

  renderPuzzle(puzzle);
  displayClues(puzzle);
  setupChecker(puzzle);
  addAutoCheckListeners(puzzle);
  getRandomImage();
  loadLeaderboard(gameState.puzzleId);

  return puzzle;
  } catch (error) {
    console.error("failed to load puzzle", error)
  }
}

export function renderPuzzle(puzzle) {
  const container = document.getElementById("puzzle-container");
  container.style.setProperty('--cols', puzzle.size.cols);
  container.style.setProperty('--rows', puzzle.size.rows); 
  gameState.puzzle = puzzle;
  
  puzzle.grid.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      const cellWrapper = document.createElement("div");
      cellWrapper.classList.add("cell-wrapper");

      const input = document.createElement("input");
      input.classList.add("cell");
      input.maxLength = 1;
      input.dataset.row = rowIndex;
      input.dataset.col = colIndex;

      input.setAttribute("autocomplete", "off");
      input.setAttribute("inputmode", "text");
      input.setAttribute("autocapitalize", "off");

      input.addEventListener("click", () => {
        const clickedKey = `${rowIndex}-${colIndex}`;
        if (lastClickedCell === clickedKey) {
          lastDirection = lastDirection === "across" ? "down" : "across";
        }
        lastClickedCell = clickedKey;

        gameState.currentRow = rowIndex;
        gameState.currentCol = colIndex;
        gameState.currentDirection = lastDirection;
        
        highlightWord(rowIndex, colIndex, lastDirection);
      });

      input.addEventListener("focus", () => {
        highlightClueForCell(rowIndex, colIndex);
      });

      if (cell !== "#") {
        const clueNumber = getClueNumber(puzzle, rowIndex, colIndex);
        input.dataset.correctLetter = puzzle.solution[rowIndex][colIndex].toUpperCase();
        
        if (clueNumber) {
          const clueDiv = document.createElement("div");
          clueDiv.classList.add("clue-number");
          clueDiv.textContent = clueNumber;
          cellWrapper.appendChild(clueDiv);
        }
      } else {
        input.classList.add("black-cell");
        input.disabled = true;
      }

      cellWrapper.appendChild(input);
      container.appendChild(cellWrapper);
    });
  });
}

function getClueNumber(puzzle, rowIndex, colIndex) {
//finds and assigns a number to the across and down clues based on the information in the .json file
  for (const clue of puzzle.clues.across) {
    if (clue.row === rowIndex && clue.col === colIndex) return clue.number;
  }
  for (const clue of puzzle.clues.down) {
    if (clue.row === rowIndex && clue.col === colIndex) return clue.number;
  }
  return null;
}

function displayClues(puzzle) {
//correlates and displays the clues for each word
  const acrossList = document.getElementById("across-clues");
  const downList = document.getElementById("down-clues");

  acrossList.innerHTML = '';
  downList.innerHTML = '';

  puzzle.clues.across.forEach(({ number, clue, row, col }) => {
    const li = document.createElement("li");
    li.textContent = `${number}. ${clue}`;
    li.id = `clue-across-${row}-${col}`;
    li.dataset.row = row;
    li.dataset.col = col;
    li.classList.add("clue");
    acrossList.appendChild(li);
  });

  puzzle.clues.down.forEach(({ number, clue, row, col }) => {
    const li = document.createElement("li");
    li.textContent = `${number}. ${clue}`;
    li.id = `clue-down-${row}-${col}`;
    li.dataset.row = row;
    li.dataset.col = col;
    li.classList.add("clue");
    downList.appendChild(li);
  });
}


export function highlightClueForCell(row, col) {
  document.querySelectorAll(".clue").forEach(clue => {
    clue.classList.remove("highlighted-clue");
  });

  const puzzle = gameState.currentPuzzle;

  const clueId = puzzle.clues.across.find(c => c.row == row && c.col == col)
    ? `clue-across-${row}-${col}`
    : `clue-down-${row}-${col}`;

  const clueElement = document.getElementById(clueId);

  if (clueElement) {
    clueElement.classList.add("highlighted-clue")
  };
}

export function highlightWord(row, col, direction) {
  clearHighlights();
  const puzzle = gameState.currentPuzzle;
  const [dRow, dCol] = direction === 'across' ? [0, 1] : [1, 0];

  while (isValidCell(row - dRow, col - dCol, puzzle) && puzzle.grid[row - dRow][col - dCol] !== '#') {
    row -= dRow;
    col -= dCol;
  }

  const startRow = row, startCol = col;

  while (isValidCell(row, col) && puzzle.grid[row][col] !== '#') {
    const cell = document.querySelector(`input[data-row="${row}"][data-col="${col}"]`);
    if (cell) cell.classList.add("highlighted");
    row += dRow;
    col += dCol;
  }

  const clueId = `clue-${direction}-${startRow}-${startCol}`;
  document.querySelectorAll(".highlighted-clue").forEach(el => el.classList.remove("highlighted-clue"));
  const clueElement = document.getElementById(clueId);
  if (clueElement) clueElement.classList.add("highlighted-clue");
}

export function clearHighlights() {
  document.querySelectorAll('.highlighted').forEach(cell =>
    cell.classList.remove('highlighted')
  );
}

export function focusFirstEmptyCell(row, col, direction) {
  const puzzle = gameState.currentPuzzle;
  let [dRow, dCol] = direction === 'across' ? [0, 1] : [1, 0];

  while (isValidCell(row, col) && puzzle.grid[row][col] !== '#') {
    const cell = document.querySelector(`input[data-row="${row}"][data-col="${col}"]`);
    if (cell && !cell.value) {
      cell.focus();
      return;
    }
    row += dRow;
    col += dCol;
  }
}