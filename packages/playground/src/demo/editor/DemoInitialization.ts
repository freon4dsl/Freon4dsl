import { DemoModelCreator } from "../__tests__/DemoModelCreator";
import { DemoModel } from "../language";

export class DemoInitialization {

    initialize(): DemoModel {
        return new DemoModelCreator().model;
    }
}
