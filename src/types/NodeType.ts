import { TypeOf, ZodObject, ZodOptional, ZodTypeAny, z, ZodString, ZodRawShape, ZodLiteral, AnyZodObject, ZodDefault, ZodType } from "zod";
import { AnyRelationshipTypeSet, GenericRelationshipTypeSet, RelationshipType } from "./RelationshipType.js";
import { Integer } from "neo4j-driver";
//  _   _ _   _ _ _ _          _____                  
// | | | | |_(_) (_) |_ _  _  |_   _|  _ _ __  ___ ___
// | |_| |  _| | | |  _| || |   | || || | '_ \/ -_|_-<
//  \___/ \__|_|_|_|\__|\_, |   |_| \_, | .__/\___/__/
//                      |__/        |__/|_|           

export type AnyNodeType = NodeType<any, any, any, any, any, any>
export type GenericNodeType = NodeType<
    Capitalize<string>,
    AnyZodObject,
    ['nodeId'],
    [],
    GenericRelationshipTypeSet,
    { type: string, description: string } | undefined
>
export type GenericNodeTypeSet = readonly GenericNodeType[]
export type AnyNodeTypeSet = readonly AnyNodeType[]

export type AnyNodeTypeMap = NodeTypeMap<AnyNodeTypeSet>
export type GenericNodeTypeMap = NodeTypeMap<GenericNodeTypeSet>

export type NodeTypeMap<NodeTypeSet extends AnyNodeTypeSet> = {
    [Type in NodeTypeSet[number]['type']]: (NodeTypeSet[number] & { type: Type })
}

export type NodeState<T extends AnyNodeType> = TypeOf<T['stateSchema']>
export type AnyNodeShape = NodeShape<AnyNodeType>
export type GenericNodeShape = NodeShape<GenericNodeType>
export type NodeShape<T extends AnyNodeType> = NodeState<T> & {
    nodeId: string
    nodeType: T['type']
    createdAt: number
    updatedAt: number
}

export type GenericNeo4jNodeShape = Neo4jNodeShape<GenericNodeType>
export type AnyNeo4jNodeShape = Neo4jNodeShape<AnyNodeType>
export type Neo4jNodeShape<T extends AnyNodeType> = NodeState<T> & {
    nodeId: string
    nodeType: T['type']
    createdAt: Integer
    updatedAt: Integer
}
export type VectorNodeShape<T extends AnyNodeType> = ({
    [K in keyof TypeOf<T['stateSchema']> as K extends T['propertyVectors'][number]
    ? K
    : never
    ]-?: number[]
}) & ({
    nodeId: string
    nodeType: T['type']
    createdAt: string
    updatedAt: string
}) & (T['nodeTypeVectorDescription'] extends { type: string, description: string }
    ? {
        nodeTypeSummary: string
        nodeTypeEmbedding: number[]
    } : {})

export type NodeSetParentTypes<NodeTypeMap extends AnyNodeTypeMap> = {
    [Type in keyof NodeTypeMap]: (NodeTypeMap[Type]['relationshipTypeSet'][number] & { relationshipClass: 'Set' }) extends AnyRelationshipTypeSet
    ? never
    : Type
}[keyof NodeTypeMap]

export type UniqueParentTypes<NodeTypeMap extends AnyNodeTypeMap> = {
    [Type in keyof NodeTypeMap]: (NodeTypeMap[Type]['relationshipTypeSet'][number] & { relationshipClass: 'Unique' }) extends AnyRelationshipTypeSet
    ? never
    : Type
}[keyof NodeTypeMap]


export type NodeSetChildNodeTypes<
    NodeTypeMap extends AnyNodeTypeMap,
    ParentNodeType extends keyof NodeTypeMap
> = (NodeTypeMap[ParentNodeType]['relationshipTypeSet'][number] & { relationshipClass: 'Set' })['toNodeType']['type']

export type UniqueChildNodeTypes<
    NodeTypeMap extends AnyNodeTypeMap,
    ParentNodeType extends keyof NodeTypeMap
> = (NodeTypeMap[ParentNodeType]['relationshipTypeSet'][number] & { relationshipClass: 'Unique' })['toNodeType']['type']



type StringProperties<T extends AnyZodObject> = {
    [K in keyof TypeOf<T>]: NonNullable<TypeOf<T>[K]> extends string ? K : never
}[keyof TypeOf<T>]

type TriggerMap<NodeShape extends AnyNodeShape> = Map<'onCreate' | 'onUpdate' | 'onDelete',
    Map<string, (node: NodeShape) => void>
>
//  ___       __ _      _ _   _          
// |   \ ___ / _(_)_ _ (_) |_(_)___ _ _  
// | |) / -_)  _| | ' \| |  _| / _ \ ' \ 
// |___/\___|_| |_|_||_|_|\__|_\___/_||_| 
export class NodeType<
    Type extends Capitalize<string> = Capitalize<string>,
    StateSchema extends AnyZodObject = AnyZodObject,
    UniqueIndexes extends (readonly (keyof TypeOf<StateSchema> | 'nodeId')[]) | ['nodeId'] = ['nodeId'],
    PropertyVectors extends (readonly (StringProperties<StateSchema>)[]) | [] = [],
    RelationshipTypeSet extends AnyRelationshipTypeSet | [] = [],
    NodeTypeVectorDescription extends { type: string, description: string } | undefined = undefined,
