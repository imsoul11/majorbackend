import mongoose, { isValidObjectId } from "mongoose"
import { User } from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import { apiError } from "../utils/apiError.js"
import { apiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    const userId = req.user?._id
    if (!isValidObjectId(channelId)) {
        throw new apiError(400, "Invalid channel id")
    }
    if (!isValidObjectId(userId)) {
        throw new apiError(400, "Invalid user id")
    }
    const user = await User.findById(userId)
    if (!user) {
        throw new apiError(404, "User not found")
    }
    const channel = await Subscription.findOne({ channel: channelId, subscriber: userId })
    if (channel) {
        console.log(channel)
        await Subscription.findByIdAndDelete(channel._id)
        return res.status(200).json(new apiResponse(200, "Unsubscribed successfully"))
    }
    else {
        await Subscription.create({ channel: channelId, subscriber: userId })
        return res.status(200).json(new apiResponse(200, "Subscribed successfully"))
    }
    // TODO: toggle subscription
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    if (!isValidObjectId(subscriberId)) {
        throw new apiError(400, "Invalid channel id")
    }
    const user  = await User .findById(subscriberId)
    if (!user) {
        throw new apiError(404, "User not found")
    }
    const Aggregatepipeline = [
        {
            $match: {
                channel: new mongoose.Types.ObjectId(subscriberId),
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscribers",
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
            $unwind: "$subscribers"
        },
        {
            $project: {

                subscriber: "$subscribers"
            }
        }

    ]
    const subscribers = await Subscription.aggregate(Aggregatepipeline) 
    if (!subscribers) {
        throw new apiError(404, "No subscribers found")
    }    
    return res.status(200).json(new apiResponse(200, subscribers))
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const  subscriberId  = req.params
    console.log(subscriberId.channelId,"ghhgvhgv")
    const user = await User.findById(subscriberId.channelId)
    if (!user) {
        throw new apiError(404, "User not found")
    }
    console.log(user)
    const Aggregatepipeline = [
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId.channelId),
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "subscribedTo",
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
            $unwind: "$subscribedTo"
        },
        {
            $project: {

                subscribedChannel: "$subscribedTo"
            }
        }

    ]
    const channels = await Subscription.aggregate(Aggregatepipeline)
    if (!channels) {
        throw new apiError(404, "No channels found")
    }
    return res.status(200).json(new apiResponse(200, channels))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}


/*
[
  {
    $match: 
    {
    subscriber:ObjectId("66660d33e32234cbc3597f38")
    }
  },
  {
    $lookup: {
      from: "users",
      localField: "channel",
      foreignField: "_id",
      as: "channel"
    }
  },
  {
    $lookup: {
      from: "users",
      localField: "subscriber",
      foreignField: "_id",
      as: "subscriber"
    }
  },
  {
    $unwind: 
      "$subscriber",
  },
  {
    $unwind: "$channel"
  },
  {
    $addFields: {
      shortchannel:"$channel.fullName",
      shortsubscriber:"$subscriber.fullName"
    }
  },
  {
    $project: {
      shortchannel:1,
      shortsubscriber:1,
      createdAt:1;
    }
  }
]
*/