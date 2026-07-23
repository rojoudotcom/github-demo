// taskStore.js（純粋ロジック）のユニットテスト。Node 標準のテストランナーを使う。
// 実行: npm test （内部では `node --test test/unit/*.test.js` を呼ぶ）
//
// ユニットテストは「一番小さな単位（＝ここでは純粋関数）」を、ブラウザを起動せずに
// 単体で検証するテストです。純粋関数は「入力 → 期待する出力」を突き合わせるだけで
// 済むため、DOM や保存領域を用意する必要がなく、ミリ秒で終わります。
// PR ごとに CI がこれを回し、ロジックの取り違えがあれば即座に赤で知らせます。

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

test('addTask: 新しい未完了タスクを一意の id で末尾に追加する', () => {
  const result = addTask([], 'テストを書く');
  assert.equal(result.length, 1);
  assert.equal(result[0].title, 'テストを書く');
  assert.equal(result[0].completed, false);
  assert.equal(result[0].id, 1);

  const next = addTask(result, 'PR を出す');
  assert.equal(next[1].id, 2);
});

test('addTask: タイトル前後の空白を取り除く', () => {
  const result = addTask([], '  余白つき  ');
  assert.equal(result[0].title, '余白つき');
});

test('addTask: 空文字・空白だけのタイトルは拒否する', () => {
  assert.throws(() => addTask([], ''));
  assert.throws(() => addTask([], '   '));
});

test('addTask: 引数の配列を書き換えない（イミュータブル）', () => {
  const original = [];
  addTask(original, 'リリースする');
  assert.equal(original.length, 0);
});

test('toggleTask: 指定した id のタスクだけ完了フラグを反転する', () => {
  const tasks = addTask(addTask([], 'a'), 'b');
  const toggled = toggleTask(tasks, 1);
  assert.equal(toggled[0].completed, true);
  assert.equal(toggled[1].completed, false);
});

test('toggleTask: もう一度呼ぶと元の状態に戻る', () => {
  let tasks = addTask([], 'a');
  tasks = toggleTask(tasks, 1);
  tasks = toggleTask(tasks, 1);
  assert.equal(tasks[0].completed, false);
});

test('deleteTask: 指定した id のタスクだけ削除する', () => {
  const tasks = addTask(addTask([], 'a'), 'b');
  const remaining = deleteTask(tasks, 1);
  assert.equal(remaining.length, 1);
  assert.equal(remaining[0].title, 'b');
});

test('filterTasks: 絞り込み条件ごとに正しい部分集合を返す', () => {
  let tasks = addTask(addTask([], '未完了のタスク'), '完了したタスク');
  tasks = toggleTask(tasks, 2);

  assert.equal(filterTasks(tasks, FILTERS.ALL).length, 2);
  assert.equal(filterTasks(tasks, FILTERS.ACTIVE).length, 1);
  assert.equal(filterTasks(tasks, FILTERS.ACTIVE)[0].title, '未完了のタスク');
  assert.equal(filterTasks(tasks, FILTERS.COMPLETED).length, 1);
  assert.equal(filterTasks(tasks, FILTERS.COMPLETED)[0].title, '完了したタスク');
});

test('remainingCount: 未完了のタスクだけ数える', () => {
  let tasks = addTask(addTask(addTask([], 'a'), 'b'), 'c');
  assert.equal(remainingCount(tasks), 3);
  tasks = toggleTask(tasks, 2);
  assert.equal(remainingCount(tasks), 2);
});
