
import React, { FC } from 'react';
import { Text, Box, Newline } from 'ink';
import { z, TypeOf } from 'zod';
import { Loading } from '../(components)/Loading';
import { CommandEnvironment } from '../(components)/CommandEnvironment';
import { GenericUixConfig } from '../../config/defineConfig';
import { require } from 'tsx/cjs/api'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { SeedNeo4j } from './(seedNeo4j)/SeedNeo4j';
import { applicationStore, useApplicationStore } from '../(stores)/applicationStore';
import { UixErr, UixErrSubtype } from '../../types/Result';
import { useOperation } from '../(hooks)/useOperation';
import { functionModuleTemplate } from '../../templates/functionModuleTemplate';
import { queryOptionsTemplate } from '../../templates/queryOptions/queryOptionsTemplate';
import { staticObjectsTemplate } from '../../templates/staticObjectsTemplate';
import { useUniqueChildTemplate } from '../../templates/hooks/useUniqueChildTemplate';
import { useNodeKeyTemplate } from '../../templates/hooks/useNodeKeyTemplate';
import { useNodeSetTemplate } from '../../templates/hooks/useNodeSetTemplate';
import { useNodeIndexTemplate } from '../../templates/hooks/useNodeIndexTemplate';
import { useNodeTypeTemplate } from '../../templates/hooks/useNodeTypeTemplate';

export const options = z.object({
    pathToConfig: z.string().transform(relativePath => {
        if (relativePath.slice(0, 1) === '/') return relativePath
        return path.join(process.cwd(), relativePath)
    }).default(path.join(process.cwd(), 'uix', 'uix.config.ts')).describe('Path to uix.config.ts file'),
});

export type CodegenOptions = TypeOf<typeof options>;
export const isDefault = true;

const Codegen: FC<{
    options: TypeOf<typeof options>;
}> = ({
    options
}) => CommandEnvironment({
    Command: () => {
        // Get config
        useOperation({
            dependencies: [],
            operationKey: 'uixConfig',
            tryOp: async () => {
                await new Promise(resolve => setTimeout(resolve, 500))
                const {
                    default: config
                } = require(options.pathToConfig, import.meta.url) as {
                    default: GenericUixConfig
                }
                applicationStore.setState(({ uixConfig: config }))
                return config
            },
            catchOp: (error: Error) => UixErr({
                subtype: UixErrSubtype.UIX_CONFIG_NOT_FOUND,
                message: `Uix config not found: ${error.message}`,
                data: { pathToConfig: options.pathToConfig }
            }),
            render: {
                Success: ({ data }) => <Text>✅ Uix config found @ {data.pathToConfig}</Text>,
                Pending: () => <Loading text="Finding config..." />,
                Error: ({ error }) => <Text color="red">Error finding config file: {error.message}</Text>
            }
        })
        // Generate Code
        useOperation({
            dependencies: [useApplicationStore(store => store.uixConfig)],
            operationKey: 'codeGeneration',
            tryOp: async ([uixConfig]) => {
                await new Promise(resolve => setTimeout(resolve, 500))
                const pathToFiles = path.join(process.cwd(), uixConfig.outdir)
                await mkdir(pathToFiles, { recursive: true })
                await writeFile(
                    path.join(pathToFiles, 'functionModule.ts'),
                    functionModuleTemplate(uixConfig)
                )
                await writeFile(
                    path.join(pathToFiles, 'queryOptions.ts'),
                    queryOptionsTemplate()
                )
                await writeFile(
                    path.join(pathToFiles, 'staticObjects.ts'),
                    staticObjectsTemplate(uixConfig)
                )
                await writeFile(
                    path.join(pathToFiles, 'useUniqueChild.ts'),
                    useUniqueChildTemplate()
                )
                await writeFile(
                    path.join(pathToFiles, 'useNodeKey.ts'),
                    useNodeKeyTemplate()
                )
                await writeFile(
                    path.join(pathToFiles, 'useNodeSet.ts'),
                    useNodeSetTemplate()
                )
                await writeFile(
                    path.join(pathToFiles, 'useNodeIndex.ts'),
                    useNodeIndexTemplate()
                )
                await writeFile(
                    path.join(pathToFiles, 'useNodeType.ts'),
                    useNodeTypeTemplate()
                )
                return true
            },
            catchOp: (error: Error) => UixErr({
                subtype: UixErrSubtype.CODE_GENERATION_FAILED,
                message: `Code generation failed: ${error.message}`,
                data: { error }
            }),
            render: {
                Success: ({ dependencies: [uixConfig] }) => <Text>✅ Code Generated @{uixConfig.outdir}: Fully-typed operations</Text>,
                Pending: () => <Loading text="Generating code..." />,
                Error: ({ error }) => <Text >❌ Error generating code: {error.message}</Text>
            }
        })
        const outputMap = useApplicationStore(store => store.outputMap)

        return (<>
            <Box flexDirection='column'>
                <Box flexDirection='column' paddingBottom={1}>
                    <Newline />
                    <Text>🕳️  🐰 Thin Air Codegen 🐰 🕳️</Text>
                </Box>
            </Box>
            {/* Outputs */}
            {[...outputMap].map(([key, { Component }]) => <Component key={key} />)}
            {[...outputMap].every(([_, { operationState }]) => operationState === 'success') && <>
                <Text>🚀 Uix System Generation Complete!</Text>
                <Newline />
            </>}
            {/* Seed Database */}
            <SeedNeo4j />
        </>)
    }
})

export default Codegen;









