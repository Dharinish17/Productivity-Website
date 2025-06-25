// Notes Management
let notes = [];
let currentNote = null;

// DOM Elements
const notesList = document.getElementById('notesList');
const noteTitle = document.getElementById('noteTitle');
const newNoteBtn = document.getElementById('newNoteBtn');
const saveNoteBtn = document.getElementById('saveNoteBtn');
const deleteNoteBtn = document.getElementById('deleteNoteBtn');
const searchNotes = document.getElementById('searchNotes');
const noteModal = document.getElementById('noteModal');
const noteForm = document.getElementById('noteForm');
const modalNoteTitle = document.getElementById('modalNoteTitle'); // Get the modal note title input

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

// Initialize Quill Editor
const quill = new Quill('#editor', {
  theme: 'snow',
  placeholder: 'Write something...',
  modules: {
    toolbar: {
      container: [
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'code-block'],
        [{ header: 1 }, { header: 2 }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ script: 'sub' }, { script: 'super' }],
        [{ indent: '-1' }, { indent: '+1' }],
        [{ direction: 'rtl' }],
        [{ size: ['small', false, 'large', 'huge'] }],
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        [{ color: [] }, { background: [] }],
        [{ font: [] }],
        [{ align: [] }],
        ['clean', 'link', 'image', 'video'], // Modified toolbar
      ],
      handlers: {
        clean: function () {
          // Clear Formatting for Future Text
          if (quill.getSelection()) {
            quill.removeFormat(quill.getSelection(), Quill.sources.USER);
          }
          quill.format('bold', false);
          quill.format('italic', false);
          quill.format('underline', false);
          quill.format('strike', false);
          quill.format('blockquote', false);
          quill.format('code-block', false);
          quill.format('header', false);
          quill.format('list', false);
          quill.format('script', false);
          quill.format('indent', false);
          quill.format('direction', false);
          quill.format('size', false);
          quill.format('color', false);
          quill.format('background', false);
          quill.format('font', false);
          quill.format('align', false);
        },
        link: function (value) {
          if (value) {
            let href = prompt('Enter the URL:');
            if (href) {
              quill.format('link', href);
            }
          } else {
            quill.format('link', false);
          }
        },
      },
    },
  },
});

// Add tooltips to Quill toolbar buttons
const toolbar = quill.getModule('toolbar');
const buttons = toolbar.container.querySelectorAll('button, .ql-picker-item');

buttons.forEach((button) => {
  let tooltipText = button.classList.contains('ql-bold')
    ? 'Bold'
    : button.classList.contains('ql-italic')
    ? 'Italic'
    : button.classList.contains('ql-underline')
    ? 'Underline'
    : button.classList.contains('ql-strike')
    ? 'Strike'
    : button.classList.contains('ql-blockquote')
    ? 'Blockquote'
    : button.classList.contains('ql-code-block')
    ? 'Code Block'
    : button.classList.contains('ql-header')
    ? 'Header'
    : button.classList.contains('ql-list')
    ? 'List'
    : button.classList.contains('ql-script')
    ? 'Script'
    : button.classList.contains('ql-indent')
    ? 'Indent'
    : button.classList.contains('ql-direction')
    ? 'Direction'
    : button.classList.contains('ql-size')
    ? 'Size'
    : button.classList.contains('ql-color')
    ? 'Color'
    : button.classList.contains('ql-background')
    ? 'Background'
    : button.classList.contains('ql-font')
    ? 'Font'
    : button.classList.contains('ql-align')
    ? 'Align'
    : button.classList.contains('ql-link')
    ? 'Link'
    : button.classList.contains('ql-image')
    ? 'Image'
    : button.classList.contains('ql-video')
    ? 'Video'
    : button.classList.contains('ql-clean')
    ? 'Clear Formatting'
    : button.classList.contains('ql-picker-label')
    ? button.innerText
    : button.querySelector('svg[data-icon=ql-bold]')
    ? 'Bold'
    : button.querySelector('svg[data-icon=ql-italic]')
    ? 'Italic'
    : button.querySelector('svg[data-icon=ql-underline]')
    ? 'Underline'
    : button.querySelector('svg[data-icon=ql-strike]')
    ? 'Strike'
    : button.querySelector('svg[data-icon=ql-blockquote]')
    ? 'Blockquote'
    : button.querySelector('svg[data-icon=ql-code-block]')
    ? 'Code Block'
    : button.querySelector('svg[data-icon=ql-header]')
    ? 'Header'
    : button.querySelector('svg[data-icon=ql-list]')
    ? 'List'
    : button.querySelector('svg[data-icon=ql-script]')
    ? 'Script'
    : button.querySelector('svg[data-icon=ql-indent]')
    ? 'Indent'
    : button.querySelector('svg[data-icon=ql-direction]')
    ? 'Direction'
    : button.querySelector('svg[data-icon=ql-size]')
    ? 'Size'
    : button.querySelector('svg[data-icon=ql-color]')
    ? 'Color'
    : button.querySelector('svg[data-icon=ql-background]')
    ? 'Background'
    : button.querySelector('svg[data-icon=ql-font]')
    ? 'Font'
    : button.querySelector('svg[data-icon=ql-align]')
    ? 'Align'
    : button.querySelector('svg[data-icon=ql-link]')
    ? 'Link'
    : button.querySelector('svg[data-icon=ql-image]')
    ? 'Image'
    : button.querySelector('svg[data-icon=ql-video]')
    ? 'Video'
    : button.querySelector('svg[data-icon=ql-clean]')
    ? 'Clear Formatting'
    : null;

  if (tooltipText) {
    button.setAttribute('title', tooltipText);
  }
});

