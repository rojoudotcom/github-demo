// Pure, DOM-free task state logic.
//
// Every function is a pure function over an array of tasks: it never mutates its
// input and always returns a new value. Keeping the logic free of the DOM and of
// localStorage is what lets the same code be exercised by fast unit tests
// (test/unit) and by the browser app (src/app.js).
//
// A task is: { id: number, title: string, completed: boolean }

export const FILTERS = Object.freeze({
  ALL: 'all',
  ACTIVE: 'active',
  COMPLETED: 'completed',
});

/**
 * Append a new task. Titles are trimmed; empty titles are rejected.
 * The new id is one greater than the current maximum, so ids stay unique
 * without relying on any external counter.
 * @param {Array} tasks
 * @param {string} title
 * @returns {Array} a new array with the task appended
 */
export function addTask(tasks, title) {
  const trimmed = String(title ?? '').trim();
  if (!trimmed) {
    throw new Error('Task title must not be empty');
  }
  const nextId = tasks.reduce((max, task) => Math.max(max, task.id), 0) + 1;
  return [...tasks, { id: nextId, title: trimmed, completed: false }];
}

/**
 * Flip the completed flag of the task with the given id.
 * @param {Array} tasks
 * @param {number} id
 * @returns {Array}
 */
export function toggleTask(tasks, id) {
  return tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task));
}

/**
 * Remove the task with the given id.
 * @param {Array} tasks
 * @param {number} id
 * @returns {Array}
 */
export function deleteTask(tasks, id) {
  return tasks.filter((task) => task.id !== id);
}

/**
 * Return only the tasks that match the active filter.
 * @param {Array} tasks
 * @param {string} filter one of FILTERS
 * @returns {Array}
 */
export function filterTasks(tasks, filter) {
  switch (filter) {
    case FILTERS.ACTIVE:
      return tasks.filter((task) => !task.completed);
    case FILTERS.COMPLETED:
      return tasks.filter((task) => task.completed);
    default:
      return tasks;
  }
}

/**
 * Count the tasks that are still active (not completed).
 * @param {Array} tasks
 * @returns {number}
 */
export function remainingCount(tasks) {
  return tasks.filter((task) => !task.completed).length;
}
