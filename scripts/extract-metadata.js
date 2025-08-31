const { parseFile } = require("music-metadata");
const glob = require("glob");
const path = require("path");
const fs = require("fs").promises;
const chalk = require("chalk");
const { v4: uuidv4 } = require("uuid");
const { addDays, parseISO } = require("date-fns");
const config = require("./config");

/**
 * Simple spinner replacement
 */
class SimpleSpinner {
  constructor(text) {
    this.text = text;
    console.log(chalk.blue(`⏳ ${text}`));
  }

  succeed(text) {
    console.log(chalk.green(`✅ ${text}`));
  }

  fail(text) {
    console.log(chalk.red(`❌ ${text}`));
  }

  update(text) {
    console.log(chalk.gray(`   ${text}`));
  }
}

/**
 * Extract metadata from a single MP3 file
 */
async function extractMP3Metadata(filePath) {
  try {
    const metadata = await parseFile(filePath);
    const fileName = path.basename(filePath, ".mp3");

    // Try to get title and artist from ID3 tags
    let title = metadata.common.title || fileName;
    let artist = metadata.common.artist || "Unknown Artist";

    // Fallback: try to parse from filename if no tags
    // Assumes format like "Artist - Title.mp3" or "Artist_-_Title.mp3"
    if (!metadata.common.title && fileName.includes(" - ")) {
      const parts = fileName.split(" - ");
      if (parts.length === 2) {
        artist = parts[0].trim();
        title = parts[1].trim();
      }
    }

    return {
      filePath,
      fileName,
      title,
      artist,
      duration: metadata.format.duration,
      bitrate: metadata.format.bitrate,
      sampleRate: metadata.format.sampleRate,
    };
  } catch (error) {
    console.error(chalk.red(`Error reading ${filePath}:`), error.message);
    return null;
  }
}

/**
 * Scan directory and process all MP3 files
 */
async function scanMP3Directory(directoryPath, options = {}) {
  const spinner = new SimpleSpinner("Scanning for MP3 files...");

  try {
    // Find all MP3 files
    const pattern = path.join(directoryPath, "**/*.mp3");
    const files = glob.sync(pattern, { nocase: true });

    if (files.length === 0) {
      spinner.fail("No MP3 files found in directory");
      return [];
    }

    spinner.succeed(`Found ${files.length} MP3 files`);

    // Process each file
    console.log(chalk.blue("⏳ Extracting metadata..."));
    const results = [];

    for (let i = 0; i < files.length; i++) {
      if (i % 10 === 0 || i === files.length - 1) {
        console.log(chalk.gray(`   Processing ${i + 1}/${files.length}...`));
      }
      const metadata = await extractMP3Metadata(files[i]);
      if (metadata) {
        results.push(metadata);
      }
    }

    console.log(
      chalk.green(`✅ Processed ${results.length} files successfully`),
    );
    return results;
  } catch (error) {
    spinner.fail("Error scanning directory");
    throw error;
  }
}

/**
 * Shuffle array in place using Fisher-Yates algorithm
 */
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Assign release dates to MP3s
 */
function assignReleaseDates(mp3Data, options = {}) {
  const {
    startDate = config.import.startDate,
    interval = config.import.daysInterval,
    randomizeDates = false, // Changed from 'randomize' to be clearer
    randomizeOrder = true, // New: randomize song order by default
    timeOfDay = config.import.releaseTimeOfDay,
  } = options;

  const baseDate = parseISO(startDate);

  // Shuffle the song order by default (unless explicitly disabled)
  const orderedData = randomizeOrder ? shuffleArray(mp3Data) : mp3Data;

  return orderedData.map((item, index) => {
    let releaseDate;

    if (randomizeDates) {
      // Random dates starting from baseDate within next 365 days
      const daysOffset = Math.floor(Math.random() * 365);
      releaseDate = addDays(baseDate, daysOffset);
    } else {
      // Sequential dates (one per day)
      releaseDate = addDays(baseDate, index * interval);
    }

    // Set time of day in UTC (8am = 08:00 UTC)
    const [hours, minutes] = timeOfDay.split(":");
    releaseDate.setUTCHours(parseInt(hours), parseInt(minutes), 0, 0);

    return {
      ...item,
      _id: uuidv4(),
      datetime: releaseDate.toISOString(),
    };
  });
}

