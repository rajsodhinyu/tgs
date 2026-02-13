const fs = require("fs");
const { execSync } = require("child_process");
const crypto = require("crypto");
const chalk = require("chalk");

function generateKey() {
  return crypto.randomBytes(6).toString("hex");
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Convert plain text description into Sanity Portable Text blocks
 */
function toPortableText(description) {
  if (!description) return [];

  const paragraphs = description.split(/\n\n+/).filter((p) => p.trim());

  return paragraphs.map((paragraph) => ({
    _type: "block",
    _key: generateKey(),
    style: "normal",
    markDefs: [],
    children: [
      {
        _type: "span",
        _key: generateKey(),
        text: paragraph.replace(/\n/g, " ").trim(),
        marks: [],
      },
    ],
  }));
}

/**
 * Fetch YouTube video metadata using yt-dlp
 */
function fetchVideoMetadata(url) {
  try {
    const output = execSync(
      `yt-dlp --dump-json --no-download --no-warnings "${url}"`,
      { encoding: "utf-8", maxBuffer: 10 * 1024 * 1024, timeout: 30000 },
    );
    const data = JSON.parse(output);
    return {
      title: data.title || "",
      description: data.description || "",
      url: data.webpage_url || url,
      uploadDate: data.upload_date || null, // YYYYMMDD format
    };
  } catch (error) {
    console.error(chalk.red(`  Failed to fetch: ${url}`));
    console.error(chalk.gray(`  ${error.message}`));
    return null;
  }
}

/**
 * Convert video metadata to a Sanity post document
 */
function toSanityDocument(video) {
  const name = video.title.toUpperCase();
  const slug = slugify(video.title);

  // Parse upload date (YYYYMMDD -> YYYY-MM-DD)
  let date;
  if (video.uploadDate) {
    const d = video.uploadDate;
    date = `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;
  } else {
    date = new Date().toISOString().split("T")[0];
  }

  return {
    _type: "post",
    _id: `youtube-${generateKey()}`,
    name,
    youtubeURL: video.url,
    slug: { _type: "slug", current: slug },
    date,
    private: true,
    content: toPortableText(video.description),
  };
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.length === 0) {
    console.log(chalk.yellow("Usage: node import-youtube.js <urls.txt> [output.ndjson]"));
    console.log(chalk.gray("\n  Reads YouTube URLs (one per line) from a text file,"));
    console.log(chalk.gray("  fetches metadata via yt-dlp, and generates NDJSON for Sanity import."));
    console.log(chalk.gray("\n  Posts are created with private=true. Add thumbnails in Sanity Studio."));
    console.log(chalk.gray("\nOptions:"));
    console.log(chalk.gray("  --no-description   Skip importing video descriptions"));
    console.log(chalk.gray("\nExample:"));
    console.log(chalk.cyan("  node import-youtube.js youtube-urls.txt"));
    console.log(chalk.cyan("  cd ../thatgoodsht && sanity dataset import ../scripts/import.ndjson tgs"));
    process.exit(0);
  }

  const inputFile = args.find((a) => !a.startsWith("--"));
  const outputFile = args.find((a, i) => !a.startsWith("--") && i > args.indexOf(inputFile)) || "import.ndjson";
  const skipDescription = args.includes("--no-description");

  if (!fs.existsSync(inputFile)) {
    console.error(chalk.red(`File not found: ${inputFile}`));
    process.exit(1);
  }

  const urls = fs
    .readFileSync(inputFile, "utf-8")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));

  console.log(chalk.blue(`\nFound ${urls.length} URLs in ${inputFile}\n`));

  const documents = [];

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    console.log(chalk.gray(`[${i + 1}/${urls.length}] Fetching: ${url}`));

    const metadata = fetchVideoMetadata(url);
    if (!metadata) continue;

    if (skipDescription) metadata.description = "";

    const doc = toSanityDocument(metadata);
    documents.push(doc);

    console.log(chalk.green(`  -> ${doc.name}`));
  }

  if (documents.length === 0) {
    console.error(chalk.red("\nNo videos fetched successfully."));
    process.exit(1);
  }

  // Write NDJSON
  const ndjson = documents.map((doc) => JSON.stringify(doc)).join("\n");
  fs.writeFileSync(outputFile, ndjson);

  console.log(chalk.green(`\n${documents.length}/${urls.length} videos processed.`));
  console.log(chalk.cyan(`Output: ${outputFile}`));
  console.log(chalk.gray("\nNext steps:"));
  console.log(chalk.gray("  1. Add thumbnails manually in Sanity Studio"));
  console.log(chalk.gray("  2. Import to Sanity:"));
  console.log(chalk.cyan("     cd ../thatgoodsht"));
  console.log(chalk.cyan(`     sanity dataset import ../scripts/${outputFile} tgs\n`));
}

main();
