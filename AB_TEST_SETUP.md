# 47Connect LP A/Bテスト 設置手順

**作成日**: 2026-05-01
**対象**: from-to-inc/47connect-lp リポジトリ
**目的**: index.html (A版) と index-b.html (B版) を50/50ランダムで振り分け、効果計測する

---

## ファイル構成

```
47connect-lp/
├── index.html        ← A版（既存・コンシェルジュ訴求）
├── index-b.html      ← B版（新規・AI参謀 / β版特別キャンペーン / 最上位Claude訴求）
├── ab-split.js       ← A/B振り分けスクリプト（共通）
├── images/           ← 画像素材（共通利用）
└── AB_TEST_SETUP.md  ← 本書
```

---

## 設置手順

### Step 1: A版（index.html）にスクリプトタグを追加する

`<head>` 内、Google tag (gtag) の `</script>` 直後に **以下の1行** を追加：

```html
<!-- A/B Split Router -->
<script src="ab-split.js"></script>
```

設置位置の例：
```html
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-5YLJ2SZ9ZR');
</script>
<script src="ab-split.js"></script>   <!-- ← この1行を追加 -->
```

### Step 2: B版（index-b.html）はすでに設置済

B版にはすでに `<script src="ab-split.js"></script>` を組み込んであります。
GA4タグでは `ab_variant: 'B'` カスタムディメンションも送信されます。

---

## 動作仕様

### URLパターン

| 訪問URL | 動作 |
|---|---|
| `/` または `/index.html` | 50/50 ランダム振り分け（初回） / 過去訪問者は固定 |
| `/?v=a` または `/index.html?v=a` | A版を強制表示 |
| `/?v=b` または `/index.html?v=b` | B版（index-b.html）へリダイレクト |
| `/index-b.html` | B版を直接表示 |
| `/index-b.html?v=a` | A版（index.html）へリダイレクト |

### 振り分けロジック

1. **強制クエリ優先**: `?v=a` / `?v=b` が指定されていれば、そのまま該当版
2. **固定保持**: 一度振り分けされた訪問者は localStorage で固定（同一ユーザーは同じ版を見続ける）
3. **ランダム**: 初回訪問は50/50ランダム
4. **ボット除外**: SEO/プレビュークローラー（GoogleBot / Slack / Twitter / LinkedIn / WhatsApp 等）はA版固定

### GA4 計測

`ab_assignment` イベントが各セッションで送信され、以下のパラメータが付与されます：

- `ab_variant`: 'a' or 'b'
- `ab_forced`: 強制クエリで来たかどうか
- `ab_returning`: 過去に振り分けされたユーザーか

GA4 のレポートで `ab_variant` を ディメンションとして使い、
申込フォームクリック率（`gtag('event', 'click', {label: '...'})`）等を比較してください。

---

## 計測指標（推奨）

| 指標 | 計測方法 |
|---|---|
| 流入比率（A/B） | GA4 `ab_assignment` イベント |
| 申込フォームクリック率 | GA4 リンク `outbound click` イベント |
| 滞在時間 | GA4 `engagement_time_msec` |
| セクション到達率 | GA4 `scroll_depth` イベント（25/50/75/100%） |
| β版特別キャンペーン応募数 | Google Forms 回答ログ + UTMパラメータ |

---

## 期間と判定

| 項目 | 推奨 |
|---|---|
| テスト期間 | 最低 **2週間**（または流入500セッション以上） |
| 統計検定 | 95%信頼区間で有意差を検定 |
| 中止条件 | β版特別キャンペーンが20社満了した時点で振り分けを停止し、優位な版に統一 |

---

## オプトアウト方法

特定の利用者にA版（または B版）を強制表示する場合は、URLに `?v=a` または `?v=b` を付けて共有してください。

例：
- 営業現場で B版を見せたい → `https://from-to-inc.github.io/47connect-lp/?v=b`
- 既存顧客にはA版継続 → `https://from-to-inc.github.io/47connect-lp/?v=a`

---

## ロールバック

振り分けを止めて A版に統一したい場合は、`index.html` の `<script src="ab-split.js"></script>` を削除（コメントアウト）するだけ。
B版は `index-b.html` として残るので、必要時に直接URLを共有可能。

---

## トラブルシューティング

| 症状 | 対処 |
|---|---|
| B版に行かない | localStorage を消去（DevToolsで `localStorage.removeItem('fromto_ab_variant')`）or Cookieシークレットモード |
| 無限リダイレクト | ab-split.js のファイル名・パスを確認。リダイレクトループ防止ロジックは組み込み済 |
| GA4にデータが来ない | gtag 設定 `G-5YLJ2SZ9ZR` の確認 + 実機で「ネットワーク」タブで `collect?v=2` の送信を確認 |

---

## 関連資料

- B版コピーの議論経緯: [47Connect_LP_B案_ROI時間優位性主軸_20260429.md](../04_マーケティング_CMO/作業/価値訴求/47Connect_LP_B案_ROI時間優位性主軸_20260429.md)
- ヒーロー画像 デザインブリーフ: [B版_ヒーロー画像_デザインブリーフ_20260501.md](../04_マーケティング_CMO/作業/価値訴求/B版_ヒーロー画像_デザインブリーフ_20260501.md)
