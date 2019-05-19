import { model, observablereference } from "@projectit/model";
import { DemoModelElement } from "../DemoModel";
import { DemoEntity } from "./DemoEntity";

@model
export class DemoVariable extends DemoModelElement {
  $type: string = "DemoVariable";
  name: string = "";

  @observablereference
  type: DemoEntity;

  constructor() {
    super();
  }

  toString(): string {
    return "variable " + this.name;
  }

  asString(): string {
    return this.toString();
  }

  static create(name: string, type: DemoEntity): DemoVariable {
    const result = new DemoVariable();
    result.name = name;
    result.type = type;
    return result;
  }
}
