# 乐队经验模拟小游戏 (Band Career Simulator)

## 1. 游戏愿景 (Vision)
 - **核心体验**: 文字冒险 (AVG) + 轻度策略养成。
 - **背景**: 现代都市，从 18 岁高中毕业/大学开始，历经组建乐队、地下演出、签约厂牌、巡演，直到成为传奇或解散。
 - **风格**: 类似《BitLife》或《中国式家长》，但专注于音乐生涯。
 - **特色**: 包含大量摇滚乐梗、现实乐手彩蛋（如 "27岁俱乐部" 结局）。

## 2. 核心机制 (Core Mechanics)

### 2.1 属性系统 (Extensible Stat System)
为了让属性系统易于扩展，我们不应该把属性写死在代码里。更好的方法是使用一个动态的数据结构。

- **属性容器**: 角色会有一个 `stats` 属性，它是一个 `Map<string, number>`。键是属性的唯一ID（如 `"technique"`），值是该属性的当前数值。
- **属性定义**: 我们可以用一个单独的文件 `src/data/stats.yaml` 来定义所有可用的属性及其元数据（显示名称、描述、初始值范围等）。这样，添加新属性只需要修改 `YAML` 文件，而不需要改动核心代码。

**示例 `stats.yaml`:**
```yaml
- id: technique
  name: 技术
  description: 你的演奏或演唱技巧。
- id: charm
  name: 魅力
  description: 你的舞台表现力和吸引力。
- id: sanity
  name: 精神
  description: 你的心理健康状况，过低会引发负面事件。
- id: health
  name: 健康
  description: 你的身体状况，会因作息、压力等下降。
- id: artistic_integrity
  name: 艺术坚持
  description: 你对音乐初心的坚守程度。
```

### 2.2 游戏节奏与主循环 (Game Pacing & Main Loop)
要将一个多年的生涯压缩到10分钟左右，我们需要找到一个合适的时间单位和循环机制。

- **时间单位**: 使用 **“周 (Week)”** 作为游戏的基本时间单位。
- **游戏时长**: 核心游戏体验设定在 **2年** 内（从18岁到20岁），大约对应104周。这使得基础游戏时长在10分钟左右。如果玩家发展得很好，游戏可以继续，以冲击更高成就的结局。
- **主循环与行动点 (AP)**:
  1. **每周循环开始**: 游戏进入新的一周。
  2. **补充行动点**: 玩家每周获得 **4个行动点 (AP)**。
  3. **玩家行动**: 玩家从行动列表中选择行动，每个行动消耗1个AP。
     - **行动列表**: `精进琴技`、`创作新歌`、`寻找演出`、`社交鬼混`、`打工赚钱`、`休息放松`等。
  4. **结束本周**: 当玩家用完AP或主动选择结束时，点击“结束本周”按钮。
  5. **系统结算**: 引擎处理本周行动效果，结算开销，触发事件，推进时间，并检查是否达成结局。
  6. **重复循环**。

### 2.3 灵活的事件触发系统 (Flexible Event System)
事件系统需要一个精细的触发器 (Trigger) 设计，以支持复杂的触发逻辑。

- **触发条件**:
  - `and`: 一个列表，其中所有条件都必须满足。
  - `or`: 一个列表，其中至少一个条件满足即可。
  - `stat_check`: 检查某个属性值 (`op`: `greater_than`, `less_than`, `equal_to`)。
  - `role_check`: 检查玩家的角色（吉他、主唱等）。
  - `date_check`: 检查特定日期（月、日）。
  - `probability`: 定义事件发生的基础概率。
  - `has_flag`: 检查玩家是否拥有某个在游戏过程中获得的特定“标签”或“状态”。

### 2.4 多结局设计 (Multiple Endings)
结局和事件一样，也由精确的触发条件来判断。

- **结局触发**: 结局的触发条件与事件类似，通常包含对年龄、多个属性以及玩家标签的检查。

## 3. 数据结构设计 (Data Driven)

所有的事件、结局、物品、属性都应通过 YAML 定义，实现引擎与内容分离。

### 3.1 事件结构示例 (Event Schema `events.yaml`)
```yaml
- id: event_guitar_string_breaks
  description: "演出时你的吉他弦断了！"
  trigger:
    and:
      - type: role_check
        role: Guitar
      - type: stat_check
        stat: technique
        op: less_than
        value: 40
      - type: probability
        chance: 0.3
  choices:
    - text: "硬着头皮演下去"
      effects:
        - stat: fame
          op: subtract
          value: 5
        - stat: sanity
          op: add
          value: 10
    - text: "尝试即兴 Solo 掩盖"
      requirements:
        - type: stat_check
          stat: technique
          op: greater_than_or_equal
          value: 40
      effects:
        - stat: fame
          op: add
          value: 10
```

### 3.2 结局结构示例 (Ending Schema `endings.yaml`)
```yaml
- id: ending_27_club
  title: "27岁俱乐部"
  description: "你的才华燃烧得太过耀眼。你留下了传奇，也付出了生命的代价，永远停留在了27岁。"
  trigger:
    and:
      - type: age_check
        is: 27
      - type: stat_check
        stat: sanity
        op: less_than
        value: 10
      - type: stat_check
        stat: health
        op: less_than
        value: 10
      - type: stat_check
        stat: technique
        op: greater_than
        value: 90
      - type: stat_check
        stat: fame
        op: greater_than
        value: 80
```

 ## 4. 技术栈与架构 (Tech Stack & Architecture)
 
 - **框架**: Vue 3 + Vite
 - **语言**: TypeScript
 - **状态管理**: Vue Reactivity (ref/reactive)
 
 ### 代码目录结构规划
 ```text
 /src
   /assets
     /images
     /audio
   /data           # 游戏剧本数据
     stats.yaml    # (新增) 属性定义
     events.yaml   # 随机事件库
     endings.yaml  # 结局条件库
     items.yaml    # 乐器/装备库
     actions.yaml  # (可选) 可行动作库
   /components       # UI 组件
     StatBar.vue
     EventCard.vue
     LogPanel.vue
     ActionPanel.vue # (新增) 用于显示和选择每周行动
   /engine           # 游戏核心逻辑 (不含 UI)
     GameLoop.ts     # 时间推进与状态结算
     EventManager.ts # 事件池管理、触发条件判断
     StatSystem.ts   # 数值计算规则
     EndingManager.ts# (新增) 结局判断逻辑
     AssetLoader.ts  # 资源预加载与管理
   /types
     GameTypes.ts
   App.vue
 ```

## 5. 页面与UI (Pages & UI)
（...基本保持不变，但主游戏界面会增加 ActionPanel...）
### 主游戏界面 (Main Game Scene)
- **构成**:
  - **属性栏 (StatBar)**: 实时显示玩家的核心数值。
  - **行动面板 (ActionPanel)**: 显示本周可用的行动点和行动选项。
  - **事件卡片 (EventCard)**: 显示当前事件和选项。
  - **日志面板 (LogPanel)**: 记录过去发生的事件和选择。