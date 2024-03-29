// Generated by the ProjectIt Language Generator.
import { PiProjection, PiCompositeProjection, PiElement, Box, PiTableDefinition } from "@freon4dsl/core";

/**
 * Class CustomRulesLanguageProjection provides an entry point for the language engineer to
 * define custom build additions to the editor.
 * These are merged with the custom build additions and other definition-based editor parts
 * in a three-way manner. For each modelelement,
 * (1) if a custom build creator/behavior is present, this is used,
 * (2) if a creator/behavior based on one of the editor definition is present, this is used,
 * (3) if neither (1) nor (2) yields a result, the default is used.
 */
export class CustomRulesLanguageProjection implements PiProjection {
    rootProjection: PiCompositeProjection;
    name: string = "manual";
    isEnabled: boolean = true;

    constructor(name?: string) {
        if (!!name) {
            this.name = name;
        }
    }

    getBox(element: PiElement): Box {
        // Add any handmade projections of your own before next statement
        return null;
    }

    getTableDefinition(conceptName: string): PiTableDefinition {
        // Add any handmade table cells of your own before next statement
        return null;
    }
}
