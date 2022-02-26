export class TEST {
     func() {
         let a: concept1 = new concept1();
         let b: concept2 = new concept2();
         let c: concept3 = new concept3();
         let d: concept4 = new concept4();
         let e: concept5 = new concept5();

         a = b;
         // a = c;
         // a = d;
         // a = e;

         // b = a;
         // b = c;
         // b = d;
         // b = e;

         // c = a;
         // c = b;
         // c = d;
         // c = e;

         // d = a;
         // d = b;
         // d = c;
         d = e;

         // e = a;
         // e = b;
         // e = c;
         // e = d;
     }
}

class concept1 {
    xx: number;
}

class concept2 extends concept1 {
    yy: boolean;
}

interface intf1 {
    zz: string;
}

interface intf2 extends intf1 {
    ff: number;
}
class concept3 implements intf1 {
    gg: string;
    zz: string;
}
class concept4 implements intf1 {
    hh: string;
    zz: string;
}
class concept5 implements intf2 {
    hh: string;
    ff: number;
    zz: string;
}
