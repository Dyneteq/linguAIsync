const findMissingKeys = (baseObj, targetObj, currentPath = '') => {
  const missing = [];

  for (const [key, value] of Object.entries(baseObj)) {
    const fullPath = currentPath ? `${currentPath}.${key}` : key;

    if (!(key in targetObj)) {
      if (typeof value === 'object' && value !== null) {
        missing.push(...findMissingKeys(value, {}, fullPath));
      } else {
        missing.push({ path: fullPath, value, isNested: false });
      }
    } else if (
      typeof value === 'object' &&
      value !== null &&
      typeof targetObj[key] === 'object' &&
      targetObj[key] !== null
    ) {
      missing.push(...findMissingKeys(value, targetObj[key], fullPath));
    }
  }

  return missing;
};

const setNestedProperty = (obj, path, value) => {
  const keys = path.split('.');
  let current = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }

  current[keys[keys.length - 1]] = value;
  return obj;
};

const createBatches = (items, batchSize) => {
  const batches = [];
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize));
  }
  return batches;
};

const parseTranslatedValue = (value) => {
  if (!value.startsWith('{') && !value.startsWith('[')) {
    return value;
  }

  try {
    const parsed = JSON.parse(value);

    // Convert numbered objects to arrays
    if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
      const keys = Object.keys(parsed);
      const isNumberedObject = keys.every((key, index) => key === index.toString());

      if (isNumberedObject && keys.length > 0) {
        return keys.map((key) => parsed[key]);
      }
    }

    return parsed;
  } catch {
    return value;
  }
};

module.exports = {
  findMissingKeys,
  setNestedProperty,
  createBatches,
  parseTranslatedValue,
};
