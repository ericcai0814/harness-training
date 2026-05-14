---
name: secret-detector
description: Detects potential secrets and API keys in content before exposure. Use proactively when handling content that may contain API keys, before logging output, or before persisting data to disk.
allowed-tools: Read, Grep, Glob, Bash(rg *), Bash(grep *)
disable-model-invocation: false
---

# Secret Detector

偵測程式碼、log、輸出中潛在的 secret 與 API key，於曝光前攔截並提示遮罩或輪換。

## When to use this skill

- 即將 log / echo 使用者輸入或外部 API response
- 即將 persist 內容到檔案系統、DB 或外部服務
- Code review 時審視新增 / 修改的檔案是否含 hardcode 憑證

## When NOT to use this skill

- `.env.example` / `.env.sample` / `.env.template` — 合法 placeholder 檔
- Snapshot 檔（`__snapshots__/`、`fixtures/`、`*.snap`）— 測試固定 token
- 文件範例（`README.md`、`docs/`）— `<your-key-here>` 字面占位符
- 字面占位符：`<your-...>`、`xxx-replace-me`、`***REDACTED***`、`example-key`

## Procedure

1. **Detect** — 對目標內容跑 Patterns 段 regex；記錄每個 hit 的 `file:line`
2. **Validate** — 比對 When NOT to use 白名單（路徑前綴、檔名 glob、字面占位符）
3. **Decide**
   - **BLOCK**：符合具體 vendor 格式（`sk-`、`ghp_`、`AKIA`、`xox*`、PEM）且非白名單
   - **WARN**：通用字面（`api_key=...`、`password=...`）但 entropy 不足以確定
   - **PASS**：白名單命中、或字面占位符
4. **Report** — 回傳 `{verdict, pattern, location, masked_snippet, reason}`，secret 一律遮罩

## Patterns

| Regex | 描述 |
|---|---|
| `api[_-]?key` | 通用 key 字面 |
| `secret\|token\|password` | 通用 secret 字面 |
| `sk-[A-Za-z0-9]{20,}` | OpenAI / Anthropic |
| `ghp_[A-Za-z0-9]{30,}` | GitHub PAT |
| `AKIA[0-9A-Z]{16}` | AWS access key |
| `xox[baprs]-[A-Za-z0-9-]{10,}` | Slack token |
| `-----BEGIN (RSA\|EC\|OPENSSH) PRIVATE KEY` | PEM private key |

## Hard constraints

- Never 改檔；只回報，由呼叫者決定處置。
- Never echo 真 secret 字面 — 一律遮罩為 `sk-***` 或 `<truncated>`。
- 邊界條件：高 entropy 隨機字串（hash、UUID、base64 payload）可能誤判 → 必須先比對白名單路徑再判 BLOCK。

## Validation checklist

- [ ] 真 `sk-` / `ghp_` / `AKIA` 字面 → BLOCK
- [ ] `.env.example` 內 placeholder → PASS
- [ ] `__snapshots__/*.snap` 內 token → PASS
- [ ] `<your-openai-key-here>` 字面 → PASS
- [ ] 回報訊息中所有 secret 已遮罩、無原文
