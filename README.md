<h1 align="center">Gloammark</h1>

<p align="center"><img src="https://github.com/rensizecc/Gloammark/blob/main/assets/Gloammark.png?raw=true" alt="Gloammark" /></p>

<p align="center"><img src="https://readme-typing-svg.demolab.com?font=Inter&weight=500&size=18&pause=1200&color=FFFFFF&center=true&vCenter=true&width=700&lines=A%20visual%20README%20builder%20for%20developers." alt="A visual README builder for developers." /></p>

<p align="center">
  <img alt="stars" src="https://img.shields.io/github/stars/rensizecc/Gloammark?style=flat&label=stars&color=18181b&labelColor=27272a&logoColor=ffffff" />&nbsp;&nbsp;
  <img alt="forks" src="https://img.shields.io/github/forks/rensizecc/Gloammark?style=flat&label=forks&color=18181b&labelColor=27272a&logoColor=ffffff" />&nbsp;&nbsp;
  <img alt="issues" src="https://img.shields.io/github/issues/rensizecc/Gloammark?style=flat&label=issues&color=18181b&labelColor=27272a&logoColor=ffffff" />&nbsp;&nbsp;
  <img alt="license" src="https://img.shields.io/github/license/rensizecc/Gloammark?style=flat&label=license&color=18181b&labelColor=27272a&logoColor=ffffff" />&nbsp;&nbsp;
  <a href="https://github.com/rensizecc/Gloammark/releases">
    <img alt="version" src="https://img.shields.io/badge/version-1.4.0-18181b?style=flat&labelColor=27272a&logoColor=ffffff" />
  </a>&nbsp;&nbsp;
  <a href="https://github.com/rensizecc/Gloammark/releases">
    <img alt="platform" src="https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-18181b?style=flat&labelColor=27272a&logoColor=ffffff" />
  </a>
</p>

## Table of Contents

- [Preview](#preview)
- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Why Gloammark?](#why-gloammark)
- [Development](#development)
- [Desktop Builds](#desktop-builds)
- [FAQ](#faq)
- [Contributing](#contributing)
- [License](#license)

## Preview

![Screenshot 1](https://github.com/rensizecc/Gloammark/blob/main/assets/screenshots/gloammark-editor.png?raw=true)

## About

Gloammark is a **visual README editor** built for developers who want polished documentation without manually composing Markdown. Create your README from structured blocks, format content visually, preview the GitHub-rendered result, and export **clean GitHub Flavored Markdown**.

Gloammark can also import existing README files, preserve unsupported Markdown, manage multiple projects, validate documents, **and run as a native desktop application**.

## Features

| Feature                   | Description                                                                            |
| :------------------------ | :------------------------------------------------------------------------------------- |
| ✨ Visual Editor           | Compose README files using configurable blocks instead of Markdown syntax.             |
| 🧩 Rich Text              | Format text with bold, italic, strikethrough, inline code, links, and lists.           |
| ⚡ Live Preview            | Preview the rendered README while you work.                                            |
| 🧠 Structured Import      | Open existing README.md files and convert supported content back into editable blocks. |
| 🌐 GitHub Import          | Load a README directly from a GitHub repository.                                       |
| 🧱 Safe Round-Trip        | Unsupported Markdown can be preserved instead of discarded.                            |
| 🖥️ Project Management    | Create, open, save, and manage multiple Gloammark projects.                            |
| ✅ README Validation       | Detect broken URLs, incomplete blocks, duplicate fields, and other common issues.      |
| 📦 Clean GFM Export       | Copy Markdown or export a production-ready README.md file.                             |
| 📱 Cross-Platform Desktop | Package Gloammark for Windows, macOS, and Linux.                                       |

## Tech Stack

![Tech Stack](https://skillicons.dev/icons?i=ts,react,vite,tailwind,electron&theme=dark&perline=12)

## Why Gloammark?

Most README generators behave like long configuration forms. Gloammark treats the README itself as the workspace. Add sections, reorder blocks, format content visually, import existing documents, and inspect the final GitHub output as you work.

## Development

> Package manager: `npm`

1. **Clone the repository**

```bash
git clone https://github.com/rensizecc/gloammark.git
```

2. **Enter the project directory**

```bash
cd gloammark
```

3. **Install dependencies**

```bash
npm install
```

4. **Start the development server**

```bash
npm run dev
```

## Desktop Builds

Release builds for macOS and Linux can also be produced through the included Electron Builder configuration and GitHub Actions workflow.

```bash
npm run dist:win
npm run dist:win:portable
```

## FAQ

<details>
<summary>Do I need to know Markdown?</summary>
<p>No. Gloammark is designed to let you build and edit README files visually.</p>
</details>

<details>
<summary>Can I edit an existing README?</summary>
<p>Yes. Import a local README.md file or load one directly from a GitHub repository.</p>
</details>

<details>
<summary>Will Gloammark destroy unsupported Markdown?</summary>
<p>Unsupported content can be preserved as Custom Markdown instead of being silently discarded.</p>
</details>

<details>
<summary>Does Gloammark modify my GitHub repository?</summary>
<p>No. Gloammark edits documents locally and exports the resulting Markdown.</p>
</details>

<details>
<summary>Is there a desktop version?</summary>
<p>Yes. Gloammark can be packaged as a native desktop application with Electron.</p>
</details>

## Contributing

Contributions, bug reports, and feature requests are welcome. Open an issue before starting larger changes so the implementation can be discussed first.

1. Fork and clone the repository

```bash
git clone https://github.com/rensizecc/gloammark.git
```

2. Create a feature branch

```bash
git checkout -b feat/my-change
```

3. Install dependencies and validate the project

```bash
npm install
npm run build
```

## License

Released under the **GPL-3.0** license.

Created by **rensizecc (rensize)**.
