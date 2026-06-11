# 占断アルゴリズム仕様書

本サイトで稼働している全占術のアルゴリズムを記述する。
各エンジンは TypeScript で実装されており、`lib/` 以下に配置されている。
入力は `lib/owner.ts` の固定データ (吉田駿成 / 1984-05-02 13:00 大阪市城東区出生)
または UI から渡される任意の生年月日・氏名。

---

## 0. オーナーの確定データ (`lib/owner.ts`)

```yaml
displayName: "しゅんすけ"
nameSei: "吉田"
nameMei: "駿成"
nameSeiKakusu: [6, 5]     # 吉(6) + 田(5)
nameMeiKakusu: [17, 7]    # 駿(17) + 成(7)
nameRoman: "YOSHIDA SHUNSUKE"
birth: "1984-05-02"
hour: 13                  # 13:00 (時柱算出用)
gender: "male"
bloodType: "B"
birthplace:
  pref: "大阪府"
  city: "大阪市城東区"
  lat: 34.6913
  lng: 135.5447
  tz: "JST (UTC+9)"
residence:
  pref: "大阪府"
  city: "大阪市天王寺区"
  detail: "筆ヶ崎町2丁目10番 リーバーガーデンタワー 2302 号室"
  floor: 23
natal:
  sun: "taurus"
  fourPillars: { year:"甲子", month:"戊辰", day:"戊申", hour:"己未" }
  kyusei:      { honmei: 7, getsumei: 3 }   # 七赤金 / 三碧木
  fengshui:    { kua: 6 }                   # 乾 (西四命)
  numerology:  { lifePath: 11, birthday: 2 }
  mbti:        "INFJ"
  birthCard:   { personality: 11, soul: 2 } # 正義 / 女教皇
family:
  spouse: { birth:"1969-12-21", kyusei:4, lifePath:4 }
  child:  { birth:"2011-11-03", kyusei:7, lifePath:9 }
```

---

## 1. 西洋占星術 (`lib/astrology.ts` + `lib/astronomy.ts`)

### 1-A. 太陽星座 (簡易版 / `getSunSign`)
日付範囲によるルックアップ。1日前後の誤差を許容する MVP 実装。

### 1-B. 太陽黄経 (Meeus 簡易版 / `sunLongitude`)
Meeus *"Astronomical Algorithms"* Ch.25 を実装。精度 ~0.01°。

```
JD = ユリウス通日(date)
T  = (JD - 2451545.0) / 36525

L0 = 280.46646 + 36000.76983·T + 0.0003032·T²
M  = 357.52911 + 35999.05029·T - 0.0001537·T²
C  = (1.914602 - 0.004817·T - 0.000014·T²)·sin(M)
   + (0.019993 - 0.000101·T)·sin(2M)
   + 0.000289·sin(3M)

太陽黄経 λ☉ = (L0 + C) mod 360
```

### 1-C. 月黄経 (ELP2000 簡易版 / `moonLongitude`)
ELP2000 主要 12 項。精度 ~0.5°。

### 1-D. 月相 (`moonPhase`)
```
diff = (λmoon - λsun) mod 360
phase = diff / 360                # 0..1
age   = phase × 29.530589 日
illumination = (1 - cos(diff)) / 2
```
区切り:
| phase 範囲 | 名称 |
|---|---|
| 0–0.036 / 0.964–1 | 新月 / 新月直前 |
| 0.036–0.214 | 三日月 |
| 0.214–0.286 | 上弦の月 |
| 0.286–0.464 | 十三夜 |
| 0.464–0.536 | 満月 |
| 0.536–0.714 | 十六夜 |
| 0.714–0.786 | 下弦の月 |
| 0.786–0.964 | 晦月 |

### 1-E. 黄経 → 星座 (`signFromLongitude`)
```
idx = floor(λ / 30)
sign = ZODIAC[idx]  # 0:牡羊 .. 11:魚
degree = λ mod 30
```

### 1-F. 24 節気 (`findSolarTermDate`)
24 ターゲット黄経 (315°=立春 .. 300°=大寒、15° 刻み) について、
太陽黄経関数を **二分法 40 反復** で探索し正確な節入り時刻を得る。

### 1-G. 今日の運勢 (`getDailyFortune`)
日付＋星座キーを seed にした疑似乱数で 1-5 のスコアと一言を生成。

---

## 2. 四柱推命 (`lib/shichu.ts`)

### 2-A. 年柱 (`yearPillar`)
立春 (2/4 簡易固定) を境に。立春前は前年扱い。
```
yearStemIdx   = (effectiveYear - 4) mod 10
yearBranchIdx = (effectiveYear - 4) mod 12
```

