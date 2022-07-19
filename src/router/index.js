import { createWebHistory, createRouter } from 'vue-router';
import BottlePath from '@/components/BottlePath.vue';
import DrinkPath from '@/components/DrinkPath.vue';
import ToolsAndTechniques from '@/components/ToolsAndTechniques.vue'; // doing components here instead of views?  like in the example

const routes = [
  {
    path: '/by-the-bottle',
    name: 'BottlePath',
    component: BottlePath, // are these components matching up with the component files I made?  Or is it overlapping in a bad way?
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
