# 同伴 4 — naming-conventions skill + naming-reviewer subagent

> **本份小抄訓練重點**：練「不同檔案類型不同規則的決策表 + 框架白名單」（PascalCase.tsx / useCamelCase.ts / kebab-case.ts / UPPER_SNAKE_CASE 等分檔型套用）+「給 Claude 講清楚 `next.config.mjs` 這類框架要求的檔名要 PASS」。
> 重點在決策表設計（多類型分流）+ 反 over-trigger（框架白名單）。
> **Peer share 互看時可以順手翻其他人那份看**：
>   - 同伴 1 練「誤判（false positive，FP）邊界感」— 分辨真 key vs 範例佔位符
>   - 同伴 2 練「窄化 Bash 指令模式」— 不裸 Bash 的寫法
>   - 同伴 3 練「用 git diff 篩變動範圍」— procedure 用對工具

**對應 Part 2 hook**：`PostToolUse Write|Edit` 檢查命名規則

---

#### 1. 給 Claude 的 prompt 起點（複製這段、貼進 Claude）

```
我要寫一個 skill 檢查命名規則。請幫我生成兩個檔案：

A. ~/.claude/skills/naming-conventions/SKILL.md

Frontmatter 必填：
- name: naming-conventions（小寫連字號、不含 anthropic 或 claude 字串）
- description: 雙句式。
   · 第一句講 what — 「強制檔案與識別子命名規範」
   · 第二句以小寫 `use proactively when` 起頭、列 3 個情境（新建或改名
     檔案、新增函式 / 類型 / 常數、TypeScript / React 專案內）
   · 整段控制在 300 字元內
- allowed-tools: Read, Grep, Glob, Bash(git status *), Bash(git diff --name-status *)
  （含 git status / diff 才能只看剛動的檔案、不掃全 repo）
- disable-model-invocation: false（檢查器、自動觸發）

Body 必含以下段落：
- ## When to use this skill — 3 個正面情境
- ## When NOT to use this skill — 至少 5 個白名單來源：
   · Legacy code（命名規範前的檔案）— 不批量改名製造大 diff
   · 自動生成檔案：*.gen.ts、*.d.ts、__generated__/
   · 框架要求檔名：.eslintrc.js、webpack.config.js、next.config.mjs、
     vite.config.ts、tsconfig.json
   · 測試檔（框架要求）：*.test.ts、*.spec.ts、*.test.tsx
   · Vendored 第三方 source code
- ## Procedure — 4 步：Detect (用 git diff 找剛建/改名的檔案) /
  Match against decision table / Decide / Report
- ## Hard constraints — never 改檔（只建議改名）、邊界條件
- ## Decision table — **這是同伴 4 訓練核心**，列每個檔案類型的命名規則：

| 檔案類型 | 命名規範 | 範例 |
|---|---|---|
| React component | PascalCase.tsx | UserProfile.tsx |
| React hook | useCamelCase.ts | useAuth.ts |
| Utility / helper | kebab-case.ts | format-date.ts |
| Type / Interface | PascalCase | interface UserData {} |
| Constants（module level）| UPPER_SNAKE_CASE | const MAX_RETRIES = 3 |
| Function / Variable | camelCase | const getUserById = ... |
| Skill / Agent / Command | kebab-case | bash-safety/、code-reviewer.md |

- ## References（如果 SKILL.md > 80 行才拆出來放 patterns.md）


B. ~/.claude/agents/naming-reviewer.md

Frontmatter：
- name: naming-reviewer
- description: 雙句式、第二句用小寫
  `use proactively after Write or Edit operations that touch file
   names or top-level identifiers`、加
  `Returns suggested renames with rationale`
- tools: [Read, Grep, Glob, Bash(git diff --name-status *)]
  （明確列出、含 git diff 才能篩剛動的檔案）
- disallowedTools: Write, Edit, NotebookEdit
  （雙保險 — reviewer 只建議、不改檔）
- model: haiku（pattern-match 任務）
- permissionMode: acceptEdits（唯讀 allowlist 下安全）
- maxTurns: 25
- memory: project（跨對話累積專案命名歷史）

Body：
- Persona 一句話 + 反向邊界（「You are a naming reviewer.
  You suggest renames. You do not rename files yourself.」）
- ## Memory hygiene 段
- ## Inputs you expect — 主要是 git diff --name-status 範圍
- ## Procedure 5 步：
   1. Detect — git diff --name-status 找剛建 / 改名的檔案
   2. Match against decision table（不同檔案類型不同規則）
   3. Cross-check 白名單（框架要求 / auto-generated）
   4. Return 結構化 bundle（FINDING / File / Current / Suggested /
      Reason / What we don't know）
   5. Update memory with YYYY-MM-DD stamp
- ## Hard constraints
- ## Completion — 最後一行 must be:
   DONE / DONE_WITH_CONCERNS / BLOCKED / NEEDS_CONTEXT

兩個檔案請參考結構：
- ~/.claude/agents/code-reviewer.md（"Functions and variables are
  well-named" checklist 寫法）
- ~/.claude/rules/common/coding-style.md（命名規範與一致性原則）
```

