async function loadPuzzle() {
    const response = await fetch('puzzle-archive/test_puzzle.json');
    const puzzle = await response.json();
  
    renderPuzzle(puzzle);
    setupChecker(puzzle);
  }
  
  function renderPuzzle(puzzle) {
    const container = document.getElementById("puzzle-container");
    container.style.gridTemplateColumns = `repeat(${puzzle.size.cols}, 40px)`;
  
    puzzle.grid.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        const input = document.createElement("input");
        if (cell === "■") {
          input.classList.add("black-cell");
          input.disabled = true;
        } else {
          input.classList.add("cell");
          input.maxLength = 1;
          input.dataset.row = rowIndex;
          input.dataset.col = colIndex;
        }
        container.appendChild(input);
      });
    });
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
  
  // Load the puzzle when the page loads
  loadPuzzle();