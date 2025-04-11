// timer.js
import { toggleClues } from './crossword.js'

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

function padZero(num) {
  return num < 10 ? `0${num}` : num;
}

export function getElapsedTime() {
  return timeElapsed;
}