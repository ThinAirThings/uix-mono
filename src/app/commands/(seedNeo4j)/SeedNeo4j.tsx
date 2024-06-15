import React, { useMemo } from 'react';
import { codegenStore } from '../codegen';
import { Text, Box } from 'ink';
import neo4j, { Neo4jError } from 'neo4j-driver';
import { useQuery } from '@tanstack/react-query';
import { Loading } from '../../(components)/Loading';
import { useStore } from 'zustand';
import { UixErr, UixErrCode, tryCatch } from '../../../types/Result';

export const SeedNeo4j = () => {
    const uixConfig = useStore(codegenStore, (store) => store.uixConfig)
    if (!uixConfig) return <Text color="red">UixConfig not found</Text>
    const neo4jDriver = useMemo(() => neo4j.driver(
        uixConfig.neo4jConfig.uri,
        neo4j.auth.basic(uixConfig.neo4jConfig.username, uixConfig.neo4jConfig.password)
    ), [])
    const { data: seedResult, error: seedError } = useQuery({
        queryKey: ['seedNeo4j'],
        queryFn: async () => {
            // Create Null Node
            await neo4jDriver.executeQuery(/*cypher*/`
                MERGE (nullNode:Node:Null {nodeId: '0'})
                ON CREATE SET nullNode.createdAt = datetime()
            `)
            // Create Unique Indexes
            const createIndexResults = await Promise.all(uixConfig.graph.nodeTypeSet.flatMap(nodeDefinition => [
                nodeDefinition.uniqueIndexes.flatMap(async property =>
                    await tryCatch({
                        try: async () => {
                            await neo4jDriver.executeQuery(/*cypher*/`
                                CREATE CONSTRAINT ${nodeDefinition.type}_${property}_index IF NOT EXISTS
                                FOR (node:${nodeDefinition.type})
                                REQUIRE node.${property} IS UNIQUE
                            `)
                            return true
                        },
                        catch: (error: Neo4jError) => UixErr({
                            code: UixErrCode.CREATE_UNIQUE_INDEX_FAILED,
                            message: `Failed to create unique constraint for ${nodeDefinition.type}.${property}: ${error.message}`,
                            data: {
                                neo4jErrorType: error.name,
                                nodeType: nodeDefinition.type,
                                property
                            }
                        })
                    })
                ),
                nodeDefinition.vectorIndexes.flatMap(async property =>
                    await tryCatch({
                        try: async () => {
                            await neo4jDriver.executeQuery(/*cypher*/`
                                CREATE VECTOR INDEX ${nodeDefinition.type}_${property}_vector IF NOT EXISTS
                                FOR (node:${nodeDefinition.type}:Vector)
                                ON (node.${property})
                                OPTIONS {indexConfig: {
                                    \`vector.dimensions\`: 3072,
                                    \`vector.similarity_function\`: "cosine"
                                }}
                            `)
                            return true
                        },
                        catch: (error: Neo4jError) => UixErr({
                            code: UixErrCode.CREATE_VECTOR_INDEX_FAILED,
                            message: `Failed to create index for ${nodeDefinition.type}.${property}: ${error.message}`,
                            data: {
                                neo4jErrorType: error.name,
                                nodeType: nodeDefinition.type,
                                property
                            }
                        })
                    })
                )
            ].flat()))
            neo4jDriver.close()
            return createIndexResults
        }
    })
    if (seedError) return <Text color="red">Error seeding Neo4j: {seedError.message}</Text>
    if (!seedResult) return <Loading text="Seeding neo4j..." />
    if (seedResult.some(({ error }) => !!error)) {
        return seedResult.map(({ error }) => error
            ? <>
                <Text key={error.data.nodeType} color="red">❌ {
                    error.code === UixErrCode.CREATE_UNIQUE_INDEX_FAILED
                        ? 'Unique'
                        : 'Vector'
                } index creation failed for: {error.data.nodeType}Node</Text>
                <Text key={error.data.property} color="red">  - Please file a bug report!</Text>
                <Box borderStyle="round">
                    <Text key={error.data.neo4jErrorType} color="red" wrap='wrap'>  Message: {error.message}</Text>
                </Box>
            </>
            : <></>
        )
    }
    return (<>
        <Text>✅ Neo4j seeded successfully</Text>
        <Text>🚀 Success</Text>
    </>)
}