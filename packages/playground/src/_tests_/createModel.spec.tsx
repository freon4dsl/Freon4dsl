import { DemoModel } from "language";
import { TestModelCreator } from "./TestModelCreator";
import { TestScoper } from "./TestScoper";


test('Create DemoModel Instance ', () => {
  console.log("TESTING TESTING TESTING ...");		
  let model : DemoModel = (new TestModelCreator().model);
  console.log("XXX Working on model " + model.$id);
  let scoperTester : TestScoper = new TestScoper(model);
});
