"use client";

// Oracle タブ — Claude API ベースの個人占術相談
// page.tsx から抽出 (考察 #3: モノリス分割)

import { useEffect, useRef, useState } from "react";
import {
  loadApiKey,
  saveApiKey,
  loadModel,
  saveModel,
  MODEL_LABELS,
  CATEGORY_LABELS,
  fileToImage,
  imageToDataUrl,
  loadThreads,
  saveThreads,
  newThread,
  buildSystemPrompt,
  copyProfileMarkdown,
  downloadProfileMarkdown,
  streamOracle,
  type OracleModel,
  type OracleCategory,
  type CompatPerson,
  type ChatImage,
  type ChatMessage,
  type ChatThread,
} from "@/lib/oracle";

export function OracleTab() {
  const [apiKey, setApiKey] = useState("");
  const [keyInput, setKeyInput] = useState("");
  const [model, setModel] = useState<OracleModel>("claude-opus-4-7");
  const [hydrated, setHydrated] = useState(false);

  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  const [category, setCategory] = useState<OracleCategory>("free");
  const [partnerName, setPartnerName] = useState("");
  const [partnerBirth, setPartnerBirth] = useState("");
  const [partnerGender, setPartnerGender] = useState<"male" | "female">("male");

  const [input, setInput] = useState("");
  const [pendingImages, setPendingImages] = useState<ChatImage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setApiKey(loadApiKey());
    setModel(loadModel());
    setThreads(loadThreads());
    setHydrated(true);
  }, []);

  const active = threads.find((t) => t.id === activeId) || null;

  const isCompat = category.startsWith("compat-");

  // Auto-scroll on new content
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [active?.messages.length, streamText]);

  const onSaveKey = () => {
    saveApiKey(keyInput.trim());
    setApiKey(keyInput.trim());
    setKeyInput("");
  };

  const onClearKey = () => {
    if (!confirm("APIキーを削除しますか？")) return;
    saveApiKey("");
    setApiKey("");
  };

  const onChangeModel = (m: OracleModel) => {
    setModel(m);
    saveModel(m);
  };

  const startNew = () => {
    let partner: CompatPerson | undefined;
    if (isCompat) {
      if (!partnerBirth) {
        alert("相性鑑定の対象には生年月日が必須です");
        return;
      }
      partner = { name: partnerName, birth: partnerBirth, gender: partnerGender };
    }
    const t = newThread(category, partner);
    const next = [t, ...threads];
    setThreads(next);
    saveThreads(next);
    setActiveId(t.id);
  };

  const onPickImages = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const next: ChatImage[] = [...pendingImages];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      if (file.size > 5 * 1024 * 1024) {
        setError(`${file.name} は5MB超のため除外しました`);
        continue;
      }
      try {
        const img = await fileToImage(file);
        next.push(img);
      } catch {
        setError(`${file.name} の読み込みに失敗しました`);
      }
    }
    setPendingImages(next);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removePendingImage = (idx: number) => {
    setPendingImages((arr) => arr.filter((_, i) => i !== idx));
  };

  const sendMessage = async () => {
    if ((!input.trim() && pendingImages.length === 0) || !active || streaming) return;
    if (!apiKey) {
      setError("APIキーを設定してください");
      return;
    }

    const userMsg: ChatMessage = {
      role: "user",
      content: input.trim(),
      images: pendingImages.length > 0 ? pendingImages : undefined,
      timestamp: new Date().toISOString(),
    };
    const updated: ChatThread = {
      ...active,
      messages: [...active.messages, userMsg],
      updatedAt: new Date().toISOString(),
    };
    const newThreads = threads.map((t) => (t.id === active.id ? updated : t));
    setThreads(newThreads);
    saveThreads(newThreads);
    setInput("");
    setPendingImages([]);
    setStreaming(true);
    setStreamText("");
    setError(null);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const sysPrompt = buildSystemPrompt(active.category, active.partner);
      let acc = "";
      const full = await streamOracle({
        apiKey,
        model,
        systemPrompt: sysPrompt,
        messages: updated.messages,
        signal: controller.signal,
        onChunk: (t) => {
          acc += t;
          setStreamText(acc);
        },
      });

      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: full,
        timestamp: new Date().toISOString(),
      };
      const final: ChatThread = {
        ...updated,
        messages: [...updated.messages, assistantMsg],
        updatedAt: new Date().toISOString(),
      };
      const finalThreads = newThreads.map((t) => (t.id === active.id ? final : t));
      setThreads(finalThreads);
      saveThreads(finalThreads);
      setStreamText("");
    } catch (e: unknown) {
      const err = e as Error;
      if (err.name !== "AbortError") {
        setError(err.message || "通信エラー");
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  };

  const stopStream = () => {
    abortRef.current?.abort();
  };

  const deleteThread = (id: string) => {
    if (!confirm("このスレッドを削除しますか？")) return;
    const next = threads.filter((t) => t.id !== id);
    setThreads(next);
    saveThreads(next);
    if (activeId === id) setActiveId(null);
  };

  if (!hydrated) {
    return <div className="text-sm text-sand-500 py-12 text-center">読み込み中…</div>;
  }

  // ===== API KEY 未設定 =====
  if (!apiKey) {
    return (
      <section className="rounded-2xl bg-kachi-fade text-sand-50 p-8 sm:p-12">
        <div className="text-[10px] tracking-[0.4em] uppercase text-copper-300">
          Oracle Setup ／ 初回設定
        </div>
        <h2 className="font-display text-3xl sm:text-4xl mt-3">Claude API キーを登録</h2>
        <p className="mt-4 text-sand-200 text-sm leading-relaxed">
          あなたの命式・大運・五格すべてをコンテキストに、Claude が深い個人相談を行います。
          APIキーは <strong>このブラウザの localStorage</strong> にのみ保存され、外部送信されません。
        </p>
        <p className="mt-3 text-sand-300 text-xs">
          API キーは{" "}
          <a
            href="https://console.anthropic.com/"
            target="_blank"
            rel="noreferrer"
            className="underline text-copper-300"
          >
            console.anthropic.com
          </a>{" "}
          で取得可能（sk-ant-... で始まる文字列）。
        </p>
        <div className="mt-6 space-y-3">
          <input
            type="password"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            placeholder="sk-ant-api03-..."
            className="w-full rounded-md bg-kachi-700/40 border border-copper-500/30 px-4 py-3 text-sand-50 placeholder:text-sand-400 focus:outline-none focus:border-copper-500"
          />
          <button
            onClick={onSaveKey}
            disabled={!keyInput.trim()}
            className="w-full rounded-md bg-copper-500 text-kachi-900 font-display text-lg py-3 hover:bg-gold-400 disabled:opacity-30"
          >
            保存して開始
          </button>
        </div>
      </section>
    );
  }

  // ===== メインUI =====
  return (
    <div className="space-y-6">
      {/* ヘッダ: モデル選択 / キー管理 */}
      <section className="rounded-xl bg-midnight-700/60 backdrop-blur-sm border border-copper-500/30 p-4 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px]">
          <div className="text-[10px] tracking-[0.3em] uppercase text-copper-300">Model</div>
          <select
            value={model}
            onChange={(e) => onChangeModel(e.target.value as OracleModel)}
            className="mt-1 w-full rounded-md border border-copper-500/30 px-3 py-2 bg-midnight-800/50 backdrop-blur-sm text-sm focus:outline-none focus:border-copper-500"
          >
            {Object.entries(MODEL_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={onClearKey}
          className="text-xs text-sand-500 hover:text-shu-700 underline self-end"
        >
          API キー削除
        </button>
      </section>

      {/* プロフィールエクスポート */}
      <ProfileExport />

      {/* スレッド一覧 + 新規作成 */}
      <section className="rounded-2xl bg-midnight-700/60 backdrop-blur-sm border border-copper-500/30 p-5 sm:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
          <div>
            <div className="text-[10px] tracking-[0.3em] uppercase text-copper-300">
              New Thread ／ 新しい相談
            </div>
            <h3 className="font-display text-xl mt-1">カテゴリを選んで開始</h3>
          </div>
        </div>

        {/* カテゴリ選択 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(Object.entries(CATEGORY_LABELS) as [OracleCategory, typeof CATEGORY_LABELS[OracleCategory]][]).map(([k, v]) => (
            <button
              key={k}
              onClick={() => setCategory(k)}
              className={`rounded-lg border p-3 text-left transition-all ${
                category === k
                  ? "bg-copper-500/10 border-2 border-copper-500 shadow"
                  : "bg-midnight-800/50 backdrop-blur-sm border-copper-500/20 hover:border-copper-400"
              }`}
            >
              <div className="text-2xl">{v.emoji}</div>
              <div className="font-display text-sm mt-1">{v.label}</div>
              <div className="text-[10px] text-sand-400">{v.sub}</div>
            </button>
          ))}
        </div>

        {/* 相性カテゴリの場合: 相手情報フォーム */}
        {isCompat && (
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-midnight-800/40 rounded-lg border border-copper-500/20">
            <label className="block">
              <span className="text-[10px] tracking-[0.3em] uppercase text-sand-400">名前（任意）</span>
              <input
                type="text"
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                placeholder="例: 田中太郎"
                className="mt-1 w-full rounded-md border border-copper-500/30 px-3 py-2 bg-midnight-800/50 backdrop-blur-sm text-sm focus:outline-none focus:border-copper-500"
              />
            </label>
            <label className="block">
              <span className="text-[10px] tracking-[0.3em] uppercase text-sand-400">生年月日 *</span>
              <input
                type="date"
                value={partnerBirth}
                onChange={(e) => setPartnerBirth(e.target.value)}
                className="mt-1 w-full rounded-md border border-copper-500/30 px-3 py-2 bg-midnight-800/50 backdrop-blur-sm text-sm focus:outline-none focus:border-copper-500"
              />
            </label>
            <fieldset>
              <legend className="text-[10px] tracking-[0.3em] uppercase text-sand-400 mb-2">性別 *</legend>
              <div className="flex gap-3">
                <label className="flex items-center gap-1 text-sm">
                  <input type="radio" checked={partnerGender === "male"} onChange={() => setPartnerGender("male")} />
                  男性
                </label>
                <label className="flex items-center gap-1 text-sm">
                  <input type="radio" checked={partnerGender === "female"} onChange={() => setPartnerGender("female")} />
                  女性
                </label>
              </div>
            </fieldset>
          </div>
        )}

        <button
          onClick={startNew}
          className="mt-5 rounded-md bg-kachi-fade text-sand-50 font-display text-base px-6 py-2.5 hover:bg-midnight-700 border border-copper-500"
        >
          新規スレッド開始
        </button>
      </section>

      {/* スレッドリスト */}
      {threads.length > 0 && (
        <section className="rounded-2xl bg-midnight-800/50 backdrop-blur-sm border border-copper-500/20 p-5">
          <div className="text-[10px] tracking-[0.3em] uppercase text-copper-300 mb-3">
            Threads ／ 履歴 ({threads.length})
          </div>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {threads.map((t) => (
              <div
                key={t.id}
                className={`flex items-center gap-2 rounded-md px-3 py-2 cursor-pointer transition-colors ${
                  activeId === t.id ? "bg-copper-500/10 border border-copper-400" : "hover:bg-midnight-800/40 border border-transparent"
                }`}
                onClick={() => setActiveId(t.id)}
              >
                <div className="text-lg">{CATEGORY_LABELS[t.category].emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate">{t.title}</div>
                  <div className="text-[10px] text-sand-500">
                    {t.messages.length}件 / {new Date(t.updatedAt).toLocaleString("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteThread(t.id);
                  }}
                  className="text-xs text-sand-500 hover:text-shu-700 px-2"
                >
                  削除
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* チャットエリア */}
      {active && (
        <section className="rounded-2xl bg-midnight-800/50 backdrop-blur-sm border border-copper-500/20 overflow-hidden">
          <div className="px-5 py-3 bg-midnight-700/60 backdrop-blur-sm border-b border-copper-500/30 flex items-baseline gap-3">
            <div className="text-2xl">{CATEGORY_LABELS[active.category].emoji}</div>
            <div className="flex-1 min-w-0">
              <div className="font-display text-base">{active.title}</div>
              {active.partner && (
                <div className="text-[10px] text-sand-400">
                  対象: {active.partner.name || "—"} / {active.partner.birth} / {active.partner.gender === "male" ? "男性" : "女性"}
                </div>
              )}
            </div>
          </div>

          <div ref={scrollRef} className="px-5 py-4 max-h-[60vh] overflow-y-auto space-y-4">
            {active.messages.map((m, i) => (
              <MessageBubble key={i} message={m} />
            ))}
            {streaming && streamText && (
              <MessageBubble
                message={{ role: "assistant", content: streamText, timestamp: "" }}
                streaming
              />
            )}
            {streaming && !streamText && (
              <div className="text-sm text-sand-500">⏳ 占い中…</div>
            )}
            {error && (
              <div className="rounded-md bg-shu-500/12 border border-shu-300 text-shu-700 text-sm p-3">
                エラー: {error}
              </div>
            )}
          </div>

          <div className="border-t border-copper-500/20 p-4 bg-midnight-800/40">
            {/* 添付画像のプレビュー */}
            {pendingImages.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {pendingImages.map((img, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={imageToDataUrl(img)}
                      alt=""
                      className="h-20 w-20 rounded-md border border-copper-500/30 object-cover"
                    />
                    <button
                      onClick={() => removePendingImage(idx)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-shu-500 text-white text-xs hover:bg-shu-600 shadow"
                      title="削除"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  sendMessage();
                }
              }}
              placeholder={
                pendingImages.length > 0
                  ? "画像について質問する（⌘/Ctrl + Enter で送信）"
                  : "質問を入力（⌘/Ctrl + Enter で送信）"
              }
              rows={3}
              disabled={streaming}
              className="w-full rounded-md border border-copper-500/30 px-3 py-2 bg-midnight-800/50 backdrop-blur-sm text-sm focus:outline-none focus:border-copper-500"
            />
            <div className="mt-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  multiple
                  className="hidden"
                  onChange={(e) => onPickImages(e.target.files)}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={streaming}
                  className="rounded-md border border-copper-500/30 px-3 py-2 text-sm hover:border-copper-500 disabled:opacity-30 flex items-center gap-1"
                  title="画像を添付（最大5MB/枚）"
                >
                  📎 <span className="hidden sm:inline">画像添付</span>
                </button>
                <span className="text-[10px] text-sand-500">
                  対応: JPG/PNG/WEBP/GIF・最大5MB/枚
                </span>
              </div>
              {streaming ? (
                <button
                  onClick={stopStream}
                  className="rounded-md bg-shu-500 text-white text-sm px-4 py-2 hover:bg-shu-600"
                >
                  停止
                </button>
              ) : (
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() && pendingImages.length === 0}
                  className="rounded-md bg-kachi-fade text-sand-50 font-display text-sm px-6 py-2 hover:bg-midnight-700 border border-copper-500 disabled:opacity-30"
                >
                  送信
                </button>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

// ==========================================================================
// プロフィールエクスポート（Claude.ai プロジェクト等で利用するため）
// ==========================================================================

function ProfileExport() {
  const [includeInstructions, setIncludeInstructions] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);

  const onCopy = async () => {
    try {
      await copyProfileMarkdown(includeInstructions);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      alert("コピーに失敗しました");
    }
  };

  const onDownload = () => {
    downloadProfileMarkdown(includeInstructions);
  };

  return (
    <section className="rounded-2xl bg-midnight-700/60 backdrop-blur-sm border border-copper-500/30 p-5 sm:p-6">
      <div className="flex items-baseline justify-between gap-2 mb-3 flex-wrap">
        <div>
          <div className="text-[10px] tracking-[0.3em] uppercase text-copper-300">
            Profile Export ／ プロフィール書き出し
          </div>
          <h3 className="font-display text-xl mt-1">
            Claude アプリで個人占術相談に使う
          </h3>
        </div>
      </div>

      <p className="text-sm text-sand-200 leading-relaxed">
        命式・大運・五格・九星・家族・当日のコズミック等を含む完全なプロフィールを
        <strong>Markdown 形式</strong>でエクスポートします。
        Claude.ai / Claude Desktop / Claude Mobile アプリの<strong>プロジェクト機能</strong>に
        添付すれば、いつでもどこでもあなた専用の占術相談ができます（音声入力含む）。
      </p>

      {/* オプション */}
      <label className="flex items-center gap-2 mt-4 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={includeInstructions}
          onChange={(e) => setIncludeInstructions(e.target.checked)}
          className="rounded"
        />
        <span>占い師としての回答スタイル指示も含める（推奨）</span>
      </label>

      {/* ボタン */}
      <div className="mt-5 flex flex-wrap gap-2">
        <button
          onClick={onCopy}
          className={`rounded-md px-4 py-2 text-sm font-medium border ${
            copied
              ? "bg-copper-500 text-white border-copper-500"
              : "bg-kachi-fade text-sand-50 border-copper-500 hover:bg-midnight-700"
          }`}
        >
          {copied ? "✓ コピー完了" : "📋 Markdown をコピー"}
        </button>
        <button
          onClick={onDownload}
          className="rounded-md bg-midnight-800/50 backdrop-blur-sm border border-copper-500/30 px-4 py-2 text-sm hover:border-copper-500"
        >
          💾 .md ファイルでダウンロード
        </button>
        <button
          onClick={() => setShowHowTo((s) => !s)}
          className="rounded-md border border-copper-500/30 px-4 py-2 text-sm hover:border-copper-500"
        >
          {showHowTo ? "使い方を閉じる" : "❓ 使い方を見る"}
        </button>
      </div>

      {/* 使い方 */}
      {showHowTo && (
        <div className="mt-5 space-y-4 border-t border-copper-500/30 pt-5">
          <HowToCard
            badge="A"
            title="Claude.ai のプロジェクトに使う（最推奨）"
            steps={[
              <>
                <a
                  href="https://claude.ai/"
                  target="_blank"
                  rel="noreferrer"
                  className="underline text-copper-300"
                >
                  claude.ai
                </a>{" "}
                を開いてサインイン（Pro/Team プラン推奨）
              </>,
              "サイドバーから「+ 新しいプロジェクト」を作成",
              "プロジェクト名を「占術プロフィール - しゅんすけ」など命名",
              "上の「.md ファイルでダウンロード」を押し、生成された .md を「プロジェクト知識」にアップロード",
              "そのプロジェクト内で会話を開始すると、Claude は常にあなたの命式を参照して回答する",
            ]}
            note="プロジェクト機能は Claude.ai Pro/Team 限定。Free プランの場合は B の方法で。"
          />

          <HowToCard
            badge="B"
            title="Claude.ai / Desktop / Mobile で会話冒頭に貼り付け"
            steps={[
              "上の「Markdown をコピー」を押す",
              "Claude.ai (web/desktop/mobile) で新しい会話を開く",
              "最初のメッセージにペースト → 送信",
              "Claude が「了解しました」と応答したら、続けて自由に質問",
            ]}
            note="毎回の会話冒頭に貼る必要があるが、無料プランでも使える。Mobile アプリではコピー/ペーストが楽。"
          />

          <HowToCard
            badge="C"
            title="Claude モバイルアプリで音声相談"
            steps={[
              "B の方法でプロフィールを最初のメッセージに貼り付け",
              "Claude モバイルアプリの音声入力ボタン🎤を押して話しかける",
              "「日主丙申から見て、今の悩みについて教えて」など自由に",
              "歩きながら・運転中（停車時）・寝る前にも相談可能",
            ]}
          />

          <HowToCard
            badge="D"
            title="Claude Desktop で常時アシスタント化"
            steps={[
              "Claude Desktop で新規プロジェクト作成",
              "Markdown を「プロジェクト知識」として添付",
              "ピン留めしておけば、デスクトップ作業中いつでも呼び出せる",
            ]}
          />

          <div className="rounded-md bg-shu-500/12 border border-shu-200 p-3 text-xs text-sand-200">
            ⚠️ プロフィールには生年月日・出生地・家族情報など個人情報が含まれます。
            共有 PC やパブリックなプロジェクトには載せないよう注意してください。
          </div>
        </div>
      )}
    </section>
  );
}

function HowToCard({
  badge,
  title,
  steps,
  note,
}: {
  badge: string;
  title: string;
  steps: React.ReactNode[];
  note?: string;
}) {
  return (
    <article className="rounded-lg bg-midnight-800/50 backdrop-blur-sm border border-copper-500/20 p-4">
      <div className="flex items-baseline gap-3 mb-2">
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-copper-500 text-white text-sm font-display">
          {badge}
        </span>
        <h4 className="font-display text-base">{title}</h4>
      </div>
      <ol className="ml-10 list-decimal text-sm text-sand-200 space-y-1">
        {steps.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ol>
      {note && <p className="ml-10 mt-2 text-xs text-sand-400">{note}</p>}
    </article>
  );
}

function MessageBubble({
  message,
  streaming,
}: {
  message: ChatMessage;
  streaming?: boolean;
}) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[88%] rounded-lg px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? "bg-kachi-fade text-sand-50"
            : "bg-midnight-700/60 backdrop-blur-sm border border-copper-500/30 text-sand-100"
        }`}
      >
        {/* 添付画像 */}
        {message.images && message.images.length > 0 && (
          <div className={`flex flex-wrap gap-2 ${message.content ? "mb-3" : ""}`}>
            {message.images.map((img, i) => (
              <img
                key={i}
                src={imageToDataUrl(img)}
                alt=""
                className="max-h-48 rounded-md border border-copper-500/30 cursor-pointer hover:opacity-90"
                onClick={() => {
                  const w = window.open();
                  if (w) {
                    w.document.write(
                      `<img src="${imageToDataUrl(img)}" style="max-width:100%;height:auto;">`
                    );
                  }
                }}
              />
            ))}
          </div>
        )}
        {message.content}
        {streaming && <span className="inline-block w-2 h-4 bg-copper-500 align-middle animate-pulse ml-1"></span>}
      </div>
    </div>
  );
}

// ==========================================================================
// コズミックパネル（天文・節気・月相）
// ==========================================================================

