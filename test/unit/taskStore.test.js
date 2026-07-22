// Unit tests for the pure task logic, using Node's built-in test runner.
// Run with: npm test  (which calls `node --test test/unit`)

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  addTask,
  toggleTask,
  deleteTask,
  filterTasks,
  remainingCount,
  FILTERS,
} from '../../src/taskStore.js';

test('addTask appends a new active task with a unique id', () => {
  const result = addTask([], 'Write tests');
  assert.equal(result.length, 1);
  assert.equal(result[0].title, 'Write tests');
  assert.equal(result[0].completed, false);
  assert.equal(result[0].id, 1);

  const next = addTask(result, 'Open a PR');
  assert.equal(next[1].id, 2);
});

test('addTask trims whitespace from the title', () => {
  const result = addTask([], '  spaced  ');
  assert.equal(result[0].title, 'spaced');
});

test('addTask rejects empty or whitespace-only titles', () => {
  assert.throws(() => addTask([], ''));
  assert.throws(() => addTask([], '   '));
});

test('addTask does not mutate the input array', () => {
  const original = [];
  addTask(original, 'Ship it');
  assert.equal(original.length, 0);
});

test('toggleTask flips only the matching task', () => {
  const tasks = addTask(addTask([], 'a'), 'b');
  const toggled = toggleTask(tasks, 1);
  assert.equal(toggled[0].completed, true);
  assert.equal(toggled[1].completed, false);
});

test('deleteTask removes only the matching task', () => {
  const tasks = addTask(addTask([], 'a'), 'b');
  const remaining = deleteTask(tasks, 1);
  assert.equal(remaining.length, 1);
  assert.equal(remaining[0].title, 'b');
});

test('filterTasks returns the right subset per filter', () => {
  let tasks = addTask(addTask([], 'active one'), 'done one');
  tasks = toggleTask(tasks, 2);

  assert.equal(filterTasks(tasks, FILTERS.ALL).length, 2);
  assert.equal(filterTasks(tasks, FILTERS.ACTIVE).length, 1);
  assert.equal(filterTasks(tasks, FILTERS.ACTIVE)[0].title, 'active one');
  assert.equal(filterTasks(tasks, FILTERS.COMPLETED).length, 1);
  assert.equal(filterTasks(tasks, FILTERS.COMPLETED)[0].title, 'done one');
});

test('remainingCount counts only active tasks', () => {
  let tasks = addTask(addTask(addTask([], 'a'), 'b'), 'c');
  assert.equal(remainingCount(tasks), 3);
  tasks = toggleTask(tasks, 2);
  assert.equal(remainingCount(tasks), 2);
});
