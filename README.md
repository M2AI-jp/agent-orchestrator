# AI Agent Orchestrator

複数の特化型 AI エージェントを組み合わせて複雑なタスクを実行するマルチエージェント AI プラットフォーム。

## Demo

**Production URL**: https://agent-orchestrator-m2ai-jps-projects.vercel.app

## Features

- **4種類の AI エージェント**:
  - Research Agent: 情報収集・調査
  - Summary Agent: テキスト要約
  - FactCheck Agent: 事実確認・検証
  - Writer Agent: 文章作成

- **パイプライン実行**: エージェントを順番に実行し、前のエージェントの出力を次に渡す
- **リアルタイム状態表示**: 実行状態（pending/processing/done/error）を視覚的に表示
- **チャット UI**: 会話形式で結果を表示

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **AI SDK**: Vercel AI SDK + OpenAI
- **Styling**: Tailwind CSS 4
- **Runtime**: Edge Runtime

## Getting Started

1. 依存関係をインストール:
```bash
pnpm install
```

2. 環境変数を設定:
```bash
cp .env.example .env.local
# .env.local に OpenAI API キーを設定
```

3. 開発サーバーを起動:
```bash
pnpm dev
```

4. http://localhost:3000 を開く

## Usage

1. 使用したいエージェントをクリックして選択（複数選択可、選択順 = 実行順）
2. メッセージを入力
3. 「実行」をクリック
4. 各エージェントが順番に処理し、結果がチャットに表示される

## License

MIT