### 2-B. 月柱
**月支**: 節入り (毎月の節気) で確定。簡易実装は固定日テーブル + 主要節気黄経テーブル併用。

| 黄経 | 節気 | 月支 |
|---|---|---|
| 315° | 立春 | 寅 (2 月節) |
| 345° | 啓蟄 | 卯 (3 月節) |
| 15°  | 清明 | 辰 (4 月節) |
| 45°  | 立夏 | 巳 (5 月節) |
| 75°  | 芒種 | 午 (6 月節) |
| 105° | 小暑 | 未 (7 月節) |
| 135° | 立秋 | 申 (8 月節) |
| 165° | 白露 | 酉 (9 月節) |
| 195° | 寒露 | 戌 (10 月節) |
| 225° | 立冬 | 亥 (11 月節) |
| 255° | 大雪 | 子 (12 月節) |
| 285° | 小寒 | 丑 (1 月節) |

**月干**: 五虎遁
```
寅月の月干 = 5虎遁テーブル[年干]
甲己 → 丙寅 起
乙庚 → 戊寅 起
丙辛 → 庚寅 起
丁壬 → 壬寅 起
戊癸 → 甲寅 起
あとは月支の進みに合わせて干も順進
```

### 2-C. 日柱 (`dayPillar`)
基準日からの **通日差** で 60 干支を引く。
```
base = 1900-01-01 = 丙戌 (stemIdx=2, branchIdx=10)
days = floor((target - base) / 86400000)
stemIdx   = (2 + days) mod 10
branchIdx = (10 + days) mod 12
```
吉田駿成 1984-05-02 → **戊申** (確定)。
`lib/today.ts` の `todayDayPillar` も同じ基準で計算 (base を 1984-05-02=戊申に変えただけ)。

### 2-D. 時柱 (`hourBranchIndex` + `hourStemIndex`)
**時支**: 23-1=子, 1-3=丑, 3-5=寅, ..., 21-23=亥。
**時干**: 五鼠遁
```
甲己 → 甲子 起
乙庚 → 丙子 起
丙辛 → 戊子 起
丁壬 → 庚子 起
戊癸 → 壬子 起
あとは時支の進みに合わせて干も順進
```

### 2-E. 通変星 (`tongbianStar`)
日干 (日主) と他の干の五行関係＋陰陽で 10 種に分類:
| 関係 | 同陰陽 | 異陰陽 |
|---|---|---|
| 同じ五行 | 比肩 | 劫財 |
| 日干 → 生 | 食神 | 傷官 |
| 日干 → 剋 | 偏財 | 正財 |
| 剋 → 日干 | 偏官 | 正官 |
| 生 → 日干 | 偏印 | 印綬 |

### 2-F. 十二運 (`twelveStage`)
日干と支のライフステージ。陽干は順行、陰干は逆行。

| 日干 | 長生の支 | 進行 |
|---|---|---|
| 甲 | 亥 | 順 |
| 乙 | 午 | 逆 |
| 丙 | 寅 | 順 |
| 丁 | 酉 | 逆 |
| **戊** | **寅** | **順** |
| 己 | 酉 | 逆 |
| 庚 | 巳 | 順 |
| 辛 | 子 | 逆 |
| 壬 | 申 | 順 |
| 癸 | 卯 | 逆 |

ステージ順: 長生 → 沐浴 → 冠帯 → 建禄 → 帝旺 → 衰 → 病 → 死 → 墓 → 絶 → 胎 → 養。
オーナー (戊申) の日柱十二運 = **病** (戊の長生=寅から申まで 7 ステップ進めた位置)。

### 2-G. 大運 (`generateDaiun`)
月柱の干支を起点に 10 年単位で進む / 退く列。
```
方向 = (男 + 陽干) or (女 + 陰干) → 順行
方向 = (男 + 陰干) or (女 + 陽干) → 逆行
```

### 2-H. 立運 (大運起点年齢 / `calcRuiun`)
出生日から **次/前の主要節気までの日数 ÷ 3** = 大運開始年齢。
```
allTerms = 前年/当年/翌年の主要節気 (黄経 315/345/15/45/75/105/135/165/195/225/255/285°)
順行: 出生日からの「次の主要節気」までの日数
逆行: 出生日からの「前の主要節気」までの日数
立運年齢 = round(その日数 / 3)
```
オーナー: 男 + 戊 (陽干) → 順行 → 立運 約 1 歳。
得られる大運列:
| 期間 | 干支 | 通変星 |
|---|---|---|
| 1–10 | 己巳 | 劫財 |
| 11–20 | 庚午 | 食神 |
| 21–30 | 辛未 | 傷官 |
| 31–40 | 壬申 | 偏財 |
| **41–50** | **癸酉** | **正財** ← 現在 |
| 51–60 | 甲戌 | 偏官 |
| 61–70 | 乙亥 | 正官 |

