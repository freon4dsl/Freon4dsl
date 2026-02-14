<script lang="ts">
    import { onMount } from "svelte";
    import KeenSlider from "keen-slider";
    import "keen-slider/keen-slider.min.css";

    let sliderEl: HTMLDivElement;
    let slider: any; // KeenSlider instance (keep as any to avoid type friction in sandboxes)

    let canPrev = false;
    let canNext = true;

    function updateButtons() {
        if (!slider) return;

        // details().rel is current relative index, max is slidesCount - 1 (when not looping)
        const details = slider.track.details;
        const rel = details.rel;
        const max = details.slides.length - 1;

        canPrev = rel > 0;
        canNext = rel < max;
    }

    function prev() {
        slider?.prev();
    }

    function next() {
        slider?.next();
    }

    onMount(() => {
        slider = new KeenSlider(
            sliderEl,
            {
                loop: false,
                slides: { perView: 1, spacing: 16 }
            },
            [
                // plugin (optional) to keep buttons in sync
                (s) => {
                    s.on("created", updateButtons);
                    s.on("slideChanged", updateButtons);
                    s.on("updated", updateButtons);
                }
            ]
        );

        // initial state
        updateButtons();

        return () => {
            slider?.destroy();
            slider = null;
        };
    });
</script>

<div class="wrap">
    <div class="keen-slider" bind:this={sliderEl}>
        <div class="keen-slider__slide slide">1</div>
        <div class="keen-slider__slide slide">2</div>
        <div class="keen-slider__slide slide">3</div>
        <div class="keen-slider__slide slide">4</div>
        <div class="keen-slider__slide slide">5</div>
    </div>

    <div class="controls">
        <button type="button" onclick={prev} disabled={!canPrev}>Prev</button>
        <button type="button" onclick={next} disabled={!canNext}>Next</button>
    </div>
</div>

<style>
    .wrap {
        max-width: 48rem;
        margin: 0 auto;
        padding: 1rem;
        font-family: system-ui, sans-serif;
    }

    .slide {
        height: 19rem;
        border: 2px solid #ccc;
        border-radius: 1.2rem;
        display: grid;
        place-items: center;
        font-size: 4rem;
        font-weight: 600;
        user-select: none;
    }

    .controls {
        display: flex;
        gap: 0.5rem;
        justify-content: center;
        margin-top: 1rem;
    }

    button {
        border: 2px solid #ccc;
        background: transparent;
        padding: 0.4rem 0.8rem;
        border-radius: 999px;
        cursor: pointer;
        font: inherit;
    }

    button:disabled {
        opacity: 0.4;
        cursor: default;
    }
</style>
