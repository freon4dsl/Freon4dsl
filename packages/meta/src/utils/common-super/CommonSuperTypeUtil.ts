import { OrderedList } from "./OrderedList";
import { PiClassifier, PiConcept, PiInterface } from "../../languagedef/metalanguage";

// algorithm from https://stackoverflow.com/questions/9797212/finding-the-nearest-common-superclass-or-superinterface-of-a-collection-of-cla
// 1. Breath First Search of each class hierarchy going "upwards" - result into OrderedList (preserve order + no duplicates).
// 2. Intersect each set with the next to find anything in common, again OrderedList to preserve order.
// 3. The remaining "ordered" list is the common ancestors, first in list is "nearest", last is furthest.
// 4. Empty list implies no ancestors.

export class CommonSuperTypeUtil {

    public static commonSuperType(inList: PiClassifier[]): PiClassifier[] {
        if (!!inList && inList.length > 0) {
            // start with the supers from the first element
            const rollingIntersect: OrderedList<PiClassifier> = this.getSupers(inList[0]);
            // intersect with the next
            for (let i = 1; i < inList.length; i++) {
                // this.printOrderedList("rollingIntersect at " + i.toString(), rollingIntersect);
                rollingIntersect.retainAll(this.getSupers(inList[i]));
            }
            return rollingIntersect.toArray();
        }
        return [];
    }

    private static printOrderedList(comment: string, rollingIntersect: OrderedList<PiClassifier>) {
        console.log(comment);
        for (const piClassifier of rollingIntersect) {
            console.log("\t" + piClassifier.name);
        }
    }

    /**
     * Breath first search for supers of 'inCls'.
     * @param inCls
     * @private
     */
    private static getSupers(inCls: PiClassifier): OrderedList<PiClassifier>  {
        const classes: OrderedList<PiClassifier> = new OrderedList<PiClassifier>();
        if (!!inCls) {
            let nextLevel: OrderedList<PiClassifier> = new OrderedList<PiClassifier>();
            nextLevel.add(inCls.name, inCls);
            // console.log(nextLevel.getByName(inCls.name)?.name);
            // this.printOrderedList("nextLevel: ", nextLevel );
            while (nextLevel.length() > 0) {
                classes.addAll(nextLevel);
                const thisLevel: OrderedList<PiClassifier> = new OrderedList<PiClassifier>();
                thisLevel.addAll(nextLevel);
                nextLevel = new OrderedList<PiClassifier>();
                for (const elem of thisLevel) {
                    if (elem instanceof PiConcept) {
                        if (!!elem.base) {
                            const superClass: PiClassifier = elem.base.referred;
                            nextLevel.add(superClass.name, superClass);
                        }
                        for (const yy of elem.interfaces) {
                            nextLevel.add(yy.name, yy.referred);
                        }
                    }
                    if (elem instanceof PiInterface) {
                        elem.base.forEach(b => {
                            nextLevel.add(b.name, b.referred);
                        });
                    }
                }
            }
        }
        return classes;
    }
}
