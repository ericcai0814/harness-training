# 同伴 1 — secret-detector skill + secret-scanner subagent

> **本份小抄訓練重點**：練「給 Claude 講清楚需求」+「驗收 Claude 寫的東西」兩種能力。
> 重點在誤判邊界感（false positive，FP — 分辨真的 API key vs 範例佔位符）。
> **Peer share 互看時可以順手翻其他人那份看**：
>   - 同伴 2 練「窄化 Bash 指令模式」（narrow Bash predicate — 像 `Bash(rm *)` 而不是 `Bash`）
>   - 同伴 3 練「用 git diff 篩變動範圍」
>   - 同伴 4 練「不同檔案類型的決策表 + 框架白名單」

**對應 Part 2 hook**：`UserPromptSubmit *` 擋 API key / 機敏資訊

---

#### 1. 給 Claude 的 prompt 起點（複製這段、貼進 Claude）

```
我要寫一個 skill 偵測 secret。請幫我生成兩個檔案：

A. ~/.claude/skills/secret-detector/SKILL.md

Frontmatter 必填：
- name: secret-detector（小寫連字號、不含 anthropic 或 claude 字串）
- description: 雙句式。
   · 第一句講 what — 「偵測潛在 secret」
   · 第二句以小寫 `use proactively when` 起頭、列 3 個情境（處理可能含
     API key 的內容、log 之前、persist 之前）
   · 整段控制在 300 字元內
- allowed-tools: Read, Grep, Glob, Bash(rg *), Bash(grep *)
  （不要寫裸 Bash — 要帶模式括號限定子命令）
- disable-model-invocation: false（這是檢查器、要自動觸發）

Body 必含以下段落：
- ## When to use this skill — 3 個正面情境
- ## When NOT to use this skill — 至少 4 個誤判來源：
   · .env.example / .env.sample / .env.template
   · snapshot 檔（__snapshots__/、fixtures/）
   · 文件示範 key（README.md 內的 placeholder）
   · <your-key-here> 字面占位符
- ## Procedure — 4 步：Detect / Validate / Decide / Report
- ## Hard constraints — never 改檔、列邊界條件
- ## References（如果 SKILL.md > 80 行才拆出來放 patterns.md）

Patterns 段請涵蓋這 7 條 regex 當起點：
   api[_-]?key                              # 通用 key 字面
   secret|token|password                     # 通用 secret 字面
   sk-[A-Za-z0-9]{20,}                       # OpenAI / Anthropic
   ghp_[A-Za-z0-9]{30,}                      # GitHub PAT
   AKIA[0-9A-Z]{16}                          # AWS access key
   xox[baprs]-[A-Za-z0-9-]{10,}              # Slack token
   -----BEGIN (RSA|EC|OPENSSH) PRIVATE KEY   # PEM private key


B. ~/.claude/agents/secret-scanner.md

Frontmatter：
- name: secret-scanner
- description: 雙句式、第二句用小寫 `use proactively before logging,
  echoing, or persisting any user input`、加 `Returns 結構化 finding`
- tools: [Read, Grep, Glob, Bash(rg *)]（明確列出，不要省略）
- disallowedTools: Write, Edit, NotebookEdit
  （雙保險 — 即使未來 tools 擴大，這條硬保證不准寫檔）
- model: haiku（pattern-match 任務用 haiku 就夠）
- permissionMode: acceptEdits（唯讀 allowlist 下不會出事、跳過權限提示）
- maxTurns: 25（防 stuck）
- memory: project（跨對話累積 pattern 知識）

Body：
- Persona 一句話 + 反向邊界（「You do not write files. You do not echo
  secrets back. ...」）
- ## Memory hygiene 段（開工掃 / 完工 date stamp / 引用前 verify）
- ## Inputs you expect
- ## Procedure 5 步：Detect → Gather → Cross-reference memory → Return
   結構化 bundle（FINDING / Pattern / Location / Remediation /
   What we don't know）→ Update memory with YYYY-MM-DD
- ## Hard constraints
- ## Completion — 最後一行 must be:
   DONE / DONE_WITH_CONCERNS / BLOCKED / NEEDS_CONTEXT

兩個檔案請參考結構：
- ~/.claude/agents/security-reviewer.md（subagent 完整範本）
- ~/.claude/skills/quality-gate/SKILL.md（中文 + 表格 + Security 段）
```

> 給 Claude 的時候**一次貼完整段**，不要拆分。Claude 看得到完整需求才不會給你通用模板。

---

#### 2. Claude 寫完之後、你逐條打勾驗收

不通過就退回去叫它改。直接說「第 N 條沒過、原因是 X、請改 Y 段」。

**Skill (`SKILL.md`) 檢查**：

- [ ] `description` 第二句包含小寫 `use proactively when`
  （**不能**是 `Use PROACTIVELY`（大寫——這是社群慣例不是官方明文）
   **也不能**省略 proactively 變成 `Use when`）
