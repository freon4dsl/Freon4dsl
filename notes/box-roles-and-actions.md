### Roles

#### Currently Used To

- Connect applicable actions
  - For buttons
  - See Grahams code
  - For custom actions
    - Pretty hard to understand which roles to set, see e.g. action with trigger `/0-9/` in Example project.
  - For standard actions (dropdowns, code completion)
- set focus after action (boxRoleToSelect)
- special roles (`LeftMost`, `BEFORE_BINARY_OPERATOR`, etc.) to enable editing of (binary) expressions.
- `FreEditor.findBoxWithRole()`
- Used for styling as CSS class name `ButtonComponent`, `MultiLineTextComponent`, and `TextComponent`]
- Find existing box in `BoxFactory`.
- Select a specific box in `FreEditor.selectElementBox(... role ...)`
- HTML/Svelte id in `GridComponent` cells?

#### Why unique?

A role must be unique within the projection of a single node, why?
- Factory to find existing box
  - do we need thefactory?
- set focus after action and select specific box
  - could also just set focus on the first one?
- Styling
  - This is a rather weird feature

#### Not unique is ok for

- All actions
  - Buttons
  - Custom Actions
  - Grahams code
  - Standard actions
- Special roles
- HTML/Svelte id 
  - Can most probably be done different and might not even be needed

### Actions

Actions can be triggered based on the box role, but also based on the "property" property of an ActionBox.

Custokm actions like the `/0-9/` regexp are cumbersome to create and maintain since they need to mention all box roles,
in this case all box roles  where an expression will fit.

- [ ] create more options to be able to hook in actions

### Reference shortcuts
Are in Actions, but also in Commands.

**NB**
 Need to take a look at how custom actions are done for buttons etc.

- [ ] Refactor search and copy etc into actions that can be bound to keys.
