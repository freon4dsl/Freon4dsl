import { TypeOrderedList } from "./TypeOrderedList";
import { PiType } from "./PiType";
import { PiTyper } from "./PiTyper";


// algorithm from https://stackoverflow.com/questions/9797212/finding-the-nearest-common-superclass-or-superinterface-of-a-collection-of-cla
// 1. Breath First Search of each class hierarchy going "upwards" - result into OrderedList (preserve order + no duplicates).
// 2. Intersect each set with the next to find anything in common, again OrderedList to preserve order.
// 3. The remaining "ordered" list is the common ancestors, first in list is "nearest", last is furthest.
// 4. Empty list implies no ancestors.

export class CommonSuperTypeUtil {

    public static commonSuperType(inList: PiType[], typer: PiTyper): PiType[] {
        if (!!inList && inList.length > 0) {
            // start with the supers from the first element
            const rollingIntersect: TypeOrderedList<PiType> = this.getSupers(inList[0], typer);
            // intersect with the next
            for (let i = 1; i < inList.length; i++) {
                // this.printOrderedList("rollingIntersect at " + i.toString(), rollingIntersect);
                rollingIntersect.retainAll(this.getSupers(inList[i], typer), typer);
            }
            return rollingIntersect.toArray();
        }
        return [];
    }

    // private static printOrderedList(comment: string, rollingIntersect: TypeOrderedList<PiType>) {
    //     let result: string = '';
    //     result += comment;
    //     for (const piClassifier of rollingIntersect) {
    //         // if (piClassifier.internal instanceof PiType) {
    //         //     result += "\t" + piClassifier.internal.toPiString()
    //         // } else {
    //             result += "\t" + piClassifier.constructor.name;
    //         // }
    //     }
    //     console.log(result);
    // }

    /**
     * Breath first search for supers of 'inCls'.
     * @param inCls
     * @private
     */
    private static getSupers(inCls: PiType, typer: PiTyper): TypeOrderedList<PiType>  {
        const classes: TypeOrderedList<PiType> = new TypeOrderedList<PiType>();
        if (!!inCls) {
            let nextLevel: TypeOrderedList<PiType> = new TypeOrderedList<PiType>();
            nextLevel.add(inCls, typer);
            // this.printOrderedList("nextLevel: ", nextLevel );
            while (nextLevel.length() > 0) {
                classes.addAll(nextLevel, typer);
                const thisLevel: TypeOrderedList<PiType> = new TypeOrderedList<PiType>();
                thisLevel.addAll(nextLevel, typer);
                nextLevel = new TypeOrderedList<PiType>();
                for (const elem of thisLevel) {
                    const supers: PiType[] = typer.getSuperTypes(elem);
                    // console.log(`found supers for ${writer.writeToString(elem.internal)} [${elem.internal.piLanguageConcept()}] : ${supers.map(sup => `${writer.writeToString(sup.internal)} [${sup.internal.piLanguageConcept()}]`).join(", ")}`)
                    for (const super1 of supers) {
                        nextLevel.add(super1, typer);
                    }
                }
            }
        }
        return classes;
    }
}
