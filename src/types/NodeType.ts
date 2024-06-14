import { TypeOf, ZodObject, ZodOptional, ZodTypeAny, z, ZodString, ZodRawShape, ZodLiteral, AnyZodObject, ZodDefault, ZodType } from "zod";
import { AnyRelationshipTypeSet, GenericRelationshipTypeSet, RelationshipType } from "./RelationshipType.js";

//  _   _ _   _ _ _ _          _____                  
// | | | | |_(_) (_) |_ _  _  |_   _|  _ _ __  ___ ___
// | |_| |  _| | | |  _| || |   | || || | '_ \/ -_|_-<
//  \___/ \__|_|_|_|\__|\_, |   |_| \_, | .__/\___/__/
//                      |__/        |__/|_|           
type UnwrapZodOptional<T extends ZodTypeAny> = T extends ZodOptional<infer U> ? U : T;
type UnwrapZodDefault<T extends ZodTypeAny> = T extends ZodDefault<infer U> ? U : T;
export type AnyNodeType = NodeType<any, any, any, any>
export type GenericNodeType = NodeType<
    Capitalize<string>,
    AnyZodObject,
    ['nodeId', ...readonly Capitalize<string>[]],
    GenericRelationshipTypeSet
>
export type GenericNodeTypeSet = readonly GenericNodeType[]
export type AnyNodeTypeSet = readonly AnyNodeType[]

export type AnyNodeTypeMap = NodeTypeMap<AnyNodeTypeSet>
export type GenericNodeTypeMap = NodeTypeMap<GenericNodeTypeSet>

export type NodeTypeMap<NodeTypeSet extends AnyNodeTypeSet> = {
    [Type in NodeTypeSet[number]['type']]: (NodeTypeSet[number] & { type: Type })
}

export type NodeState<T extends AnyNodeType> = TypeOf<T['stateSchema']>

export type NodeShape<T extends AnyNodeType> = NodeState<T> & {
    nodeId: string
    nodeType: T['type']
    createdAt: string
    updatedAt: string
}
//  ___       __ _      _ _   _          
// |   \ ___ / _(_)_ _ (_) |_(_)___ _ _  
// | |) / -_)  _| | ' \| |  _| / _ \ ' \ 
// |___/\___|_| |_|_||_|_|\__|_\___/_||_| 
export class NodeType<
    Type extends Capitalize<string> = Capitalize<string>,
    StateSchema extends AnyZodObject = AnyZodObject,
    UniqueIndexes extends (readonly (keyof TypeOf<StateSchema> | 'nodeId')[]) | ['nodeId'] = ['nodeId'],
    RelationshipTypeSet extends AnyRelationshipTypeSet | [] = []
> {
    //      ___             _               _           
    //     / __|___ _ _  __| |_ _ _ _  _ __| |_ ___ _ _ 
    //    | (__/ _ \ ' \(_-<  _| '_| || / _|  _/ _ \ '_|
    //     \___\___/_||_/__/\__|_|  \_,_\__|\__\___/_|  

    constructor(
        public type: Type,
        public stateSchema: StateSchema,
        public uniqueIndexes: UniqueIndexes = ['nodeId'] as UniqueIndexes,
        public relationshipTypeSet: RelationshipTypeSet = [] as RelationshipTypeSet,
        public shapeSchema = stateSchema.extend({
            nodeId: z.string(),
            nodeType: z.literal(type),
            createdAt: z.string(),
            updatedAt: z.string()
        })
    ) { }
    //  ___      _ _    _            
    // | _ )_  _(_) |__| |___ _ _ ___
    // | _ \ || | | / _` / -_) '_(_-<
    // |___/\_,_|_|_\__,_\___|_| /__/
    // Note, you could change this to 'uniqueIndex' and declare these 1 by 1. This would allow you to easily constrain duplicates
    defineUniqueIndexes<UniqueIndexes extends readonly (keyof TypeOf<StateSchema>)[]>(
        indexes: UniqueIndexes
    ) {
        return new NodeType(
            this.type,
            this.stateSchema,
            [...indexes, 'nodeId']
        );
    }
    defineUniqueRelationship<
        ToNodeType extends AnyNodeType
    >(
        toNodeType: ToNodeType,
    ) {
        return new NodeType(
            this.type,
            this.stateSchema,
            this.uniqueIndexes,
            [
                ...(this.relationshipTypeSet),
                new RelationshipType(
                    'Unique' as const,
                    this,
                    `UNIQUE_TO` as Uppercase<string>,
                    toNodeType,
                )
            ]
        );
    }
    defineSetRelationship<
        ToNodeType extends AnyNodeType
    >(
        toNodeType: ToNodeType,
    ) {
        return new NodeType(
            this.type,
            this.stateSchema,
            this.uniqueIndexes,
            [
                ...(this.relationshipTypeSet),
                new RelationshipType(
                    'Set' as const,
                    this,
                    `CHILD_TO` as Uppercase<string>,
                    toNodeType,
                )
            ]
        );
    }
    defineEdgeRelationship<
        RelationshipType extends Uppercase<string>,
        ToNodeType extends AnyNodeType
    >(
        relationshipType: RelationshipType,
        toNodeType: ToNodeType
    ) {
        return new NodeType(
            this.type,
            this.stateSchema,
            this.uniqueIndexes,
            [
                ...(this.relationshipTypeSet),
                new RelationshipType(
                    'Edge' as const,
                    this,
                    relationshipType,
                    toNodeType,
                )
            ]
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


export const defineUserNodeType = <
    StateSchema extends ZodObject<any>
>(
    stateSchema: StateSchema
) => defineNodeType('User', stateSchema);