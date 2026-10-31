# Source and installed file locations

The source of truth is root-level skills/, agents/, instructions/, and config/plugin.json. agents/wow-addon.md delegates to wow-addon-development for the shared workflow. npm run build generates Copilot checkout adapters, marketplace host adapters, catalogs and the self-contained plugins/wow-addon-dev package. The four maintainer skills and AI-builder are excluded from that package.

| Surface | Skill location | Agent/rules location | Catalog |
|---|---|---|---|
| Copilot checkout in VS Code | skills via .vscode/settings.json | Generated .github/agents; .github/instructions | Not required for checkout use |
| Codex portable plugin | skills at plugin root | Workflow skill entrypoint | .agents/plugins/marketplace.json at repository root |
| Claude plugin | skills at plugin root | agents at plugin root | .claude-plugin/marketplace.json at repository root |
| Copilot portable plugin | skills at plugin root | com.github.copilot/agents; com.github.copilot/rules | .github/plugin/marketplace.json at repository root |

The portable root plugin.json uses Agent Plugins 1.0. Claude reads its own .claude-plugin/plugin.json. The Codex compatibility manifest is .codex-plugin/plugin.json; only the manifest belongs there, not the skills. Do not assume every host supports Copilot tool names or file types.

For standalone project customization, Codex uses AGENTS.md for repository instructions and .agents/skills for project skills; Claude uses its own project/skill/agent conventions. Consult current host documentation rather than deriving paths by renaming .github. The maintenance helper examples using <provider>/ are Copilot-oriented patterns.

Local references in an installed plugin must stay within its root. Include all referenced resources. No symlinks or paths back into the source checkout. AI-builder and its four helper skills remain source-only.

Sources: [Codex plugins](https://developers.openai.com/plugins/build/plugins), [Claude manifests](https://code.claude.com/docs/en/plugins-reference), [Copilot plugins](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-plugin-reference), [VS Code customization](https://code.visualstudio.com/docs/copilot/customization/overview).
