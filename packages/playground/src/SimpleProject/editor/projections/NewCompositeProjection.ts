import { BoxProvider } from "./BoxProvider";
import { SimplePart_BoxProvider } from "./SimplePart_BoxProvider";
import { SimplePart } from "../../language/gen";
import { Box, isNullOrUndefined, LabelBox, PiCompositeProjection, PiElement } from "@projectit/core";
import { ConceptA_BoxProvider } from "./ConceptA_BoxProvider";
import { ConceptB_BoxProvider } from "./ConceptB_BoxProvider";
import { ConceptD_BoxProvider } from "./ConceptD_BoxProvider";
import { ConceptE_BoxProvider } from "./ConceptE_BoxProvider";

export class NewCompositeProjection extends PiCompositeProjection {
    private static elementToProjection: Map<string, BoxProvider> = new Map<string, BoxProvider>();
    private static conceptNameToProjectionConstructor: Map<string, () => BoxProvider> = new Map<string, () => BoxProvider>(
    [
        ["SimplePart", () => { return new SimplePart_BoxProvider() }],
        ["ConceptA", () => { return new ConceptA_BoxProvider() }],
        ["ConceptB", () => { return new ConceptB_BoxProvider() }],
        ["ConceptD", () => { return new ConceptD_BoxProvider() }],
        ["ConceptE", () => { return new ConceptE_BoxProvider() }],
    ]);

    static addConceptProjection(elementId: string, provider: BoxProvider) {
        NewCompositeProjection.elementToProjection.set(elementId, provider);
    }

    static getConceptProjection(element: PiElement): BoxProvider {

        // let boxType: string = element.piLanguageConcept();
        // if (!!nameOfSuper && nameOfSuper.length > 0) {
        //     if (!this.rootProjection.checkSuper(nameOfSuper, element.piLanguageConcept())) {
        //         throw new Error(
        //             `A box requested for '${nameOfSuper}', which is not a super class or interface of '${element.piLanguageConcept()}'`
        //         );
        //     } else {
        //         boxType = nameOfSuper;
        //     }
        // }

        // try {
            if (isNullOrUndefined(element)) {
                throw Error('NewCompositeProjection.getConceptProjection: element is null/undefined');
            }
        // } catch (e) {
        //     console.log(e.stack);
        //     return null;
        // }

        // return if present, else create a new provider based on the language concept
        let result = NewCompositeProjection.elementToProjection.get(element.piId());
        if (!!result) {
            return result;
        } else {
            const boxProvider = NewCompositeProjection.conceptNameToProjectionConstructor.get(element.piLanguageConcept())();
            NewCompositeProjection.elementToProjection.set(element.piId(), boxProvider);
            boxProvider.element = element;
            return boxProvider;
        }

    }

    static getProjectionNames(): string[] {
        return ['default'];
    }

    // the following overrides the same stuff as there is in the 'old' CompositeProjection
    private _myRootProjection: BoxProvider | null = null;
    set rootProjection(p: PiCompositeProjection) {
        // for now, we completely ignore the parameter, but simply set our own root projection
        this._myRootProjection = NewCompositeProjection.conceptNameToProjectionConstructor.get('SimplePart')();
    }

    getBox(element: PiElement): Box {
        try {
            if (isNullOrUndefined(element)) {
                throw Error('NewCompositeProjection.getBox: element is null/undefined');
            }
        } catch (e) {
            console.log(e.stack);
            return null;
        }
        console.log('NewCompositeProjection getBox ' + element?.piId() + ", root projection: " + this._myRootProjection.constructor.name)
        if (!!this._myRootProjection && !!element) {
            // todo check type of rootProjection against type of element
            this._myRootProjection.element = element;
            const BOX = this._myRootProjection.box;
            console.log('BOX: ' + BOX.role + ' for ' + BOX.element.piId());
            return BOX;
        }
        // return a default box if nothing has been  found.
        return new LabelBox(element, "unknown-projection", () => "unknown box for " + element);
    }
}
