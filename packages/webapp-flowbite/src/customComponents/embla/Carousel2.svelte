<script lang="ts">
    import { onMount } from "svelte";
    import EmblaCarousel from "embla-carousel";

    let viewport: HTMLDivElement | null = null;
    let embla: ReturnType<typeof EmblaCarousel> | null = null;

    let canPrev = false;
    let canNext = false;

    const options = { loop: false };

    function updateButtons() {
        if (!embla) return;
        canPrev = embla.canScrollPrev();
        canNext = embla.canScrollNext();
    }

    function prev() {
        embla?.scrollPrev();
    }

    function next() {
        embla?.scrollNext();
    }

    onMount(() => {
        if (!viewport) return;

        embla = EmblaCarousel(viewport, options);

        // Keep button enabled/disabled in sync
        embla.on("init", updateButtons);
        embla.on("reInit", updateButtons);
        embla.on("select", updateButtons);

        updateButtons();

        return () => {
            embla?.destroy();
            embla = null;
        };
    });
</script>

<div class="embla">
    <div class="embla__viewport" bind:this={viewport}>
        <div class="embla__container">
            <div class="embla__slide"><div class="embla__slide__number">1</div></div>
            <div class="embla__slide"><div class="embla__slide__number">2</div></div>
            <div class="embla__slide"><div class="embla__slide__number">3</div></div>
            <div class="embla__slide"><div class="embla__slide__number">4</div></div>
            <div class="embla__slide"><div class="embla__slide__number">5</div></div>
        </div>
    </div>

    <div class="embla__controls">
        <div class="embla__buttons">
            <button class="embla__button" type="button" onclick={prev} disabled={!canPrev}>
                Prev
            </button>
            <button class="embla__button" type="button" onclick={next} disabled={!canNext}>
                Next
            </button>
        </div>
    </div>
</div>

<style>
    .embla {
        max-width: 48rem;
        margin: auto;
        --slide-height: 19rem;
        --slide-spacing: 1rem;
        --slide-size: 100%;
    }

    .embla__viewport {
        overflow: hidden;
    }

    .embla__container {
        display: flex;
        touch-action: pan-y pinch-zoom;
        margin-left: calc(var(--slide-spacing) * -1);
    }

    .embla__slide {
        flex: 0 0 var(--slide-size);
        min-width: 0;
        padding-left: var(--slide-spacing);
    }

    .embla__slide__number {
        border: 2px solid #ccc;
        border-radius: 1.8rem;
        font-size: 4rem;
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: center;
        height: var(--slide-height);
        user-select: none;
    }

    .embla__controls {
        display: grid;
        justify-content: space-between;
        gap: 1.2rem;
        margin-top: 1.2rem;
    }

    .embla__buttons {
        display: grid;
        grid-template-columns: repeat(2, auto);
        gap: 0.6rem;
        align-items: center;
        justify-content: center;
    }

    .embla__button {
        appearance: none;
        background: transparent;
        cursor: pointer;
        border: 2px solid #ccc;
        border-radius: 999px;
        padding: 0.4rem 0.8rem;
        font: inherit;
    }

    .embla__button:disabled {
        opacity: 0.4;
        cursor: default;
    }
</style>
