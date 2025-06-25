// Data Management
const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
const goals = JSON.parse(localStorage.getItem('goals')) || [];
const habits = JSON.parse(localStorage.getItem('habits')) || [];
const focusSessions = JSON.parse(localStorage.getItem('focusSessions')) || {
  totalSessions: 0,
  totalFocusTime: 0,
  dailySessions: 0,
  lastSessionDate: null,
};

// DOM Elements
const downloadReport = document.getElementById('downloadReport');

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

// Update Statistics
function updateStats() {
  // Update completed tasks
  const completedTasks = tasks.filter(
    (task) => task.status === 'completed'
  ).length;
  document.getElementById('tasksCompleted').textContent = completedTasks;

  // Update focus minutes
  const totalFocusMinutes = focusSessions.totalFocusTime || 0;
  document.getElementById('focusMinutes').textContent = totalFocusMinutes;

  // Update goals achieved
  const achievedGoals = goals.filter((goal) => goal.completed).length;
  document.getElementById('goalsAchieved').textContent = achievedGoals;

  // Update habit streak
  const maxStreak = Math.max(...habits.map((h) => h.streak || 0), 0);
  document.getElementById('habitStreak').textContent = maxStreak;
}

// Initialize Task Completion Chart
function initTaskCompletionChart() {
  const ctx = document.getElementById('taskCompletionChart')?.getContext('2d');
  if (!ctx) return null;

  const last30Days = getLastNDays(30);
  const completionData = getTaskCompletionData(last30Days);

  const data = {
    labels: last30Days.map((date) =>
      new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    ),
    datasets: [
      {
        label: 'Completion Rate (%)',
        data: completionData,
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderColor: '#6366f1',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  return new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            label: function (context) {
              return `Completion Rate: ${context.raw.toFixed(1)}%`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            callback: function (value) {
              return value + '%';
            },
          },
        },
      },
    },
  });
}

// Initialize Focus Time Chart
function initFocusTimeChart() {
  const ctx = document.getElementById('focusTimeChart')?.getContext('2d');
  if (!ctx) return null;

  const focusData = getFocusTimeData();

  const data = {
    labels: ['Morning', 'Afternoon', 'Evening', 'Night'],
    datasets: [
      {
        label: 'Focus Minutes',
        data: focusData,
        backgroundColor: ['#10b981', '#6366f1', '#f59e0b', '#8b5cf6'],
      },
    ],
  };

  return new Chart(ctx, {
    type: 'doughnut',
    data: data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return `${context.label}: ${context.raw} minutes`;
            },
          },
        },
      },
    },
  });
}

// Initialize Productivity Trend Chart
function initProductivityTrendChart() {
  const ctx = document.getElementById('productivityTrendChart')?.getContext('2d');
  if (!ctx) return null;

  const last7Days = getLastNDays(7);
  const productivityData = getProductivityData(last7Days);

  const data = {
    labels: last7Days.map((date) =>
      new Date(date).toLocaleDateString('en-US', { weekday: 'short' })
    ),
    datasets: [
      {
        label: 'Productivity Score',
        data: productivityData,
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderColor: '#6366f1',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  return new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        tooltip: {
          mode: 'index',
          intersect: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            callback: function (value) {
              return value + '%';
            },
          },
        },
      },
    },
  });
}

// Initialize Category Chart
function initCategoryChart() {
  const ctx = document.getElementById('categoryChart')?.getContext('2d');
  if (!ctx) return null;

  const categoryData = getCategoryData();

  const data = {
    labels: Object.keys(categoryData),
    datasets: [
      {
        label: 'Tasks by Category',
        data: Object.values(categoryData),
        backgroundColor: [
          '#6366f1',
          '#10b981',
          '#f59e0b',
          '#ef4444',
          '#8b5cf6',
        ],
      },
    ],
  };

  return new Chart(ctx, {
    type: 'bar',
    data: data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return `${context.raw} tasks`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
          },
        },
      },
    },
  });
}

