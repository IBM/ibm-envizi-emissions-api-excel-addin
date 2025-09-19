# ibm-envizi-carbon-engine-excel-addin-internal
IBM Envizi - Carbon Engine Excel add-in


This is a custom Excel Add-in built using **TypeScript**, **Office.js**, and **Webpack**. It provides:

- Custom Functions using `@customfunction` annotations
- Task Pane UI for interactive features
- Token Dialog for authentication popups

---

## Key Folder Summary

- `src/functions/` – Excel custom functions 
- `src/taskpane/` – UI logic and token dialog popup
- `dist/` – Webpack output folder 
- `manifest.xml` – Office Add-in manifest file
- `webpack.config.js` – Build & dev server config
- `babel.config.json` + `tsconfig.json` – Transpiler configs

---

## Getting Started

### Install dependencies
yarn install
# Build the add-in
yarn build
# Start local dev server (with HTTPS and API proxying)
yarn start
# Alternatively, use this if set up
yarn run dev

## Local Debugging tips (Mac)

# Clear Excel cache
rm -rf ~/Library/Containers/com.microsoft.Excel/Data/Library/Caches/*
rm -rf ~/Library/Containers/com.microsoft.Excel/Data/Library/Application\ Support/Microsoft/Office/16.0/Wef

# Remove sideloaded add-in (if misbehaving)
rm -rf ~/Library/Containers/com.microsoft.Excel/Data/Documents/wef/*

# Clear npm cache (in case of install/build issues)
npm cache clean --force
