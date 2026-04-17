# TextDropdownComponent (Freon) — Specification

## Overview

The TextDropdownComponent is an inline editable text field with dropdown-assisted selection, backed by an `AbstractChoiceBox` model.

It combines:
- native `<input>` behavior
- filtered dropdown selection
- Freon editor navigation and execution

The component supports both **SelectBox** and **ActionBox** semantics.

---

## Core Structure

1. The component uses a single `<input>` when editable.

2. The component uses a `<span>` when readonly:
    - visually identical to the input
    - no caret or editing behavior

3. A dropdown panel is conditionally rendered:
    - portaled into a shared overlay root
    - positioned relative to the input

---

## Visual Behavior

4. When NOT focused, the input appears as plain text.

5. When focused:
    - subtle editing cues are shown
    - no layout shift occurs

6. Placeholder:
    - styled as normal text (reduced opacity)
    - derived from `box.placeholder`

---

## Auto-sizing

7. The input auto-sizes to its content:
    - uses a hidden `<span>` for measurement
    - uses `textContent`
    - falls back to placeholder or `" "` when empty
    - includes small caret buffer

---

## State Management

8. Two text states are maintained:
    - `originalText` → model value
    - `text` → current editable value

9. Additional dropdown state:
    - `allOptions` → full option set
    - `filteredOptions` → currently visible options
    - `selected` → current selection candidate
    - `dropdownShown` → visibility flag

10. `hasChanges()` compares `text` with `originalText`

---

## Focus State Machine

Three focus states are distinguished:

- **BLURRED**
- **FOCUSED_CLOSED**
- **FOCUSED_OPEN**

### Transitions

**BLURRED**
- (TAB) → FOCUSED_CLOSED
- (pointerdown on input) → FOCUSED_OPEN
- (focusin from pointer) → FOCUSED_OPEN

**FOCUSED_CLOSED**
- (pointerdown inside input) → FOCUSED_OPEN
- (ENTER / ARROW_DOWN) → FOCUSED_OPEN
- (focusout) → BLURRED

**FOCUSED_OPEN**
- (pointerdown inside input) → FOCUSED_OPEN (no-op, caret repositioning)
- (ESC / cancel) → FOCUSED_CLOSED
- (select option) → BLURRED (or next leaf)
- (pointerdown outside) → BLURRED
- (focusout to outside) → BLURRED

---

## Model Synchronization

11. The component is driven by an `AbstractChoiceBox`

12. `refresh()` updates:
- placeholder
- originalText
- error state
- cssClass
- selected option (for SelectBox)

13. `text` is only overwritten when NOT focused

---

## Editing Lifecycle

14. Editing ends via:
- focus leaving the component
- option execution (ENTER or click)
- ESCAPE (cancel)
- navigation to another node

15. `endEditing(reason)`:
- `"cancelled"` → restore `text = originalText`
- `"matched"` → keep executed value
- always hides dropdown

16. No reentrancy guard is used:
- lifecycle correctness is ensured via focus handling

---

## Focus & Interaction

17. Focus origin is distinguished:
- `"UI"` → browser-driven
- `"editor"` → programmatic

18. Pointer interaction:
- gaining focus by pointer may open the dropdown
- entering by TAB does not automatically open the dropdown
- after keyboard entry (TAB), a click inside the focused input opens the dropdown
- when the dropdown is open, clicking inside an already-focused input does not reopen it; the click is treated as caret repositioning

19. Focus-out behavior:
- editing ends only when focus leaves the component AND dropdown
- internal transitions do NOT cancel editing

---

## Dropdown Behavior

20. Dropdown opens:
- on ENTER (if closed)
- on mouse focus (first click)
- when filtering is triggered while closed

21. Dropdown is rendered in overlay:
- positioned relative to input
- flips above if needed
- constrained to available height

22. Dropdown closes:
- on selection
- on ESCAPE
- on focus leaving component
- on overlay listeners (scroll/resize/outside click)

---

## Filtering & Selection

23. Filtering is based on caret position:
- prefix = `text.substring(0, caretPos)`

24. `filteredOptions` is computed using:
- `MatchUtil.partiallyMatchingOptions`

25. Selection behavior:
- `selected` always resets to first filtered option
- ensures ENTER executes current best match
- prevents stale selection after typing

26. If no options:
- fallback option `<no known options>` is used

---

## Auto-Commit Behavior

27. ActionBox:
- attempts regex match via `tryToMatchRegExpAndExecuteAction`
- executes immediately on match

28. SelectBox:
- auto-commits when:
    - exactly one match
    - full label typed

---

## Keyboard Behavior

### General Principle

29. Browser handles input unless explicitly overridden

---

### ENTER

30. If dropdown closed:
- opens dropdown

31. If dropdown open:
- executes `selected` option

---

### ESCAPE

32. If dropdown open:
- closes dropdown

33. Else:
- restores original text

---

### Arrow Keys

34. ARROW_UP / ARROW_DOWN:
- if dropdown open → navigates dropdown
- if dropdown closed → event bubbles to Freon

35. ARROW_LEFT / ARROW_RIGHT:
- if caret can move → browser handles
- else:
    - navigate Freon nodes
    - end editing

---

### HOME / END

36. If movement possible → browser handles
37. Else → prevent default

---

### Deletion Keys

38. BACKSPACE / DELETE:
- if deletion possible → browser handles
- else → prevent default

39. Ctrl+Backspace / Ctrl+Delete:
- same principle for word deletion

---

### Undo / Redo

40. If `hasChanges()` → browser handles
41. Else → Freon handles

---

### Select All

42. Ctrl/Cmd + A:
- browser handles
- triggers dropdown filtering update

---

## Clipboard Behavior

43. Clipboard operations are browser-handled:
- `onPaste`, `onCopy`, `onCut` set `shouldBeHandledByBrowser = true`

44. Programmatic helpers:
- `getSelectedText()`
- `deleteSelection()`
- `insertAtSelection(text)`

45. These:
- preserve selection
- restore focus
- sync DOM + state
- update width and filtering

---

## Dropdown Positioning

46. Position is computed relative to overlay root

47. Behavior:
- prefer below anchor
- flip above if needed
- clamp within viewport
- set max height dynamically

48. Positioning occurs after:
- DOM render (`tick`)
- filtered content update
- layout stabilization (`requestAnimationFrame`)

---

## Overlay Integration

49. Dropdown uses shared overlay root:
- prevents clipping
- avoids layout shifts

50. Overlay listeners handle:
- outside click
- scroll
- resize

---

## Geometry / Editor Integration

51. Component exposes rectangle via:
- input element (editable)
- span (readonly)

52. Used by Freon editor for navigation and layout

---

## Reference Behavior

53. If `ReferenceBox` and selectable:
- a button is shown

54. Clicking the button:
- navigates to referenced node
- does not propagate event

---

## General Design Principles

55. Model (`AbstractChoiceBox`) is the source of truth

56. Local state may diverge temporarily during editing

57. Dropdown selection is **derived**, not persistent:
- always reflects current text/caret

58. Prefer:
- native browser behavior
- minimal interception
- explicit control only where needed

59. Keyboard handling:
- only intercept when necessary
- allow bubbling when appropriate

60. Component is designed for:
- predictability
- responsiveness
- tight integration with Freon editor
- intuitive text + selection workflow
