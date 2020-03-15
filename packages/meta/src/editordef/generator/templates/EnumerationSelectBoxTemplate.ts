import { PiLanguageUnit } from "../../../languagedef/metalanguage/PiLanguage";
import { Names } from "../../../utils/Names";

export class EnumerationSelectBoxTemplate {

    generate(language: PiLanguageUnit): string {
        console.log("EnumSelectGenerator language "+language.name + " #enums " + language.enumerations.length);
        console.log("EnumSelectGenerator language " + language.enumerations[0].name);
        return `
        import { PiElement, SelectBox, SelectOption } from "@projectit/core";
        import { demoStyles } from "../../styles/styles";

        ${language.enumerations.map(en =>
            `import { ${Names.enumeration(en)} } from "../../language/${Names.enumeration(en)}";`
        ).join("")}

        export class ${language.name}EnumerationProjections {
        ${language.enumerations.map(en =>
            `
            public enumSelectFor${en.name}(elem: PiElement, role: string, getAction: () => SelectOption, setAction: (o: SelectOption) => void) {
                return new SelectBox(
                    elem,
                    role,
                    "<" + "select>",
                    () => {
                        return ${Names.enumeration(en)}.values.map(v =>
                            ({
                                id: v.asString(),
                                label: v.asString()
                            }
                        ))
                    },
                    () => getAction(),
                    (option: SelectOption) => {
                        setAction(option);
                    },
                    { style: demoStyles.function }
                );
            }
        `
        ).join(" ")}
        }`
    }
}
