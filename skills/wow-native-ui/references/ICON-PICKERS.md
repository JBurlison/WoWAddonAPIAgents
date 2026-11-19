# Native icon pickers in Forever

Reviewed 2026-11-10 against Forever1.60.1.70862, commit `9dc84f0d3bbae1768ac3405b3716000bd93eda06`. Render/input observations below are UIForever1.60.1.70450/interface16001, not actual-client controller or combat acceptance.

## Reuse the widget and catalog

- [SharedUIPanelTemplates.xml](https://github.com/Gethe/wow-ui-source/blob/9dc84f0d3bbae1768ac3405b3716000bd93eda06/Interface/AddOns/Blizzard_SharedXML/Mainline/SharedUIPanelTemplates.xml) defines `IconSelectorPopupFrameTemplate`, its selected-icon area, native buttons/filter and `ScrollBoxSelectorTemplate` grid. The grid has ten columns and its own HIGH strata. Match the grid's strata to an addon popup above Settings or its icons can render behind the popup background.
- [SharedUIPanelTemplates.lua](https://github.com/Gethe/wow-ui-source/blob/9dc84f0d3bbae1768ac3405b3716000bd93eda06/Interface/AddOns/Blizzard_SharedXML/Mainline/SharedUIPanelTemplates.lua) supplies the mixin, filter types and selection callbacks. Inspect the client's family/Camelot overrides and loading order too.
- [IconDataProvider.lua](https://github.com/Gethe/wow-ui-source/blob/9dc84f0d3bbae1768ac3405b3716000bd93eda06/Interface/AddOns/Blizzard_FrameXMLBase/IconDataProvider.lua), loaded by FrameXMLBase, supplies the full native catalog. Create a provider with `CreateAndInitFromMixin(IconDataProviderMixin, IconDataProviderExtraType.Spellbook)`, filter with the native icon types, and release it exactly once when closing. The question-mark icon134400 supports caller-defined automatic-icon semantics. Preserve texture identifiers, including legacy filenames, rather than assuming every result is numeric.
- Do not repurpose the global `MacroPopupFrame` for unrelated selection. Its [macro mixin](https://github.com/Gethe/wow-ui-source/blob/9dc84f0d3bbae1768ac3405b3716000bd93eda06/Interface/AddOns/Blizzard_MacroUI/Blizzard_MacroIconSelector.lua) changes MacroFrame controls on show/hide and creates/edits real macros on confirmation. Instantiate an addon-owned subclass of the generic template instead.

## Search and selection contract

The native top field is a macro **name**, with a16-character limit, not a search box. If repurposed for search, explicitly replace its label/limits/handlers and never inherit macro-save behavior. Filter the native provider with cached Unicode-aware names/IDs and keep native scrolling. Texture IDs/filenames and learned localized spell names/spell IDs are searchable; this does not establish a semantic name for every miscellaneous game image. Empty searches should not repeatedly fold thousands of strings. A simulator's200 fixtures are not the real client's complete icon count.

Expose a caller-neutral API with `owner`, `selectedIcon`, `onSelect`, `onCancel`, and `restoreFocus`. Browsing only changes the picker; confirmation returns one texture. Cancel, Escape, owner hide and combat close retain the caller's value and restore focus once. Release provider references and only the picker's own edit-box focus. The caller decides when to save its draft or macro. Test a selected icon outside the active filter, empty results, reopen, and filenames as well as numeric icons.

## Controller ownership is separate from artwork

At this pin the generic template registers native input transitions and focus helpers. Calling `GiveGamepadFocus` on an unregistered addon popup failed in UIForever's `SmartNavigation.lua` with nil `subGroups`. It is not a general addon focus-registration API. Do not fabricate native registration tables or copy/patch private navigation managers.

For an addon-owned popup without verified native registration, an owned subclass can override **its own** transition/show/hide behavior while retaining native grid/dropdown/button setup. Preserve cursor-event registration and edit-box/selected-icon backreferences; do not alter the global mixin. Supply paired owned controller handling, visible glyphs, search/filter/grid reachability, edge auto-scroll, confirm/cancel and caller focus restoration. Yield input while another text owner is active; reject orphan releases and a held confirmation if filtering/generation or selection changed. Keep mouse handlers and native scrollbar behavior. Treat this as an explicit owned-navigation implementation, not proof of native SmartNavigation integration.

Observed acceptance: native grid/filter/search rendering, real mouse selection/Okay returning a filename to an unsaved draft, paired D-pad edge scrolling and cancel. A host fixture with1000 icons checks scroll/stale-input contracts but does not render the native widgets. Physical gamepad input, global focus arbitration and actual-client compatibility remain separate required checks.
