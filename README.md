# GitHub Profile View Counter

A self-hosted profile view counter that runs on Vercel and stores counts in Redis (Vercel KV). Renders as an SVG badge you can embed anywhere — GitHub READMEs, websites, portfolios.

## Features

- Bot and crawler filtering — bots read the count but don't increment it
- Per-IP cooldown — 5 minute window to prevent repeat counting
- Daily, weekly, monthly, and unique visitor breakdowns
- Fully customisable badge — size, font, color, style, compact mode, and more
- Dark mode support via `?theme=dark`
- Allowlist-based access — only users you define can have a counter

## Requirements

- [Vercel](https://vercel.com) account
- [Vercel KV](https://vercel.com/docs/storage/vercel-kv) store (Redis)

## Setup

**1. Clone and deploy**

```bash
git clone https://github.com/your-username/github-profile-views-counter-js
cd github-profile-views-counter-js
vercel deploy
```

**2. Create a Vercel KV store**

Go to your Vercel dashboard → Storage → Create KV store → link it to your project. Vercel will automatically add the required environment variables.

**3. Set allowed users**

In your Vercel project settings add an environment variable:

```
ALLOWED_USERS=your-github-username
```

For multiple users, comma-separate them:

```
ALLOWED_USERS=alice,bob,charlie
```

Only these values will work as `pageId`. Anyone else gets an `NA` badge.

**4. Add the badge to your GitHub README**

```md
![Profile Views](https://your-project.vercel.app/api/views?pageId=your-github-username)
```

For dark mode support on GitHub, use the `<picture>` tag:

```html
<picture>
  <source media="(prefers-color-scheme: dark)"
          srcset="https://your-project.vercel.app/api/views?pageId=your-github-username&theme=dark">
  <source media="(prefers-color-scheme: light)"
          srcset="https://your-project.vercel.app/api/views?pageId=your-github-username">
  <img src="https://your-project.vercel.app/api/views?pageId=your-github-username">
</picture>
```

## Query Parameters

### Core

| Parameter | Default | Description |
|---|---|---|
| `pageId` | — | **Required.** Must match an entry in `ALLOWED_USERS` |
| `label` | `Profile Views` | Label text on the left panel |
| `color` | `#4c1` | Value panel background color (hex or name) |
| `labelColor` | `#555` | Label panel background color |
| `style` | `flat` | Badge style: `flat`, `flat-square`, `plastic`, `social` |
| `logo` | — | URL of an image to show in the label panel |
| `mode` | `total` | Count to display: `total`, `today`, `week`, `month`, `unique` |
| `theme` | `light` | `dark` swaps the label panel to `#2d2d2d` |

### Sizing

| Parameter | Default | Description |
|---|---|---|
| `width` | auto | Total badge width in px (clamped 20–2000) |
| `height` | auto | Badge height in px (clamped 12–200) |
| `padding` | `16` | Horizontal padding inside each panel |
| `radius` | `3` | Border radius in px (`0` for sharp corners, high value for pill) |

### Typography

| Parameter | Default | Description |
|---|---|---|
| `fontSize` | `11` | Font size in px (clamped 8–20) |
| `bold` | `false` | `true` renders the value in bold |
| `labelOpacity` | `1` | Opacity of the label text (e.g. `0.7` to dim it) |

### Number formatting

| Parameter | Default | Description |
|---|---|---|
| `locale` | — | Locale for number formatting, e.g. `en-IN`, `de-DE` |
| `precision` | `1` | Decimal places on abbreviated numbers (`1.2k` vs `1.23k`) |
| `raw` | `false` | `true` shows the exact integer, no abbreviation |
| `prefix` | — | String prepended to the value, e.g. `#` |
| `suffix` | — | String appended to the value, e.g. ` views` |
| `compact` | `false` | `true` hides the label panel entirely, shows only the count |

## Examples

Default badge:
```
?pageId=alice
```

Compact dark badge with custom color:
```
?pageId=alice&compact=true&color=%23007ec6&theme=dark
```

Weekly count, pill shape, large font:
```
?pageId=alice&mode=week&radius=12&fontSize=13
```

Indian number formatting:
```
?pageId=alice&locale=en-IN&raw=false
```

Count with suffix:
```
?pageId=alice&suffix= views&bold=true
```

## Project Structure

```
├── api/
│   ├── views.js   # Main badge endpoint
│   └── set.js     # Admin utility
└── package.json
```

## License

MIT
