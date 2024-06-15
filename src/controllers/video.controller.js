// import mongoose from "mongoose";
// import { asyncHandler } from "../utils/asyncHandler.js";
// import { uploadOnCloudinary } from "../utils/cloudinary.js";
// import { Video } from "../models/video.model.js";
// import { User } from "../models/user.model.js";
// import { apiError } from "../utils/apiError.js";
// import { apiResponse } from "../utils/apiResponse.js";
// function getThumbnailUrl(originalUrl) {
//     const cloudinaryUrlParts = originalUrl.split('/'); // Split the original URL by '/'
//     console.log(cloudinaryUrlParts)
//     const publicId = cloudinaryUrlParts[cloudinaryUrlParts.length - 1]; // Get the public ID

//     // Construct the modified thumbnail URL using string concatenation
//     const thumbnailUrl = `https://res.cloudinary.com/${cloudinaryUrlParts[3]}/video/upload/h_250,w_450,eo_3,so_1/${publicId}`;

//     return thumbnailUrl;
// }
// const publishAVideo = asyncHandler(async (req, res) => {
//     // get video title description from req.body 
//     // and get video uploaded to local file structure
//     // and then upload to cloudinary 
//     //https://res.cloudinary.com/dpry2olcf/image/upload/veiugkeubei58kq4nu7a.png
//     // to get the thumbnaill you just need to put the required content in the url
//     //https://res.cloudinary.com/dpry2olcf/image/upload/c_thumb,g_auto,h_250,w_450/veiugkeubei58kq4nu7a.png
//     // this is the linke to short video https://res.cloudinary.com/demo/video/upload/h_250,w_450,eo_3,so_1/ski_jump.mp4
//     const {title,description}= req.body
//     if([title,description].some((field) => field?.trim() === ""))
//         {
//             throw new apiError(400,"title and description are required")
//         }
//     console.log(req.user)
//     // console.log(req.file)
//     const videoLocalPath=req.file?.path
//     if(!videoLocalPath)
//         {
//             throw new apiError(400,'video is required')
//         }
//     const videoFile= await uploadOnCloudinary(videoLocalPath)
//     if (!videoFile) {
//         throw new apiError(500, "Error in uploading image")
//     }

//     // console.log(videoFile)
//     // console.log(videoFile.duration," ",videoFile.url)
//     // console.log('  ',getThumbnailUrl(videoFile.url))
//     // const user = await User.findById(req.user._id)
//     // if(!user)
//     //     {
//     //         throw new apiError('i didnt get the user for owner field in the video')
//     //     }
//     // console.log("this is the user",user)
//     // console.log("this is the req.userid",req.user._id)
//     const video= await Video.create({
//         videoFile:videoFile.url,
//         thumbnail:getThumbnailUrl(videoFile.url),
//         title,
//         description,
//         duration:videoFile.duration,
//         isPublished:true,
//         // owner:req.user
//         owner:req.user._id
//         //owner:user
//     })
//     console.log(video)
//     if(!video)
//         {
//             throw new apiError(500, 'error in uploading video')
//         }
//     return res.status(201).json(new apiResponse(201,video,"Video uploaded!!"))
// })


// export {publishAVideo}



// import mongoose, {isValidObjectId} from "mongoose"
// import {Video} from "../models/video.model.js"
// import {User} from "../models/user.model.js"
// import {apiError} from "../utils/apiError.js"
// import {apiResponse} from "../utils/apiResponse.js"
// import {asyncHandler} from "../utils/asyncHandler.js"
// import {uploadOnCloudinary} from "../utils/cloudinary.js"


// const getAllVideos = asyncHandler(async (req, res) => {
//     const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
//     //TODO: get all videos based on query, sort, pagination
// })

// const publishAVideo = asyncHandler(async (req, res) => {
//     const { title, description} = req.body
//     // TODO: get video, upload to cloudinary, create video
//      //retreive the video and thumbnail

//      const videolocalpath = req.files?.videoFile[0]?.path;
//      const thumbnaillocalpath = req.files?.thumbnail[0]?.path;
//      // console.log(videolocalpath);
//      if(!videolocalpath){
//          throw new apiError(404,"Video is required!!!")
//      }
//      if(!thumbnaillocalpath){
//          throw new apiError(404,"Thumbnail is required!!!")
//      }
//      //cloud 
//      const video = await uploadOnCloudinary(videolocalpath);
//      const thumbnail = await uploadOnCloudinary(thumbnaillocalpath);

//      if(!video?.url){
//          throw new apiError(500,"Something wrong happens while uplaoding the video")
//      }
//      if(!thumbnail?.url){
//          throw new apiError(500,"Something wrong happens while uplaoding the thumbnail")
//      }

