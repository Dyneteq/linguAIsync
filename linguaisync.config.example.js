/**
 * MT-Sync Configuration File
 *
 * This file can be copied to mt-sync.config.js in your project root.
 * All fields are optional - defaults will be used if not specified.
 */

const path = require('path');

module.exports = {
  // Path to your locales directory (required)
  // Use __dirname to make path relative to this config file
  localesDir: path.join(__dirname, 'public/locales'),

  // Or use absolute path:
  // localesDir: '/absolute/path/to/locales',

  // Or relative to where command is run:
  // localesDir: './public/locales',

  // Base language to use as reference (default: 'en')
  baseLanguage: 'en',

  // Translation files to process (default: ['translation.json'])
  // These files should exist in each language directory
  translationFiles: ['translation.json', 'quotes.json'],

  // Number of translations to process in each API batch (default: 20)
  batchSize: 20,

  // OpenAI API configuration
  openaiApiUrl: 'https://api.openai.com/v1/chat/completions',

  // OpenAI API key (can also be set via OPENAI_API_KEY env var)
  // It's recommended to use the environment variable instead
  // openaiApiKey: 'sk-...',

  // OpenAI model to use (default: 'gpt-4o-mini')
  model: 'gpt-4o-mini',

  // Temperature for translations (0.0-1.0, default: 0.3)
  // Lower values are more deterministic
  temperature: 0.3,

  // Maximum tokens for each API request (default: 2000)
  maxTokens: 2000,

  // Custom language name mappings for better AI translations
  // Add or override language names here
  customLanguageNames: {
    // 'jp': 'Japanese',
    // 'zh': 'Simplified Chinese',
  },
};
