# Notes on HTML grid with css

See https://gridbyexample.com/ for explanations.

1. Using the fr unit for grid-template-columns makes the grid resize on resize of the viewport.
2. direct children of the gris are layedout by row. gird-auto-flow: column changes this to column based order.
3. each direct child can be given an order, eg.
```
    .grid div:nth-child(2) {
        order: 1;
    }
```
positions the 2d child as first child to be displayed in the grid, i.e. on position (1, 1). Note that 
the order is changed visiually, but the tabbing order remains the 'old' one.
4. in grid-template-columns you can use min-content, max-content, and fit-content to change the width of the column
to the content.
