# calm-web

A low-stimulation Chrome extension for people with ADHD and autism.

Blocks animations, autoplay video, and distracting overlays so you can read without interruption.

## Features (v0.1)
- Kills all CSS animations and transitions
- Pauses autoplay video and audio
- Freezes animated GIFs
- Blocks notification permission prompts
- Per-site allowlist (Google Docs, Figma, etc. are pre-allowlisted)
- Simple on/off toggle — `Alt+Shift+C`

## Development

```bash
npm install
npm run dev    # dev mode with HMR
npm run build  # production build → dist/
```

Load the `dist/` folder as an unpacked extension in `chrome://extensions`.

## Stack
TypeScript + Vite + Chrome Manifest V3 + @crxjs/vite-plugin
