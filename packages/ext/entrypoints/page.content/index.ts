import { defineContentScript } from "wxt/sandbox";
import { ContentScriptContext, createShadowRootUi } from "wxt/client";
import '@/assets/tailwind.css'


// 1. Import the style
// import './style.css';
import { createApp } from 'vue';
import App from './App.vue';
import { toast } from "@/src/components/ui/toast";

export default defineContentScript({
  matches: [
    '<all_urls>',
    '*://*.example.com/*',
    '*://*.baidu.com/*',
  ],
  // 2. Set cssInjectionMode
  cssInjectionMode: 'ui',

  async main(ctx) {
    console.log('content script loaded: page.content');
    // 3. Define your UI
    const ui = await createShadowRootUi(ctx, {
      name: 'webpage-summary',
      position: 'inline',
      anchor: 'body',
  		append: "last",
      mode: 'open',  //enable document.select('webpage-summary').shadowRoot
      
    

      onMount: (container, _shadow, shadowHost) => {
        // console.log(container,_shadow,shadowHost)
        // Define how your UI will be mounted inside the container
        const app = createApp(App);
        app.config.errorHandler = (err:any) => {
          /* 处理错误 */
          toast({ title: 'Error', description: err.message ,variant:'destructive'});
        }
        app.mount(container);
        return app;
      },
      
      onRemove: (app) => {
        // Unmount the app when the UI is removed
        app?.unmount();
      },
    });

    // 4. Mount the UI
    ui.mount();
  },
});