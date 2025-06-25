// Goals Management
let goals = JSON.parse(localStorage.getItem('goals')) || [];

// DOM Elements
const goalsList = document.getElementById('goalsList');
const goalForm = document.getElementById('goalForm');
const goalModal = document.getElementById('goalModal');
const addGoalBtn = document.getElementById('addGoalBtn');

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

// Goal Modal Functions
function openGoalModal(goal = null) {
if (!goalModal) {
console.error('Goal modal element not found');
return;
}

// Populate the form if editing a goal
if (goal) {
document.getElementById('modalTitle').innerText = 'Edit Goal';
document.getElementById('goalTitle').value = goal.title;
document.getElementById('goalDescription').value = goal.description;
document.getElementById('goalCategory').value = goal.category;
document.getElementById('goalDeadline').value = goal.deadline;
document.getElementById('goalMilestones').value = goal.milestones
.map((m) => m.text)
.join('\n');
document.getElementById('goalForm').dataset.editId = goal.id; // Store the goal ID for editing
} else {
document.getElementById('modalTitle').innerText = 'Add New Goal';
document.getElementById('goalForm').removeAttribute('data-edit-id'); // Clear the edit ID
}

goalModal.style.display = 'flex';
goalModal.classList.add('active');
}

function closeGoalModal() {
if (!goalModal) {
console.error('Goal modal element not found');
return;
}
goalModal.classList.remove('active');
setTimeout(() => {
goalModal.style.display = 'none';
}, 300);
if (goalForm) {
goalForm.reset();
document.getElementById('goalForm').removeAttribute('data-edit-id'); // Clear the edit ID
}
}

// Add Goal Button Click
if (addGoalBtn) {
addGoalBtn.addEventListener('click', () => {
openGoalModal();
});
}

// Goal Form Submit
if (goalForm) {
goalForm.addEventListener('submit', (e) => {
e.preventDefault();

const milestones = document
.getElementById('goalMilestones')
.value.split('\n')
.filter((milestone) => milestone.trim())
.map((milestone) => ({
id: Date.now() + Math.random(),
text: milestone.trim(),
completed: false,
}));

const goalId = document.getElementById('goalForm').dataset.editId;

if (goalId) {
// Existing goal: update it
const goalIndex = goals.findIndex((goal) => goal.id === goalId);
if (goalIndex !== -1) {
goals[goalIndex] = {
...goals[goalIndex],
title: document.getElementById('goalTitle').value,
description: document.getElementById('goalDescription').value,
category: document.getElementById('goalCategory').value,
deadline: document.getElementById('goalDeadline').value,
milestones,
};
localStorage.setItem('goals', JSON.stringify(goals));
closeGoalModal();
renderGoals();
updateGoalStats();
updateGoalChart();
showNotification('Goal updated successfully!');
} else {
alert('Goal not found!');
}
} else {
// New goal: create it
const newGoal = {
id: Date.now().toString(),
title: document.getElementById('goalTitle').value,
description: document.getElementById('goalDescription').value,
category: document.getElementById('goalCategory').value,
deadline: document.getElementById('goalDeadline').value,
milestones,
progress: 0,
status: 'not-started',
createdAt: new Date().toISOString(),
completed: false,
completedAt: null,
};

goals.push(newGoal);
localStorage.setItem('goals', JSON.stringify(goals));

closeGoalModal();
renderGoals();
updateGoalStats();
updateGoalChart();
showNotification('Goal added successfully!');
}
});
}

// Update Goal Status
function updateGoalStatus(goalId, newStatus) {
const goalIndex = goals.findIndex((g) => g.id === goalId);
if (goalIndex === -1) return;

const goal = goals[goalIndex];
goal.status = newStatus;
goal.completed = newStatus === 'completed';

localStorage.setItem('goals', JSON.stringify(goals));
renderGoals();
updateGoalStats();
updateGoalChart();
}

// Delete Goal
function deleteGoal(goalId) {
if (confirm('Are you sure you want to delete this goal?')) {
goals = goals.filter((goal) => goal.id !== goalId);
localStorage.setItem('goals', JSON.stringify(goals));
renderGoals();
updateGoalStats();
updateGoalChart();
showNotification('Goal deleted successfully');
}
}

// Calculate Goal Progress
function calculateGoalProgress(goal) {
if (!goal.milestones || goal.milestones.length === 0) return 0;
const completedMilestones = goal.milestones.filter((m) => m.completed).length;
return (completedMilestones / goal.milestones.length) * 100;
}

// Render Goals
function renderGoals() {
if (!goalsList) {
console.error('Goals list element not found');
return;
}
goalsList.innerHTML = '';

const sortedGoals = [...goals].sort((a, b) => {
// Sort by completion status first
if (a.completed !== b.completed) {
return a.completed ? 1 : -1;
}
// Then by deadline
return new Date(a.deadline) - new Date(b.deadline);
});

sortedGoals.forEach((goal) => {
const goalElement = createGoalElement(goal);
goalsList.appendChild(goalElement);
});
}

