# WoW Addon API Agents

AI coding assistant customization files for modern World of Warcraft Retail addon development (Patch 12.0.0+). This repo is intentionally minimal and centered on the .github folder: agents, skills, instructions, and prompts that help addon developers work with the current WoW API and its 12.0.0+ security model.

## What’s inside

- Agents: task-focused assistant personas in [.github/agents](.github/agents)
- Skills: API references and deep guides in [.github/skills](.github/skills)
- Instructions: global rules and API change notes in [.github/instructions](.github/instructions)
- Prompts: reusable prompt templates in [.github/prompts](.github/prompts)
- Extra references in [references/FRAMEXML-FUNCTIONS.md](references/FRAMEXML-FUNCTIONS.md)

## Getting started

1. Open this repo in VS Code with GitHub Copilot enabled.
2. Ask Copilot to use the WoW addon agent in [.github/agents](.github/agents) and reference skills under [.github/skills](.github/skills).

## Design goals

- Retail only (Patch 12.0.0+). No Classic-only APIs.
- No deprecated or removed APIs.
- Explicit coverage of the new Secret Values model, combat log restrictions, and instance communication limits.
- Verbose documentation with links to upstream sources for every skill.
- **Automatic skill creation** — the agent identifies when external libraries (Ace3, LibStub, LibSharedMedia, etc.), third-party addon APIs (Details!, ElvUI, etc.), or large project subsystems should be documented as new skills so knowledge persists across sessions.

## Sources

- Warcraft Wiki API reference: https://warcraft.wiki.gg/wiki/World_of_Warcraft_API
- Blizzard API docs (generated): https://github.com/Gethe/wow-ui-source/tree/live/Interface/AddOns/Blizzard_APIDocumentationGenerated

## License

See [LICENSE](LICENSE).
