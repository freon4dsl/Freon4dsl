# Freon — The Language Workbench for the Web

[![Build Status](https://github.com/freon4dsl/freon4dsl/actions/workflows/node.js.yml/badge.svg)](https://github.com/freon4dsl/freon4dsl/actions)
[![Contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg)](../../discussions)
[![GitHub issues](https://img.shields.io/github/issues/freon4dsl/freon4dsl)](../../issues)

📦 [NPM](https://www.npmjs.com/org/freon4dsl) · 🧠 [Docs](https://www.freon4dsl.dev) · 💬 [Discussions](../../discussions)


**From documents to models**  
Freon is a language workbench that generates browser-based editors from your own domain-specific language (DSL).  
It helps businesses capture knowledge in a structured way — turning Word-style requirements into models that can be automated, stored, and reused.

- ⚡ **Easy to start**: smart defaults and generators for common tasks.
- 🌐 **Runs in the browser**: editors are instantly usable, no complex setup.
- 🧩 **Meta-languages for scope & typing**: declare rules instead of hard-coding them.
- 🔀 **Hybrid approach**: combines projectional editing with parsing for flexible, natural DSLs.

📖 [Freon documentation](https://www.freon4dsl.dev)  
🎮 [Sample DSLs](packages/samples)

---

## Which Repo Do You Need?

> 💡 **If your goal is to *use* Freon to build your own DSL**, head over to the [create-freon](https://github.com/freon4dsl/create-freon) repository.  
> This repository (`freon4dsl/freon4dsl`) is for **developing Freon itself** — its core framework, editor engine, and generators.

---

## 🤝 Want to Contribute?

We’re always happy to welcome new contributors to the **Freon** project!

Whether you’re fixing bugs, improving documentation, or adding new features — your help makes a real difference.  
If you’d like to join in:

1. **Fork** this repository
2. **Create a branch** for your change
3. **Submit a pull request**

Not sure where to start? Check our [issues](../../issues) labeled `good first issue`, or reach out by opening a [discussion](../../discussions).

📘 For full contribution guidelines, see [CONTRIBUTING.md](CONTRIBUTING.md).

Let’s build something great together!

## Releases

- **August 1, 2025: Version 2.0.0-beta.2 released**
- **May 13, 2025: Version 1.1.0-beta.3 released**
  - Updated to Svelte 5 (was Svelte 4).
  - Performance improvements in generation.
  - Really fast hot reloading thanks to Vite.
- **May 13, 2025: IDE plugin version 0.0.4 released** → [see details here](https://github.com/freon4dsl/freon-ide/blob/main/README.md)

---

## What is Freon?

Freon is a **TypeScript/JavaScript framework** for creating and implementing projectional editors for DSLs that run natively in the browser.  
Beyond the core framework, Freon includes generators for many parts of a DSL’s working environment.

---

## Developing Freon

If you want to work on the Freon framework itself:

### Prerequisites
- [Node.js](https://nodejs.org/)
- [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm/)

We typically use the latest versions, although older versions may work as well.

For more background on Freon’s internal structure and build process, check out the [`developer-documentation`](developer-documentation) folder.  
It includes technical notes and guidelines for maintainers and advanced contributors.


### Build and Test
```bash
git clone https://github.com/freon4dsl/freon4dsl.git
cd Freon4dsl
npm install
npm run build
npm run test
```

### Running the Web App Editor

You can try Freon with one of the sample languages.

#### 1. Build the language
```bash
cd packages/samples/<your-sample>
npm run build
```

#### 2. Configure the web app
Edit `packages/webapp-flowbite/package.json`:  
```json
"dependencies": {
"@freon4dsl/<your-sample>": "2.0.0"
}
```

Edit `packages/webapp-flowbite/src/starter.ts`:  
```ts
import { LanguageEnvironment } from "@freon4dsl/<your-sample>";
```

#### 3. Start the server
```bash
cd packages/server
npm run start
```
The server runs continuously in the background, so open another terminal to start the web app.

#### 4. Run the web app
```bash
cd packages/webapp-flowbite
npm run styles
npm run dev
```

➡️ Open the URL shown in your terminal (e.g. `http://localhost:<port>/`).  
This will display the example language editor in your browser.

---

### Source Organization

The codebase is organized into multiple packages:

- **packages/core** – main framework
  - `src/editor` → editor framework
  - `src/language/decorators` → [MobX](https://mobx.js.org/) decorators
- **packages/core-svelte** – HTML & CSS integration
- **packages/meta** – DSL definition & code generation
  - `languagedef` → generates code from `*.ast` files (abstract syntax trees)
  - `editordef` → generates code from `*.edit` files (editor definitions)
  - `scoperdef` → generates code from `*.scope` files (scoping rules)
  - `typerdef` → generates code from `*.type` files (typing rules)
  - `validatordef` → generates code from `*.valid` files (validators)
- **packages/samples** – example DSLs
- **packages/server** – minimal demo model server
- **packages/weblib-*`** – shared web libraries
- **packages/webapp-flowbite** – current demo web app using [Flowbite-Svelte](https://flowbite-svelte.com/)
- **packages/webapp-smui** – older demo web app using [Svelte Material UI (SMUI)](https://sveltematerialui.com/)
- **developer-documentation** – technical information for contributors and maintainers
  - Explains architecture, build setup, generators, and API internals


We build Freon and its documentation out of curiosity, passion, and love for language engineering.
We invite you to share that enthusiasm and help make something meaningful — together. ❤️
