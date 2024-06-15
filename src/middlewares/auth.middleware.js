import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { apiError } from "../utils/apiError.js";
// learn headers in this httl request and how to handle it
export const verifyjwt = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.headers("Authorization")?.replace("Bearer ", "")
        // it basically finds the token from the cookies or from the headers and then sets the req.user to the user
        // which is used by other functions to get the user
        console.log("jwt is being called for checking login status")
        if (!token) {
            throw new apiError(401, "No token provided")
        }
        // it take the user from the token give us the information
        const decodedToken=jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        // console.log("what is the differnce between ",token, " and",decodedToken)
        // basically we are verifying the token and then we are getting the decoded token
        // so on the basis of the decoded token we are getting the user
        
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
// if the user is logged in then we will have the user in the req.user everytime we send the an important request 
// so basically it is like an middleware