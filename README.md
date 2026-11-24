# KLIE
A static, local-first memory archive. HTML, CSS and vanilla JavaScript only. No build step, no backend, no external APIs.

## Run
Open `index.html`, or serve the folder (`python3 -m http.server`).

## Deploy to GitHub Pages
Push this folder to a repository, then Settings > Pages > deploy from branch (root). All paths are relative, so repository subpaths work.

## Data
Metadata and settings use localStorage, photos use IndexedDB. Data stays in the current browser and does not sync between devices. Use Settings > Export / Import to back up or move it.

KLIE AI is a locally simulated assistant (predefined responses and a slash-command parser), not a real AI model.
