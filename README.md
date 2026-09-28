# UUID Generator

**Live demo:** https://uuid-generator-eight-chi.vercel.app (Vercel) · [GitHub Pages mirror](https://babug01.github.io/uuid-generator/)

Generate UUID v4s one at a time or in bulk, and validate/decode any UUID-shaped string — version,
variant, and the nil/max special cases. Runs entirely in the browser; nothing you generate or
paste ever leaves your machine.

## Features

- **Single UUID v4** via the browser's native `crypto.randomUUID()`
- **Bulk generation** — up to 1000 at once, with copy-all and a plain-text download
- **Validator / decoder** — paste any string; if it matches the UUID shape, reports its version
  (from the version nibble) and variant (from the variant nibble)
- Specifically recognizes the **nil UUID** (`00000000-0000-0000-0000-000000000000`) and the
  **max UUID** (`ffffffff-ffff-ffff-ffff-ffffffffffff`) as their own special cases rather than
  reporting a meaningless "version 0"/"version 15"

## Why I built this

A throwaway UUID for a test fixture or a quick "what version/variant is this ID actually" check
comes up constantly. This is also one piece of a larger internal DevOps tool I built at work
consolidating the utility pages a platform engineer reaches for daily into one place — this repo
is the UUID generator piece, cleaned up and open-sourced on its own.

## Tech Stack

- [React](https://react.dev/) + [Vite](https://vitejs.dev/) — no other runtime dependencies;
  generation is native `crypto.randomUUID()`, decoding is plain string/bitwise logic

## Running locally

```bash
git clone https://github.com/Babug01/uuid-generator.git
cd uuid-generator
npm install
npm run dev
```

## License

MIT — see [LICENSE](LICENSE).
