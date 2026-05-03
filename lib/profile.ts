// プロフィール（個人利用・localStorage 保存）
// クローズドな個人サイトで毎回入力するのを省くための仕組み。
// データはブラウザのみに保存し、サーバーには送信しない。

const KEY = "uranai.profile.v1";

export type Profile = {
  displayName: string; // "よしだ" などの呼び名
  birth: string;        // YYYY-MM-DD
  gender: "male" | "female";
  hour: number | null;  // 0-23 or null
  nameRoman: string;    // ローマ字氏名
};

export const DEFAULT_PROFILE: Profile = {
  displayName: "Yoshida",
  birth: "",
  gender: "male",
  hour: null,
  nameRoman: "",
};

export function loadProfile(): Profile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as Profile;
    if (!p.birth) return null;
    return { ...DEFAULT_PROFILE, ...p };
  } catch {
    return null;
  }
}

export function saveProfile(p: Profile) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(p));
}

export function clearProfile() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}
