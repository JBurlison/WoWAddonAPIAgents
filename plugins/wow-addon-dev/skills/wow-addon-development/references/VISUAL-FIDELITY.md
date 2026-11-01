# Implement the accepted UI, then compare the render

An accepted mock-up is the visual specification. Functional native controls alone do not satisfy it when the composition, artwork, typography or states differ. Use this guide with [UI design/testing](UI-DESIGN-AND-TESTING.md) and [connected client testing](CONNECTED-CLIENT-TESTING.md).

## Establish a reproducible visual baseline

Open and visually inspect the actual accepted image or prototype before implementing. Preserve its version/path, original dimensions, intended window bounds, resolution/UI scale and relevant states. If it is inaccessible, recover the referenced asset or ask for that missing input; do not recreate its appearance from a vague recollection. An explicit later design change supersedes the earlier baseline.

Record a short implementation map in the addon project: component bounds/anchors, spacing, palette/opacity, font and text hierarchy, artwork, edge treatment, control states and scaling behavior. For each visual element, identify its source asset or verified drawing/control technique. Distinguish decorative lettering from dynamic/localized text. This map should make omissions visible before implementation begins.

Do not silently simplify the design, swap in default Blizzard skins or replace custom artwork with built-in textures because that is easier. Native-only rendering is appropriate when it reproduces the accepted design. If an asset, font or effect cannot be delivered, state the concrete limitation and show the proposed visual alternative before treating the changed design as accepted. Continue work that does not depend on that decision; do not add approval gates for routine implementation details.

## Choose rendering techniques from the design

| Accepted design element | Suitable implementation |
|---|---|
| Ornate panel, parchment, painted borders, bespoke iconography | Package custom texture artwork with the addon; use it behind or around the interactive content. Generate or author the missing assets with available tools when the task calls for them. |
| Simple flat regions and geometry | Verified native texture/color/line primitives, provided the actual render matches the baseline. |
| Custom-looking buttons, tabs or toggles | Real native controls with matching custom normal, hover, pressed, selected and disabled visuals as applicable. |
| Labels, values, input fields, scrolling lists and tooltips | Live native text and controls over the artwork, with the accepted font/spacing/style and working interaction. |
| A resizable decorated panel | Separate corners/edges/center or other verified slicing/composition; preserve edge thickness and aspect ratio rather than stretching an entire screenshot. |

A useful hybrid is **custom panel/background artwork + native hit regions, text and input controls**. For example, an ornate inventory panel can use authored frame art, while each slot remains a real interactive control and item counts remain live text. Do not flatten the complete mock-up into one image with painted values and pretend it is a working UI.

Keep decorative texture layers behind the intended content, with deliberate draw layers/frame levels and clipping. Align control hit regions with the visible artwork; prevent decorative frames from intercepting input. Avoid duplicate default borders/backgrounds showing through custom skins. Skin addon-owned controls or supported extension points without discarding secure templates, protected behavior or required scripts.

Map mock-up rectangles into a consistent UI coordinate system. Screenshot pixels, desktop scaling and WoW UI units need not be identical. Record the transform, preserve relative proportions, and test the relevant UI scales; do not fix one screenshot by accumulating unrelated offsets. Check long/localized labels and larger text without moving controls away from their visible affordances.

## Build and package real assets

Keep editable/source artwork separate from the game-ready media. Record each exported file's role, dimensions, transparency, crop/UV region, scaling rule and control state. Use assets/fonts with appropriate rights. Convert to a format verified for the selected client, such as a verified TGA/BLP pipeline; merely renaming a PNG extension does not convert it. Check orientation, alpha, padding, seams and filter behavior in the actual renderer.

Use game asset paths such as `Interface\AddOns\MyAddon\Media\Panel.tga` with correct case, escaping backslashes in quoted Lua strings; do not pass an OS-absolute path or assume a bare filename resolves beside the Lua file. Include every referenced addon-owned asset in each target's distributable. Missing art, fonts or state textures are defects to resolve or explicitly report, not reasons to substitute a different visual style silently. Check the exported package, not just source files or a local preview. A prototype containing mock data must not supply fabricated live-game values in production.

