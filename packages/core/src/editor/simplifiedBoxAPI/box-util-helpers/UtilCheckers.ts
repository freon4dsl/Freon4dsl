import { FreLanguage, FreLanguageProperty } from "../../../language";
import { FreUtils } from "../../../util";

export class UtilCheckers {
    public static checkLimitedType(propInfo: FreLanguageProperty, propertyName: string) {
        // check whether this type is really a limited type
        const propType: string = propInfo?.type;
        if (!propType) {
            throw new Error("Cannot find type of '" + propertyName + "'");
        }
        const isLimited: boolean = FreLanguage.getInstance().concept(propType).isLimited;
        if (!isLimited) {
            throw new Error("Type of '" + propertyName + "' is not a limited concept");
        }

        // get all names of the instances of the limited concept
        return FreLanguage.getInstance().concept(propType).instanceNames;
    }

    /**
     *
     * @param isList
     * @param index
     * @param propertyName
     */
    public static checkList(isList: boolean, index: number, propertyName: string): boolean {
        let res: boolean = true;
        if (index !== null && index !== undefined && !isList) {
            FreUtils.CHECK(false, "Property " + propertyName + " is not a list: " + index + '"');
            res = false;
        }
        if (isList && (index === null || index === undefined || index < 0)) {
            FreUtils.CHECK(false, "Property " + propertyName + " is a list, index should be provided.");
            res = false;
        }
        return res;
    }
}
