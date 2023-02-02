import { OrderedList } from "./OrderedList";
import { FreClassifier, FreConcept, FreInterface } from "../../metalanguage";

// algorithm from https://stackoverflow.com/questions/9797212/finding-the-nearest-common-superclass-or-superinterface-of-a-collection-of-cla
// 1. Breath First Search of each class hierarchy going "upwards" - result into OrderedList (preserve order + no duplicates).
// 2. Intersect each set with the next to find anything in common, again OrderedList to preserve order.
// 3. The remaining "ordered" list is the common ancestors, first in list is "nearest", last is furthest.
// 4. Empty list implies no ancestors.

export class CommonSuperTypeUtil {

    public static commonSuperType(inList: FreClassifier[]): FreClassifier[] {
        if (!!inList && inList.length > 0) {
            // start with the supers from the first element
            const rollingIntersect: OrderedList<FreClassifier> = this.getSupers(inList[0]);
            // intersect with the next
            for (let i = 1; i < inList.length; i++) {
                // this.printOrderedList("rollingIntersect at " + i.toString(), rollingIntersect);
                rollingIntersect.retainAll(this.getSupers(inList[i]));
            }
            return rollingIntersect.toArray();
        }
        return [];
    }

    private static printOrderedList(comment: string, list: OrderedList<FreClassifier>) {
        let result: string = comment;
        for (const FreClassifier of list) {
            result += "\t" + FreClassifier.name;
        }
        console.log(result);
    }

    /**
     * Breath first search for supers of 'inCls'.
     * @param inCls
     * @private
     */
    private static getSupers(inCls: FreClassifier): OrderedList<FreClassifier>  {
        const classes: OrderedList<FreClassifier> = new OrderedList<FreClassifier>();
        if (!!inCls) {
            let nextLevel: OrderedList<FreClassifier> = new OrderedList<FreClassifier>();
            nextLevel.add(inCls.name, inCls);
            // console.log(nextLevel.getByName(inCls.name)?.name);
            // this.printOrderedList("nextLevel: ", nextLevel );
            while (nextLevel.length() > 0) {
                classes.addAll(nextLevel);
                const thisLevel: OrderedList<FreClassifier> = new OrderedList<FreClassifier>();
                thisLevel.addAll(nextLevel);
                nextLevel = new OrderedList<FreClassifier>();
                for (const elem of thisLevel) {
                    if (elem instanceof FreConcept) {
                        if (!!elem.base) {
                            const superClass: FreClassifier = elem.base.referred;
                            nextLevel.add(superClass.name, superClass);
                        }
                        for (const yy of elem.interfaces) {
                            nextLevel.add(yy.name, yy.referred);
                        }
                    }
                    if (elem instanceof FreInterface) {
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
