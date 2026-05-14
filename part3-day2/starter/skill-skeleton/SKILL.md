---
# 必填：小寫 + 連字號、≤64 字元、不含 anthropic / claude（保留字）
name: <your-skill-name>

# 必填：description 是觸發器、雙句式
# 第一句 what；第二句以小寫 `use proactively when ...` 列 3 個情境
# 控制在 ≤300 字元（API 1024 / listing 合併 when_to_use 1,536 字元上限）
description: >
  <一句話 what>. Use proactively when <情境 1>, <情境 2>, or <情境 3>.

# 選填：narrow Bash predicate、不裸 Bash
# 這是 ALLOW（預先授權）、不是 DENY
allowed-tools: Read, Grep, Glob, Bash(rg *), Bash(grep *)

# 選填：對有副作用的動作（會寫檔、會送訊息）設 true 阻止自動觸發
# 檢查器類 skill 保持 false（要自動觸發）
disable-model-invocation: false
---

# <Skill Title>

<一句話定位：這個 skill 解決什麼問題、屬於哪個 domain。>

## When to use this skill

- <正面 case 1>
- <正面 case 2>
- <正面 case 3>

## When NOT to use this skill

- <負面 case 1（容易誤判但不該觸發的情境）>
- <負面 case 2>
- <負面 case 3>
- <負面 case 4>

## Procedure

1. **Detect** — <偵測條件，例：grep pattern、檔案路徑模式、git diff 範圍>
2. **Validate** — <驗證邏輯，列正反 test case>
3. **Decide** — <決策表，BLOCK / WARN / PASS 判準>
4. **Report** — <回傳格式，給呼叫者的訊息>

## Hard constraints

- Never <負面行為 1>
- Never <負面行為 2>
- 邊界條件：<易誤判的 false positive 來源>

## Validation checklist

完成後驗證：
- [ ] <最小可驗證輸出 1>
- [ ] <最小可驗證輸出 2>

## References（若 SKILL.md > 80 行才拆出來放 patterns.md）

- `references/patterns.md` — <按需載入的詳細 pattern library>
