# Bugs

## Incorrect projection for expression

**Description:**  When the AST specifies a specific expression, e.g. for `DocuProject.InsurancePart.risk`, the editor creates a generaic expression projection with a pre- and post- action box. 
**Problem:** This is incorrect, as only a NumberLiteralExpression is allowed.

**Solution:** The projection generator should detect that the NumberLiyteralExpression is not a general expression and leave out the pre- and post boxes.

## Node version

(node:55540) [DEP0147] DeprecationWarning: In future versions of Node.js, fs.rmdir(path, { recursive: true }) will be removed. Use fs.rm(path, { recursive: true }) instead
(Use `node --trace-deprecation ...` to show where the warning was created)

# ActionBox background remains blue

The background of a, actionbox become light blue when it is selected/editing.  After leaving the actionbox it remains light blue, but it should remove the light blue background.

- TAB in CLICK out: remains blue

- TAB in TAB out: remains blue

- CLICK in TAB out: ok, blue background dissappears

- CLICK in CLICK out: ok, blue background dissappears

## Styling

In `core-svelte/src/notes-on-styling` the olf freon CSS variables are referred to.

This should now use the new css styles for the compponents

## After changing view, cursor is lost

After selecting other projections there is no focus in the editor. You need to first click somewhere.

The cursor should be inside the editor, eg st:

- the same element as it was before

- if that elemenet is not visible, at its paremt

- ...

# Box tree error

The following error occurrs:

` ERROR: Box: nextLeafRight: TextBox for ID-31 of concept Method is mising in its parent (index === -1)` 

when selecting method type with click and tryinhg to tab right.

The internal textbox parent should be a referencebox.

**Solved:** AbstractSelectBox `children` returned empty array, but should return an array with the internal textbox.

## External property replacer cannot inpuit anything

In the external tester project the replacers for properties do not react upon any key stroke. So you cannot type anything.    

# LoggerSettings from webapp-lib to webapp-starter

See heading
