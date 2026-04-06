<template>
  <div class="flavor-text">
    <p class="flavor-line">{{ text }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ week: number }>();

const POOL = [
  '这周你感觉状态不错，排练室里的空气都带着些许兴奋。',
  '窗外飘来阵阵小雨，你坐在排练室里发了很久的呆。',
  '最近城里来了几支新乐队，你在想自己差距有多大。',
  '你的手指在闲暇时总是不自觉地拨弄琴弦，停不下来。',
  '地下室的隔音很差，楼上的脚步声一直干扰你的练习。',
  '有人说，音乐是孤独者的语言。你深有同感。',
  '本周的演出让你意识到，台上的一分钟需要台下十年功。',
  '你在回家路上哼起自己写的旋律，路人给了你一个奇怪的眼神。',
  '排练结束后，你一个人坐在空旷的房间里，感受着残留的回声。',
  '这周的创作遇到了瓶颈，灵感就像干涸的河床，一点都挤不出来。',
  '今天天气很好，你想出去走走，但又放不下手里的乐器。',
  '生活有时候就是这样——平静，但充满了某种无法言说的期待。',
];

// Deterministic per week so it stays stable across re-renders
const text = computed(() => POOL[props.week % POOL.length]);
</script>

<style scoped>
.flavor-text {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 2rem;
}

.flavor-line {
  font-size: 1rem;
  color: rgba(200, 180, 255, 0.55);
  font-style: italic;
  line-height: 1.8;
  text-align: center;
  max-width: 480px;
  letter-spacing: 0.04em;
  text-shadow: 0 0 20px rgba(180, 120, 255, 0.15);
  margin: 0;
}
</style>
