#!/usr/bin/env node
// Git hooks を .githooks/ に向ける postinstall スクリプト
// npm install 後に自動実行され、pre-push hook が有効化される
//
// 緊急時に hook を無効化したい場合:
//   git config --unset core.hooksPath

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// .git が存在しない場合 (npm pack, CI build context 等) はスキップ
if (!fs.existsSync(path.join(__dirname, "..", ".git"))) {
  process.exit(0);
}

try {
  // 既に設定済みかチェック
  const current = execSync("git config --get core.hooksPath", { stdio: "pipe" }).toString().trim();
  if (current === ".githooks") {
    console.log("✓ git hooks: .githooks (既に設定済み)");
    process.exit(0);
  }
} catch {
  // 未設定 (これは正常)
}

try {
  execSync("git config core.hooksPath .githooks", { stdio: "pipe" });
  console.log("✓ git hooks: .githooks に設定しました (pre-push でヘルスチェックが走ります)");
} catch (err) {
  // git config 失敗は致命的ではない (例: shallow clone)
  console.log("ℹ️  git hooks 自動設定をスキップ:", err.message);
}
