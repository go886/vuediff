Array.prototype.shuffle = function () {
    var array = this;
    var m = array.length,
        t, i;
    while (m) {
        i = Math.floor(Math.random() * m--);
        t = array[m];
        array[m] = array[i];
        array[i] = t;
    }
    return array;
}

var examples = []

function makeRandomItems(min, max) {
    var k = Math.floor(Math.random() * (max - min + 1) + min);
    var items = []
    for (var i = 0; i < k; ++i) {
        items.push(i);
    }
    return items.shuffle();
}

for (var i = 0; i < 100; ++i) {
    var oldCh = makeRandomItems(3, 30);
    var newCh = makeRandomItems(3, 30);
    examples.push([oldCh, newCh])
}


var ex = {
    'a': [
        [
            [7, 6, 4, 9, 2, 8, 1, 14, 12, 11, 0, 16, 3, 10, 15, 5, 13],
            [0, 7, 3, 5, 2, 4, 10, 9, 6, 8, 1]
        ]
    ],
    'b': [
        [
            [3, 7, 1, 10, 9, 8, 6, 5, 4, 0, 2],
            [1, 3, 2, 0, 4, 5]
        ]
    ],
    'c': [
        [
            [14, 5, 6, 4, 1, 2, 10, 7, 9, 8, 0, 13, 3, 11, 12],
            [9, 4, 16, 12, 17, 13, 2, 18, 7, 19, 15, 10, 3, 5, 6, 1, 11, 0, 8, 14]
        ]
    ],
    'd': [
        [
            [21, 5, 24, 16, 14, 13, 20, 1, 7, 4, 11, 18, 12, 25, 8, 17, 0, 19, 6, 22, 23, 9, 10, 3, 15, 2],
            [6, 3, 29, 18, 23, 15, 20, 11, 24, 26, 16, 14, 27, 10, 2, 21, 0, 25, 9, 5, 8, 7, 19, 22, 17, 12, 28, 4, 13, 1]
        ]
    ],
    'e':[
        [
            [15,10,5,16,0,9,6,4,2,18,3,17,12,1,13,11,8,14,7],
             [8,9,4,5,12,10,3,7,1,2,11,6,0]
        ]
    ],
    'f':[
        [
            [3,13,18,19,11,2,7,14,17,5,1,12,15,9,10,0,4,16,8,21,20,6,22],
            [5,2,1,3,6,0,4]
        ]
    ]
}

Object.keys(ex).forEach((k) => {
    examples = examples.concat(ex[k])
    // examples.push(ex[k])
});

ex.default = examples;

module.exports = ex;