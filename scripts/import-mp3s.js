#!/usr/bin/env node

const path = require("path");
const fs = require("fs");
const chalk = require("chalk");
const { processMP3Directory } = require("./extract-metadata");
const { generateFromJSON } = require("./generate-ndjson");
const { spawn } = require("child_process");

/**
 * Display usage information
 */
function showUsage() {
  console.log(chalk.blue("\n🎵 MP3 to Sanity Import Tool\n"));
  console.log(chalk.yellow("Usage:"));
  console.log("  node import-mp3s.js <mp3-directory> [options]\n");
  console.log(chalk.yellow("Options:"));
  console.log(
    "  --random-dates     Assign random dates instead of sequential daily releases",
  );
  console.log(
    "  --keep-order       Keep original file order (don't shuffle songs)",
  );
  console.log(
    "  --start-date       Starting date for releases (ISO format, default: 2025-01-15T08:00:00Z)",
  );
  console.log(
    "  --dry-run          Generate files but don't run Sanity import",
  );
  console.log("  --no-backup        Skip creating backup of existing data");
  console.log("  --help             Show this help message\n");
  console.log(chalk.yellow("Examples:"));
  console.log(
    "  node import-mp3s.js ../assets/mp3s/                        # Shuffle songs, daily releases",
  );
  console.log(
    "  node import-mp3s.js /path/to/mp3s --keep-order              # Keep order, daily releases",
  );
  console.log(
    "  node import-mp3s.js ./mp3s --random-dates                   # Shuffle songs, random dates",
  );
  console.log("  node import-mp3s.js ./mp3s --start-date 2025-02-01T08:00:00Z");
  console.log("  node import-mp3s.js ./mp3s --dry-run\n");
  console.log(
    chalk.gray(
      "Default: Shuffles song order, assigns sequential daily releases starting at 8am UTC",
    ),
  );
}

/**
 * Parse command line arguments
 */
function parseArgs(args) {
  const options = {
    directory: null,
    randomizeDates: false,
    keepOrder: false,
    startDate: null,
    dryRun: false,
    noBackup: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "--help") {
      showUsage();
      process.exit(0);
    } else if (arg === "--random-dates") {
      options.randomizeDates = true;
    } else if (arg === "--keep-order") {
      options.keepOrder = true;
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg === "--no-backup") {
      options.noBackup = true;
    } else if (arg === "--start-date" && i + 1 < args.length) {
      options.startDate = args[++i];
    } else if (!arg.startsWith("--")) {
      options.directory = arg;
    }
  }

  if (!options.directory) {
    console.error(chalk.red("❌ Error: MP3 directory path is required"));
    showUsage();
    process.exit(1);
  }

  return options;
}

/**
 * Create backup of existing data
 */
async function createBackup() {
  return new Promise((resolve, reject) => {
    console.log(chalk.blue("📦 Creating backup of existing data..."));

    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .split("T")[0];
    const backupFile = `backup-${timestamp}.tar.gz`;

    const exportProcess = spawn(
      "sanity",
      ["dataset", "export", "tgs", "--path", backupFile],
      {
        cwd: path.join(__dirname, "..", "thatgoodsht"),
        stdio: "inherit",
      },
    );

    exportProcess.on("close", (code) => {
      if (code === 0) {
        console.log(chalk.green(`✅ Backup created: ${backupFile}\n`));
        resolve(backupFile);
      } else {
        reject(new Error(`Backup failed with code ${code}`));
      }
    });

    exportProcess.on("error", (err) => {
      reject(err);
    });
  });
}

/**
 * Run Sanity import command
 */
async function runSanityImport(ndjsonPath) {
  return new Promise((resolve, reject) => {
    console.log(chalk.blue("\n🚀 Running Sanity import...\n"));

    const importProcess = spawn(
      "sanity",
      [
        "dataset",
        "import",
        path.join("..", "scripts", ndjsonPath),
        "tgs",
        "--replace",
      ],
      {
        cwd: path.join(__dirname, "..", "thatgoodsht"),
        stdio: "inherit",
      },
    );

    importProcess.on("close", (code) => {
      if (code === 0) {
        console.log(chalk.green("\n✅ Import completed successfully!"));
        resolve();
      } else {
        reject(new Error(`Import failed with code ${code}`));
      }
    });

    importProcess.on("error", (err) => {
      reject(err);
    });
  });
}

