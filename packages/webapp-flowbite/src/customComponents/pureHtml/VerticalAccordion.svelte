<script lang="ts">
    import { type FreComponentProps, RenderComponent } from "@freon4dsl/core-svelte"
    import { FREON, PartListReplacerBox } from "@freon4dsl/core"
    import type { FreNode } from "@freon4dsl/core"
    import { onMount, untrack } from "svelte"
    import { Stage } from "@freon4dsl/samples-festival-planning"

    // Props
    let { editor, box }: FreComponentProps<PartListReplacerBox> = $props()
    let panelOpen: boolean[] = $state([])
    let multiplePar: boolean = $state(false)

    let ch = $state([...box.children])

    // store the rendered labels so UI updates when names change
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
        const next = !panelOpen[i]

        if (!multiplePar) {
            for (let j = 0; j < panelOpen.length; j++) {
                panelOpen[j] = false
                box.children[j].isVisible = false
            }
        }

        panelOpen[i] = next
        box.children[i].isVisible = next
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
                e.preventDefault()
                toggle(index)
                break
            case "ArrowDown":
                e.preventDefault()
                if (!panelOpen[index]) toggle(index)
                break
            case "ArrowUp":
                e.preventDefault()
                if (panelOpen[index]) toggle(index)
                break
        }
    }

    function onAddKeydown(e: KeyboardEvent) {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            addElement()
        }
    }

    async function addElement() {
        FREON.astChanger.change(() => {
            const newElement: Stage = Stage.create({})
            box.getPropertyValue().push(newElement)
        })

        const last = box.children.length
        if (last >= 0) {
            if (!multiplePar) {
                for (let j = 0; j < panelOpen.length; j++) {
                    panelOpen[j] = false
                    box.children[j].isVisible = false
                }
            }
            panelOpen[last] = true
            box.children[last].isVisible = true
        }
    }

    function removeElement(index: number) {
        if (index < 0 || index >= ch.length) return

        panelOpen[index] = false

        const newIndex = Math.min(index, ch.length - 1)
        if (newIndex >= 0) panelOpen[newIndex] = true

        FREON.astChanger.change(() => {
            box.getPropertyValue().splice(index, 1)
        })
    }

    async function setFocus(): Promise<void> {
        for (let i = 0; i < box.children.length; i++) {
            if (panelOpen[i]) {
                box.children[i].setFocus()
            }
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const refresh = (_why?: string): void => {
        untrack(() => getOpenPanels())
    }

    $effect(() => {
        box.setFocus = setFocus
        box.refreshComponent = refresh
        ch = [...box.children]
        untrack(() => getOpenPanels())
    })

    onMount(() => {
        getOpenPanels()
    })
</script>

<div class="v-accordion">
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
                    onclick={(ev) => { ev.stopPropagation(); removeElement(index) }}
                    onkeydown={(e) => {
                        e.stopPropagation()
                        if (e.key === " ") e.preventDefault()
                        if (e.key === "Enter" || e.key === " ") removeElement(index)
                    }}
                >
                    ×
                </span>
            </button>

            <div class="content" hidden={!panelOpen[index]}>
                <RenderComponent box={childBox} editor={editor} />
            </div>
        </div>
    {/each}

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

<style>
    :root {
        --v-accordion-label-height: 38px;
        --v-accordion-min-width: 22rem; /* pick what feels right */
    }

    .v-accordion {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        height: 100%;
        width: 100%;
        min-width: var(--v-accordion-min-width);

        margin: 0.5rem;          /* space around the whole accordion */
        padding: 0.5rem;          /* inner breathing room */
        border-radius: 8px;       /* subtle softness */
    }

    /* Panels stack vertically */
    .panel {
        display: flex;
        flex-direction: column;
        align-items: stretch;

        flex: 0 0 auto;
        align-self: stretch;

        width: 100%;        /* ← this is the key */
        min-width: 0;

        transition: flex-basis 250ms ease;

        overflow: hidden;
        min-height: 0;
        outline: 1px solid var(--color-light-accent-200);
    }

    /* Open panel grows to fill available height */
    .panel.open {
        flex: 1 1 auto;
        min-height: 0;
    }

    /* Label bar */
    .label-btn {
        all: unset;
        box-sizing: border-box;
        cursor: pointer;

        display: flex;
        align-items: center;
        justify-content: space-between;

        padding: 0 12px;

        font-weight: 700;
        opacity: 0.9;

        background-color: var(--color-light-accent-50);
        border-bottom: 1px solid rgba(0, 0, 0, 0.08);

        height: var(--v-accordion-label-height);
        flex: 0 0 var(--v-accordion-label-height);
        width: 100%;

        position: relative; /* anchor for the x */
    }

    .label-btn:focus-visible {
        outline: 2px solid currentColor;
        outline-offset: 2px;
    }

    .label-btn:hover {
        background-color: var(--color-light-accent-100);
    }

    /* Content */
    .content {
        padding: 12px;
        overflow: auto;
        min-height: 0;
        flex: 1 1 auto;
    }

    /* Add panel */
    .add-panel {
        flex: 0 0 36px;
        cursor: pointer;
    }

    .add-panel:hover {
        background-color: var(--color-light-accent-100);
    }

    .add-panel .label {
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.6rem;
        font-weight: 700;
    }

    /* Remove button: only show when open (same as your horizontal) */
    .remove-btn {
        display: none;
    }

    .panel.open .remove-btn {
        display: flex;
        align-items: center;
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
</style>
