// Timer Management
let timerState = {
    workDuration: 25,
    breakDuration: 5,
    timeLeft: 25 * 60,
    isRunning: false,
    isBreak: false,
    timerId: null,
  };
  
  // Session Statistics
  let sessionStats = JSON.parse(localStorage.getItem('focusSessions')) || {
    totalSessions: 0,
    totalFocusTime: 0,
    dailySessions: 0,
    lastSessionDate: null,
    lastSessionTimestamp: null
  };
  
  // DOM Elements
  const timerDisplay = document.getElementById('timerDisplay');
  const timerLabel = document.getElementById('timerLabel');
  const startBtn = document.getElementById('startTimer');
  const pauseBtn = document.getElementById('pauseTimer');
  const resetBtn = document.getElementById('resetTimer');
  const workDurationEl = document.getElementById('workDuration');
  const breakDurationEl = document.getElementById('breakDuration');
  
  // Theme Management
  const themeToggle = document.getElementById('themeToggle');
  let isDarkMode = localStorage.getItem('darkMode') === 'true';
  
  // Initialize theme
  if (isDarkMode) {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeToggle.textContent = '☀️';
  }
  
  // Theme toggle functionality
  themeToggle.addEventListener('click', () => {
    isDarkMode = !isDarkMode;
    localStorage.setItem('darkMode', isDarkMode);
    document.documentElement.setAttribute(
      'data-theme',
      isDarkMode ? 'dark' : 'light'
    );
    themeToggle.textContent = isDarkMode ? '☀️' : '🌙';
  });
  
  // Duration Controls
  document.querySelectorAll('.control-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      const target = btn.dataset.target;
  
      if (timerState.isRunning) return;
  
      if (target === 'work') {
        if (action === 'increase') {
          // Allow up to 180 minutes (3 hours)
          timerState.workDuration = Math.min(timerState.workDuration + 5, 180);
        } else {
          timerState.workDuration = Math.max(timerState.workDuration - 5, 5);
        }
        workDurationEl.textContent = timerState.workDuration;
        if (!timerState.isBreak) {
          timerState.timeLeft = timerState.workDuration * 60;
          updateTimerDisplay();
        }
      } else {
        if (action === 'increase') {
          timerState.breakDuration = Math.min(timerState.breakDuration + 5, 30);
        } else {
          timerState.breakDuration = Math.max(timerState.breakDuration - 5, 5);
        }
        breakDurationEl.textContent = timerState.breakDuration;
        if (timerState.isBreak) {
          timerState.timeLeft = timerState.breakDuration * 60;
          updateTimerDisplay();
        }
      }
    });
  });
  
  // Timer Controls
  startBtn.addEventListener('click', startTimer);
  pauseBtn.addEventListener('click', pauseTimer);
  resetBtn.addEventListener('click', resetTimer);
  
  function startTimer() {
    if (timerState.isRunning) return;
  
    // Record session start time if starting a new work session
    if (!timerState.isBreak && !sessionStats.lastSessionTimestamp) {
      sessionStats.lastSessionTimestamp = Date.now();
    }
  
    timerState.isRunning = true;
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    resetBtn.disabled = false;
  
    timerState.timerId = setInterval(() => {
      timerState.timeLeft--;
      updateTimerDisplay();
  
      if (timerState.timeLeft <= 0) {
        handleTimerComplete();
      }
    }, 1000);
  
    updateCircleProgress();
  }
  
  function pauseTimer() {
    if (!timerState.isRunning) return;
  
    clearInterval(timerState.timerId);
    timerState.isRunning = false;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
  }
  
  function resetTimer() {
    clearInterval(timerState.timerId);
    timerState.isRunning = false;
    timerState.isBreak = false;
    timerState.timeLeft = timerState.workDuration * 60;
    sessionStats.lastSessionTimestamp = null;
  
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    resetBtn.disabled = true;
  
    timerLabel.textContent = 'FOCUS TIME';
    updateTimerDisplay();
    updateCircleProgress();
  }
  
  function handleTimerComplete() {
    clearInterval(timerState.timerId);
    playAlertSound();
    
    if (!timerState.isBreak) {
      // Complete focus session
      updateSessionStats();
      showNotification('Focus session complete! Time for a break!');
    } else {
      showNotification('Break time is over! Ready to focus again?');
    }
  
    // Toggle between focus and break
    timerState.isBreak = !timerState.isBreak;
    timerState.timeLeft = timerState.isBreak
      ? timerState.breakDuration * 60
      : timerState.workDuration * 60;
  
    timerLabel.textContent = timerState.isBreak ? 'BREAK TIME' : 'FOCUS TIME';
    updateTimerDisplay();
    
    // Auto-pause at the end of each session
    timerState.isRunning = false;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    
    // Reset session timestamp for new work session
    if (!timerState.isBreak) {
      sessionStats.lastSessionTimestamp = null;
    }
  }
  
  function updateTimerDisplay() {
    const minutes = Math.floor(timerState.timeLeft / 60);
    const seconds = timerState.timeLeft % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
    updateCircleProgress();
  }
  
  function updateCircleProgress() {
    const circle = document.querySelector('.timer-foreground');
    const totalTime = timerState.isBreak
      ? timerState.breakDuration * 60
      : timerState.workDuration * 60;
    const progress = timerState.timeLeft / totalTime;
    const circumference = 283; // 2 * π * 45 (circle radius)
  
    circle.style.strokeDashoffset = circumference * (1 - progress);
  }
  
  function updateSessionStats() {
    const today = new Date().toLocaleDateString();
    const sessionDuration = timerState.workDuration;
  
    if (sessionStats.lastSessionDate !== today) {
      sessionStats.dailySessions = 0;
      sessionStats.lastSessionDate = today;
    }
  
    sessionStats.totalSessions++;
    sessionStats.dailySessions++;
    sessionStats.totalFocusTime += sessionDuration;
  
    localStorage.setItem('focusSessions', JSON.stringify(sessionStats));
    updateStatsDisplay();
  }
  
  function updateStatsDisplay() {
    // Update total sessions
    document.getElementById('focusSessions').textContent = sessionStats.totalSessions;
    
    // Update total focus time with proper formatting
    const totalHours = Math.floor(sessionStats.totalFocusTime / 60);
    const totalMinutes = sessionStats.totalFocusTime % 60;
    const timeDisplay = totalHours > 0 
      ? `${totalHours}h ${totalMinutes}m`
      : `${totalMinutes}m`;
    document.getElementById('totalFocusTime').textContent = timeDisplay;
    
    // Update daily goal progress
    document.getElementById('dailyGoal').textContent = 
      `${sessionStats.dailySessions}/4`;
  }
  
  function playAlertSound() {
    const audio = new Audio(
      'data:audio/wav;base64,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'
    );
    audio.play();
  }
  
  function showNotification(message) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('TaskGamer', { body: message });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          new Notification('TaskGamer', { body: message });
        }
      });
    }
  }
  
  // Initialize
  updateTimerDisplay();
  updateStatsDisplay();

  // Sidebar Toggle
const hamburgerMenu = document.getElementById('hamburgerMenu');
const sidebar = document.querySelector('.sidebar');

hamburgerMenu?.addEventListener('click', () => {
  sidebar.classList.toggle('active');
});
