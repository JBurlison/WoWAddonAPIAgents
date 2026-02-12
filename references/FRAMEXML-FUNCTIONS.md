# FrameXML Functions Reference

This document provides a reference for global Lua functions defined in Blizzard's FrameXML code. These are not C-defined API functions, but rather helper functions written in Lua by Blizzard available in the global environment.

## ActionButton_OnLoad
Initializes an action button. Typically called within the `OnLoad` script of a button frame inheriting from `ActionButtonTemplate`.

**Syntax:**
```lua
ActionButton_OnLoad(self)
```

- **self**: The action button frame.

[Wiki Link](https://warcraft.wiki.gg/wiki/API_ActionButton_OnLoad)

---

## ActionButton_Update
Updates the visual state of an action button based on its assigned action ID. Handles icons, cooldowns, counts, and usability checks.

**Syntax:**
```lua
ActionButton_Update(self)
```

- **self**: The action button frame.

[Wiki Link](https://warcraft.wiki.gg/wiki/API_ActionButton_Update)

---

## ChatFrame_AddMessage
Default handler for adding a message to a chat frame. Used internally by `ChatFrame_MessageEventHandler`.

**Syntax:**
```lua
ChatFrame_AddMessageEvent(chatFrame, event, ...)
```

*Note: Direct usage is rare; usually, you call `:AddMessage` on the chat frame widget itself. This global function manages the event processing logic.*

[Wiki Link](https://warcraft.wiki.gg/wiki/API_ChatFrame_AddMessageEvent)

---

## CloseSpecialWindows
Closes all frames registered as "special windows" (e.g., character pane, spellbook, bags) that are currently open. This is the behavior triggered when pressing the Escape key.

**Syntax:**
```lua
local closed = CloseSpecialWindows()
```

- **closed**: Boolean - Returns true if a window was closed, false otherwise.

[Wiki Link](https://warcraft.wiki.gg/wiki/API_CloseSpecialWindows)

---

## EasyMenu
A helper function to create a dropdown menu from a simple table structure. Wraps `UIDropDownMenu_Initialize`.

*Note: In Dragonflight (10.0+), the Context Menu system (MenuUtil) is preferred, but EasyMenu remains common in legacy code.*

**Syntax:**
```lua
EasyMenu(menuList, menuFrame, anchor, x, y, displayMode, autoHideDelay)
```

- **menuList**: Table - List of menu items (text, func, etc.).
- **menuFrame**: Frame - The frame to host the menu (inheriting `UIDropDownMenuTemplate`).
- **anchor**: Frame/String - Anchor point or frame.
- **x, y**: Number - Offset.
- **displayMode**: String - "MENU" (no title) or nil.

[Wiki Link](https://warcraft.wiki.gg/wiki/API_EasyMenu)

---

## FormatLargeNumber
Formats a large number with locale-specific thousand separators (e.g., transforming `123456` to `123,456` in built-in locales).

**Syntax:**
```lua
local formattedString = FormatLargeNumber(number)
```

- **number**: Number - The value to format.

[Wiki Link](https://warcraft.wiki.gg/wiki/API_FormatLargeNumber)

---

## GameTooltip_SetDefaultAnchor
Sets the default anchor position for the GameTooltip, usually based on the cursor position or the "ToolTip" CVar settings.

**Syntax:**
```lua
GameTooltip_SetDefaultAnchor(tooltip, parent)
```

- **tooltip**: Frame - The tooltip frame (usually `GameTooltip`).
- **parent**: Frame - The frame triggering the tooltip.

[Wiki Link](https://warcraft.wiki.gg/wiki/API_GameTooltip_SetDefaultAnchor)

---

## SecondsToTime
Formats a duration in seconds into a readable string (e.g., "1 Day 2 Hours").

**Syntax:**
```lua
local timeString = SecondsToTime(seconds, noSeconds, notAbbreviated, maxCount)
```

- **seconds**: Number - Time in seconds.
- **noSeconds**: Boolean - If true, omits seconds from output.
- **notAbbreviated**: Boolean - If false, uses abbreviated units (e.g., "1d 2h").
- **maxCount**: Number - Max number of units to display (e.g., 2 shows "1d 2h" instead of "1d 2h 30m").

[Wiki Link](https://warcraft.wiki.gg/wiki/API_SecondsToTime)

---

## StaticPopup_Show
Displays a standard popup dialog defined in `StaticPopupDialogs`.

**Syntax:**
```lua
local dialog = StaticPopup_Show(which, text_arg1, text_arg2, data)
```

- **which**: String - The key in the global `StaticPopupDialogs` table.
- **text_arg1**: String - Optional text to replace `%s` in the dialog text.
- **text_arg2**: String - Optional second replacement text.
- **data**: Any - Data to pass to the dialog's `OnShow`/Callbacks.

[Wiki Link](https://warcraft.wiki.gg/wiki/API_StaticPopup_Show)

---

## StaticPopup_Hide
Hides a currently visible static popup dialog.

**Syntax:**
```lua
StaticPopup_Hide(which, data)
```

- **which**: String - The key in `StaticPopupDialogs`.
- **data**: Any - If provided, only hides the dialog if its data matches.

[Wiki Link](https://warcraft.wiki.gg/wiki/API_StaticPopup_Hide)

---

## ToggleCharacter
Toggles the visibility of the character frame (PaperDoll), switching between the specified panel (e.g., "PaperDollFrame", "ReputationFrame") and closing it if already open.

**Syntax:**
```lua
ToggleCharacter(tab)
```

- **tab**: String - The name of the frame to show (e.g., "PaperDollFrame").

[Wiki Link](https://warcraft.wiki.gg/wiki/API_ToggleCharacter)

---

## UIFrameFadeIn
Gradually fades in a frame by manipulating its alpha.

**Syntax:**
```lua
UIFrameFadeIn(frame, timeToFade, startAlpha, endAlpha)
```

- **frame**: Frame - The UI object to fade.
- **timeToFade**: Number - Duration of fade in seconds.
- **startAlpha**: Number - Starting alpha (0-1).
- **endAlpha**: Number - Ending alpha (0-1).

[Wiki Link](https://warcraft.wiki.gg/wiki/API_UIFrameFadeIn)

---

## UIFrameFadeOut
Gradually fades out a frame by manipulating its alpha.

**Syntax:**
```lua
UIFrameFadeOut(frame, timeToFade, startAlpha, endAlpha)
```

- **frame**: Frame - The UI object to fade.
- **timeToFade**: Number - Duration of fade in seconds.
- **startAlpha**: Number - Starting alpha (0-1).
- **endAlpha**: Number - Ending alpha (0-1).

[Wiki Link](https://warcraft.wiki.gg/wiki/API_UIFrameFadeOut)
