// Generated by the ProjectIt Language Generator.
import { PiProjection, PiCompositeProjection, PiElement, Box, PiTableDefinition, BoxFactory, BoxUtils } from "@projectit/core";
import { ExpWithType, GenericType, NamedType, PiElementReference, PredefinedType, TopType, UnitOfMeasurement } from "../language/gen";
import { ProjectXEnvironment } from "../environment/gen/ProjectXEnvironment";
import exp from "constants";

/**
 * Class CustomProjectXProjection provides an entry point for the language engineer to
 * define custom build additions to the editor.
 * These are merged with the custom build additions and other definition-based editor parts
 * in a three-way manner. For each modelelement,
 * (1) if a custom build creator/behavior is present, this is used,
 * (2) if a creator/behavior based on one of the editor definition is present, this is used,
 * (3) if neither (1) nor (2) yields a result, the default is used.
 */
export class CustomProjectXProjection implements PiProjection {
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
        if (!!element && element.piLanguageConcept() === "ExpWithType") {
            return this.getExpWithTypeBox(element as ExpWithType);
        }
        return null;
    }

    getTableDefinition(conceptName: string): PiTableDefinition {
        // Add any handmade table cells of your own before next statement
        return null;
    }

    public getExpWithTypeBox(expwithtype: ExpWithType): Box {
        const innerBox: Box = this.getTypeBox(expwithtype, expwithtype.$type);
        return BoxFactory.horizontalList(
            expwithtype,
            "ExpWithType-hlist-line-0",
            [
                BoxUtils.getBoxOrAlias(expwithtype, "expr", "Exp", this.rootProjection),
                BoxUtils.labelBox(expwithtype, ":", "top-1-line-0-item-1"),
                innerBox
            ],
            { selectable: true }
        );
    }

    private getTypeBox(expwithtype: ExpWithType, type: TopType): Box {
        let innerBox: Box;
        const sortofType: string = type.piLanguageConcept();
        switch (sortofType) {
            case "PredefinedType": {
                console.log("PredefinedType: " + (type as PredefinedType).name);
                innerBox = this.namedTypeReference(expwithtype, type as PredefinedType);
                break;
            }
            case "NamedTyped": {
                console.log("NamedTyped: " + (type as NamedType).name);
                innerBox = this.namedTypeReference(expwithtype, type as NamedType);
                break;
            }
            case "GenericType": {
                console.log("GenericType: " + this.printType(type));
                // should be as follows, but problem with recursion:
                // innerBox = this.genericTypeReference(expwithtype, type as GenericType);
                innerBox = this.namedTypeReference(expwithtype, type as GenericType);
                break;
            }
            case "UnitOfMeasurement": {
                console.log("UnitOfMeasurement: " + this.printType(type));
                innerBox = this.measurementReference(expwithtype, type as UnitOfMeasurement);
                break;
            }
        }
        return innerBox;
    }

    private namedTypeReference(expwithtype: ExpWithType, myType: NamedType) {
        return BoxUtils.labelBox(expwithtype, this.printType(myType), "top-1-line-0-item-3");
        // return BoxUtils.referenceBox(
        //             expwithtype,
        //             "type",
        //             (selected: string) => {
        //                 expwithtype.type = PiElementReference.create<TopType>(
        //                     ProjectXEnvironment.getInstance().scoper.getFromVisibleElements(expwithtype, selected, "TopType") as TopType,
        //                     "TopType"
        //                 );
        //             },
        //             ProjectXEnvironment.getInstance().scoper
        //         );
    }

    private genericTypeReference(expwithtype: ExpWithType, myType: GenericType): Box {
        if (!!myType.$baseType) {
            const inner = this.getTypeBox(expwithtype, myType.$baseType);
            // TODO inner should be included be results in "InternalError: too much recursion"
            // RenderComponent > ListComponent > SelectableComponent > RenderComponent (create_each_block$3)
            return BoxFactory.horizontalList(
                expwithtype,
                "ExpWithType-type-hlist-line-0",
                [BoxUtils.labelBox(expwithtype, myType.$kind.name, "top-1-line-0-item-2"),
                    BoxUtils.labelBox(expwithtype, "<", "top-1-line-0-item-3"),
                    // inner,
                    BoxUtils.labelBox(expwithtype, ">", "top-1-line-0-item-4")],
                { selectable: true }
            );
        }
        return BoxFactory.horizontalList(
            expwithtype,
            "ExpWithType-type-hlist-line-0",
            [BoxUtils.labelBox(expwithtype, myType.$kind.name, "top-1-line-0-item-2"),
                BoxUtils.labelBox(expwithtype, "<", "top-1-line-0-item-3"),
                BoxUtils.labelBox(expwithtype, ">", "top-1-line-0-item-4")],
            { selectable: true }
        );
    }

    private measurementReference(expwithtype: ExpWithType, myType: UnitOfMeasurement): Box {
        return BoxFactory.horizontalList(
            expwithtype,
            "ExpWithType-type-hlist-line-0",
            [BoxUtils.labelBox(expwithtype, myType.$unit.name, "top-1-line-0-item-2"),
                BoxUtils.labelBox(expwithtype, "<", "top-1-line-0-item-3"),
                this.getTypeBox(expwithtype, myType.$baseType),
                BoxUtils.labelBox(expwithtype, ">", "top-1-line-0-item-3")],
            { selectable: true }
        );
    }

    private printType(element: TopType): string {
        if (element.piLanguageConcept() === "GenericType") {
            return (element as GenericType).kind.name + "<" + this.printType((element as GenericType).$baseType) + ">";
        } else if (element.piLanguageConcept() === "UnitOfMeasurement") {
            return (element as UnitOfMeasurement).unit.name + "<" + this.printType((element as UnitOfMeasurement).$baseType) + ">";
        } else {
            return element.name;
        }
    }
}
