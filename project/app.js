// Task Management
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';
let productivityChart;

// Load user profile from localStorage
let profilePhoto = localStorage.getItem('profilePhoto') || 'camera.png'; // Default to camera image
let username = localStorage.getItem('username') || '';

// Set initial profile photo and username
updateProfileDisplay();

// Add filter tasks function
function filterTasks(status) {
  currentFilter = status;

  // Update active state of stat cards
  document.querySelectorAll('.stat-card').forEach((card) => {
    card.classList.remove('active');
  });

  const activeCard = document.getElementById(`${status}TasksCard`);
  if (activeCard) {
    activeCard.classList.add('active');
  }

  // If we're on the tasks page, update the task list
  const taskList = document.querySelector('.task-list');
  if (taskList) {
    renderTasks();
  }
}

// Update createTaskElement function
function createTaskElement(task) {
  const div = document.createElement('div');
  div.className = `task-item priority-${task.priority}`;
  div.draggable = true;
  div.dataset.taskId = task.id;

  div.innerHTML = `
    <h4>${task.title}</h4>
    <div class="task-meta">
      <span class="task-category">${task.category}</span>
      <span class="task-due-date">
        🕒 ${new Date(task.dueDate).toLocaleDateString()}
      </span>
    </div>
    <div class="task-actions">
      <button class="delete-btn" onclick="deleteTask('${
        task.id
      }')">Delete</button>
    </div>
  `;

  // Add drag and drop functionality
  div.addEventListener('dragstart', handleDragStart);
  div.addEventListener('dragend', handleDragEnd);

  return div;
}

// Add delete task function
function deleteTask(taskId) {
  if (confirm('Are you sure you want to delete this task?')) {
    tasks = tasks.filter((task) => task.id !== taskId);
    localStorage.setItem('tasks', JSON.stringify(tasks));

    // Update UI
    updateTaskStats();
    updateProductivityChart();

    // If we're on the tasks page, update the task list
    const taskList = document.querySelector('.task-list');
    if (taskList) {
      renderTasks();
    }

    showNotification('Task deleted successfully');
  }
}

// Update Task Statistics
function updateTaskStats() {
  const now = new Date();

  const pending = tasks.filter((task) => task.status === 'pending').length;
  const completed = tasks.filter(
    (task) => task.status === 'completed'
  ).length;
  const inProgress = tasks.filter(
    (task) => task.status === 'in-progress'
  ).length;

  document.getElementById('pendingTasks').textContent = pending;
  document.getElementById('completedTasks').textContent = completed;
  document.getElementById('inProgressTasks').textContent = inProgress;
}

// Get Productivity Data
function getProductivityData() {
  const today = new Date();
  const weekData = new Array(7).fill(0);
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const todayIndex = today.getDay();

  // Get start of week (Sunday)
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - todayIndex);
  startOfWeek.setHours(0, 0, 0, 0);

  // Get end of week (Saturday)
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  // Filter tasks completed this week and count by day
  tasks.forEach((task) => {
    if (task.status === 'completed' && task.completedAt) {
      const completedDate = new Date(task.completedAt);

      // Check if the task was completed this week
      if (completedDate >= startOfWeek && completedDate <= endOfWeek) {
        const dayIndex = completedDate.getDay();
        weekData[dayIndex]++;
      }
    }
  });

  // Reorder array to start from Monday
  const mondayFirst = [...weekData.slice(1), weekData[0]];
  return mondayFirst;
}

// Initialize Productivity Chart
function initProductivityChart() {
  const ctx = document
    .getElementById('productivityChart')
    ?.getContext('2d');
  if (!ctx) return;

  const data = getProductivityData();

  const config = {
    type: 'line',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        {
          label: 'Tasks Completed',
          data: data,
          backgroundColor: '#6366f1',
          borderColor: '#4f46e5',
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
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
          ticks: {
            stepSize: 1,
          },
        },
      },
      interaction: {
        intersect: false,
        mode: 'index',
      },
    },
  };

  return new Chart(ctx, config);
}

// Update Productivity Chart
function updateProductivityChart() {
  const chartCanvas = document.getElementById('productivityChart');
  if (!chartCanvas) return;

  if (productivityChart) {
    productivityChart.destroy();
  }

  productivityChart = initProductivityChart();
}

// Theme Management
const themeToggle = document.getElementById('themeToggle');
const notificationsBtn = document.getElementById('notificationsBtn');
const notificationsMenu = document.getElementById('notificationsMenu');
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

// Notifications functionality
notificationsBtn?.addEventListener('click', () => {
  notificationsMenu?.classList.toggle('active');
});

