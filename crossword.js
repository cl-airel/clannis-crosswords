// Main file that loads all of the puzzles n whatnot
//function openNav() {
//  document.getElementById("side-section").style.width = "250px";
//}

//function closeNav() {
//  document.getElementById("side-section").style.width = "0";
//}

import { startTimer, stopTimer, updateTimer, isTimerRunning, getElapsedTime } from './timer.js';
import { loadPuzzle, highlightWord, focusFirstEmptyCell, highlightClueForCell } from './puzzle.js'
import { addAutoCheckListeners } from './inputHandlers.js';
import { gameState } from './gameState.js'

export function setupChecker() {
  document.getElementById("check-answers").addEventListener("click", () => {
    const puzzle = gameState.currentPuzzle;  
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

//let currentRow = null, currentCol = null;
//let currentDirection = "across";

loadPuzzle().then((loadedPuzzle) => {
  gameState.currentPuzzle = loadedPuzzle;

  //addAutoCheckListeners(puzzle);
  setupChecker();

  const firstClue = gameState.currentPuzzle.clues.across[0];
  gameState.currentRow = firstClue.row;
  gameState.currentCol = firstClue.col;
  gameState.currentDirection = 'across';

  focusFirstEmptyCell(firstClue.row, firstClue.col, 'across');
  highlightClueForCell(firstClue.row, firstClue.col)
});

//==MENU TOGGLES==//
document.querySelector('.ldr-bttn').addEventListener('click', openForm);
function openForm() {
  document.getElementById("myForm").style.display = "block";
}

function closeForm() {
  document.getElementById("myForm").style.display = "none";
}

document.querySelector('#mobile-menu').addEventListener('click', ()=> {
  document.querySelector('#mobile-menu').classList.toggle('is-active');
  document.querySelector('.navbar__menu').classList.toggle('active');
})

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  const modal = document.getElementById('id01');
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

//==USERNAME SUBMISSION==//
const usernameInput = document.getElementById('username');
const submitButton = document.getElementById('submit-username');
const usernameDisplay = document.getElementById('username-display');

// Add event listener to button
submitButton.addEventListener('click', function(event) {
    event.preventDefault(); // Prevent form submission (if it's within a form)
    const username = usernameInput.value.trim(); // Get the username and trim whitespace

    if (username) {
      gameState.username = username;
      usernameDisplay.textContent = `Welcome, ${username}!`;
      usernameInput.value = '';
    } else {
        alert("Please enter a valid username.");
    }
});

//==CHECK, RESET, and SAVE==//
export function checkAnswers() {
  const inputs = document.querySelectorAll('.cell:not(.black-cell)');
  let allFilled = true, allCorrect = true;

  inputs.forEach(input => {
    const expected = input.dataset.correctLetter;
    const value = input.value.toUpperCase();

    if (value === '') {
      allFilled = false
    } else if (value !== expected) {
      allCorrect = false
    }
  });

  if (allFilled && allCorrect) {
    stopTimer();
    const textTime = document.getElementById('timer').textContent;
    const time = getElapsedTime();

    let username = prompt("Puzzle solved! my god!! Please enter ur usr ;)")
    if (!username || username.trim() === "") {
      username = "anonymous";
    }
    //const username = gameState.username || "Anonymous";
    saveToLeaderboard(username.trim(), time);

    
    //alert(`🎉 Puzzle Solved in ${time}! Great job ${username}!`);

    document.getElementById('congrats-message').innerHTML = `Congratulations ${username}! You solved the puzzle in ${textTime}.`;

    inputs.forEach(i => i.style.color = '#3f7b62');
    confetti({ particleCount: 200, spread: 70, origin: { y: 0.6 } });
  } else if (allFilled && !allCorrect) {
    alert("Oops! Some answers are incorrect.");
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

async function saveToLeaderboard(username, time) {
  try {
    await addDoc(collection(db, "leaderboard"), {
      username,
      time,
      timestamp: serverTimestamp()
   });
    console.log("Score saved to leaderboard!");
  } catch (err) {
    console.error("Error saving score:", err);
  }
}

//== ==//

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

export function toggleClues(show) {
  const acrossClues = document.querySelectorAll('#across-clues li');
  const downClues = document.querySelectorAll('#down-clues li');

  acrossClues.forEach(clue => {
    clue.style.visibility = show ? 'visible' : 'hidden';
  });

  downClues.forEach(clue => {
    clue.style.visibility = show ? 'visible' : 'hidden';
  });
}

//==CONTROLS==//
document.getElementById('play-button').addEventListener('click', function() {
  const icon = document.getElementById('icon');
  if (isTimerRunning()) {
    stopTimer();
    toggleClues(false); 
    icon.innerHTML = '&#9658;';
  } else {
    startTimer();
    //toggleClues(true);
    //icon.innerHTML = "&#10074;&#10074;";
  }
});

//document.getElementById('check-answers').addEventListener('click', checkAnswers);
document.getElementById('reset').addEventListener('click', resetPuzzle)


