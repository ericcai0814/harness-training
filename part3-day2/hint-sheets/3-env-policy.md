# 同伴 3 — env-policy skill + env-policy-reviewer subagent

> **本份小抄訓練重點**：練「用 git diff 篩變動範圍」（procedure 第一步用 `Bash(git diff --name-status *)` 只看剛改的檔案、不掃全 repo）+「給 Claude 講清楚怎麼用對工具收窄掃描範圍」。
> 重點在 procedure 設計（用對工具篩範圍、避免 noise 滿天飛）。
> **Peer share 互看時可以順手翻其他人那份看**：
>   - 同伴 1 練「誤判（false positive，FP）邊界感」— 分辨真 key vs 範例佔位符
>   - 同伴 2 練「窄化 Bash 指令模式」— 不裸 Bash 的寫法
>   - 同伴 4 練「不同檔案類型的決策表 + 框架白名單」

**對應 Part 2 hook**：`PreToolUse Write|Edit、Bash` 擋 env 變數讀寫

---

#### 1. 給 Claude 的 prompt 起點（複製這段、貼進 Claude）

```
我要寫一個 skill 檢查 .env / process.env 政策。請幫我生成兩個檔案：

A. ~/.claude/skills/env-policy/SKILL.md

Frontmatter 必填：
- name: env-policy（小寫連字號、不含 anthropic 或 claude 字串）
- description: 雙句式。
   · 第一句講 what — 「強制 env 變數政策合規」
   · 第二句以小寫 `use proactively when` 起頭、列 3 個情境（讀寫 .env 檔、
     touch process.env、code 內 hardcode connection string）
   · 整段控制在 300 字元內
- allowed-tools: Read, Grep, Glob, Bash(git diff *), Bash(git log -- *)
  （**關鍵：含 git diff** — procedure 第一步用 git diff 篩剛動的檔案，
   不掃全 repo 避免 noise）
- disable-model-invocation: false（這是檢查器、要自動觸發）

Body 必含以下段落：
- ## When to use this skill — 3 個正面情境
- ## When NOT to use this skill — 至少 4 個誤判來源：
   · .env.example / .env.sample / .env.template（合法範例檔）
   · Test fixture / mock 環境（__tests__/、fixtures/）
   · Documentation 範例（README 內示範）
   · 合法 test setup：__tests__ 內 `process.env.NODE_ENV = "test"`
- ## Procedure — 4 步：
   1. Detect — **用 `git diff --name-status` 找剛改的 env 相關檔案**
      （這是同伴 3 訓練核心 — 不掃全 repo、只看剛動的）
   2. Validate — grep pattern 比對
   3. Decide — BLOCK / WARN / PASS 判準
   4. Report — 給呼叫者結構化訊息
- ## Hard constraints — never 改檔、never 自己 commit、邊界條件
- ## References（如果 SKILL.md > 80 行才拆出來放 patterns.md）

Patterns 段請涵蓋這 5 條 regex 當起點：
   ^\.env(\.\w+)?$                              # .env / .env.local / .env.production
   process\.env\.[A-Z_]+\s*=\s*['"]\w+           # process.env.X = "hardcoded"
   DATABASE_URL=postgresql://[^$]                # 直接 hardcode connection string
   import\s+.+\s+from\s+['"]dotenv['"]           # 偵測 dotenv 使用 → 提示 secrets 管理
   const\s+\w+\s*=\s*['"](sk-|ghp_|AKIA)\w+      # hardcode 真 secret 在 code


B. ~/.claude/agents/env-policy-reviewer.md

Frontmatter：
- name: env-policy-reviewer
- description: 雙句式、第二句用小寫
  `use proactively when .env files are touched or process.env appears
   in a diff`、加 `Returns a policy compliance verdict with concrete
   remediation`
- tools: [Read, Grep, Glob, Bash(git diff *)]
  （明確列出、不要省略、要含 git diff 才能篩變動範圍）
- disallowedTools: Write, Edit, NotebookEdit
  （雙保險 — reviewer 不該寫檔）
- model: haiku（pattern-match 任務）
- permissionMode: acceptEdits（唯讀 allowlist 下安全）
- maxTurns: 25
- memory: project（跨對話累積 policy 例外）

Body：
- Persona 一句話 + 反向邊界（「You are an env policy reviewer.
  You do not modify .env files. You only review and recommend.」）
- ## Memory hygiene 段（開工掃 / 完工 date stamp / 引用前 verify）
- ## Inputs you expect — 主要是 git diff 範圍
- ## Procedure 5 步：
   1. Detect — git diff --name-status 找 env 相關變動
   2. Gather — 讀那些檔案的 diff
   3. Cross-reference memory 中已知的合法例外
   4. Return 結構化 bundle（FINDING / File / Line / Pattern /
      Remediation / What we don't know）
   5. Update memory with YYYY-MM-DD stamp
- ## Hard constraints
- ## Completion — 最後一行 must be:
   DONE / DONE_WITH_CONCERNS / BLOCKED / NEEDS_CONTEXT

兩個檔案請參考結構：
- ~/.claude/skills/quality-gate/SKILL.md（Security 段 .env 是否 stage
  的檢查、跟我這份結構對照）
- ~/.claude/rules/common/verification.md（pre-commit security scan 段）
```