document.addEventListener('click', (e) => {
  if (
    notificationsBtn &&
    notificationsMenu &&
    !notificationsBtn.contains(e.target) &&
    !notificationsMenu.contains(e.target)
  ) {
    notificationsMenu.classList.remove('active');
  }
});

// Quick Add Task    // Quick Add Task Form
const quickAddForm = document.getElementById('quickAddForm');
quickAddForm?.addEventListener('submit', (e) => {
  e.preventDefault();

  const title = document.getElementById('taskTitle').value;
  const category = document.getElementById('taskCategory').value;
  const dueDate = document.getElementById('taskDueDate').value;

  const newTask = {
    id: Date.now().toString(),
    title,
    category,
    dueDate,
    status: 'pending',
    completed: false,
    createdAt: new Date().toISOString(),
  };

  tasks.push(newTask);
  localStorage.setItem('tasks', JSON.stringify(tasks));

  quickAddForm.reset();
  updateTaskStats();
  updateProductivityChart();
  showNotification('Task added successfully!');
});

// Notifications
function showNotification(message) {
  // Browser notification
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('TaskGamer', { body: message });
  } else if (
    'Notification' in window &&
    Notification.permission !== 'denied'
  ) {
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        new Notification('TaskGamer', { body: message });
      }
    });
  }

  // Add to notifications menu
  const notificationItem = document.createElement('div');
  notificationItem.className = 'notification-item';
  notificationItem.innerHTML = `
    <strong>New Notification</strong>
    <p>${message}</p>
  `;
  notificationsMenu?.insertBefore(
    notificationItem,
    notificationsMenu.firstChild
  );

  // Remove old notifications (keep last 5)
  while (notificationsMenu && notificationsMenu.children.length > 5) {
    notificationsMenu.removeChild(notificationsMenu.lastChild);
  }
}

// Handle profile photo upload
document
  .getElementById('profilePhotoUpload')
  .addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        profilePhoto = e.target.result;
        localStorage.setItem('profilePhoto', profilePhoto);
        updateProfileDisplay();
      };
      reader.readAsDataURL(file);
    }
  });

// Handle username save
const usernameInput = document.getElementById('usernameInput');
const saveUsernameButton = document.getElementById('saveUsername');

// Function to handle saving the username
function saveUsername() {
  username = usernameInput.value;
  localStorage.setItem('username', username);
  showNotification('Username saved successfully!');

  // Hide the save button
  saveUsernameButton.style.display = 'none';

  // Make the input read-only
  usernameInput.readOnly = true;

  // Remove focus from the input
  usernameInput.blur();

  updateProfileDisplay();
}

// Function to handle editing the username
function editUsername() {
  // Make the input editable
  usernameInput.readOnly = false;

  // Show the save button
  saveUsernameButton.style.display = 'inline-block';

  // Focus on the input
  usernameInput.focus();
}

// Event listener for saving the username
saveUsernameButton.addEventListener('click', saveUsername);

// Event listener for clicking on the username to edit
usernameInput.addEventListener('click', function () {
  if (usernameInput.readOnly) {
    editUsername();
  }
});

// Persist username on input change
usernameInput.addEventListener('input', (event) => {
  localStorage.setItem('username', event.target.value);
});

// Handle profile photo display and delete button visibility
const profilePhotoElement = document.getElementById('profilePhoto');

function updateProfilePhotoDisplay() {
  if (profilePhoto && profilePhoto !== 'camera.png') {
    profilePhotoElement.src = profilePhoto;
  } else {
    profilePhotoElement.src = 'camera.png';
  }
}

updateProfilePhotoDisplay();

// Function to update profile display in all sections
function updateProfileDisplay() {
  // Update profile photo
  const profilePhotoElements = document.querySelectorAll('.avatar');
  profilePhotoElements.forEach(element => {
    element.src = localStorage.getItem('profilePhoto') || 'camera.png';
  });

  // Update username
  const usernameElements = document.querySelectorAll('.usernameInput');
  usernameElements.forEach(element => {
    element.value = localStorage.getItem('username') || '';
  });
}

// Sidebar Toggle
const hamburgerMenu = document.getElementById('hamburgerMenu');
const sidebar = document.querySelector('.sidebar');

hamburgerMenu?.addEventListener('click', () => {
  sidebar.classList.toggle('active');
});

// Initialize the application
function init() {
  updateTaskStats();
  updateProductivityChart();

  // Request notification permission
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }

  // Initially hide the save button if username exists
  if (username) {
    saveUsernameButton.style.display = 'none';
    usernameInput.readOnly = true;
  }
}

init();
