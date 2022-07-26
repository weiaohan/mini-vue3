import { reactive } from '../reactive'
import { effect, stop } from '../effect'

describe('effect', () => {
    it('happy path', () => {
        const user = reactive({
            age: 10,
        })
        let nextAge
        effect(() => {
            nextAge = user.age + 1
        })
        expect(nextAge).toBe(11)
        user.age++
        expect(nextAge).toBe(12)
    })

    it('should return runner when call effect', () => {
        let foo = 10
        const runner = effect(() => {
            foo++
            return 'foo'
        })
        expect(foo).toBe(11)
        // 这里有个隐式的this执行上下文变化，把实例中的方法赋值给一个变量，执行该变量引用的方法时，this上下文变成了全局（默认绑定）
        const res = runner()
        expect(res).toBe('foo')
        expect(foo).toBe(12)
    })

    it('scheduler', () => {
        let run: any
        let dummy
        const obj = reactive({ foo: 1 })
        const scheduler = jest.fn(() => {
            run = runner
        })
        const runner = effect(
            () => {
                dummy = obj.foo
            },
            { scheduler }
        )
        expect(scheduler).not.toHaveBeenCalled()
        expect(dummy).toBe(1)
        obj.foo++
        expect(dummy).toBe(1)
        expect(scheduler).toHaveBeenCalledTimes(1)
        run()
        expect(dummy).toBe(2)
    })

    it('stop', () => {
        let dummy
        const obj = reactive({ foo: 1 })
        const runner = effect(() => {
            dummy = obj.foo
        })
        expect(dummy).toBe(1)
        obj.foo = 2
        expect(dummy).toBe(2)
        stop(runner)
        // obj.foo = 3
        obj.foo++
        // 测试会执行失败，因为obj.foo++ -> obj.foo = obj.foo + 1
        // 此时会调用obj的getter,因为之前也没有清空全局保存的targetMap,又把effect的依赖收集起来了,之后setter的时候，就会触发effect收集的依赖
        expect(dummy).toBe(2)

        runner()
        expect(dummy).toBe(3)
    })

    it('onStop', () => {
        const obj = reactive({ foo: 1 })
        const onStop = jest.fn()
        let dummy;
        const runner = effect(() => {
            dummy = obj.foo
        }, {
            onStop
        })
        stop(runner)
        expect(onStop).toBeCalledTimes(1)
    })
})
