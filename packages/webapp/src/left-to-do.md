## Issues that remain to be done in this webapp

1. Names of the concepts that can be searched for should be entered in some config by the lang engineer.
3. Search for structure should be augmented with a view to enter the structure.
5. Styling should be improved.
8. Progress indicator for importing unit. => should be tested
9. Add comments on changes in SplitPane.
11. See if a footer adds something to the page.
12. Find out how to set the address of the server.
13. Change generation of language/gen/index to use 'import type'.
14. When scrollbar is added to one of the splitpanes, the content moves => try to avoid this.
16. Add some generate help content.
17. Maybe add a context menu to the model name in the navigator (drawer) to add new unit and import new unit.
18. Make sure the same font-family is used for the app and the editor.
20. Make sure Travis is ok: travis.yml uses node 14.15.4, where svelte-kit expects >= 16. Maybe update yarn as well?
21. Message on server: "DeprecationWarning: In future versions of Node.js, fs.rmdir(path, { recursive: true }) will be removed. Use fs.rm(path, { recursive: true }) instead"

DONE:
2. The error list and search results should not have a number, or perhaps they should have some ID.
4. Delete model functionality should be added.
6. When an item is selected in the info panel (error or search result), the cursor should jump to the corresponding
   element.
7. Code to import a unit should be moved to other place.
10. Split EditorCommunication in better to handle units, and address all todos.
15. Adjust the z-indez of the mouse-catcher of SplitPane such that it stays behind the dialogs.
19. Remove all unneeded console.logs.
