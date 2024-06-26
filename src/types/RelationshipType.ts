import { ZodObject } from "zod"
import { AnyNodeType, GenericNodeType } from "./NodeType"


//  _   _ _   _ _ _ _          _____                  
// | | | | |_(_) (_) |_ _  _  |_   _|  _ _ __  ___ ___
// | |_| |  _| | | |  _| || |   | || || | '_ \/ -_|_-<
//  \___/ \__|_|_|_|\__|\_, |   |_| \_, | .__/\___/__/
//                      |__/        |__/|_|    
export type AnyRelationshipType = RelationshipType<any, any, any, any, any>
export type GenericRelationshipType = RelationshipType<
    RelationshipClassType,
    AnyNodeType,
    Uppercase<string>,
    AnyNodeType,
    ZodObject<any> | undefined
>
export type GenericRelationshipTypeSet = readonly GenericRelationshipType[]
export type AnyRelationshipTypeSet = readonly AnyRelationshipType[]
export type RelationshipClassType = 'Unique' | 'Set' | 'Edge'
//  ___       __ _      _ _   _          
// |   \ ___ / _(_)_ _ (_) |_(_)___ _ _  
// | |) / -_)  _| | ' \| |  _| / _ \ ' \ 
// |___/\___|_| |_|_||_|_|\__|_\___/_||_| 
export class RelationshipType<
    RelationshipClass extends RelationshipClassType = RelationshipClassType,
    FromNodeTypeSet extends AnyNodeType = GenericNodeType,
    Type extends Uppercase<string> = Uppercase<string>,
    ToNodeType extends AnyNodeType = GenericNodeType,
    StateSchema extends ZodObject<any> | undefined = undefined,
> {
    //      ___             _               _           
    //     / __|___ _ _  __| |_ _ _ _  _ __| |_ ___ _ _ 
    //    | (__/ _ \ ' \(_-<  _| '_| || / _|  _/ _ \ '_|
    //     \___\___/_||_/__/\__|_|  \_,_\__|\__\___/_|  
    constructor(
        public relationshipClass: RelationshipClass,
        public fromNodeTypeSet: FromNodeTypeSet,
        public type: Type,
        public toNodeType: ToNodeType,
        public stateSchema: StateSchema = undefined as StateSchema
    ) { }

    //  ___      _ _    _            
    // | _ )_  _(_) |__| |___ _ _ ___
    // | _ \ || | | / _` / -_) '_(_-<
    // |___/\_,_|_|_\__,_\___|_| /__/

    defineStateSchema<StateSchema extends ZodObject<any>>(
        stateSchema: StateSchema
    ) {
        return new RelationshipType(
            this.relationshipClass,
            this.fromNodeTypeSet,
            this.type,
            this.toNodeType,
            stateSchema
        )
    }

}




//  ___       __ _                 
// |   \ ___ / _(_)_ _  ___ _ _ ___
// | |) / -_)  _| | ' \/ -_) '_(_-<
// |___/\___|_| |_|_||_\___|_| /__/

// export const defineRelationshipConstraint = <
//     NodeTypeSet extends AnyNodeTypeSet,
// >(
//     nodeDefinitions: NodeTypeSet
// ) => <
//     FromNodeTypeSet extends NodeTypeSet[number]['type'][],
//     RelationshipType extends Uppercase<string>,
//     ToNodeTypeSet extends NodeTypeSet[number]['type'][],
// >(
//     relationshipClass: RelationshipClassType,
//     fromNodeTypeSet: FromNodeTypeSet,
//     type: RelationshipType,
//     toNodeTypeSet: ToNodeTypeSet
// ) => new RelationshipType(
//     relationshipClass,
//     fromNodeTypeSet,
//     type,
//     toNodeTypeSet,
// ) 