const createPrompt = (translationItems, languageName) => `You are a professional translator. Translate the following English text to ${languageName}.

IMPORTANT INSTRUCTIONS:
1. Maintain the exact same structure and formatting
2. Preserve all placeholders like {{variable}}, {{count}}, etc.
3. Keep HTML tags intact if present
4. For technical terms, use appropriate ${languageName} equivalents
5. Maintain the tone and context appropriate for a software application
6. If the English value is an array, return an array in the translation (NOT an object with numbered keys)
7. If the English value is an object, return an object in the translation
8. Return ONLY a JSON object with the translations

Translate these English texts:
${JSON.stringify(translationItems, null, 2)}

Return format:
{
  "translations": [
    {
      "key": "path.to.key",
      "translation": "translated text in ${languageName}"
    }
  ]
}`;

const createRequestPayload = (prompt, config) => ({
  model: config.model,
  messages: [
    {
      role: 'system',
      content:
        'You are a professional translator specializing in software localization. Always return valid JSON in the exact format requested.',
    },
    {
      role: 'user',
      content: prompt,
    },
  ],
  temperature: config.temperature,
  max_tokens: config.maxTokens,
});

const requestTranslations = async (batch, targetLanguage, config) => {
  const languageName = config.languageNames[targetLanguage] || targetLanguage;

  const translationItems = batch.map((item) => ({
    key: item.path,
    english: typeof item.value === 'string' ? item.value : JSON.stringify(item.value),
  }));

  const prompt = createPrompt(translationItems, languageName);
  const requestPayload = createRequestPayload(prompt, config);

  console.log(`   🔍 Debug: Translating ${batch.length} items to ${languageName}`);
  console.log(`   📊 Prompt length: ${prompt.length} characters`);
  console.log(`   📦 Request payload size: ${JSON.stringify(requestPayload).length} bytes`);

  try {
    const response = await fetch(config.openaiApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.openaiApiKey}`,
      },
      body: JSON.stringify(requestPayload),
    });

    if (!response.ok) {
      let errorDetails = '';
      try {
        const errorBody = await response.json();
        errorDetails = ` - ${JSON.stringify(errorBody)}`;
      } catch {
        try {
          errorDetails = ` - ${await response.text()}`;
        } catch {
          errorDetails = ' - Unable to read error response';
        }
      }
      throw new Error(
        `OpenAI API error: ${response.status} ${response.statusText}${errorDetails}`
      );
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const translationResponse = JSON.parse(content);
    return translationResponse.translations || [];
  } catch (error) {
    console.error(`❌ Error requesting translations: ${error.message}`);
    return [];
  }
};

module.exports = {
  requestTranslations,
};
