# WoW Addon API Agents

Version-aware addon development for **Retail**, **Forever**, and **Classic progression**, distributed as one plugin for Codex, Claude Code, and GitHub Copilot. It includes 33 API/domain skills, an addon-development workflow, and a client-target skill. AI-builder remains a repository maintenance tool.

| Target | Upstream branch | Request example |
|---|---|---|
| Retail | `live` | Build a Retail addon that saves my UI preferences. |
| Forever | `forever` | Port this addon to Forever and verify its aura APIs. |
| Classic progression | `classic` | Build a Classic progression bag helper. |
| All three | all above | Build shared addon code for all supported versions, with separate client packages. |

Classic Era, Anniversary, PTR, beta, and private servers are outside this release. Ambiguous targets require clarification.

Version **2.1.0** adds a [UI design and testing workflow](skills/wow-addon-development/references/UI-DESIGN-AND-TESTING.md): ask whether the user wants a mock-up before UI implementation, respect an existing choice, and use [UIForever](https://uiforever.com/) for supported simulator checks. Simulator availability and reported build are checked separately from real-client acceptance; a simulator pass does not certify addon compatibility.

Version **2.2.0** adds [visual-fidelity guardrails](skills/wow-addon-development/references/VISUAL-FIDELITY.md): preserve the accepted artwork and layout, combine custom textures with functional native controls where needed, and compare actual rendered screenshots before declaring a match. [Connected client testing](skills/wow-addon-development/references/CONNECTED-CLIENT-TESTING.md) supports optional [Witchcraft](https://github.com/Geraldlol/witchcraft) MCP context/error reads and computer use on capable hosts, with fresh evidence and explicit fallback paths.

## Install

Marketplace: `wow-addon-api-agents`. Plugin: `wow-addon-dev`. Packages are committed; consumers do not need Node.js or a build step.

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

### Existing VS Code workflow

Open this repository in VS Code with Copilot and select [wow-addon](.github/agents/wow-addon.agent.md). The workspace's `chat.agentSkillsLocations` setting includes root-level `skills/`; the generated agent also links directly to the shared workflow. CLI clients do not inherit editor settings: use the marketplace plugin in Codex, Claude Code, or Copilot CLI. When copying customizations into an addon repository, include complete skill directories, instruction files, and the VS Code location setting, preserving relative paths. Avoid enabling both copied and plugin-provided versions in one project.

## Repository layout

| Path | Purpose |
|---|---|
| `skills/` | Maintained portable WoW skills and the four maintainer-only helper skills |
| `agents/` | Maintained shared WoW agent and AI-builder definition |
| `instructions/` | Maintained client-aware guidance |
| `config/plugin.json` | Plugin identity and release metadata |
| `plugins/wow-addon-dev/` | Generated, self-contained installable package |
| `.github/agents/`, `.github/instructions/` | Generated Copilot checkout adapters |
| `.github/workflows/` | GitHub Actions validation and upstream updates |

Run `npm run build` after editing maintained files. Host discovery catalogs remain in their required `.agents/`, `.claude-plugin/`, and `.github/plugin/` locations. They all point to the same package.

## API freshness

[Target snapshots](skills/wow-client-targets/references/targets.json) record source commits, versions, derived interface values, and verification dates. Version **2.0.0** adds complete generated-declaration catalogs for those three source snapshots, with signatures, event payloads, object methods, types and access annotations. The [API index](skills/wow-api-index/SKILL.md) routes narrow lookups to the packaged references and optional query script. Consumers do not need upstream checkouts to read them.

The [documentation gap matrix](docs/audit/GAP-MATRIX.md) tracks the original findings and their 2.0.0 implementation. Curated guides cover corrected damage-meter/cooldown contracts, restricted values, Forever identity, swing timers, GameRules and Legacy, Settings registration, and UI loading/callback boundaries. Historical Retail references remain labeled and are subordinate to pinned contracts.

Source-declared, loaded, permitted and runtime-tested are separate evidence states. The catalogs do not certify in-game availability, including shared/internal/Glue declarations. Offline work must disclose the snapshot and unresolved behavior; actual addon operations still need per-client tests.

See the [2.0.0 implementation and validation report](docs/RELEASE-2.0.0.md) for delivered coverage, checks and remaining evidence boundaries.

Multi-version addons default to shared Lua and compatibility code with separate client distributables. See [compatibility guidance](skills/wow-client-targets/references/COMPATIBILITY.md) and [client acceptance](skills/wow-addon-development/references/CLIENT-VALIDATION.md). CI does not imply in-game testing.

## Maintenance

The daily [agentic workflow](.github/workflows/update-wow-api.md) checks upstream before inference and proposes draft PRs for relevant changes using **GitHub Copilot with Sonnet**, billed through the token owner's Copilot plan and credits. It never merges automatically and defers proposals while an update PR is open.

Configure `COPILOT_GITHUB_TOKEN` with a fine-grained personal GitHub token granting **Account permissions → Copilot Requests: Read**, enable Actions PR creation, and merge the compiled workflow to the default branch. No OpenAI or Anthropic API key is required. See [automation setup](docs/AUTOMATION.md) and [contributing](CONTRIBUTING.md). Repository files alone do not configure credentials or activate a remote workflow.

See the [validation record](docs/VALIDATION.md) for tested host versions, installation results, and checks that still require GitHub or game clients.

Plugin-changing PRs receive an automatic patch version bump (explicit higher versions are preserved). After merge to `main`, passing Windows/Linux and compiler checks publish a tagged GitHub release with the plugin ZIP and SHA-256 checksum. These workflows use the built-in repository token. See [versions and releases](docs/RELEASING.md) for manual version choices, fork PRs, and retries.

## Sources and license

- [Gethe's Blizzard UI source mirror](https://github.com/Gethe/wow-ui-source)
- [Warcraft Wiki API reference](https://warcraft.wiki.gg/wiki/World_of_Warcraft_API)
- [MIT license](LICENSE)
