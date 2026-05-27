# 吉田駿成 × 他者の相性算出 — データ配布

このディレクトリには、吉田駿成氏の全占断値と、それを使って他者との相互相性を計算するためのルール集が含まれています。

## ファイル一覧

| ファイル | 用途 |
|---|---|
| `yoshida-profile.json` | 吉田氏の確定プロファイル (5.2 KB)。命式・大運・九星・本命卦・数秘・MBTI・バースカード・姓名判断・家族プロファイル全部入り |
| `compat-rules.json` | 相性算出ルール集 (18 KB)。6 軸のスコア表とテーブル一覧 |
| `ALGORITHMS.md` / `algorithms.json` | 全占断アルゴリズム仕様 |

## クイックスタート (Node.js)

```bash
# 任意の相手の生年月日 (1990-06-15 男性 ENFP の場合) で相性を計算
npx tsx scripts/compat-with-yoshida.ts 1990-06-15 male サンプル太郎 ENFP
```

出力例:
```
────────────────────────────────────────────────
  吉田駿成 × サンプル太郎 相性鑑定
────────────────────────────────────────────────

【相手プロファイル】
  生年月日: 1990-06-15
  日干 / 年支: 癸 / 午
  九星本命: 1
  太陽星座: gemini
  ライフパス: 4

【軸別スコア】
  ★★★★☆ (w=1.0)  通変星 (戊→癸=正財)
  ★★☆☆☆ (w=1.0)  年支 (子×午=沖)
  ★★★☆☆ (w=0.8)  九星 (7×1=洩気)
  ★★☆☆☆ (w=0.6)  星座 (taurus×gemini)
  ★★★★☆ (w=0.7)  LP (11×4)
  ★★★★★ (w=0.8)  MBTI (INFJ×ENFP=best)

  総合相性: ★★★☆☆ (3.3 / 5)
```

## 6 軸スコアリングモデル

`compat-rules.json` の `scoringAxes` に定義。

| ID | 重み | 何を見るか |
|---|---|---|
| `shichu.dayMaster` | 1.0 | 日干同士の通変星 (戊 → 相手) |
| `shichu.yearBranch` | 1.0 | 年支 (子) と相手の年支の干支関係 |
| `kyusei.honmei` | 0.8 | 九星 (7) と相手の本命星の五行関係 |
| `astrology.sun` | 0.6 | 太陽星座 (taurus) のアスペクト |
| `numerology.lifePath` | 0.7 | LP 11 と相手の LP の組合せ |
| `mbti` | 0.8 | INFJ と相手のタイプ (任意) |

総合 = Σ(score × weight) / Σ(weight)

## 自分で計算する場合 (純粋なルール参照)

`compat-rules.json` 内のテーブルだけで完結します:

### 1. 相手の日干を出す → 通変星
- 生年月日から日干 (`yoshida-profile.json` の `shichu` 参照アルゴリズム or `algorithms.json` を見て計算)
- `compat-rules.json` の `tables.tongbianStar.tableForYoshida戊` で吉田から見た通変星を引く
- `tables.tongbianScore.general[通変星]` でスコア

### 2. 相手の年支を出す → 干支関係
- 立春 (2/4) 前なら前年扱い
- `compat-rules.json` の `tables.branchInteraction.tableForYoshida子` で関係を引く

### 3. 相手の九星本命星
- 計算: `sum = 西暦の各桁を 1 桁まで足す; h = 11 - sum`
- `compat-rules.json` の `tables.kyuseiRelation.tableForYoshida7` でスコア

### 4. 相手の太陽星座
- `compat-rules.json` の `tables.zodiacCompat.tableForYoshidaTaurus` でスコア

### 5. 相手のライフパス
- 計算: 生年月日の全数字を 1 桁になるまで足す (11/22/33 はマスター数として保持)
- `compat-rules.json` の `tables.lifePathCompat.tableForYoshida11` でスコア

### 6. 相手の MBTI (任意・本人テストか観察)
- `compat-rules.json` の `tables.mbtiCompat.tableForYoshidaINFJ` でスコア

## 個別の確定キー (吉田氏)

```json
{
  "dayStem": "戊",
  "dayBranch": "申",
  "yearBranch": "子",
  "honmei": 7,
  "sunSign": "taurus",
  "lifePath": 11,
  "kua": 6,
  "mbti": "INFJ",
  "birthCardPersonality": 11,
  "birthCardSoul": 2
}
```

## 既知の家族との相性 (参考)

| 関係 | 生年月日 | 日干 | 年支 | 九星 | 星座 | LP | 推定 MBTI | 総合 |
|---|---|---|---|---|---|---|---|---|
| 妻 | 1969-12-21 | 壬 (偏財) | 酉 (なし) | 4 (相剋) | 射手 (クインカンクス) | 4 | ENFJ (good) | 3.3 ★★★ |
| 子 | 2011-11-03 | — | 卯 (刑) | 7 (比和) | 蠍 (対向) | 9 | 不明 | 3.5+ |

## 参考: ライセンス / 出典

データは吉田駿成氏個人の占断結果のみを含み、外部に公開する意図はありません。
個人利用・自己分析・家族や友人との相性確認にお使いください。
