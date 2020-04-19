import { DemoModelCreator } from "../__tests__/DemoModelCreator";
import { DemoModel } from "../language/gen";

export class DemoInitialization {

    initialize(): DemoModel {
        return new DemoModelCreator().createCorrectModel();
    }
}
