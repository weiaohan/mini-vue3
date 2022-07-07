let activeEffect
class ReactiveEffect {
    private _fn: any
    public deps = []
    constructor(fn, public scheduler?) {
        this._fn = fn
        this.scheduler = scheduler
    }
    run() {
        activeEffect = this
        return this._fn()
    }

    // 调用stop，trigger的时候就不能触发依赖
    // trigger是去取保存的effect执行run方法
    // 因此调用stop需要把保存的这个effect从deps里面删掉
    // 怎么删掉呢————track的时候把deps保存起来，然后delete(this)就行了
    stop() {
        // 因为可能有多个依赖，所以需要遍历
        this.deps.forEach((dep: any) => {
            dep.delete(this)
        })
    }
}

// 依赖收集关系 target -> key -> dep，分别使用map map set数据结构
// 因此需要全局存一下target
const targetMap = new Map()
export function track(target, key) {
    // 取出target对应的存放依赖的容器
    let depsMap = targetMap.get(target)
    if (!depsMap) {
        depsMap = new Map()
        targetMap.set(target, depsMap)
    }
    // 使用Set保证不重复收集依赖
    let dep = depsMap.get(key)
    if (!dep) {
        dep = new Set()
        depsMap.set(key, dep)
    }
    if (!activeEffect) {
        return
    }
    dep.add(activeEffect)
    // TODO: 应该先清理deps
    activeEffect.deps.push(dep)
}

export function trigger(target, key) {
    const depsMap = targetMap.get(target)
    const deps = depsMap.get(key)
    for (const effect of deps) {
        if (effect.scheduler) {
            effect.scheduler()
        } else {
            effect.run()
        }
    }
}

export function effect(fn, options: any = {}) {
    const _effect = new ReactiveEffect(fn, options.scheduler)
    _effect.run()
    const runner: any = _effect.run.bind(_effect)
    // runner可以调用stop,需要把实例挂载到runner上
    runner.effect = _effect
    return runner
}

// fn是一个runner，所以runner需要保存当前effect实例
export function stop(fn) {
    fn.effect.stop()
}
