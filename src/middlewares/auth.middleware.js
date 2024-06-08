import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
export const verifyjwt = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.headers("Authorization")?.replace("Bearer ", "")
        if (!token) {
            throw new apiError(401, "No token provided")
        }
        const decodedToken=jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken ")
        if (!user) {
            throw new apiError(401, "Unauthorized")
        }
        req.user = user;
        next();
    } catch (error) {
        throw new apiError(401, "Unauthorized")
    }
})

// this is to check if the user is logged in or not
// if the user is logged in then we will have the user in the req.user