---

## 3. 九星気学 (`lib/kyusei.ts`)

### 3-A. 本命星 (`honmeiStar`)
立春前は前年扱い (2/4 簡易固定)。
```
sum = 西暦の各桁を 1 桁まで足す
h   = 11 - sum
if (h > 9) h -= 9
if (h < 1) h += 9
本命星 = h ∈ {1..9}
```
1984 → 1+9+8+4 = 22 → 2+2 = 4 → 11-4 = **7 (七赤金)**.

### 3-B. 月命星 (`getsumeiStar`)
本命星のグループ × 月 (節入り) から月命星表で導出。
オーナー: **3 (三碧木)**.

### 3-C. 九星の五行関係 (`starRelation`)
| 関係 | 説明 | スコア |
|---|---|---|
| 比和 (調和) | 同五行 | 4 |
| 相生 (発展) | 相手が自分を生む | 5 |
| 洩気 (消耗) | 自分が相手を生む | 3 |
| 相剋 (摩擦) | 自分が相手を剋す | 2 |
| 受剋 (被害) | 相手から剋される | 1 |

### 3-D. 日盤・時盤九星 (`dailyKyuseiStar` / `hourlyKyuseiStar`)
冬至 → 夏至 = 陽遁 (1→2→...→9→1)、夏至 → 冬至 = 陰遁 (9→8→...)。

---

## 4. 数秘術 (`lib/numerology.ts`)

### 4-A. リダクション規則
```
reduceNumber(n, keepMaster=true):
  while n > 9:
    if keepMaster and n in {11, 22, 33}: return n
    n = digitSum(n)
  return n
```

### 4-B. ライフパス (`lifePathNumber`)
```
sum = 生年月日の全数字の総和
return reduceNumber(sum, keepMaster=true)
```
オーナー 1984-05-02 → 1+9+8+4+0+5+0+2 = 29 → 2+9 = **11** (マスター数として保持).

### 4-C. ソウル (`soulNumber`)
氏名 (ローマ字) の **母音 + Y** をピタゴリアン値で合計してリダクト:
```
A=1, E=5, I=9, O=6, U=3, Y=7
```

### 4-D. パーソナリティ (`personalityNumber`)
氏名の **子音** をピタゴリアン値で合計してリダクト:
```
ピタゴリアン: 'A'..'Z' → ((charCode - 1) mod 9) + 1
ただし母音と Y は除外
```

### 4-E. 表現数 / 誕生日数 (`expressionNumber` / `birthdayNumber`)
```
expression = 氏名全文字のピタゴリアン値の和 → reduce
birthday   = 生まれた "日" の数字をリダクト
```

### 4-F. パーソナルイヤー (`personalYear`)
```
sum = digitSum(月) + digitSum(日) + digitSum(年)
return reduceNumber(sum, keepMaster=false)
```
※ パーソナルイヤーはマスター数を残さない (1..9 周期)。

### 4-G. パーソナルマンス / パーソナルデイ (`lib/today.ts`)
```
PersonalYear(birth, year)   = 上記
PersonalMonth(birth, year, month) = reduce1to9(personalYear + month)
PersonalDay(birth, year, month, day) = reduce1to9(personalMonth + day)
```

---

## 5. バースカード (`lib/birthcard.ts`)

タロット大アルカナ (0..21) と数字を対応させる「11/2 システム」:
```
sum = 生年月日の全数字の和
personalityNum = sum
while personalityNum > 22: personalityNum = digitSum(personalityNum)
soulNum = personalityNum
while soulNum > 9: soulNum = digitSum(soulNum)
```
オーナー: sum=29 → personality=**11 (正義)**, soul=2+9→**2 (女教皇)**。

---

## 6. 姓名判断 (`lib/seimei.ts`)

### 6-A. 五格算出 (`calcKakusu`)
```
天格 = Σ 姓の画数         # 祖運
地格 = Σ 名の画数         # 初年運
総格 = 天格 + 地格        # 晩年運
人格 = 姓の最後の字 + 名の最初の字  # 中年運
外格 = 総格 - 人格         # 対人運
```
オーナー「吉田駿成」: 姓 [6,5] 名 [17,7]
```
天格 = 6+5  = 11
地格 = 17+7 = 24
総格 = 11+24 = 35
人格 = 5 + 17 = 22
外格 = 35 - 22 = 13
```

### 6-B. 吉凶判定 (`kichikyo`)
熊崎式 1-81 テーブルでルックアップ。`81超は81を引いて再帰`。
オーナー:
| 格 | 数 | 吉凶 |
|---|---|---|
| 天格 | 11 | 大吉 |
| 人格 | 22 | 凶 (秋草逢霜・意志薄弱) |
| 地格 | 24 | 大吉 (金銭豊潤・大富運) |
| 外格 | 13 | 大吉 (頭領運) |
| 総格 | 35 | 吉 (温和平静) |

