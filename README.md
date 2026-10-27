# 雑誌連動カレンダー（デモ）

React + Vite + TypeScript で動く、日本語の雑誌発売日カレンダーです。

## セットアップ

Node.js 20.19 以降の20系、または22.12以降（推奨：24系）と npm が必要です。

```sh
npm install
npm run dev
```

ターミナルに表示された URL（通常は http://localhost:5173/magazine-linked-calendar-app/）をブラウザで開いてください。

## 使い方

- 起動時の当月を7列の月カレンダーで表示します。
- 当月の3・8・15・22・27日に、架空の雑誌の固定サンプル6件を配置します。
- 日付をクリックすると、詳細ペインにタイトル・発売日・メモ（ある場合）を表示します。
- 前月・翌月への移動と「今月」への復帰ができます。
- スマートフォンでは詳細ペインをカレンダーの下に表示します。

## 検証・ビルド

```sh
npm run lint
npm run build
npm run preview
```

`build` は TypeScript のチェックと本番用ビルドを行い、`dist/` に出力します。
`preview` はそのビルド結果をローカルで確認するためのサーバーです。

## GitHub Pages への公開

公開先は https://otoufutarou.github.io/magazine-linked-calendar-app/ です。
Vite の `base` を `/magazine-linked-calendar-app/` に設定し、公開先でも JavaScript と CSS を読み込めるようにしています。

1. リポジトリの **Settings → Pages → Build and deployment → Source** が **GitHub Actions** になっていることを確認します（設定済みの場合は変更不要）。
2. 公開設定の Pull Request を `main` にマージします。
3. **Actions → Deploy to GitHub Pages** の `build` と `deploy` が完了したら、公開先を開きます。`github-pages` 環境で承認が求められた場合は承認してください。

以後は `main` への push ごとに自動で更新されます。再公開する場合は **Actions → Deploy to GitHub Pages → Run workflow** から `main` を選んで手動実行できます。
ワークフローは Node.js 24 と `npm ci` を使い、lint とビルドに成功した `dist/` のみを GitHub Pages にデプロイします。追加のシークレット設定は不要です。

## 注意事項

- **デモ版・閲覧専用**です。雑誌名・発売日・メモはすべて架空で、実際の刊行情報ではありません。
- **永続化なし**：選択日や表示月はメモリ内のみで保持し、再読み込みで初期状態に戻ります。ブラウザへのデータ保存やバックエンドへの送信は行いません。
- **出版社名非表示**：画面・データモデル・サンプルデータに出版社情報を含めていません。
