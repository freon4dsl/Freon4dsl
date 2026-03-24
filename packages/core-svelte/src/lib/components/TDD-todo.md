# Review: TextDropdownComponent (TDD)

## Main suspicious points

- [ ] **Arrow keys ignore dropdown state**
    - Should possibly navigate dropdown when open
    - Currently only text/navigation behavior

- [ ] **Dropdown not triggered in shown code**
    - `showDropdown()` exists but no visible trigger

- [ ] **Enter always navigates away**
    - Even when input is invalid and reverted
    - Risk: user loses context

- [ ] **itemSelected() bypasses endEditing()**
    - Creates a second exit path
    - Risk: inconsistent behavior vs Enter / Arrow / FocusOut

- [x] **itemSelected() uses object identity**
    - `allOptions.findIndex((o) => o === sel)`
    - Fragile unless same instance is guaranteed
    - Prefer matching on `id`

- [x] **itemSelected() uses allOptions instead of filteredOptions**
    - May mismatch with what user actually selected
    - Better resolve by `id`

- [x] **Escape causes double navigation**
    - `endEditing("escape")` already exits
    - Extra `editor.selectNextLeaf()` is redundant

- [ ] **endEditing() has inconsistent outcomes**
    - Sometimes executes option
    - Sometimes restores text
    - Sometimes navigates
    - Hard to reason about

- [ ] **FocusOut vs dropdown click race**
    - Clicking dropdown may trigger `focusout` first
    - `endEditing("focusout")` may interfere with selection

- [ ] **refresh() ignores dropdown state**
    - Options / filteredOptions not updated on model change


## itemSelected() – main concern

- Executes option + navigation + UI changes directly
- Breaks "endEditing is the one true exit path"

👉 Recommendation:
- Delegate to `endEditing("option-selected")`
- Keep a single exit funnel


## High-risk test cases

1. Click dropdown item after typing partial text
2. Invalid text + Enter
3. Valid text + Enter
4. Click item while input loses focus
5. Escape
6. Arrow left/right while dropdown open


## Risk ranking

1. itemSelected() + focusout interaction
2. Enter always navigating away
3. Object identity lookup in itemSelected()
