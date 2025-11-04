const LANGUAGE_NAMES = {
  es: 'Spanish',
  de: 'German',
  el: 'Greek',
  jp: 'Japanese',
  ua: 'Ukrainian',
  it: 'Italian',
  fr: 'French',
  ru: 'Russian',
  tr: 'Turkish',
  ko: 'Korean',
  vi: 'Vietnamese',
  ar: 'Arabic',
  nl: 'Dutch',
  ro: 'Romanian',
  zh: 'Mandarin Chinese',
  pt: 'Portuguese',
  id: 'Indonesian',
  no: 'Norwegian',
  fi: 'Finnish',
  da: 'Danish',
  sv: 'Swedish',
  pl: 'Polish',
  bg: 'Bulgarian',
  sl: 'Slovenian',
};

const DEFAULT_CONFIG = {
  localesDir: process.cwd(),
  baseLanguage: 'en',
  batchSize: 20,
  openaiApiUrl: 'https://api.openai.com/v1/chat/completions',
  translationFiles: ['translation.json'],
  model: 'gpt-4o-mini',
  temperature: 0.3,
  maxTokens: 2000,
};

const createConfig = (userConfig = {}) => ({
  ...DEFAULT_CONFIG,
  ...userConfig,
  openaiApiKey: userConfig.openaiApiKey || process.env.OPENAI_API_KEY,
  languageNames: { ...LANGUAGE_NAMES, ...(userConfig.customLanguageNames || {}) },
});

module.exports = {
  LANGUAGE_NAMES,
  DEFAULT_CONFIG,
  createConfig,
};
