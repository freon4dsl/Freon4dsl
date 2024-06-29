## Creating custom projections

### Problem: adding custom content that requires the handler

As shown below. I created the custom projection for period, that has events inside it. The events use the function *verticalPartListBox* that requires the handler. The projection doesn't have the handler, so this code doesn't work.

#### CustomStudyConfigurationModelProjection.ts

    export class CustomStudyConfigurationModelProjection implements FreProjection {
        name: string = "Manual";

        nodeTypeToBoxMethod: Map<string, (node: FreNode) => Box> = new Map<string, (node: FreNode) => Box>([
            ["Description", this.createDescription],
            ["Period", this.createPeriod],
            ["Event", this.createEvent],
        ]);

        createPeriod (period: Period): Box {
            return BoxFactory.verticalLayout(period, "Period-overall", "", [
                BoxFactory.horizontalLayout(
                    period,
                    "Period-hlist-line-0",
                    "",
                    [
                        BoxUtil.labelBox(period, "Period2:", "top-1-line-0-item-1"),
                        BoxUtil.textBox(period, "name")
                        
                    ],
                    { selectable: false }
                ),
                BoxUtil.emptyLineBox(period, "Period-empty-line-1"),
                BoxUtil.labelBox(period, "EVENTS2", "top-1-line-2-item-0"),
                BoxUtil.indentBox(
                    period,
                    4,
                    "4",
                    BoxUtil.verticalPartListBox(period, period.events, "events", null, this.handler)
                ),
                BoxUtil.emptyLineBox(period, "Period-empty-line-5")
            ]);
        }
    }


### FIX: Pass the handler to the custom projection

#### CustomStudyConfigurationModelProjection.ts

Add handler property

    export class CustomStudyConfigurationModelProjection implements FreProjection {
        name: string = "Manual";
        handler: FreProjectionHandler; <--------------------------------------------------------------

        nodeTypeToBoxMethod: Map<string, (node: FreNode) => Box> = new Map<string, (node: FreNode) => Box>([
            ["Description", this.createDescription],
            ["Period", this.createPeriod],
            ["Event", this.createEvent],
        ]);

#### FreProjection.ts

Add handler to interface

    export interface FreProjection {
        // todo add priority

        // Name of the custom projection
        name: string;

        handler: FreProjectionHandler; <--------------------------------------------------------------

        // A map from the name of the concept (or the freLanguageConcept() of the FreElement node) to
        // the function that may return the custom box for a node of that type.
        nodeTypeToBoxMethod: Map<string, (node: FreNode) => Box>;

        // A map from the name of the concept (or the freLanguageConcept() of the FreElement node) to
        // the function that may return the custom box for a node of that type.
        nodeTypeToTableDefinition: Map<string, () => FreTableDefinition>; // todo change name and remove Tabledefinition type
    }

#### EditorDef.ts

Pass handler to custom projection

    export function initializeProjections(handler: FreProjectionHandler) {
        handler.addProjection("Brackets");

        for (const p of freonConfiguration.customProjection) {
            p.handler = handler;    <--------------------------------------------------------------
            handler.addCustomProjection(p);
        }

#### EditorDefTemplate.ts

Set into the template, so as not to loose EditorDef.ts changes

    export function initializeProjections(${handlerVarName}: FreProjectionHandler) {
        ${hasBinExps ? `${handlerVarName}.addProjection("${Names.brackets}");`
        : ``
        }
        ${editorDef.getAllNonDefaultProjectiongroups().map(group =>
            `${handlerVarName}.addProjection("${Names.projection(group)}")`
        ).join(";\n")}
        for (const p of freonConfiguration.customProjection) {
            p.handler = ${handlerVarName};  <--------------------------------------------------------------
            ${handlerVarName}.addCustomProjection(p);
        }