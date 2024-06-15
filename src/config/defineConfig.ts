import { AnyNodeTypeSet, GenericNodeTypeSet } from "../types/NodeType"
import { GraphType } from "../types/GraphType"
import path from 'path'
import { getCallerFile } from "../app/(utilities)/getCallerFile"

export type UixConfig<
    Type extends Capitalize<string>,
    NodeTypeSet extends AnyNodeTypeSet,
> = {
    outdir: string,
    graph: GraphType<Type, NodeTypeSet>
    pathToConfig: string,
    neo4jConfig: {
        uri: string,
        username: string,
        password: string
    }
}
export type GenericUixConfig = UixConfig<
    Capitalize<string>,
    GenericNodeTypeSet
>
export const defineConfig = <
    Type extends Capitalize<string>,
    NodeTypeSet extends AnyNodeTypeSet,
>(
    options: Omit<
        UixConfig<Type, NodeTypeSet>
        , 'graph' | 'pathToConfig'> & {
            type: Type
            nodeTypeSet: NodeTypeSet
        }
): UixConfig<
    Type,
    NodeTypeSet
> => {
    return {
        outdir: options.outdir ?? path.join('uix', 'output'),
        graph: new GraphType(
            options.type,
            options.nodeTypeSet,
        ),
        pathToConfig: getCallerFile(),
        neo4jConfig: options.neo4jConfig
    }
}