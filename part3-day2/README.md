# Part 3 Day 2 — Hands-on Starter

5/21 Meetup Part 3 Day 2 hands-on 場用的 starter 範本。

主題：**4 人各自把 Part 2 hook 升級成 1 個 skill + 1 個 subagent，用 Claude 寫**。

Day 2 改成「給 Claude 講需求 → Claude 寫 → 你驗收」工作流。不練手打 SKILL.md、練給 Claude 講清楚需求 + 讀 Claude 輸出找問題的能力 — 這比較貼近 4 人實際以後在自家 repo 怎麼用 Claude。

---

## 5/20 前要做的事（10 分鐘）

1. **Clone repo**

   ```bash
   git clone https://github.com/ericcai0814/harness-training.git ~/project/harness-training
   cd ~/project/harness-training/part3-day2
   ```

   （如果已 clone 過：`cd ~/project/harness-training && git pull`）

2. **找到對應你的 hint sheet**

   | 同伴 | Part 2 hook | 你的 hint sheet |
   |---|---|---|
   | 1 | UserPromptSubmit 擋 API key | `hint-sheets/1-secret-detector.md` |
   | 2 | PreToolUse Bash 擋破壞性指令 | `hint-sheets/2-bash-safety.md` |
   | 3 | PreToolUse Write/Edit/Bash 擋 env | `hint-sheets/3-env-policy.md` |
   | 4 | PostToolUse Write 命名檢查 | `hint-sheets/4-naming-conventions.md` |

3. **打開你的 hint sheet 讀一遍**（5 min）

   重點看「**本份小抄訓練重點**」段、第 1 段 prompt、第 2 段 checklist。
   **不用記內容、不用填東西**。只要知道「5/21 現場我會用 hint sheet 第 1 段 prompt 餵 Claude」。

4. **試跑 ls 確認位置**

   ```bash
   ls ~/.claude/skills 2>/dev/null || mkdir -p ~/.claude/skills
   ls ~/.claude/agents 2>/dev/null || mkdir -p ~/.claude/agents
   ```

   （5/21 我們會把 Claude 寫的東西放這兩個資料夾。Windows 路徑容易卡、先確認位置對。）

5. **卡住 Slack 我**

   不要 5/21 才現場修。

---

## 5/21 現場流程（每站 ~13-25 min）

### Station 1 — Skill 客製化（25 min）

1. **照 hint sheet 第 1 段** 把 prompt 一次貼完整段給 Claude（不要拆）
2. **Claude 寫完** SKILL.md
3. **照 hint sheet 第 2 段 checklist** 逐條打勾驗收
   - 沒過的條目 → 回頭告訴 Claude「第 N 條沒過、請改 X 段」
   - **不要自己手動改** — 讓 Claude 學到下次別犯
4. **餵 1-2 個 hint sheet 第 3 段 test case** 給 Claude
   - 反應跟期望不一致 → 退回去改

### Station 2 — Subagent 草稿（15 min）

跟 Station 1 同樣流程，但對象是 `~/.claude/agents/<your-agent>.md`。
重點驗收：`tools` 是 list 不是省略、`disallowedTools` 雙保險。

### Peer share（8 min）

4 人各 2 min 把自己改完的 skill + subagent 給其他人看一眼。

**互看** — 順手翻開其他 3 份 hint sheet 看別人在練什麼能力。每份 hint sheet 頂部有「peer share 互看提示」教你看誰那份。

---

## 目錄結構

```
part3-day2/
├── README.md                          # 本檔，含 5/20 前要做的事
├── starter/
│   ├── skill-skeleton/
│   │   └── SKILL.md                   # 空殼參考（給 Claude 看結構用）
│   └── agent-skeleton.md              # 空殼參考
└── hint-sheets/
    ├── 1-secret-detector.md           # 同伴 1：API key 偵測
    ├── 2-bash-safety.md               # 同伴 2：破壞性 Bash 攔截
    ├── 3-env-policy.md                # 同伴 3：.env 政策
    └── 4-naming-conventions.md        # 同伴 4：命名規則
```

`starter/` 兩個檔案是 **空殼參考** — 你可以叫 Claude「請參考這份 SKILL.md skeleton 的結構寫法」，不是要你自己填空。

---

## 為什麼這樣設計

- **4 人會後真正會用的工作流就是 Claude** — 練手寫 description 沒意義、練不出以後會用的能力
- **練「驗收 Claude 輸出」比練手寫更接近 production reality** — 每份 hint sheet 第 2 段 checklist 是訓練核心
- **4 份 hint sheet 訓練重點刻意不同** — peer share 互看時學到自己沒練到的角度

各份訓練重心：

| 同伴 | 訓練重點 |
|---|---|
| 1 | 誤判（false positive，FP）邊界感 — 分辨真 key vs 範例佔位符 |
| 2 | 窄化 Bash 指令模式（narrow Bash predicate）— 不裸 Bash 的寫法 |
| 3 | 用 git diff 篩變動範圍 — procedure 設計時用對工具 |
| 4 | 多檔案類型決策表 + 框架白名單 — 反 over-trigger |

---

## 相關連結

- Day 1 投影片（5/20 用）— 在 obsidian `Meetup Part 3 Day 1 投影片內容`
- Day 2 投影片（5/21 用）— 在 obsidian `Meetup Part 3 Day 2 投影片內容`
- Day 2 starter 範本（B1/B2 skeleton + B3 hint sheets 完整版）— 在 obsidian `Meetup Part 3 Day 2 starter 範本`
- 母規劃 — obsidian `AI Claude Code 工程師交流規劃`