// Helper Functions
function getLastNDays(n) {
  const dates = [];
  for (let i = n - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }
  return dates;
}

function getTaskCompletionData(dates) {
  return dates.map((date) => {
    const dayTasks = tasks.filter(
      (task) =>
        new Date(task.createdAt).toISOString().split('T')[0] === date
    );
    if (dayTasks.length === 0) return 0;
    const completed = dayTasks.filter(
      (task) => task.status === 'completed'
    ).length;
    return (completed / dayTasks.length) * 100;
  });
}

function getFocusTimeData() {
  const timeData = [0, 0, 0, 0]; // Morning, Afternoon, Evening, Night

  // Group focus sessions by time of day
  Object.values(focusSessions).forEach((session) => {
    if (typeof session === 'number' && session > 0) {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) timeData[0] += session;
      else if (hour >= 12 && hour < 17) timeData[1] += session;
      else if (hour >= 17 && hour < 22) timeData[2] += session;
      else timeData[3] += session;
    }
  });

  return timeData;
}

function getProductivityData(dates) {
  return dates.map((date) => {
    // Calculate productivity score based on multiple factors
    const dayTasks = tasks.filter(
      (task) =>
        new Date(task.createdAt).toISOString().split('T')[0] === date
    );
    const taskScore =
      dayTasks.length > 0
        ? (dayTasks.filter((task) => task.status === 'completed').length /
            dayTasks.length) *
          40
        : 0;

    const focusScore = Math.min(
      (focusSessions.totalFocusTime || 0) / 240,
      1
    ) * 30;

    const habitScore =
      (habits.filter((h) => h.completedDates.includes(date)).length /
        Math.max(habits.length, 1)) *
      20;

    const goalScore =
      (goals.filter(
        (g) =>
          g.completed &&
          new Date(g.completedAt).toISOString().split('T')[0] === date
      ).length /
        Math.max(
          goals.filter(
            (g) =>
              new Date(g.deadline).toISOString().split('T')[0] === date
          ).length,
          1
        )) *
      10;

    return Math.min(taskScore + focusScore + habitScore + goalScore, 100);
  });
}

function getCategoryData() {
  const categories = {};
  tasks.forEach((task) => {
    categories[task.category] = (categories[task.category] || 0) + 1;
  });
  return categories;
}

// Charts
let taskCompletionChart;
let focusTimeChart;
let productivityTrendChart;
let categoryChart;

// Update charts
function updateCharts() {
  // Destroy existing charts
  if (taskCompletionChart) taskCompletionChart.destroy();
  if (focusTimeChart) focusTimeChart.destroy();
  if (productivityTrendChart) productivityTrendChart.destroy();
  if (categoryChart) categoryChart.destroy();

  // Initialize new charts
  taskCompletionChart = initTaskCompletionChart();
  focusTimeChart = initFocusTimeChart();
  productivityTrendChart = initProductivityTrendChart();
  categoryChart = initCategoryChart();
}

// Download Report
downloadReport?.addEventListener('click', generateReport);

