import { useQuery } from "@tanstack/react-query";
import { CodegenOptions } from "../../codegen";
import { GenericUixConfig } from "../../../../config/defineConfig";
import { require } from 'tsx/cjs/api'


export const useConfig = (options: CodegenOptions) => {
    return useQuery({
        queryKey: ['config'],
        queryFn: async () => {
            try {
                const {
                    default: config
                } = require(options.pathToConfig, import.meta.url) as {
                    default: GenericUixConfig
                }
                return config

            } catch (e) {
                console.log(e)
                throw new Error(`Could not find config at ${options.pathToConfig}`)
            }
        }
    })
}