// Create Goal Element
function createGoalElement(goal) {
const div = document.createElement('div');
div.className = `goal-card ${goal.completed ? 'completed' : ''}`;
div.draggable = true;
div.dataset.goalId = goal.id;

const progress = calculateGoalProgress(goal);
const dueDate = new Date(goal.deadline);
const isOverdue = !goal.completed && dueDate < new Date();

div.innerHTML = `
<div class="goal-header">
<h4 class="goal-title">${goal.title}</h4>
<span class="goal-category category-${goal.category}">${
goal.category
}</span>
</div>
<p class="goal-description">${
goal.description || 'No description provided'
}</p>
<div class="goal-progress-bar">
<div class="progress-fill" style="width: ${progress}%"></div>
</div>
<div class="goal-meta">
<span class="goal-deadline ${isOverdue ? 'overdue' : ''}">
🗓️ ${dueDate.toLocaleDateString()}
${isOverdue ? ' (Overdue)' : ''}
</span>
</div>
<div class="goal-milestones">
${goal.milestones
.map(
(milestone) => `
<div class="milestone-item">
<div class="milestone-checkbox ${
milestone.completed ? 'completed' : ''
}"
onclick="toggleMilestone('${goal.id}', '${
milestone.id
}')">
</div>
<span>${milestone.text}</span>
</div>
`
)
.join('')}
</div>
<div class="goal-actions">
${
!goal.completed && goal.status !== 'in-progress'
? `
<button class="status-btn in-progress" onclick="markInProgress('${goal.id}', this)">
Mark In Progress
</button>
`
: ''
}
${
!goal.completed && goal.status !== 'completed'
? `
<button class="status-btn complete" onclick="updateGoalStatus('${goal.id}', 'completed')">
Mark Achieved
</button>
`
: ''
}
<button class="edit-btn" onclick="editGoal('${goal.id}')">
Edit Goal
</button>
<button class="delete-btn" onclick="deleteGoal('${goal.id}')">
Delete Goal
</button>
</div>
`;

return div;
}

// Edit Goal
function editGoal(goalId) {
const goal = goals.find((goal) => goal.id === goalId);
if (goal) {
openGoalModal(goal);
}
}

// Toggle Milestone
function toggleMilestone(goalId, milestoneId) {
const goalIndex = goals.findIndex((g) => g.id === goalId);
if (goalIndex === -1) return;

const goal = goals[goalIndex];
const milestoneIndex = goal.milestones.findIndex((m) => m.id === milestoneId);
if (milestoneIndex === -1) return;

goal.milestones[milestoneIndex].completed =
!goal.milestones[milestoneIndex].completed;

// Update goal progress
const progress = calculateGoalProgress(goal);
goal.progress = progress;

// Check if all milestones are completed
const allCompleted = goal.milestones.every((m) => m.completed);
if (allCompleted && !goal.completed) {
updateGoalStatus(goalId, 'completed');
}

localStorage.setItem('goals', JSON.stringify(goals));
renderGoals();
updateGoalStats();
updateGoalChart();
}

// Update Goal Statistics
function updateGoalStats() {
const activeGoals = goals.filter((g) => !g.completed).length;
const completedGoals = goals.filter((g) => g.completed).length;
const totalGoals = goals.length;

// Calculate success rate based on completed goals and total goals
const successRate =
totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

document.getElementById('activeGoals').textContent = activeGoals;
document.getElementById('completedGoals').textContent = completedGoals;
document.getElementById('successRate').textContent = `${successRate}%`;
}

// Initialize Goal Progress Chart
function initGoalChart() {
const ctx = document.getElementById('goalProgressChart')?.getContext('2d');
if (!ctx) return;

const categories = ['personal', 'career', 'health', 'education', 'financial'];
const categoryData = categories.map((category) => {
const categoryGoals = goals.filter((g) => g.category === category);
const completed = categoryGoals.filter((g) => g.completed).length;
const inProgress = categoryGoals.filter(
(g) => !g.completed && g.status === 'in-progress'
).length;
const notStarted = categoryGoals.filter(
(g) => !g.completed && g.status === 'not-started'
).length;
return { completed, inProgress, notStarted };
});

const config = {
type: 'bar',
data: {
labels: categories.map((c) => c.charAt(0).toUpperCase() + c.slice(1)),
datasets: [
{
label: 'Completed',
data: categoryData.map((d) => d.completed),
backgroundColor: '#10b981',
borderRadius: 8,
},
{
label: 'In Progress',
data: categoryData.map((d) => d.inProgress),
backgroundColor: '#6366f1',
borderRadius: 8,
},
{
label: 'Not Started',
data: categoryData.map((d) => d.notStarted),
backgroundColor: '#9ca3af',
borderRadius: 8,
},
],
},
options: {
responsive: true,
plugins: {
legend: {
display: true,
position: 'top',
},
},
scales: {
y: {
beginAtZero: true,
ticks: {
stepSize: 1,
},
stacked: true,
},
x: {
stacked: true,
},
},
},
};

return new Chart(ctx, config);
}

// Update Goal Chart
let goalChart;
function updateGoalChart() {
if (goalChart) {
goalChart.destroy();
}
goalChart = initGoalChart();
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

function markInProgress(goalId, button) {
const goalIndex = goals.findIndex((g) => g.id === goalId);
if (goalIndex === -1) return;

const goal = goals[goalIndex];
goal.status = 'in-progress';

localStorage.setItem('goals', JSON.stringify(goals));
renderGoals();
updateGoalStats();
updateGoalChart();
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
renderGoals();
updateGoalStats();
updateGoalChart();
});


// Sidebar Toggle
const hamburgerMenu = document.getElementById('hamburgerMenu');
const sidebar = document.querySelector('.sidebar');

hamburgerMenu?.addEventListener('click', () => {
  sidebar.classList.toggle('active');
});