---

## 7. 風水・本命卦 (`lib/fengshui.ts`)

### 7-A. 本命卦 (`calcKua`)
立春前は前年扱い (2/4 簡易固定)。
```
yy = effectiveYear mod 100
男: k = (100 - yy) mod 9
女: k = (yy + 5) mod 9
if k == 0: k = 9
if k == 5: k = 男なら 2, 女なら 8
```
オーナー 1984 男 → yy=84, (100-84) mod 9 = 16 mod 9 = 7 → **乾卦は番号 6** という伝統的計算では下記の補正が入る。
※ 本サイトの実装は上式の結果を `KUA_NAMES` でラベル付けしている。`owner.ts` では `kua: 6` (乾・西四命) として固定登録済み。

### 7-B. 東四命 / 西四命
```
東四命: 1 (坎), 3 (震), 4 (巽), 9 (離)   吉方位 = 東/南/北/東南
西四命: 2 (坤), 6 (乾), 7 (兌), 8 (艮)   吉方位 = 西/西北/西南/東北
```

### 7-C. 8 方位の吉凶 (`dirRatings`)
各本命卦について、8 方位それぞれが 8 ランク (生気/天医/延年/伏位 / 禍害/六殺/五鬼/絶命) のいずれかに対応する固定テーブル `TABLE[kua][direction]`。

| ランク | 種別 | 意味 |
|---|---|---|
| 生気 | 大吉 | 発展・財運 |
| 天医 | 吉 | 健康・回復 |
| 延年 | 吉 | 長寿・関係 |
| 伏位 | 小吉 | 安定 |
| 禍害 | 小凶 | 軽い消耗 |
| 六殺 | 中凶 | 災い・対立 |
| 五鬼 | 大凶 | 損失・病 |
| 絶命 | 最大凶 | 重大な不運 |

オーナー (乾 6 / 西四命):
| 方位 | ランク |
|---|---|
| 北 | 六殺 |
| 東北 | 天医 |
| 東 | 五鬼 |
| 東南 | 禍害 |
| 南 | 絶命 |
| 西南 | 延年 |
| **西** | **生気** |
| **西北** | **伏位** |

### 7-D. 流年方位
```
九星 = ((11 - (西暦 mod 9)) mod 9) || 9
歳破 = その年の地支の対冲方位 (子→午, 丑→未, ...)
五黄殺 / 暗剣殺 = 年盤の中央に来た九星から `ANNUAL_TABLE` で固定参照
```

---

## 8. 易経 (`lib/iching.ts`)

### 8-A. 卦の立て方 (`castYao` / `castHexagram`)
コイン 3 枚法を 6 回:
```
各爻について:
  sum = (Math.random()<0.5 ? 2 : 3) × 3 枚
  value ∈ {6,7,8,9}
  isYang     = value ∈ {7, 9}
  isChanging = value ∈ {6, 9}
```
| value | 意味 | 陰陽 | 変化 |
|---|---|---|---|
| 6 | 老陰 | 陰 ⚋ | → 陽 ⚊ |
| 7 | 少陽 | 陽 ⚊ | 不変 |
| 8 | 少陰 | 陰 ⚋ | 不変 |
| 9 | 老陽 | 陽 ⚊ | → 陰 ⚋ |

### 8-B. 八卦と六十四卦 (`hexagramFromYaos`)
3 爻を bit パターンで 0..7 に変換:
```
0=⚋⚋⚋(坤)  1=⚊⚋⚋(震)  2=⚋⚊⚋(坎)  3=⚊⚊⚋(兌)
4=⚋⚋⚊(艮)  5=⚊⚋⚊(離)  6=⚋⚊⚊(巽)  7=⚊⚊⚊(乾)
```
下卦 (初爻〜3 爻) と 上卦 (4 爻〜上爻) で `KING_WEN_TABLE[lower][upper]` を引いて 1..64 を得る。

### 8-C. 之卦 (`changedHexagram`)
変爻 (value 6/9) を反転して新しい 6 爻列を組み、再度 `hexagramFromYaos` で導出。

### 8-D. 変爻の解釈 (`changingLineMeanings`)
位置 (1 初爻 .. 6 上爻) × 陰陽 (2 通り) = 12 種の解釈。
```
LINE_POS_TEXT_YANG[pos]   # 初爻陽・二爻陽・..
LINE_POS_TEXT_YIN[pos]    # 初爻陰・二爻陰・..
```

