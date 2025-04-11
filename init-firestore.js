import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-analytics.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCHJhzn_9WUpT9O2up9ZrGC5s6qnHmc5qc",
  authDomain: "clannis-crosswords.firebaseapp.com",
  projectId: "clannis-crosswords",
  storageBucket: "clannis-crosswords.firebasestorage.app",
  messagingSenderId: "364161917758",
  appId: "1:364161917758:web:fddc4972bc9e0497afc26f",
  measurementId: "G-BLNYZEGM8B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firestore
const db = getFirestore(app);

// Get the form and username input
const form = document.querySelector('form');
const usernameInput = document.getElementById('username');

// Add event listener to form submission
form.addEventListener('submit', async function (event) {
  event.preventDefault(); // Prevent form from submitting and reloading the page

  const username = usernameInput.value.trim(); // Get username and trim whitespace

  if (username) { // Check if the username is not empty
    try {
      // Save the username to Firestore in a "users" collection
      const docRef = await addDoc(collection(db, "users"), {
        username: username,
        timestamp: new Date() // Optional: Add a timestamp
      });

      console.log("Username saved with ID: ", docRef.id);

      // Optionally, close the modal after saving
      document.getElementById('id01').style.display = 'none';

      // Clear the input field
      usernameInput.value = '';
    } catch (e) {
      console.error("Error saving username: ", e);
    }
  } else {
    alert("Please enter a valid username.");
  }
});