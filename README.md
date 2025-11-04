# linguAIsync

AI-powered translation synchronization tool. Automatically detects missing translations and uses OpenAI to translate them while preserving formatting and placeholders.

## Installation

```bash
npm install linguaisync
```

## Quick Start

1. **Set OpenAI API key**

```bash
export OPENAI_API_KEY="sk-your-api-key"
```

2. **Create `linguaisync.config.js`**

```javascript
const path = require('path');

module.exports = {
  localesDir: path.join(__dirname, 'public/locales'),
  baseLanguage: 'en',
  translationFiles: ['translation.json'],
};
```

3. **Directory structure**

```
locales/
├── en/
│   └── translation.json
└── es/
    └── translation.json
```

4. **Run**

```bash
# Preview changes
npx linguaisync --all --dry-run

# Sync all languages
npx linguaisync --all

# Sync specific languages
npx linguaisync --lang es,fr,de
```

## CLI Options

```bash
linguaisync --all                      # Process all languages
linguaisync --lang es,fr               # Process specific languages
linguaisync --all --dry-run            # Preview without changes
linguaisync --all --dry-run --verbose  # Show detailed output
linguaisync --all --dry-run --output missing.json  # Export to file
linguaisync --config custom.js         # Use custom config
linguaisync --locales-dir ./i18n       # Override locales path
```

## Configuration

**JavaScript config (`linguaisync.config.js`):**

```javascript
const path = require('path');

module.exports = {
  localesDir: path.join(__dirname, 'public/locales'),
  baseLanguage: 'en',
  translationFiles: ['translation.json', 'common.json'],
  batchSize: 20,
  model: 'gpt-4o-mini',
  temperature: 0.3,
};
```

**JSON config (`linguaisync.config.json`):**

```json
{
  "localesDir": "./public/locales",
  "baseLanguage": "en",
  "translationFiles": ["translation.json"],
  "batchSize": 20
}
```

## Programmatic API

```javascript
const { createConfig, syncLanguages, analyzeLanguages } = require('linguaisync');

const config = createConfig({
  localesDir: './locales',
  baseLanguage: 'en',
});

// Analyze (dry run)
const missing = analyzeLanguages(config, ['es', 'fr'], true);

// Sync translations
await syncLanguages(config, ['es', 'fr']);
```

## Supported Languages

Arabic (ar), Bulgarian (bg), Danish (da), German (de), Greek (el), Spanish (es), Finnish (fi), French (fr), Indonesian (id), Italian (it), Japanese (jp), Korean (ko), Dutch (nl), Norwegian (no), Polish (pl), Portuguese (pt), Romanian (ro), Russian (ru), Slovenian (sl), Swedish (sv), Turkish (tr), Ukrainian (ua), Vietnamese (vi), Chinese (zh)

## NPM Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "i18n:check": "linguaisync --all --dry-run --verbose",
    "i18n:sync": "linguaisync --all"
  }
}
```

## Features

- 🤖 AI-powered translations via OpenAI
- 🔄 Automatic missing key detection
- 🎯 Smart batching for API efficiency
- 📦 Multi-file support
- 🔑 Preserves placeholders (`{{var}}`) and HTML
- 🧪 Dry run mode
- 💾 Export to JSON

## License

MIT
