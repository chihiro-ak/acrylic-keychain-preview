# Acrylic Keychain Preview

アクリルキーホルダーの立体感をブラウザ上で確認するための静的プレビューです。

## Features

- Three.js ベースの 3D プレビュー
- アクリルらしい透明感、ハイライト、接地影を強めた商品見せ
- 正面 / 斜め / 寄り のカメラ切り替え
- 自動回転の ON / OFF
- GitHub Pages に載せやすい相対パスビルド

## Local Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

生成物はリポジトリ root の `index.html` と `assets/` に反映されます。
中間生成物は `.site-build/` です。

## GitHub Pages

GitHub Pages では以下の設定で公開できます。

- Branch: `main`
- Folder: `/ (root)`

このリポジトリは root 配信前提で、Pages がそのまま読める完成済み静的ファイルを root に置く構成です。

## Assets

- `public/assets/1_3_keychain_3mm_puffy.glb`
- `public/assets/1_3_print_rgba.png`
- `public/assets/1_3_white_rgba.png`

## Notes

- `vite.config.js` で `base: "./"` にしているので、GitHub Pages 配下でも相対パスで動かしやすい構成です。
- Pages の公開設定や push は未実施です。
