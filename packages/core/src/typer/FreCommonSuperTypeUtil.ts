import { FreTypeOrderedList } from "./FreTypeOrderedList";
import { FreTyper } from "./FreTyper";
import { FreType } from "./FreType";

// algorithm from https://stackoverflow.com/questions/9797212/finding-the-nearest-common-superclass-or-superinterface-of-a-collection-of-cla
// 1. Breath First Search of each class hierarchy going "upwards" - result into OrderedList (preserve order + no duplicates).
// 2. Intersect each set with the next to find anything in common, again OrderedList to preserve order.
// 3. The remaining "ordered" list is the common ancestors, first in list is "nearest", last is furthest.
// 4. Empty list implies no ancestors.

export class FreCommonSuperTypeUtil {
    public static commonSuperType(inList: FreType[], typer: FreTyper): FreType[] {
        if (!!inList && inList.length > 0) {
            // start with the supers from the first element
            const rollingIntersect: FreTypeOrderedList<FreType> = this.getSupers(inList[0], typer);
            // intersect with the next
            for (let i = 1; i < inList.length; i++) {
                // this.printOrderedList("rollingIntersect at " + i.toString(), rollingIntersect);
                rollingIntersect.retainAll(this.getSupers(inList[i], typer), typer);
            }
            return rollingIntersect.toArray();
        }
        return [];
    }

    // private static printOrderedList(comment: string, rollingIntersect: FreTypeOrderedList<FreType>) {
    //     let result: string = '';
    //     result += comment;
    //     for (const freType of rollingIntersect) {
    //         // if (freType.internal instanceof FreType) {
    //         //     result += "\t" + freType.internal.toFreString()
    //         // } else {
    //             result += "\t" + freType.constructor.name;
    //         // }
    //     }
    //     console.log(result);
    // }

    /**
     * Breath first search for supers of 'inCls'.
     * @param inCls
     * @param typer
     * @private
     */
    private static getSupers(inCls: FreType, typer: FreTyper): FreTypeOrderedList<FreType> {
        const classes: FreTypeOrderedList<FreType> = new FreTypeOrderedList<FreType>();
        if (!!inCls) {
            let nextLevel: FreTypeOrderedList<FreType> = new FreTypeOrderedList<FreType>();
            nextLevel.add(inCls, typer);
            // this.printOrderedList("nextLevel: ", nextLevel );
            while (nextLevel.length() > 0) {
                classes.addAll(nextLevel, typer);
                const thisLevel: FreTypeOrderedList<FreType> = new FreTypeOrderedList<FreType>();
                thisLevel.addAll(nextLevel, typer);
                nextLevel = new FreTypeOrderedList<FreType>();
                for (const elem of thisLevel) {
                    const supers: FreType[] = typer.getSuperTypes(elem);
                    // tslint:disable-next-line:max-line-length
                    // console.log(`found supers for ${writer.writeToString(elem.internal)} [${elem.internal.freLanguageConcept()}] : ${supers.map(sup => `${writer.writeToString(sup.internal)} [${sup.internal.freLanguageConcept()}]`).join(", ")}`)
                    for (const super1 of supers) {
                        nextLevel.add(super1, typer);
                    }
                }
            }
        }
        return classes;
    }
}
