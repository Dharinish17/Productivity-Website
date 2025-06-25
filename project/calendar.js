// Calendar Management
let events = JSON.parse(localStorage.getItem('events')) || [];
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
const goals = JSON.parse(localStorage.getItem('goals')) || [];
const habits = JSON.parse(localStorage.getItem('habits')) || [];

// DOM Elements
const calendarEl = document.getElementById('calendar');
const eventForm = document.getElementById('eventForm');
const eventModal = document.getElementById('eventModal');
const upcomingEventsList = document.getElementById('upcomingEventsList');
const quickAddTitle = document.getElementById('quickAddTitle');
const quickAddDescription = document.getElementById('quickAddDescription');
const quickAddDate = document.getElementById('quickAddDate');
const quickAddCategory = document.getElementById('quickAddCategory');
const quickAddBtn = document.getElementById('quickAddBtn');
const taskFilterCheckbox = document.querySelector(
  'input[data-filter="tasks"]'
);
const goalFilterCheckbox = document.querySelector(
  'input[data-filter="goals"]'
);
const habitFilterCheckbox = document.querySelector(
  'input[data-filter="habits"]'
);

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

// Event Modal Functions
function openEventModal() {
  eventModal.classList.add('active');
}

function closeEventModal() {
  eventModal.classList.remove('active');
  eventForm.reset();
}

