// we are encapsulating all the routes related to user in this file
// then we are exporting the router so that it can be used in the app.js file

import { verifyjwt } from '../middlewares/auth.middleware.js';
import {Router} from 'express';
import { changeCurrentPassword, getCurrentUser, getUserChannelProfile, getWatchHistory, loginUser, logoutUser, registerUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage } from '../controllers/user.controller.js';
import {upload} from '../middlewares/multer.middleware.js'
import { refreshAccessToken } from '../controllers/user.controller.js';
// import { verify } from 'jsonwebtoken';
const router = Router();
// router.route('/register').post((req,res,next)=>{console.log('hello i am midddle')
// next()
// },registerUser)


router.route('/register').post((req,res,next)=>{
    console.log('hello i am midddle')
    console.log('checking for req.files',req.files)
    console.log('checking for req.body',req.body)
    next()
},upload.fields([
    {
        name:'avatar',maxCount:1
    },
    {
        name:'coverImage',maxCount:1
    }
]),
(req,res,next)=>{
    console.log('hello i am midddle')
    console.log('checking for req.files again',req.files,'i got i think')
    next()
},registerUser)

// the field which we are uploading will be stored in the req.files for the registerUser function to check it
//http://localhost:8000/api/v1/users/register
// before going forward to register a user we are uploadin the images and then we will check in the registerUser function 
// that we have the images or not   
// so before sering the request to the registerUser function we are uploading the images using the middleware upload.fields

router.route('/login').post(loginUser)

// secured routers
router.route('/logout').post(verifyjwt,logoutUser)

router.route('/refresh-token').post(refreshAccessToken)

router.route("/change-password").post(verifyjwt,changeCurrentPassword)

router.route("/current-user").get(verifyjwt,getCurrentUser)

router.route("/update-account").patch(verifyjwt,updateAccountDetails)
// we are using patch instead of put because we are updating only some fields not all the fields

router.route("/avatar").patch(verifyjwt,upload.single("avatar"),updateUserAvatar)

router.route("/cover-image").patch(verifyjwt,upload.single("coverImage"),updateUserCoverImage)

router.route("/c/:username").get(verifyjwt,getUserChannelProfile)

router.route("/history").get(verifyjwt,getWatchHistory)

export default router;