/// <reference types="svelte" />

declare namespace svelteHTML {
    interface HTMLAttributes<T> {
        onemblainit?: (event: CustomEvent<any>) => void
        "on:emblainit"?: (event: CustomEvent<any>) => void
    }
}
