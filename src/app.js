// DOM wiring for the Task Board.
//
// This module owns the browser-only concerns — reading/writing localStorage and
// rendering to the DOM — and delegates every state transition to the pure
// functions in taskStore.js. The rule of thumb: no business logic lives here,
// only "read the DOM / call a pure function / write the DOM".

import {
  addTask,
  toggleTask,
  deleteTask,
  filterTasks,
  remainingCount,
  FILTERS,
} from './taskStore.js';

const STORAGE_KEY = 'github-flow-tasks';

let tasks = load();
let activeFilter = FILTERS.ALL;

const form = document.querySelector('#new-task-form');
const input = document.querySelector('#new-task-input');
const list = document.querySelector('#task-list');
const counter = document.querySelector('#remaining-count');
const emptyState = document.querySelector('#empty-state');
const filterButtons = document.querySelectorAll('[data-filter]');

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    // Corrupt or unavailable storage should never break the app: start empty.
    return [];
  }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function buildTaskItem(task) {
  const item = document.createElement('li');
  item.className = 'task' + (task.completed ? ' task--done' : '');
  item.dataset.id = String(task.id);
  item.dataset.testid = 'task-item';

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'task__checkbox';
  checkbox.checked = task.completed;
  checkbox.dataset.testid = 'task-checkbox';
  checkbox.setAttribute(
    'aria-label',
    `Mark "${task.title}" as ${task.completed ? 'active' : 'completed'}`,
  );
  checkbox.addEventListener('change', () => {
    tasks = toggleTask(tasks, task.id);
    save();
    render();
  });

  const title = document.createElement('span');
  title.className = 'task__title';
  title.textContent = task.title;

  const remove = document.createElement('button');
  remove.type = 'button';
  remove.className = 'task__delete';
  remove.textContent = '×';
  remove.dataset.testid = 'task-delete';
  remove.setAttribute('aria-label', `Delete "${task.title}"`);
  remove.addEventListener('click', () => {
    tasks = deleteTask(tasks, task.id);
    save();
    render();
  });

  item.append(checkbox, title, remove);
  return item;
}

function render() {
  const visible = filterTasks(tasks, activeFilter);

  list.replaceChildren(...visible.map(buildTaskItem));
  counter.textContent = String(remainingCount(tasks));
  emptyState.hidden = visible.length > 0;

  for (const button of filterButtons) {
    button.setAttribute('aria-pressed', String(button.dataset.filter === activeFilter));
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const value = input.value.trim();
  if (!value) {
    return;
  }
  tasks = addTask(tasks, value);
  input.value = '';
  save();
  render();
});

for (const button of filterButtons) {
  button.addEventListener('click', () => {
    activeFilter = button.dataset.filter;
    render();
  });
}

render();
