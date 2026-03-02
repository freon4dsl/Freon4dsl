<script lang="ts">
    import { run } from 'svelte/legacy';

    import { onMount, onDestroy } from "svelte";
    import KeenSlider from "keen-slider";
    import "keen-slider/keen-slider.min.css";

    let sliderEl: HTMLDivElement = $state();
    let slider: any = $state(null);

    const SLIDE_COUNT = 5;

    // UI state
    let current = $state(0); // 0-based
    let total = $state(SLIDE_COUNT);

    let canPrev = $state(false);
    let canNext = $state(true);

    // autoplay
    let autoplay = $state(false);
    let autoplayMs = $state(2500);
    let autoplayTimer: any = null;

    function updateState() {
        if (!slider) return;

        const details = slider.track.details;
        current = details.rel;

        const max = details.slides.length - 1;
        canPrev = current > 0;
        canNext = current < max;

        total = details.slides.length;
    }

    function prev() {
        slider?.prev();
    }

    function next() {
        slider?.next();
    }

    function goTo(index: number) {
        slider?.moveToIdx(index);
    }

    function clearAutoplay() {
        if (autoplayTimer) {
            clearInterval(autoplayTimer);
            autoplayTimer = null;
        }
    }

    function startAutoplay() {
        clearAutoplay();
        autoplayTimer = setInterval(() => {
            if (!slider) return;
            if (slider.track.details.rel >= slider.track.details.slides.length - 1) {
                // At end: go back to start (simple and demo-friendly)
                slider.moveToIdx(0);
            } else {
                slider.next();
            }
        }, autoplayMs);
    }

    // Keen plugin: pause autoplay on interaction (hover, drag)
    function autoplayPlugin(s: any) {
        s.on("created", () => {
            // pause on hover (desktop demo polish)
            s.container.addEventListener("mouseenter", () => autoplay && clearAutoplay());
            s.container.addEventListener("mouseleave", () => autoplay && startAutoplay());
        });

        // pause on drag and resume after
        s.on("dragStarted", () => autoplay && clearAutoplay());
        s.on("animationEnded", () => autoplay && startAutoplay());
        s.on("updated", () => autoplay && startAutoplay());
    }

    onMount(() => {
        slider = new KeenSlider(
            sliderEl,
            {
                loop: true,
                slides: { perView: 1, spacing: 16 },
                rubberband: true
            },
            [
                autoplayPlugin,
                (s: any) => {
                    s.on("created", updateState);
                    s.on("slideChanged", updateState);
                    s.on("updated", updateState);
                }
            ]
        );

        updateState();

        // ensure autoplay reflects initial toggle state
        if (autoplay) startAutoplay();

        return () => {
            clearAutoplay();
            slider?.destroy();
            slider = null;
        };
    });

    // React to toggle / speed changes
    run(() => {
        if (slider) {
            if (autoplay) startAutoplay();
            else clearAutoplay();
        }
    });

    onDestroy(() => {
        clearAutoplay();
    });
</script>

