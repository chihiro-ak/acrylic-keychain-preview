# Acrylic Keychain Preview

アクリルキーホルダーの 3D 商品プレビューです。  
GitHub Pages でそのまま公開できる静的構成で、`root` と `docs` の両方に同じビルド成果物を出します。

## Features

- three.js ベースの静的 3D プレビュー
- 正面寄りで絵柄を読みやすくしつつ、少しだけ厚みが見える角度
- アクリルの透明感、厚み、反射差を出す `MeshPhysicalMaterial`
- 金具込みの完成モデル表示
- 商品写真寄りの単色背景とごく薄い接地影

## Local Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

中間成果物は `.site-build/`、公開用の成果物は `index.html` と `assets/`、加えて `docs/` にも出力されます。

## GitHub Pages

- Branch: `main`
- Folder: `/ (root)` または `/docs`

どちらの設定でも同じ静的ファイルが配信される構成です。

## Recent Visual Tuning

- カメラとモデル角度を「正面寄りのまま少しだけ斜め」に調整
- アクリル材の `transmission`, `thickness`, `ior`, `clearcoat` を見直し
- PMREM ベースの環境反射を維持しつつ、側面シェルの反射を少し強化
- `ShadowMaterial` と薄い補助影で接地感を追加
- 背景をクリーンなグレー単色へ整理

## Assets

- `public/assets/1_3_keychain_final.glb`
- `public/assets/1_3_print_rgba.png`
- `public/assets/1_3_white_rgba.png`
