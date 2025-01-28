# Bugs

## Error markers

### Error markers in gutter not move with changes in the model
SSometimes the error markers do move when something has changed in the model, sometimes they do not.
In Example Model89:
- Inserting an attribute at the froms using the context menu:
	- The attribute markers move ok
	- The method markers stay where they are, should also move
	- NOTE that the attribute markers are on text boxes and the method markers on layout boxes.
### Some error markers stay after projection change, some not
Markers on textboxes (squiggly) stay red after projection change, other markers (in the gutter and the full lines) disappear
- Is this intentional?

## Incorrect projection for expression

**Description:**  When the AST specifies a specific expression, e.g. for `InsuranceModel.InsurancePart.risk`, the editor creates a generic expression projection with a pre- and post- action box. 

**Problem:** This is incorrect, as only a NumberLiteralExpression is allowed.

**Proposed Solution:** The projection generator should detect that the NumberLiyteralExpression is not a general expression and leave out the pre- and post boxes.

## Node version

(node:55540) [DEP0147] DeprecationWarning: In future versions of Node.js, fs.rmdir(path, { recursive: true }) will be removed. Use fs.rm(path, { recursive: true }) instead
(Use `node --trace-deprecation ...` to show where the warning was created)

## Styling

In `core-svelte/src/notes-on-styling` the old freon CSS variables are referred to.

This should now use the new css styles for the components

## After changing view, cursor is lost

After selecting other projections there is no focus in the editor. You need to first click somewhere.

The cursor should be inside the editor, e.g. st:

- the same element as it was before

- if that element is not visible, at its parent

- ...

## External property replacer cannot input anything

In the external tester project the replacers for properties do not react upon any key stroke. So you cannot type anything.

# Solved

## Any number field that becomes empty deletes the whole node
- [x] This is supposed to only work for concepts that  have only ons property in their projection, especially the NumerLiteralExpression.
  Now e.g. an entity with a version property is deleted when this property becomes empty.
  **Problem:** every number box always get deleteWhenEmpty set to true.
  **Solution:** remove deleteWhenEmpty as default, add it as custom projection in samples/Example

## Up  arrows don't work in select/action boxes
- [x] When the dropdown is closed, the up  arrow does nothing.
  It should go up in the editor to another box.

**Problem**: The X and Y coordinates of the textbox inside a dropdown component were never set. Reason is that the corresponding text component is not used through the renderComponent that sets the X and Y coordinates.

**Solution**:solved by setting the X and Y explicitly in the text component. May have a better solution when revisiting this.

## Cursor incorrect after optional multi value
- [x] After selecting 'implement' with multi-reference in freon lionweb, the cursor does not go to the right place.
## Incorrect input in action or select box is not cleared when losing focus.
- [x] ZDropdownComponent should clean incorrect value in actionbox
  In reference box it should keep the incorrect reference

## Box tree error

The following error occurrs:

` ERROR: Box: nextLeafRight: TextBox for ID-31 of concept Method is mising in its parent (index === -1)`

when selecting method type with click and trying to tab right.

The internal textbox parent should be a referencebox.

**Solution:** AbstractSelectBox `children` returned empty array, but should return an array with the internal textbox as single element. Done.

## LoggerSettings from webapp-lib to webapp-starter

Then logger setting should be in the webapp-=starter, so the developer can easily change them.

## ActionBox background remains blue

- [x] The background of a, actionbox become light blue when it is selected/editing.  After leaving the actionbox it remains light blue, but it should remove the light blue background.

- TAB in CLICK out: remains blue
- TAB in TAB out: remains blue
- CLICK in TAB out: ok, blue background disappears
- CLICK in CLICK out: ok, blue background disappears

**Solved**: Dispatch custom 'focusOutTextComponent' when leaving text box ensures it is handled by the textdropdown component.
## After click inside action box TABs and arrows go wrong
- [x] When selecting an action box through a click then remove the dropdown using ESC, the TAB, Back TAB and arrow keys use the previous selected box as the starting point

**Problem**: The selected box is FreEditor is probably not set correctly
**Solved:** By previous two solved problems
## Select and action boxes have no border when selected.
- [x] IS this just styling?

# Sveltekit > 2.5.10 gives build error
On githun the .svelte-kit/tsconfig.json is not found.
Probably fixable bt=y adding a sveltekit sync somewhere in the build.

## Using InMemoryModel (25 jan 2025)

- Creating a unit uses the unit's id, but the Freon native server uses the unit's name to store it. If the name is not present,
then nothing is saved.

## In create freon (25 jan 2025)

- Clean up the package.json in freon sample languages, e.g. remove install-local.
- Merge samples/Education and samples/EduTutorialNew. The latter is the 'correct' project, but the 
former did contain some files concerning the interpreter. Move these files to EduTutorialNew, delete Education, and rename
EduTutorialNew to Education.

## In core: FreEditor (25 jan 2025)

- Setting the rootElement in the editor needs a mobx action. This is currently done in the webapp-lib, 
but it should be done in core. Likewise for 'forceRecalculateProjection'

