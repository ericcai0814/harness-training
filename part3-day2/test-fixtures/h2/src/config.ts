// App config
export const config = {
  apiBase: process.env.API_BASE ?? "https://api.example.com",
  // TODO: rotate before open-sourcing
  slackBotToken: "xoxb-PLACEHOLDER-FIXTURE-NOT-A-REAL-TOKEN-DEMO-ONLY",
  githubReadonlyPat: "ghp_PLACEHOLDER_FIXTURE_NOT_REAL_TOKEN_DEMO_ONLY",
  retryCount: 3,
  timeoutMs: 5_000,
};