<div class="carousel">
    <div class="header">
        <div class="title">
            <div class="name">Carousel</div>
            <div class="subtitle">Keen Slider • pure CSS styling • minimal JS</div>
        </div>

        <div class="meta">
            <div class="counter">{current + 1} / {total}</div>

            <label class="toggle">
                <input type="checkbox" bind:checked={autoplay} />
                <span>Autoplay</span>
            </label>
        </div>
    </div>

    <div class="stage">
        <button
            class="nav nav--prev"
            type="button"
            onclick={prev}
            disabled={!canPrev}
            aria-label="Previous slide"
            title="Previous"
        >
            ‹
        </button>

        <div class="keen-slider" bind:this={sliderEl}>
            <div class="keen-slider__slide slide">
                <div class="card">
                    <div class="badge">Slide 1</div>
                    <div class="headline">Clean, dependency-light</div>
                    <div class="text">A reference component that stays fully stylable.</div>
                </div>
            </div>

            <div class="keen-slider__slide slide">
                <div class="card">
                    <div class="badge">Slide 2</div>
                    <div class="headline">Impressive in demos</div>
                    <div class="text">Polish comes from layout, not from heavy features.</div>
                </div>
            </div>

            <div class="keen-slider__slide slide">
                <div class="card">
                    <div class="badge">Slide 3</div>
                    <div class="headline">Easy to understand</div>
                    <div class="text">Bind DOM → init slider → wire buttons → style with CSS.</div>
                </div>
            </div>

            <div class="keen-slider__slide slide">
                <div class="card">
                    <div class="badge">Slide 4</div>
                    <div class="headline">Optional autoplay</div>
                    <div class="text">Toggle it on for a “wow” effect, keep it off by default.</div>
                </div>
            </div>

            <div class="keen-slider__slide slide">
                <div class="card">
                    <div class="badge">Slide 5</div>
                    <div class="headline">Swappable backend</div>
                    <div class="text">Later you can swap Keen for Embla without changing CSS hooks.</div>
                </div>
            </div>
        </div>

        <button
            class="nav nav--next"
            type="button"
            onclick={next}
            disabled={!canNext}
            aria-label="Next slide"
            title="Next"
        >
            ›
        </button>
    </div>

    <div class="footer">
        <div class="dots" aria-label="Slide navigation">
            {#each Array(total) as _, i}
                <button
                    type="button"
                    class="dot"
                    class:dot--active={i === current}
                    onclick={() => goTo(i)}
                    aria-label={`Go to slide ${i + 1}`}
                ></button>
            {/each}
        </div>

        <div class="speed">
            <span>Speed</span>
            <input
                type="range"
                min="1500"
                max="6000"
                step="250"
                bind:value={autoplayMs}
                disabled={!autoplay}
                aria-label="Autoplay speed"
            />
            <span class="ms">{autoplayMs}ms</span>
        </div>
    </div>
</div>

<style>
    .carousel {
        max-width: 54rem;
        margin: 1.5rem auto;
        padding: 1rem;
        font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
        color: #333333;
    }

    .header {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 1rem;
        margin-bottom: 0.75rem;
    }

    .name {
        font-size: 1.25rem;
        font-weight: 700;
    }

    .subtitle {
        font-size: 0.9rem;
        color: #666666;
        margin-top: 0.15rem;
    }

    .meta {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .counter {
        font-variant-numeric: tabular-nums;
        padding: 0.3rem 0.55rem;
        border: 1px solid #cccccc;
        border-radius: 999px;
        background: #f5f5f5;
    }

    .toggle {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        padding: 0.3rem 0.55rem;
        border: 1px solid #cccccc;
        border-radius: 999px;
        background: #ffffff;
        user-select: none;
    }

    .toggle input {
        transform: translateY(0.5px);
    }

    .stage {
        position: relative;
        display: grid;
        grid-template-columns: auto 1fr auto;
        align-items: center;
        gap: 0.75rem;
    }

    .keen-slider {
        border-radius: 16px;
        overflow: hidden;
    }

    .slide {
        padding: 0.5rem;
    }

    .card {
        height: 18rem;
        border-radius: 16px;
        border: 1px solid #cccccc;
        background: #ffffff;
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 1.25rem 1.25rem;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
    }

    .badge {
        display: inline-block;
        align-self: flex-start;
        padding: 0.2rem 0.6rem;
        border-radius: 999px;
        border: 1px solid #e0e0e0;
        background: #f5f5f5;
        color: #555555;
        font-size: 0.85rem;
        margin-bottom: 0.75rem;
    }

    .headline {
        font-size: 1.75rem;
        font-weight: 750;
        margin-bottom: 0.5rem;
        letter-spacing: -0.01em;
    }

    .text {
        color: #666666;
        line-height: 1.4;
        max-width: 42ch;
    }

    .nav {
        width: 2.75rem;
        height: 2.75rem;
        border-radius: 999px;
        border: 1px solid #cccccc;
        background: #ffffff;
        cursor: pointer;
        display: grid;
        place-items: center;
        font-size: 1.6rem;
        line-height: 1;
        box-shadow: 0 6px 14px rgba(0, 0, 0, 0.08);
        transition: transform 120ms ease;
        user-select: none;
    }

    .nav:hover {
        transform: translateY(-1px);
    }

    .nav:disabled {
        opacity: 0.35;
        cursor: default;
        box-shadow: none;
        transform: none;
    }

    .footer {
        margin-top: 0.75rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
    }

    .dots {
        display: inline-flex;
        gap: 0.4rem;
        align-items: center;
    }

    .dot {
        width: 10px;
        height: 10px;
        border-radius: 999px;
        border: 1px solid #cccccc;
        background: #ffffff;
        cursor: pointer;
    }

    .dot--active {
        background: #333333;
        border-color: #333333;
    }

    .speed {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        color: #666666;
    }

    .speed input[type="range"] {
        width: 160px;
    }

    .ms {
        min-width: 64px;
        text-align: right;
        font-variant-numeric: tabular-nums;
    }
</style>
