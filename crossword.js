// Main file that loads all of the puzzles n whatnot
function openNav() {
  document.getElementById("side-section").style.width = "250px";
}

function closeNav() {
  document.getElementById("side-section").style.width = "0";
}

const menu = document.querySelector('#mobile-menu');
const menuLinks = document.querySelector('.navbar__menu');

let lastClickedCell = null;
let lastDirection = "across";

let currentRow = null;
let currentCol = null;
let currentDirection = "across";
let currentCell = null;
let currentWord = [];

let timerInterval;
let timeElapsed = 0;
let timerRunning = false;

menu.addEventListener('click', function() {
  menu.classList.toggle('is-active');
  menuLinks.classList.toggle('active');
})

async function loadPuzzle() {
  const response = await fetch('puzzle-archive/test_puzzle.json');
  const puzzle = await response.json();
  
  renderPuzzle(puzzle);
  setupChecker(puzzle);
  displayClues(puzzle);
  addAutoCheckListeners();
}
  
function renderPuzzle(puzzle) {
  const container = document.getElementById("puzzle-container");
  container.style.setProperty('--cols', puzzle.size.cols);
  container.style.setProperty('--rows', puzzle.size.rows); 


  puzzle.grid.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
          const cellWrapper = document.createElement("div");
          cellWrapper.classList.add("cell-wrapper");

          const input = document.createElement("input");
          input.classList.add("cell");
          input.maxLength = 1;
          input.dataset.row = rowIndex;
          input.dataset.col = colIndex;

          input.addEventListener("click", () => {
            const clickedCellKey = `${rowIndex}-${colIndex}`;
            lastDirection = (lastClickedCell === clickedCellKey) ? (lastDirection === "across" ? "down" : "across") : "across;"
            lastClickedCell = clickedCellKey;

            highlightWord(rowIndex, colIndex, lastDirection, puzzle);
          });

          input.addEventListener("focus", () => {
            highlightClueForCell(rowIndex, colIndex, puzzle);
          });

          // If the cell is not a black cell
          if (cell !== "#") {
              // Check for across and down clues that match this cell
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
 //so far so good 
function setupChecker(puzzle) {
  document.getElementById("check-answers").addEventListener("click", () => {
      const inputs = document.querySelectorAll(".cell");
      let allCorrect = true;

      inputs.forEach((input) => {
          const { row, col } = input.dataset;
          const userAnswer = input.value.toUpperCase();
          const correctAnswer = puzzle.solution[row][col];

          if (input.classList.contains("black-cell")) {return;}

          if (userAnswer === correctAnswer) {
            input.style.color = "#3f7b62";
          } else {
              input.style.color = "#cf300e";
              allCorrect = false;
          }
      });

      if (allCorrect) alert("🎉 You solved it!");
  });
}

function checkAnswers() {
  const inputs = document.querySelectorAll('.cell:not(.black-cell)');
  let allFilled = true;
  let allCorrect = true;

  inputs.forEach(input => {
    const expected = input.dataset.correctLetter;
    const value = input.value.toUpperCase();

    if (value === '') {allFilled = false} 
    else if (value !== expected) {allCorrect = false}
  });

  if (allFilled && allCorrect) {
    alert(`🎉 Puzzle Solved in ${padZero(minutes)}:${padZero(seconds)}! Great job!`);
    stopTimer();
    inputs.forEach(input => {
      input.style.color = '#3f7b62';
    });
    confetti({
      particleCount: 200,
      spread: 70,
      origin: { y: 0.6 }
    });
  } else if (allFilled && !allCorrect) {
    alert("Oops! Some answers are incorrect.");
  }
}

// Function to find the clue number based on row and column position
function getClueNumber(puzzle, rowIndex, colIndex) {
  // Check across clues
  for (const clue of puzzle.clues.across) {
      if (clue.row === rowIndex && clue.col === colIndex) {
          return clue.number;
      }
  }
  // Check down clues
  for (const clue of puzzle.clues.down) {
      if (clue.row === rowIndex && clue.col === colIndex) {
          return clue.number;
      }
  }

  return null;  // No clue for this cell
}
//this is when it was all good!!
  function displayClues(puzzle) {
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
      li.addEventListener("click", () => focusFirstEmptyCell(row, col, "across", puzzle));
      acrossList.appendChild(li);
    });
  
    puzzle.clues.down.forEach(({ number, clue, row, col }) => {
      const li = document.createElement("li");
      li.id = `clue-down-${row}-${col}`;
      li.textContent = `${number}. ${clue}`;
      li.dataset.row = row;
      li.dataset.col = col;
      li.addEventListener("click", () => focusFirstEmptyCell(row, col, "down", puzzle));
      downList.appendChild(li);
    });
  }

