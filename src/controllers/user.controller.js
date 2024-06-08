import { asyncHandler } from '../utils/asyncHandler.js'
import { apiError } from '../utils/apiError.js'
import { User } from '../models/user.model.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { apiResponse } from '../utils/apiResponse.js'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()
        user.refreshToken = refreshToken
        user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }
    }
    catch (error) {
        throw new apiError(500, "Error in generating tokens")
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
    const { email, username, password } = req.body
    console.log(email)
    if (!username && !email) {
        throw new apiError(400, "Username or email is required")
    }
    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new apiError(400, "User does not exists")
    }
    const isPasswordValid = await user.isPasswordCorrect(password)
    if (!isPasswordValid) {
        throw new apiError(401, "Invalid password")
    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true,
    }
    return res.status(200)
        .cookie("refreshToken", refreshToken, options)
        .cookie("accessToken", accessToken, options)
        .json(new apiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "User logged in successfully"))
})
const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } }, { new: true })
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
        const user = await User.findById(decodedToken._id)
        if (!user) {
            throw new apiError(401, "Unauthorized")
        }
        console.log(user?.refreshToken,"--------",incomingRefreshToken)
        if (user?.refreshToken !== incomingRefreshToken) {
            throw new apiError(401, "Refresh token is invalid")
        }
        const options = {
            httpOnly: true,
            secure: true,
        }

        const { newRefreshToken, accessToken } = await generateAccessAndRefreshToken(user._id)

        return res.status(200)
            .cookie("refreshToken", newRefreshToken, options)
            .cookie("accessToken", accessToken, options)
            .json(new apiResponse(200, { accessToken, refreshToken: newRefreshToken }, "Token refreshed successfully"))
    } catch (error) {
        throw new apiError(401, error.message)
    }
})
const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body
    console.log("this is rq.body ",req.body," this is it")
    const user = await User.findById(req.user?._id)
    console.log("are these password from req",oldPassword, newPassword)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
    if (!isPasswordCorrect) {
        throw new apiError(401, "Invalid password")
    }
    user.password = newPassword
    await user.save({ validateBeforeSave: false })

    return res.status(200).json(new apiResponse(200, {}, "Password changed successfully"))
})
const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(new apiResponse(200, req.user, "User fetched successfully"))
})
const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body
    if (!fullName || !email) {
        throw new apiError(400, "All fields are required")
    }
    // const user = await User.findByIdAndUpdate(req.user?._id, {fullName, email}, {new: true})
    const user = await User.findByIdAndUpdate(req.user?._id, {
        $set: {
            fullName,
            email
        }
    }, { new: true }).select("-password")

    return res.status(200).json(new apiResponse(200, user, "User details updated successfully"))
    // new: true will return the updated document
    // if the file(image of user) is updated always have a different controller/ api resonnse for that to reduce the congestion
})
const updateUserAvatar = asyncHandler(async (req, res) => {
    // TODO: after updating an image , delete the old image
    // develop a utility function which will delete the image from cloudinary after eveything is done

    const avatarLocalPath = req.file?.path
    if (!avatarLocalPath) {
        throw new apiError(400, "Avatar is required")
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if (!avatar.url) {
        throw new apiError(400, "Error in uploading avatar")
    }
    const user = await User.findByIdAndUpdate(req.user?._id, { avatar: avatar.url }, { new: true }).select("-password")
    return res.status(200).json(new apiResponse(200, user, "Avatar updated successfully"))
})
const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path
    if (!coverImageLocalPath) {
        throw new apiError(400, "Cover image is required")
    }
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if (!coverImage.url) {
        throw new apiError(400, "Error in uploading cover image")
    }
    const user = await User.findByIdAndUpdate(req.user?._id, { coverImage: coverImage.url }, { new: true }).select("-password")
    return res.status(200).json(new apiResponse(200, user, "Cover image updated successfully"))
})
const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params
    if (!username?.trim()) {
        throw new apiError(400, "Username is required")
    }
    // User.findOne({username: username.toLowerCase()})
    const channel = await User.aggregate([
        {
            $match: { username: username?.toLowerCase() }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscriberCount: { $size: "$subscribers" },
                channelsSubscribedToCount: { $size: "$subscribedTo" },
                isSubscribedToCount: {
                    $cond: {
                        if: {
                            $in: [req.user?._id, "$subscribers.subscriber"],
                            then: true,
                            else: false
                        }
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                subscriberCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribedToCount: 1,
                avatar: 1,
                coverImage: 1,
                email: 1,
            }
        }
    ])
    if (!channel?.length) {
        throw new apiError(404, "Channel not found")
    }
    return res.status(200).json(new apiResponse(200, channel[0], "Channel fetched successfully"))
})
const getWatchHistory = asyncHandler(async (req, res) => {
      const user = await User.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup:{
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline:[
                                {
                                    $project:{
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                },
                                {
                                    $addFields:{
                                        owner: { $arrayElemAt: ["$owner", 0]}
                                    }
                                }
                            ]
                        }
                    },
                ]  
            }   
        },
    ])
    return res.status(200).json(new apiResponse(200, user[0].watchHistory, "Watch history fetched successfully"))
})

