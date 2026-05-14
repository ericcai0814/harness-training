# harness-training

Eric 的 Claude Code / AI Engineering 教材集合。

這個 repo 是一個**持續累積**的訓練素材庫，會陸續放入各種 meetup、workshop、內訓用得到的內容：

- **投影片（deck）**——meetup 或分享會用的單檔 HTML 簡報
- **Starter 專案**——學員從這裡開始動手，搭配對照的 completed 版本
- **Repo 內建 Claude Code 環境**——`.claude/`、`.agents/`、`skills-lock.json` 已經裝好完成版範例的 skill / subagent，clone 下來 `cd` 進來就能跑
- 未來可能加入 cheat sheet、demo 腳本、練習題等等

每份教材彼此獨立，**不共用根目錄依賴**。進入該資料夾後依各自的 `README` / `package.json` 操作即可。

---

## 慣例

### Deck

單檔 HTML，純前端、無建置流程。可以是根目錄的單一檔案，也可以放在自己的子資料夾（含圖片、附件等）。

通用快捷鍵：`→` / `←` 翻頁、`ESC` 開啟總覽、點縮圖跳轉。

### Starter / Completed 對照

動手實作教材有兩種擺法，依教材性質擇一：

**模式 A — 平行命名**（純 codebase、無自帶文件時用）

| 資料夾 | 用途 |
|--------|------|
| `<topic>/` | 起始版 |
| `<topic>_COMPLETED/` | 完成版參考 |

`git diff hooks/queries hooks/queries_COMPLETED` 直接看差異很方便。

**模式 B — 內部子資料夾**（教材自帶 README、hint-sheets、多檔素材時用）

```
<topic>/
├── README.md
├── starter/        # 起始版
├── completed/      # 完成版（可只放部分，留空也可）
└── hint-sheets/    # 其他輔助素材
```

兩種都合法，選對應教材形狀的那個。

### Repo 內建 Claude Code 環境

`.claude/`、`.agents/`、`skills-lock.json` 是 **repo-level 的 Claude Code 設定**，讓 `git clone` 後 `cd` 進 repo 就能直接體驗完成版範例（不只讀檔案，而是真的跑起來）。

目前內建：

- `.claude/skills/secret-detector/` 與 `.claude/agent/secret-scanner.md` — part3-day2 完成版範例的鏡像
- `.agents/skills/grill-with-docs/` — 從 `mattpocock/skills` 安裝（見 `skills-lock.json`）

---

## 目前累積的內容

### 投影片

| 檔案 | 主題 | 頁數 |
|------|------|------|
| `dev-ai-training-harness-6part.html` | Harness Engineering — 你早就在做了 | 16 頁 |
| `hooks/hooks-deck/index.html` | Hooks 教學 — 9 站 | 9 頁 |

### Starter / Completed

| 路徑 | 主題 | 模式 |
|------|------|------|
| `hooks/queries/` + `hooks/queries_COMPLETED/` | Claude Agent SDK + Hook 阻擋重複 SQL query | A（平行命名）|
| `part3-day2/` | Meetup Part 3 Day 2 — 用 Claude 寫 1 skill + 1 subagent | B（內部子資料夾）|

#### queries 動手做

```bash
cd hooks/queries        # 或 hooks/queries_COMPLETED
npm run setup           # 安裝依賴並初始化 Claude Code 設定
npm run sdk             # 執行 sdk.ts 範例
```

任務情境：每天 cron 跑 `main.ts`，要新增 Slack 整合通知「pending 超過 3 天的訂單」。重點在 `hooks/query_hook.js`——當 Claude Code 嘗試在 `src/queries/` 寫入新查詢時，hook 會啟動 sub-agent 檢查是否與既有 query 重複，重複就 BLOCK（fail-closed 設計）。

#### part3-day2 動手做

```bash
cd part3-day2
# 4 人各自找對應 hint sheet（見 part3-day2/README.md 的對照表）
cat hint-sheets/1-secret-detector.md   # 同伴 1 範例
```

任務情境：4 人各自把 Part 2 hook 的意圖升級成 production-grade skill + subagent。工作流是「給 Claude 講需求 → Claude 寫 → 你驗收」三步驟。每份 hint sheet 第 1 段是給 Claude 的 prompt 起點、第 2 段是驗收 checklist、第 3 段是 5 個邊界 test case。

`completed/1-secret-detector/` 是已完成的 1 號範例，另外 3 位的 completed 是學員自己用 Claude 寫出來的成果。詳見 `part3-day2/README.md`。

---

## 專案結構

```
.
├── dev-ai-training-harness-6part.html   # 單檔 deck
├── hooks/
│   ├── hooks-deck/index.html            # 子資料夾型 deck
│   ├── queries/                          # starter（模式 A）
│   └── queries_COMPLETED/                # completed（模式 A）
├── part3-day2/                           # Part 3 Day 2 hands-on（模式 B）
│   ├── README.md                         # 同伴 onboarding（5/20 前 + 5/21 流程）
│   ├── starter/
│   │   ├── skill-skeleton/SKILL.md       # 空殼參考
│   │   └── agent-skeleton.md             # 空殼參考
│   ├── completed/
│   │   └── 1-secret-detector/            # 1 號完成版範例
│   └── hint-sheets/                      # 4 份 per-person 小抄
│       ├── 1-secret-detector.md
│       ├── 2-bash-safety.md
│       ├── 3-env-policy.md
│       └── 4-naming-conventions.md
├── .claude/                              # repo 內建 Claude Code 設定
│   ├── skills/secret-detector/           # part3-day2 完成版鏡像
│   └── agent/secret-scanner.md
├── .agents/skills/                       # 第三方 skill（npx skills 安裝）
│   └── grill-with-docs/
├── skills-lock.json                      # 第三方 skill 鎖檔
└── README.md
```

未來新教材依照上述慣例擺放即可，不需要為了統一而動到既有結構。

---

## 部署

部分 deck 已透過 Vercel 部署，供線上瀏覽（見 `.vercel/`）。

---

## 授權

教學用途。投影片內容歡迎引用，請註明出處。
