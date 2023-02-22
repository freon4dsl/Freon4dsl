export class ListUtil {
    static addIfNotPresent<T>(list: T[], addition: T) {
        if (!!addition && !list.includes(addition)) {
            list.push(addition);
        }
    }

    static addListIfNotPresent<T>(list: T[], additionsList: T[]) {
        additionsList.forEach(extra => {
            ListUtil.addIfNotPresent<T>(list, extra);
        });
    }
}
