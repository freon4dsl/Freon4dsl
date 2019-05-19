import { observable } from "mobx";
import { model } from "@projectit/model";
import { DemoLiteralExpression } from "./DemoLiteralExpression";

@model
export class DemoStringLiteralExpression extends DemoLiteralExpression {
  $type: string = "DemoStringLiteralExpression";
  @observable public value: string = "";

  constructor() {
    super();
  }

  toString(): string {
    return this.asString();
  }

  asString(): string {
    return '"' + this.value + '"';
  }

  static create(value: string): DemoStringLiteralExpression {
    const result = new DemoStringLiteralExpression();
    result.value = value;
    return result;
  }
}