function addAutoCheckListeners() {
  document.querySelectorAll('.cell:not(.black-cell)').forEach(input => {
    input.addEventListener('input', handleInput);
    input.addEventListener('keydown', handleKeyDown);
    input.addEventListener('focus', handleFocus);
  });
}

function handleInput(e) {
  const input = e.target;
  const value = input.value;

  input.style.color = 'black';
  input.style.backgroundColor = '';
  checkAnswers();

  if (value.length > 0) {
    moveToNextCell(currentRow, currentCol, currentDirection);
  }

  if (currentRow !== null && currentCol !== null) {
    highlightWord(currentRow, currentCol, currentDirection, puzzle);
  }
}

function handleKeyDown(e) {
  if (e.key ==='Backspace') {
    moveToPreviousCell(currentRow, currentCol, currentDirection);
  }
}

function handleFocus(e) {
  const input = e.target;
  currentRow = parseInt(input.dataset.row);
  currentCol = parseInt(input.dataset.col);

  // Guess direction based on neighbors
  const right = document.querySelector(`input[data-row="${currentRow}"][data-col="${currentCol + 1}"]`);
  const down = document.querySelector(`input[data-row="${currentRow + 1}"][data-col="${currentCol}"]`);
  currentDirection = right && !right.classList.contains("black-cell") ? "across" : "down";

  highlightWord(currentRow, currentCol, currentDirection, puzzle);
}
  
function moveToPreviousCell(row, col, direction) {
  const [dRow, dCol] = direction === 'across' ? [0, -1] : [-1, 0];
  const prevInput = document.querySelector(`input[data-row="${row + dRow}"][data-col="${col + dCol}"]`);

  if (prevInput && !prevInput.classList.contains('black-cell')) {
    prevInput.focus();
    currentRow += dRow;
    currentCol += dCol;
  }
}
  
  function resetPuzzle() {
    const inputs = document.querySelectorAll('.cell:not(.black-cell)');
    inputs.forEach(input => {
      input.value = '';
      input.style.backgroundColor = '';
      input.style.color = 'black';
    });
  }

  function highlightClueForCell(row, col, puzzle) {
    // Remove existing highlights
    document.querySelectorAll(".clue").forEach(clue => {
      clue.classList.remove("highlighted-clue");
    });
  
    // Find the clue starting at this cell
    let clueId = null;
  
    for (const clue of puzzle.clues.across) {
      if (clue.row == row && clue.col == col) {
        clueId = `clue-across-${row}-${col}`;
        break;
      }
    }
  
    if (!clueId) {
      for (const clue of puzzle.clues.down) {
        if (clue.row == row && clue.col == col) {
          clueId = `clue-down-${row}-${col}`;
          break;
        }
      }
    }
  
    if (clueId) {
      const clueElement = document.getElementById(clueId);
      if (clueElement) clueElement.classList.add("highlighted-clue");
    }
  }