// Modal Functions
function openNoteModal() {
  noteModal.classList.add('active');
  console.log('New Note modal opened'); // Debugging
}

function closeNoteModal() {
  noteModal.classList.remove('active');
  noteForm.reset();
  console.log('New Note modal closed'); // Debugging
}

// Load notes from localStorage
function loadNotesFromStorage() {
  try {
    const storedNotes = localStorage.getItem('notes');
    console.log('Loaded notes from localStorage:', storedNotes); // Debugging
    if (storedNotes) {
      notes = JSON.parse(storedNotes);
      if (!Array.isArray(notes)) {
        notes = [];
      }
    } else {
      notes = [];
    }

    // Load order from localStorage
    const storedOrder = localStorage.getItem('notesOrder');
    if (storedOrder) {
      const order = JSON.parse(storedOrder);
      // Reorder notes based on stored order
      notes = order.map((id) => notes.find((note) => note.id === id)).filter(Boolean);
    }

    renderNotes();
    if (notes.length > 0) {
      loadNote(notes[0]);
    }
  } catch (error) {
    console.error('Error loading notes from localStorage:', error);
    notes = [];
  }
}

// Save notes to localStorage
function saveNotesToStorage() {
  try {
    localStorage.setItem('notes', JSON.stringify(notes));
    console.log('Saved notes to localStorage:', JSON.stringify(notes)); // Debugging
  } catch (error) {
    console.error('Error saving notes to localStorage:', error);
  }
}

// Save notes order to localStorage
function saveNotesOrderToStorage() {
  try {
    const notesOrder = notes.map((note) => note.id);
    localStorage.setItem('notesOrder', JSON.stringify(notesOrder));
    console.log('Saved notes order to localStorage:', JSON.stringify(notesOrder)); // Debugging
  } catch (error) {
    console.error('Error saving notes order to localStorage:', error);
  }
}

// Function to update habit completion
function updateHabitCompletion(habitId, dateStr, completed) {
  // Retrieve habits from local storage
  let habits = JSON.parse(localStorage.getItem('habits')) || [];

  // Find the habit by id
  const habitIndex = habits.findIndex((habit) => habit.id === habitId);

  if (habitIndex !== -1) {
    const habit = habits[habitIndex];

    if (completed) {
      // Add the date to completedDates if it's not already there
      if (!habit.completedDates.includes(dateStr)) {
        habit.completedDates.push(dateStr);
      }
    } else {
      // Remove the date from completedDates
      habit.completedDates = habit.completedDates.filter((date) => date !== dateStr);
    }

    // Update the habit in the array
    habits[habitIndex] = habit;

    // Save the updated habits back to local storage
    localStorage.setItem('habits', JSON.stringify(habits));

    // Re-render the calendar to reflect the changes
    // This assumes you have access to the calendar instance in this scope
    // and a method to re-render events
    if (typeof renderCalendarEvents === 'function') {
      renderCalendarEvents();
    }
  }
}

// New Note
newNoteBtn.addEventListener('click', () => {
  console.log('New Note button clicked'); // Debugging
  openNoteModal();
});

// Note Form Submit
noteForm.addEventListener('submit', (e) => {
  e.preventDefault();
  console.log('Note form submitted'); // Debugging

  const title = modalNoteTitle.value.trim() || 'Untitled Note'; // Get title from modal input
  const content = quill.getContents();

  const newNote = {
    id: Date.now().toString(),
    title: title,
    content: content,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  notes.unshift(newNote);
  console.log('New note created:', newNote); // Debugging
  saveNotesToStorage();
  saveNotesOrderToStorage(); // Save the new order
  renderNotes(); // Re-render notes to display the new note
  loadNote(newNote); // Load the new note in the editor
  closeNoteModal();
  quill.setContents([]);
});

// Save Note
function saveNote(showPopup = false) {
  if (!currentNote) return;

  const noteIndex = notes.findIndex((note) => note.id === currentNote.id);
  if (noteIndex === -1) return;

  try {
    const updatedNote = {
      ...currentNote,
      title: noteTitle.value.trim() || 'Untitled Note',
      content: quill.getContents(),
      updatedAt: new Date().toISOString(),
    };

    notes[noteIndex] = updatedNote;
    currentNote = updatedNote;
    console.log('Note updated:', updatedNote); // Debugging
    saveNotesToStorage();
    renderNotes();
    if (showPopup) {
      alert('Note saved successfully!'); // Show popup message
    }
    console.log('Note saved successfully'); // Debugging
  } catch (error) {
    console.error('Error saving note:', error);
  }
}

saveNoteBtn.addEventListener('click', () => {
  console.log('Save button clicked'); // Debugging
  saveNote(true); // Show popup when save button is clicked
});

// Delete Note
deleteNoteBtn.addEventListener('click', () => {
  if (!currentNote) return;

  if (confirm('Are you sure you want to delete this note?')) {
    try {
      notes = notes.filter((note) => note.id !== currentNote.id);
      console.log('Note deleted, notes array:', notes); // Debugging
      saveNotesToStorage();
      saveNotesOrderToStorage(); // Save the new order
      renderNotes();

      currentNote = notes[0] || null;
      if (currentNote) {
        loadNote(currentNote);
      } else {
        noteTitle.value = '';
        quill.setContents([]);
      }
      console.log('Note deleted successfully'); // Debugging
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  }
});
console.log('Delete button clicked'); // Debugging

// Search Notes
searchNotes.addEventListener('input', (e) => {
  const searchTerm = e.target.value.toLowerCase().trim();
  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchTerm) ||
      quill.getText(note.content).toLowerCase().includes(searchTerm)
  );
  renderNotes(filteredNotes);
});

