<script lang="ts">
    // from https://chowdera.com/2022/02/202202031313409572.html
    const triggerDragAndDrop = function(source, target, offsetY = 0) {
        const DELAY_INTERVAL_MS = 100;
        const MAX_TRIES = 10;
        let dragStartEvent;

        function createNewDataTransfer() {
            let data = {};
            return {
                clearData: function(key) {
                    if (key === undefined) {
                        data = {};
                    } else {
                        delete data[key];
                    }
                },
                getData: function(key) {
                    return data[key];
                },
                setData: function(key, value) {
                    data[key] = value;
                },
                setDragImage: function() {
                },
                dropEffect: "move",
                files: [],
                items: [],
                types: ["text/plain"],
                effectAllowed: "move"
            };
        };
        const fireDragEvent = function(type, elem, clientX, clientY, dataTransfer) {
            let event = new DragEvent(type, {
                bubbles: true,
                cancelable: true,
                view: window,
                clientX: clientX,
                clientY: clientY,
                pageX: clientX,
                pageY: clientY,
                screenX: clientX,
                screenY: clientY,
                relatedTarget: elem
            });
            event.dataTransfer = dataTransfer || createNewDataTransfer();
            elem.dispatchEvent(event);
            return event;
        };
        const firePointerEvent = function(type, elem, clientX, clientY) {
            let event = new PointerEvent(type, {
                bubbles: true,
                cancelable: true,
                view: window,
                pageX: clientX,
                pageY: clientY,
                screenX: clientX,
                screenY: clientY,
                button: 0,
                which: 1
            });
            event.preventDefault();
            elem.dispatchEvent(event);
        };
        const firePointerMoveEvent = function(type, elem, clientX, clientY) {
            let event = new PointerEvent(type, {
                bubbles: true,
                cancelable: true,
                view: window,
                pageX: clientX,
                pageY: clientY,
                screenX: clientX,
                screenY: clientY
            });
            event.preventDefault();
            elem.dispatchEvent(event);
        };
        const fireMouseMoveEvent = function(type, elem, clientX, clientY) {
            const event = new MouseEvent(type, {
                bubbles: true,
                cancelable: true,
                view: window,
                pageX: clientX,
                pageY: clientY,
                screenX: clientX,
                screenY: clientY
            });
            event.preventDefault();
            elem.dispatchEvent(event);
        };
        const fireMouseEvent = function(type, elem, clientX, clientY) {
            const event = new MouseEvent(type, {
                bubbles: true,
                cancelable: true,
                button: 0,
                view: window,
                pageX: clientX,
                pageY: clientY,
                screenX: clientX,
                screenY: clientY,
                which: 1
            });
            event.preventDefault();
            elem.dispatchEvent(event);
        };
        // fetch target elements
        const elemDrag = document.querySelector(source);
        const elemDrop = document.querySelector(target);
        if (!elemDrag || !elemDrop) {
            return false;
        }

        // calculate positions
        let pos = elemDrag.getBoundingClientRect();
        const center1X = Math.floor((pos.left + (pos.width / 2)));
        const center1Y = Math.floor((pos.top + (pos.height / 2)));
        pos = elemDrop.getBoundingClientRect();
        const center2X = Math.floor((pos.left + (pos.width / 2)));
        const center2Y = pos.bottom;
        let counter = 0;
        const startingDropRect = elemDrop.getBoundingClientRect();

        function rectsEqual(r1, r2) {
            return r1.top === r2.top && r1.right === r2.right && r1.bottom === r2.bottom && r1.left === r2.left;
        }

        function dragover() {
            counter++;
            console.log("DRAGOVER #" + counter);

            const currentDropRect = elemDrop.getBoundingClientRect();
            if (rectsEqual(startingDropRect, currentDropRect) && counter < MAX_TRIES) {
                if (counter != 1) {
                    console.log("drop target rect hasn't changed, trying again");
                }

                fireDragEvent("dragover", elemDrop, center2X, center2Y + offsetY, dragStartEvent.dataTransfer);
                fireMouseMoveEvent("mousemove", elemDrop, center2X, center2Y + offsetY);
                firePointerMoveEvent("pointermove", elemDrop, center2X, center2Y + offsetY);
                setTimeout(dragover, DELAY_INTERVAL_MS);
            } else {
                if (rectsEqual(startingDropRect, currentDropRect)) {
                    console.log("wasn't able to budge drop target after " + MAX_TRIES + " tries, aborting");
                    fireDragEvent("drop", elemDrop, center2X, center2Y + offsetY, dragStartEvent.dataTransfer);
                    fireMouseEvent("mouseup", elemDrop, center2X, center2Y + offsetY);
                    firePointerEvent("pointerup", elemDrop, center2X, center2Y + offsetY);

                } else {
                    setTimeout(drop, DELAY_INTERVAL_MS);
                }
                setTimeout(drop, DELAY_INTERVAL_MS);
            }
        }

        function drop() {
            console.log("DROP");
            fireDragEvent("drop", elemDrop, center2X, center2Y + offsetY, dragStartEvent.dataTransfer);
            fireMouseEvent("mouseup", elemDrop, center2X, center2Y + offsetY);
            firePointerEvent("pointerup", elemDrop, center2X, center2Y + offsetY);

        }

        // start dragging process
        console.log("DRAGSTART");

        firePointerEvent("pointerdown", elemDrag, center1X, center1Y);
        fireMouseEvent("mousedown", elemDrag, center1X, center1Y);
        dragStartEvent = fireDragEvent("dragstart", elemDrag, center1X, center1Y, dragStartEvent.dataTransfer);

        setTimeout(dragover, DELAY_INTERVAL_MS);
        return true
    }
</script>