/**
 * Main function to process MP3 directory
 */
async function processMP3Directory(directoryPath, options = {}) {
  console.log(chalk.blue("\n🎵 MP3 Import Tool\n"));
  console.log(chalk.gray(`Directory: ${directoryPath}`));
  console.log(
    chalk.gray(`Start Date: ${options.startDate || config.import.startDate}`),
  );
  console.log(
    chalk.gray(`Song Order: ${options.keepOrder ? "Original" : "Randomized"}`),
  );
  console.log(
    chalk.gray(
      `Date Assignment: ${options.randomizeDates ? "Random dates" : "Sequential (daily)"}\n`,
    ),
  );

  try {
    // Check if directory exists
    const stats = await fs.stat(directoryPath);
    if (!stats.isDirectory()) {
      throw new Error("Path is not a directory");
    }

    // Scan and extract metadata
    const mp3Data = await scanMP3Directory(directoryPath);

    if (mp3Data.length === 0) {
      console.log(chalk.yellow("No valid MP3 files to process"));
      return [];
    }

    // Assign dates (with order randomization by default)
    const withDates = assignReleaseDates(mp3Data, {
      ...options,
      randomizeDates: options.randomizeDates || false,
      randomizeOrder: !options.keepOrder, // Randomize order unless --keep-order is specified
    });

    // Sort by date (they should already be in order for sequential dates)
    withDates.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));

    // Display summary
    console.log(chalk.green("\n✅ Processing complete!\n"));
    console.log(chalk.cyan("Summary:"));
    console.log(`  • Total files: ${withDates.length}`);
    console.log(`  • First release: ${withDates[0].datetime.split("T")[0]}`);
    console.log(
      `  • Last release: ${withDates[withDates.length - 1].datetime.split("T")[0]}`,
    );

    // Show first few entries
    console.log(chalk.cyan("\nFirst 5 entries:"));
    withDates.slice(0, 5).forEach((item, i) => {
      console.log(
        `  ${i + 1}. ${chalk.yellow(item.artist)} - ${chalk.white(item.title)}`,
      );
      console.log(`     Date: ${item.datetime.split("T")[0]}`);
    });

    return withDates;
  } catch (error) {
    console.error(chalk.red("Error:"), error.message);
    throw error;
  }
}

// Export functions
module.exports = {
  extractMP3Metadata,
  scanMP3Directory,
  assignReleaseDates,
  processMP3Directory,
};

// Allow running directly from command line
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(
      chalk.yellow(
        "Usage: node extract-metadata.js <directory-path> [options]",
      ),
    );
    console.log(chalk.gray("\nOptions:"));
    console.log(
      chalk.gray(
        "  --random-dates    Assign random dates instead of sequential daily",
      ),
    );
    console.log(
      chalk.gray(
        "  --keep-order      Keep original file order (don't shuffle)",
      ),
    );
    console.log(chalk.gray("  --start-date      Starting date (ISO format)"));
    console.log(
      chalk.gray(
        "\nDefault behavior: Shuffle songs, assign sequential daily releases",
      ),
    );
    process.exit(1);
  }

  const directoryPath = args[0];
  const options = {
    randomizeDates: args.includes("--random-dates"),
    keepOrder: args.includes("--keep-order"),
  };

  // Check for --start-date argument
  const startDateIndex = args.indexOf("--start-date");
  if (startDateIndex !== -1 && args[startDateIndex + 1]) {
    options.startDate = args[startDateIndex + 1];
  }

  processMP3Directory(directoryPath, options)
    .then((data) => {
      // Save to JSON for inspection
      const outputPath = path.join(__dirname, "mp3-data.json");
      require("fs").writeFileSync(outputPath, JSON.stringify(data, null, 2));
      console.log(chalk.gray(`\nData saved to ${outputPath}`));
    })
    .catch((error) => {
      console.error(chalk.red("Fatal error:"), error);
      process.exit(1);
    });
}
