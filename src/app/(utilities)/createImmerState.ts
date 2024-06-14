import { create } from "zustand";
import { immer } from "zustand/middleware/immer";



export const createImmerState = <T>
    (state: T) => create<T>()(immer(() => state))