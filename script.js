// NEURAL FLOW V14 - Timer Application

let timeLeft = 25 * 60; // 25 minutes in seconds
let timerInterval = null;
let isRunning = false;
let isFocusSession = true;
let sessionCount = 1;
let totalFocusSeconds = 0;
let completedToday = false;

const timeDisplay = document.getElementById('timeDisplay');
const subDisplay = document.getElementById('subDisplay');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const focusTimeInput = document.getElementById('focusTime');
const breakTimeInput = document.getElementById('breakTime');
const sessionCountDisplay = document.getElementById('sessionCount');
const totalFocusDisplay = document.getElementById('totalFocus');
const currentStreakDisplay = document.getElementById('currentStreak');
const timerSection = document.querySelector('.timer-section');

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    updateDisplay();
    loadFromLocalStorage();
    checkDailyCompletion();
});

// Timer Functions
function toggleTimer() {
    if (isRunning) {
        pauseTimer();
    } else {
        startTimer();
    }
}

function startTimer() {
    if (isRunning) return;

    // Validate inputs
    const focusMinutes = parseInt(focusTimeInput.value);
    const breakMinutes = parseInt(breakTimeInput.value);

    if (isNaN(focusMinutes) || isNaN(breakMinutes)) {
        alert('Please enter valid numbers for focus and break duration.');
        return;
    }

    isRunning = true;
    startBtn.textContent = 'Resume';
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    focusTimeInput.disabled = true;
    breakTimeInput.disabled = true;
    timerSection.classList.add('timer-running');

    timerInterval = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            updateDisplay();
        } else {
            completeSession();
        }
    }, 1000);
}

function pauseTimer() {
    isRunning = false;
    clearInterval(timerInterval);
    startBtn.textContent = 'Resume';
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    timerSection.classList.remove('timer-running');
}

function resetTimer() {
    pauseTimer();
    isFocusSession = true;
    timeLeft = parseInt(focusTimeInput.value) * 60;
    focusTimeInput.disabled = false;
    breakTimeInput.disabled = false;
    updateDisplay();
    timerSection.classList.remove('timer-running');
    startBtn.textContent = 'Start';
    startBtn.disabled = false;
}

function completeSession() {
    pauseTimer();
    playNotification();

    if (isFocusSession) {
        // Focus session completed
        totalFocusSeconds += parseInt(focusTimeInput.value) * 60;
        completedToday = true;
        saveToLocalStorage();
        recordDailyCompletion();
        
        // Switch to break
        isFocusSession = false;
        timeLeft = parseInt(breakTimeInput.value) * 60;
        subDisplay.textContent = 'Break Time';
        showNotification('Focus session completed! Time for a break.');
    } else {
        // Break completed
        isFocusSession = true;
        sessionCount++;
        timeLeft = parseInt(focusTimeInput.value) * 60;
        subDisplay.textContent = 'Focus Session';
        showNotification('Break over! Ready for the next session?');
    }

    updateDisplay();
    startBtn.textContent = 'Start';
    startBtn.disabled = false;
}

function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timeDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    sessionCountDisplay.textContent = sessionCount;
    
    const hours = Math.floor(totalFocusSeconds / 3600);
    const minutes_remaining = Math.floor((totalFocusSeconds % 3600) / 60);
    totalFocusDisplay.textContent = `${hours}h ${minutes_remaining}m`;
    
    updateStreakDisplay();
}

function updateStreakDisplay() {
    const streak = getStreakCount();
    currentStreakDisplay.textContent = `${streak} ${streak === 1 ? 'day' : 'days'}`;
}

// Notification Functions
function playNotification() {
    // Create a simple beep using Web Audio API
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
        console.log('Notification sound unavailable');
    }
}

function showNotification(message) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('NEURAL FLOW V14', {
            body: message,
            icon: '⏱️'
        });
    }
}

// Request notification permission
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}

// Local Storage Functions
function saveToLocalStorage() {
    const data = {
        sessionCount,
        totalFocusSeconds,
        completedToday,
        lastCompletionDate: new Date().toISOString().split('T')[0]
    };
    localStorage.setItem('timerData', JSON.stringify(data));
}

function loadFromLocalStorage() {
    const data = localStorage.getItem('timerData');
    if (data) {
        const parsed = JSON.parse(data);
        sessionCount = parsed.sessionCount || 1;
        totalFocusSeconds = parsed.totalFocusSeconds || 0;
        completedToday = parsed.completedToday || false;
        updateDisplay();
    }
}

// Streak Functions
function getStreakCount() {
    const streaks = JSON.parse(localStorage.getItem('streaks') || '{}');
    const today = new Date().toISOString().split('T')[0];
    
    let currentStreak = 0;
    let checkDate = new Date(today);

    while (true) {
        const dateStr = checkDate.toISOString().split('T')[0];
        if (streaks[dateStr]) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            break;
        }
    }

    return currentStreak;
}

function recordDailyCompletion() {
    const streaks = JSON.parse(localStorage.getItem('streaks') || '{}');
    const today = new Date().toISOString().split('T')[0];
    streaks[today] = true;
    localStorage.setItem('streaks', JSON.stringify(streaks));
}

function checkDailyCompletion() {
    const data = localStorage.getItem('timerData');
    if (data) {
        const parsed = JSON.parse(data);
        const today = new Date().toISOString().split('T')[0];
        if (parsed.lastCompletionDate !== today) {
            // Reset for new day
            completedToday = false;
        }
    }
}

// Streak Modal Functions
function openStreakModal() {
    const modal = document.getElementById('streakModalOverlay');
    modal.classList.add('active');
    renderCalendar();
}

function closeStreakModal(event) {
    if (event && event.target.id !== 'streakModalOverlay') return;
    const modal = document.getElementById('streakModalOverlay');
    modal.classList.remove('active');
}

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeStreakModal({ target: { id: 'streakModalOverlay' } });
    }
});

// Export functions for use in streak.js
window.openStreakModal = openStreakModal;
window.closeStreakModal = closeStreakModal;
window.getStreakData = () => JSON.parse(localStorage.getItem('streaks') || '{}');
window.getSessionCount = () => sessionCount;
window.getTotalFocusSeconds = () => totalFocusSeconds;
