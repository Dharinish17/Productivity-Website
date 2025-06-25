// Task Management
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// DOM Elements
const taskList = document.querySelector('.task-list');
const taskForm = document.getElementById('taskForm');
const taskModal = document.getElementById('taskModal');
const addTaskBtn = document.getElementById('addTaskBtn');
const filterCategory = document.getElementById('filterCategory');
const filterStatus = document.getElementById('filterStatus');
const searchTasks = document.getElementById('searchTasks');

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
  document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  themeToggle.textContent = isDarkMode ? '☀️' : '🌙';
});

// Task Modal Functions
function openTaskModal() {
  taskModal.classList.add('active');
}

function closeTaskModal() {
  taskModal.classList.remove('active');
  taskForm.reset();
}

// Add Task Button Click
addTaskBtn.addEventListener('click', openTaskModal);

// Task Form Submit
taskForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const taskId = document.getElementById('taskId').value;

  if (taskId) {
    // Existing task: update it
    const taskIndex = tasks.findIndex((task) => task.id === taskId);
    if (taskIndex !== -1) {
      tasks[taskIndex] = {
        ...tasks[taskIndex],
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        category: document.getElementById('category').value,
        dueDate: document.getElementById('dueDate').value,
      };
      localStorage.setItem('tasks', JSON.stringify(tasks));
      closeTaskModal();
      renderTasks();
      showNotification('Task updated successfully!');
    } else {
      alert('Task not found!');
    }
  } else {
    // New task: create it
    const newTask = {
      id: Date.now().toString(),
      title: document.getElementById('title').value,
      description: document.getElementById('description').value,
      category: document.getElementById('category').value,
      dueDate: document.getElementById('dueDate').value,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    tasks.push(newTask);
    localStorage.setItem('tasks', JSON.stringify(tasks));

    closeTaskModal();
    renderTasks();
    showNotification('Task added successfully!');
  }
});

// Create Task Element
function createTaskElement(task, searchQuery = '') {
  const div = document.createElement('div');
  div.className = `task-item status-${task.status}`;
  div.dataset.taskId = task.id;

  const statusLabel = {
    pending: 'Pending',
    'in-progress': 'In Progress',
    completed: 'Completed',
  };

  const dueDate = new Date(task.dueDate);
  const now = new Date();
  const isOverdue = task.status !== 'completed' && dueDate < now;

  // Create tooltip element
  const tooltip = document.createElement('div');
  tooltip.className = 'task-tooltip';
  tooltip.innerHTML = `
    <div class="task-tooltip-title">${task.title}</div>
    <div class="task-tooltip-description">${task.description || 'No description provided'}</div>
  `;

  // Add hover events for tooltip
  let tooltipTimeout;
  div.addEventListener('mouseenter', (e) => {
    clearTimeout(tooltipTimeout);
    const rect = div.getBoundingClientRect();
    tooltip.style.left = `${e.clientX - rect.left + 20}px`; // Adjust horizontal position
    tooltip.style.top = `${e.clientY - rect.top + 10}px`; // Adjust vertical position
    tooltipTimeout = setTimeout(() => tooltip.classList.add('visible'), 200);
  });

  div.addEventListener('mouseleave', () => {
    clearTimeout(tooltipTimeout);
    tooltip.classList.remove('visible');
  });

  // Highlight matching text if there's a search query
  const highlightText = (text, query) => {
    if (!query) return text;
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  };

  const highlightedTitle = highlightText(task.title, searchQuery);
  const highlightedDescription = highlightText(task.description, searchQuery);

  div.innerHTML = `
    <div class="task-content">
      <h4>${highlightedTitle}</h4>
      ${highlightedDescription ? `<p class="task-description">${highlightedDescription}</p>` : ''}
      <div class="task-meta">
        <span class="task-category">${task.category}</span>
        <span class="task-status ${task.status}">${statusLabel[task.status]}</span>
        <span class="task-due-date ${isOverdue ? 'overdue' : ''}">
          🕒 ${dueDate.toLocaleDateString()} ${dueDate.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })}
          ${isOverdue ? ' (Overdue)' : ''}
        </span>
      </div>
    </div>
    <div class="task-actions">
      ${
        task.status !== 'in-progress'
          ? `
        <button class="status-btn" data-task-id="${task.id}" data-action="in-progress">
          Mark In Progress
        </button>
      `
          : ''
      }
      ${
        task.status !== 'completed'
          ? `
        <button class="status-btn" data-task-id="${task.id}" data-action="completed">
          Mark Complete
        </button>
      `
          : ''
      }
      ${
        task.status === 'completed'
          ? `
        <button class="delete-btn" data-task-id="${task.id}" data-action="delete">
          Delete
        </button>
      `
          : ''
      }
      <button class="edit-btn" data-task-id="${task.id}" data-action="edit">
        Edit
      </button>
    </div>
  `;

  // Add tooltip to task item
  div.appendChild(tooltip);

  // Add event listeners to buttons
  const buttons = div.querySelectorAll('button');
  buttons.forEach((button) => {
    button.addEventListener('click', handleTaskAction);
  });

  return div;
}

