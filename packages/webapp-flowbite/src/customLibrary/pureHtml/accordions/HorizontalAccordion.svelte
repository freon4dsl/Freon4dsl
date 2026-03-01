<script lang="ts">
    import { type FreComponentProps, RenderComponent } from "@freon4dsl/core-svelte"
    import { FREON, PartListReplacerBox } from "@freon4dsl/core"
    import type { FreNode } from "@freon4dsl/core"
    import { onMount, untrack } from "svelte"

    // Props
    let { editor, box }: FreComponentProps<PartListReplacerBox> = $props()
    let panelOpen: boolean[] = $state([]);      // List of booleans to indicate which panel is open (true) and closed (false).
    let multiplePar: boolean = $state(false);   // Indicates whether multiple panels may be open at the same time.

    let ch = $state([...box.children])

    /**
     * Stable UI-only labeling for panels.
     * Store the rendered labels so UI updates when names change.
     * When name is not present, use a number.
     *
     * Uses a WeakMap keyed by node identity so numbers remain stable
     * across removals and reordering, without introducing any dependency
     * on model-specific identifiers.
     * When a node disappears and is garbage-collected, the WeakMap entry disappears too.
     */
    let labels: string[] = $state([])
    const stableIds = new WeakMap<object, number>()
    let counter = 1

    function getStableLabel(node: FreNode): string {
        // 1️⃣ If node has a "name" property, and it's non-empty → use it
        const maybeName = (node as unknown as { name?: unknown }).name;

        if (typeof maybeName === "string" && maybeName.trim().length > 0) {
            return maybeName.trim()
        }

        // 2️⃣ Otherwise fall back to stable numbering
        if (!stableIds.has(node)) {
            stableIds.set(node, counter++);
        }

        return String(stableIds.get(node)!)
    }

    function toggle(i: number) {
        const next = !panelOpen[i];

        if (!multiplePar) {
            for (let j = 0; j < panelOpen.length; j++) {
                panelOpen[j] = false;
                box.children[j].isVisible = false;
            }
        }

        panelOpen[i] = next;
        box.children[i].isVisible = next;
    }

    function getOpenPanels() {
        const param: string | undefined = box.findParam("multi")
        multiplePar = param === "multiple"

        const prev = panelOpen.slice()
        panelOpen = []
        labels = []
        for (let i = 0; i < box.children.length; i++) {
            const isOpen = prev[i] ?? false
            panelOpen[i] = isOpen
            labels[i] = getStableLabel(box.children[i].node)
            box.children[i].isVisible = isOpen
        }
        if (panelOpen.length > 0 && !panelOpen.some(Boolean)) {
            panelOpen[0] = true
            box.children[0].isVisible = true
        }
    }

    function onLabelKeydown(e: KeyboardEvent, index: number) {
        switch (e.key) {
            case "Enter":
            case " ":
                e.preventDefault();
                toggle(index);
                break;
            case "ArrowRight":
                e.preventDefault();
                if (!panelOpen[index]) toggle(index);
                break;
            case "ArrowLeft":
                e.preventDefault();
                if (panelOpen[index]) toggle(index);
                break;
        }
    }

    function onAddKeydown(e: KeyboardEvent) {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            addElement();
        }
    }

    async function addElement() {
        // 1) create/insert a new element in the underlying model list.
        box.addNewItem();

        // 2) After refresh() re-initializes, open the last panel
        const last = box.children.length;
        if (last >= 0) {
            if (!multiplePar) {
                for (let j = 0; j < panelOpen.length; j++) {
                    panelOpen[j] = false;
                    box.children[j].isVisible = false;
                }
            }
            panelOpen[last] = true;
            box.children[last].isVisible = true;

            // 3) Focus into the new child if possible
            // await box.children[last].setFocus?.();
        }
    }

    function removeElement(index: number) {
        // 1) Guard (optional but nice)
        if (index < 0 || index >= ch.length) return;

        // 2) Close the panel being removed (prevents weird UI after removal)
        panelOpen[index] = false;

        // 2) Open the previous panel if it exists
        const newIndex = Math.min(index, ch.length - 1);
        if (newIndex >= 0) panelOpen[newIndex] = true;

        // 3) Update the model
        FREON.astChanger.change(() => {
            box.getPropertyValue().splice(index, 1);
        });
    }

    // The following three functions need to be included for the editor to function properly.
    // Please, set the focus to the first editable/selectable element in this component.
    async function setFocus(): Promise<void> {
        for( let i=0; i < box.children.length; i++) {
            if (panelOpen[i]) {
                box.children[i].setFocus();
            }
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const refresh = (why?: string): void => {
        console.log("REFRESH ACCORDION")
        // do whatever needs to be done to refresh the elements that show information from the model
        untrack( () => getOpenPanels() );
    };

    $effect(() => {
        box.setFocus = setFocus;
        box.refreshComponent = refresh;
        // Needed to get an effect
        ch = [...box.children]
        // untrack because initialize causes a too many  effects error
        untrack( () => getOpenPanels() );
    });

    onMount(() => {
        getOpenPanels()
    })

</script>

<div class="h-accordion-wrapper">
<div class="h-accordion">
    {#each ch as childBox, index}
        <div class="panel" class:open={panelOpen[index]}>
            <button
                type="button"
                class="label label-btn"
                aria-expanded={panelOpen[index]}
                onclick={() => toggle(index)}
                onkeydown={(e) => onLabelKeydown(e, index)}
            >
                <span class="label-text">
                    {childBox.node.freLanguageConcept()} {labels[index]}
                </span>

                <span
                    class="remove-btn"
                    role="button"
                    tabindex="0"
                    aria-label="Remove item"
                    title="Remove item"
                    onclick={(ev) => {ev.stopPropagation(); removeElement(index)}}
                    onkeydown={(e) => {
                        e.stopPropagation()
                        if (e.key === " ") e.preventDefault();
                        if (e.key === "Enter" || e.key === " ") removeElement(index)
                    }}
                >
                    ×
                </span>
            </button>

            <div class="content" hidden={!panelOpen[index]}>
                <div class="content-scroll">
                    <RenderComponent box={childBox} editor={editor} />
                </div>
            </div>
        </div>
    {/each}
    <!-- Add button as final narrow “panel” -->
    <div
        class="panel add-panel"
        onclick={addElement}
        onkeydown={onAddKeydown}
        role="button"
        tabindex="0"
        aria-label="Add item"
        title="Add item"
    >
        <div class="label">+</div>
    </div>
</div>
</div>

<style>
    :root {
        --accordion-label-height: 56px;     /* header height when OPEN */
    }
    .h-accordion-wrapper {
        display: flex;
        flex-direction: column;
        flex: 1 1 auto;     /* take available space */
        min-height: 0;      /* allow shrinking */
        overflow: hidden;   /* prevents outer scrollbar; scroll happens inside content */
        outline: var(--color-light-accent-200) 2px solid;
        /*height: 780px;*/
    }
    .h-accordion {
        display: flex;
        align-items: stretch;
        flex: 1 1 auto;   /* fill the wrapper */
        min-height: 0;    /* important */
    }

    /* Panels */
    .panel {
        display: flex;
        flex-direction: column;
        align-items: stretch;

        flex: 0 0 auto;                  /* collapsed width */
        transition: flex-basis 250ms ease;

        overflow: visible;
        min-width: 0;                   /* important in flex rows */
        min-height: 0;                  /* Panels must also be allowed to shrink */
        outline: 1px solid var(--color-light-accent-200);
    }

    .panel.open {
        flex: 1 1 auto; /* grow and fill remaining space */
    }
    .panel.open .label-btn {
        display: flex;              /* <-- the missing piece */
        align-items: center;        /* vertical centering */
        justify-content: space-between;

        writing-mode: horizontal-tb;
        transform: none;

        padding: 0 12px;
    }

    /* Label as button (CLOSED state default) */
    .label-btn {
        all: unset;
        box-sizing: border-box;
        cursor: pointer;
        writing-mode: vertical-rl;
        transform: rotate(180deg);
        text-orientation: mixed;
        padding: 8px;

        font-weight: 700;
        opacity: 0.9;
        background-color: var(--color-light-accent-50);
        border-bottom: 1px solid rgba(0,0,0,0.08);
        border-right: 1px solid rgba(0,0,0,0.08);

        position: relative; /* anchor for the x */
        /* take ALL available vertical space */
        flex: 1 1 auto;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    /* OPEN state: horizontal header bar */
    .panel.open .label-btn {
        display: flex;
        align-items: center;
        justify-content: space-between;

        writing-mode: horizontal-tb;
        transform: none;

        padding: 0 12px;

        /* Only open panels get the fixed header height */
        flex: 0 0 var(--accordion-label-height);
        height: var(--accordion-label-height);

        border-bottom: 1px solid rgba(0,0,0,0.08);
        border-right: 0;
    }

    .label-btn:focus-visible {
        outline: 2px solid currentColor;
        outline-offset: 2px;
    }
    .label-btn:hover {
        background-color: var(--color-light-accent-100);
    }
    .label-text {
        overflow-wrap: anywhere; /* allow breaks in long labels */
        word-break: break-word;
        line-height: 1.1;
        text-align: center;
    }

    /* Content area */
    .content {
        padding: 12px;
        overflow: visible;
        flex: 1 1 auto;    /* fill available space under the header */
        min-height: 0;     /* allow internal scroller to work */
    }

    .content-scroll {
        height: 100%;
        overflow: auto;        /* scrolling lives here instead */
        min-height: 0;
    }

    /* Add panel tweaks */
    .add-panel:hover {
        background-color: var(--color-light-accent-100);
    }

    .add-panel {
        flex: 0 0 36px;
        font-size: 1.6rem;   /* scales nicely */
        font-weight: 700;
        cursor: pointer;
    }
    .add-panel .label {
        flex: 1;
        display: flex;
        align-items: center;      /* vertical centering */
        justify-content: center;  /* horizontal centering */

        writing-mode: vertical-rl;
        transform: rotate(180deg);
    }

    .remove-btn {
        display: none;
    }

    .panel.open .remove-btn {
        display: flex;
        align-items: center;          /* vertical center */
        justify-content: center;

        width: 24px;
        height: 24px;

        font-size: 16px;
        font-weight: 700;

        color: #b91c1c;
        border-radius: 50%;
        cursor: pointer;
        transition: background 0.2s ease, transform 0.1s ease;
    }

    .panel.open .remove-btn:hover {
        background: rgba(185, 28, 28, 0.12);
        transform: scale(1.05);
    }

    .label-btn:hover .remove-btn {
        opacity: 1;
    }

    .remove-btn:hover {
        background-color: #f1aeb5;
    }

    /* show on hover/focus of the label */
    .label-btn:hover .remove-btn,
    .label-btn:focus-visible .remove-btn,
    .remove-btn:focus-visible {
        opacity: 1;
    }

    /* nice: full opacity on hover of the x itself */
    .remove-btn:hover {
        background-color: #f1aeb5;
    }

    .panel.open .label-btn {
        writing-mode: horizontal-tb;
        transform: none;

        flex-direction: row;
        justify-content: space-between;
        padding: 0 12px;
    }
</style>