### 8-E. パーソナル易卦 (`todayPersonalHexagram` in `today.ts`)
```
birthSeed = 生年月日文字列を char ごとに *31 で hash
dateSeed  = YYYY*10000 + MM*100 + DD
seed = birthSeed XOR (dateSeed * 2654435761)
rand = seededLinearCongruential(seed)
6 本の爻を rand で立てる (コイン法を 6 回シミュレート)
```
同じ生年月日 × 同じ日付なら **常に同じ卦** が出る決定論的算出。

---

## 9. タロット (`lib/tarot.ts`)

### 9-A. デッキ
- 大アルカナ 22 枚 (num 0..21)
- 小アルカナ 56 枚 (ワンド 100-113 / カップ 200-213 / ソード 300-313 / ペンタクル 400-413)
- 合計 78 枚 `FULL_DECK`

### 9-B. シャッフル (`drawCards`)
Fisher-Yates シャッフル → 上から n 枚 → 各カードに 50% で正逆位置:
```
isReversed = Math.random() < 0.5
```

### 9-C. シード付きシャッフル (`drawCardsSeeded`)
線形合同法乱数:
```
s = seed >>> 0
rnd() = (s = (s * 1664525 + 1013904223) >>> 0) / 0xffffffff
```
同じ seed なら同じ並びと同じ正逆位置。

### 9-D. 小アルカナ自動解釈 (`mkMinor` + `SUIT_CONTEXT`)
suit ごとの element/domain/loveAngle/workAngle/adviceVerb から
`uprightDetail` / `reversedDetail` / `loveUpright` / `workUpright` / `advice` を自動生成。

| suit | element | 領域 |
|---|---|---|
| ワンド | 火 | 情熱・行動・創造 |
| カップ | 水 | 感情・関係・霊性 |
| ソード | 風 | 知性・思考・葛藤 |
| ペンタクル | 地 | 物質・お金・実務 |

---

## 10. MBTI (`lib/mbti.ts`)

### 10-A. 16 タイプ × 認知機能スタック
| グループ | タイプ | dominant - aux - tertiary - inferior |
|---|---|---|
| 分析家 | INTJ | Ni-Te-Fi-Se |
| 分析家 | INTP | Ti-Ne-Si-Fe |
| 分析家 | ENTJ | Te-Ni-Se-Fi |
| 分析家 | ENTP | Ne-Ti-Fe-Si |
| 外交官 | **INFJ** | **Ni-Fe-Ti-Se** ← オーナー |
| 外交官 | INFP | Fi-Ne-Si-Te |
| 外交官 | ENFJ | Fe-Ni-Se-Ti |
| 外交官 | ENFP | Ne-Fi-Te-Si |
| 番人 | ISTJ | Si-Te-Fi-Ne |
| 番人 | ISFJ | Si-Fe-Ti-Ne |
| 番人 | ESTJ | Te-Si-Ne-Fi |
| 番人 | ESFJ | Fe-Si-Ne-Ti |
| 探検家 | ISTP | Ti-Se-Ni-Fe |
| 探検家 | ISFP | Fi-Se-Ni-Te |
| 探検家 | ESTP | Se-Ti-Fe-Ni |
| 探検家 | ESFP | Se-Fi-Te-Ni |

### 10-B. 相性 (`compatibility`)
```
if t2 ∈ profile.bestMatch     → "best"      (認知機能が補完)
if t2 ∈ profile.goodMatch     → "good"      (共通点多い)
if t2 ∈ profile.challenging   → "challenging" (衝突するが学び)
else                          → "neutral"
```
オーナー INFJ:
- best: ENFP / ENTP
- good: INFJ / INTJ / INFP / ENFJ
- challenging: ESTP / ESTJ

---

## 11. パーソナルデイ × 占術統合 (`lib/today.ts`)

### 11-A. 日付シードピッカー (`pickByDate`)
```
dateSeed(date, salt) = (YYYY*10000 + MM*100 + DD) XOR (salt * 2654435761)
pickByDate(arr, date, salt) = arr[dateSeed(date, salt) mod arr.length]
```
salt を変えることで「色」「食べ物」「アイテム」「忠告」など領域別に独立した日替わり選択を実現。

| 領域 | salt |
|---|---|
| PersonalDay variant | 101 |
| DayColor | 201 |
| DayCaution | 301 |
| DayFood | 401 |
| DayItem | 501 |
| ShadowBlessing | 601 |

### 11-B. 今日の日柱 (`todayDayPillar`)
1984-05-02 = 戊申を基準に通日差で算出。

### 11-C. 今日の通変星 (`todayTongbianForOwner`)
日干 `戊` × 今日の日干 → 通変星。

