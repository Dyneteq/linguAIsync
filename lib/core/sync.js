const { loadTranslationFile, saveTranslationFile, getAvailableTranslationFiles, loadBackupFile, saveBackupFile, backupExists } = require('../utils/file-ops');
const { findMissingKeys, setNestedProperty, createBatches, parseTranslatedValue, findChangedKeys } = require('../utils/translation-ops');
const { requestTranslations } = require('./openai');

const processFile = async (config, language, filename) => {
  console.log(`\n  📄 Processing ${filename}...`);

  const baseTranslations = loadTranslationFile(config.localesDir, config.baseLanguage, filename);
  const targetTranslations = loadTranslationFile(config.localesDir, language, filename);

  if (Object.keys(baseTranslations).length === 0) {
    console.warn(`⚠️  Warning: Could not load base ${filename}, skipping...`);
    return { missing: 0, applied: 0, processed: false };
  }

  // Check if backup exists, if not create it
  if (!backupExists(config.localesDir, config.baseLanguage, filename)) {
    console.log(`  📦 Creating backup for ${filename}...`);
    saveBackupFile(config.localesDir, config.baseLanguage, baseTranslations, filename);
  }

  // Find missing keys
  const missingKeys = findMissingKeys(baseTranslations, targetTranslations);

  // Find changed keys by comparing current base with backup
  const backupTranslations = loadBackupFile(config.localesDir, config.baseLanguage, filename);
  let changedKeys = [];

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
  }

  // Combine missing and changed keys
  const keysToTranslate = [...missingKeys, ...changedKeys];

  if (keysToTranslate.length === 0) {
    console.log(`  ✅ ${filename}: All translations are up to date!`);
    return { missing: 0, applied: 0, processed: true };
  }

  const missingCount = missingKeys.length;
  const changedCount = changedKeys.length;

  if (missingCount > 0) {
    console.log(`  📝 Found ${missingCount} missing translation(s) in ${filename}`);
  }
  if (changedCount > 0) {
    console.log(`  🔄 Found ${changedCount} changed translation(s) in ${filename}`);
  }

  const batches = createBatches(keysToTranslate, config.batchSize);
  console.log(`  📦 Processing ${batches.length} batch(es) of translations...`);

  const allTranslations = [];

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    console.log(`     Batch ${i + 1}/${batches.length} (${batch.length} items)...`);

    try {
      const translations = await requestTranslations(batch, language, config);
      allTranslations.push(...translations);

      if (i < batches.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`  ❌ Error processing batch ${i + 1}: ${error.message}`);
    }
  }

  if (allTranslations.length === 0) {
    console.error(`  ❌ No translations received for ${filename}`);
    return { missing: keysToTranslate.length, applied: 0, processed: true };
  }

  const updatedTranslations = { ...targetTranslations };
  let appliedCount = 0;

  for (const translation of allTranslations) {
    try {
      const translatedValue = parseTranslatedValue(translation.translation);
      setNestedProperty(updatedTranslations, translation.key, translatedValue);
      appliedCount++;
    } catch (error) {
      console.warn(`  ⚠️  Warning: Could not apply translation for ${translation.key}`);
    }
  }

  saveTranslationFile(config.localesDir, language, updatedTranslations, filename);

  // Update backup after successful translation
  saveBackupFile(config.localesDir, config.baseLanguage, baseTranslations, filename);

  console.log(`  ✅ ${filename}: Applied ${appliedCount}/${keysToTranslate.length} translations`);

  return { missing: keysToTranslate.length, applied: appliedCount, processed: true };
};

const processLanguage = async (config, language) => {
  console.log(`\n📊 Analyzing ${language} (${config.languageNames[language] || language})...`);

  const availableFiles = getAvailableTranslationFiles(
    config.localesDir,
    config.baseLanguage,
    config.translationFiles
  );

  let totalMissing = 0;
  let totalApplied = 0;
  let processedFiles = 0;

  for (const filename of availableFiles) {
    const result = await processFile(config, language, filename);
    totalMissing += result.missing;
    totalApplied += result.applied;
    if (result.processed) processedFiles++;
  }

  if (processedFiles === 0) {
    console.error(`❌ ${language}: No files could be processed`);
    return false;
  }

  if (totalMissing === 0) {
    console.log(`✅ ${language}: All translation files are up to date!`);
    return true;
  }

  console.log(
    `✅ ${language}: Applied ${totalApplied}/${totalMissing} total translations across ${processedFiles} files`
  );

  return true;
};

const syncLanguages = async (config, languages) => {
  console.log('🌍 Translation Synchronization Tool\n');
  console.log(`📁 Locales directory: ${config.localesDir}`);
  console.log(`🏴 Base language: ${config.baseLanguage}`);

  const availableFiles = getAvailableTranslationFiles(
    config.localesDir,
    config.baseLanguage,
    config.translationFiles
  );

  console.log(`📄 Available translation files: ${availableFiles.join(', ')}`);
  console.log(`🔄 Processing languages: ${languages.join(', ')}`);

  if (!config.openaiApiKey) {
    console.error('❌ Error: OPENAI_API_KEY is required for translation updates');
    console.error('Please set it with: export OPENAI_API_KEY="your-api-key"');
    throw new Error('OPENAI_API_KEY not set');
  }

  let successCount = 0;

  for (const language of languages) {
    try {
      const success = await processLanguage(config, language);
      if (success) successCount++;
    } catch (error) {
      console.error(`❌ Error processing ${language}: ${error.message}`);
    }
  }

  console.log(`\n🎉 Completed! Successfully updated ${successCount}/${languages.length} languages`);

  return successCount;
};

module.exports = {
  syncLanguages,
  processLanguage,
};
