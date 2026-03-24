Error markers

After that, I’d look at boundary behavior consistency for keys:

    left/right arrows at the edges
    Backspace vs Delete at boundaries
    Home/End when already at start/end
    Ctrl+Backspace / Ctrl+Delete on both Windows and Mac keyboards

Another remaining item is selection correctness under programmatic focus. You already have good machinery for it, but I’d still want to verify:

    empty text
    full selection
    index outside range
    readonly transitions
    focus coming from editor after refresh

Then there’s cleanup / consolidation:

    remove any remaining old assumptions or comments that still mention the former structure
    possibly move more keyboard helpers out to the utility file
    [x] maybe type endEditing reasons instead of using free strings, if you haven’t done that yet

And finally, there is a small but important category: decisions you may still want to make explicitly:

    what exactly should happen on Backspace at the far left
    what exactly should happen on Delete at the far right
    whether readonly text should be mouse-selectable
    whether ESC should always move to next leaf, or perhaps restore and let editor decide navigation
