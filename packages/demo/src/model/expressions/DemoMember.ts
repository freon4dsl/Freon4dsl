import { observable } from "mobx";
import { DemoModelElement } from "../";
import { model } from "@projectit/model";

export abstract class DemoMember {}

@model
export class DemoAttributeRef extends DemoMember {
  $type: string = "DemoAttributeRef";
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
export class DemoAssociationRef extends DemoMember {
  $type: string = "DemoAssociationRef";
  @observable associationName = " ";
  asString(): string {
    return "//" + this.associationName;
  }
}
