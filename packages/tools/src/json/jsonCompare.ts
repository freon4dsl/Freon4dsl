var hasOwn = Object.prototype.hasOwnProperty;
var indexOf = Array.prototype.indexOf;

function isObjectEmpty(obj) {
    for (var key in obj) {
        return false;
    }

    return true;
}

function copyKeys(obj) {
    var newObj = {};

    for (var key in obj) {
        newObj[key] = undefined;
    }

    return newObj;
}

// compares the structure of JSON-compatible, non-circular values
export function compareStructure(a: any, b: any) {
    if (typeof a !== typeof b) {
        console.log("Diff: types do not match")
        return false;
    }

    if (typeof a === 'object') {
        // both or neither, but not mismatched
        if (Array.isArray(a) !== Array.isArray(b)) {
            console.log("Diff: types do not match: array vs non-array")
            return false;
        }

        if (Array.isArray(a)) {
            // can't compare structure in array if we don't have items in both
            if (!a.length || !b.length) {
                console.log("Diff: array lengths do not match")
                return true;
            }

            for (var i = 1; i < a.length; i++) {
                if (!compareStructure(a[0], a[i])) {
                    console.log("Diff: 1 recursive do not match")
                    return false;
                }
            }

            for (var i = 0; i < b.length; i++) {
                if (!compareStructure(a[0], b[i])) {
                    console.log("Diff: 2 recursive do not match")
                    return false;
                }
            }

            return true;
        }

        var map = copyKeys(a), keys = Object.keys(b);

        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];

            if (!hasOwn.call(map, key) || !compareStructure(a[key], b[key])) {
                console.log("Diff: key error: " + key)
                return false;
            }

            delete map[key];
        }

        // we should've found all the keys in the map
        return isObjectEmpty(map);
    }

    return true;
}

var obj1 = {
    name: 'John Doe',
    age: 30,
    address: {
        street: '123 Main St',
        city: 'New York'
    },
    hobbies: ['reading', 'cooking']
};

var obj2 = {
    name: 'John Smith',
    age: 30,
    address: {
        street: '123 Main St',
        city: 'New York'
    },
    // occupation: 'Developer',
    hobbies: ['reading', 'painting']
};

var comparisonResult = compareStructure(obj1, obj2);

console.log(JSON.stringify(comparisonResult));
//
