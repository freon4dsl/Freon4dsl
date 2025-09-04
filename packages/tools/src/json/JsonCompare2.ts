import fs from "fs";
import { LwDiff } from "./LionwebM3.js";

type ChangedType = {
    path: string;
    oldValue: any;
    newValue: any;
};
type AddedOrDeletedType = {
    path: string;
    value: any;
};
type MatchedType = {
    path: string;
    value: any;
};
type ResultType = {
    matched: MatchedType[];
    changed: ChangedType[];
    added: AddedOrDeletedType[];
    deleted: AddedOrDeletedType[];
};

function compareJSON1(obj1: any, obj2: any, path: string): ResultType {
    const result: ResultType = {
        matched: [],
        changed: [],
        added: [],
        deleted: [],
    };

    for (var key of Object.getOwnPropertyNames(obj1)) {
        console.log("GetOwnProperty: " + key);
        if (!obj1.hasOwnProperty(key)) continue;

        const newPath: string = path + (path ? "." : "") + key;

        if (obj2.hasOwnProperty(key)) {
            console.log("hasOwnProperty: " + key);
            if (typeof obj1[key] === "object" && typeof obj2[key] === "object") {
                console.log("   both objects: " + key);
                var nestedResult: ResultType = compareJSON1(obj1[key], obj2[key], newPath);
                result.matched = result.matched.concat(nestedResult.matched);
                result.changed = result.changed.concat(nestedResult.changed);
                result.added = result.added.concat(nestedResult.added);
                result.deleted = result.deleted.concat(nestedResult.deleted);
            } else if (obj1[key] !== obj2[key]) {
                console.log("   not objects !==: " + key + " obj1 [" + JSON.stringify(obj1[key]) + "]");
                result.changed.push({
                    path: newPath,
                    oldValue: obj1[key],
                    newValue: obj2[key],
                });
            } else {
                console.log("   not objects ===: " + key);
                result.matched.push({
                    path: newPath,
                    value: obj1[key],
                });
            }
        } else {
            console.log("not hasOwnProperty: " + key);
            result.deleted.push({
                path: newPath,
                value: obj1[key],
            });
        }
    }

    for (var key in Object.getOwnPropertyNames(obj2)) {
        if (!obj2.hasOwnProperty(key)) continue;

        var newPath = path + (path ? "." : "") + key;

        if (!obj1.hasOwnProperty(key)) {
            result.added.push({
                path: newPath,
                value: obj2[key],
            });
        }
    }

    return result;
}
//
// // Example usage
var obj1 = {
    name: "John Doe",
    age: 30,
    address: {
        street: "123 Main St",
        city: "New York",
    },
    hobbies: ["reading", "cooking"],
    reversed: ["first", "second"],
};

var obj2 = {
    name: "John Smith",
    age: 30,
    address: {
        street: "123 Main St",
        city: "New York",
    },
    occupation: "Developer",
    hobbies: ["reading", "painting"],
    reversed: ["second", "first"],
};

const file1 = process.argv[2];
const file2 = process.argv[3];

let comparisonResult: ResultType = null;
if (file1 !== null && file1 !== undefined) {
    const jsonString1 = fs.readFileSync(file1, "utf-8");
    const json1 = JSON.parse(jsonString1);
    const jsonString2 = fs.readFileSync(file2, "utf-8");
    const json2 = JSON.parse(jsonString2);

    const lwDiff = new LwDiff();
    const diff = lwDiff.lwDiff(json1, json2);
    if (lwDiff.errors.length === 0) {
        console.log("LwDiff: equal");
    } else {
        console.log("LwDiff: " + lwDiff.errors);
    }
} else {
    // comparisonResult = compareJSON1(obj1, obj2, "");
}
// console.log(JSON.stringify(comparisonResult));

// console.log('Matched:');
// console.log(comparisonResult.matched);
// console.log('Changed:');
// console.log(comparisonResult.changed);
// console.log('Added:');
// console.log(comparisonResult.added);
// console.log('Deleted:');
// console.log(comparisonResult.deleted);
