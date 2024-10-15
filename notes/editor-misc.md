### Editor Misc

- [x] Filter current parent from dropdown in reference.
  - Fixed by custom scoper
- [ ] DEletion does niot work very well at all, need to revisit how this is done.
- [ ] When using reference shortcuts (like Event V1, S1 in Mike’s example) do not show concept “EventReference”
- [x] Howto add your own editor components to Freon
- [x] create the ability to jump to elements by clicking (or something) on its reference
      (special ReferenceBox?)
- [ ] When a type of a property cannot be found the error message is rather unclear: (A)
    -  `ERROR: Element 'correctAnswer' should have a type`

- [ ] in context menu 'add' make base class available
- [ ] add a handle for the drag and drop
- [x] make it easy to add a button to a component

- [x] add custom tables

- [ ] maybe add the option to include a vertical line left to an indent component
- [x] tinymce editor => have a look at MultiLineComponent2.svelte in M&G's stuff

- [ ] Click already selected error in error/search list does not select it in editor.
- [ ] Some ersors cannot be navigated to, e.g. placeholders for child concepts

- [ ] Drag & drop in tabellen werkt niet.

- [ ] Seach for names elements does not find references.
- [ ] Text for found elements should include something readable.
- [ ] Enable special projection per element (selectable by the user)

- [x] Collections as tabbed box (so the elements are stacked upon each other)
    - [x]  Covered by external components
- [ ] Non-textual Box/Component e.g. bodypart picture with click to point to pain areas.

- [ ] How to show for a single word boolean that something can be added/changed
- [x] For an optional edit part have different user defined projections for show / now show
    - [x] For e.g. "[?extends ${extends>]" show just the ${extends} for now show.
- [ ] Tables with different types of nodes do not work now, all nodes must be of the same concept.
    - [x]  Lists are ok with different types, but they do not have to have the columns defined
    - [ ] Tables are probably impossible, use grid instead.
-
- [ ] when two concepts with the same name are referrable, a duplicate key error occurrs.
- [ ] Typecheck error: select error wants to go to Question instead of QuestionRef in error inTest Scenario (A)


