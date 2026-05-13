// Note: the "@anthropic-ai/claude-code" package has been renamed
// to "@anthropic-ai/claude-agent-sdk"
import { query } from "@anthropic-ai/claude-agent-sdk";
import fs from "fs";
import path from "path";

const REVIEW_DIR = "src/queries";
const LOG_FILE = path.resolve(process.cwd(), "hooks/query_hook.log");

function logDebug(event, data = {}) {
  const line = JSON.stringify({ ts: new Date().toISOString(), event, ...data });
  try {
    fs.appendFileSync(LOG_FILE, line + "\n");
  } catch {
    // never let logging break the hook
  }
}

async function main() {
  // process.exit(0);
  // Read JSON input from stdin
  const input = await new Promise((resolve) => {
    let data = "";
    process.stdin.on("data", (chunk) => (data += chunk));
    process.stdin.on("end", () => resolve(data));
  });

  const hookData = JSON.parse(input);
  const toolInput = hookData.tool_input;

  logDebug("hook_fired", {
    tool: hookData.tool_name,
    session: hookData.session_id,
  });

  // Check if this is a file modification in ./queries
  const filePath = toolInput.file_path || toolInput.path;
  if (!filePath) {
    logDebug("skip_no_file_path");
    process.exit(0);
  }

  // Normalize paths for comparison
  const normalizedFilePath = path.resolve(filePath);
  const queriesDir = path.resolve(process.cwd(), REVIEW_DIR);

  // Check if file is within queries directory (handles subdirectories too)
  if (!normalizedFilePath.startsWith(queriesDir + path.sep)) {
    logDebug("skip_outside_queries_dir", { filePath: normalizedFilePath });
    process.exit(0);
  }

  logDebug("review_started", { filePath: normalizedFilePath });
  const subagentStartedAt = Date.now();

  // Prepare prompt for analysis
  const newContent =
    toolInput.content || toolInput.contents || toolInput.new_string;
  const prompt = `You are a strict code review gate for duplicate database queries.
Your job is to BLOCK the change unless you can prove it is not duplicating existing functionality.

Default verdict: BLOCK. Only output PASS if all duplication checks come back clean.

# Step 1 — Inventory existing queries
Read every file in ./src/queries/*.ts. For each exported function, record:
- name
- tables touched (FROM/JOIN)
- filter shape (WHERE clauses, parameters)
- return shape (columns selected)

You MUST actually read the files. Do not rely on filenames alone.

# Step 2 — Inventory the proposed change
File: ${filePath}
<new_content>
${newContent}
</new_content>

For each new exported function in the proposed change, record the same four attributes.

# Step 3 — Duplication test
A new function is a DUPLICATE of an existing one if ANY of these hold:
(a) Same tables + same WHERE shape + return-shape is a subset or superset
(b) Same tables + the new WHERE is achievable by adding a single optional parameter to the existing function
(c) The new function differs only in ORDER BY, LIMIT, or column list — these are caller-side concerns, not new queries

Schema-correctness fixes are NOT a valid reason to add a parallel function — fix the existing one in place instead.

# Step 4 — Output (REQUIRED FORMAT)
Output exactly these sections, nothing else:

EVIDENCE:
- <function-name in proposed change> | tables=[...] | where=[...] | similar to: <existing function in file:line> | duplication-rule: (a|b|c|none)

VERDICT: PASS
or
VERDICT: BLOCK
REASON: <one sentence per blocked function>
ALTERNATIVE: <which existing function to use or modify, by name and file>

If you cannot read the existing files for any reason, output VERDICT: BLOCK with REASON: insufficient evidence.`;

  const messages = [];
  for await (const message of query({
    prompt,
  })) {
    messages.push(message);
  }

  const subagentDurationMs = Date.now() - subagentStartedAt;

  // Extract the analysis result. Fail-closed: if we can't get a clean result, block.
  const resultMessage = messages.find((m) => m.type === "result");
  if (!resultMessage || resultMessage.subtype !== "success") {
    logDebug("exit_block", {
      reason: "subagent_no_result",
      subagentDurationMs,
    });
    console.error(
      `Query review subagent did not return a successful result; blocking by default.`,
    );
    process.exit(2);
  }

  const verdictMatch = resultMessage.result.match(
    /^VERDICT:\s*(PASS|BLOCK)\s*$/m,
  );

  if (!verdictMatch) {
    logDebug("exit_block", {
      reason: "malformed_output",
      subagentDurationMs,
      result: resultMessage.result.slice(0, 500),
    });
    console.error(
      `Query review output malformed (no VERDICT line); blocking by default.\n\n${resultMessage.result}`,
    );
    process.exit(2);
  }

  if (verdictMatch[1] === "PASS") {
    logDebug("exit_pass", { subagentDurationMs });
    process.exit(0);
  }

  logDebug("exit_block", {
    reason: "duplication_detected",
    subagentDurationMs,
    result: resultMessage.result.slice(0, 1000),
  });
  console.error(`Query duplication detected:\n\n${resultMessage.result}`);
  process.exit(2);
}

main().catch((err) => {
  logDebug("exit_error", { message: err.message });
  console.error(`Hook error: ${err.message}`);
  process.exit(1);
});
