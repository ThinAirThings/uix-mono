import { useStore } from "zustand";
import { createImmerState } from "../(utilities)/createImmerState";
import { FC } from 'react'
import { GenericUixConfig } from "../../config/defineConfig";


export const applicationStore = createImmerState({
    outputMap: new Map<string, {
        Component: FC,
        operationState: 'pending' | 'success' | 'error',
    }>(),
    uixConfig: null as GenericUixConfig | null,
})

export const useApplicationStore = <R>(
    selector: (state: ReturnType<typeof applicationStore.getState>) => R
) => {
    return useStore(applicationStore, selector)
}



