// Streak Calendar Module

let currentMonth = new Date();

function renderCalendar() {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const today = new Date();
    const todayDate = today.toISOString().split('T')[0];

    // Update month display
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    document.getElementById('monthDisplay').textContent = `${monthNames[month]} ${year}`;

    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const streakData = window.getStreakData();
    const calendarDaysContainer = document.getElementById('calendarDays');
    calendarDaysContainer.innerHTML = '';

    // Previous month's days
    for (let i = firstDay - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        const dayElement = createDayElement(day, 'other-month');
        calendarDaysContainer.appendChild(dayElement);
    }

    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateStr = date.toISOString().split('T')[0];
        const isToday = dateStr === todayDate;
        const isCompleted = streakData[dateStr] !== undefined;

        let classes = '';
        if (isToday) classes += 'today ';
        if (isCompleted) classes += 'completed';

        const dayElement = createDayElement(day, classes);
        calendarDaysContainer.appendChild(dayElement);
    }

    // Next month's days
    const totalCells = calendarDaysContainer.children.length;
    const remainingCells = 42 - totalCells; // 6 weeks * 7 days
    for (let day = 1; day <= remainingCells; day++) {
        const dayElement = createDayElement(day, 'other-month');
        calendarDaysContainer.appendChild(dayElement);
    }

    updateStreakStats();
}

function createDayElement(day, classes = '') {
    const div = document.createElement('div');
    div.className = `calendar-day ${classes}`;
    div.textContent = day;
    return div;
}

function previousMonth() {
    currentMonth.setMonth(currentMonth.getMonth() - 1);
    renderCalendar();
}

function nextMonth() {
    currentMonth.setMonth(currentMonth.getMonth() + 1);
    renderCalendar();
}

function updateStreakStats() {
    const streakData = window.getStreakData();
    const today = new Date().toISOString().split('T')[0];

    // Calculate current streak
    let currentStreak = 0;
    let checkDate = new Date(today);
    while (true) {
        const dateStr = checkDate.toISOString().split('T')[0];
        if (streakData[dateStr]) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            break;
        }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 0;
    const sortedDates = Object.keys(streakData).sort();

    for (let i = 0; i < sortedDates.length; i++) {
        if (i === 0 || isConsecutiveDate(sortedDates[i - 1], sortedDates[i])) {
            tempStreak++;
        } else {
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 1;
        }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    // Get total sessions
    const totalSessions = window.getSessionCount();

    // Update stats display
    document.getElementById('modalCurrentStreak').textContent = currentStreak;
    document.getElementById('modalLongestStreak').textContent = longestStreak;
    document.getElementById('modalTotalSessions').textContent = totalSessions;
}

function isConsecutiveDate(date1Str, date2Str) {
    const date1 = new Date(date1Str);
    const date2 = new Date(date2Str);
    const diffTime = Math.abs(date2 - date1);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 1;
}

// Export functions for global scope
window.renderCalendar = renderCalendar;
window.previousMonth = previousMonth;
window.nextMonth = nextMonth;
window.updateStreakStats = updateStreakStats;