function generateReport() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Set custom font
  doc.setFont('helvetica', 'bold');

  // Add TaskGamer logo and title
  doc.setFontSize(24);
  doc.setTextColor(99, 102, 241); // Primary color
  doc.text('TaskGamer', 20, 20);
  
  // Add decorative line
  doc.setDrawColor(99, 102, 241);
  doc.setLineWidth(0.5);
  doc.line(20, 25, 190, 25);

  // Add report title and date
  doc.setFontSize(16);
  doc.setTextColor(31, 41, 55); // Dark text color
  doc.text('Productivity Report', 20, 40);
  
  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128); // Secondary text color
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 48);

  // Add statistics section
  doc.setFontSize(14);
  doc.setTextColor(31, 41, 55);
  doc.text('Performance Overview', 20, 65);

  // Create statistics table
  const stats = [
    ['Metric', 'Value'],
    ['Tasks Completed', document.getElementById('tasksCompleted').textContent],
    ['Focus Minutes', document.getElementById('focusMinutes').textContent],
    ['Goals Achieved', document.getElementById('goalsAchieved').textContent],
    ['Current Habit Streak', document.getElementById('habitStreak').textContent],
  ];

  doc.autoTable({
    startY: 70,
    head: [stats[0]],
    body: stats.slice(1),
    theme: 'grid',
    headStyles: {
      fillColor: [99, 102, 241],
      textColor: [255, 255, 255],
      fontSize: 12,
    },
    bodyStyles: {
      fontSize: 11,
    },
    styles: {
      cellPadding: 5,
    },
    columnStyles: {
      0: { fontStyle: 'bold' },
    },
  });

  // Add task categories section
  doc.setFontSize(14);
  doc.setTextColor(31, 41, 55);
  doc.text('Task Categories', 20, doc.autoTable.previous.finalY + 20);

  // Create categories table
  const categories = getCategoryData();
  const categoryRows = Object.entries(categories).map(([category, count]) => [
    category.charAt(0).toUpperCase() + category.slice(1),
    count.toString(),
  ]);

  doc.autoTable({
    startY: doc.autoTable.previous.finalY + 25,
    head: [['Category', 'Tasks']],
    body: categoryRows,
    theme: 'grid',
    headStyles: {
      fillColor: [99, 102, 241],
      textColor: [255, 255, 255],
      fontSize: 12,
    },
    bodyStyles: {
      fontSize: 11,
    },
    styles: {
      cellPadding: 5,
    },
  });

  // Add productivity insights
  doc.setFontSize(14);
  doc.setTextColor(31, 41, 55);
  doc.text('Productivity Insights', 20, doc.autoTable.previous.finalY + 20);

  // Calculate productivity metrics
  const completionRate = tasks.length > 0
    ? ((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100).toFixed(1)
    : 0;
  const avgFocusTime = focusSessions.totalSessions > 0
    ? (focusSessions.totalFocusTime / focusSessions.totalSessions).toFixed(1)
    : 0;

  const insights = [
    ['Metric', 'Value'],
    ['Task Completion Rate', `${completionRate}%`],
    ['Average Focus Session', `${avgFocusTime} minutes`],
    ['Daily Focus Sessions', focusSessions.dailySessions.toString()],
  ];

  doc.autoTable({
    startY: doc.autoTable.previous.finalY + 25,
    head: [insights[0]],
    body: insights.slice(1),
    theme: 'grid',
    headStyles: {
      fillColor: [99, 102, 241],
      textColor: [255, 255, 255],
      fontSize: 12,
    },
    bodyStyles: {
      fontSize: 11,
    },
    styles: {
      cellPadding: 5,
    },
  });

  // Add footer
  doc.setFontSize(8);
  doc.setTextColor(156, 163, 175); // Light gray
  doc.text('TaskGamer - Your Productivity Partner', 20, 285);
  doc.text(new Date().toLocaleString(), 150, 285);

  // Save the PDF
  doc.save('taskgamer-productivity-report.pdf');
  showNotification('Report downloaded successfully!');
}

// Notifications
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
document.addEventListener('DOMContentLoaded', () => {
  updateStats();
  updateCharts();
});

// Add event listeners for localStorage changes
window.addEventListener('storage', (e) => {
  if (
    ['tasks', 'goals', 'habits', 'focusSessions'].includes(e.key)
  ) {
    updateStats();
    updateCharts();
  }
});

// Add event listener for real-time updates
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    updateStats();
    updateCharts();
  }
});


// Sidebar Toggle
const hamburgerMenu = document.getElementById('hamburgerMenu');
const sidebar = document.querySelector('.sidebar');

hamburgerMenu?.addEventListener('click', () => {
  sidebar.classList.toggle('active');
});
