/**
 * Type for the rectangle that the corresponding component has in the browser
 */
export type ClientRectangle = {
    height: number,
    width: number,
    x: number ,
    y: number
}

export const UndefinedRectangle: ClientRectangle = {
    height: 0,
    width: 0,
    x: 0,
    y: 0
}
