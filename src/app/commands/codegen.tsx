
import React, { FC, createContext, useContext } from 'react';
import { Text, Box } from 'ink';
import { z, TypeOf } from 'zod';
import { Loading } from '../(components)/Loading';
import { Providers } from '../(components)/Providers';
import { skipToken, useQuery } from '@tanstack/react-query';
import { GenericUixConfig } from '../../config/defineConfig';
import { require } from 'tsx/cjs/api'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { functionModuleTemplate } from './(codegen)/fileTemplates/functionModuleTemplate';
import Gradient from 'ink-gradient';
import BigText from 'ink-big-text';
import { SeedNeo4j } from './(seedNeo4j)/SeedNeo4j';
import { createImmerState } from '../(utilities)/createImmerState';

export const options = z.object({
    pathToConfig: z.string().transform(relativePath => {
        if (relativePath.slice(0, 1) === '/') return relativePath
        return path.join(process.cwd(), relativePath)
    }).default(path.join(process.cwd(), 'uix', 'uix.config.ts')).describe('Path to uix.config.ts file'),
});

export type CodegenOptions = TypeOf<typeof options>;
export const isDefault = true;

export const codegenStore = createImmerState({
    uixConfig: null as GenericUixConfig | null,
})

const Codegen: FC<{
    options: TypeOf<typeof options>;
}> = ({
    options
}) => Providers({
    Command: () => {
        // Get config
        const { data: uixConfig, error: uixConfigError } = useQuery({
            queryKey: ['uixConfig'],
            queryFn: async () => {
                const {
                    default: config
                } = require(options.pathToConfig, import.meta.url) as {
                    default: GenericUixConfig
                }
                return config
            }
        })
        const { error: writeFunctionModuleError } = useQuery({
            queryKey: ['writeFunctionModule'],
            queryFn: uixConfig ? async () => {
                const pathToFiles = path.join(process.cwd(), uixConfig.outdir)
                await mkdir(pathToFiles, { recursive: true })
                await writeFile(
                    path.join(pathToFiles, 'functionModule.ts'),
                    functionModuleTemplate(uixConfig)
                )
                return true
            } : skipToken,
        })
        if (uixConfigError) return <Text color="red">Error finding config file: {uixConfigError?.message}</Text>
        if (writeFunctionModuleError) return <Text color="red">Error writing function module: {writeFunctionModuleError?.message}</Text>
        if (!uixConfig) return <Loading text="Finding config..." />
        codegenStore.setState(({ uixConfig }))

        return (<>
            <Box flexDirection='column'>
                <Box flexDirection='column' paddingBottom={1}>
                    <Gradient name='vice'>
                        <BigText text="Uix" font='simple' />
                    </Gradient>
                    <Text color='yellowBright'>by Thin Air</Text>
                </Box>
                <Text>✅ Code Generated @{uixConfig?.outdir}: Fully-typed operations</Text>
            </Box>
            {/* Seed Database */}
            <SeedNeo4j />
        </>)
    }
})

export default Codegen;