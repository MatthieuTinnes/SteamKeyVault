import './assets/main.css'
import 'primeicons/primeicons.css'
import 'primevue/resources/themes/lara-light-blue/theme.css'
import 'primevue/resources/primevue.min.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'
import Toast from 'primevue/toast'
import ConfirmDialog from 'primevue/confirmdialog'
import Aura from '@primeuix/themes/aura';
import { i18n } from './i18n'

const app = createApp(App)
const pinia = createPinia()

app.use(PrimeVue, {
    theme: {
        preset: Aura
    }
});
app.use(router)
app.use(pinia)
app.use(i18n)
app.use(ToastService)
app.use(ConfirmationService)
app.component('Toast', Toast)
app.component('ConfirmDialog', ConfirmDialog)

app.mount('#app')