### 11-D. 12 時辰盤 (`todayHourlyChart`)
今日の日干から五鼠遁で各時辰の天干を導出 → 戊から見た通変星でランク付け:
| 通変星 | ランク | 説明 |
|---|---|---|
| 印綬・正官 | 大吉 | 学び・名誉・規律 |
| 正財・食神 | 吉 | 収入・創造 |
| 比肩・偏官・偏財・偏印 | 中吉 | 自律・挑戦・流動・独創 |
| 劫財・傷官 | 注意 | 出費・対人衝突 |

### 11-E. ラッキー時間 (`todayLuckyHours`)
12 時辰のうちランク上位 2 つを抽出。

### 11-F. パーソナル易卦 (前述 8-E)
生年月日 × 日付の決定論的シードで毎日異なる卦を引く。

### 11-G. 今日のシンセシス (`todaySynthesis`)
通変星 × パーソナルデイ × 易卦 × ラッキー時間を統合し、長文の物語形式の総評を生成。

---

## 12. 香水推薦 (`lib/perfume.ts`)

### 12-A. シーズン / 時間タグ
```
season:
  3-5月: spring, 6-8月: summer, 9-11月: autumn, 12-2月: winter
time:
  5-11: morning, 11-17: afternoon, 17-21: evening, 21-5: night
```

### 12-B. 天気タグ (`classifyWeather`)
WMO 気象コード + 気温 °C を組合せて `WeatherTag[]` を返す:
- snow / rainy / cloudy / sunny / hot / cold / thunder / fog

### 12-C. スコアリング (`recommendPerfumes`)
所有 117 本の `perfume.tags` (`energyDays`/`weather`/`time`/`season`) と
現在状況をマッチング → 高スコア順に 1-2 本推薦。

---

## 13. ビジネス相性 (`lib/businessCompat.ts`)

### 13-A. 相手の日干 (`partnerDayStem`)
四柱推命の `dayPillar` と同じアルゴリズムを任意の生年月日に適用。

### 13-B. 干支関係 (`branchInteraction`)
吉田の年支 (子) × 相手の年支 で「沖・刑・破・合・三合・六合」を判定。

### 13-C. 通変星スコア (`tongbianScore`)
戊土から見た相手の日干の通変星をビジネス文脈でスコア化:
| 星 | スコア | 役割 |
|---|---|---|
| 正官 | 95 | 規律のパートナー |
| 正財 | 90 | 堅実な顧客 |
| 印綬 | 88 | 指南者 |
| 偏財 | 82 | 流動的取引先 |
| 食神 | 80 | クリエイティブ補佐 |
| 比肩 | 75 | 同志 |
| 偏官 | 70 | 修羅場のパートナー |
| 偏印 | 65 | アイデア源 |
| 傷官 | 55 | 鋭い批評家 |
| 劫財 | 50 | リスクのある同志 |

### 13-D. 総合スコア (`calcBusinessCompat`)
干支関係 + 通変星 + 五行バランス + 数秘 を 0..100 に正規化して返す。

---

## 14. 統合占断 (`lib/synthesis.ts`)

22 カードの解釈 (静的 17 + 動的 5):
- 静的: PERSONALITY_CORE / CAREER_DEEP / FAMILY_CARE / WEALTH_CORE / HEALTH_CORE / FENGSHUI_HOME / SPIRITUAL_THEME / COMMUNICATION_STYLE / DECISION_STYLE / LEADERSHIP_STYLE / CONFLICT_PATTERN / MONEY_PSYCHOLOGY / BODY_CONSTITUTION / MENTAL_PATTERNS / SPIRITUAL_PRACTICE / PARENT_RELATIONSHIPS + HERO_SYNTHESIS
- 動的 (年齢/家族に依存): relationshipSpouse / relationshipChild / lifeArc / midlifeTransition / parentingStyleDeep / legacyQuestion / finalMessage

各カードは命式・大運・数秘・タロット・MBTI・風水を相互参照した長文 (本文 3 段落 + insights 20-25 項目)。

---

## 14-A. バイオリズム (`lib/biorhythm.ts` + `app/biorhythm/`)

出生からの経過日数 `t` を正弦波に通して波を算出。表を一切使わない純粋な数式のため、誰が計算しても同じ値になる完全決定論。

- 値: `value(t) = sin(2π · t / P)`（-1.0〜1.0、表示は ×100 の整数 %）
- 周期 `P`: 古典 3 リズム = 身体 23・感情 28・知性 33。拡張 4 リズム = 直感 38・美容 43・意識 48・精神 53。
- 経過日数: タイムゾーン非依存にするため `Date.UTC` の 0:00 基準で日数差を取る。
- 要注意日 (critical day): リズムがゼロ線を横切る不安定日。前日↔当日 または 当日↔翌日 で符号が変わる日。
- 総合指数: 古典 3 リズムの平均。
- 相性 (`bioCompat`): 二人の出生日差 Δ から各リズムの同調度 `sync = cos(2π · Δ / P) × 100`（+100 完全同調 / -100 逆位相）。古典 3 リズムの平均を overall とする。