/**
 * Main import workflow
 */
async function main() {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  console.log(chalk.blue("\n===================================="));
  console.log(chalk.blue("   🎵 MP3 to Sanity Import Tool"));
  console.log(chalk.blue("====================================\n"));

  try {
    // Step 1: Create backup (unless disabled)
    if (!options.noBackup && !options.dryRun) {
      try {
        await createBackup();
      } catch (error) {
        console.warn(chalk.yellow("⚠️  Warning: Could not create backup"));
        console.warn(chalk.yellow(`   ${error.message}`));

        const readline = require("readline");
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout,
        });

        const answer = await new Promise((resolve) => {
          rl.question(
            chalk.yellow("Continue without backup? (y/N): "),
            resolve,
          );
        });
        rl.close();

        if (answer.toLowerCase() !== "y") {
          console.log(chalk.gray("Import cancelled."));
          process.exit(0);
        }
      }
    }

    // Step 2: Process MP3 files
    console.log(chalk.cyan("\n📂 Step 1: Processing MP3 files..."));
    console.log(chalk.gray("━".repeat(40)));

    const mp3Data = await processMP3Directory(options.directory, {
      randomizeDates: options.randomizeDates,
      keepOrder: options.keepOrder,
      startDate: options.startDate,
    });

    if (mp3Data.length === 0) {
      console.log(chalk.yellow("No MP3 files found to process."));
      process.exit(0);
    }

    // Save intermediate JSON
    const jsonPath = "mp3-data.json";
    fs.writeFileSync(jsonPath, JSON.stringify(mp3Data, null, 2));
    console.log(chalk.gray(`\n💾 MP3 data saved to ${jsonPath}`));

    // Step 3: Generate NDJSON
    console.log(chalk.cyan("\n📝 Step 2: Generating import file..."));
    console.log(chalk.gray("━".repeat(40)));

    const result = await generateFromJSON(jsonPath, "import.ndjson");

    // Step 4: Run import (unless dry run)
    if (options.dryRun) {
      console.log(chalk.yellow("\n🔍 Dry run mode - skipping actual import"));
      console.log(chalk.gray("\nGenerated files:"));
      console.log(chalk.gray(`  • ${jsonPath} - Extracted MP3 metadata`));
      console.log(chalk.gray(`  • import.ndjson - Sanity import file`));
      console.log(chalk.gray("\nTo run the actual import:"));
      console.log(chalk.cyan("  cd ../thatgoodsht"));
      console.log(
        chalk.cyan(
          `  sanity dataset import ../scripts/import.ndjson tgs --replace`,
        ),
      );
    } else {
      console.log(chalk.cyan("\n📤 Step 3: Importing to Sanity..."));
      console.log(chalk.gray("━".repeat(40)));

      await runSanityImport("import.ndjson");

      // Final summary
      console.log(chalk.green("\n===================================="));
      console.log(chalk.green("   ✨ Import Complete!"));
      console.log(chalk.green("====================================\n"));
      console.log(chalk.cyan("Summary:"));
      console.log(`  • Documents imported: ${result.documentsCount}`);
      console.log(`  • Dataset: tgs`);
      console.log(`  • Type: sotd`);

      console.log(chalk.cyan("\nNext steps:"));
      console.log("  1. Check your Sanity Studio to verify the import");
      console.log("  2. Deploy GraphQL if needed: sanity graphql deploy");
      console.log("  3. Test your frontend to ensure everything works\n");
    }
  } catch (error) {
    console.error(chalk.red("\n❌ Error:"), error.message);
    console.error(chalk.gray("\nStack trace:"));
    console.error(chalk.gray(error.stack));
    process.exit(1);
  }
}

// Run the main function
if (require.main === module) {
  main().catch((error) => {
    console.error(chalk.red("Fatal error:"), error);
    process.exit(1);
  });
}

module.exports = {
  parseArgs,
  createBackup,
  runSanityImport,
};
