<template>
  <h1>{{ msg }}</h1>
  <button @click="add">count is: {{ state.count }}</button>
  <p>
    Edit
    <code>components/HelloWorld.vue</code> to test hot module replacement.
  </p>
</template>

<script>
import {reactive} from 'vue'
export default {
  name: 'HelloWorld',
  props: {
    msg: {
      type: String,
      default: '',
    },
  },
  setup() {
    const state = reactive({
      count: 0,
    })
    const add = () => {
      state.count++
    }
    return {state, add}
  },
}
</script>