// Auto Save
let autoSaveTimeout;
quill.on('text-change', () => {
  if (!currentNote) return;

  clearTimeout(autoSaveTimeout);
  autoSaveTimeout = setTimeout(() => {
    saveNote();
  }, 1000);
});

// Note Title Change
noteTitle.addEventListener('input', () => {
  if (!currentNote) return;

  clearTimeout(autoSaveTimeout);
  autoSaveTimeout = setTimeout(() => {
    saveNote();
  }, 1000);
});

// Render Notes List
function renderNotes(notesToRender = notes) {
  if (!notesList) return;

  notesList.innerHTML = '';

  if (notesToRender.length === 0) {
    const emptyMessage = document.createElement('div');
    emptyMessage.className = 'note-item';
    emptyMessage.innerHTML = `
      <div class="note-title">No notes found</div>
      <div class="note-preview">Click "New Note" to create one</div>
    `;
    notesList.appendChild(emptyMessage);
    return;
  }

  notesToRender.forEach((note) => {
    const div = document.createElement('div');
    div.className = `note-item ${
      note.id === currentNote?.id ? 'active' : ''
    }`;
    div.draggable = true; // Make notes draggable
    div.dataset.noteId = note.id; // Add note ID to data attribute
    div.onclick = () => loadNote(note);

    div.innerHTML = `
      <div class="note-title">${note.title}</div>
    `;

    notesList.appendChild(div);
  });

  // Add drag and drop listeners to the notes list
  addDragAndDropListeners();
}

// Function to add drag and drop listeners
function addDragAndDropListeners() {
  const noteItems = document.querySelectorAll('.note-item');

  noteItems.forEach((noteItem) => {
    noteItem.addEventListener('dragstart', dragStart);
    noteItem.addEventListener('dragover', dragOver);
    noteItem.addEventListener('drop', drop);
    noteItem.addEventListener('dragend', dragEnd);
    noteItem.addEventListener('dragleave', dragLeave);
  });
}

let draggedNote = null;

function dragStart(e) {
  draggedNote = this;
  this.classList.add('dragging');
  e.dataTransfer.setData('text/plain', this.dataset.noteId); // Set data being dragged
}

function dragOver(e) {
  e.preventDefault();
  this.classList.add('drag-over');
}

function dragLeave(e) {
  this.classList.remove('drag-over');
}

function drop(e) {
  e.preventDefault();
  if (this !== draggedNote) {
    const draggedNoteId = e.dataTransfer.getData('text/plain');
    const droppedNoteId = this.dataset.noteId;

    // Find the indexes of the dragged and dropped notes
    const draggedIndex = notes.findIndex((note) => note.id === draggedNoteId);
    const droppedIndex = notes.findIndex((note) => note.id === droppedNoteId);

    if (draggedIndex !== -1 && droppedIndex !== -1) {
      // Reorder the notes array
      const [draggedNote] = notes.splice(draggedIndex, 1);
      notes.splice(droppedIndex, 0, draggedNote);

      // Save the new order to local storage
      saveNotesOrderToStorage();

      // Re-render the notes list
      renderNotes();
    }
  }
  this.classList.remove('drag-over');
}

function dragEnd() {
  this.classList.remove('dragging');
  this.classList.remove('drag-over');
  draggedNote = null;
}

// Load Note
function loadNote(note) {
  if (!note) {
    noteTitle.value = '';
    quill.setContents([]);
    currentNote = null;
    return;
  }

  currentNote = note;
  noteTitle.value = note.title;
  quill.setContents(note.content);
  renderNotes();
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadNotesFromStorage();
});

// Handle keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // Save: Ctrl/Cmd + S
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    saveNote(true);
  }

  // New Note: Ctrl/Cmd + N
  if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
    e.preventDefault();
    openNoteModal();
  }
});


// Sidebar Toggle
const hamburgerMenu = document.getElementById('hamburgerMenu');
const sidebar = document.querySelector('.sidebar');

hamburgerMenu?.addEventListener('click', () => {
  sidebar.classList.toggle('active');
});
