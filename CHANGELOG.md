# Changelog

All notable changes to ScaffoldMind 明序 will be documented in this file.

## [0.1.0] - 2026-05-31

### Added

- Created initial engineering context documents based on `docs/PRD.md`.
- Added architecture draft covering the single-page three-column layout, Express backend boundary, localStorage MVP storage, AI routing, PPT side drawer, question history sidebar, and Obsidian export.
- Added task plan for the 5-day MVP.
- Added AI collaboration rules in `.ai/AGENTS.md`.
- Added initial API draft for:
  - `POST /api/analyze`
  - `POST /api/deep-dive`
  - `POST /api/diagnose`
  - `POST /api/obsidian`
  - `POST /api/collision`
- Added initial test plan for documentation checks, frontend manual tests, backend manual tests, final demo path, automated test candidates, and security checks.
- Added README initial project guide.
- Initialized project memory.
- Added `.env.example` placeholders.

### Security

- Documented that API keys must live only in backend local `.env`.
- Confirmed `.env` is ignored by Git.
- Kept `.env.example` empty of secrets.

### Not Implemented

- No business code was added.
- No login or registration was added.
- No teacher dashboard was added.
- No API provider integration was added.
