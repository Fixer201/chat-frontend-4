# Contributing to A-Chat

Thank you for your interest in contributing. This document explains the preferred workflow, commit conventions and the
process for creating high-quality pull requests. Follow these guidelines to make review and integration smoother.

> Important: work **only** in the `dev` branch of _your fork_. Do not push direct changes to the upstream repository.
---

## Before you start

1. Read this file.
2. Read the repository README and relevant docs: `docs/GIT-FLOW.md` and `docs/COMMIT-STRUCTURE.md`.

---

## One-time setup

Fork the repository on GitHub, then clone your fork and configure the upstream remote once:

```bash
# add upstream (original repository)
git remote add upstream https://github.com/akatosphere/chat-frontend-4.git
git remote -v
```

---

## Daily workflow

Before you begin any work or open a pull request, sync your fork with upstream:

```bash
git fetch upstream
git checkout dev
git merge upstream/dev
git push origin dev
```

Work in your fork's `dev` branch (do not create long-lived feature branches on the upstream repo). Typical edit /
commit / push cycle:

```bash
# make changes
git add .
git commit -m "type(scope): short description"
git push origin dev
```

---

## Branching & Pull Requests

- Work in the `dev` branch of your fork. Do not push branches directly to the upstream repository.
- When ready, create a pull request from your fork to the upstream repository:
    - **From:** `your-username/chat-frontend-4:dev`
    - **To:** `akatosphere/chat-frontend-4:dev`
- Use the GitHub PR interface to provide a clear description of the change, reference related issues and attach
  screenshots or migration notes if relevant.
- PRs should be focused and small enough for efficient review. Split large work into multiple PRs where possible.

You can open a PR using the upstream repository pull list:  
`https://github.com/akatosphere/chat-frontend-4/pulls`

---

## Commit messages

Follow the structured commit format. The full specification is in `docs/COMMIT-STRUCTURE.md`. Put simply:

```
type(scope): description
```

- **type:** `feat | fix | refactor | chore | style | test`
- **scope:** the module or feature affected (for example `chat`, `chats-list`, `settings`)
- **description:** short English description, imperative mood, present tense

**Example:**

```
feat(chat): add ability to enter emojis
```

See `docs/COMMIT-STRUCTURE.md` for detailed rules and examples.

---

## Creating issues

When opening an issue, provide:

- Clear title and description.
- Steps to reproduce (if applicable).
- Expected vs actual behavior.
- Environment details (browser, Node version, OS).
- Attach logs, screenshots or network traces as needed.
- If you propose a fix, describe the approach or link to a draft branch/PR.

Use the repository issue tracker:  
`https://github.com/akatosphere/chat-frontend-4/issues`

---

## Code style, tests & linters

- Follow project TypeScript and linting rules.
- Run linters before pushing.
- Keep changes consistent with existing patterns and architecture (Feature-Sliced Design, alias imports).
- If your change adds or modifies behavior, add or update tests where appropriate.

Useful commands:

```bash
npm install
npm run dev
npm run lint
npm run build
```

---

## Pull request checklist

Before requesting review, ensure your PR includes:

- Upstream `dev` merged into your fork’s `dev` (no outstanding merge conflicts).
- A concise PR title and description that explains the why and what.
- Commits follow the format defined in `docs/COMMIT-STRUCTURE.md`.
- Code compiles and the app runs locally (`npm run dev`).
- Linter passes (`npm run lint`) and automated checks are green.
- Relevant tests are added/updated and pass.
- Any migration steps, configuration changes, or manual steps are documented.
- Reference to related issue(s): `Fixes #<number>` or `Refs #<number>` if applicable.

A clearly described, small PR gets reviewed and merged faster.

---

## Review process

- Reviewers will check correctness, style, tests and overall impact.
- Be responsive to review comments: update your branch and push changes to the same fork/branch.
- Avoid force-pushing to branches used by an open PR unless requested.
- Once approvals are collected and CI passes, a maintainer will merge the PR.

---

## Security issues

Do not disclose security vulnerabilities in public issues. If you discover a security vulnerability, report it privately
to the repository maintainers. Mark the communication as a security report.

---

## Acknowledgements

Thank you for contributing. Contributions, bug reports and suggestions are appreciated. If your change is merged and you
feel like supporting the project further, consider starring the repository.

---