//      const newVideo = await Video.create({
//          videoFile:video?.url,
//          thumbnail:thumbnail?.url,
//          title,
//          description,
//          duration:video?.duration,
//          isPublished:true,
//          owner:req.user?._id
//      })

//      return res
//      .status(200)
//      .json(new apiResponse(200,newVideo,"Video Published Successfully"))

// })

// const getVideoById = asyncHandler(async (req, res) => {
//     const { videoId } = req.params
//     //TODO: get video by id
// })

// const updateVideo = asyncHandler(async (req, res) => {
//     const { videoId } = req.params
//     //TODO: update video details like title, description, thumbnail

// })

// const deleteVideo = asyncHandler(async (req, res) => {
//     const { videoId } = req.params
//     //TODO: delete video
// })

// const togglePublishStatus = asyncHandler(async (req, res) => {
//     const { videoId } = req.params
// })

// export {
//     getAllVideos,
//     publishAVideo,
//     getVideoById,
//     updateVideo,
//     deleteVideo,
//     togglePublishStatus
// }





import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { apiError } from "../utils/apiError.js"
import { apiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import fs from 'fs'

const getAllVideos = asyncHandler(async (req, res) => {
    // TODO: get all videos based on query, sort, pagination
    const { page = 1,
        limit = 10,
        query = "",
        sortBy = "createdAt",
        sortType = 1,
        userId } = req.query;

    // dont use await because it will be not able to populate properly with aggregate pipeline in the next step 
    const matchCondition = {
        $or: [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } }
        ]
    };

    if (userId) {
        matchCondition.owner = new mongoose.Types.ObjectId(userId);
    }
    var videoAggregate;
    try {
        videoAggregate = Video.aggregate(
            [
                {
                    $match: matchCondition

                },

                {
                    $lookup: {
                        from: "users",
                        localField: "owner",
                        foreignField: "_id",
                        as: "owner",
                        pipeline: [
                            {
                                $project: {
                                    _id :1,
                                    fullName: 1,
                                    avatar: "$avatar.url",
                                    username: 1,
                                }
                            },

                        ]
                    }

                },

                {
                    $addFields: {
                        owner: {
                            $first: "$owner",
                        },
                    },
                },

                {
                    $sort: {
                         "createdAt": 1
                    }
                },

            ]
        )
    } catch (error) {
        console.error("Error in aggregation:", error);
        throw new apiError(500, error.message || "Internal server error in video aggregation");
    }




    const options = {
        page,
        limit,
        customLabels: {
            totalDocs: "totalVideos",
            docs: "videos",

        },
        skip: (page - 1) * limit,
        limit: parseInt(limit),
    }

    Video.aggregatePaginate(videoAggregate, options)
        .then(result => {
            // console.log("first")
            if (result?.videos?.length === 0 && userId) {
                return res.status(200).json(new apiResponse(200, [], "No videos found"))
            }

            return res.status(200)
                .json(
                    new apiResponse(
                        200,
                        result,
                        "video fetched successfully"
                    )
                )
        }).catch(error => {
            console.log("error ::", error)
            throw new apiError(500, error?.message || "Internal server error in video aggregate Paginate")
        })




})

// const getAllVideos = asyncHandler(async (req, res) => {
//     const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
//     //TODO: get all videos based on query, sort, pagination
//     // req.params is for param query            ?page=1&limit=10&query=hello&sortBy=createdAt&sortType=desc&userId=123
//     console.log(page, limit, query, sortBy, sortType, userId)
//     const matchCondition={
//         $or: [
//             { title: { $regex: query, $options: "i" } },
//             { description: { $regex: query, $options: "i" } }
//         ]
//     }
//     if(userId){
//         matchCondition.owner=userId
//     }
//     const videoAggregate = await Video.aggregate([
//         {
//           $match: {
//             $or: [
//               {
//                 title: {
//                   $regex: "descrin",
//                   $options: "i",
//                 },
//               },
//               {
//                 description: {
//                   $regex: "descri",
//                   $options: "i",
//                 },
//               },
//             ],
          