// Handle Task Actions
function handleTaskAction(e) {
  const taskId = e.target.dataset.taskId;
  const action = e.target.dataset.action;

  if (action === 'delete') {
    deleteTask(taskId);
  } else if (action === 'edit') {
    openTaskModalForEdit(taskId);
  } else {
    updateTaskStatus(taskId, action);
  }
}

// Open Task Modal For Edit
function openTaskModalForEdit(taskId) {
  const task = tasks.find((task) => task.id === taskId);
  if (task) {
    document.getElementById('taskId').value = task.id;
    document.getElementById('title').value = task.title;
    document.getElementById('description').value = task.description;
    document.getElementById('category').value = task.category;
    document.getElementById('dueDate').value = task.dueDate;
    openTaskModal();
  }
}

// Update Task Status
function updateTaskStatus(taskId, newStatus) {
  const taskIndex = tasks.findIndex((task) => task.id === taskId);
  if (taskIndex !== -1) {
    tasks[taskIndex].status = newStatus;
    if (newStatus === 'completed') {
      tasks[taskIndex].completedAt = new Date().toISOString();
    }
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTasks();
    showNotification(`Task marked as ${newStatus}!`);

    // Re-render calendar events
    if (window.renderCalendarEvents) {
      window.renderCalendarEvents();
    }
  }
}

// Delete Task
function deleteTask(taskId) {
  if (confirm('Are you sure you want to delete this task?')) {
    tasks = tasks.filter((task) => task.id !== taskId);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTasks();
    showNotification('Task deleted successfully!');
  }
}

// Render Tasks with improved search functionality
function renderTasks() {
  const categoryFilter = filterCategory.value;
  const statusFilter = filterStatus.value;
  const searchQuery = searchTasks.value.toLowerCase().trim();

  // Clear task list
  taskList.innerHTML = '';

  // Filter tasks
  let filteredTasks = tasks;

  if (categoryFilter !== 'all') {
    filteredTasks = filteredTasks.filter((task) => task.category === categoryFilter);
  }

  if (statusFilter !== 'all') {
    filteredTasks = filteredTasks.filter((task) => task.status === statusFilter);
  }

  if (searchQuery) {
    filteredTasks = filteredTasks.filter(
      (task) =>
        task.title.toLowerCase().includes(searchQuery) ||
        (task.description && task.description.toLowerCase().includes(searchQuery))
    );
  }

  // Sort tasks by due date and status
  filteredTasks.sort((a, b) => {
    // First sort by status
    const order = { pending: 0, 'in-progress': 1, completed: 2 };
    const statusDiff = order[a.status] - order[b.status];

    if (statusDiff !== 0) return statusDiff;

    // Then sort by due date within each status
    const dateA = new Date(a.dueDate);
    const dateB = new Date(b.dueDate);
    return dateA - dateB;
  });

  // Show no results message if no tasks match
  if (filteredTasks.length === 0) {
    taskList.innerHTML = `
      <div class="no-results">
        <p>No tasks found${searchQuery ? ` matching "${searchQuery}"` : ''}.</p>
      </div>
    `;
    return;
  }

  // Render filtered tasks
  filteredTasks.forEach((task) => {
    const taskElement = createTaskElement(task, searchQuery);
    taskList.appendChild(taskElement);
  });
}

// Enhanced search with debouncing
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Add event listeners for filtering and search
filterCategory.addEventListener('change', renderTasks);
filterStatus.addEventListener('change', renderTasks);
searchTasks.addEventListener('input', debounce(renderTasks, 300));

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
renderTasks();


// Sidebar Toggle
const hamburgerMenu = document.getElementById('hamburgerMenu');
const sidebar = document.querySelector('.sidebar');

hamburgerMenu?.addEventListener('click', () => {
  sidebar.classList.toggle('active');
});
