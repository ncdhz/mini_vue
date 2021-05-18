### 实现了 VUE 中的 {{}} 功能

```
<div id="app">
    Author: {{author}}
</div>
<script src="index.js"></script>
<script>
    var data = {
        data: {
            author: 'NCDHZ'
        }
    }
    Vue.createApp(data).mount('#app')
</script>
```