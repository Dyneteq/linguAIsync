const fs = require('fs');
const path = require('path');

const loadTranslationFile = (localesDir, language, filename) => {
  const filePath = path.join(localesDir, language, filename);
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.warn(`⚠️  Warning: Could not load ${filePath}: ${error.message}`);
    return {};
  }
};

const saveTranslationFile = (localesDir, language, data, filename) => {
  const filePath = path.join(localesDir, language, filename);
  const dirPath = path.dirname(filePath);

  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  const jsonString = JSON.stringify(data, null, 2);
  fs.writeFileSync(filePath, jsonString + '\n', 'utf8');
};

const getAvailableLanguages = (localesDir, baseLanguage) => {
  try {
    return fs.readdirSync(localesDir).filter((dir) => {
      const stat = fs.statSync(path.join(localesDir, dir));
      return stat.isDirectory() && dir !== baseLanguage;
    });
  } catch (error) {
    console.error(`❌ Error reading locales directory: ${error.message}`);
    return [];
  }
};

const getAvailableTranslationFiles = (localesDir, baseLanguage, translationFiles) => {
  return translationFiles.filter((filename) => {
    const filePath = path.join(localesDir, baseLanguage, filename);
    return fs.existsSync(filePath);
  });
};

const getBackupPath = (localesDir, baseLanguage, filename) => {
  return path.join(localesDir, baseLanguage, `${filename}.bak`);
};

const loadBackupFile = (localesDir, baseLanguage, filename) => {
  const backupPath = getBackupPath(localesDir, baseLanguage, filename);
  try {
    const content = fs.readFileSync(backupPath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    return null;
  }
};

const saveBackupFile = (localesDir, baseLanguage, data, filename) => {
  const backupPath = getBackupPath(localesDir, baseLanguage, filename);
  const jsonString = JSON.stringify(data, null, 2);
  fs.writeFileSync(backupPath, jsonString + '\n', 'utf8');
};

const backupExists = (localesDir, baseLanguage, filename) => {
  const backupPath = getBackupPath(localesDir, baseLanguage, filename);
  return fs.existsSync(backupPath);
};

module.exports = {
  loadTranslationFile,
  saveTranslationFile,
  getAvailableLanguages,
  getAvailableTranslationFiles,
  loadBackupFile,
  saveBackupFile,
  backupExists,
};
