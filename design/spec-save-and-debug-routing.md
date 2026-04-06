# Spec: 存档管理 + URL 场景路由

## 功能一：存档槽位管理 (Save Slot System)

### 背景
目前游戏只有一个 `default` 槽位，每周自动覆盖。玩家无法保留不同进度，也没有存档管理界面（主菜单的"继续游戏"只是静默加载）。

### 目标
- 支持 **3 个手动存档槽**（slot1, slot2, slot3）+ **1 个自动存档**（autosave，仍保留每周自动触发）
- 在主菜单展示每个槽的摘要（存档名、周数、角色名、存档时间）
- 在游戏内 header 保留"保存"按钮，点击后弹出**选槽对话框**
- 支持**覆盖确认**（已有存档时提示）
- 支持**删除存档**

### 数据结构

每个存档 key 格式：`band_cry_save_{slot}`，新增一个 `band_cry_save_index` 存所有槽的元数据：

```ts
interface SaveMeta {
  slot: string;       // 'autosave' | 'slot1' | 'slot2' | 'slot3'
  playerName: string;
  week: number;
  age: number;
  savedAt: string;    // ISO timestamp
}
```

`GameLoop.saveState(slot)` 在保存存档数据的同时，更新 `band_cry_save_index` 中对应槽的元数据。

### 新增/修改文件

| 文件 | 变更类型 | 说明 |
|------|----------|------|
| `src/engine/GameLoop.ts` | 修改 | `saveState` / `fromSave` / `hasSave` 支持 slot 参数；新增 `static getSaveMetas(): SaveMeta[]` |
| `src/components/SaveSlotDialog.vue` | 新增 | 模态对话框，展示 3 个槽位 + autosave（只读显示），支持存入/加载/删除 |
| `src/components/MainGame.vue` | 修改 | header"保存"按钮改为打开 SaveSlotDialog |
| `src/components/StartPage.vue` | 修改 | "继续游戏"区域改为展示所有存档槽，点击任意槽加载对应存档 |
| `src/App.vue` | 修改 | `continueGame` 接受 `slot` 参数，传给 MainGame |

### UI 草图（SaveSlotDialog）

```
┌─────────────────────────────────┐
│  选择存档槽                  ✕  │
├─────────────────────────────────┤
│ [自动存档]  周12 · 陈宇 · 18岁  │
│             2026-04-03 14:32    │
│             (只读，不可覆盖)     │
├─────────────────────────────────┤
│ [槽位 1]    空                  │
│             [存入]              │
├─────────────────────────────────┤
│ [槽位 2]    周8 · 张伟 · 18岁   │
│             2026-04-01 09:10    │
│             [加载] [覆盖] [删除] │
├─────────────────────────────────┤
│ [槽位 3]    空                  │
│             [存入]              │
└─────────────────────────────────┘
```

### 自动存档逻辑
- `onEndWeek()` 中 `gameLoop.saveState('autosave')` 替换当前的 `saveState()`（无槽参数默认 `default`）
- autosave 槽在对话框中仅展示、可加载，不可手动覆盖

---

## 功能二：URL 场景路由（调试直通）

### 背景
开发时每次要手动点击 Start → Debug / Character Creation → Game，效率低。

### 目标
通过 URL hash 参数直接跳到任意场景，跳过开始菜单：

| URL | 跳转目标 |
|-----|----------|
| `/?scene=debug` | DebugPage |
| `/?scene=game` | MainGame（使用预设调试角色） |
| `/?scene=character` | CharacterCreationPage |
| `/?scene=introduction` | IntroductionPage |
| `/?scene=settings` | SettingsPage |
| （无参数） | StartPage（现有行为不变） |

`?scene=game` 额外可选参数：
- `?scene=game&load=autosave` — 从自动存档加载
- `?scene=game&load=slot1` — 从 slot1 加载

### 实现方案

只修改 `src/App.vue`，在 `setup` 阶段读取一次 `location.search`：

```ts
// App.vue setup 新增
const urlParams = new URLSearchParams(window.location.search);
const sceneParam = urlParams.get('scene');
const loadParam = urlParams.get('load'); // 可选

// 在 currentPage 初始化后立即处理
if (sceneParam) {
  switch (sceneParam) {
    case 'debug':        currentPage.value = 'debug'; break;
    case 'character':    currentPage.value = 'character-creation'; break;
    case 'introduction': currentPage.value = 'introduction'; break;
    case 'settings':     currentPage.value = 'settings'; break;
    case 'game':
      // 用默认调试角色，或从指定槽加载
      playerCharacter.value = { name: '调试角色', gender: 'Male', instrument: 'Guitar' };
      loadFromSave.value = loadParam ? loadParam : false; // slot 名
      currentPage.value = 'game';
      break;
  }
}
```

`MainGame.vue` 中 `loadFromSave` 从 `boolean` 扩展为 `boolean | string`（slot 名），加载时：

```ts
const gameLoop =
  (typeof props.loadFromSave === 'string' && GameLoop.fromSave(props.loadFromSave)) ||
  (props.loadFromSave === true && GameLoop.fromSave('autosave')) ||
  new GameLoop({ ... });
```

### 对现有逻辑的影响
- 无路由库依赖，零运行时成本
- 仅在 `window.location.search` 存在 `scene` 时生效；普通玩家不受影响
- 不影响 prod 构建（只是多读一次 URL 参数）

---

## 变更范围总结

| 文件 | 功能一 | 功能二 |
|------|--------|--------|
| `src/App.vue` | slot 参数传递 | URL 解析 + scene 跳转 |
| `src/engine/GameLoop.ts` | SaveMeta + slot index | （无变更）|
| `src/components/SaveSlotDialog.vue` | 新增组件 | — |
| `src/components/MainGame.vue` | 改保存逻辑 | loadFromSave 类型扩展 |
| `src/components/StartPage.vue` | 展示存档槽 | — |

预计改动量：~200 行新增，~30 行修改。
