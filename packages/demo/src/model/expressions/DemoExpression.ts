import * as uuid from "uuid";

import { DemoModelElement } from "../DemoModel";

export abstract class DemoExpression extends DemoModelElement {
  $type: string;

  constructor() {
    super();
  }

  toString(): string {
    return "DemoExpression";
  }

  children(): DemoExpression[] | null {
    return [];
  }

  get name(): string {
    return this.toString();
  }

  identity(): string {
    console.log("Id is " + this.$id);
    return this.$id;
  }

  asString(): string {
    return this.toString();
  }
}
