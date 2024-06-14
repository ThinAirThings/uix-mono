import { skipToken, useQuery } from "@tanstack/react-query";
import { GenericUixConfig } from "../../../../config/defineConfig";

import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { functionModuleTemplate } from "../fileTemplates/functionModuleTemplate";

export const useWriteFunctionModule = (
    config: GenericUixConfig | undefined
) => {
    return useQuery({
        queryKey: ['writeFunctionModule'],
        queryFn: config ? async () => {
            const pathToFiles = path.join(process.cwd(), config.outdir)
            await mkdir(pathToFiles, { recursive: true })
            const result = await writeFile(path.join(pathToFiles, 'functionModule.ts'), functionModuleTemplate(config))
            return true
        } : skipToken,
    })
}
