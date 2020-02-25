import { TestModelCreator } from "./TestModelCreator";
import { DemoModel } from "../language";
import { TestScoper } from "./TestScoper";

export class Tester {

	static testIt() {
		console.log("TESTING TESTING TESTING ...");		
		let model : DemoModel = (new TestModelCreator().model);
		console.log("XXX Working on model " + model.$id);
		let scoperTester : TestScoper = new TestScoper(model);
         
		// TEST for getVisibleElements!!!
		console.log("...	getVisibleElements");
        //scoperTester.TEST_SCOPER_GetVisibleElements();

		// TEST for isInScope!!!
		// console.log("...	isInScope for VAT-number");
        //this.TEST_SCOPER_isInScope("VAT-number"); //TODO

        // TEST for getFromVisibleElements!!!
        //this.TEST_SCOPER_GetFromVisibleElements(); // TODO

        // TEST for getFromVisibleNames!!!
        //this.TEST_SCOPER_GetFromVisibleNames();  //TODO
        
		// TEST for getVisibleTypes!!!
		// Is deze wel zinvol?????
        //this.TEST_SCOPER_getVisibleTypes();  //TODO      
	}
}

Tester.testIt();