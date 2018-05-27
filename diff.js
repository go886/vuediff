Array.prototype.swap = function (x, y) {
    var b = this[x];
    this[x] = this[y];
    this[y] = b;
    return this;
}

Array.prototype.insertBefore = function (item, index) {
    this.splice(index, 0, item);
}

Array.prototype.moveBefore = function (from, to) {
    if (from > to) {
        this.splice(to, 0, this.splice(from, 1)[0])
    } else if (from < to) {
        this.splice(to - 1, 0, this.splice(from, 1)[0])
    }
}

Array.prototype.copy = function () {
    return this.map((e) => { return e })
}




function defaultDelegate(haskey) {
    return {
        key(newNodeInfo, isNew) {
            return haskey ? newNodeInfo : null;
        },
        compare(oldNode, newNode) {
            return oldNode == newNode;
        },
        bind(oldNode, newNode) {
            //  console.log('bind: => ' + JSON.stringify(result))
        },
        createNode(newNodeInfo) {
            return newNodeInfo;
        },
    }
}

function makeOP(op, value, index) {
    return {
        op,
        index,
        value,
    }
}

function diff(oldVNode, newCh, delegate) {
    let oldCh = oldVNode;
    let oldStartIdx = 0
    let newStartIdx = 0
    let oldEndIdx = oldCh.length - 1
    let oldStartVnode = oldCh[0]
    let oldEndVnode = oldCh[oldEndIdx]
    let newEndIdx = newCh.length - 1
    let newStartVnode = newCh[0]
    let newEndVnode = newCh[newEndIdx]
    let oldKeyMap, elmToMove, key, index;
    let patchs = [];


    function compare(o, n) {
        return delegate ? delegate.compare(o, n) : o == n;
    }

    function keyFor(node, isNew) {
        return delegate ? delegate.key(node, isNew) : null;
    }

    function bind(idx, newInfo) {
        const node = oldCh[idx]
        delegate.bind(node, newInfo)
        patchs.push({
            op: 'b',
            index: idx,
            value: newInfo
        })
    }

    function createNodeInsert(newInfo, index) {
        var node = delegate.createNode(newInfo)
        oldCh.splice(index, 0, node);
        patchs.push({
            op: 'c',
            index: index,
            value: newInfo
        })
    }

    function moveTo(from, to) {
        if (from > to) {
            oldCh.splice(to, 0, oldCh.splice(from, 1)[0])
        } else if (from < to) {
            oldCh.splice(to - 1, 0, oldCh.splice(from, 1)[0])
        }
        patchs.push({
            op: 'm',
            index: from,
            value: to
        })
    }
    function removeNode(beginIdx, num = 1) {
        oldCh.splice(beginIdx, num);
        patchs.push({
            op: 'd',
            index: beginIdx,
            value: num
        })
    }

    function createOldKeyMap(oldCh, beginIdx, endIdx) {
        let i, key, v
        const map = {}
        for (i = beginIdx; i <= endIdx; ++i) {
            v = oldCh[i]
            key = keyFor(v, false);
            if (key) map[key] = { node: v, index: i }
        }
        return map
    }

    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
        if (compare(oldStartVnode, newStartVnode)) {
            bind(oldStartIdx, newStartVnode)
            oldStartVnode = oldCh[++oldStartIdx];
            newStartVnode = newCh[++newStartIdx];
        } else if (delegate.compare(oldEndVnode, newEndVnode)) {
            bind(oldEndIdx, newEndVnode)
            oldEndVnode = oldCh[--oldEndIdx];
            newEndVnode = newCh[--newEndIdx];
        } else if (compare(oldStartVnode, newEndVnode)) {
            bind(oldStartIdx, newEndVnode);
            //将item 后移，则oldStartIdx 不变, oldStartVnode 重取 
            moveTo(oldStartIdx, oldEndIdx + 1);
            oldStartVnode = oldCh[oldStartIdx]
            oldEndVnode = oldCh[--oldEndIdx]
            newEndVnode = newCh[--newEndIdx]
        } else if (compare(oldEndVnode, newStartVnode)) {
            bind(oldEndIdx, newStartVnode);
            //将item 前移，则oldEndIdx 不变, oldEndVnode 重取, oldStartIdx+1
            moveTo(oldEndIdx, oldStartIdx);
            oldStartVnode = oldCh[++oldStartIdx]
            oldEndVnode = oldCh[oldEndIdx]
            newStartVnode = newCh[++newStartIdx]
        } else {
            key = keyFor(newStartVnode, true);
            if (key && !oldKeyMap) {
                oldKeyMap = createOldKeyMap(oldCh, oldStartIdx, oldEndIdx);
            }
            elmToMove = key ? oldKeyMap[key] : null;
            if (elmToMove && compare(elmToMove.node, newStartVnode)) {
                index = elmToMove.node == oldCh[elmToMove.index] ? elmToMove.index : oldCh.indexOf(elmToMove.node)
                bind(index, newStartVnode)
                moveTo(index, oldStartIdx)
                newStartVnode = newCh[++newStartIdx]
                oldStartVnode = oldCh[++oldStartIdx];
            } else {
                createNodeInsert(newStartVnode, oldStartIdx)
                oldStartVnode = oldCh[++oldStartIdx];
                oldEndVnode = oldCh[++oldEndIdx];
                newStartVnode = newCh[++newStartIdx];
            }
        }
    }

    if (oldStartIdx > oldEndIdx) {
        for (; newStartIdx <= newEndIdx; ++newStartIdx) {
            createNodeInsert(newCh[newStartIdx], newStartIdx)
        }
    } else if (newStartIdx > newEndIdx) {
        removeNode(newStartIdx, oldEndIdx - oldStartIdx + 1);
    }

    return patchs;
}

