# 素材需求：人物立绘

## 整体思路
只生成**持乐器的头图/半身立绘**，用于角色初亮相场景。
文件命名规范：`{name}_{instrument}_{state}.png`
例如：`nana_bass_talking.png`、`protagonist_guitar_normal.png`

---

## 核心约束：每个角色乐器不重复

| 角色 | 乐器 | 说明 |
|------|------|------|
| 主角 | 吉他（Guitar） | 默认形象 |
| NaNa / Yukki（女贝斯手） | 贝斯（Bass） | 与主角不重复 |
| 鼓手（待命名） | 鼓组（Drums） | 坐姿半身 |
| 其他 NPC（1–2个，待定） | 键盘 / 小提琴 等 | 与前三人均不重复 |

---

## 各角色立绘清单

### 主角
- `protagonist_guitar_normal.png` — 普通表情，拿吉他
- `protagonist_guitar_excited.png` — 兴奋表情（可选，结局/高潮场景）

### NaNa / Yukki（女贝斯手）
- `nana_bass_normal.png` — 普通/冷静表情，拿贝斯（**初亮相**）
- `nana_bass_talking.png` — 说话/认真表情，拿贝斯
- `nana_bass_happy.png` — 开心/微笑表情（可选）

### 鼓手（待命名）
- `drummer_drums_normal.png` — 普通表情，坐于鼓前半身（**初亮相**）
- `drummer_drums_talking.png` — 说话表情（可选）

### 其他 NPC（1–2个，待定）
- `npc1_{instrument}_normal.png` — 乐器待定，优先避开吉他/贝斯/鼓
- `npc2_{instrument}_normal.png`（如有）

---

## 优先级

1. `nana_bass_normal.png` — 游戏第一个出现的立绘，最高优先
2. `protagonist_guitar_normal.png`
3. `drummer_drums_normal.png`
4. NaNa 表情变体（talking / happy）
5. 其余 NPC

---

## 待确认事项

- [ ] NaNa 外形方向（发色、气质、东亚/混血风）
- [ ] 鼓手性别设定（男/女/中性风）
- [ ] 主角外形参考（有无既定形象）
- [ ] NPC 是否需要，以及各自的乐器选择
- [ ] 是否需要 Live 舞台场景变体（舞台灯光氛围版）
