<script lang="ts">
    let isDark = $state(false)

    function getPreferredMode(): 'dark' | 'light' {
        if (typeof window === 'undefined') return 'light'

        const saved = localStorage.getItem('color-theme')
        if (saved === 'dark' || saved === 'light') return saved

        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }

    function applyMode(mode: 'dark' | 'light') {
        if (typeof document === 'undefined') return

        isDark = mode === 'dark'
        document.documentElement.classList.toggle('dark', isDark)
        localStorage.setItem('color-theme', mode)
    }

    function toggleMode() {
        applyMode(isDark ? 'light' : 'dark')
    }

    $effect(() => {
        if (typeof window === 'undefined') return

        applyMode(getPreferredMode())

        const media = window.matchMedia('(prefers-color-scheme: dark)')

        const handleChange = (event: MediaQueryListEvent) => {
            const saved = localStorage.getItem('color-theme')
            if (saved === 'dark' || saved === 'light') return

            applyMode(event.matches ? 'dark' : 'light')
        }

        media.addEventListener('change', handleChange)

        return () => {
            media.removeEventListener('change', handleChange)
        }
    })
</script>

<button
    id="dark-mode-button"
    tabindex={-1}
    type="button"
    class="freon-btn text-sm leading-5 flex items-center justify-center rounded-none first:rounded-s-lg last:rounded-e-lg focus:z-10 focus:ring-2"
    onclick={toggleMode}
    aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
>
    {#if isDark}
        <!-- sun -->
        <svg class="freon-navbar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2" />
            <path d="M12 20v2" />
            <path d="m4.93 4.93 1.41 1.41" />
            <path d="m17.66 17.66 1.41 1.41" />
            <path d="M2 12h2" />
            <path d="M20 12h2" />
            <path d="m6.34 17.66-1.41 1.41" />
            <path d="m19.07 4.93-1.41 1.41" />
        </svg>
    {:else}
        <!-- moon -->
        <svg class="freon-navbar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3A7 7 0 0 0 21 12.79z" />
        </svg>
    {/if}
</button>
