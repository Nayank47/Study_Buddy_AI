# Study Buddy Agent

A JavaScript AI agent that turns raw student notes into validated flashcards.

The agent follows the requested v1 architecture:

```text
Notes -> Preprocessor -> Flashcard Generator Agent -> Validator -> JSON + readable output
```

## Features

- Accepts pasted notes, `.txt`, `.md`, and text-based `.pdf` files
- Calls Claude through the official Anthropic JavaScript SDK
- Uses a structured prompt designed for atomic Q&A flashcards
- Validates card count, question shape, answer length, duplicates, and rough source support
- Outputs both JSON and a readable Markdown/list view
- Includes mock mode so non-technical users can try the flow before adding an API key

## Requirements

- Node.js 20+
- An Anthropic API key for real generation

## Setup

```bash
npm install
```

Set your API key:

```bash
$env:ANTHROPIC_API_KEY="your_api_key_here"
```

On macOS/Linux:

```bash
export ANTHROPIC_API_KEY="your_api_key_here"
```

The default model is `claude-sonnet-4-5`, matching the Claude Messages API examples. You can override it:

```bash
$env:ANTHROPIC_MODEL="claude-sonnet-4-5"
```

## Run

Generate flashcards from a Markdown notes file:

```bash
node src/cli.js --file examples/technical-notes.md
```

Generate flashcards from a PDF:

```bash
node src/cli.js --file lecture-notes.pdf
```

Save JSON and Markdown outputs:

```bash
node src/cli.js --file examples/technical-notes.md --json-out cards.json --md-out cards.md
```

Try the flow without an API key:

```bash
node src/cli.js --file examples/technical-notes.md --mock
```

Paste notes interactively:

```bash
node src/cli.js
```

## Run In A Web Browser

Start the local website:

```bash
npm run web
```

Open this in your browser:

```text
http://localhost:3000
```

The website accepts pasted notes or file uploads for PDF, TXT, and Markdown. Leave `Demo` on to test without an API key. Turn it off after setting `ANTHROPIC_API_KEY` to generate with Claude.

## Run In Visual Studio Code

1. Open Visual Studio Code.
2. Choose `File` -> `Open Folder`.
3. Open this folder: `C:\Users\dines\Documents\Codex\2026-05-29\files-mentioned-by-the-user-study\outputs\study-buddy-agent`
4. Open `Terminal` -> `New Terminal`.
5. Run `npm install`.
6. Run `npm run web`.
7. Open `http://localhost:3000` in your browser.

## Deploy To Vercel

This project is Vercel-ready:

- `public/` contains the browser website
- `api/flashcards.js` is the Vercel Function for generating flashcards
- `api/health.js` is a simple health check
- `vercel.json` gives the flashcard function a 30-second max duration

### Option 1: Deploy From GitHub

1. Create a GitHub repository.
2. Upload this project folder to that repository.
3. Go to Vercel and choose `Add New` -> `Project`.
4. Import the GitHub repository.
5. Use these settings:
   - Framework Preset: `Other`
   - Build Command: leave empty
   - Output Directory: leave empty
   - Install Command: `npm install`
6. Add an environment variable:
   - Name: `ANTHROPIC_API_KEY`
   - Value: your Anthropic API key
7. Click `Deploy`.

Leave Demo mode on if you want the deployed site to work without an API key. Turn Demo mode off in the website when you want real Claude generation.

### Option 2: Deploy With The Vercel CLI

```bash
npm install -g vercel
vercel
```

When asked for the project directory, run the command from this folder:

```text
C:\Users\dines\Documents\Codex\2026-05-29\files-mentioned-by-the-user-study\outputs\study-buddy-agent
```

Then add `ANTHROPIC_API_KEY` in the Vercel dashboard under Project Settings -> Environment Variables.

## Example Runs

The `examples` folder includes three note types:

- `technical-notes.md`
- `history-notes.md`
- `biology-notes.md`

Run each in mock mode:

```bash
node src/cli.js --file examples/technical-notes.md --mock --json-out examples/technical-output.json --md-out examples/technical-output.md
node src/cli.js --file examples/history-notes.md --mock --json-out examples/history-output.json --md-out examples/history-output.md
node src/cli.js --file examples/biology-notes.md --mock --json-out examples/biology-output.json --md-out examples/biology-output.md
```

Real Claude runs use the same commands without `--mock`.

## PDF Support

PDF support uses `pdf-parse` to extract selectable text before sending notes through the same Study Buddy pipeline.

This works for normal text-based PDFs, such as exported lecture notes, articles, or slide decks with selectable text. Scanned PDFs and image-only handouts require OCR first; the agent will stop with a clear message if no text can be extracted.

## Project Structure

```text
src/
  agent.js          Orchestrates preprocessing, generation, parsing, validation, formatting
  claudeClient.js   Anthropic SDK integration
  cli.js            Command-line interface
  fileLoader.js     Routes .txt/.md/.pdf input files
  formatter.js      JSON, Markdown, and console output
  mockClient.js     Local deterministic demo generator
  parser.js         Robust JSON extraction from model responses
  pdfExtractor.js   Text extraction for PDF uploads
  preprocessor.js   Text cleaning and chunking
  prompt.js         Flashcard generation prompt
  server.js         Local web server and browser API
  schema.js         Expected JSON shape
  validator.js      Guardrails and dedupe
test/
  *.test.js         Node test runner coverage
api/
  flashcards.js     Vercel Function for /api/flashcards
  health.js         Vercel Function for /api/health
examples/
  *.md              Sample notes
```

## JSON Output Shape

```json
{
  "flashcards": [
    {
      "question": "What does authentication prove in an API?",
      "answer": "Authentication proves who the requester is.",
      "topic": "API security",
      "difficulty": "easy",
      "sourceHint": "Authentication proves who the requester is..."
    }
  ]
}
```

## Agent Design Notes

This is more than a raw API call because the app wraps the model in a repeatable workflow: input cleaning, structured prompt rules, JSON parsing, validation, duplicate filtering, and stable output formatting.

The validator is intentionally deterministic. It cannot prove a card is perfect, but it catches common LLM failure modes before returning output: malformed JSON, vague/short cards, missing question marks, duplicate cards, unsupported answers, and wrong card counts.

For v1, long inputs are chunked and the first chunk is processed. A production v2 could generate cards per chunk and run a merge-and-rank pass.

## Tests

```bash
npm test
```

## Demo Script

1. Show `examples/technical-notes.md` as messy input.
2. Explain the flow in `src/agent.js`.
3. Open `src/prompt.js` to show prompt constraints for atomic cards.
4. Open `src/validator.js` to show guardrails and dedupe.
5. Run `node src/cli.js --file examples/technical-notes.md --mock`.
6. Run the same command without `--mock` after setting `ANTHROPIC_API_KEY`.
