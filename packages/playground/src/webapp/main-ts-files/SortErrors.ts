// function to sort the data in a DataTable
// used to sort errors in the ErrorList

import { PiError } from "@projectit/core";

export default function sortErrors(data: PiError[], col: number, asc: boolean) {
    if (col < 0 || col > 2) return data;

    const sorted = data.sort((a, b) => {
        let valA: string;
        let valB: string;
        if (col === 0) {
            valA = a.message;
            valB = b.message;
        }
        if (col === 1) {
            valA = a.locationdescription;
            valB = b.locationdescription;
        }
        if (col === 2) {
            valA = a.severity;
            valB = b.severity;
        }

        const first = asc ? valA : valB;
        const second = asc ? valB : valA;

        // console.log("valA: " + valA + ", valB: " + valB + ", asc: " + asc);
        return (first).localeCompare(second);
    });

    return sorted;
}
