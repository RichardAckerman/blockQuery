import Vue from 'vue'
import ElementUI from 'element-ui'
import '../theme/index.css'
import router from './router'
import App from './App'
import './router/api'

Vue.config.productionTip = false

Vue.use(ElementUI)

new Vue({
    el: '#app',
    router,
    components: {App},
    template: '<App/>'
})
