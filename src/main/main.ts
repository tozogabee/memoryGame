// --- 1. STATE VARIABLES ---
let lock: boolean = false;
let reversedCards: HTMLElement[] = [];
let pairsFound: number = 0;
let score: number = 0;
let timerInterval: number | null = null;
let elapsedSeconds: number = 0;

// Emojis for our 8 pairs (16 cards total for a 4x4 grid)
const cardIcons: string[] = ['🚗', '⛵', '🐶', '🐱', '🍎', '🍌', '🌞', '🌙'];
// Duplicate the icons to create pairs
const gameDeck: string[] = [...cardIcons, ...cardIcons];

// --- 2. FISHER-YATES SHUFFLE ---
// The algorithm described by Richard Durstenfeld in 1964 [cite: 66]
function fisherYatesShuffle<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) { // [cite: 69]
        const j = Math.floor(Math.random() * (i + 1)); // [cite: 70]
        [array[i], array[j]] = [array[j], array[i]]; // [cite: 72]
    }
    return array; // [cite: 74]
}

// --- 3. TIMER HELPERS ---
function startTimer(): void {
    if (timerInterval !== null) return;
    timerInterval = window.setInterval(() => {
        elapsedSeconds++;
        const timerEl = document.getElementById('timer');
        if (timerEl) timerEl.textContent = `${elapsedSeconds}s`;
    }, 1000);
}

function stopTimer(): void {
    if (timerInterval !== null) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function updateScore(points: number): void {
    score += points;
    const scoreEl = document.getElementById('score');
    if (scoreEl) scoreEl.textContent = String(score);
}

// --- 4. INITIALIZE THE GAME ---
function initGame(): void {
    const gameBoard = document.getElementById('game-board');
    if (!gameBoard) return;

    gameBoard.innerHTML = '';
    reversedCards = [];
    pairsFound = 0;
    score = 0;
    elapsedSeconds = 0;
    lock = false;
    stopTimer();

    const scoreEl = document.getElementById('score');
    const timerEl = document.getElementById('timer');
    if (scoreEl) scoreEl.textContent = '0';
    if (timerEl) timerEl.textContent = '0s';

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


function kartyaforditas(kartya: HTMLElement): void {
    if (lock || kartya.classList.contains(found) || reversedCards.includes(kartya)) {
        return;
    }

    startTimer();

    kartya.classList.add(reversed);
    kartya.innerText = kartya.dataset.icon || '';

    reversedCards.push(kartya);

    if (reversedCards.length === 2) {
        lock = true;
        setTimeout(talalatellenorzese, 1000);
    }
}

// --- 5. MATCH CHECKING LOGIC ---
function talalatellenorzese(): void {
    const [card1, card2] = reversedCards;

    // Do the icons match?
    if (card1.dataset.icon === card2.dataset.icon) {
        // It's a match! [cite: 52]
        card1.classList.remove(reversed);
        card2.classList.remove(reversed);
        card1.classList.add(found);
        card2.classList.add(found);

        pairsFound++;
        updateScore(10);

        if (pairsFound === cardIcons.length) {
            stopTimer();
            setTimeout(() => alert(`Congratulations! You found all pairs!\nScore: ${score} | Time: ${elapsedSeconds}s`), 500);
        }
    } else {
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