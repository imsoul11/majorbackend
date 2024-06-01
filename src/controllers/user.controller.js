import { asyncHandler } from '../utils/asyncHandler.js'
import { apiError } from '../utils/apiError.js'
import {User} from '../models/user.model.js'
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import { apiResponse } from '../utils/apiResponse.js'


const registerUser = asyncHandler(async (req, res) => {
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
    if(
    [fullName,email,username,password].some((field)=> field?.trim() === "")
    ){
         throw new apiError(400, "All fields are required")
    }
    const existedUser= User.findOne({
        $or:[{
            email: email
        },{
            username: username
        }]
    })
    if(existedUser){
        throw new apiError(400, "User already exists")
    }
    // req.files is given by multer
    // req.body is given by express
    // this body contains al the data that is sent by the frontend
    // but it does not contain the files
    // so the middleware multer which we added in the route will give the access to file by req.files

    const avatarLocalPath=req.files?.avatar[0]?.path
    const coverImageLocalPath=req.files?.coverImage[0]?.path

    if(!avatarLocalPath)
        {
            throw new apiError(400, "Avatar is required")
        }
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new apiError(400, "Error in uploading image")
    }

   const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || '',
        email,
        password,
        username: username.tolowercase(),
    
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
        // these fields are not required to be sent to the frontend
    )
    if(!createdUser){
        throw new apiError(400, "Error in registering user")
    }
    
    return res.status(201).json(new apiResponse(201, createdUser, "User registered successfully"))
})

export { registerUser }