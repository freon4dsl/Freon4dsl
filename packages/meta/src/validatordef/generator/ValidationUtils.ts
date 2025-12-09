import { FreComparator } from '../metalanguage/index.js';

export class ValidationUtils {

    public static freComparatorToTypeScript(comparator: FreComparator | undefined): string {
        switch (comparator) {
            case FreComparator.Equals: return '===';
            case FreComparator.SmallerIncluding: return '<=';
            case FreComparator.LargerIncluding: return '>=';
            case FreComparator.LargerThen: return '>';
            case FreComparator.SmallerThen: return '<';
        }
        return '=== /* error: comparator undefined */';
    }
}
