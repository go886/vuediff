const diff = require('./diff')


var DiffContext = [
    {
        node: null,
        patchs: [

        ]
    }
]



function copy(from, to) {
    from.forEach((k)=>{
        to[k] = from[k]
    });
    return to;
}

function merge(obj1, obj2) {
    var r = {}
    obj1.forEach(k=>{
        r[k] = obj1[k]
    })

    obj2.forEach(k=>{
        r[k] = obj2[k]
    })
}

function makeOP(op, index, value) {
    return {
        op,
        index,
        value,
    }
}

var VNode = {
    parent: null, // 父VNode节点
    node: null, // 真实的Node
    elements: null, // Elements 树
    el: null, // 当前对应的element, 主要用来在diff 过程中作比较
    name: null, //节点名称，如：div, 只读属性
    attrs: {}, // 属性
    vm: {}, //数据上下文
    children: [],

    update(vm) {
        //

        var patchs = this.diff();
    },

    diff() {
        //diff attrs
        var patchs = []
        Object.keys(this.el.bindattrs).forEach((k) => {
            if (k !== 'if' && k == 'repeat') {
                var key = this.el.bindattrs[k]
                var newVal = this.vm[key]
                var oldVal = this.attrs[k];
                if (newVal != newVal) {
                    this.attrs[k] = newVal;
                    patchs.push(makeOP('set', k, newVal))
                }
            }
        });

        var newELs = this.el.children && this.el.children.forEach((el) => {
            if (el.type == 'template') {
                var newEL = copy(this.elements[el.attrs.src])
                newEL.bindattrs = merge(newEL.bindattrs, el.bindattrs);
                newEL.template = true;
                el = newEL;
            }
        });


    },

    apply(vm) {
        this.vm = vm;
        var bif = this.el.bindAttrs['if'];
        if (bif && vm[bif] !== true) {
            if (this.parent) {
                this.parent.remove(this);
            }
            return;
        }


        Object.keys(this.el.bindAttrs).forEach((k) => {
            if (k !== 'if') {
                var new = vm[k];
                var old = data[k];
                if (new != old) {
                    this.data[k] = new;
                    // ...
                }
            }
        });


        if (this.el.type == 'template') {

        }


        this.el.children.forEach((subEL) => {
            subEL.apply(vm);
        });


        var repeat = this.el.bindAttrs['repeat'];
        if (repeat) {
            var subRepeatNodes = []; //...
            var items = vm[repeat];
            //...
        } else {
            this.children.forEach((subNode) => {
                subNode.apply(vm);
            })
        }
    },
}


