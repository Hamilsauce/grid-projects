import { ref } from 'vue'
import { defineComponent, getTemplate } from '../lib/index.js';



export const ListItem = defineComponent(
  getTemplate('list-item'),
  (props) => {
    const item = ref(props.item ?? {})
    const title = ref(item.value.title)
    const status = ref(item.value.projectStatus)
    const notes = ref(item.value.notes)
    const tags = ref(item.value.meta.tags)
    
    return { name, status, notes, title, tags }
  }
)

ListItem.props = ['item']