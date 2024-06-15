import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    if(!videoId){
        throw new apiError(400, "Video ID is required")
    }
    // you should not use await here because you are passing it as an argument to the aggregatePaginate method
    const aggregateQuery = Comment.aggregate([
        {
            $match: { video: mongoose.Types.ObjectId.createFromHexString(videoId) }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        {
            $unwind: "$owner"
        },
        {
            $project: {
                _id: 1,
                content: 1,
                createdAt: 1,
                owner: {
                    _id: 1,
                    username: 1
                }
            }
        },
        {
            $sort: {createdAt: -1}
        }
    ]);

    const options = {
        page: parseInt(page),
        limit: parseInt(limit)
    };

    const comments = await Comment.aggregatePaginate(aggregateQuery, options);

    if(!comments || comments.docs.length === 0){
        throw new apiError(404, "No comments found")
    }

    return res.status(200).json(
        new apiResponse(
            comments, 
            "Comments fetched successfully", 
            true
        )
    );
});

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    //get videoid from params
    //get comment from body
    // get user from req.user
    const {videoId} = req.params
    const {content} = req.body
    const user = req.user
    if(!content || content.trim() === ""){
        throw new apiError(400, "Comment is required")
    }
    if(!user){
        throw new apiError(401, "Unauthorized")
    }
    if(!videoId){
        throw new apiError(400, "Video ID is required")
    }
    console.log(videoId, content, user)
    const comment = await Comment.create({
        content,
        video: videoId,
        owner: user._id
    })
    if(!comment){
        throw new apiError(500, "Error adding comment")
    }
    return res.status(201).json(new apiResponse( comment, "Comment added successfully", true))
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    // get comment id from params
    // get comment from body
    // get user from req.user
    // allow only the owner of the comment to update it
    const {commentId} = req.params
    const {content} = req.body
    const user = req.user
    if(!content || content.trim() === ""){
        throw new apiError(400, "Comment is required")
    }
    if(!user){
        throw new apiError(401, "Unauthorized")
    }
    if(!commentId){
        throw new apiError(400, "Comment ID is required")
    }
    const comment = await Comment.findById(commentId)
    if(!comment){
        throw new apiError(404, "Comment not found")
    }
    if(comment.owner.toString() !== user._id.toString()){
        throw new apiError(401, "Unauthorized, you cannot edit the content of other users")
    }
    const updatedComment = await comment.updateOne({content})
    if(!updatedComment){
        throw new apiError(500, "Error updating comment")
    }

    return res.status(200).json(new apiResponse( updatedComment, "Comm0000000ent updated successfully", true))


})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    // get comment id from params
    // get user from req.user
    // allow only the owner of the comment to delete it
    const {commentId} = req.params
    const user = req.user
    if(!user){
        throw new apiError(401, "Unauthorized")
    }
    if(!commentId){
        throw new apiError(400, "Comment ID is required")
    }
    const comment = await Comment.findById(commentId)
    if(!comment){
        throw new apiError(404, "Comment not found")
    }
    if(comment.owner.toString() !== user._id.toString()){
        throw new apiError(401, "Unauthorized, you cannot delete the content of other users")
    }
    const deletedComment = await comment.deleteOne()
    if(!deletedComment){
        throw new apiError(500, "Error deleting comment")
    }
    return res.status(200).json(new apiResponse( deletedComment, "Comment deleted successfully", true))

})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }