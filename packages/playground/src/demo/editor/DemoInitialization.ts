import { DemoModelCreator } from "../_tests_/DemoModelCreator";
import { DemoModel } from "../language";

export class DemoInitialization {

    initialize(): DemoModel {
        return new DemoModelCreator().model;
    }
}
