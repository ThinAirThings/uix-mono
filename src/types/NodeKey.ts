import { AnyNodeTypeMap } from "./NodeType"

export type GenericNodeKey = NodeKey<
    AnyNodeTypeMap,
    keyof AnyNodeTypeMap
>
export type NodeKey<
    NodeTypeMap extends AnyNodeTypeMap,
    NodeType extends ({
        [K in keyof NodeTypeMap]: NodeTypeMap[K]['type'] | `${NodeTypeMap[K]['type']}Vector`
    }[keyof NodeTypeMap])
> = {
    nodeType: NodeType
    nodeId: string
}

export type VectorKeys<NodeTypeMap extends AnyNodeTypeMap> = {
    [Type in keyof NodeTypeMap]: `${NodeTypeMap[Type]['type']}Vector`
}[keyof NodeTypeMap]

export type TypeFromVectorType<
    NodeTypeMap extends AnyNodeTypeMap,
    T extends VectorKeys<NodeTypeMap>
> = T extends `${infer U}Vector` ? U : never