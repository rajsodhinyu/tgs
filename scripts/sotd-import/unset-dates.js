/**
 * Unschedule Song-of-the-Day docs by clearing their `datetime` field.
 *
 * This makes a SOTD doc "unscheduled" — it drops off the release calendar but
 * stays visible in the SOTD calendar sidebar (same end state as importing with
 * --no-date). Useful for pulling songs back out of the schedule after import.
 *
 * Usage:
 *   node unset-dates.js <id> [<id> ...]        # unset dates on the given doc IDs
 *   node unset-dates.js --file unset-dates.json # replay a saved mutations payload
 *   node unset-dates.js <ids...> --dry-run      # print what would change, don't write
 *
 * Requires SANITY_TOKEN (with write access) in a .env file in this directory.
 *
 * The optional unset-dates.json alongside this script is an example payload in
 * Sanity's mutations format — a frozen snapshot of a past run, kept as a sample.
 */
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const { createClient } = require("@sanity/client");
const config = require("./config");

function parseArgs(argv) {
  const ids = [];
  let filePath = null;
  let dryRun = false;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dry-run") dryRun = true;
    else if (a === "--file") filePath = argv[++i];
    else if (a.startsWith("--")) {
      console.error(chalk.red(`Unknown flag: ${a}`));
      process.exit(1);
    } else ids.push(a);
  }
  return { ids, filePath, dryRun };
}

function idsFromFile(filePath) {
  const resolved = path.isAbsolute(filePath)
    ? filePath
    : path.join(__dirname, filePath);
  const payload = JSON.parse(fs.readFileSync(resolved, "utf8"));
  return (payload.mutations || [])
    .map((m) => m.patch && m.patch.id)
    .filter(Boolean);
}

async function main() {
  const { ids: argIds, filePath, dryRun } = parseArgs(process.argv.slice(2));
  const ids = filePath ? idsFromFile(filePath) : argIds;

  if (ids.length === 0) {
    console.log(
      chalk.yellow(
        "Usage: node unset-dates.js <id> [<id> ...]  |  --file unset-dates.json  [--dry-run]",
      ),
    );
    process.exit(1);
  }

  console.log(
    chalk.blue(`Unsetting datetime on ${ids.length} SOTD doc(s):`),
  );
  ids.forEach((id) => console.log(chalk.gray(`  • ${id}`)));

  if (dryRun) {
    console.log(chalk.cyan("\n--dry-run: no changes written."));
    return;
  }

  if (!config.sanity.token) {
    console.error(
      chalk.red("\nMissing SANITY_TOKEN (need write access). Add it to .env."),
    );
    process.exit(1);
  }

  const client = createClient(config.sanity);
  let tx = client.transaction();
  ids.forEach((id) => {
    tx = tx.patch(id, (p) => p.unset(["datetime"]));
  });

  await tx.commit();
  console.log(chalk.green(`\n✅ Unscheduled ${ids.length} doc(s).`));
}

main().catch((err) => {
  console.error(chalk.red("\nFatal error:"), err.message);
  process.exit(1);
});
