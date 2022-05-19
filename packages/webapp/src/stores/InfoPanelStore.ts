import { writable } from "svelte/store";
import type { Writable } from "svelte/store";

export class TempError {
    id: number;
    message: string;                        // human-readable error message
    reportedOn: string;                     // the model element that does not comply
    locationdescription: string;            // human-readable indication of 'reportedOn'
    severity: PiErrorSeverity;              // indication of how serious the error is, default is 'To Do'
}
export enum PiErrorSeverity {
    Error = "Error",
    Improvement = "Improvement",
    ToDo = "TODO",
    Info = "Info",
    NONE = "NONE"
}

export let errorsLoaded: Writable<boolean> = writable<boolean>(false); // temp!!
export let searchResultLoaded: Writable<boolean> = writable<boolean>(true); // temp!!
// the current list of search results that is shown in the editor
export let searchResults: Writable<TempError[]> = writable<TempError[]>([
    {
        "id": 2,
        "message": "Ervin Howell",
        "reportedOn": "Antonette",
        "severity": PiErrorSeverity.Info,
        "locationdescription": "anastasia.net",
    },
    {
        "id": 4,
        "message": "Patricia Lebsack",
        "reportedOn": "Karianne",
        "severity": PiErrorSeverity.Improvement,
        "locationdescription": "kale.biz",
    },
    {
        "id": 6,
        "message": "Mrs. Dennis Schulist",
        "reportedOn": "Leopoldo_Corkery",
        "severity": PiErrorSeverity.Error,
        "locationdescription": "ola.org",
    },
    {
        "id": 8,
        "message": "Nicholas Runolfsdottir V",
        "reportedOn": "Maxime_Nienow",
        "severity": PiErrorSeverity.Error,
        "locationdescription": "jacynthe.com",
    },
    {
        "id": 10,
        "message": "Clementina DuBuque",
        "reportedOn": "Moriah.Stanton",
        "severity": PiErrorSeverity.Improvement,
        "locationdescription": "ambrose.net"
    }
]);
// the current list of errors in the model unit that is shown in the editor
export let modelErrors: Writable<TempError[]> = writable<TempError[]>([

{
    "id": 1,
    "message": "Leanne Graham. some other text",
    "reportedOn": "Bret",
    "severity": PiErrorSeverity.Error,
    "locationdescription": "hildegard.org"
},
{
    "id": 2,
    "message": "Ervin Howell",
    "reportedOn": "Antonette",
    "severity": PiErrorSeverity.Info,
    "locationdescription": "anastasia.net",
},
{
    "id": 3,
    "message": "Clementine Bauch",
    "reportedOn": "Samantha",
    "severity": PiErrorSeverity.ToDo,
    "locationdescription": "ramiro.info",
},
{
    "id": 4,
    "message": "Patricia Lebsack",
    "reportedOn": "Karianne",
    "severity": PiErrorSeverity.Improvement,
    "locationdescription": "kale.biz",
},
{
    "id": 5,
    "message": "Chelsey Dietrich",
    "reportedOn": "Kamren",
    "severity": PiErrorSeverity.ToDo,
    "locationdescription": "demarco.info",
},
{
    "id": 6,
    "message": "Mrs. Dennis Schulist",
    "reportedOn": "Leopoldo_Corkery",
    "severity": PiErrorSeverity.Error,
    "locationdescription": "ola.org",
},
{
    "id": 7,
    "message": "Kurtis Weissnat",
    "reportedOn": "Elwyn.Skiles",
    "severity": PiErrorSeverity.ToDo,
    "locationdescription": "elvis.io",
},
{
    "id": 8,
    "message": "Nicholas Runolfsdottir V",
    "reportedOn": "Maxime_Nienow",
    "severity": PiErrorSeverity.Error,
    "locationdescription": "jacynthe.com",
},
{
    "id": 9,
    "message": "Glenna Reichert",
    "reportedOn": "Delphine",
    "severity": PiErrorSeverity.Error,
    "locationdescription": "conrad.com",
},
{
    "id": 10,
    "message": "Clementina DuBuque",
    "reportedOn": "Moriah.Stanton",
    "severity": PiErrorSeverity.Improvement,
    "locationdescription": "ambrose.net"
}
]);
