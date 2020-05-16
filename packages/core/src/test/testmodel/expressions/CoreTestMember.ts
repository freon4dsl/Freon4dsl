import { observable } from "mobx";
import { CoreTestModelElement } from "../index";
import { model } from "../../../language";

export abstract class CoreTestMember {}

@model
export class CoreTestAttributeRef extends CoreTestMember {
    $typename: string = "CoreTestAttributeRef";
    @observable attributeName = " ";

    constructor() {
        super();
        this.getName = this.getName.bind(this);
    }

    getName() {
        return this.attributeName;
    }

    asString(): string {
        return "/" + this.attributeName;
    }
}

@model
export class CoreTestAssociationRef extends CoreTestMember {
    $typename: string = "CoreTestAssociationRef";
    @observable associationName = " ";
    asString(): string {
        return "//" + this.associationName;
    }
}