//           },
//         },
//         {
//           $lookup: {
//             from: "users",
//             localField: "owner",
//             foreignField: "_id",
//             as: "owner",
//             pipeline: [
//               {
//                 $project: {
//                   _id: 1,
//                   fullName: 1,
//                   avatar: "$avatar.url",
//                   username: 1,
//                 },
//               },
//             ],
//           },
//         },
//         {
//           $addFields: {
//             owner: {
//               $first: "$owner",
//             },
//           },
//         },
//         {
//           $sort: {
//             "createdAt":1,
//           },
//         },
//       ])
//     if (!videoAggregate) {
//         throw new apiError(500, "Error in aggregating videos");}
//     const options = {
//         page,
//         limit
//     }
//     const result = Video.aggregatePaginate(videoAggregate, options)
//     if(result.length==0){
//         throw new apiError(404, "No video found")
//     }
//     return res.status(200).json(new apiResponse(200, result, "Successfully fetched the videos"))
    
// })

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    // TODO: get video, upload to cloudinary, create video
    // console.log(req.user,req.files)
    if (!(title && description)) {
        throw new apiError(400, "title and description is required");
    }

    const videoLocalpath = req.files?.videoFile[0].path;
    const thumbnailLocalpath = req.files?.thumbnail[0].path;

    if (!videoLocalpath) {
        throw new apiError(400, "Not Found video file");
    }
    if (!thumbnailLocalpath) {
        throw new apiError(400, "Not Found thumbnail file");
    }
    const videoUrl = await uploadOnCloudinary(videoLocalpath);
    const thumbnailUrl = await uploadOnCloudinary(thumbnailLocalpath);

    if (!(videoUrl && thumbnailUrl)) {
        fs.unlinkSync(videoLocalpath)
        fs.unlinkSync(thumbnailLocalpath)
        throw new apiError(400, "Url not found");
    }
    const publishVideo = await Video.create({
        videoFile: videoUrl?.url,
        thumbnail: thumbnailUrl?.url,
        title,
        description,
        duration: videoUrl?.duration,
        isPublished: false,
        owner: req?.user._id,
    });
    if (!publishVideo) {
        throw new apiError(400, "Not published successfully");
    }

    return res
        .status(200)
        .json(new apiResponse(200, publishVideo, "Video published sucessfully"));

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    console.log(videoId)
    if (!videoId) {
        throw new apiError(400, 'sent the videoId')
    }
    const video = await Video.findById(videoId)
    if (!video) {
        throw new apiError(400, "cant fetch the video")
    }
    console.log(video)
    return res.status(200).json(new apiResponse(200, video.videoFile, "succesfully got the video"))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { description, title } = req.body
    const localthumbnail = req.file?.path
    console.log(req.file)
    console.log(description, localthumbnail, videoId, title)
    if (!videoId) {
        throw new apiError(400, 'you ddnt sent the videoId')
    }
    const video = await Video.findById(videoId)
    if (!video) {
        throw new apiError(400, "cant fetch the video")
    }
    console.log(video.owner, "   ", req?.user._id)
    if (!(video.owner.toString() == req.user._id.toString())) {
        throw new apiError(400, " you are not the owner");
    }
    const thumbnail = await uploadOnCloudinary(localthumbnail);
    if (!thumbnail) {
        throw new apiError('encounered error while updating')
    }
    const updatedVideoDetails = await Video.findByIdAndUpdate(videoId, {
        title,
        description,
        thumbnail: thumbnail?.url,
    });
    return res
        .status(200)
        .json(new apiResponse(200, updatedVideoDetails, "Successfully updated"));
    //TODO: update video details like title, description, thumbnail


})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    console.log(videoId)
    if (!videoId) {
        throw new apiError(400, 'sent the videoId')
    }
    const video = await Video.findById(videoId);
    if (!video) {
        throw new apiError(500, 'cant find the video')
    }
    console.log(video.owner, "   ", req?.user._id)
    if (!(video.owner.toString() == req.user._id.toString())) {
        throw new apiError(400, " you are not the owner");
    }
    const delvid = await Video.findByIdAndDelete(videoId);
    if (!delvid) {
        throw new apiError(500, 'cant delete')
    }
    return res
        .status(200)
        .json(new apiResponse(200, "Successfully deleted the video"));

})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!videoId) {
        throw new apiError(400, "Video Id not founded");
    }
    const video = await Video.findById(videoId);
    if (!video) {
        throw new apiError(500, 'cant find the video')
    }
    console.log(video.owner, "   ", req?.user._id)

    if (!(video.owner.toString() == req.user._id.toString())) {
        throw new apiError(400, " you are not the owner");
    }

    const isPublished = !video.isPublished;

    const toggleIsPublished = await Video.findByIdAndUpdate(
        videoId,
        {
          $set: { isPublished: isPublished },
        },
        { new: true }
      );
      if(!toggleIsPublished){
        throw new apiError(400, "Something went wrong to toggle the publish state");
      }
      return res.status(200).json(
        new apiResponse(200,toggleIsPublished, "Updated toggle state successfully")
      )
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}