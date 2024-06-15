import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content} = req.body
    const userId = req.user._id
    console.log(req.user)
    console.log(userId)
    if(!content){
        throw new apiError(400,"Content is required")
    }
    if(!isValidObjectId(userId)){
        throw new apiError(400,"Invalid user id")
    }
    const user = await User.findById(req.user?._id, {_id : 1});
    if (!user) throw new apiError(404, "User not found");
    const tweet = await Tweet.create({
        content,
        owner: userId
    })
    if(!tweet){
        throw new apiError(500,"Tweet creation failed")
    }
    res.status(201).json(new apiResponse("Tweet created successfully",tweet))
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const { userId } = req.params;
    if (!isValidObjectId(userId)) throw new apiError(400, "Invalid user id");
    const user= await User.findById(userId);
    if(!user) throw new apiError(404, "User not found");
    const tweets = await Tweet.find({ owner: userId });
    if (!tweets) throw new apiError(404, "Tweets not found");
    res.status(200).json(new apiResponse(200, tweets, "User tweets fetched successfully"));

})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const { tweetId } = req.params;
    const { content } = req.body;

    if (!isValidObjectId(tweetId)) throw new apiError(404, "Not found tweet for this id")
    const user = await User.findById(req.user?._id, { _id: 1 });
    if (!user) throw new apiError(404, "User not found");
    
    const tweet = await Tweet.findById(tweetId);
    if(tweet?.owner?.toString() !== user._id.toString()) throw new apiError(403, "You are not authorized to update this tweet");
    if (!tweet) throw new apiError(404, "Tweet not found");

    if(!content || content?.trim() === "") throw new ApiError(404, "content is required");


    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set: {
                content
            }
        },
        {
            new : true
        }
    )

    if(!updatedTweet) throw new apiError(500, "Something went wrong while updating tweet")
    
    return res.status(201)
        .json(new apiResponse(
            201,
            updatedTweet,
            "tweet updated Successfully"
    ))

})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const { tweetId } = req.params;

    const user = await User.findById(req.user?._id);
    if (!user) throw new apiError(404, "User not found");
    const tweet = await Tweet.findById(tweetId);
    if (!tweet) throw new apiError(404, "Tweet not found");
    if(tweet?.owner?.toString() !== user._id.toString()) throw new apiError(403, "You are not authorized to delete this tweet");
    const deletedTweet = await Tweet.findByIdAndDelete(tweetId);
    if (!deletedTweet) throw new apiError(500, "Something went wrong while deleting tweet");

    return res.status(200)
        .json(new apiResponse(
            200,
            deletedTweet,
            "tweet deleted Successfully"
        ))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}


/*
Key differences:

Validation vs. Existence Check:

Approach 1 only validates the format of the ID.
Approach 2 checks if the user actually exists in the database.


Error Types:

Approach 1 returns a 400 error (client mistake).
Approach 2 returns a 404 error (resource not found).


Database Interaction:

Approach 1 doesn't interact with the database.
Approach 2 performs a database query.


Performance:

Approach 1 is faster as it's just a validation check.
Approach 2 involves a database operation, which is slower */