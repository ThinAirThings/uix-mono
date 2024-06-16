import { createStore } from "zustand";
import { immer } from "zustand/middleware/immer";
import { Draft } from "immer";


type ImmerSet<T> = (nextStateOrUpdater: T | Partial<T> | ((state: Draft<T>) => void), shouldReplace?: boolean | undefined) => void

// NOTE!: This function is irrelevant. It's only needed when you don't want to bundle React
export const createVanillaImmerState = <
    T,
    Fns extends Record<
        string,
        (set: ImmerSet<T & Fns>, ...args: any[]) => any
    >
>({
    state,
    fns
}: {
    state: T,
    fns?: Fns
}) => createStore<T & Fns>()(immer((set) => ({
    ...state,
    ...Object.entries(fns ?? {}).reduce((acc, [key, fn]) => ({
        ...acc,
        [key]: (...args: any[]) => fn(set, ...args)
    }), {} as Fns)
})))