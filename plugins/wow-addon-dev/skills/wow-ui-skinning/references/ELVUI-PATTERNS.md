# Learn from ElvUI without depending on it

Research reference: **tukui-org/ElvUI `main` at `3866b3f0f417c101e809d6fe8e1cb98d27428d63`**, inspected **2026-11-05**. This documents source-level design patterns; it is not an ElvUI compatibility guarantee or a test result for the user's addon. Resolve a new commit before using the moving branch for current research.

## Useful places to inspect

| Source at the pinned revision | Observation | Independent addon design |
|---|---|---|
| [Shared Skins module](https://github.com/tukui-org/ElvUI/blob/3866b3f0f417c101e809d6fe8e1cb98d27428d63/ElvUI/Game/Shared/Modules/Skins/Skins.lua) | Registers skins by addon and handles owner loading; per-skin configuration gates application. Shared handlers centralize repeated control styling. | Use a small module registry keyed by the verified Blizzard owner, an already-loaded path, and per-window settings. Implement only the helpers your design needs. |
| [Character skin](https://github.com/tukui-org/ElvUI/blob/3866b3f0f417c101e809d6fe8e1cb98d27428d63/ElvUI/Game/Shared/Skins/Character.lua) | Distinguishes client layouts, hooks later visual/layout changes, and treats slot, stat and side-pane elements separately. | Build client adapters and named surface maps. Handle the current frame and later-created/rebound children. Preserve semantic indicators separately from ornament. |
| [PlayerSpells skin](https://github.com/tukui-org/ElvUI/blob/3866b3f0f417c101e809d6fe8e1cb98d27428d63/ElvUI/Game/Shared/Skins/PlayerSpells.lua) | Registers the PlayerSpells owner, observes later updates, and has Forever-specific category/search/settings treatments. | Wait for the correct owner, choose relevant update callbacks, and keep Forever-specific layout in its adapter. A matching addon name does not mean identical children. |
| [SpellBook skin](https://github.com/tukui-org/ElvUI/blob/3866b3f0f417c101e809d6fe8e1cb98d27428d63/ElvUI/Game/Shared/Skins/SpellBook.lua) | Uses different owner routes and button/profession styling paths for its client variants. | Trace the source selected by each client's TOC and implement the needed standalone spellbook adapter, rather than treating one file as the whole cross-client implementation. |

Use these files to ask precise questions: which update overwrites this visual, when does this child exist, which states does this control express, and where does a client diverge? Confirm each answer against Blizzard's selected source and runtime before applying it. A working full-UI replacement can rely on framework initialization and internal invariants that a small addon does not have.

## Translate intent, not framework calls

Names such as `E:GetModule`, `S:HandleButton`, `StripTextures`, `Kill`, `SetTemplate`, `CreateBackdrop`, `FontTemplate`, `Point`, `Size` and `SetInside` are ElvUI/framework facilities, not a portable Blizzard widget API. Do not paste them into a standalone addon, assume their side effects, or add an ElvUI dependency to make an example work.

Translate the intended visual outcome into a small original helper using the selected client's documented widget methods. For example, a frame-theme operation might add your own noninteractive background and style specific known border regions; it does not require a general-purpose recursive texture stripping utility. Verify input handling, frame levels, masks, draw layers and refresh behavior for the actual target.

Aggressive region removal, global method changes, permanent hiding and replacement layout hooks in a large UI framework are not safe defaults for an independent skin. Use the [architecture guide](SKINNING-ARCHITECTURE.md) to establish ownership, state refresh and disable behavior before choosing an implementation.

## Code and asset provenance

The pinned [root license summary](https://github.com/tukui-org/ElvUI/blob/3866b3f0f417c101e809d6fe8e1cb98d27428d63/LICENSE.md) distinguishes ElvUI core from third-party libraries. The [ElvUI core license](https://github.com/tukui-org/ElvUI/blob/3866b3f0f417c101e809d6fe8e1cb98d27428d63/ElvUI/LICENSE.txt) is a custom license with redistribution conditions; this plugin's MIT license does not license ElvUI's code or artwork.

The guidance here describes independently implementable design patterns and links to their research sources. It does not vendor ElvUI code, textures, fonts or libraries. Write the addon implementation originally and use Blizzard-provided assets through verified client APIs, original artwork, or assets whose redistribution rights are established for the project. If a user specifically asks to incorporate third-party code or media, inspect that component's actual license and preserve required attribution before doing so; a repository-level license summary does not settle every library or asset.
