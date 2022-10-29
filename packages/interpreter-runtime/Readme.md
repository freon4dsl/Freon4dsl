# Interpreter Runtime

This folder contains all runtime classes for the interpreter.
Each evaluation of an expression results in a runtime value, an instance of a subclass of `RtObject`.

## Basic
Basic types, `RtNumber` is internally represented as a bignumber, to avoid rounding errors.

## Data and Time
### RtTime
Internally represented by `LocalTime` of the `js-joda`  library. 

### RtDate
Internally represented by `LocalDate` of the `js-joda`  library. 

### RtTimeDelta and RtDateDelta
Both have a self-written implementation.

