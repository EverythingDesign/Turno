# Turno Repository Setup & Webflow Integration Guide

This guide details the step-by-step setup of the Turno development environment and explains how it integrates with Webflow to support live local development and previewing of custom code.

---

## 1. Repository Setup & Architecture

### Folder Structure
The repository splits raw source code from compiled, minified code used on the production site:
*   `codes/` — Contains development source files organized by page/feature (e.g., `common/`, `home/`, `contact/`).
*   `dist/` — Contains production-ready, minified distribution files compiled by `esbuild`.
*   `localhost.pem` & `localhost-key.pem` — Local SSL certificate files required to run a secure localhost server.
*   `package.json` — Defines package scripts and dev dependencies.

### Dependencies
The project uses the following developer dependencies (`devDependencies` in `package.json`):
1.  **`serve`**: A static file server used to host local scripts under the `codes/` directory.
2.  **`local-ssl-proxy`**: Proxies the HTTP server (port `3000`) to HTTPS (port `3001`). This is required because modern browsers block loading HTTP assets on HTTPS sites (Webflow) under Mixed Content security policies.
3.  **`concurrently`**: Runs the static server and the SSL proxy concurrently within a single terminal window.
4.  **`esbuild`**: A highly efficient compiler/bundler that minifies source files in `codes/` into `dist/`.

### Development Scripts (`package.json`)
*   `npm run kill`: Frees ports `3000` and `3001` if they are being used by previously hung processes.
*   `npm run dev`: Chains commands to kill hung processes, serve `codes/` locally on port `3000` with CORS support, and expose it via HTTPS on port `3001` using the SSL certificates.
*   `npm run build`: Compiles and minifies files under `codes/**/*.js` and writes the outputs to `dist/`.
*   `npm run watch`: Watches development files for edits and automatically recompiles them to `dist/` in real time.

---

## 2. Webflow Live Development Setup

To see custom code updates in real time on a staging or preview Webflow site without having to publish the Webflow site for every small change, the project serves local scripts to the browser.

### Step-by-Step Live Development Workflow

#### Step 1: Generate SSL Certificates (One-time Setup)
If certificates are missing, local SSL certificates (`localhost.pem` and `localhost-key.pem`) must be generated in the root folder (e.g., using `mkcert` or `openssl`) to enable HTTPS on `localhost:3001`.

#### Step 2: Start the Dev Server
Run the following command in the project root:
```bash
npm run dev
```
This runs the local server and the secure SSL proxy. Your local scripts are now securely accessible at `https://localhost:3001/`.

#### Step 3: Link Scripts in Webflow Custom Code
In the custom code settings of your Webflow pages (specifically in the **Before `</body>` tag** section), inject script tags pointing to your secure local proxy server:
```html
<!-- Load common utilities locally -->
<script src="https://localhost:3001/common/navbarFunc.js"></script>

<!-- Load page-specific custom code locally -->
<script src="https://localhost:3001/home/hero-cursor-follow.js"></script>
```

#### Step 4: Preview Live Updates
1.  Make an edit to your code inside the local `codes/` folder and save it.
2.  Open your Webflow staging/preview site (e.g. `your-site.webflow.io`) in your browser.
3.  Reload the page. The browser loads the updated local script instantly, allowing you to test modifications in real time.

---

## 3. Going to Production

When features are ready to go live to all visitors:
1.  **Compile & Minify**: Run the build script to compile production-ready assets:
    ```bash
    npm run build
    ```
2.  **Host the Assets**: Push the new changes to your hosting or CDN service (e.g., hosting them on GitHub and using jsDelivr, or hosting on Netlify/AWS S3).
3.  **Update Webflow Scripts**: Replace the local proxy URLs in Webflow's custom code editor with the production CDN URLs:
    ```html
    <!-- Example production script tag -->
    <script src="https://cdn.jsdelivr.net/gh/EverythingDesign/Turno@latest/dist/home/hero-cursor-follow.js"></script>
    ```
4.  **Publish in Webflow**: Click publish to deploy the site with the production scripts.