> 給 Claude 的時候**一次貼完整段**，不要拆分。

---

#### 2. Claude 寫完之後、你逐條打勾驗收

**Skill (`SKILL.md`) 檢查**：

- [ ] `description` 第二句包含小寫 `use proactively when`
- [ ] `description` 整段 ≤ 300 字元
- [ ] `allowed-tools` 含 `Bash(git diff *)`
  （**同伴 3 訓練核心 — 沒這個 procedure 就退化成掃全 repo**）
- [ ] `Procedure` 第一步明寫「用 `git diff --name-status` 篩變動範圍」
  （不是寫 `用 grep 掃整個 repo`）
- [ ] `When NOT to use` 段至少 4 條、明確列 `.env.example` 跟 test setup
- [ ] Patterns 段至少 4 條 regex
- [ ] 沒有把真的 connection string / secret 字面寫進範例

**Subagent (`env-policy-reviewer.md`) 檢查**：

- [ ] `tools` 是明確列出的清單、含 `Bash(git diff *)`
  （省略 tools = 繼承所有工具含 MCP、最常見安全陷阱）
- [ ] `disallowedTools` 含 `Write, Edit, NotebookEdit`
- [ ] Persona 段有反向邊界（明寫 `You do not modify .env files`）
- [ ] Procedure 第一步用 git diff、不是 grep 全 repo
- [ ] `Completion` 段強制最後一行格式
- [ ] `model: haiku`

---

#### 3. 驗收完之後、跑這 5 個 case 測誤判邊界

| Input | 期望反應 |
|---|---|
| 程式碼 `process.env.OPENAI_KEY = "sk-prod-..."` | **BLOCK** — hardcode prod secret |
| `.env.example` 內 `DATABASE_URL=postgresql://localhost/dev` | **PASS** — 範例檔 |
| 新增 `.env.production` 進 git | **BLOCK** — prod env 不該進版控 |
| Test 內 `process.env.NODE_ENV = "test"` | **PASS** — 合法 test setup |
| Code 內 `const dbUrl = "postgresql://user:realpass@prod-db/main"` | **BLOCK** — hardcode connection string |

任一條判錯 → **退回去叫 Claude 改**，不要自己手動改 SKILL.md。

> **同伴 3 最容易誤判的 case 是 test setup 的 `process.env.NODE_ENV = "test"`** — Claude 第一版常常 BLOCK 所有 `process.env.X = ...` 寫法。test fixture 白名單寫好是關鍵。

---

#### 4. 跟 Claude 對話時最容易踩的雷

- **prompt 沒提 git diff** —「幫我寫 .env 政策 skill」→ Claude 寫掃全 repo 的 procedure → noise 滿天飛
  → **改善**：第 1 段 prompt 明確列「Procedure 第一步用 `git diff --name-status` 篩變動範圍」（已示範）

- **跳過驗收讓 Claude 寫 over-broad rule** — 例如禁止任何 `process.env.X = ...` → test fixture 也被擋
  → **改善**：第 2 段 checklist「Procedure 第一步用 git diff、不是 grep 全 repo」這條每次打勾

- **Claude 在 skill 內 invoke 其他 persona** —「As a security expert, ...」這種寫法
  → **改善**：研究檔列為違規寫法、看到立刻退回去改成「Hand off to security-reviewer agent」

- **發現問題不退回 Claude** — 跑測試發現 `.env.example` 被誤判 BLOCK、自己手動改
  → **改善**：每個誤判都退回去、把「.env.example 是 placeholder、應該 PASS 並留紀錄」寫進 prompt 補充

---

#### 5. 跨平台便攜版（之後想搬到 Codex 再看）

把 `allowed-tools` 跟 `disable-model-invocation` 兩個欄位拿掉、就是 agentskills.io 開放標準格式。能放進 `<your-repo>/.agents/skills/env-policy/SKILL.md`。

Codex 也有 `.env` 處理需求、這份 skill 直接可用。

---

#### 6. 參考 ~/.claude（叫 Claude 拿這些檔案的寫法當範本）

跟 Claude 說「請參考這兩個檔案的結構寫法」：

- `~/.claude/skills/quality-gate/SKILL.md` — Security 段檢查 `.env` 是否 stage 的對照寫法、git diff 用法範例
- `~/.claude/rules/common/verification.md` — pre-commit security scan 段、可以對照同伴 3 的決策表

> **注意**：`security-reviewer.md` 現在還寫 `Use PROACTIVELY` 大寫（社群慣例）。
> 叫 Claude 抄結構、但 description 自己改成小寫 `use proactively`。
