import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { subscribeWithSelector } from "zustand/middleware";


export const createImmerState = <T>
    (state: T | (() => T)) => create<T>()(
        immer(
            subscribeWithSelector(() => state instanceof Function ? state() : state)
        )
    )