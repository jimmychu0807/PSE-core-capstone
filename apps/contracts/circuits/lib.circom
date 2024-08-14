pragma circom 2.1.6;

include "../../../node_modules/circomlib/circuits/babyjub.circom";

template AddNumOnEllipticCurve () {
    signal input x1;
    signal input y1;
    signal input x2;
    signal input y2;

    signal input xout;
    signal input yout;

    component babyAdd = BabyAdd();
    babyAdd.x1 <== x1;
    babyAdd.y1 <== y1;
    babyAdd.x2 <== x2;
    babyAdd.y2 <== y2;

    xout === babyAdd.xout;
    yout === babyAdd.yout;
}

component main = AddNumOnEllipticCurve();
