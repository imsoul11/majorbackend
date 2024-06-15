import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";
import { Tweet } from "../models/tweet.model.js";

const toggleLike = async (Model, resourceId, userId) => {

    if (!isValidObjectId(resourceId)) throw new apiError(400, "Invalid Resource Id")
    if (!isValidObjectId(userId)) throw new apiError(400, "Invalid  UserId")

    const resource = await Model.findById(resourceId);
    if (!resource) throw new apiError(404, "No Resource Found");

    const resourceField = Model.modelName.toLowerCase();

    const isLiked = await Like.findOne({ [resourceField]: resourceId, likedBy: userId })

    var response;
    try {
        response = isLiked ?
            await Like.deleteOne({ [resourceField]: resourceId, likedBy: userId }) :
            await Like.create({ [resourceField]: resourceId, likedBy: userId })
    } catch (error) {
        console.error("toggleLike error ::", error);
        throw new apiError(500, error?.message || "Internal server error in toggleLike")
    }

    const totalLikes = await Like.countDocuments({ [resourceField]: resourceId });

    return { response, isLiked, totalLikes };

}
const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { response, isLiked, totalLikes } = await toggleLike(Video, videoId, req.user?._id);

    // get total Likes on videos
    

    return res.status(200)
        .json(
            new apiResponse(
                200,
                {response,totalLikes},
                isLiked === null ? "Liked successfully" : "remove liked successfully"
            )
        )



});


const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { response, isLiked, totalLikes } = await toggleLike(Comment, commentId, req.user?._id);
    return res.status(200)
        .json(
            new apiResponse(
                200,
                {response,totalLikes},
                isLiked === null ? "Liked successfully" : "remove liked successfully"
            )
        )

})


const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    const { response, isLiked, totalLikes } = await toggleLike(Tweet, tweetId, req.user?._id);

    return res.status(200)
        .json(
            new apiResponse(
                200,
                {response,totalLikes},
                isLiked === null ? "Liked successfully" : "remove liked successfully"
            )
        )



})

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    if (!req.user?._id) throw new apiError(401, "Unauthorized Request");
    const userId = req.user?._id;
  // read this pipeline what is happening
    const videoPipeline =
        [
            {
                $match: {
                    likedBy: new mongoose.Types.ObjectId(userId),
                },
            },
            {
                $lookup: {
                    from: "videos",
                    localField: "video",
                    foreignField: "_id",
                    as: "video",
                    pipeline: [
                        {
                            $lookup: {
                                from: "users",
                                localField: "owner",
                                foreignField: "_id",
                                as: "owner",
                                pipeline: [
                                    {
                                        $project: {
                                            fullName: 1,
                                            username: 1,
                                            avatar: "$avatar.url",
                                        },
                                    },
                                ],
                            },
                        },
                        {
                            $addFields: {
                                owner: {
                                    $first: "$owner",
                                },
                            },
                        },
                        {
                            $addFields: {
                                videoFile: "$videoFile.url"
                            },
                        },
                        {
                            $addFields: {
                                thumbnail: "$thumbnail.url"
                            },
                        },
                    ],
                },
            },

            {
                $unwind: "$video"
            },

            {
                $replaceRoot: {
                    newRoot: "$video",
                },
            },
        ]

    
    try {
        const likedVideos = await Like.aggregate(videoPipeline);
        return res.status(200)
            .json(
                new apiResponse(
                    200,
                    likedVideos,
                    "liked videos fetched successfully"
                )
            )

    } catch (error) {
        console.error("getLikedVideos error ::", error);
        throw new apiError(500, error?.message || "Internal server error in getLikedVideos")
    }
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}