<div>this is some text where a mouse can click</div>

<script lang="ts">
    function insertBreakAtPoint(e) {

        var range;
        var textNode;
        var offset;

        if (document.caretPositionFromPoint) {    // standard
            range = document.caretPositionFromPoint(e.pageX, e.pageY);
            textNode = range.offsetNode;
            offset = range.offset;

        } else if (document.caretRangeFromPoint) {    // WebKit
            range = document.caretRangeFromPoint(e.pageX, e.pageY);
            textNode = range.startContainer;
            offset = range.startOffset;
        }

// do whatever you want here!
    }

    function getMouseEventCaretRange(evt) {
        var range, x = evt.clientX, y = evt.clientY;

        // Try the simple IE way first
        if (document.body.createTextRange) {
            range = document.body.createTextRange();
            range.moveToPoint(x, y);
        }

        else if (typeof document.createRange != "undefined") {
            // Try Mozilla's rangeOffset and rangeParent properties,
            // which are exactly what we want
            if (typeof evt.rangeParent != "undefined") {
                range = document.createRange();
                range.setStart(evt.rangeParent, evt.rangeOffset);
                range.collapse(true);
            }

            // Try the standards-based way next
            else if (document.caretPositionFromPoint) {
                var pos = document.caretPositionFromPoint(x, y);
                range = document.createRange();
                range.setStart(pos.offsetNode, pos.offset);
                range.collapse(true);
            }

            // Next, the WebKit way
            else if (document.caretRangeFromPoint) {
                range = document.caretRangeFromPoint(x, y);
            }
        }

        return range;
    }
</script>