// Quick Add Event
quickAddBtn.addEventListener('click', () => {
  const eventTitle = quickAddTitle.value;
  const eventDescription = quickAddDescription.value;
  const eventStart = quickAddDate.value;
  const eventCategory = quickAddCategory.value;

  if (eventTitle && eventStart && eventCategory) {
    const newEvent = {
      id: Date.now().toString(),
      title: eventTitle,
      description: eventDescription,
      start: eventStart,
      category: eventCategory,
      createdAt: new Date().toISOString(),
    };

    // Only save the event to the events array if it's not a task, goal, or habit
    if (
      eventCategory !== 'task' &&
      eventCategory !== 'goal' &&
      eventCategory !== 'habit'
    ) {
      events.push(newEvent);
      localStorage.setItem('events', JSON.stringify(events));
    }

    // Save event as task if category is task
    if (eventCategory === 'task') {
      const newTask = {
        id: Date.now().toString(),
        title: eventTitle,
        description: eventDescription, // Use description from quick add
        category: 'personal', // Default category
        dueDate: eventStart,
        priority: 'medium', // Default priority
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      tasks.push(newTask);
      localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // Save event as goal if category is goal
    if (eventCategory === 'goal') {
      const newGoal = {
        id: Date.now().toString(),
        title: eventTitle,
        description: eventDescription, // Use description from quick add
        category: 'personal', // Default category
        deadline: eventStart,
        milestones: [],
        progress: 0,
        status: 'not-started',
        createdAt: new Date().toISOString(),
        completed: false,
        completedAt: null,
      };
      goals.push(newGoal);
      localStorage.setItem('goals', JSON.stringify(goals));
    }

    // Save event as habit if category is habit
    if (eventCategory === 'habit') {
      const newHabit = {
        id: Date.now().toString(),
        title: eventTitle,
        description: eventDescription, // Use description from quick add
        category: 'health', // Default category
        frequency: 'daily',
        reminderDay: null,
        reminder: null,
        streak: 0,
        completedDates: [],
        createdAt: new Date().toISOString(),
      };
      habits.push(newHabit);
      localStorage.setItem('habits', JSON.stringify(habits));
    }

    quickAddTitle.value = '';
    quickAddDescription.value = '';
    quickAddDate.value = '';
    renderCalendarEvents();
    renderUpcomingEvents();
    showNotification('Event added successfully!');
  } else {
    alert('Please fill in all fields!');
  }
});

// Event Form Submit
eventForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const eventTitle = document.getElementById('eventTitle').value;
  const eventDescription = document.getElementById('eventDescription').value;
  const eventStart = document.getElementById('eventStart').value;
  const eventCategory = document.getElementById('eventCategory').value;

  const newEvent = {
    id: Date.now().toString(),
    title: eventTitle,
    description: eventDescription,
    start: eventStart,
    category: eventCategory,
    createdAt: new Date().toISOString(),
  };

  // Only save the event to the events array if it's not a task, goal, or habit
  if (
    eventCategory !== 'task' &&
    eventCategory !== 'goal' &&
    eventCategory !== 'habit'
  ) {
    events.push(newEvent);
    localStorage.setItem('events', JSON.stringify(events));
  }

  // Save event as task if category is task
  if (eventCategory === 'task') {
    const newTask = {
      id: Date.now().toString(),
      title: eventTitle,
      description: eventDescription,
      category: 'personal', // Default category
      dueDate: eventStart,
      priority: 'medium', // Default priority
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    tasks.push(newTask);
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }

  // Save event as goal if category is goal
  if (eventCategory === 'goal') {
    const newGoal = {
      id: Date.now().toString(),
      title: eventTitle,
      description: eventDescription,
      category: 'personal', // Default category
      deadline: eventStart,
      milestones: [],
      progress: 0,
      status: 'not-started',
      createdAt: new Date().toISOString(),
      completed: false,
      completedAt: null,
    };
    goals.push(newGoal);
    localStorage.setItem('goals', JSON.stringify(goals));
  }

  // Save event as habit if category is habit
  if (eventCategory === 'habit') {
    const newHabit = {
      id: Date.now().toString(),
      title: eventTitle,
      description: eventDescription,
      category: eventCategory,
      frequency: 'daily',
      reminderDay: null,
      reminder: null,
      streak: 0,
      completedDates: [],
      createdAt: new Date().toISOString(),
    };
    habits.push(newHabit);
    localStorage.setItem('habits', JSON.stringify(habits));
  }

  closeEventModal();
  renderCalendarEvents();
  renderUpcomingEvents();
  showNotification('Event added successfully!');
});

// Get All Events
function getAllEvents() {
  const allEvents = [];

  // Add tasks as events
  tasks.forEach((task) => {
    let className = '';
    if (task.status === 'in-progress') {
      className = 'task-in-progress';
    } else if (task.status === 'completed') {
      className = 'task-completed';
    } else {
      className = 'task-default'; // Default class for tasks without a specified status
    }
    allEvents.push({
      id: `task-${task.id}`,
      title: task.title,
      start: task.dueDate,
      category: 'task',
      className: className,
    });
  });

  // Add goals as events
  goals.forEach((goal) => {
    let className = '';
    if (goal.status === 'in-progress') {
      className = 'goal-in-progress';
    } else if (goal.status === 'completed') {
      className = 'goal-completed';
    } else if (goal.status === 'not-started') {
      className = 'goal-not-started';
    } else {
      className = 'goal-default';
    }
    allEvents.push({
      id: `goal-${goal.id}`,
      title: goal.title,
      start: goal.deadline,
      category: 'goal',
      className: className,
    });
  });

  // Add habits as events with status
  habits.forEach((habit) => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Generate events for the next 3 months
    for (let i = 0; i < 3; i++) {
      const month = new Date(currentYear, currentMonth + i, 1);
      const daysInMonth = new Date(
        month.getFullYear(),
        month.getMonth() + 1,
        0
      ).getDate();

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(month.getFullYear(), month.getMonth(), day);
        const dateStr = date.toISOString().split('T')[0];

        // Check if habit should appear on this date
        let shouldAdd = false;
        if (habit.frequency === 'daily') {
          shouldAdd = true;
        } else if (
          habit.frequency === 'weekly' &&
          date.getDay() === habit.reminderDay
        ) {
          shouldAdd = true;
        } else if (
          habit.frequency === 'monthly' &&
          day === habit.reminderDay
        ) {
          shouldAdd = true;
        }

        if (shouldAdd) {
          const isCompleted = habit.completedDates.includes(dateStr);
          allEvents.push({
            id: `habit-${habit.id}-${dateStr}`,
            title: `${isCompleted ? '✅' : '🔴'} ${habit.title}`,
            start: dateStr,
            category: 'habit',
            className: isCompleted ? 'habit-completed' : 'habit-pending',
            extendedProps: {
              habitId: habit.id,
              completed: isCompleted,
            },
          });
        }
      }
    }
  });

  // Add custom events
  events.forEach((event) => {
    allEvents.push({
      ...event,
      category: event.category || 'other',
    });
  });

  return allEvents;
}