function applyPatchs(oldCh, patchs) {
    patchs.forEach(e => {
        switch (e.op) {
            case 'b': {
                oldCh[e.index].bind && oldCh[e.index].bind(e.value);
            }
                break;
            case 'c': {
                //..create 
                var newNode = e.value;
                oldCh.splice(e.index, 0, newNode)
            }
                break;
            case 'm': {
                let from = e.index
                let to = e.value
                if (from > to) {
                    oldCh.splice(to, 0, oldCh.splice(from, 1)[0])
                } else if (from < to) {
                    oldCh.splice(to - 1, 0, oldCh.splice(from, 1)[0])
                }
            }
                break;
            case 'd': {
                oldCh.splice(e.index, e.value);
            }
                break;
            default:
                throw 'op error'
        }
    });

    return oldCh;
}

module.exports = diff;


function test() {
    var examples = require('./examples').default

    examples.forEach((element, i) => {
        function diffwrapper(oldCh, newCh, haskey) {

            var old = JSON.parse(JSON.stringify(oldCh));
            var old2 = JSON.parse(JSON.stringify(oldCh));
            console.log(i + ' -- 测试 : ' + (haskey ? 'key' : ''))
            console.log('old: ' + JSON.stringify(old))
            console.log('new: ' + JSON.stringify(newCh))

            var patchs = diff(old, newCh, defaultDelegate(haskey));
            applyPatchs(old2, patchs)

            var result = JSON.stringify(old) == JSON.stringify(newCh);
            var patchResult = JSON.stringify(old2) == JSON.stringify(newCh)
            console.log('res: ' + JSON.stringify(old) + (result ? ' Y' : ' N'));
            console.log('pth: ' + JSON.stringify(patchs))
            console.log('cmp: ' + JSON.stringify(old2) + (patchResult ? ' Y' : ' N'));

            console.log('\n')

            if (!result || !patchResult) {
                throw 'why'
            }
        }

        diffwrapper(element[0], element[1], false)
        diffwrapper(element[0], element[1], true)
    });
    console.log('end....')



    // const jiff = require('jiff');
    // var patchs = jiff.diff(oldVNode, newVNode);
    // patchs = patchs.filter((e)=>{
    //     return (e && e.op !== 'test');
    // });
    // console.log(JSON.stringify(patchs));
    // jiff.patch(patchs, oldVNode);
    // console.log('result: ' + JSON.stringify(jiff.patch(patchs, oldVNode)));
}

test();