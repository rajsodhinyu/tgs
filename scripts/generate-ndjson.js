const fs = require("fs");
const path = require("path");
const chalk = require("chalk");

/**
 * Convert MP3 data to Sanity document format
 */
function convertToSanityDocument(mp3Item) {
  // Get absolute path for the file
  const absolutePath = path.resolve(mp3Item.filePath);

  return {
    _id: mp3Item._id,
    _type: "sotd",
    name: mp3Item.title,
    artist: mp3Item.artist,
    datetime: mp3Item.datetime,
    file: {
      _type: "file",
      _sanityAsset: `file@file://${absolutePath}`,
    },
  };
}

/**
 * Generate NDJSON file from MP3 data
 */
function generateNDJSON(mp3Data, outputPath = "import.ndjson") {
  console.log(chalk.blue("\n📝 Generating NDJSON for Sanity import...\n"));

  try {
    // Convert each item to Sanity format
    const sanityDocuments = mp3Data.map(convertToSanityDocument);

    // Create NDJSON content (one JSON object per line)
    const ndjsonContent = sanityDocuments
      .map((doc) => JSON.stringify(doc))
      .join("\n");

    // Write to file
    fs.writeFileSync(outputPath, ndjsonContent);

    // Display summary
    console.log(chalk.green("✅ NDJSON file generated successfully!\n"));
    console.log(chalk.cyan("Summary:"));
    console.log(`  • Output file: ${outputPath}`);
    console.log(`  • Documents: ${sanityDocuments.length}`);
    console.log(`  • Document type: sotd`);

    // Show preview of first few documents
    console.log(chalk.cyan("\nFirst 3 documents preview:"));
    sanityDocuments.slice(0, 3).forEach((doc, i) => {
      console.log(chalk.gray(`\nDocument ${i + 1}:`));
      console.log(`  ID: ${doc._id}`);
      console.log(`  Artist: ${doc.artist}`);
      console.log(`  Title: ${doc.name}`);
      console.log(`  Date: ${doc.datetime.split("T")[0]}`);
      console.log(
        `  File: ${path.basename(doc.file._sanityAsset.replace("file@file://", ""))}`,
      );
    });

    return {
      success: true,
      documentsCount: sanityDocuments.length,
      outputPath: outputPath,
    };
  } catch (error) {
    console.error(chalk.red("❌ Error generating NDJSON:"), error.message);
    throw error;
  }
}

/**
 * Validate MP3 data before conversion
 */
function validateMP3Data(mp3Data) {
  const errors = [];
  const warnings = [];

  mp3Data.forEach((item, index) => {
    // Check required fields
    if (!item._id) {
      errors.push(`Item ${index}: Missing _id`);
    }
    if (!item.title && !item.name) {
      errors.push(`Item ${index}: Missing title`);
    }
    if (!item.artist) {
      warnings.push(
        `Item ${index}: Missing artist (will use 'Unknown Artist')`,
      );
    }
    if (!item.datetime) {
      errors.push(`Item ${index}: Missing datetime`);
    }
    if (!item.filePath) {
      errors.push(`Item ${index}: Missing filePath`);
    } else {
      // Check if file exists
      const absolutePath = path.resolve(item.filePath);
      if (!fs.existsSync(absolutePath)) {
        errors.push(`Item ${index}: File not found: ${item.filePath}`);
      }
    }
  });

  // Check for duplicate IDs
  const ids = mp3Data.map((item) => item._id).filter(Boolean);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicateIds.length > 0) {
    errors.push(`Duplicate IDs found: ${duplicateIds.join(", ")}`);
  }

  return { errors, warnings };
}

/**
 * Main function to generate NDJSON from JSON file
 */
async function generateFromJSON(
  inputPath = "mp3-data.json",
  outputPath = "import.ndjson",
) {
  try {
    // Read JSON file
    if (!fs.existsSync(inputPath)) {
      throw new Error(`Input file not found: ${inputPath}`);
    }

    const jsonContent = fs.readFileSync(inputPath, "utf-8");
    const mp3Data = JSON.parse(jsonContent);

    if (!Array.isArray(mp3Data)) {
      throw new Error("Input JSON must be an array of MP3 data");
    }

    console.log(chalk.blue(`\n📂 Loading data from: ${inputPath}`));
    console.log(chalk.gray(`Found ${mp3Data.length} items\n`));

    // Validate data
    const validation = validateMP3Data(mp3Data);

    if (validation.warnings.length > 0) {
      console.log(chalk.yellow("⚠️  Warnings:"));
      validation.warnings.forEach((warning) =>
        console.log(chalk.yellow(`   • ${warning}`)),
      );
      console.log("");
    }

    if (validation.errors.length > 0) {
      console.log(chalk.red("❌ Validation errors:"));
      validation.errors.forEach((error) =>
        console.log(chalk.red(`   • ${error}`)),
      );
      throw new Error(
        "Validation failed. Please fix errors before proceeding.",
      );
    }

    // Generate NDJSON
    return generateNDJSON(mp3Data, outputPath);
  } catch (error) {
    console.error(chalk.red("Error:"), error.message);
    throw error;
  }
}

// Export functions
module.exports = {
  convertToSanityDocument,
  generateNDJSON,
  validateMP3Data,
  generateFromJSON,
};

// Allow running directly from command line
if (require.main === module) {
  const args = process.argv.slice(2);

  const inputPath = args[0] || "mp3-data.json";
  const outputPath = args[1] || "import.ndjson";

  if (args.includes("--help")) {
    console.log(
      chalk.yellow(
        "Usage: node generate-ndjson.js [input.json] [output.ndjson]",
      ),
    );
    console.log(chalk.gray("\nDefaults:"));
    console.log(chalk.gray("  input.json: mp3-data.json"));
    console.log(chalk.gray("  output.ndjson: import.ndjson"));
    process.exit(0);
  }

  (async () => {
    try {
      const result = await generateFromJSON(inputPath, outputPath);
      console.log(chalk.green(`\n✨ Ready for import!`));
      console.log(chalk.gray(`\nNext step: Run the import command:`));
      console.log(chalk.cyan(`  cd ../thatgoodsht`));
      console.log(
        chalk.cyan(
          `  sanity dataset import ../scripts/${result.outputPath} tgs --replace\n`,
        ),
      );
    } catch (error) {
      console.error(chalk.red("\nFatal error:"), error.message);
      process.exit(1);
    }
  })();
}