> {

    //      ___             _               _           
    //     / __|___ _ _  __| |_ _ _ _  _ __| |_ ___ _ _ 
    //    | (__/ _ \ ' \(_-<  _| '_| || / _|  _/ _ \ '_|
    //     \___\___/_||_/__/\__|_|  \_,_\__|\__\___/_|  
    constructor(
        public type: Type,
        public stateSchema: StateSchema,
        public uniqueIndexes: UniqueIndexes = ['nodeId'] as UniqueIndexes,
        public propertyVectors: PropertyVectors = [] as PropertyVectors,
        public relationshipTypeSet: RelationshipTypeSet = [] as RelationshipTypeSet,
        public nodeTypeVectorDescription: NodeTypeVectorDescription = undefined as NodeTypeVectorDescription,
        public triggerMap: TriggerMap<NodeShape<NodeType<Type, StateSchema, UniqueIndexes, PropertyVectors, RelationshipTypeSet, NodeTypeVectorDescription>>> = new Map(),
        public shapeSchema = stateSchema.extend({
            nodeId: z.string(),
            nodeType: z.literal(type),
            createdAt: z.string(),
            updatedAt: z.string()
        })
    ) { }
    //  _  _         _       ___     _               _             
    // | \| |___  __| |___  | __|_ _| |_ ___ _ _  __(_)___ _ _  ___
    // | .` / _ \/ _` / -_) | _|\ \ /  _/ -_) ' \(_-< / _ \ ' \(_-<
    // |_|\_\___/\__,_\___| |___/_\_\\__\___|_||_/__/_\___/_||_/__/
    // Note, you could change this to 'uniqueIndex' and declare these 1 by 1. This would allow you to easily constrain duplicates
    defineUniqueIndexes<UniqueIndexes extends readonly (keyof TypeOf<StateSchema>)[]>(
        indexes: UniqueIndexes
    ) {
        return new NodeType(
            this.type,
            this.stateSchema,
            [...indexes, 'nodeId'],
            this.propertyVectors,
            this.relationshipTypeSet,
            this.nodeTypeVectorDescription
        );
    }
    defineNodeTypeVectorDescription({
        type,
        description
    }: {
        type: string,
        description: string,
    }) {
        return new NodeType(
            this.type,
            this.stateSchema,
            this.uniqueIndexes,
            this.propertyVectors,
            this.relationshipTypeSet,
            { type, description }
        );
    }
    // You might want to embed the property keys too
    definePropertyVector<PropertyKey extends readonly (StringProperties<StateSchema>)[]>(
        propertyKeys: PropertyKey
    ) {
        return new NodeType(
            this.type,
            this.stateSchema,
            this.uniqueIndexes,
            [...this.propertyVectors, ...propertyKeys],
            this.relationshipTypeSet,
            this.nodeTypeVectorDescription
        );
    }
    //  ___     _      _   _             _    _        ___      _ _    _            
    // | _ \___| |__ _| |_(_)___ _ _  __| |_ (_)_ __  | _ )_  _(_) |__| |___ _ _ ___
    // |   / -_) / _` |  _| / _ \ ' \(_-< ' \| | '_ \ | _ \ || | | / _` / -_) '_(_-<
    // |_|_\___|_\__,_|\__|_\___/_||_/__/_||_|_| .__/ |___/\_,_|_|_\__,_\___|_| /__/
    //                                         |_|                                  
    defineUniqueRelationship<
        ToNodeType extends AnyNodeType
    >(
        toNodeType: ToNodeType,
    ) {
        return new NodeType(
            this.type,
            this.stateSchema,
            this.uniqueIndexes,
            this.propertyVectors,
            [
                ...(this.relationshipTypeSet),
                new RelationshipType(
                    'Unique' as const,
                    this,
                    `UNIQUE_TO` as Uppercase<string>,
                    toNodeType,
                )
            ],
            this.nodeTypeVectorDescription
        );
    }
    defineNodeSetRelationship<
        ToNodeType extends AnyNodeType
    >(
        toNodeType: ToNodeType,
    ) {
        return new NodeType(
            this.type,
            this.stateSchema,
            this.uniqueIndexes,
            this.propertyVectors,
            [
                ...(this.relationshipTypeSet),
                new RelationshipType(
                    'Set' as const,
                    this,
                    `CHILD_TO` as Uppercase<string>,
                    toNodeType,
                )
            ],
            this.nodeTypeVectorDescription
        );
    }
    defineEdgeRelationship<
        EdgeRelationshipType extends Uppercase<string>,
        ToNodeType extends AnyNodeType
    >(
        relationshipType: EdgeRelationshipType,
        toNodeType: ToNodeType
    ) {
        return new NodeType(
            this.type,
            this.stateSchema,
            this.uniqueIndexes,
            this.propertyVectors,
            [
                ...(this.relationshipTypeSet),
                new RelationshipType(
                    'Edge' as const,
                    this,
                    relationshipType,
                    toNodeType,
                )
            ],
            this.nodeTypeVectorDescription
        );
    }




}


//  ___       __ _                 
// |   \ ___ / _(_)_ _  ___ _ _ ___
// | |) / -_)  _| | ' \/ -_) '_(_-<
// |___/\___|_| |_|_||_\___|_| /__/

export const defineNodeType = <
    Type extends Capitalize<string>,
    StateSchema extends ZodObject<any>,
>(
    type: Type,
    stateSchema: StateSchema
) => new NodeType(type, stateSchema);


export const defineRootNodeType = () => defineNodeType('Root', z.object({}));

export const defineUserNodeType = <
    StateSchema extends ZodObject<any>
>(
    stateSchema: StateSchema
) => defineNodeType('User', stateSchema);