// Function to re-render calendar events
function renderCalendarEvents() {
  if (calendarEl) {
    const calendar = calendarEl.getCalendar();
    calendar.setOption('events', getAllEvents());
  }
}

// Initialize Calendar
function initializeCalendar() {
  if (calendarEl) {
    const calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'dayGridMonth',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay',
      },
      events: getAllEvents(),
      eventClick: function (info) {
        showEventDetails(info.event);
      },
      eventClassNames: function (arg) {
        const classes = [`event-${arg.event.category}`];
        if (arg.event.extendedProps.completed !== undefined) {
          classes.push(
            arg.event.extendedProps.completed
              ? 'habit-completed'
              : 'habit-pending'
          );
        }

        // Update task color based on status
        if (arg.event.category === 'task') {
          const task = tasks.find((t) => t.id === arg.event.id.split('-')[1]);
          if (task) {
            if (task.status === 'in-progress') {
              classes.push('task-in-progress'); // Add class for "in-progress"
            } else if (task.status === 'completed') {
              classes.push('task-completed'); // Add class for "completed"
            } else {
              classes.push('task-default'); // Add class for tasks without a specified status
              classes.push('task-no-status'); // Add class for tasks without a specified status
            }
          }
        }

        // Update goal color based on status
        if (arg.event.category === 'goal') {
          const goal = goals.find((g) => g.id === arg.event.id.split('-')[1]);
          if (goal) {
            if (goal.status === 'in-progress') {
              classes.push('goal-in-progress');
            } else if (goal.status === 'completed') {
              classes.push('goal-completed');
            } else if (goal.status === 'not-started') {
              classes.push('goal-not-started');
            } else {
              classes.push('goal-default');
            }
          }
        }

        return classes;
      },
      eventDidMount: function (info) {
        // Add tooltip with habit details
        if (info.event.extendedProps.category === 'habit') {
          const habit = habits.find(
            (h) => h.id === info.event.extendedProps.habitId
          );
          if (habit) {
            const tooltip = `${habit.title} (${habit.frequency})
            ${
              info.event.extendedProps.completed ? 'Completed' : 'Pending'
            }`;
            info.el.title = tooltip;
          }
        }
      },
    });

    calendar.render();
    window.renderCalendarEvents = renderCalendarEvents;
  }
}

document.addEventListener('DOMContentLoaded', function () {
  initializeCalendar();
});

// Add event listeners to filter checkboxes
// taskFilterCheckbox.addEventListener('change', renderCalendarEvents); // Removed
// goalFilterCheckbox.addEventListener('change', renderCalendarEvents); // Removed
// habitFilterCheckbox.addEventListener('change', renderCalendarEvents); // Removed

// Render Upcoming Events
function renderUpcomingEvents() {
  const now = new Date();
  const upcoming = getAllEvents()
    .filter((event) => new Date(event.start) > now)
    .sort((a, b) => new Date(a.start) - new Date(b.start))
    .slice(0, 5);

  upcomingEventsList.innerHTML = upcoming
    .map(
      (event) => `
      <div class="event-item">
          <div class="event-title">${event.title}</div>
          <div class="event-time">
              ${new Date(event.start).toLocaleDateString()} ${new Date(
        event.start
      ).toLocaleTimeString()}
          </div>
      </div>
  `
    )
    .join('');
}

// Show Event Details
function showEventDetails(event) {
  // Implement event details view
  console.log('Event clicked:', event);
}

// Notifications
function showNotification(message) {
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
}

// Initialize
renderUpcomingEvents();


// Sidebar Toggle
const hamburgerMenu = document.getElementById('hamburgerMenu');
const sidebar = document.querySelector('.sidebar');

hamburgerMenu?.addEventListener('click', () => {
  sidebar.classList.toggle('active');
});
