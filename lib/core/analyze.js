const { loadTranslationFile, getAvailableTranslationFiles } = require('../utils/file-ops');
const { findMissingKeys } = require('../utils/translation-ops');

const analyzeFile = (config, language, filename) => {
  const baseTranslations = loadTranslationFile(config.localesDir, config.baseLanguage, filename);
  const targetTranslations = loadTranslationFile(config.localesDir, language, filename);

  if (Object.keys(baseTranslations).length === 0) {
    console.warn(`  ⚠️  Warning: Could not load base ${filename}, skipping...`);
    return [];
  }

  const missingKeys = findMissingKeys(baseTranslations, targetTranslations);

  if (missingKeys.length === 0) {
    console.log(`  ✅ ${filename}: All translations are up to date!`);
    return [];
  }

  console.log(`  📝 Found ${missingKeys.length} missing translation(s) in ${filename}`);

  return missingKeys.map((item) => ({
    ...item,
    path: `${filename}:${item.path}`,
    filename,
  }));
};

const formatVerboseOutput = (language, missingKeys, languageName) => {
  console.log(`\n🔍 Detailed missing translations for ${language}:`);
  console.log('─'.repeat(60));

  missingKeys.forEach((item, index) => {
    const displayValue =
      typeof item.value === 'string'
        ? item.value.length > 100
          ? item.value.substring(0, 97) + '...'
          : item.value
        : JSON.stringify(item.value);

    console.log(`${(index + 1).toString().padStart(3)}. ${item.path}`);
    console.log(`     📝 EN: "${displayValue}"`);
    console.log(`     🎯 ${languageName}: [MISSING]`);

    if (index < missingKeys.length - 1) {
      console.log('');
    }
  });
  console.log('─'.repeat(60));
};

const analyzeLanguage = (config, language, verbose) => {
  console.log(`\n📊 Analyzing ${language} (${config.languageNames[language] || language})...`);

  const availableFiles = getAvailableTranslationFiles(
    config.localesDir,
    config.baseLanguage,
    config.translationFiles
  );

  const allMissing = [];

  for (const filename of availableFiles) {
    console.log(`\n  📄 Checking ${filename}...`);
    const missing = analyzeFile(config, language, filename);
    allMissing.push(...missing);
  }

  const totalMissing = allMissing.length;

  console.log(
    `\n📊 ${language}: Would update ${totalMissing} missing translation(s) across ${availableFiles.length} files`
  );

  if (totalMissing > 0 && verbose) {
    formatVerboseOutput(language, allMissing, config.languageNames[language] || language);
  }

  return totalMissing > 0
    ? {
        languageName: config.languageNames[language] || language,
        missingCount: totalMissing,
        missing: allMissing.map((item) => ({
          path: item.path,
          englishValue: item.value,
          isNested: item.isNested,
          filename: item.filename,
        })),
      }
    : null;
};

const analyzeLanguages = (config, languages, verbose = false) => {
  const results = {};

  for (const language of languages) {
    const analysis = analyzeLanguage(config, language, verbose);
    if (analysis) {
      results[language] = analysis;
    }
  }

  const totalMissing = Object.values(results).reduce((sum, lang) => sum + lang.missingCount, 0);

  if (totalMissing > 0) {
    console.log(
      `\n📋 Summary: ${totalMissing} total missing translations across ${Object.keys(results).length} languages`
    );
  }

  return results;
};

module.exports = {
  analyzeLanguages,
};
