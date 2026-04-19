# pagesnap

CLI tool to capture and diff web page screenshots across deploys.

## Installation

```bash
npm install -g pagesnap
```

## Usage

Capture screenshots of your pages before a deploy:

```bash
pagesnap capture --url https://example.com --name baseline
```

After deploying, capture again and diff against the baseline:

```bash
pagesnap capture --url https://example.com --name latest
pagesnap diff baseline latest
```

Diffs are saved to `./pagesnap-output/` as highlighted PNG images showing visual changes between snapshots.

### Options

| Flag | Description |
|------|-------------|
| `--url` | URL of the page to capture |
| `--name` | Label for the snapshot |
| `--threshold` | Diff sensitivity (0–1, default: `0.1`) |
| `--output` | Output directory (default: `./pagesnap-output`) |

### Config File

You can define multiple pages in a `pagesnap.config.json` file:

```json
{
  "pages": [
    { "name": "home", "url": "https://example.com" },
    { "name": "about", "url": "https://example.com/about" }
  ]
}
```

Then run:

```bash
pagesnap capture --config pagesnap.config.json
```

## Requirements

- Node.js 16+
- Chromium (installed automatically via Puppeteer)

## License

[MIT](LICENSE)