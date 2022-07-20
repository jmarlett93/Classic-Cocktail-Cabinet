import { createWebHistory, createRouter } from 'vue-router';
import BottlePath from '@/components/BottlePath.vue';
import DrinkPath from '@/components/DrinkPath.vue';
import ToolsAndTechniques from '@/components/ToolsAndTechniques.vue';

const routes = [
  {
    path: '/by-the-bottle',
    name: 'BottlePath',
    component: BottlePath,
  },
  {
    path: '/from-the-drink',
    name: 'DrinkPath',
    component: DrinkPath,
  },
  {
    path: '/tools-and-techniques',
    name: 'ToolsAndTechniques',
    component: ToolsAndTechniques,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
