# github-demo — GitHub Flow タスクボード

素の **HTML・CSS・JavaScript** だけで作った小さなタスクボードです（フレームワーク・ビルド工程なし）。
本当の目的は **GitHub Flow** の実演です。ブランチを切り、Pull Request（PR）を出し、CI に検査させ、
`main` にマージし、その結果を CD で **GitHub Pages** に公開する — この一連の流れを体験します。

受講者向けの手順書は [docs/GitHubフロー_ハンズオン手順.md](docs/GitHubフロー_ハンズオン手順.md) にあります。

## アプリの機能

- タスクの追加・完了・削除
- 「すべて / 未完了 / 完了」での絞り込み
- ブラウザの `localStorage` に保存（リロードしても残る）

## ディレクトリ構成

```
index.html                  アプリ本体（src/app.js を ES モジュールとして読み込む）
src/
  taskStore.js              DOM に依存しない純粋ロジック（ユニットテスト対象）
  app.js                    DOM 配線 + localStorage（taskStore を利用）
  styles.css                スタイル
scripts/serve.mjs           依存ゼロの静的サーバ（ローカル確認用）
test/
  unit/taskStore.test.js    ユニットテスト（node:test）
.github/workflows/
  ci.yml                    CI: Lint + ユニットテスト（PR ごとに実行）
  deploy.yml                CD: main への push で GitHub Pages に公開
```

設計上の要点は **ロジックを `taskStore.js` に純粋関数として置き、DOM から切り離している**ことです。
これにより、ユニットテストがミリ秒で終わり、CI が意味のある検査になります
（ルールを壊す変更は、マージ前に PR を赤くして止められます）。

## ローカルでの開発

Node.js 20 以上が必要です。

```bash
npm install          # 初回のみ。生成された package-lock.json はコミットする
npm run serve        # http://localhost:4173 を開く
npm test             # ユニットテスト（node:test）
npm run lint         # eslint + prettier --check
npm run format       # prettier で自動整形
```

## GitHub Flow の全体像

1. `main` から**ブランチを作る**:
   ```bash
   git switch -c feature/add-due-dates
   ```
2. そのブランチで変更を**コミット**する。
3. **Pull Request を出す。** PR を作る（または更新する）と `ci.yml` が動き、
   **Lint** と **ユニットテスト** の2ジョブが並列で走る。両方通れば PR に緑のチェック、
   どちらか落ちれば赤が付く。
4. **レビューしてマージ。** CI が緑になり、変更をレビューできたら `main` にマージする。
5. **自動デプロイ。** `main` への push で `deploy.yml` が動き、サイトを GitHub Pages に公開する。
   公開 URL はワークフローの `github-pages` 環境に表示される。

## CI の中身

このリポジトリの CI は2つの検査からなります。どちらも PR ごとに自動で走り、**両方緑にならないとマージできません**。

### Lint（コード体裁チェック）

コードを**実行せずに**静的解析する検査で、2つの道具を組み合わせています。

- **ESLint** — バグの芽や危険な書き方を検出する。例: 使っていない変数（`no-unused-vars`）、
  定義されていない名前の参照（`no-undef`、タイプミスなど）。設定は `eslint.config.js`。
- **Prettier** — インデント・クォート・折り返しなどの**整形**を機械的にそろえる。設定は `.prettierrc.json`。

体裁のズレは `npm run format` で自動修正できます。Lint が赤くなったら、まず `npm run format` を実行し、
残る指摘（未使用変数など）を直してから push し直します。

### ユニットテスト

`taskStore.js` の**純粋関数**を、ブラウザを起動せずに単体で検証します（Node 標準の `node:test`）。
純粋関数は「入力 → 期待する出力」を突き合わせるだけなので、DOM も保存領域も用意せずに済み、
テストはミリ秒で終わります。`addTask` / `toggleTask` / `deleteTask` / `filterTasks` / `remainingCount`
の各挙動（追加・完了の反転・削除・絞り込み・未完了件数、イミュータブル性など）を確認します。

ローカルでは `npm test` で同じ検査を再現できます。ロジックを壊す変更を入れると、この検査が赤くなって
マージを止めます。

## 初回だけ必要な GitHub 側の設定

このリポジトリを push したあと、CI と Pages を動かすための設定です。

1. **Settings → Pages → Build and deployment → Source: GitHub Actions**（Pages の公開元を Actions にする）。
2. あとは `deploy.yml` が処理する。
3. （推奨・フローを正しく教えるため）**Settings → Branches** で `main` に**ブランチ保護ルール**を追加する。
   PR を必須にし、CI のチェック通過をマージ条件にする。これで緑/赤が本当の「関所」になる。

Pages を有効化し、`main` が一度デプロイされれば、アプリは次の URL で公開されます。

```
https://rojoudotcom.github.io/github-demo/
```
