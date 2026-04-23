// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  
  // PWA Configuration
  ssr: true,
  
  app: {
    head: {
      title: 'Blue Links – Ateneo de Davao Alumni Portal',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1.0, viewport-fit=cover' },
        { name: 'description', content: 'Connect with fellow Ateneo de Davao alumni, explore career opportunities, and strengthen your professional network.' },
        { name: 'theme-color', content: '#003366' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'apple-mobile-web-app-title', content: 'Blue Links' },
        { name: 'apple-mobile-web-app-status-bar', content: 'black-translucent' },
        { name: 'msapplication-TileColor', content: '#003366' },
        { name: 'msapplication-TileImage', content: '/icon-192.svg' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'format-detection', content: 'telephone=no' }
      ],
      link: [
        { rel: 'manifest', href: '/manifest.json' },
        { rel: 'icon', type: 'image/svg+xml', href: '/icon-192.svg' },
        { rel: 'apple-touch-icon', href: '/icon-192.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: true },
        { 
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap'
        }
      ]
    }
  },

  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/sitemap.xml', '/robots.txt'],
      ignore: ['/admin']
    }
  }
})
