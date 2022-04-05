import { OrderedList } from "./OrderedList";
import { ProjectXTyper } from "../gen";
import { ProjectXEnvironment } from "../../environment/gen/ProjectXEnvironment";
import { PiType } from "@projectit/core";
// import { TypeRef } from "../../language/gen";


// algorithm from https://stackoverflow.com/questions/9797212/finding-the-nearest-common-superclass-or-superinterface-of-a-collection-of-cla
// 1. Breath First Search of each class hierarchy going "upwards" - result into OrderedList (preserve order + no duplicates).
// 2. Intersect each set with the next to find anything in common, again OrderedList to preserve order.
// 3. The remaining "ordered" list is the common ancestors, first in list is "nearest", last is furthest.
// 4. Empty list implies no ancestors.

export class CommonSuperTypeUtil {

    public static commonSuperType(inList: PiType[]): PiType[] {
        if (!!inList && inList.length > 0) {
            // start with the supers from the first element
            const rollingIntersect: OrderedList<PiType> = this.getSupers(inList[0]);
            // intersect with the next
            for (let i = 1; i < inList.length; i++) {
                // this.printOrderedList("rollingIntersect at " + i.toString(), rollingIntersect);
                rollingIntersect.retainAll(this.getSupers(inList[i]));
            }
            return rollingIntersect.toArray();
        }
        return [];
    }

    // private static printOrderedList(comment: string, rollingIntersect: OrderedList<PiType>) {
    //     let result: string = '';
    //     result += comment;
    //     for (const piClassifier of rollingIntersect) {
    //         if (piClassifier.internal instanceof TypeRef) {
    //             result += "\t" + piClassifier.internal.$type.name
    //         } else {
    //             result += "\t" + piClassifier.internal.constructor.name;
    //         }
    //     }
    //     console.log(result);
    // }

    /**
     * Breath first search for supers of 'inCls'.
     * @param inCls
     * @private
     */
    private static getSupers(inCls: PiType): OrderedList<PiType>  {
        const typer: ProjectXTyper = new ProjectXTyper();
        const classes: OrderedList<PiType> = new OrderedList<PiType>();
        const writer = ProjectXEnvironment.getInstance().writer;
        if (!!inCls) {
            let nextLevel: OrderedList<PiType> = new OrderedList<PiType>();
            nextLevel.add(inCls);
            // this.printOrderedList("nextLevel: ", nextLevel );
            while (nextLevel.length() > 0) {
                classes.addAll(nextLevel);
                const thisLevel: OrderedList<PiType> = new OrderedList<PiType>();
                thisLevel.addAll(nextLevel);
                nextLevel = new OrderedList<PiType>();
                for (const elem of thisLevel) {
                    const supers: PiType[] = (typer as ProjectXTyper).getSuperTypes(elem);
                    // console.log(`found supers for ${writer.writeToString(elem.internal)} [${elem.internal.piLanguageConcept()}] : ${supers.map(sup => `${writer.writeToString(sup.internal)} [${sup.internal.piLanguageConcept()}]`).join(", ")}`)
                    for (const super1 of supers) {
                        nextLevel.add(super1);
                    }
                }
            }
        }
        return classes;
    }
}
