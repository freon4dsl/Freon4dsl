# Contributing to Freon

Thank you for your interest in contributing to **Freon** — the language workbench for the web.  
Your help is what makes this project thrive!

This document explains how to get started, what we expect, and how to submit changes.

---

## 🧭 Ways to Contribute

There are many ways you can help improve Freon:

- 🪲 **Report bugs** — if something doesn’t work as expected, please open an issue.
- 🧠 **Improve documentation** — clear examples and better explanations are always welcome.
Our docs live in a separate repository: [freon4dsl/Freon-documentation] (https://github.com/freon4dsl/Freon-documentation).
You can suggest edits or open issues there.
- ⚙️ **Fix or enhance code** — tackle an existing issue or add something new.
- 💬 **Join discussions** — share ideas and feedback in our [Discussions](../../discussions).

Not sure where to begin? Look for issues labeled [`good first issue`](../../issues?q=is%3Aissue+is%3Aopen+label%3A"good+first+issue").

---

## 🛠️ Setting Up Your Environment

1. **Fork** the repository and clone your fork:  
   git clone https://github.com/freon4dsl/Freon4dsl.git  
   cd freon4dsl

2. **Install dependencies:**  
   npm install

3. **Build and test:**  
   npm run build  
   npm run test

For more context, see the ["Developing Freon"](README.md#developing-freon) section in the README.

---

## 📚 Developer Documentation

For in-depth technical explanations of Freon’s architecture, generators, and APIs, see the [`developer-documentation`](developer-documentation) folder in this repository.  
It contains background information and implementation details to help you understand how everything fits together.

---

## 💡 Development Guidelines

- Use **TypeScript** consistently.
- Follow **Svelte** best practices for the front-end code.
- Keep code **modular and readable** — aim for clarity over cleverness.
- Write **useful commit messages**, for example:  
  fix(generator): handle nested typing rules correctly  
  feat(editor): add support for inline validation hints
- When adding new features, include or update relevant **unit tests**.

---

## 🔍 Before Submitting

1. Ensure all tests pass:  
   npm test
2. Lint your code (if applicable):  
   npm run lint
3. Make sure your changes build cleanly:  
   npm run build
4. Update documentation or examples if needed.
5. Describe *why* your change is useful in the pull request.

---

## 📬 Submitting a Pull Request

1. Push your branch to your fork:  
   git push origin my-feature
2. Open a pull request from your branch into `main`.
3. The maintainers will review it and may suggest improvements.

We appreciate every contribution — no matter how small. ❤️

---

## 📜 Code of Conduct

Please note that this project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md).  
By participating, you agree to uphold its principles of respect and inclusivity.

---

## 💬 Need Help?

If you have questions or ideas, start a conversation in our [Discussions](../../discussions).  
We’re always glad to help you get started.

---

Thank you for making Freon better! 🙌