- [ ] `description` 整段 ≤ 300 字元
  （Claude Code listing 上限是 1,536 字元合併 when_to_use，
   寫太長會被截斷、模型看不到完整觸發條件）
- [ ] `allowed-tools` 不含裸 `Bash`
  （要寫成 `Bash(rg *)` 這種帶子命令模式的）
- [ ] `When NOT to use` 段至少 4 條、明確列 `.env.example` 跟 snapshot 檔
- [ ] Patterns 段至少 5 條 regex
- [ ] 沒有把真的 secret 字面寫進範例
  （例如不要寫 `sk-realkey123...` — 用 `sk-...` 或 `<truncated>` 代替）

**Subagent (`secret-scanner.md`) 檢查**：

- [ ] `tools` 是 **明確列出的清單**、不是省略
  （省略 tools = 繼承所有工具含 MCP，這是 Day 1 S09 講過的最常見安全陷阱）
- [ ] `disallowedTools` 含 `Write, Edit, NotebookEdit`
  （雙保險 — 皮帶＋吊褲帶，兩層保險不會同時失效）
- [ ] Persona 第一段有反向邊界（`You do not ...`）
- [ ] `Completion` 段強制最後一行格式
- [ ] `model: haiku`（不要被 Claude 自作主張改成 sonnet 或 opus）

---

#### 3. 驗收完之後、跑這 5 個 case 測誤判邊界

把這 5 段 input 餵給你的 skill 跑（或在 Claude 對話裡直接問「假設我給你這個 input、你的 secret-detector skill 會怎麼判斷？」），看反應對不對：

| Input | 期望反應 |
|---|---|
| `OPENAI_API_KEY=sk-proj-abcdefgh123456789012345...` | **BLOCK** — 真的 sk- key 格式 |
| README 內 `<your-openai-key-here>` | **PASS** — 字面占位符、明顯是範例 |
| `.env.example` 內 `DATABASE_URL=postgresql://user:pass@host/db` | **PASS** — 範例檔、走白名單 |
| 程式碼 `const key = "AKIA1234567890ABCDEF"` | **BLOCK** — hardcode AWS key |
| `__snapshots__/auth.test.ts.snap` 含 `fake-token-xyz` | **PASS** — snapshot 檔走白名單 |

任一條判錯 → **退回去叫 Claude 改**，不要自己手動改 SKILL.md。
告訴 Claude：「Case N 判錯了、預期是 X 但你寫的會判成 Y、請改 SKILL.md 的某段、加 Z 處理這個情境」。

> **為什麼不自己改**：Claude 沒收到你的修正、下次同樣 prompt 寫出來還是錯的。退回去改才會讓它學到。

---

#### 4. 跟 Claude 對話時最容易踩的雷

- **prompt 寫太籠統**：「幫我寫一個偵測 secret 的 skill」
  → Claude 給你通用版本、不知道你要多嚴格
  → **改善**：明確列「描述要含 OpenAI/GitHub/AWS pattern」這種具體要求（第 1 段已示範）

- **跳過驗收直接用**：Claude 寫完就拿去 cp 進 `~/.claude/skills/`
  → 結果它可能寫大寫 `Use PROACTIVELY`、或省略 tools
  → **改善**：第 2 段 checklist 逐條打勾才當完成

- **發現問題不退回 Claude**：跑測試發現 `.env.example` 被誤判 BLOCK
  → 自己手動改 SKILL.md、下次同 prompt 還是會犯
  → **改善**：每個誤判都退回去、把修正寫進 prompt 補充

- **要 Claude 一次寫完所有東西**：
  → 先 frontmatter、再 body、最後 patterns — 分段比一次到位品質高
  → **改善**：本份小抄第 1 段 prompt 已分 A/B 兩個檔案、就是這個意思

---

#### 5. 跨平台便攜版（之後想搬到 Codex 再看）

把 `allowed-tools` 跟 `disable-model-invocation` 兩個欄位拿掉、就是 agentskills.io 開放標準格式。能放進 `<your-repo>/.agents/skills/secret-detector/SKILL.md`。

Codex 對應「停用自動觸發」的設定在 `agents/openai.yaml` 設 `policy.allow_implicit_invocation: false`。

---

#### 6. 參考 ~/.claude（叫 Claude 拿這些檔案的寫法當範本）

跟 Claude 說「請參考這兩個檔案的結構寫法」：

- `~/.claude/agents/security-reviewer.md` — subagent 結構最完整範本、Workflow + Hard constraints 段、雙保險寫法
- `~/.claude/skills/quality-gate/SKILL.md` — Security 段檢查 `sk-`、`api_key`、`password`、tokens 的對照寫法

> **注意**：`security-reviewer.md` 現在還寫 `Use PROACTIVELY` 大寫（社群慣例）。
> 叫 Claude 抄結構、但 description 自己改成小寫 `use proactively`（對齊官方文件）。

---

