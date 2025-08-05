import { ref, computed } from 'vue'
import { defineComponent, getTemplate } from '../../lib/vue-helpers.js';
// import { savedProjects ,tripleProjects} from '../data/projects.js';

import { AppHeader } from '../../dfs-maze/ui/app-shell/AppHeader.js';
import { AppBody } from '../../dfs-maze/ui/app-shell/AppBody.js';
import { AppFooter } from '../../dfs-maze/ui/app-shell/AppFooter.js';


// import { ListItem } from '../ui/ListItem.js';
const t = getTemplate('app');

export const App = defineComponent(
  getTemplate('app', true),
  () => {
    const count = ref(0);
    const listItems = computed(() => tripleProjects);
    // const listItems = ref(listItemsData);
    return { count, listItems }
  },
  {
    components: {
      'app-header': AppHeader,
      'app-body': AppBody,
      'app-footer': AppFooter,
      // 'list-item': ListItem,
    }
    
  },
)