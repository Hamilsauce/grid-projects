import { ref } from 'vue'
// import { defineComponent, getTemplate } from '../../lib/index.js';
import { defineComponent, getTemplate } from '../../../lib/vue-helpers.js';

// console.warn('defineComponent', defineComponent)
export const AppFooter = defineComponent(
  getTemplate('app-footer'),
  (props) => {
    const count = ref(0);
    return { count }
  }, {},
)