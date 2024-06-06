import { FreMetaConcept, FreMetaModelDescription, FreMetaProperty, FreMetaUnitDescription } from "../../metalanguage";

export class ClassifierUtil {
    public static findMobxImportsForConcept(hasSuper: boolean, concept: FreMetaConcept): string[] {
        const mobxImports: string[] = [];
        if (!hasSuper) {
            mobxImports.push("MobxModelElementImpl");
        }
        this.getObserveFunctions(concept.implementedProperties(), mobxImports);
        return mobxImports;
    }

    public static findMobxImports(unit: FreMetaUnitDescription | FreMetaModelDescription): string[] {
        const mobxImports: string[] = [];
        mobxImports.push("MobxModelElementImpl");
        this.getObserveFunctions(unit.allProperties(), mobxImports);
        return mobxImports;
    }

    private static getObserveFunctions(props: FreProperty[], mobxImports: string[]) {
        // todo the class generated from the model concept in (test/demo) imports "observableprim", but
        // its "name" property, which in this case is the only primitive, non-list, property,
        // is not observable. Should the "name" prop be observable, or should we be stricter in the import?
    private static getObserveFunctions(props: FreMetaProperty[], mobxImports: string[]) {
        if (props.some(prop => !prop.isList && prop.isPrimitive)) {
            // for non-list primitive properties include "observableprim"
            mobxImports.push("observableprim");
        }
        if (props.some(prop => prop.isList && prop.isPrimitive)) {
            // for list primitive properties include "observableprimlist"
            mobxImports.push("observableprimlist");
        }
        if (props.some(prop => !prop.isList && !prop.isPrimitive)) {
            // for non-list non-primitive properties include "observablepart"
            mobxImports.push("observablepart");
        }
        if (props.some(prop => prop.isList && !prop.isPrimitive)) {
            // for list properties include "observablepartlist"
            mobxImports.push("observablepartlist");
        }
    }
}
