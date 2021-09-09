import { AbsExpression, AndExpression, ExampleEveryConcept, ExExpression, GroupedExpression } from "../language/gen";
import { ExampleWalker } from "../utils/gen";
import { ExampleRefCorrectorWalker } from "./ExampleRefCorrectorWalker";
import { PiElement } from "@projectit/core";

export class ExampleRefCorrector {

    public correct(modelunit: ExampleEveryConcept) {
        let changesToBeMade: Map<PiElement, ExampleEveryConcept> = new Map<PiElement, ExampleEveryConcept>();
        // create the walker over the model tree
        const myWalker = new ExampleWalker();

        // create the object that will find what needs ot be changed
        let myCorrector = new ExampleRefCorrectorWalker(changesToBeMade);

        // and add the corrector to the walker
        myWalker.myWorkers.push(myCorrector);

        // do the work
        myWalker.walk(modelunit, () => {
            return true;
        });

        // now change all ref errors
        for (const [toBeReplaced, newObject] of changesToBeMade) {
            let parent: PiElement = toBeReplaced.piContainer().container;
            console.log(`found to replace ${toBeReplaced.piLanguageConcept()}: ${newObject.piLanguageConcept()}`);
            if (parent instanceof AbsExpression) {
                parent.expr = newObject as ExExpression;
            } else if (parent instanceof GroupedExpression) {
                parent.inner = newObject as ExExpression;
            } else if (parent instanceof AndExpression) {
                if (toBeReplaced.piContainer().propertyName === "left") {
                    parent.left = newObject as ExExpression;
                } else if (toBeReplaced.piContainer().propertyName === "right") {
                    parent.right = newObject as ExExpression;
                }
            }

        }
    }
}
