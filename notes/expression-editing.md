### Expression editing

- [ ] Document styling (J)
- [ ] When opening a model, some references are not found (ref to Fraction10 from Flow in edu-example) (J)
- [x] **NB** : 24/12/2022 selectElement(in PiEditor) chnaged signature, create bin expr command not changeed accordingly)! (A)

#### Issues and Ideas:

- [ ] When in the left or right side of a binary expression do not show binary expressions.
  Peope You do not first create all binary expressions and them fill in the operands
- [ ] Thereis always a left box with focus before an expression.
      This is used so people can add operators there, but while gtabbing it feels wrong.
      How to avoid it?
    - solution: when tabbing, skip all the empty places inside expressions (start, end, around binary operators).
        - Need to be able to select, so be able to select t hese empty places with the mouse?
        - Show some special background so people see that they can edit there?
- [ ] Trigger /0-9/. Should not show up in dropdown
    - [ ] Never show regular expressions in dropdowns (like `/0-9/`)
- [ ] Do not show binary expressions in `left` or `right` placeholders.
    - People will most probably not use these anyway.
    - allow the shortcuts? And if so, what about options that are larger than one character?
- [ ] If we know something is an identifier (also for references), try not fitting characters in next box.
  - Similar to the number literal in `samples/Example`
- [x] Be able to change the text in “[add]” into something else
- [ ] Deletion in expressions does not work, you get stuck when e.g. a number is empty, delete then jumps to next field

#### Binary expressions:

- [ ] switch to show brackets (does not seem to work now)
- [ ] switch to show tree

#### Expression edit magic:

- [ ] Add brackets
- [ ] Add unary expressions
- [ ] Move to core
    - Does parser already use priorities? If not, it should be solved by this.

