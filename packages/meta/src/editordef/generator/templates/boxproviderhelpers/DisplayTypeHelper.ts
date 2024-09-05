export class DisplayTypeHelper {
    public static getTypeScriptForDisplayType(inType: string | undefined): string {
        let result: string;
        switch (inType) {
            // possible values: "text" / "checkbox" / "radio" / "switch" / "inner-switch" / "slider"
            case "text":
                result = "SELECT";
                break;
            case "checkbox":
                result = "CHECKBOX";
                break;
            case "radio":
                result = "RADIO_BUTTON";
                break;
            case "switch":
                result = "SWITCH";
                break;
            case "inner-switch":
                result = "INNER_SWITCH";
                break;
            case "slider":
                result = "SLIDER";
                break;
            default:
                result = "SELECT";
        }
        return result;
    }
}
