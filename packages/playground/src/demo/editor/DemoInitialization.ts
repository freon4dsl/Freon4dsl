import { PiElement, PiModelInitialization } from "@projectit/core";
import { DemoModelCreator } from "../__tests__/DemoModelCreator";
import { DemoModel } from "../language/gen";


export class DemoInitialization implements PiModelInitialization {
    initialize(): PiElement {
        return new DemoModelCreator().createCorrectModel();
    }
}