> 給 Claude 的時候**一次貼完整段**，不要拆分。

---

#### 2. Claude 寫完之後、你逐條打勾驗收

**Skill (`SKILL.md`) 檢查**：

- [ ] `description` 第二句包含小寫 `use proactively when`
- [ ] `description` 整段 ≤ 300 字元
- [ ] `allowed-tools` 含 `Bash(git diff --name-status *)`
- [ ] **Decision table 段含至少 7 個檔案類型 × 命名規則 mapping**
  （同伴 4 訓練核心 — 沒這個表就是 hard rule、會 over-trigger）
- [ ] `When NOT to use` 段至少 5 條白名單、明確列
  `*.gen.ts`、`next.config.mjs`、`*.test.ts`
- [ ] `Hard constraints` 段含 `never 自己改名、只建議`

**Subagent (`naming-reviewer.md`) 檢查**：

- [ ] `tools` 是明確列出的清單、含 `Bash(git diff --name-status *)`
- [ ] `disallowedTools` 含 `Write, Edit, NotebookEdit`
- [ ] Persona 段有反向邊界（`You suggest renames. You do not rename
   files yourself.`）
- [ ] Procedure 第一步用 git diff --name-status、不是掃整個 repo
- [ ] Procedure 第二步明寫 match against decision table
- [ ] `Completion` 段強制最後一行格式
- [ ] `model: haiku`

---

#### 3. 驗收完之後、跑這 6 個 case 測誤判邊界

| Input | 期望反應 |
|---|---|
| 新增 `userprofile.tsx`（React component） | **WARN** → 建議改 `UserProfile.tsx` |
| 新增 `use_auth.ts`（hook） | **WARN** → 建議改 `useAuth.ts` |
| 新增 `MAX_retries = 3` | **WARN** → 建議 `MAX_RETRIES` |
| 新增 `formatDate.ts`（utility） | **WARN** → 建議 `format-date.ts` |
| 新增 `next.config.mjs` | **PASS** — 框架要求檔名走白名單 |
| 新增 `Button.gen.ts` | **PASS** — 自動生成走白名單 |

任一條判錯 → **退回去叫 Claude 改**，不要自己手動改 SKILL.md。

> **同伴 4 最容易誤判的 case 是 `next.config.mjs`** — Claude 第一版常常用 hard rule「`*.mjs` 都該 PascalCase」、把框架檔名也擋掉。白名單寫好是關鍵。

---

#### 4. 跟 Claude 對話時最容易踩的雷

- **prompt 沒提白名單** —「幫我寫一個檢查命名規則的 skill」→ Claude 寫 hard rule、`next.config.mjs` 一直被當錯
  → **改善**：第 1 段 prompt 明確列至少 5 個白名單範例（已示範）

- **跟 ESLint / Prettier 規則重複** — 同伴 4 寫的 skill 跟既有 lint rule 重複、每次 Write 都跑兩次
  → **改善**：如果你 repo 已有 ESLint cover 這部分、改用 `disable-model-invocation: true`、改成手動觸發（不自動跑、Eric 提到時再用）

- **Hard constraint 寫太硬** — 例如「Never allow snake_case」、但 Python utility 可能允許
  → **改善**：邊界切清楚、不要絕對化、用 decision table 而不是 Hard constraint

- **發現問題不退回 Claude** — 跑測試發現 `next.config.mjs` 被誤判 WARN、自己手動改 SKILL.md
  → **改善**：每個誤判都退回去、把「`next.config.mjs` 是 Next.js 框架要求檔名、應該 PASS 並走白名單」寫進 prompt 補充

---

#### 5. 跨平台便攜版（之後想搬到 Codex 再看）

把 `allowed-tools` 跟 `disable-model-invocation` 兩個欄位拿掉、就是 agentskills.io 開放標準格式。能放進 `<your-repo>/.agents/skills/naming-conventions/SKILL.md`。

Codex 上命名規範也是常見 use case、這份直接可用。

---

#### 6. 參考 ~/.claude（叫 Claude 拿這些檔案的寫法當範本）

跟 Claude 說「請參考這兩個檔案的結構寫法」：

- `~/.claude/agents/code-reviewer.md` — "Functions and variables are well-named" checklist 寫法、可以對照同伴 4 的 decision table
- `~/.claude/rules/common/coding-style.md` — 命名規範與一致性原則、Eric 個人風格參考

> **注意**：`security-reviewer.md` 現在還寫 `Use PROACTIVELY` 大寫（社群慣例）。
> 叫 Claude 抄結構、但 description 自己改成小寫 `use proactively`。
