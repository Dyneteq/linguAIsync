const { createConfig, LANGUAGE_NAMES } = require('./core/config');
const { syncLanguages } = require('./core/sync');
const { analyzeLanguages } = require('./core/analyze');
const { getAvailableLanguages, getAvailableTranslationFiles } = require('./utils/file-ops');

module.exports = {
  createConfig,
  syncLanguages,
  analyzeLanguages,
  getAvailableLanguages,
  getAvailableTranslationFiles,
  LANGUAGE_NAMES,
};
