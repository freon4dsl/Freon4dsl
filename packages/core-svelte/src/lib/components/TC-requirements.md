# TextComponent (Freon) — Specification

## Overview

The TextComponent is an inline editable text field backed by a `TextBox` model.

It behaves like a native `<input>` where possible, while integrating with the Freon editor for navigation, selection, and model synchronization.

---

## Core Structure

1. The component uses a single `<input>` when editable.

2. The component uses a `<span>` when readonly:
    - visually identical to the input
    - no caret or editing behavior

3. No dual DOM for editing/display:
    - do NOT switch between `<span>` and `<input>` for editing
    - styling determines appearance

---

## Visual Behavior

4. When NOT focused, the input must look like plain text  
   (indistinguishable from a `<span>`).

5. When focused, the input shows a subtle editing cue:
    - bottom border (underline)
    - soft background highlight
    - no layout shift

6. Placeholder:
    - styled as normal text (reduced opacity)
    - derived from `box.placeHolder`

---

## Auto-sizing

7. The input auto-sizes to its content:
    - uses a hidden `<span>` for measurement
    - uses `textContent` (not `innerHTML`)
    - falls back to placeholder or `" "` when empty
    - adds small buffer for caret visibility

---

## State Management

8. Two text states are maintained:
    - `originalText` → model value
    - `text` → current editable value

9. State is managed via `$state` (not `$derived`), because:
    - values are updated imperatively via `refresh()`

10. `hasChanges()`:
    - compares `text` with `originalText`

---

## Model Synchronization

11. The component is driven by a `TextBox`:
    - `refresh()` updates internal state

12. During `refresh()`:
    - `originalText` is always updated
    - `text` is only updated when NOT focused

13. `endEditing(reason)`:
    - is the single exit point for editing
    - commits or cancels depending on `reason`

14. Commit behavior:
    - uses `box.setText(...)`
    - converts `"" → undefined` for optional strings

15. Cancel behavior (`reason === "escape"`):
    - restores `text = originalText`
    - does NOT update model

---

## Focus & Selection

16. Focus origin is distinguished:
    - `"UI"` → mouse / tab / browser
    - `"editor"` → programmatic

17. UI focus:
    - browser determines caret
    - component notifies editor via `editor.selectElementForBox(box)`
    - guarded to avoid loops

18. Editor focus:
    - component focuses input
    - caret/selection is set from editor state

19. Caret handling:
    - stored locally as `{ start, end }`
    - derived from `FreCaret`

---

## Editing Lifecycle

20. Editing ends via:
    - focus out
    - Enter
    - Escape (cancel)
    - navigation to another node

21. `endEditing(reason)`:
    - handles both commit and cancel flows
    - ensures model consistency

---

## Keyboard Behavior

### General Principle

22. Browser handles everything by default  
    unless explicitly prevented.

---

### Core Keys

23. TAB / Shift+TAB:
    - always handled by browser

24. ENTER:
    - calls `endEditing("enter")`
    - prevents default

25. ESCAPE:
    - calls `endEditing("escape")`
    - restores original value
    - moves to next editable element

---

### Navigation Keys

26. ARROW_LEFT / ARROW_RIGHT:
    - if caret can move → browser handles
    - else:
        - `endEditing(...)`
        - Freon selects previous/next node

27. HOME / END:
    - if movement possible → browser handles
    - else → prevent default

---

### Deletion Keys

28. BACKSPACE:
    - if deletion possible → browser handles
    - else → Freon may handle

29. DELETE:
    - if deletion possible → browser handles
    - else → prevent default

30. Ctrl+Backspace / Ctrl+Delete:
    - if word deletion possible → browser handles
    - else → prevent default

---

### Selection

31. Ctrl/Cmd + A (Select All):
    - always handled by browser

---

### Undo / Redo

32. Platform-aware:
    - Windows/Linux: Ctrl+Z / Ctrl+Y
    - macOS: Cmd+Z / Cmd+Shift+Z

33. Behavior:
    - if `hasChanges()` → browser handles
    - else → Freon handles

---

### Character Input

34. `box.isCharAllowed(text, key, caretPos)` determines behavior:

- `OK` → browser inserts character
- `NOT_OK` → prevent input
- `GOTO_NEXT` → move to next node
- `GOTO_PREVIOUS` → move to previous node

---

## Clipboard Behavior

35. Clipboard handling is conditional:

- if `hasChanges()` → browser handles
- else → Freon handles

36. Custom clipboard operations:
    - `onPaste` → insert plain text at selection
    - `onCopy` → copy plain text
    - `onCut` → copy + delete selection

---

## Text Editing Operations

37. The component supports:
    - `getSelectedText()`
    - `deleteSelection()`
    - `insertAtSelection(text)`

38. These operations:
    - keep DOM and state in sync
    - restore caret position
    - update width

---

## Geometry / Editor Integration

39. The component exposes its rectangle:
    - `inputElement` when editable
    - `readonlyElement` when readonly

40. Used by editor for layout and positioning

---

## General Design Principles

41. The model (`TextBox`) is the single source of truth.

42. Local state may temporarily diverge during editing,
    but is reconciled via `refresh()`.

43. The component prefers:
    - native browser behavior
    - minimal interception
    - CSS over DOM complexity

44. Keyboard handling:
    - intercept only when necessary
    - avoid fighting the browser

45. The component is designed for:
    - predictability
    - consistency with native inputs
    - seamless integration with Freon editor
