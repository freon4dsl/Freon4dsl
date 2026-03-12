/*
 * This files contains all initialization that needs to be done ONCE at the startup of the Freon application
 */
import { LanguageEnvironment } from "@freon4dsl/samples-education";
import { WebappConfigurator } from "$lib/language/WebappConfigurator.js";
import { CoreConfig, ServerCommunication } from "@freon4dsl/core"

import { dev, building } from '$app/environment';

export async function init() {
    // Skip during production builds and outside dev
    if (building || !dev) return

    CoreConfig.initialize(
        LanguageEnvironment.getInstance(),
        ServerCommunication.getInstance()
    )
    WebappConfigurator.getInstance()
}

/**
 * This hook is called by SvelteKit whenever an uncaught error occurs
 * on the client side (for example inside a component, event handler,
 * reactive statement, or load function).
 *
 * We use it mainly during development to log useful debugging information.
 * In production, we keep it quiet.
 */
export function handleError({ error, event }) {
    if (dev) {
        console.group("🔥 Client error detected");

        // The actual error object
        console.error(error);

        // Show which page the error happened on
        if (event?.url) {
            console.info("URL:", event.url.toString());
        }

        // Show stack trace when available
        if (error instanceof Error && error.stack) {
            console.info("Stack trace:");
            console.info(error.stack);
        }

        console.groupEnd();
    }

    /**
     * Returning an object here allows SvelteKit to include the message
     * in its internal error reporting and dev overlay.
     */
    return {
        message: error instanceof Error ? error.message : String(error)
    };
}


/**
 * Global debugging helper
 *
 * This catches Promise rejections that are not handled anywhere
 * in the code (for example failed async calls in event handlers).
 *
 * Without this, these errors can sometimes disappear silently.
 */
if (dev) {
    window.addEventListener("unhandledrejection", (event) => {
        console.error("🔥 Unhandled promise rejection:", event.reason);
    });
}
