import { mutableHandler, readonlyHandler } from './baseHandlers'

export const enum ReactiveFlags {
    IS_REACTIVE = '__v_isReactive',
    IS_READONLY = '__v_isReadonly'
}

function createActiveObj(raw, baseHandlers) {
    return new Proxy(raw, baseHandlers)
}

export function reactive(raw) {
    return createActiveObj(raw, mutableHandler)
}

export function readonly(raw) {
    return createActiveObj(raw, readonlyHandler)
}

export function isReactive(value) {
    return !!value[ReactiveFlags.IS_REACTIVE]
}

export function isReadonly(value) {
    return !!value[ReactiveFlags.IS_READONLY]
}