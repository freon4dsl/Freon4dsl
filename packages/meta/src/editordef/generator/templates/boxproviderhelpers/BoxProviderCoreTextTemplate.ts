import { Names } from '../../../../utils/on-lang/index.js';
import { NamesForEditor } from '../../../../utils/on-lang-and-editor/index.js';
import type { FreMetaClassifier } from "../../../../languagedef/metalanguage/index.js";
import type { FreEditClassifierProjection, FreEditTableProjection } from "../../../metalanguage/index.js";

export class BoxProviderCoreTextTemplate {
    public generateCoreTemplate(
        myBoxProjections: FreEditClassifierProjection[],
        myTableProjections: FreEditTableProjection[],
        allProjections: FreEditClassifierProjection[],
        concept: FreMetaClassifier,
    ): string {
        return `
                constructor(mainHandler: FreProjectionHandler) {
                    super(mainHandler);
                    this.knownBoxProjections = [${myBoxProjections.length > 0 ? myBoxProjections.map((p) => `"${p.name}"`) : `"default"`}];
                    this.knownTableProjections = [${myTableProjections.length > 0 ? myTableProjections.map((p) => `"${p.name}"`) : `"default"`}];
                    this.conceptName = '${Names.classifier(concept)}';
                }

                protected getContent(projectionName: string): Box {
                // console.log("GET CONTENT " + this._node?.freId() + ' ' +  this._node?.freLanguageConcept() + ' ' + projectionName);
                    // see if we need to use a custom projection
                    if (!this.knownBoxProjections.includes(projectionName) && !this.knownTableProjections.includes(projectionName)) {
                        const BOX: Box = this.mainHandler.executeCustomProjection(this._node, projectionName);
                        if (!!BOX) { // found one, so return it
                            return BOX;
                        }
                    ${
                        allProjections.length > 0
                            ? `} else { // select the box to return based on the projectionName
                            ${allProjections
                                .map(
                                    (proj) => `if (projectionName === '${proj.name}') {
                                return this.${NamesForEditor.projectionMethod(proj)}();
                            }`,
                                )
                                .join(" else ")}
                            }
                            // in all other cases, return the default`
                            : `}`
                    }
                    return this.getDefault();
                }`;
    }
}
