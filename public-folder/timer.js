// timer.js

let timerRunning = false;
let timerInterval;
let timeElapsed = 0;

export function startTimer() {
  if (timerRunning) return;
  timerRunning = true;
  timerInterval = setInterval(updateTimer, 1000);
  toggleClues(true);
  icon.innerHTML = "&#10074;&#10074;";
}

export function stopTimer() {
  clearInterval(timerInterval);
  timerRunning = false;
  toggleClues(false); 
  icon.innerHTML = '&#9658;';
}

export function resetTimer() {
  clearInterval(timerInterval);
  timerRunning = false;
  timeElapsed = 0;
}

export function isTimerRunning() {
    return timerRunning;
}

export function updateTimer() {
  timeElapsed++;
  const minutes = Math.floor(timeElapsed / 60);
  const seconds = timeElapsed % 60;
  const formatted = `${padZero(minutes)}:${padZero(seconds)}`;
  document.getElementById('timer').textContent = formatted;
  return formatted;
}

export function getElapsedTime() {
  return timeElapsed;
}

function padZero(num) {
  return num < 10 ? `0${num}` : num;
}

function toggleClues(show) {
  //toggles visibility to visible/hidden when timer is running/stopped
  const acrossClues = document.querySelectorAll('#across-clues li');
  const downClues = document.querySelectorAll('#down-clues li');

  acrossClues.forEach(clue => {
    clue.style.visibility = show ? 'visible' : 'hidden';
  });

  downClues.forEach(clue => {
    clue.style.visibility = show ? 'visible' : 'hidden';
  });
}