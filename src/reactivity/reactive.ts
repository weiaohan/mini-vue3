import { mutableHandler, readonlyHandler } from './baseHandlers'

function createActiveObj(raw, baseHandlers) {
    return new Proxy(raw, baseHandlers)
}

export function reactive(raw) {
    return createActiveObj(raw, mutableHandler)
}

export function readonly(raw) {
    return createActiveObj(raw, readonlyHandler)
}
