#!/usr/bin/env node
import { writeFile } from "node:fs/promises";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { createFlashcards } from "./agent.js";
import { toConsoleList } from "./formatter.js";
import { loadNotesFromFile } from "./fileLoader.js";

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
    return;
  }

  const notes = args.file ? await loadNotesFromFile(args.file) : await readFromStdin();
  const warnings = [];

  const result = await createFlashcards(notes, {
    mock: args.mock,
    model: args.model,
    minCards: numberArg(args.minCards),
    maxCards: numberArg(args.maxCards),
    onWarning: (warning) => warnings.push(warning)
  });

  if (args.jsonOut) {
    await writeFile(args.jsonOut, result.json, "utf8");
  }
  if (args.mdOut) {
    await writeFile(args.mdOut, result.markdown, "utf8");
  }

  for (const warning of [...warnings, ...result.warnings]) {
    console.warn(`Warning: ${warning}`);
  }

  console.log(toConsoleList(result.flashcards));
}

function parseArgs(argv) {
  const args = {};

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") args.help = true;
    else if (arg === "--mock") args.mock = true;
    else if (arg === "--file" || arg === "-f") args.file = argv[++index];
    else if (arg === "--json-out") args.jsonOut = argv[++index];
    else if (arg === "--md-out") args.mdOut = argv[++index];
    else if (arg === "--model") args.model = argv[++index];
    else if (arg === "--min-cards") args.minCards = argv[++index];
    else if (arg === "--max-cards") args.maxCards = argv[++index];
    else throw new Error(`Unknown argument: ${arg}`);
  }

  return args;
}

async function readFromStdin() {
  if (!process.stdin.isTTY) {
    let data = "";
    for await (const chunk of process.stdin) {
      data += chunk;
    }
    if (data.trim()) return data;
  }

  const rl = createInterface({ input, output });
  const lines = [];
  console.log("Paste notes below. Submit an empty line when finished.");

  while (true) {
    const line = await rl.question("> ");
    if (!line.trim()) break;
    lines.push(line);
  }

  rl.close();
  return lines.join("\n");
}

function numberArg(value) {
  return value === undefined ? undefined : Number(value);
}

function printHelp() {
  console.log(`Study Buddy Agent

Usage:
  node src/cli.js --file examples/technical-notes.md
  node src/cli.js --file lecture-slides.pdf
  node src/cli.js --file notes.md --json-out cards.json --md-out cards.md
  node src/cli.js --file notes.md --mock

Options:
  -f, --file <path>       Read notes from a .txt, .md, or text-based .pdf file
  --json-out <path>       Save validated flashcards as JSON
  --md-out <path>         Save a readable Markdown flashcard list
  --model <id>            Override the Claude model
  --mock                  Run without an API key using a deterministic local generator
  -h, --help              Show this help text

Environment:
  ANTHROPIC_API_KEY       Required unless --mock is used
  ANTHROPIC_MODEL         Optional model override`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
