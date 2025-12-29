 # 乐队经验模拟小游戏 (Band Career Simulator)

## 1. 游戏愿景 (Vision)
 - **核心体验**: 文字冒险 (AVG) + 轻度策略养成。
 - **背景**: 现代都市，从 18 岁高中毕业/大学开始，历经组建乐队、地下演出、签约厂牌、巡演，直到成为传奇或解散。
 - **风格**: 类似《BitLife》或《中国式家长》，但专注于音乐生涯。
 - **特色**: 包含大量摇滚乐梗、现实乐手彩蛋（如 "27岁俱乐部" 结局）。
 
## 2. 核心机制 (Core Mechanics)
 
### 角色与属性 (Stats)
 - **基本信息**: 姓名、职位 (吉他/贝斯/鼓/主唱/键盘)、流派偏好。
 - **核心数值**:
   - 🎸 **技术 (Technique)**: 你的技术能力，决定演出质量和创作上限。
   - 🌟 **魅力 (Charm)**: 你的颜值，谈吐，决定演出规模和粉丝数量。
   - 💰 **金钱 (Money)**: 购买设备、支付排练费、生活开销。
   - 🧠 **精神/压力 (Sanity/Stress)**: 过高会导致崩溃、离队或药物成瘾事件。
   - 🤝 **乐队默契 (Chemistry)**: 影响创作成功率和解散风险。
 
### 游戏循环 (Game Loop)
 1. **时间推进**: 以“周”或“月”为单位。
 2. **行动阶段 (Action Phase)**:
    - *练习*: 提升技术，增加压力。
    - *打工*: 增加金钱，消耗精力。
    - *创作*: 消耗灵感，产出 Demo。
    - *演出/混圈*: 提升名气，寻找队友。
 3. **事件阶段 (Event Phase)**: 触发随机事件或剧情事件（如：队友吵架、乐器被偷、收到厂牌 Offer）。
 4. **结算**: 更新数值，检查是否达成结局条件。
 
## 3. 数据结构设计 (Data Driven)
 所有的事件、结局、物品都应通过 JSON/YAML 定义，实现引擎与内容分离。同时，为了增强沉浸感，数据结构中预留了美术和音乐资源的字段引用。
 
### 事件结构示例 (Event Schema)
```json
{
  "id": "event_001_broken_string",
  "title": "演出事故",
  "description": "在 Livehouse 演出时，你的吉他弦突然断了。",
  "visual": "bg_livehouse_dark.jpg",
  "trigger": {
    "type": "random",
    "probability": 0.05,
    "condition": "role == 'guitarist' && technique < 50"
  },
  "choices": [
    {
      "text": "硬着头皮演下去",
      "effect": {
        "fame": -5,
        "stress": 10,
        "technique": 1
      }
    },
    {
      "text": "尝试即兴 Solo 掩盖",
      "requirement": "technique >= 40",
      "effect": {
        "fame": 10,
        "chemistry": 5
      }
    }
  ]
}
 ```
 
 ## 4. 技术栈与架构 (Tech Stack & Architecture)
 
 ### 推荐栈 (根据你的 JS 经验调整)
 
 #### 方案 B: 现代工程化 (进阶)
 - **框架**: Vue 3 (比 React 更容易上手，适合新手) + Vite。
 - **语言**: TypeScript (虽然有学习曲线，但能避免很多低级错误)。
 - **状态**: Vue Reactivity (ref/reactive) 足够处理，不需要复杂的 Redux。
 
 ### 代码目录结构规划
 ```text
 /src
   /assets
     /images         # 背景图、角色立绘、UI素材
     /audio          # BGM、音效 (SFX)
     /data           # 游戏剧本数据
       events.yaml   # 随机事件库
       endings.yaml  # 结局条件库
       items.yaml    # 乐器/装备库
   /components       # UI 组件
     StatBar.tsx     # 属性显示
     EventCard.tsx   # 事件交互卡片
     LogPanel.tsx    # 历史记录
   /engine           # 游戏核心逻辑 (不含 UI)
     GameLoop.ts     # 时间推进与状态结算
     EventManager.ts # 事件池管理、触发条件判断
     StatSystem.ts   # 数值计算规则
     AssetLoader.ts  # 资源预加载与管理 (处理图片/音频加载)
   /types            # TypeScript 类型定义
     GameTypes.ts
   App.tsx
 ```
