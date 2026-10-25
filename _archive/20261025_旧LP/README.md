# 旧 LP（2026-10-25 に新しい LP へ入れ替える前の版）

- `index.html` … 入れ替え前の公開中 LP（lp.47connect.jp）
- `roi-simulator.html` … 入れ替え前の ROI シミュレーター
- この `_archive/` は GitHub Pages（Jekyll）が配信しないフォルダです（`_` で始まるため）。公開サイトには出ません。
- 画像は `../../images/` の旧ファイルを参照します（このフォルダ単体では表示できません）。

## 元に戻す手順
1. 入れ替え直前の状態には git の目印（タグ）`lp-before-20261025` が付いています（main の 19b8ac8）。
2. 新しいブランチを切り、次を実行します。

       git checkout lp-before-20261025 -- index.html roi-simulator.html

3. 画像は新旧とも `images/` に残してあるので、そのまま表示できます。
4. PR を作り、main へマージすると、lp.47connect.jp が旧 LP に戻ります（Pages の再ビルドに数分）。
