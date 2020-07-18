export class TestOptional {
    bool: boolean;
    str : string;
    test: TestOptional;
}

const test: TestOptional = new TestOptional();

console.log(JSON.stringify(test, null, 4));
console.log("bool: "+ test.bool);
console.log("str : "+ test.str);
console.log("test: "+ test.test);

const test2: TestOptional = test;
