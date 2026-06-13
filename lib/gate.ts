// アクセスゲート — 吉田駿成専用クローズドサイト
//
// 設計:
// - パスフレーズを SHA-256 ハッシュとしてコード内に保持
// - 入力を同じハッシュに通して照合 (平文での比較なし)
// - 一度成功したら localStorage に成功フラグを保存 (再入力不要)
// - フラグは「ハッシュ値」を保存することで、コード側のハッシュが
//   変わると自動で再認証を要求 (パスフレーズ変更時の運用)
// - サーバー側で本気の保護をするものではなく、casual visitor を
//   遠ざける目的の「私的占断サイトの玄関ベル」
//
// パスフレーズの変更手順:
//   1. 新しいパスフレーズを決める
//   2. ブラウザの DevTools Console で次を実行:
//        await crypto.subtle.digest("SHA-256", new TextEncoder().encode("新パスフレーズ"))
//          .then(b => Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,"0")).join(""))
//   3. 出力されたハッシュを下記 UNLOCK_HASH に貼り付け
//   4. localStorage.removeItem("uranai-unlock") で既存ユーザーは再認証
//
// 現在のパスフレーズ: "yoshida7847" (2026-06 にオーナーが変更)
// (ハッシュ変更により、既存の解錠フラグは自動失効し全端末で再認証が必要)

export const UNLOCK_HASH =
  "5fba87e626891a495d1a4bfdbf3d0df74ef236ae40987a6121a00dbe8a39aa74";

const STORAGE_KEY = "uranai-unlock";

// Web Crypto API で SHA-256
export async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf))
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
}

export async function verifyPassphrase(input: string): Promise<boolean> {
  if (!input) return false;
  const h = await sha256Hex(input.trim());
  return h === UNLOCK_HASH;
}

export function readUnlockState(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === UNLOCK_HASH;
  } catch {
    return false;
  }
}

export function persistUnlock(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, UNLOCK_HASH);
  } catch {
    /* ignore */
  }
}

export function clearUnlock(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
