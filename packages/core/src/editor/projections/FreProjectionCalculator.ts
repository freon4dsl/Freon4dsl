import { FreProjectionHandler } from "./FreProjectionHandler";

/**
 * Contains all logic to determine which projection should be used by a BoxProvider for a certain concept.
 */
export class FreProjectionCalculator {
    public static findProjectionToUse(
        mainHandler: FreProjectionHandler,
        conceptName: string,
        knownProjections: string[],
        mustUseTable: boolean,
    ): string {
        let projToUse: string;
        if (mustUseTable) {
            projToUse = this.findTableProjectionToUse(mainHandler, conceptName, knownProjections);
        } else {
            projToUse = this.findBoxProjectionToUse(mainHandler, conceptName, knownProjections);
        }
        return projToUse;
    }

    /**
     * Method used to determine which projection to use for getting the table definition for
     * this type of concept.
     * @protected
     */
    private static findTableProjectionToUse(
        mainHandler: FreProjectionHandler,
        conceptName: string,
        knownTableProjections: string[],
    ): string {
        let projToUse: string = null;
        mainHandler.customProjections.forEach((cp) => {
            // get the name of the first of the customs that fits
            // todo see whether we should loop backwards as in the enabledProjections
            if (projToUse === null && !!cp.nodeTypeToTableDefinition.get(conceptName)) {
                projToUse = cp.name;
            }
        });
        // Second, from the list of projections that are enabled, select the first one that is available for this type of Freon node.
        if (projToUse === null) {
            // Loop through the projections backwards, because the last one takes precedence.
            const enabledProjections = mainHandler.enabledProjections();
            for (let i = enabledProjections.length - 1; i >= 0; i--) {
                const proj = FreProjectionCalculator.transformToTableProjectionName(enabledProjections[i]);
                // get the name of the first of the generated projections that fits
                if (knownTableProjections.includes(proj)) {
                    projToUse = proj;
                    break;
                }
            }
            // } else {
            //     console.log('found custom table projection ' + projToUse + ' for ' + this.conceptName);
        }
        if (projToUse === null) {
            // Still nothing found, use the default.
            projToUse = FreProjectionCalculator.transformToTableProjectionName("default");
            // } else {
            //     console.log("found generated table projection " + projToUse + " for " + this.conceptName + " from " + this.knownTableProjections);
        }
        return projToUse;
    }

    private static transformToTableProjectionName(projToUse: string) {
        // todo remove this hack, when all projectiongroups have one projection per concept
        return "tableRowFor_" + projToUse;
    }

    /**
     * Determines which non-table projection to use for this type of concept.
     * @param mainHandler
     * @param conceptName
     * @param knownBoxProjections
     * @private
     */
    private static findBoxProjectionToUse(
        mainHandler: FreProjectionHandler,
        conceptName: string,
        knownBoxProjections: string[],
    ): string {
        // See if we need to use a custom projection.
        let projToUse: string = null;
        const enabledProjections = mainHandler.enabledProjections();
        for (const cp of mainHandler.customProjections) {
            // get the name of the first of the customs that fits
            // todo see whether we should loop backwards as in the enabledProjections
            if (
                projToUse === null &&
                enabledProjections.includes(cp.name) &&
                !!cp.nodeTypeToBoxMethod.get(conceptName)
            ) {
                projToUse = cp.name;
            }
        }
        // From the list of projections that are enabled, select the first one that is available for this type of Freon node.
        if (projToUse === null) {
            // Loop through the projections backwards, because the last one takes precedence.
            for (let i = enabledProjections.length - 1; i >= 0; i--) {
                const proj = enabledProjections[i];
                // get the name of the first of the generated projections that fits
                if (knownBoxProjections.includes(proj)) {
                    projToUse = proj;
                    break;
                }
            }
        }
        if (projToUse === null) {
            // still nothing found, then use the default
            projToUse = "default";
        }
        return projToUse;
    }
}