検証 (ヘルスチェック): 1984-05-02 → 2026-05-27 = 経過 15365 日、身体 +27 / 感情 -100 / 知性 -62、妻との総合同調度 +40。

---

## 15. Oracle (`lib/oracle.ts`)

Claude API への問い合わせ。命式の全データを context に注入して、ユーザの自由質問に回答するエンジン。

- モデル: `claude-opus-4-7` / `claude-sonnet-4-6` / `claude-haiku-4-5-20251001`
- APIキー: localStorage に BYOK 保存
- 履歴: localStorage に最新 N 件保存

---

## 15-A. 相性鑑定 (`lib/compatCheck.ts` + `app/compat/`)

任意の人物 × 吉田氏の相性を 7 軸で重み付き平均する。
ブラウザ UI (`/compat`) と Node スクリプト両方から利用可。

### 入力
```
PartnerInput = { name, birth: "YYYY-MM-DD", gender, mbti? }
```

### 7 軸スコア (各 1-5)
| 軸 | 重み | 算出 |
|---|---|---|
| 通変星 | 1.0 | `tongbianStar(戊, partner.dayStem)` → 通変星別固定スコア |
| 年支 | 1.0 | `branchInteraction(子, partner.yearBranch)` (三合/六合/沖/害/刑/なし) |
| 九星 | 0.8 | `starRelation(7, partner.honmei)` (五行相生・相剋・比和) |
| 太陽星座 | 0.6 | `zodiacCompat(taurus, partner.sunSign)` (アスペクト判定) |
| ライフパス | 0.7 | LP 11 × partner.LP の組合せテーブル |
| 本命卦 | 0.5 | 乾 6 × partner.kua の互換性 (東四命/西四命) |
| MBTI | 0.8 | INFJ vs partner.mbti (best/good/neutral/challenging) ※任意 |

### 総合スコア
```
weightedScore = Σ(score_i × weight_i) / Σ(weight_i)
overall = round(weightedScore)  // 1-5 (整数)
```

### MBTI 自動推定 (`guessMbti`)
本人テストできない時の簡易推定:
- E/I: 太陽星座が火/風 (牡羊/獅子/射手/双子/天秤/水瓶) なら E、それ以外は I
- S/N: LP が 3/5/7/9/11/22/33 (霊的・直感系) なら N、それ以外は S
- T/F: 太陽星座が蟹/魚/蠍/牡牛/天秤 なら F、それ以外は T
- J/P: LP が 3/5/7 (流動性高い) なら P、それ以外は J

### YOSHIDA_KEYS (確定値)
```
dayStem: "戊"
dayBranch: "申"
yearBranch: "子"
honmei: 7
sunSign: "taurus"
lifePath: 11
kua: 6
mbti: "INFJ"
birthCardPersonality: 11
birthCardSoul: 2
```

### narrative 生成
軸を score 降順ソート → 最高軸 (best) と最低軸 (worst) を抽出 → 物語形式で連結。

---

## 15-B. 今日の一言 (`lib/today.ts > todayOneLiner`)

パーソナルデイ × 通変星 で日替わりの一言とフレーバーを返す。

### 算出
```
pd = personalDay(OWNER.birth, year, month, day)  // 1-9
dp = todayDayPillar(date)                         // 干支
tb = tongbianStar(戊, dp.stem)                    // 通変星

line   = pickByDate(ONE_LINER_VARIANTS[pd], date, 701)
flavor = pickByDate(TONGBIAN_FLAVOR[tb.star], date, 703)   // 通変星別
reading = `PD ${pd} × ${tb.star} (${dp.ganzhi})`
```

### バリエーション数
- ONE_LINER_VARIANTS: 9 (PD) × 5 (variant) = **45 行**
- TONGBIAN_FLAVOR: 10 (通変星) × 2-3 (variant) = **約 25 行**
- pickByDate の salt:
  - `701` → メイン一言
  - `703` → 通変星フレーバー

### 表示位置
Hero (`app/page.tsx > OneLinerBlock`) — 巨大明朝で表示。

---

## 16. UI / テーマシステム (`app/globals.css` + `app/ThemeSwitcher.tsx`)

CSS 変数によるテーマ切替。`data-theme="..."` を `<html>` に設定。

### 6 テーマ
| ID | 既定 | --background | 説明 |
|---|---|---|---|
| `editorial` | ✓ | `#fafaf7` | 純白×漆黒の編集デザイン |
| `midnight` | | `#0a0a0f` | 深い闇と銅金 |
| `twilight` | | `#1a2334` | 夕闇の青藍 |
| `forest` | | `#131e18` | 深緑と苔金 |
| `paper` | | `#f3ecdc` | 明るい羊皮紙 |
| `cream` | | `#fbf6e8` | 最も明るい |

