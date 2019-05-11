import { observable } from "mobx";
import { model } from "@projectit/model";
import { DemoExpression } from "./DemoExpression";

@model
export class DemoThisExpression extends DemoExpression {
  $type: string = "DemoThisExpression";
  @observable name: string = "this";

  toString(): string {
    return this.name;
  }

  children(): DemoExpression[] {
    return [];
  }
}
