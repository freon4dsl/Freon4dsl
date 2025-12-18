import type {
    FreMetaConcept,
    FreMetaModelDescription,
    FreMetaProperty,
    FreMetaUnitDescription,
} from "../../metalanguage/index.js";

export class ClassifierUtil {
    public static findMobxImportsForConcept(hasSuper: boolean, concept: FreMetaConcept | FreMetaUnitDescription): Set<string> {
        const mobxImports: Set<string> = new Set<string>();
        if (!hasSuper) {
            mobxImports.add("MobxModelElementImpl");
        }
        this.getObserveFunctions(concept.implementedProperties(), mobxImports);
        return mobxImports;
    }

    public static findMobxImports(unit: FreMetaUnitDescription | FreMetaModelDescription): Set<string> {
        const mobxImports:  Set<string> = new Set<string>(["MobxModelElementImpl"]);
        this.getObserveFunctions(unit.allProperties(), mobxImports);
        return mobxImports;
    }

    private static getObserveFunctions(props: FreMetaProperty[], mobxImports: Set<string>) {
        // todo the class generated from the model concept in (test/demo) imports "observableprim", but
        //      its "name" property, which in this case is the only primitive, non-list, property,
        //      is not observable. Should the "name" prop be observable, or should we be stricter in the import?
        if (props.some((prop) => !prop.isList && prop.isPrimitive)) {
            // for non-list primitive properties include "observableprim"
            mobxImports.add("observableprim");
        }
        if (props.some((prop) => prop.isList && prop.isPrimitive)) {
            // for list primitive properties include "observableprimlist"
            mobxImports.add("observableprimlist");
        }
        if (props.some((prop) => !prop.isList && !prop.isPrimitive)) {
            // for non-list non-primitive properties include "observablepart"
            mobxImports.add("observablepart");
        }
        if (props.some((prop) => prop.isList && !prop.isPrimitive)) {
            // for list properties include "observablepartlist"
            mobxImports.add("observablepartlist");
        }
    }
}
