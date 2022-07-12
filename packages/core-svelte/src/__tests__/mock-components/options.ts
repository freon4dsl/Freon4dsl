import { SelectOption } from "@projectit/core";

function getAliasOptions(): SelectOption[] {
    const result: SelectOption[] = [];
    for (let counter: number = 1; counter < 10; counter++) {
        result.push({ id: counter.toString(), label: "select-text" + counter });
    }
    return result;
};

export const testOptions: SelectOption[] = getAliasOptions();


