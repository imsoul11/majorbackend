import { asyncHandler } from '../utils/asyncHandler.js'
import { apiError } from '../utils/apiError.js'
import { User } from '../models/user.model.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { apiResponse } from '../utils/apiResponse.js'
import jwt from 'jsonwebtoken'
import e from 'express'
const generateAccessAndRefreshToken = async (userId) => {
    try{
        const user= await User.findById(userId)
        const accessToken= await user.generateAccessToken()
        const refreshToken= await user.generateRefreshToken()
        user.refreshToken=refreshToken
        user.save({validateBeforeSave:false})   
        return {accessToken,refreshToken}
    }
    catch(error){
        throw new apiError(500,"Error in generating tokens")
    }

}

const registerUser = asyncHandler(async (req, res) => {
    console.log('this is working i am goint to register user now')
    // get user detail from frontend
    // validation - not empty, email format, password length
    // check if user already exists :username,email
    // check for images,check for avatar for cloudinary
    // upload them to cloudinart,acatar
    // create user object- entry in db
    // remove passwoed and refresh toke from response
    // check for user creation
    // return res

    const { fullName, email, username, password } = req.body
    console.log(fullName, email, username, password)
    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new apiError(400, "All fields are required")
    }
    const existedUser = await User.findOne({
        $or: [{
            email: email
        }, {
            username: username
        }]
    })
    if (existedUser) {
        throw new apiError(400, "User already exists")
    }
    // req.files is given by multer
    // req.body is given by express
    // this body contains al the data that is sent by the frontend
    // but it does not contain the files
    // so the middleware multer which we added in the route will give the access to file by req.files

    const avatarLocalPath = req.files?.avatar[0]?.path
    // const coverImageLocalPath=req.files?.coverImage[0]?.path
    let coverImageLocalPath;
    if (req.files && req.files.coverImage && Array.isArray(req.files.coverImage)) {
        if (req.files.coverImage.length > 0) {
            coverImageLocalPath = req.files.coverImage[0].path;
        }
    }

    console.log(req.files)
    if (!avatarLocalPath) {
        throw new apiError(400, "Avatar is required")
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new apiError(400, "Error in uploading image")
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || '',
        email,
        password,
        username: username.toLowerCase(),

    })

    const createdUser = await User.findById(user._id).select(
         "-password -refreshToken"
        // these fields are not required to be sent to the frontend
    )
    if (!createdUser) {
        throw new apiError(400, "Error in registering user")
    }

    console.log(createdUser)
    return res.status(201).json(new apiResponse(201, createdUser, "User registered successfully"))
})
const loginUser = asyncHandler(async (req, res) => {
    console.log('this is working i am going to login user now')
    // get details from frontend
    // verifgy that they are in right format like check cases for undefined
    // check for user in database 
    // if he is there then return it 
    // give refresh token/access token
    console.log(req.body)
    const {email,username,password} = req.body
    console.log(email)
    if(!username && !email)
        {
            throw new apiError(400,"Username or email is required")
        }
    const user= await User.findOne({
        $or:[{username},{email}]
    })   
    
    if(!user)
        {
            throw new apiError(400,"User does not exists")
        }
    const isPasswordValid=await user.isPasswordCorrect(password)
    if(!isPasswordValid)
        {
            throw new apiError(401,"Invalid password")
        }
    const {accessToken,refreshToken}=await generateAccessAndRefreshToken(user._id)
    
    const loggedInUser= await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true,
    }
    return res.status(200)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(new apiResponse(200, {user:loggedInUser,accessToken,refreshToken}, "User logged in successfully"))
})
const logoutUser = asyncHandler(async (req, res) => {
   await User.findByIdAndUpdate(req.user._id, { $set: { refreshToken: undefined} }, { new: true} )
   const options = {        
    httpOnly: true,
    secure: true,
   }
    return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new apiResponse(200, {}, "User logged out successfully"))
})
const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if (!incomingRefreshToken) {
        throw new apiError(401, "Unauthorized")
    }
 try {
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
    const user = User.findById(decodedToken._id)
    if(!user)
       {
           throw new apiError(401, "Unauthorized")
       }
   if(user?.refreshToken !== incomingRefreshToken)
       {
          throw new apiError(401, "Refresh token is invalid")
       }
       const options = {
           httpOnly: true,
           secure: true,
       }
       
       const {newRefreshToken,accessToken} = await generateAccessAndRefreshToken(user._id)
       
       return res.status(200)
       .cookie("refreshToken", newRefreshToken, options)
       .cookie("accessToken", accessToken, options)
       .json(new apiResponse(200, {accessToken, refreshToken:newRefreshToken}, "Token refreshed successfully"))
 } catch (error) {
        throw new apiError(401, error.message)
 }
})
export { registerUser, loginUser, logoutUser, refreshAccessToken }


/*
Mongoose offers a variety of query types to perform various operations on your MongoDB database. Here are some common types:

1. Document Retrieval:

findOne: Retrieves a single document based on the specified query criteria.
find: Retrieves an array of documents that match the specified query criteria.
findById: Retrieves a single document by its unique ID.
findByIdAndUpdate: Finds a document by ID and updates it with the provided data.
findByIdAndRemove: Finds a document by ID and removes it from the collection.
2. Document Modification:

updateOne: Updates a single document that matches the specified query criteria.
updateMany: Updates multiple documents that match the specified query criteria.
replaceOne: Replaces a single document with the provided data.
3. Aggregation:

aggregate: Performs complex data manipulation and analysis using aggregation pipelines.
4. Query Operators:

$eq: Matches documents where the specified field is equal to a value.
$gt: Matches documents where the specified field is greater than a value.
$lt: Matches documents where the specified field is less than a value.
$in: Matches documents where the specified field is within an array of values.
$nin: Matches documents where the specified field is not within an array of values.
$or: Matches documents that satisfy any of the provided conditions.
$and: Matches documents that satisfy all of the provided conditions.
$regex: Matches documents where the specified field matches a regular expression.
5. Other Query Methods:

countDocuments: Counts the number of documents that match the specified query criteria.
distinct: Retrieves a list of unique values for a specific field.
These are just some of the most common Mongoose query types. You can explore the Mongoose documentation for a more comprehensive list and detailed explanations: https://mongoosejs.com/docs/queries.html
*/