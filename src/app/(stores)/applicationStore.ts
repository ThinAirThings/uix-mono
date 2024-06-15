import { useStore } from "zustand";
import { createImmerState } from "../(utilities)/createImmerState";

import { FC } from 'react'



export const applicationStore = createImmerState({
    outputMap: new Map<string, FC>()
})

export const useApplicationStore = <R>(
    selector: (state: ReturnType<typeof applicationStore.getState>) => R
) => {
    return useStore(applicationStore, selector)
}



