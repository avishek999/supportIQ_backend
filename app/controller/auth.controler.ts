import { Request,Response } from "express"
import { User } from "../models/user.model"
import jwt from "jsonwebtoken";
import { JWT_SECRET, NODE_ENV } from "../utils/config";
import { loginSchema, registerSchem } from "../dto/auto.dto";


export const registerUser = async(req:Request, res:Response)=>{


    try {

        const result =  registerSchem.safeParse(req.body);


        if (!result.success) {
            return res.status(400).json({ message: result.error.issues[0].message });
        }

        const { name, email, password } = result.data;
        
        const existingUser = await User.findOne({email})
        if(existingUser){
            return res.status(400).json({message:"User already exists"})
        }

        const user = await User.create({name,email,password})
        const token = jwt.sign(
            {id:user._id,email: user.email}, JWT_SECRET || "default_secret", {expiresIn: "1d"}
        )

        const cookieOptions = {
            httpOnly: true,
            secure: NODE_ENV === "production",
            sameSite: (NODE_ENV === "production" ? "strict" : "lax") as "strict" | "lax",
            maxAge: 1000 * 60 * 60 * 24 * 7
        };
        return res.status(201).cookie("token", token, cookieOptions).json({message:"User registered successfully",user})
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({message:"Internal server error"})
    }
    
}   

export const loginUser = async(req:Request, res:Response)=>{
    
    try {
         const result =  loginSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({ message: result.error.issues[0].message });
        }

        const { email, password } = result.data;

        const user = await User.findOne({email})
        if(!user){
            return res.status(404).json({message:"User not found"})
        }

        const isPasswordValid = await user.comparePassword(password)
        if(!isPasswordValid){
            return res.status(401).json({message:"Invalid password"})
        }
       // auto login after register
       const token = jwt.sign(
            { id: user._id, email: user.email },
            JWT_SECRET || "default_secret",
            { expiresIn: "1d" } // Token expires in 1 day
        );
        const cookieOptions = {
            httpOnly: true,
            secure: NODE_ENV === "production",
            sameSite: (NODE_ENV === "production" ? "strict" : "lax") as "strict" | "lax",
            maxAge: 1000 * 60 * 60 * 24 * 7
        };
        return res.status(200).cookie("token", token, cookieOptions).json({message:"User logged in successfully",user :{
            id: user._id,
            name: user.name,
            email: user.email,
            
        }})
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({message:"Internal server error"})
    }
}

export const logoutUser = async (_req: Request, res: Response) => {
    try {
        const cookieOptions = {
            httpOnly: true,
            secure: NODE_ENV === "production",
            sameSite: (NODE_ENV === "production" ? "strict" : "lax") as "strict" | "lax",
            expires: new Date(0)
        };
        return res
            .status(200)
            .cookie("token", "", cookieOptions)
            .json({ message: "Logged out successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getMe = async (req: Request, res: Response) => {
    try {
        const authReq = req as any;
        if (!authReq.user?.id) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const user = await User.findById(authReq.user.id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json({ user });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};