#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { program } = require('commander');
const {
  createConfig,
  syncLanguages,
  analyzeLanguages,
  getAvailableLanguages,
} = require('../lib');

/**
 * Load configuration from file
 */
function loadConfig(configPath) {
    if (!configPath) {
        // Try to find config in common locations
        const commonPaths = [
            path.join(process.cwd(), 'linguaisync.config.js'),
            path.join(process.cwd(), '.linguaisync.config.js'),
            path.join(process.cwd(), 'linguaisync.config.json'),
        ];

        for (const p of commonPaths) {
            if (fs.existsSync(p)) {
                configPath = p;
                break;
            }
        }
    }

    if (configPath && fs.existsSync(configPath)) {
        console.log(`📋 Loading config from: ${configPath}`);

        if (configPath.endsWith('.json')) {
            return JSON.parse(fs.readFileSync(configPath, 'utf8'));
        } else if (configPath.endsWith('.js')) {
            return require(path.resolve(configPath));
        }
    }

    return {};
}

/**
 * Display banner
 */
function showBanner() {
    // Clear terminal
    console.clear();

    console.log('\n');
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║                                                           ║');
    console.log('║           _ _                   _    ___                  ║');
    console.log('║          | (_)_ _  __ _ _  _   /_\\  |_ _|                 ║');
    console.log('║          | | | \' \\/ _` | || | / _ \\  | |                  ║');
    console.log('║          |_|_|_||_\\__, |\\_,_|/_/ \\_\\|___|                 ║');
    console.log('║                   |___/                                   ║');
    console.log('║                       sync                                ║');
    console.log('║                                                           ║');
    console.log('║          🤖 AI-Powered Translation Synchronization        ║');
    console.log('║                                                           ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log('');
    console.log('  Made with ❤️  by Chris Veleris');
    console.log('');
    console.log('  💡 Do you want to join thousands of users who stay organized?');
    console.log('  ➡️  Try my productivity tool at https://tududi.com');
    console.log('  -----------------------------------------------');
    console.log('\n');
}

/**
 * Main execution function
 */
async function main() {
    program
        .name('linguaisync')
        .description(
            'linguAIsync - AI-powered translation synchronization tool using OpenAI'
        )
        .version('1.0.0')
        .option('--all', 'Update all available languages')
        .option(
            '--lang <languages>',
            'Comma-separated list of language codes to update (e.g., jp,el,de)'
        )
        .option(
            '--dry-run',
            'Show what would be updated without making changes'
        )
        .option(
            '--verbose',
            'Show detailed missing translations in dry run mode'
        )
        .option(
            '--output <file>',
            'Save missing translations to a JSON file (requires --dry-run)'
        )
        .option(
            '--config <path>',
            'Path to configuration file (default: looks for linguaisync.config.js/json)'
        )
        .option(
            '--locales-dir <path>',
            'Path to locales directory (overrides config file)'
        )
        .option(
            '--base-lang <code>',
            'Base language code (default: en, overrides config file)'
        )
        .parse();

    const options = program.opts();

    // Show banner (skip for --help and --version)
    if (!process.argv.includes('--help') && !process.argv.includes('-h') && !process.argv.includes('--version') && !process.argv.includes('-V')) {
        showBanner();
    }

    // Load and merge configuration
    const fileConfig = loadConfig(options.config);
    const config = createConfig({
        ...fileConfig,
        localesDir: options.localesDir
            ? path.resolve(options.localesDir)
            : fileConfig.localesDir || path.join(process.cwd(), 'locales'),
        baseLanguage: options.baseLang || fileConfig.baseLanguage,
    });

    // Determine which languages to process
    const availableLanguages = getAvailableLanguages(config.localesDir, config.baseLanguage);
    let languagesToProcess = [];

    if (options.all) {
        languagesToProcess = availableLanguages;
        if (languagesToProcess.length === 0) {
            console.log('❌ No language directories found');
            console.log(`📁 Looking in: ${config.localesDir}`);
            process.exit(1);
        }
    } else if (options.lang) {
        languagesToProcess = options.lang.split(',').map((lang) => lang.trim());
    } else {
        console.log('❓ No languages specified. Use --all or --lang=<codes>');
        if (availableLanguages.length > 0) {
            console.log('\nAvailable languages:', availableLanguages.join(', '));
        } else {
            console.log(`\n📁 No language directories found in: ${config.localesDir}`);
            console.log('\nExpected structure:');
            console.log('  locales/');
            console.log('    en/');
            console.log('      translation.json');
            console.log('    es/');
            console.log('      translation.json');
        }
        process.exit(1);
    }

    if (languagesToProcess.length === 0) {
        console.log('❌ No valid languages to process');
        process.exit(1);
    }

    // Validate that all specified languages exist
    const invalidLanguages = languagesToProcess.filter(
        (lang) => !availableLanguages.includes(lang)
    );

    if (invalidLanguages.length > 0) {
        console.error(`❌ Invalid language codes: ${invalidLanguages.join(', ')}`);
        console.error(`Available languages: ${availableLanguages.join(', ')}`);
        process.exit(1);
    }

    // Execute based on mode
    if (options.dryRun) {
        console.log('\n🧪 DRY RUN MODE - No files will be modified\n');

        const allMissingTranslations = analyzeLanguages(
            config,
            languagesToProcess,
            options.verbose
        );

        // Handle output file for dry run
        if (options.output && Object.keys(allMissingTranslations).length > 0) {
            const totalMissing = Object.values(allMissingTranslations).reduce(
                (sum, lang) => sum + lang.missingCount,
                0
            );

            const outputData = {
                generatedAt: new Date().toISOString(),
                baseLanguage: config.baseLanguage,
                localesDir: config.localesDir,
                languages: allMissingTranslations,
                summary: {
                    totalLanguages: Object.keys(allMissingTranslations).length,
                    totalMissingTranslations: totalMissing,
                },
            };

            try {
                fs.writeFileSync(options.output, JSON.stringify(outputData, null, 2));
                console.log(`💾 Missing translations saved to: ${options.output}`);
            } catch (error) {
                console.error(`❌ Error saving output file: ${error.message}`);
            }
        }
    } else {
        // Actual synchronization
        await syncLanguages(config, languagesToProcess);
    }
}

// Handle uncaught errors
process.on('unhandledRejection', (error) => {
    console.error('❌ Unhandled error:', error);
    process.exit(1);
});

// Run the script
main().catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
});
