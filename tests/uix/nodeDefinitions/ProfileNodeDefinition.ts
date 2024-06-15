import { defineNodeType } from "@thinairthings/uix";
import { z } from "zod";


export const ProfileNodeDefinition = defineNodeType('Profile', z.object({
    aboutMe: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    skills: z.array(z.string()).optional()
}))
    .definePropertyVector(['aboutMe'])