import * as readline from "readline";

const LEVEL_COLORS: Record<string, string> = {
  info: "\x1b[32m", // green
  warn: "\x1b[33m", // yellow
  error: "\x1b[31m", // red
  debug: "\x1b[36m", // cyan
};
const RESET = "\x1b[0m";

process.stdin.setEncoding("utf8");

const rl = readline.createInterface({
  input: process.stdin,
  crlfDelay: Infinity,
});

rl.on("line", (line) => {
  const trimmed = line.trim();
  if (!trimmed) return;

  try {
    const entry = JSON.parse(trimmed);
    const { level, message, timestamp, context } = entry;
    const color = LEVEL_COLORS[level] ?? "";
    const time = new Date(timestamp).toLocaleTimeString();

    process.stdout.write(
      `${color}[${time}] ${level.toUpperCase().padEnd(5)}${RESET} ${message}\n`
    );

    if (context) {
      Object.entries(context).forEach(([k, v]) => {
        process.stdout.write(`    ${k}: ${JSON.stringify(v)}\n`);
      });
    }
  } catch {
    process.stdout.write(line + "\n");
  }
});

rl.on("close", () => {
  process.exit(0);
});
