# WoW Addon API Agents

Version-aware addon development for **Retail**, **Forever**, and **Classic progression**, distributed as one plugin for Codex, Claude Code, GitHub Copilot, and Antigravity. It includes 21 focused skills covering WoW APIs, UI implementation and full HUD overhauls, addon development, client selection, static addon checks, and CurseForge packaging (plus 4 repository-maintenance skills excluded from consumer packages). AI-builder remains a repository maintenance tool.

| Target | Upstream branch | Request example |
|---|---|---|
| Retail | `live` | Build a Retail addon that saves my UI preferences. |
| Forever | `forever` | Port this addon to Forever and verify its aura APIs. |
| Classic progression | `classic` | Build a Classic progression bag helper. |
| All three | all above | Build shared addon code for all supported versions, with separate client packages. |

Classic Era, Anniversary, PTR, beta, and private servers are outside this release. Ambiguous targets require clarification.

Version **2.1.0** adds a [UI design and testing workflow](plugins/wow-addon-dev/skills/wow-addon-development/references/UI-DESIGN-AND-TESTING.md): ask whether the user wants a mock-up before UI implementation, respect an existing choice, and use [UIForever](https://uiforever.com/) for supported simulator checks. Simulator availability and reported build are checked separately from real-client acceptance; a simulator pass does not certify addon compatibility.

Version **2.2.0** adds [visual-fidelity guardrails](plugins/wow-addon-dev/skills/wow-addon-development/references/VISUAL-FIDELITY.md): preserve the accepted artwork and layout, combine custom textures with functional native controls where needed, and compare actual rendered screenshots before declaring a match. [Connected client testing](plugins/wow-addon-dev/skills/wow-addon-development/references/CONNECTED-CLIENT-TESTING.md) supports optional [Witchcraft](https://github.com/Geraldlol/witchcraft) MCP context/error reads and computer use on capable hosts, with fresh evidence and explicit fallback paths.

Version **2.3.0** adds [persistent project planning](plugins/wow-addon-dev/skills/wow-addon-development/references/PROJECT-PLANNING.md), with reusable [requirements](plugins/wow-addon-dev/skills/wow-addon-development/assets/REQUIREMENTS.template.md) and [implementation matrix](plugins/wow-addon-dev/skills/wow-addon-development/assets/IMPLEMENTATION-MATRIX.template.md) templates for larger changes and new addons. Stable requirement IDs, acceptance evidence and a resumption checkpoint keep long tasks grounded across agents and context resets. It also refreshes [Forever API and UI guidance to 1.60.1.70707](plugins/wow-addon-dev/skills/wow-client-targets/references/FOREVER-70707-CHANGES.md) and repairs updater publication limits. See the [release validation report](docs/RELEASE-2.3.0.md).

When a Forever addon reaches testing, the workflow asks whether to use Witchcraft in the game or UIForever in the browser. It remembers the user's choice across work sessions and records simulator results, game observations and Lua-error checks separately. See the [testing workflow](plugins/wow-addon-dev/skills/wow-addon-development/SKILL.md#verify-and-deliver).

Version **2.4.0** adds [native UI composition](plugins/wow-addon-dev/skills/wow-native-ui/SKILL.md) for Blizzard panels, borders, buttons and controls, and [UI skinning](plugins/wow-addon-dev/skills/wow-ui-skinning/SKILL.md) for independently reskinning existing windows such as the character screen and spellbook. ElvUI is a source-reading example, not a dependency. Start with “Build a Forever panel with Blizzard-style buttons and borders” or “Reskin the character screen and spellbook without requiring ElvUI.” Each selected client still needs its own source and runtime checks. See the [release validation report](docs/RELEASE-2.4.0.md).

Version **2.5.0** adds [controller support](plugins/wow-addon-dev/skills/wow-controller-support/SKILL.md) and makes controller interaction a required consideration for every UI change. Native controls and reskins must account for focus, activation, back/close, applicable tabs/scrolling/text entry, visible action hints and existing mouse/keyboard behavior. Plans and acceptance checklists retain per-client limitations, explicit user exclusions and unperformed hardware tests. See the [release validation report](docs/RELEASE-2.5.0.md).

Version **2.6.0** makes [addon options-menu integration](plugins/wow-addon-dev/skills/wow-api-settings-system/references/ADDON-OPTIONS.md) and [localization](plugins/wow-addon-dev/skills/wow-addon-development/references/LOCALIZATION.md) baseline requirements for new addons and relevant changes. Guidance covers discoverable settings, saved preferences and profiles, fallback catalogs, natural target-language meaning and phrasing, translation coverage, and per-client acceptance. Existing skill entrypoints, agent adapters and planning templates carry these requirements.

Version **2.7.0** adds [CurseForge setup and automatic packaging](plugins/wow-addon-dev/skills/wow-curseforge-packaging/SKILL.md) (`.pkgmeta` / `pkgmeta.yaml`, webhook setup, replacement tokens, multi-client ZIPs, Upload API diagnostics): ask “Set up CurseForge to package my Forever addon when I push a version tag” or “Check that my Retail, Forever and Classic ZIPs each install into the right folder and have the right CurseForge game version.”

Version **2.8.0** adds Antigravity plugin packaging (`.antigravity-plugin/plugin.json`, `assets/logo.svg`, `rules/AGENTS.md`) alongside radial-menu and icon-picker UI guidance.

Version **2.9.0** compacts the generated API catalog (`schemaVersion: 2`, deduplicated `catalog.json` / `provenance.json` / row-table `symbols.json`), expands `query.mjs` (`--compact`, `--diff`, `--resolve-types`, `--offset`, ranked matches, `Enum.Type.Member`), tightens skill descriptions within discovery budgets, adds real-world `C_CVar` / `Settings` / `C_AddOns` / `MenuUtil` / `ScrollBox` / CurseForge recipes, and hardens maintainer/CI scripts. See the [2.9.0 validation report](docs/RELEASE-2.9.0.md).

Version **3.0.0** adds [wow-ui-overhaul](plugins/wow-addon-dev/skills/wow-ui-overhaul/SKILL.md) for modular HUD and total-conversion suites (unit frames, cast bars, action bars, nameplates, minimap, bags, chat, tooltips, `MaskTexture` custom geometry, and `PixelUtil` 4K scaling), adds zero-dependency [validate-addon.mjs](plugins/wow-addon-dev/skills/wow-addon-development/scripts/validate-addon.mjs) and [fetch-source.mjs](plugins/wow-addon-dev/skills/wow-client-targets/scripts/fetch-source.mjs) consumer scripts, and consolidates the 19 thin API wrapper skills directly under `wow-api-index` (`skills` reduced from 39 to 21 while keeping all 29 domain catalogs queryable via `--domain`).

## Install

Marketplace: `wow-addon-api-agents`. Plugin: `wow-addon-dev`. Packages are committed; consumers do not need **Node.js** to read documentation or run static prompts (Node **18+** — tested on Node 24 — is needed only when running helper scripts such as `query.mjs` or `targets.mjs`).

### Codex

```sh
codex plugin marketplace add JBurlison/WoWAddonAPIAgents
codex plugin add wow-addon-dev@wow-addon-api-agents
```

The second command is supported by Codex CLI 0.166.0-alpha.5.1 (tested). Alternatively, open the plugin browser in a Codex/ChatGPT desktop surface supporting repository marketplaces, select **WoW Addon API Agents**, and install **WoW Addon Development**. Start a new chat and invoke `wow-addon-development`, or ask for addon work. Codex uses the workflow skill as its entrypoint.

Refresh with `codex plugin marketplace upgrade wow-addon-api-agents`, then update/reinstall through the plugin browser as supported by your client. Availability varies by surface. See [OpenAI plugin packaging](https://developers.openai.com/plugins/build/plugins).

### Claude Code

```sh
claude plugin marketplace add JBurlison/WoWAddonAPIAgents
claude plugin install wow-addon-dev@wow-addon-api-agents
```

Start a new session and invoke `/wow-addon-dev:wow-addon-development`, or use the `wow-addon` agent. Refresh with `claude plugin marketplace update wow-addon-api-agents` and `claude plugin update wow-addon-dev@wow-addon-api-agents`. See [Claude marketplaces](https://code.claude.com/docs/en/plugin-marketplaces).

### GitHub Copilot CLI

```sh
copilot plugin marketplace add JBurlison/WoWAddonAPIAgents
copilot plugin install wow-addon-dev@wow-addon-api-agents
```

Start a new session and select the WoW addon agent or workflow skill. Refresh with `copilot plugin marketplace update wow-addon-api-agents` and `copilot plugin update wow-addon-dev`. See [Copilot plugin reference](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-plugin-reference).

### Antigravity

1. **Git clone + `plugins.json` (recommended for `git pull` updates):** Clone this repository and register its `plugins` directory in `~/.gemini/config/plugins.json` (global) or `<addon-repo>/.agents/plugins.json` (workspace):

```json
{
  "entries": [
    { "path": "/path/to/WoWAddonAPIAgents/plugins" }
  ]
}
```

2. **Release ZIP:** Download `wow-addon-dev-<version>.zip` from [GitHub Releases](https://github.com/JBurlison/WoWAddonAPIAgents/releases) and extract `wow-addon-dev/` into `~/.gemini/config/plugins/` (global) or `<addon-repo>/.agents/plugins/` (workspace).

Antigravity loads the plugin's 21 skills, `wow-addon` agent, and WoW-scoped `rules/AGENTS.md` automatically on the next turn. You can toggle the plugin on or off under **Customizations → Plugins**.

### Existing VS Code workflow

Open this repository in VS Code with Copilot and select [wow-addon](.github/agents/wow-addon.agent.md). The workspace's `chat.agentSkillsLocations` setting includes `plugins/wow-addon-dev/skills/` and maintainer `skills/`; the generated agent also links directly to the shared workflow. CLI clients do not inherit editor settings: use the marketplace plugin in Codex, Claude Code, or Copilot CLI. When copying customizations into an addon repository, include complete skill directories, instruction files, and the VS Code location setting, preserving relative paths. Avoid enabling both copied and plugin-provided versions in one project.

## Repository layout

| Path | Purpose |
|---|---|
| `plugins/wow-addon-dev/` | Canonical single-source-of-truth installable package (`skills/wow-*`, `agents/wow-addon.md`, `rules/AGENTS.md`, `assets/logo.svg`) plus generated host manifests and Copilot adapters |
| `skills/` | Four maintainer-only helper skills (excluded from consumer packages) |
| `.github/agents/ai-builder.md` | Maintained AI-builder agent definition (maintainer-only) |
| `config/plugin.json` | Plugin identity, release metadata, and API ownership config (`config/api-owners.json`) |
| `.github/agents/wow-addon.agent.md`, `.github/instructions/` | Generated VS Code Copilot checkout adapters |
| `.github/workflows/` | GitHub Actions validation, release, and compiled agentic updater (`.lock.yml`) |

Run `npm run build` after editing `config/plugin.json`, `LICENSE`, `plugins/wow-addon-dev/agents/wow-addon.md`, or `plugins/wow-addon-dev/rules/AGENTS.md`. Host discovery catalogs remain in their required `.agents/`, `.claude-plugin/`, and `.github/plugin/` locations. They all point to the same package.

## API freshness

[Target snapshots](plugins/wow-addon-dev/skills/wow-client-targets/references/targets.json) record source commits, versions, derived interface values, and verification dates. Version **2.0.0** adds complete generated-declaration catalogs for those three source snapshots, with signatures, event payloads, object methods, types and access annotations. The [API index](plugins/wow-addon-dev/skills/wow-api-index/SKILL.md) routes narrow lookups to the packaged references and optional query script. Consumers do not need upstream checkouts to read them.

The [documentation gap matrix](docs/audit/GAP-MATRIX.md) tracks the original findings and their 2.0.0 implementation. Curated guides cover corrected damage-meter/cooldown contracts, restricted values, Forever identity, swing timers, GameRules and Legacy, Settings registration, and UI loading/callback boundaries. Historical Retail references remain labeled and are subordinate to pinned contracts.

Source-declared, loaded, permitted and runtime-tested are separate evidence states. The catalogs do not certify in-game availability, including shared/internal/Glue declarations. Offline work must disclose the snapshot and unresolved behavior; actual addon operations still need per-client tests.

See the [2.0.0 implementation and validation report](docs/RELEASE-2.0.0.md) for delivered coverage, checks and remaining evidence boundaries.

Multi-version addons default to shared Lua and compatibility code with separate client distributables. See [compatibility guidance](plugins/wow-addon-dev/skills/wow-client-targets/references/COMPATIBILITY.md) and [client acceptance](plugins/wow-addon-dev/skills/wow-addon-development/references/CLIENT-VALIDATION.md). CI does not imply in-game testing.

## Maintenance

The weekly [agentic workflow](.github/workflows/update-wow-api.md) checks upstream on Mondays at **09:17 UTC** before inference and proposes draft PRs for relevant changes using **GitHub Copilot with Sonnet**, billed through the token owner's Copilot plan and credits. It never merges automatically and defers proposals while an update PR is open. Manual runs remain available.

Configure `COPILOT_GITHUB_TOKEN` with a fine-grained personal GitHub token granting **Account permissions → Copilot Requests: Read**, enable Actions PR creation, and merge the compiled workflow to the default branch. No OpenAI or Anthropic API key is required. See [automation setup](docs/AUTOMATION.md) and [contributing](CONTRIBUTING.md). Repository files alone do not configure credentials or activate a remote workflow.

See the [validation record](docs/VALIDATION.md) for tested host versions, installation results, and checks that still require GitHub or game clients.

Plugin-changing PRs receive an automatic patch version bump (explicit higher versions are preserved). After merge to `main`, passing Windows/Linux and compiler checks publish a tagged GitHub release with the plugin ZIP and SHA-256 checksum. These workflows use the built-in repository token. See [versions and releases](docs/RELEASING.md) for manual version choices, fork PRs, and retries.

## Sources and license

- [Gethe's Blizzard UI source mirror](https://github.com/Gethe/wow-ui-source)
- [Warcraft Wiki API reference](https://warcraft.wiki.gg/wiki/World_of_Warcraft_API)
- [MIT license](LICENSE)
