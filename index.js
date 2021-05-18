class Vue {
    constructor(options) {
        this.$data = options.data
        new Observer(this.$data)
        Vue.proxy(this, options.data)
        if (options.el) {
            this.mount(options.el)
        }
    }

    mount(el) {
        this.$el = document.querySelector(el)
        new Compile(this.$el, this.$data)
        return this
    }

}

Vue.proxy = function (vueInstance, data) {
    for (let prop in data) {
        Object.defineProperty(vueInstance, prop, {
            get() {
                return vueInstance.$data[prop]
            },
            set(newVal) {
                if (vueInstance.$data[prop] !== newVal) {
                    vueInstance.$data[prop] = newVal
                }
            }
        })
    }
}

Vue.createApp = function (options) {
    return new Vue(options)
}

class Observer {
    constructor(data) {
        this.handler(data)
    }

    handler(data) {

        if (Object.prototype.toString.call(data) === '[object Object]') {
            Object.keys(data).forEach(key => {
                this.defineReactive(data, key, data[key])
                this.handler(data[key])
            })
        }
    }

    defineReactive(data, key, val) {
        const dep = new Dep()
        let that = this
        Object.defineProperty(data, key, {
            get() {
                Dep.target && dep.addSub(Dep.target)
                return val
            },
            set(newVal) {
                if (val !== newVal) {
                    val = newVal
                    that.handler(newVal)
                    dep.notify()
                }
            }
        })
    }
}

class Dep {
    constructor() {
        this.subs = new Set()
    }

    addSub(watcher) {
        this.subs.add(watcher)
    }

    notify() {
        for (const sub of this.subs) {
            sub.update()
        }
    }
}

Dep.target = null
class Compile {

    constructor(el, data) {
        this.handler(el, data)
    }

    handler(el, data) {
        [].slice.call(el.childNodes).forEach(node => {
            // 当是 html 节点时继续执行此方法
            if (node.nodeType === 1) {
                this.handler(node, data)

            } else if (node.nodeType === 3) {
                // 当是文本节点时
                this.handlerText(node, data)
            }
        })
    }

    handlerText(node, data) {
        let exp = this.textToExp(node.textContent)
        new Watcher(exp, data, newVal => {
            node.textContent = newVal
        })
    }

    textToExp(text) {
        let fragments = text.split(/({{.+?}})/g)
        fragments = fragments.map(fragment => {
            if (fragment.match(/{{.+?}}/g)) {
                fragment = '(' + fragment.replace(/^{{|}}$/g, '') + ')'
            } else {
                fragment = '`' + fragment.replace(/`/g, '\\`') + '`'
            }
            return fragment
        })
        return fragments.join('+')
    }


}

Compile.expToFunc = function (exp, data) {
    return new Function('with(this){return ' + exp + '}').bind(data)
}

class Watcher {
    constructor(exp, data, callback) {
        this.oldVal = null
        this.getter = Compile.expToFunc(exp, data)
        this.callback = callback
        this.update()
    }

    get() {
        Dep.target = this
        let value = this.getter()
        Dep.target = null
        return value
    }

    update() {
        let newVal = this.get()
        if (newVal !== this.oldVal) {
            this.oldVal = newVal
            this.callback && this.callback(newVal)
        }
    }
}

