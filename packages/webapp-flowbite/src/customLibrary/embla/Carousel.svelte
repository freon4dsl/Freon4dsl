<script lang="ts">
    /*
     This component shows a list of parts (not references!) in the form of a carousel.
     It uses a library called 'embla', therefore the packages "embla-carousel-svelte" and
     "embla-carousel" need to be installed.

     Note that this component does not offer the user the option to add or remove elements
     from the part list. You will need to fill the list in some other way, for instance,
     using a button that triggers the creation of the parts.
     */

    import useEmblaCarousel from "embla-carousel-svelte"
    import type { EmblaCarouselType, EmblaOptionsType } from "embla-carousel"
    import { tick } from "svelte"
    import { Box, PartListReplacerBox } from "@freon4dsl/core"
    import type { FreComponentProps } from "@freon4dsl/core-svelte"
    import { RenderComponent } from "@freon4dsl/core-svelte"

    // Props
    let { editor, box }: FreComponentProps<PartListReplacerBox> = $props()

    let emblaApi: EmblaCarouselType
    let options: EmblaOptionsType = { loop: false, focus: false, }

    let ch = $state([...box.children])
    let selectedKey = $state<string | undefined>(undefined)

    // UI state
    let snapCount = $state(0)
    let selectedIndex = $state(0)
    let canPrev = $state(false)
    let canNext = $state(false)

    const goToPrev = () => emblaApi?.goToPrev()
    const goToNext = () => emblaApi?.goToNext()
    const goTo = (index: number) => emblaApi?.goTo(index)

    function keyOf(b: Box): string {
        return String(b.node.freId())
    }

    const updateUi = () => {
        if (!emblaApi) return
        selectedIndex = emblaApi.selectedSnap()
        canPrev = emblaApi.canGoToPrev()
        canNext = emblaApi.canGoToNext()

        // remember identity of the currently selected slide, so we can jump back to it
        // when the underlying model changes
        const cur = ch[selectedIndex]
        selectedKey = cur ? keyOf(cur) : undefined
    }

    const onInit = (event: CustomEvent<EmblaCarouselType>) => {
        emblaApi = event.detail

        // initial values
        snapCount = emblaApi.snapList().length
        updateUi()

        // keep UI in sync
        emblaApi
            .on("select", updateUi)
            .on("reinit", () => {
                snapCount = emblaApi?.snapList().length ?? 0
                updateUi()
            })
    }

    // The following three functions need to be included for the editor to function properly.
    // Please, set the focus to the first editable/selectable element in this component.
    async function setFocus(): Promise<void> {
        await tick()
        await new Promise(requestAnimationFrame)
        if (selectedIndex < box.children.length) {
            box.children[selectedIndex].setFocus()
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const refresh = async (why?: string): Promise<void> => {
        console.log("REFRESH CAROUSEL", why ?? "")

        // Remember what was selected (identity)
        const wantedKey = selectedKey

        // Rebuild slide boxes for Svelte
        ch = [...box.children]

        // If Embla exists, re-init so it re-reads the DOM and rebuilds snapList
        if (emblaApi) {
            // Recreate snaps from current slides
            emblaApi.reInit()

            // Sync derived UI state from Embla
            snapCount = emblaApi.snapList().length

            // Decide target index
            let target = 0
            if (wantedKey) {
                const idx = ch.findIndex((b) => keyOf(b) === wantedKey)
                if (idx >= 0) target = idx
                else target = Math.min(selectedIndex, Math.max(0, snapCount - 1)) // fallback
            } else {
                target = Math.min(selectedIndex, Math.max(0, snapCount - 1))
            }

            // Go there (if there is anything to show)
            if (snapCount > 0) emblaApi.goTo(target)

            updateUi()
        } else {
            // No embla yet: keep UI state consistent with ch
            snapCount = ch.length
            selectedIndex = Math.min(selectedIndex, Math.max(0, snapCount - 1))
            canPrev = selectedIndex > 0
            canNext = selectedIndex < snapCount - 1
        }
    }

    $effect(() => {
        box.setFocus = setFocus
        box.refreshComponent = refresh
        ch = [...box.children]
    })
</script>

<div class="embla">
    <div
        class="embla__viewport"
        onemblainit={onInit}
        use:useEmblaCarousel={{ options, plugins: [] }}
    >
        <div class="embla__container">
            {#each ch as childBox, index (childBox.$id)}
                <div class="embla__slide" inert={selectedIndex!==index} aria-hidden={selectedIndex !== index}>
                    <div class="card-wrapper">
                    <div class="card">
                        <RenderComponent box={childBox} editor={editor} />
                    </div>
                    </div>
                </div>
            {/each}
        </div>

        <div class="embla__dots"></div>
    </div>

    <div class="embla__controls">
        <div class="embla__buttons">
            <button
                aria-label="Previous slide"
                class="embla__button embla__button--prev"
                class:embla__button--disabled={!canPrev}
                disabled={!canPrev}
                onclick={goToPrev}
                type="button"
            >
                <svg class="embla__button__svg" viewBox="0 0 532 532">
                    <path
                        d="M355.66 11.354c13.793-13.805 36.208-13.805 50.001 0 13.785 13.804 13.785 36.238 0 50.034L201.22 266l204.442 204.61c13.785 13.805 13.785 36.239 0 50.044-13.793 13.796-36.208 13.796-50.002 0a5994246.277 5994246.277 0 0 0-229.332-229.454 35.065 35.065 0 0 1-10.326-25.126c0-9.2 3.393-18.26 10.326-25.2C172.192 194.973 332.731 34.31 355.66 11.354Z"
                        fill="currentColor"
                    ></path>
                </svg>
            </button>

            <button
                aria-label="Next slide"
                class="embla__button embla__button--next"
                class:embla__button--disabled={!canNext}
                disabled={!canNext}
                onclick={goToNext}
                type="button"
            >
                <svg class="embla__button__svg" viewBox="0 0 532 532">
                    <path
                        d="M176.34 520.646c-13.793 13.805-36.208 13.805-50.001 0-13.785-13.804-13.785-36.238 0-50.034L330.78 266 126.34 61.391c-13.785-13.805-13.785-36.239 0-50.044 13.793-13.796 36.208-13.796 50.002 0 22.928 22.947 206.395 206.507 229.332 229.454a35.065 35.065 0 0 1 10.326 25.126c0 9.2-3.393 18.26-10.326 25.2-45.865 45.901-206.404 206.564-229.332 229.52Z"
                        fill="currentColor"
                    ></path>
                </svg>
            </button>
        </div>

        <div aria-label="Carousel pagination" class="embla__dots">
            {#each Array(snapCount) as _, i (i)}
                <button
                    class="embla__dot"
                    class:embla__dot--selected={i === selectedIndex}
                    type="button"
                    onclick={() => goTo(i)}
                    aria-label={`Go to slide ${i + 1}`}
                    aria-current={i === selectedIndex ? "true" : undefined}
                ></button>
            {/each}
        </div>
    </div>
</div>


<style>
    .embla {
        max-width: 48rem;
        padding: 0.6rem;
        margin: 6px;
        outline: black dotted 1px;
        --slide-spacing: 1rem;
        --slide-size: 100%;
        --dot-size: 2.6rem;
        --dot-width: 1.4rem;
        --button-width: 2.1rem;
    }

    .embla__viewport {
        overflow: hidden;
    }

    .embla__container {
        display: flex;
        touch-action: pan-y pinch-zoom;
        margin-left: calc(var(--slide-spacing) * -1);
        box-sizing: border-box
    }

    .embla__slide {
        flex: 0 0 var(--slide-size);
        min-width: 0;
        padding-left: var(--slide-spacing);
        box-sizing: border-box;
    }

    .card-wrapper {
        padding: 0.5rem;
    }
    .card {
        padding: 0.8rem;
        border-radius: 0.75rem;

        border: 2px solid var(--accent-300);
        box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)
    }

    /* Controls (sandbox-style) */
    .embla__controls {
        display: grid;
        grid-template-columns: auto 1fr;
        justify-content: space-between;
        gap: 1.2rem;
        margin-top: 0.6rem;
    }

    .embla__buttons {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 0.6rem;
        align-items: center;
    }

    .embla__button {
        appearance: none;
        background-color: transparent;
        touch-action: manipulation;
        cursor: pointer;
        border: 0.1rem solid var(--accent-900);
        width: var(--button-width);
        height: var(--button-width);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--dot-width);
        font-weight: bold;
        line-height: 1;
        padding: 0;
    }

    /* optical centering */
    .embla__button--prev {
        transform: translateX(-0.5px);
    }

    .embla__button--next {
        transform: translateX(0.5px);
    }

    /* Hover */
    .embla__button:hover:not(:disabled) {
        background-color: var(--accent-200);
        transform: translateY(-1px);
    }

    /* Active / pressed */
    .embla__button:active:not(:disabled) {
        transform: translateY(0);
        background-color: var(--accent-300);
    }

    /* Keyboard focus */
    .embla__button:focus-visible {
        outline: none;
        box-shadow: 0 0 0 3px var(--accent-400);
    }

    /* Disabled */
    .embla__button:disabled {
        opacity: 0.4;
        cursor: default;
    }

    .embla__dots {
        display: flex;
        gap: 0.4rem; /* explicit spacing */
        justify-content: flex-end;
        align-items: center;
        margin-right: calc((var(--dot-size) - var(--dot-width)) / 2 * -1);
    }

    .embla__dot {
        width: var(--dot-size);
        height: var(--dot-size);
        border: 0;
        padding: 0;
        margin: 0;
        background: transparent;
        border-radius: 50%;
        position: relative;
        cursor: pointer;
    }

    /* actual visible dot */
    .embla__dot::before {
        content: "";
        width: var(--dot-width);
        height: var(--dot-width);
        border-radius: 50%;
        background: var(--accent-100);
        position: absolute;
        inset: 0;
        margin: auto;
    }

    /* selected = filled with selected color */
    .embla__dot--selected::before {
        background: var(--accent-900);
    }

    .embla__button__svg {
        width: 40%;
        height: 40%;
    }
</style>
