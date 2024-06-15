import { defineNodeType } from "@thinairthings/uix";
import { z } from "zod";


export const ProfileNodeDefinition = defineNodeType('Profile', z.object({
    aboutMe: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    skills: z.array(z.string()).optional(),
    age: z.number().optional(),
}))
    .definePropertyVector(['aboutMe'])
    .defineNodeTypeVectorDescription(
        + `A profile type node that represents a user's profile type.`
        + `This type should holistically represent the person who owns the profile such that all semantic meaning relevant to how this person would fit for a job position is captured.`
    )