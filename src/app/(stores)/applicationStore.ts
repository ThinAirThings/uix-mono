import { createImmerState } from "../(utilities)/createImmerState";
import { FC } from 'react'
import { GenericUixConfig } from "../../config/defineConfig";
import { Driver } from "neo4j-driver";
import { createNeo4jClient } from "../../clients/neo4j";

export const applicationStore = createImmerState({
    outputMap: new Map<string, {
        Component: FC,
        operationState: 'pending' | 'success' | 'error',
    }>(),
    uixConfig: null as GenericUixConfig | null,
    neo4jDriver: null as Driver | null,
})

applicationStore.subscribe(
    state => state.uixConfig,
    async uixConfig => {
        if (!uixConfig) return
        const neo4jDriver = createNeo4jClient(uixConfig.neo4jConfig, {
            connectionTimeout: 3000,
        })
        applicationStore.setState({
            neo4jDriver: neo4jDriver
        })
    }
)

// Close the neo4j driver when all operations are successful
applicationStore.subscribe(
    state => state.outputMap,
    async outputMap => {
        if (![...outputMap].every(([_, { operationState }]) => operationState === 'success')) return
        await applicationStore.getState().neo4jDriver?.close()
    }
)


export const useApplicationStore = <R>(
    selector: (state: ReturnType<typeof applicationStore.getState>) => R
) => applicationStore(selector)




