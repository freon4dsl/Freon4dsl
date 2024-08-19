import { FreTriggerType, isProKey, isRegExp, isString } from "../editor";

export class MatchUtil {
    public static fullMatch(text: string, trigger: FreTriggerType): boolean {
        if (isRegExp(trigger)) {
            return trigger.test(text);
        } else if (isString(trigger)) {
            return trigger === text;
        } else if (isProKey(trigger)) {
            return false;
        }
        return false;
    }

    public static partialMatch(text: string, trigger: FreTriggerType): boolean {
        if (isRegExp(trigger)) {
            const r: RegExp = toPartialMatchRegex(trigger);
            const x = text.match(r);
            return exactlyOne(x, text);
        } else if (isString(trigger)) {
            return trigger.startsWith(text);
        } else if (isProKey(trigger)) {
            return false;
        }
        return false;
    }
}

function exactlyOne(ra: RegExpMatchArray, text: string): boolean {
    let result: boolean = false;
    if (ra === null) {
        result = false;
    } else {
        const arr = ra as RegExpMatchArray;
        if (arr.length === 1) {
            return arr[0] === text;
        } else if (arr.length > 1) {
            return false;
        }
    }
    return result;
}

// See https://stackoverflow.com/questions/22483214/regex-check-if-input-still-has-chances-to-become-matching/41580048#41580048
function toPartialMatchRegex(re: RegExp) {
    "use strict";

    const source = re.source;
    let i = 0;

    function process() {
        let result = "";
        let tmp;

        function appendRaw(nbChars: number) {
            result += source.substring(i, nbChars);
            i += nbChars;
        }

        function appendOptional(nbChars: number) {
            result += "(?:" + source.substring(i, nbChars) + "|$)";
            i += nbChars;
        }

        while (i < source.length) {
            switch (source[i]) {
                case "\\":
                    switch (source[i + 1]) {
                        case "c":
                            appendOptional(3);
                            break;

                        case "x":
                            appendOptional(4);
                            break;

                        case "u":
                            if (re.unicode) {
                                if (source[i + 2] === "{") {
                                    appendOptional(source.indexOf("}", i) - i + 1);
                                } else {
                                    appendOptional(6);
                                }
                            } else {
                                appendOptional(2);
                            }
                            break;
                        case "p":
                        case "P":
                            if (re.unicode) {
                                appendOptional(source.indexOf("}", i) - i + 1);
                            } else {
                                appendOptional(2);
                            }
                            break;

                        case "k":
                            appendOptional(source.indexOf(">", i) - i + 1);
                            break;
                        default:
                            appendOptional(2);
                            break;
                    }
                    break;

                case "[":
                    tmp = /\[(?:\\.|.)*?\]/g;
                    tmp.lastIndex = i;
                    tmp = tmp.exec(source);
                    appendOptional(tmp[0].length);
                    break;

                case "|":
                case "^":
                case "$":
                case "*":
                case "+":
                case "?":
                    appendRaw(1);
                    break;

                case "{":
                    tmp = /\{\d+,?\d*\}/g;
                    tmp.lastIndex = i;
                    tmp = tmp.exec(source);
                    if (tmp) {
                        appendRaw(tmp[0].length);
                    } else {
                        appendOptional(1);
                    }
                    break;

                case "(":
                    if (source[i + 1] === "?") {
                        switch (source[i + 2]) {
                            case ":":
                                result += "(?:";
                                i += 3;
                                result += process() + "|$)";
                                break;

                            case "=":
                                result += "(?=";
                                i += 3;
                                result += process() + ")";
                                break;

                            case "!":
                                tmp = i;
                                i += 3;
                                process();
                                result += source.substring(tmp, i - tmp);
                                break;

                            case "<":
                                switch (source[i + 3]) {
                                    case "=":
                                    case "!":
                                        tmp = i;
                                        i += 4;
                                        process();
                                        result += source.substr(tmp, i - tmp);
                                        break;

                                    default:
                                        appendRaw(source.indexOf(">", i) - i + 1);
                                        result += process() + "|$)";
                                        break;
                                }
                                break;
                        }
                    } else {
                        appendRaw(1);
                        result += process() + "|$)";
                    }
                    break;

                case ")":
                    ++i;
                    return result;

                default:
                    appendOptional(1);
                    break;
            }
        }

        return result;
    }

    return new RegExp(process(), re.flags);
}
