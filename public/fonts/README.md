# RecommeNow — Fonts

## Primary font: Manrope

| File | Subset | Weights |
|------|--------|---------|
| `Manrope-latin.woff2` | Latin (English, Western European) | 300–800 |
| `Manrope-latin-ext.woff2` | Latin Extended (accented characters) | 300–800 |

- **Designer:** Mikhail Sharanda
- **Version:** v20
- **Licence:** SIL Open Font Licence 1.1 (free to use, embed, and redistribute)
- **Source:** https://manropefont.com · https://github.com/sharanda/manrope

### Usage in code

```css
font-family: var(--sans);   /* Manrope, -apple-system, …, sans-serif */
```

Weights used in the UI:
- `300` — light body text
- `400` — regular body text
- `500` / `600` — labels, captions
- `700` — sub-headings, buttons
- `800` — hero headings, logo wordmark, section titles

### How the @font-face is declared

See the top of `app/globals.css`. The font is self-hosted — no Google Fonts CDN
request is made at runtime.
