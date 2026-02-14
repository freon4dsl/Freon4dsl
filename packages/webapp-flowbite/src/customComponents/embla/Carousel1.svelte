<script>
    import useEmblaCarousel from "embla-carousel-svelte";

    let emblaApi;
    let options = { loop: false };

    const goToPrev = () => emblaApi?.scrollPrev();
    const goToNext = () => emblaApi?.scrollNext();

    const onInit = (event) => {
        emblaApi = event.detail;
        console.log("Embla API:", emblaApi);
    };
</script>

<div class="embla">
    <div
        class="embla__viewport"
        use:useEmblaCarousel={{ options }}
        on:emblaInit={onInit}
    >
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
            <button class="embla__button embla__button--prev" type="button" on:click={goToPrev}>
                Prev
            </button>
            <button class="embla__button embla__button--next" type="button" on:click={goToNext}>
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
        border: 0.2rem solid var(--detail-medium-contrast);
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
        grid-template-columns: auto 1fr;
        justify-content: space-between;
        gap: 1.2rem;
        margin-top: 1.8rem;
    }
    .embla__buttons {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 0.6rem;
        align-items: center;
    }
    .embla__button {
        -webkit-tap-highlight-color: rgba(var(--text-high-contrast-rgb-value), 0.5);
        -webkit-appearance: none;
        appearance: none;
        background-color: transparent;
        touch-action: manipulation;
        display: inline-flex;
        text-decoration: none;
        cursor: pointer;
        border: 0;
        padding: 0;
        margin: 0;
        border: 0.2rem solid var(--detail-medium-contrast);
        width: 3.6rem;
        height: 3.6rem;
        z-index: 1;
        border-radius: 50%;
        color: var(--text-body);
        display: flex;
        align-items: center;
        justify-content: center;
        transform: rotate(0deg);
    }
</style>

