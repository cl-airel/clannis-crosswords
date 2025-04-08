// Main file that loads all of the puzzles n whatnot

async function loadPuzzle() {
//loads puzzles from puzzle-archive folder
  const response = await fetch('puzzle-archive/test_puzzle.json');
  const puzzle = await response.json();
  
  renderPuzzle(puzzle);
  setupChecker(puzzle);
  displayClues(puzzle);
}
  
function renderPuzzle(puzzle) {
  const container = document.getElementById("puzzle-container");
  container.style.gridTemplateColumns = `repeat(${puzzle.size.cols}, 40px)`;

  puzzle.grid.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
          // Create a wrapper div for each cell (input + clue number)
          const cellWrapper = document.createElement("div");
          cellWrapper.classList.add("cell-wrapper");

          const input = document.createElement("input");
          input.classList.add("cell");
          input.maxLength = 1;
          input.dataset.row = rowIndex;
          input.dataset.col = colIndex;

          // If the cell is not a black cell
          if (cell !== "#") {
              // Check for across and down clues that match this cell
              const clueNumber = getClueNumber(puzzle, rowIndex, colIndex);
              
              if (clueNumber) {
                  const clueDiv = document.createElement("div");
                  clueDiv.classList.add("clue-number");
                  clueDiv.textContent = clueNumber;

                  // Append the clue number div to the wrapper
                  cellWrapper.appendChild(clueDiv);
              }
          } else {
              input.classList.add("black-cell");
              input.disabled = true;
          }

          // Append the input to the wrapper
          cellWrapper.appendChild(input);
          container.appendChild(cellWrapper);
      });
  });
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
  
function setupChecker(puzzle) {
  document.getElementById("check-answers").addEventListener("click", () => {
      const inputs = document.querySelectorAll(".cell");
      let allCorrect = true;

      inputs.forEach((input) => {
          const row = input.dataset.row;
          const col = input.dataset.col;
          const userAnswer = input.value.toUpperCase();
          const correctAnswer = puzzle.solution[row][col];

          // Skip the black cells from being checked and colored
          if (input.classList.contains("black-cell")) {
              return; // Don't change the color of black cells
          }

          if (userAnswer === correctAnswer) {
              input.style.backgroundColor = "#c8e6c9"; // green tint
          } else {
              input.style.backgroundColor = "#ffcdd2"; // red tint
              allCorrect = false;
          }
      });

      if (allCorrect) alert("🎉 You solved it!");
  });
}

  function displayClues(puzzle) {
    const acrossList = document.getElementById("across-clues");
    const downList = document.getElementById("down-clues");
  
    puzzle.clues.across.forEach(({ number, clue }) => {
      const li = document.createElement("li");
      li.textContent = `${number}. ${clue}`;
      acrossList.appendChild(li);
    });
  
    puzzle.clues.down.forEach(({ number, clue }) => {
      const li = document.createElement("li");
      li.textContent = `${number}. ${clue}`;
      downList.appendChild(li);
    });
  }
  
  // Load the puzzle when the page loads
  loadPuzzle();