For implementation, query the selected target's [widget schemas](../../wow-api-widget/references/generated/README.md) and [UI loading/inheritance guide](../../wow-api-framexml/references/CURRENT-UI-SOURCES.md). Useful source-declared operations include `CreateTexture`, `SetTexture`, `SetDrawLayer`, `SetNormalTexture`, `SetHighlightTexture`, `SetPushedTexture`, `SetDisabledTexture` and `SetHitRectInsets`; verify the actual object, arguments and restrictions rather than treating every widget as interchangeable. The pinned Forever [frame definitions](https://github.com/Gethe/wow-ui-source/blob/ca8368f2f2380cbe696854f7f2646387c278a61b/Interface/AddOns/Blizzard_APIDocumentationGenerated/SimpleFrameAPIDocumentation.lua), [texture definitions](https://github.com/Gethe/wow-ui-source/blob/ca8368f2f2380cbe696854f7f2646387c278a61b/Interface/AddOns/Blizzard_APIDocumentationGenerated/SimpleTextureBaseAPIDocumentation.lua) and [button definitions](https://github.com/Gethe/wow-ui-source/blob/ca8368f2f2380cbe696854f7f2646387c278a61b/Interface/AddOns/Blizzard_APIDocumentationGenerated/SimpleButtonAPIDocumentation.lua) establish contracts, not tested loading or visual fidelity.

## Compare early and correct mismatches

1. Render one representative panel containing the key artwork, text and interaction before propagating its styling through the addon. Compare that slice first so a wrong rendering approach is caught early.
2. Capture the implemented UI in the matching simulator or real client at the baseline resolution, UI scale, bounds, state and representative data. Save the original screenshot with the addon revision, renderer/client build and scenario. Do not substitute a design render, generated image or edited screenshot for implementation evidence.
3. Compare the same UI region side by side and, when tools allow, with an aligned opacity overlay or difference image. Align/crop copies consistently; keep originals. Never stretch one image non-uniformly, recolor the result or hide divergent controls to make it appear to match. Mask variable world scenery, animations or live data only when the exclusions are explicit and do not hide the UI under review.
4. Check composition and hierarchy first, then bounds/spacing, artwork, fonts, colors/opacity, borders/shadows, alignment, clipping and interaction-state visuals. Keep a brief mismatch list with expected versus observed behavior and severity. Pixel differences can help locate errors, but antialiasing and dynamic data make a single similarity score insufficient.
5. Fix material deviations and capture again until the agreed visual criteria are met or a specific remaining limitation/design change is recorded. Do not change the baseline to make the implementation pass. Do not stop because there are no Lua errors or because every button works.
6. Exercise the actual controls: visible click targets, hover/pressed/disabled/selected states, text entry/focus, scrolling, tooltips and relevant resize/scale behavior. An accurate-looking screenshot does not establish interaction correctness. Repeat target-specific client acceptance separately.

Agree tolerances appropriate to the design instead of inventing a universal pixel-match percentage. Missing custom art, substituted stock skins, wrong hierarchy, unreadable labels, obstructed controls or major layout/proportion differences block a visual pass. Minor rendering differences may be documented without reopening an otherwise accepted design.

## Completion evidence

Deliver the baseline reference, actual implementation screenshots, comparison or mismatch notes, asset inventory, tested states/resolutions and separate results for visual fidelity, interaction, Lua diagnostics and real-client acceptance. A simulator screenshot can establish that simulator's appearance; it is not a real-client screenshot. MCP context or an empty error list cannot establish appearance.

If image inspection/capture or a matching renderer is unavailable, report **visual comparison not run** and provide the exact user reproduction/capture steps. Continue useful static work, but do not claim the UI matches the mock-up or is visually complete. Preserve outstanding visual differences as open work rather than presenting a functionally complete approximation as the accepted design.
