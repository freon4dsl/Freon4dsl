import { OrderedList } from "./OrderedList";
import { PiElement, PiTyper } from "@projectit/core";
import { ProjectXTyper } from "../gen";
import { ProjectXEnvironment } from "../../environment/gen/ProjectXEnvironment";


// algorithm from https://stackoverflow.com/questions/9797212/finding-the-nearest-common-superclass-or-superinterface-of-a-collection-of-cla
// 1. Breath First Search of each class hierarchy going "upwards" - result into OrderedList (preserve order + no duplicates).
// 2. Intersect each set with the next to find anything in common, again OrderedList to preserve order.
// 3. The remaining "ordered" list is the common ancestors, first in list is "nearest", last is furthest.
// 4. Empty list implies no ancestors.

export class CommonSuperTypeUtil {

    public static commonSuperType(inList: PiElement[]): PiElement[] {
        if (!!inList && inList.length > 0) {
            // start with the supers from the first element
            const rollingIntersect: OrderedList<PiElement> = this.getSupers(inList[0]);
            // intersect with the next
            for (let i = 1; i < inList.length; i++) {
                // this.printOrderedList("rollingIntersect at " + i.toString(), rollingIntersect);
                rollingIntersect.retainAll(this.getSupers(inList[i]));
            }
            return rollingIntersect.toArray();
        }
        return [];
    }

    private static printOrderedList(comment: string, rollingIntersect: OrderedList<PiElement>) {
        console.log(comment);
        for (const piClassifier of rollingIntersect) {
            console.log("\t" + piClassifier.constructor.name);
        }
    }

    /**
     * Breath first search for supers of 'inCls'.
     * @param inCls
     * @private
     */
    private static getSupers(inCls: PiElement): OrderedList<PiElement>  {
        const typer: PiTyper = ProjectXEnvironment.getInstance().typer;
        const classes: OrderedList<PiElement> = new OrderedList<PiElement>();
        if (!!inCls) {
            let nextLevel: OrderedList<PiElement> = new OrderedList<PiElement>();
            nextLevel.add(inCls);
            // console.log(nextLevel.getByName(inCls.name)?.name);
            // this.printOrderedList("nextLevel: ", nextLevel );
            while (nextLevel.length() > 0) {
                classes.addAll(nextLevel);
                const thisLevel: OrderedList<PiElement> = new OrderedList<PiElement>();
                thisLevel.addAll(nextLevel);
                nextLevel = new OrderedList<PiElement>();
                for (const elem of thisLevel) {
                    const supers: PiElement[] = (typer as ProjectXTyper).getSupers(elem);
                    for (const super1 of supers) {
                        nextLevel.add(super1);
                    }
                }
            }
        }
        return classes;
    }
}
