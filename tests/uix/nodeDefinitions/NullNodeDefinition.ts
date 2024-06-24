
import { z } from "zod";
import { UserNodeDefinition } from "./UserNodeDefinition"
import { defineNodeType } from "@thinairthings/uix";
import { DummyNodeDefinition } from "./DummyNodeDefinition";

export const NullNodeDefinition = defineNodeType('Null', z.object({}))
    .defineNodeSetRelationship(UserNodeDefinition)
    .defineNodeSetRelationship(DummyNodeDefinition)