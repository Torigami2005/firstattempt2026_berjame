<h1>Berjame</h1>

## Project Details
- **Framework:** NuxtJS
- **Module:** Alumni Portal (Blue Links)

## Installation
Follow these steps to replicate the repository and run the application on a different computer:

1.  **Prerequisites:**
    - Ensure you have [Node.js](https://nodejs.org/) installed (LTS version recommended).
    - Ensure you have a package manager like `npm`, `yarn`, or `pnpm`.

2.  **Clone the Repository:**
    ```bash
    git clone <your-repository-url>
    cd <repository-folder-name>
    ```

3.  **Install Dependencies:**
    ```bash
    npm install
    ```

4.  **Run the Development Server:**
    ```bash
    npm run dev
    ```
    - The application will be available at `http://localhost:3000`.

5.  **Build for Production (Single File/SPA):**
    ```bash
    npm run build
    ```

6.  **Generate Static Build (for PWA/Offline support):**
    ```bash
    npm run generate
    npx serve .output/public
    ```

## PWA (Progressive Web App)

Blue Links is a fully installable PWA. It works offline and can be installed directly from the browser.

### PWA Checklist
- ✅ Valid `manifest.webmanifest` with AdDU branding
- ✅ Service Worker (`sw.js`) with caching strategies
- ✅ App icons (72x72 to 512x512) with AdDU shield branding
- ✅ Installable via browser address bar
- ✅ Offline support — app loads without internet connection

### Master Prompt

> "I am using NuxtJS (v4.4.2) to build the Blue Links alumni portal for Ateneo de Davao University. Help me convert it into a PWA with a valid manifest.json with AdDU branding, Service Worker registration, caching strategies for offline support, and app icons using AdDU branding."

### AI Hallucinations / Errors Fixed Manually

| # | Error | Fix |
|---|-------|-----|
| 1 | `@vite-pwa/nuxt` incompatible with Nuxt 4 | Switched to `vite-plugin-pwa` directly |
| 2 | `experimental: { serviceWorker: false }` does not exist in Nuxt 4 | Removed the option entirely |
| 3 | `vite-plugin-pwa` overriding manual `manifest.webmanifest` and stripping leading `/` from icon paths | Set `manifest: false` in plugin config to stop auto-generation |
| 4 | SW not registering in dev mode | Used `npm run generate` + static serve instead |
| 5 | Nuxt's built-in offline page showing instead of cached app | Manually created `sw.js` and registered it in `onMounted` |

## AI Tools Used
- Google Gemini (Senior Developer Persona)
- Claude (Coding implementation)

## Prompt
> Pretend you are a senior developer at Ateneo de Davao's faculty.  

> You are tasked to convert the mobile application into a desktop website with responsiveness.

> I will be sending screenshots of the figma prototype along with its flow.

> According to the instrument, you are tasked to convert this mobile application in to desktop website by using NuxtJS in a single file. No additional file wil be added. make sure it is compiled into a single file. since NuxtJS is different framework from any frameworks, I suggest that it should be compiled for all single file including html elements, css styles, and functionalities in javascript. 

> I will send the link of the google docs: https://docs.google.com/document/d/1Lg0KfNQH-eUhDGuio6dBdiBnE5VJIDGH6ydOPPgPgUc/edit?tab=t.0 

> here are the screenshots:

## Screenshots
Below are the official screenshots of the web application in a desktop browser:
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/9b96b2b0-62b3-4822-b5c9-d3f80adb432b" />
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/98ca37d1-239d-4e42-9908-f843250c5146" />
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/98ca37d1-239d-4e42-9908-f843250c5146" />
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/2605dace-c511-4a7b-be64-b0b8a699ffd2" />
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/059ada8b-ea8b-4fd6-8a45-d3653b404f8e" />
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/961fd56d-6eee-42bb-bb43-d184b8066474" />
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/586c8049-db5e-4c82-99bb-d45694e06a7b" />

---
*Created for Ateneo de Davao University Faculty.*

---

# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.