export class ParserGenUtil {
    static makeComment (rule: string) : string {
        rule = rule.replace(new RegExp("\n","gm") , "\n\t*");
        rule = rule.replace(new RegExp("/\\*","gm") , "--");
        rule = rule.replace(new RegExp("\\*/","gm") , "--");
        return `/**
             * Method to transform branches that match the following rule:
             * ${rule}
             * @param branch
             * @private
             */`;
    }

    static escapeRelevantChars(input: string): string {
        const regexSpecialCharacters = [
            "\"", "\'"
            // "\\", ".", "+", "*", "?",
            // "[", "^", "]", "$", "(",
            // ")", "{", "}", "=", "!",
            // "<", ">", "|", ":", "-"
        ];

        regexSpecialCharacters.forEach(rgxSpecChar =>
            input = input.replace(new RegExp("\\" + rgxSpecChar,"gm"), "\\\\" +
                rgxSpecChar));
        return input;
    }
}