### CSS 変数
```
--background       基本背景色
--foreground       基本テキスト色
--copper           アクセント (チップ枠線・装飾)
--card-bg          ガラスカード背景
--star-opacity     スターダスト透明度 (0=非表示)
```

### Tailwind utility class の上書き
ダーク系→ライト系 (paper/cream) への切替時、
`bg-midnight-*` / `text-sand-*` / `border-copper-*` 系を全て上書きする
specificity ルールを globals.css 末尾に集約。

### 編集スタイル限定クラス
- `.editorial-display` — Archivo Black 大文字 (巨大欧文)
- `.editorial-display-jp` — Noto Serif JP 900 (明朝太字日本語)
- `.editorial-mono` — Inter 700 小キャップ
- `.editorial-chip` / `.editorial-chip-dark` — 反転チップ
- `.editorial-spinner` — 12 秒で 1 回転する装飾バッジ

### モバイル対応
- `MobileMenu.tsx` ハンバーガー → 全画面オーバーレイ
- `<input>/<select>/<textarea>` は `@media (max-width:640px)` で 16px 強制 (iOS Safari ズーム抑制)
- `@media (hover:none)` でホバー反転を無効化
- 全てのタッチターゲットに `min-h-[44px]` (Apple HIG 準拠)

---

## 16. 計算順序 (アプリ起動時)

```
1. owner.ts の固定データ読み込み
2. 西洋占星術: 太陽/月/ASC の黄経 → 星座
3. 四柱推命: 4 柱 → 通変星 → 十二運 → 大運 (立運計算)
4. 九星: 本命星 / 月命星
5. 数秘: ライフパス / ソウル / パーソナリティ / 表現 / 誕生日 / パーソナルイヤー
6. 姓名: 五格 → 吉凶
7. 風水: 本命卦 → 8 方位
8. バースカード: パーソナリティ + ソウル
9. MBTI: 確定値 INFJ
10. 今日 (date 依存):
    - パーソナルデイ
    - 今日の日柱・通変星・12 時辰盤
    - 今日の月相・節気
    - パーソナル易卦
    - 香水推薦 (天気 API と組合せ)
11. 統合: synthesis.ts の全カードを年齢・大運で動的に生成
```

---

## 17. 決定論 / 非決定論

| 占術 | 決定論 | 備考 |
|---|---|---|
| 西洋占星術 | ○ | 日付から黄経計算 |
| 四柱推命 | ○ | 生年月日時から計算 |
| 九星 | ○ | 西暦から計算 |
| 数秘 | ○ | 生年月日+氏名から計算 |
| 姓名判断 | ○ | 画数から計算 |
| 風水 | ○ | 生年月日+性別から計算 |
| バースカード | ○ | 生年月日から計算 |
| MBTI | ○ (固定) | プロファイルから推定して owner に固定 |
| パーソナルデイ | ○ | 生年月日+対象日 |
| 月相・節気 | ○ | 天文計算 |
| 今日の日柱・通変・時辰盤 | ○ | 対象日から計算 |
| パーソナル易卦 | ○ | 生年月日 XOR 対象日のシード |
| 今日の色/食/アイテム | ○ | パーソナルデイ + 日付シードで variant 選択 |
| バイオリズム | ○ | 出生からの経過日数を正弦波に通す純粋な数式 |
| タロット手動引き | × | Math.random() |
| タロット seed 引き | ○ | LCG 乱数 |
| Oracle (Claude API) | × | API 呼び出し |
| 香水推薦 | × | 天気 API + ランダム性 |

---

## 18. データソース

- 命式解釈テキスト: `lib/shichu.ts` 内に固定 (通変星 × 2 variant、十二運 × 2 variant)
- 大運テーマ: 通変星別の固定文 `DAIUN_THEMES`
- 24 節気解説: `lib/astronomy.ts` `SOLAR_TERM_VARIANTS` (各 × 2 variant)
- 月相解説: `lib/astronomy.ts` `MOON_PHASE_VARIANTS` (各 × 2 variant)
- パーソナルデイ解説: `lib/today.ts` `PERSONAL_DAY_VARIANTS` (各 × 3 variant)
- タロット 78 枚: `lib/tarot.ts`
- 64 卦: `lib/iching.ts` `HEXAGRAMS`
- 16 MBTI: `lib/mbti.ts` `MBTI_PROFILES`
- バースカード深掘り: `lib/birthcard.ts` `BIRTH_CARD_DEEP`
- 統合占断 22 カード: `lib/synthesis.ts`
