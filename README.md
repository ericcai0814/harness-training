# harness-training

Eric 的 Claude Code / AI Engineering 教材集合。

這個 repo 是一個**持續累積**的訓練素材庫，會陸續放入各種 meetup、workshop、內訓用得到的內容：

- **投影片（deck）**——meetup 或分享會用的單檔 HTML 簡報
- **Starter 專案**——學員從這裡開始動手，搭配對照的 completed 版本
- 未來可能加入 cheat sheet、demo 腳本、練習題等等

每份教材彼此獨立，**不共用根目錄依賴**。進入該資料夾後依各自的 `README` / `package.json` 操作即可。

---

## 慣例

### Deck

單檔 HTML，純前端、無建置流程。可以是根目錄的單一檔案，也可以放在自己的子資料夾（含圖片、附件等）。

通用快捷鍵：`→` / `←` 翻頁、`ESC` 開啟總覽、點縮圖跳轉。

### Starter / Completed 對照

動手實作的教材採用**雙資料夾**結構：

| 資料夾 | 用途 |
|--------|------|
| `<topic>/` | 起始版，學員從這裡開始 |
| `<topic>_COMPLETED/` | 完成版參考解，卡關時對照 |

兩個資料夾共用同一份 `task.md` 與 `CLAUDE.md`，差別只在於該完成的程式碼是否已填上。

---

## 目前累積的內容

### 投影片

| 檔案 | 主題 | 頁數 |
|------|------|------|
| `dev-ai-training-harness-6part.html` | Harness Engineering — 你早就在做了 | 16 頁 |
| `hooks/hooks-deck/index.html` | Hooks 教學 — 9 站 | 9 頁 |

### Starter / Completed

| 路徑 | 主題 |
|------|------|
| `hooks/queries/` 與 `hooks/queries_COMPLETED/` | Claude Agent SDK + Hook 阻擋重複 SQL query |
| `part3-day2/` | Meetup Part 3 Day 2 — 用 Claude 寫 1 skill + 1 subagent（無 COMPLETED：學員自己用 Claude 寫出來的就是 completed） |

queries 教材的動手做：

```bash
cd hooks/queries        # 或 hooks/queries_COMPLETED
npm run setup           # 安裝依賴並初始化 Claude Code 設定
npm run sdk             # 執行 sdk.ts 範例
```

任務情境：每天 cron 跑 `main.ts`，要新增 Slack 整合通知「pending 超過 3 天的訂單」。重點在 `hooks/query_hook.js`——當 Claude Code 嘗試在 `src/queries/` 寫入新查詢時，hook 會啟動 sub-agent 檢查是否與既有 query 重複，重複就 BLOCK（fail-closed 設計）。

part3-day2 教材的動手做：

```bash
cd part3-day2
# 4 人各自找對應 hint sheet（見 part3-day2/README.md 的對照表）
cat hint-sheets/1-secret-detector.md   # 同伴 1 範例
```

任務情境：4 人各自把 Part 2 自己 hook 的意圖升級成 production-grade skill + subagent。工作流是「給 Claude 講需求 → Claude 寫 → 你驗收」三步驟。每份 hint sheet 第 1 段是給 Claude 的 prompt 起點、第 2 段是驗收 checklist、第 3 段是 5 個邊界 test case。詳見 `part3-day2/README.md`。

---

## 專案結構

```
.
├── dev-ai-training-harness-6part.html   # 單檔 deck
├── hooks/
│   ├── hooks-deck/                       # 子資料夾型 deck
│   │   └── index.html
│   ├── queries/                          # starter
│   └── queries_COMPLETED/                # completed
├── part3-day2/                           # Part 3 Day 2 hands-on starter
│   ├── README.md                         # 同伴 onboarding（5/20 前要做的事 + 5/21 流程）
│   ├── starter/
│   │   ├── skill-skeleton/SKILL.md       # 空殼參考
│   │   └── agent-skeleton.md             # 空殼參考
│   └── hint-sheets/                      # 4 份 per-person 小抄
│       ├── 1-secret-detector.md
│       ├── 2-bash-safety.md
│       ├── 3-env-policy.md
│       └── 4-naming-conventions.md
└── README.md
```

未來新教材依照上述慣例擺放即可，不需要為了統一而動到既有結構。

---

## 部署

部分 deck 已透過 Vercel 部署，供線上瀏覽（見 `.vercel/`）。

---

## 授權

教學用途。投影片內容歡迎引用，請註明出處。
