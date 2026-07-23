// タスクの状態を扱う「純粋ロジック」。DOM には一切触れません。
//
// ここにある関数はすべて「タスク配列を受け取り、新しい配列を返す」純粋関数です。
// 引数を書き換えず（イミュータブル）、同じ入力なら常に同じ出力を返します。
// DOM や localStorage から切り離してあるからこそ、ブラウザを起動せずに
// 高速なユニットテスト（test/unit）で検証できます。
//
// タスクの形: { id: number, title: string, completed: boolean }

export const FILTERS = Object.freeze({
  ALL: 'all',
  ACTIVE: 'active',
  COMPLETED: 'completed',
});

/**
 * タスクを1件追加する。タイトルは前後の空白を除去し、空文字なら拒否する。
 * 新しい id は「現在の最大 id + 1」。外部カウンターに頼らず一意性を保てる。
 * @param {Array} tasks
 * @param {string} title
 * @returns {Array} タスクを末尾に加えた新しい配列
 */
export function addTask(tasks, title) {
  const trimmed = String(title ?? '').trim();
  if (!trimmed) {
    throw new Error('タスクのタイトルは空にできません');
  }
  const nextId = tasks.reduce((max, task) => Math.max(max, task.id), 0) + 1;
  return [...tasks, { id: nextId, title: trimmed, completed: false }];
}

/**
 * 指定した id のタスクの完了フラグを反転する。
 * @param {Array} tasks
 * @param {number} id
 * @returns {Array}
 */
export function toggleTask(tasks, id) {
  return tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task));
}

/**
 * 指定した id のタスクを削除する。
 * @param {Array} tasks
 * @param {number} id
 * @returns {Array}
 */
export function deleteTask(tasks, id) {
  return tasks.filter((task) => task.id !== id);
}

/**
 * 絞り込み条件に一致するタスクだけを返す。
 * @param {Array} tasks
 * @param {string} filter FILTERS のいずれか
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
 * 未完了（completed が false）のタスク数を数える。
 * @param {Array} tasks
 * @returns {number}
 */
export function remainingCount(tasks) {
  return tasks.filter((task) => !task.completed).length;
}