export { registerUser, loginUser, logoutUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage, getUserChannelProfile, getWatchHistory }

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


/*
will this update the user information in the data base or i have to use the set operator
  const user = await User.findByIdAndUpdate(req.user?._id, {fullName, email}, {new: true})
volume_up

The code you provided, const user = await User.findByIdAndUpdate(req.user?._id, {fullName, email}, {new: true}), will indeed update the user information in the database. You don't need to use the set operator in this case.

Here's a breakdown of what happens:

User.findByIdAndUpdate: This Mongoose method is specifically designed to find a user by ID and update its data. It takes three arguments:

req.user?._id: This retrieves the user ID from the request object (req). The question mark (?) with the dot notation is likely used for optional chaining, ensuring it doesn't throw an error if req.user is undefined.
{ fullName, email }: This is an object containing the fields you want to update. The values for fullName and email will be taken from the corresponding variables in your code.
{ new: true }: This is an optional configuration object. By setting new: true, you instruct Mongoose to return the updated user document after the update operation. If you omit this option, it will return the original document before the update.
Update Operation: Mongoose finds the user with the matching ID and updates the specified fields (fullName and email) with the provided values.

Asynchronous Operation: The await keyword ensures that the code waits for the update operation to complete before proceeding.

Updated User: The variable user will now hold the updated user document, containing the new values for fullName and email. You can use this document for further processing or return it as a response depending on your application logic.

In summary, findByIdAndUpdate with the appropriate options effectively updates user information in the database without the need for the set operator in this scenario.




share


more_vert

so when should i use the $ set operator
edit
Show drafts
volume_up

You typically wouldn't use the $set operator with findByIdAndUpdate in Mongoose, as findByIdAndUpdate already provides a way to update specific fields. However, the $set operator is used in conjunction with other update methods in Mongoose, specifically aggregation pipeline updates using $update or with the update method itself. Here are some scenarios where you might use the $set operator for updates:

Updating Multiple Fields: While findByIdAndUpdate allows updating multiple fields at once, the $set operator can be useful if you need to perform more complex updates on various fields within an aggregation pipeline.

For instance, imagine you want to update a user's address and increment a point value in the same update operation. You could achieve this using the $set operator within the $update stage of an aggregation pipeline:

JavaScript
User.aggregate([
  { $match: { _id: req.user._id } }, // Find the user
  {
    $update: {
      $set: {
        address: {
          street: "New Street 123",
          city: "Anytown",
        },
        points: { $inc: 5 }, // Increment points by 5
      },
    },
  },
])
Use code with caution.
content_copy
Conditional Updates: The $set operator can be used with update operators like $inc or $mul to perform conditional updates. For example, you might want to increment a user's point value only if their purchase amount exceeds a certain threshold:

JavaScript
User.updateOne(
  { _id: req.user._id },
  { $set: { points: { $inc: purchaseAmount > 100 ? purchaseAmount / 10 : 0 } } }
)
Use code with caution.
content_copy
Here, the $set operator ensures that the points field is only updated if the condition (purchaseAmount > 100) is met.

Updating Nested Fields: If you have a complex schema with nested objects, you can use the $set operator with a dotted path to update specific properties within the nested object.

Remember, findByIdAndUpdate is generally the simpler approach for updating specific fields in a document. The $set operator comes into play for more complex update scenarios involving aggregation pipelines or conditional updates.
*/