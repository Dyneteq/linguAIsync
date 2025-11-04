const { loadTranslationFile, getAvailableTranslationFiles, loadBackupFile, saveBackupFile, backupExists } = require('../utils/file-ops');
const { findMissingKeys, findChangedKeys } = require('../utils/translation-ops');

const analyzeFile = (config, language, filename) => {
  const baseTranslations = loadTranslationFile(config.localesDir, config.baseLanguage, filename);
  const targetTranslations = loadTranslationFile(config.localesDir, language, filename);

  if (Object.keys(baseTranslations).length === 0) {
    console.warn(`  ⚠️  Warning: Could not load base ${filename}, skipping...`);
    return [];
  }

  // Find missing keys
  const missingKeys = findMissingKeys(baseTranslations, targetTranslations);

  // Find changed keys by comparing current base with backup
  const backupTranslations = loadBackupFile(config.localesDir, config.baseLanguage, filename);
  let changedKeys = [];
  let noBackupWarning = false;

  if (backupTranslations) {
    changedKeys = findChangedKeys(backupTranslations, baseTranslations);
    // Filter out changed keys that don't exist in target (they're already in missingKeys)
    changedKeys = changedKeys.filter(changed => {
      const pathParts = changed.path.split('.');
      let current = targetTranslations;
      for (const part of pathParts) {
        if (current && typeof current === 'object' && part in current) {
          current = current[part];
        } else {
          return false; // Key doesn't exist in target, already handled by missingKeys
        }
      }
      return true; // Key exists in target, needs re-translation
    });
  } else {
    noBackupWarning = true;
  }

  const totalCount = missingKeys.length + changedKeys.length;

  if (totalCount === 0) {
    console.log(`  ✅ ${filename}: All translations are up to date!`);
    if (noBackupWarning) {
      console.log(`  ℹ️  No backup found - run sync to create baseline for change detection`);
    }
    return [];
  }

  if (missingKeys.length > 0) {
    console.log(`  📝 Found ${missingKeys.length} missing translation(s) in ${filename}`);
  }
  if (changedKeys.length > 0) {
    console.log(`  🔄 Found ${changedKeys.length} changed translation(s) in ${filename}`);
  }
  if (noBackupWarning) {
    console.log(`  ⚠️  No backup found - changed values won't be detected until you run sync`);
  }

  const allKeys = [
    ...missingKeys.map((item) => ({
      ...item,
      path: `${filename}:${item.path}`,
      filename,
      type: 'missing',
    })),
    ...changedKeys.map((item) => ({
      ...item,
      path: `${filename}:${item.path}`,
      filename,
      type: 'changed',
    })),
  ];

  return allKeys;
};

const formatVerboseOutput = (language, items, languageName) => {
  console.log(`\n🔍 Detailed translation updates for ${language}:`);
  console.log('─'.repeat(60));

  items.forEach((item, index) => {
    const displayValue =
      typeof item.value === 'string'
        ? item.value.length > 100
          ? item.value.substring(0, 97) + '...'
          : item.value
        : JSON.stringify(item.value);

    const statusLabel = item.type === 'changed' ? '[CHANGED - NEEDS UPDATE]' : '[MISSING]';
    const statusIcon = item.type === 'changed' ? '🔄' : '🎯';

    console.log(`${(index + 1).toString().padStart(3)}. ${item.path}`);
    console.log(`     📝 EN: "${displayValue}"`);
    console.log(`     ${statusIcon} ${languageName}: ${statusLabel}`);

    if (index < items.length - 1) {
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

  const allItems = [];

  for (const filename of availableFiles) {
    console.log(`\n  📄 Checking ${filename}...`);
    const items = analyzeFile(config, language, filename);
    allItems.push(...items);
  }

  const totalCount = allItems.length;
  const missingCount = allItems.filter(item => item.type === 'missing').length;
  const changedCount = allItems.filter(item => item.type === 'changed').length;

  if (totalCount > 0) {
    const parts = [];
    if (missingCount > 0) parts.push(`${missingCount} missing`);
    if (changedCount > 0) parts.push(`${changedCount} changed`);
    console.log(
      `\n📊 ${language}: Would update ${parts.join(' + ')} translation(s) across ${availableFiles.length} files`
    );
  }

  if (totalCount > 0 && verbose) {
    formatVerboseOutput(language, allItems, config.languageNames[language] || language);
  }

  return totalCount > 0
    ? {
        languageName: config.languageNames[language] || language,
        missingCount: totalCount,
        missing: allItems.map((item) => ({
          path: item.path,
          englishValue: item.value,
          isNested: item.isNested,
          filename: item.filename,
          type: item.type,
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