//everything works at this point
  function focusFirstEmptyCell(startRow, startCol, direction, puzzle) {
    let r = startRow, c = startCol;
  
    while (r < puzzle.size.rows && c < puzzle.size.cols) {
      const cell = document.querySelector(`input[data-row="${r}"][data-col="${c}"]`);
      setCurrentClue(r, c, direction);
      if (cell && !cell.disabled && cell.value === "") {
        cell.focus();
        highlightWord(r, c, direction, puzzle);
        return;
      }
      if (direction === "across") c++;
      else r++;
    }
    
  }
  //where everything was so cool!!!
  function highlightWord(row, col, direction, puzzle) {
    clearHighlights();
  
    let [dRow, dCol] = direction === 'across' ? [0, 1] : [1, 0];
  
    // Step back to the start of the word
    while (
      isValidCell(row - dRow, col - dCol, puzzle) &&
      puzzle.grid[row - dRow][col - dCol] !== '#'
    ) {
      row -= dRow;
      col -= dCol;
    }
  
    const startRow = row;
    const startCol = col;

    // Highlight the whole word
    while (isValidCell(row, col, puzzle) && puzzle.grid[row][col] !== '#') {
      const cell = document.querySelector(`input[data-row="${row}"][data-col="${col}"]`);
      if (cell) cell.classList.add('highlighted');
      row += dRow;
      col += dCol;
    }

    // Also highlight corresponding clue
    const clueId = `clue-${direction}-${startRow}-${startCol}`;
    document.querySelectorAll(".highlighted-clue").forEach(el => el.classList.remove("highlighted-clue"));
    const clueElement = document.getElementById(clueId);
    if (clueElement) clueElement.classList.add("highlighted-clue");
  }
  
  function clearHighlights() {
    document.querySelectorAll('.highlighted').forEach(cell =>
      cell.classList.remove('highlighted')
    );
  }
  
  function isValidCell(row, col, puzzle) {
    return row >= 0 && row < puzzle.grid.length && 
    col >= 0 && col < puzzle.grid[0].length;
  }

function moveToNextCell(row, col, direction) {
  let nextRow = row;
  let nextCol = col;

  if (direction === 'across') {
    nextCol++;
  } else if (direction === 'down') {
    nextRow++;
  }

  const nextInput = document.querySelector(`input[data-row="${nextRow}"][data-col="${nextCol}"]`);
  
  if (nextInput && !nextInput.classList.contains('black-cell')) {
    nextInput.focus();
    currentRow = nextRow;
    currentCol = nextCol;
  }
}

function startTimer() {
  if (timerRunning) return; // Prevent multiple timers

  timerRunning = true;
  timerInterval = setInterval(updateTimer, 1000); // Update every second
}

function updateTimer() {
  timeElapsed++; // Increment time by 1 second

  const minutes = Math.floor(timeElapsed / 60); // Get minutes
  const seconds = timeElapsed % 60; // Get seconds

  // Format the timer as MM:SS
  const formattedTime = `${padZero(minutes)}:${padZero(seconds)}`;
  document.getElementById('timer').textContent = formattedTime;
}

function padZero(number) {
  return number < 10 ? `0${number}` : number;
}

function stopTimer() {
  clearInterval(timerInterval); // Stop the timer
  timerRunning = false;
}

function setCurrentClue(row, col, direction) {
  // Reset the 'data-current' attribute for all clues
  const allClues = document.querySelectorAll('#across-clues li, #down-clues li');
  allClues.forEach(clue => clue.dataset.current = 'false');

  // Find the clue for the current cell
  const currentClueAcross = document.querySelector(`#clue-across-${row}-${col}`);
  const currentClueDown = document.querySelector(`#clue-down-${row}-${col}`);

  // Set 'data-current' to 'true' for the corresponding clues
  if (currentClueAcross) currentClueAcross.dataset.current = 'true';
  if (currentClueDown) currentClueDown.dataset.current = 'true';
}

function toggleClues(show) {
  const acrossClues = document.querySelectorAll('#across-clues li');
  const downClues = document.querySelectorAll('#down-clues li');

  acrossClues.forEach(clue => {
    clue.style.visibility = show ? 'visible' : 'hidden';
  });

  downClues.forEach(clue => {
    clue.style.visibility = show ? 'visible' : 'hidden';
  });
}

document.getElementById('play-button').addEventListener('click', function() {
  const icon = document.getElementById('icon')

  //timerRunning = !timerRunning;

  if (timerRunning) {
    stopTimer();
    toggleClues(false); 
    icon.innerHTML = '&#9658';
  } else {
    startTimer();
    icon.innerHTML = "&#10074;&#10074;";
    toggleClues(true);
     }
});

document.getElementById('check-answers').addEventListener('click', checkAnswers);
document.getElementById('reset').addEventListener('click', resetPuzzle)

// Load the puzzle when the page loads
loadPuzzle();