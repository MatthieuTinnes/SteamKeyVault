# AGENTS.md

Guidance for coding agents (Claude Code, Codex, OpenCode, Copilot…) working in this repository. The
project context (stack, setup, testing, deployment) is in [README.md](README.md): read it first.

## Conventions

- Everything is in **English**: code, code comments, CI workflows, UI strings and the README.
- Commits follow [Conventional Commits](https://www.conventionalcommits.org) (`feat: …`,
  `fix: …`, `chore: …`, `ci: …`), lowercase imperative subject, no gitmoji: the release notes are
  generated from them (`cliff.toml`), and other commits are left out.
- `main` is the only branch: PRs target `main`, which deploys to preprod; prod runs the latest
  release tag (see [Releases](README.md#releases)).
