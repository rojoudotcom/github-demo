// タスクボードの DOM 配線。
//
// このモジュールはブラウザ固有の処理だけを担当します
// （localStorage の読み書きと DOM への描画）。状態の変化そのものは
// すべて taskStore.js の純粋関数に任せます。指針は「DOM を読む →
// 純粋関数を呼ぶ → DOM を書く」だけで、業務ロジックはここに書きません。

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
    // 保存データが壊れている・使えない場合でもアプリを止めない。空で始める。
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
    `「${task.title}」を${task.completed ? '未完了' : '完了'}にする`,
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
  remove.setAttribute('aria-label', `「${task.title}」を削除`);
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
