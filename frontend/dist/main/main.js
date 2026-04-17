"use strict";
// --- 1. STATE VARIABLES ---
// Using the exact locking mechanism from your documentation [cite: 54]
let lock = false;
// Array to keep track of the currently flipped cards [cite: 59]
let reversedCards = [];
let pairsFound = 0;
// Emojis for our 8 pairs (16 cards total for a 4x4 grid)
const cardIcons = ['🚗', '⛵', '🐶', '🐱', '🍎', '🍌', '🌞', '🌙'];
// Duplicate the icons to create pairs
const gameDeck = [...cardIcons, ...cardIcons];
// --- 2. FISHER-YATES SHUFFLE ---
// The algorithm described by Richard Durstenfeld in 1964 [cite: 66]
function fisherYatesShuffle(array) {
    for (let i = array.length - 1; i > 0; i--) { // [cite: 69]
        const j = Math.floor(Math.random() * (i + 1)); // [cite: 70]
        [array[i], array[j]] = [array[j], array[i]]; // [cite: 72]
    }
    return array; // [cite: 74]
}
// --- 3. INITIALIZE THE GAME ---
function initGame() {
    const gameBoard = document.getElementById('game-board');
    if (!gameBoard)
        return;
    // Clear board (useful if you add a restart button later)
    gameBoard.innerHTML = '';
    reversedCards = [];
    pairsFound = 0;
    lock = false; // [cite: 54]
    // Shuffle the deck [cite: 68]
    const shuffledDeck = fisherYatesShuffle(gameDeck);
    // Create the card elements
    shuffledDeck.forEach((icon) => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card');
        // Store the icon in a data attribute so we can compare them later
        cardElement.dataset.icon = icon;
        // Add the click event listener
        cardElement.addEventListener('click', () => kartyaforditas(cardElement));
        gameBoard.appendChild(cardElement);
    });
}
// --- 4. FLIP LOGIC ---
// The exact flip logic required to prevent bugs [cite: 53, 55]
const reversed = 'reversed';
const found = 'found';
function kartyaforditas(kartya) {
    // Prevent clicking if locked, already found, or already flipped [cite: 56, 57]
    if (lock || kartya.classList.contains(found) || reversedCards.includes(kartya)) {
        return;
    }
    // Flip the card visually (you can use CSS to reveal the icon based on this class)
    kartya.classList.add(reversed); // [cite: 59]
    kartya.innerText = kartya.dataset.icon || ''; // Show the icon
    reversedCards.push(kartya); // [cite: 59]
    // If two cards are flipped, check for a match [cite: 60]
    if (reversedCards.length === 2) {
        lock = true; // Lock the board [cite: 61]
        setTimeout(talalatellenorzese, 1000); // Check after 1 second [cite: 62]
    }
}
// --- 5. MATCH CHECKING LOGIC ---
function talalatellenorzese() {
    const [card1, card2] = reversedCards;
    // Do the icons match?
    if (card1.dataset.icon === card2.dataset.icon) {
        // It's a match! [cite: 52]
        card1.classList.remove(reversed);
        card2.classList.remove(reversed);
        card1.classList.add(found);
        card2.classList.add(found);
        pairsFound++;
        // Check if the game is over
        if (pairsFound === cardIcons.length) {
            setTimeout(() => alert('Congratulations! You found all pairs!'), 500);
        }
    }
    else {
        // Not a match, flip them back [cite: 50]
        card1.classList.remove(reversed);
        card2.classList.remove(reversed);
        card1.innerText = '';
        card2.innerText = '';
    }
    // Reset for the next turn
    reversedCards = [];
    lock = false;
}
// Start the game when the script loads
initGame();
