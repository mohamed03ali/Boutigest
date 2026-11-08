import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// ÉTAPE 1 : mettre true, déployer, ouvrir le site sur chaque téléphone.
// Le service worker se désinstalle et vide ses caches (la base locale n'est pas touchée).
// ÉTAPE 2 : remettre false, redéployer.
const RESET_SW = false

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    babel({ presets: [reactCompilerPreset()] }),
    VitePWA({
      selfDestroying: RESET_SW,
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'Boutigest',
        short_name: 'Boutigest',
        description: 'Gestion de stock et de ventes hors-ligne pour les petits commerces.',
        theme_color: '#0B2A66',
        background_color: '#FFFFFF',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icons/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        clientsClaim: true,          // la nouvelle version prend le contrôle tout de suite
        skipWaiting: true,           // elle ne reste pas "en attente" derrière l'ancienne
        cleanupOutdatedCaches: true, // elle supprime les anciens caches
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // ton JS fait ~1,3 Mo : marge de sécurité
        navigateFallback: '/index.html',
      },
    }),
  ],
})