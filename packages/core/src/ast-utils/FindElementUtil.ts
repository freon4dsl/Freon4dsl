import { PiElement, PiModel } from "../ast";
import { AstWalker } from "./AstWalker";
import { FindElementByIdWorker } from "./FindElementByIdWorker";

// TODO does not seems to be used, remove?
export class FindElementUtil {

    public static findElementById(model: PiElement, id: string): PiElement {
        // set up the 'worker' of the visitor pattern
        const myFinder = new FindElementByIdWorker(id);

        // set up the 'walker of the visitor pattern
        // const myWalker = new ExampleWalker();
        const myWalker = new AstWalker();
        myWalker.myWorkers.push(myFinder);

        myWalker.walk(model, (elem: PiElement) => myFinder.found === null);
        // console.log(`FOUND: ${myFinder.found.piId()}`)
        return myFinder.found;
    }
}
