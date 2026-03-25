# TextDropdownComponent (TDD) – Additional Requirements

## Opening Behavior

- Open the dropdown when the field gets focus through a mouse click.
- Open the dropdown when the component already has focus and the user presses `Enter`.
- Dropdown is closed upon `Escape`.
- Do **not** automatically open the dropdown on:
    - Tab focus
    - Editor-driven focus
- `ArrowDown` does **not** open the dropdown.

## Dropdown Data

- The dropdown works with two option lists:
    - `allOptions`: all possible options from the box
    - `filteredOptions`: options filtered based on user input

## Filtering Behavior

- Filtering is based on:
    - the full input text
    - the current caret position
- The text **before the caret** is treated as the intended prefix.
- The dropdown should give immediate feedback:
    - show whether the current prefix matches options
    - help the user decide whether more typing is needed

## Updating Filtered Options

- `filteredOptions` must update when:
    - text changes (typing, paste, programmatic insert/delete)
    - caret position changes (keyboard navigation)
    - caret/selection changes via mouse interaction
    - dropdown is opened

- Use:
    - immediate update when text is changed programmatically
    - deferred update (e.g. `requestAnimationFrame`) when the browser updates caret/text

## Matching / Auto-Execution

- When the user types a certain regular expression, try to match and execute the corresponding action immediately.
- When exactly one filtered option remains and it has been fully typed, choose it immediately without waiting for `Enter`.
- Keep commit logic shared between live matching and `Enter` / click selection as much as possible.

## Interaction with Dropdown

- When dropdown is open:
    - `ArrowUp` / `ArrowDown` navigate options
    - `Enter` executes the currently selected option
    - mouse click executes the clicked option
- `selected` has a single source of truth in the dropdown component and is passed back through binding.
- When visible options change, the dropdown repairs `selected` so it always points to a visible option (or `undefined` if none exist).

## Closing / End Editing

- `Escape` should restore the original value.
- On leaving the component with the dropdown open:
    - execute a fully matched option if there is exactly one
    - otherwise restore the original value
- A successful match/selection should close the dropdown without executing twice.

## Overlay Behavior

- Dropdown is rendered in overlay (portal).
- Dropdown:
    - positions relative to input
    - flips when hitting viewport edges
    - closes on outside click / resize

## General UX Intent

- User can quickly see:
    - whether current input matches options
    - whether more typing is needed
- Keep behavior predictable:
    - mouse → open immediately
    - keyboard → explicit (`Enter`)
