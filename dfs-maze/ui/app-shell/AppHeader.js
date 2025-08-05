import { ref } from 'vue'
import { defineComponent, getTemplate } from '../../../lib/vue-helpers.js';

export const AppHeader = defineComponent(
  getTemplate('app-header'),
  (props) => {
    const count = ref(0);
    return { count }
  }, {},
)