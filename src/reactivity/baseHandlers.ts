import { track, trigger } from './effect'
import { ReactiveFlags } from './reactive'

// 缓存get和set, 不用每次初始化调用
const get = createGetter()
const set = createSetter()

const readonlyGet = createGetter(true)

function createGetter(isReadonly = false) {
    return function (target, key) {
        if (key === ReactiveFlags.IS_REACTIVE) {
            return !isReadonly
        } else if (key === ReactiveFlags.IS_READONLY) {
            return isReadonly
        }
        const res = Reflect.get(target, key)
        // 如果不是readonly，依赖收集
        if (!isReadonly) {
            track(target, key)
        }
        return res
    }
}

function createSetter() {
    return function (target, key, value) {
        const res = Reflect.set(target, key, value)
        // 触发依赖
        trigger(target, key)
        return res
    }
}

export const mutableHandler = {
    get,
    set,
}

export const readonlyHandler = {
    get: readonlyGet,
    set: function (target, key, value) {
        console.warn(`key ${key} set失败, 因为target是readonly`, target)
        return true
    },
}