import {z} from "zod"

export const registerSchem = z.object({
    name: z.string().min(3, "Name must be at least 3 characters long"),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters long"),    
})


export const loginSchema = z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters long"),    
})

export type RegisterInput = z.infer<typeof registerSchem>
export type LoginInput = z.infer<typeof loginSchema>