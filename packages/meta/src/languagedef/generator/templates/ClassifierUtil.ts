import { FreConcept, FreModelDescription, FreProperty, FreUnitDescription } from "../../metalanguage";

export class ClassifierUtil {
    public static findMobxImportsForConcept(hasSuper: boolean, concept: FreConcept): string[] {
        const mobxImports: string[] = [];
        if (!hasSuper) {
            mobxImports.push("MobxModelElementImpl");
        }
        this.getObserveFunctions(concept.implementedProperties(), mobxImports);
        return mobxImports;
    }

    public static findMobxImports(unit: FreUnitDescription | FreModelDescription): string[] {
        const mobxImports: string[] = [];
        mobxImports.push("MobxModelElementImpl");
        this.getObserveFunctions(unit.allProperties(), mobxImports);
        return mobxImports;
    }

    private static getObserveFunctions(props: FreProperty[], mobxImports: string[]) {
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
