import mongoose from "mongoose"
import { Video } from "../models/video.model.js"
import { Subscription } from "../models/subscription.model.js"
import { Like } from "../models/like.model.js"
import { apiError } from "../utils/apiError.js"
import { apiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const userId = req.user?._id;
    const countofsubs = await Subscription.aggregate([
        {
            $match: {
                "channel": new mongoose.Types.ObjectId(userId)
            },
        },
        {
            $count: 'count'
        }
    ])
    const videosandviews = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $group: {
                _id: null,
                totalViews: { $sum: "$views" },
                videoCount: { $sum: 1 }  // Count the number of videos
            }
        },
        {
            $project: {
                _id: 0,  // Exclude the _id field from the result
                totalViews: 1,
                videoCount: 1  // Include the videoCount field
            }
        }
    ]);
    const countoflikes=await Like.aggregate([
        {
          $match: {
            comment: null,
            tweet: null,
          }
        },
        {
          $lookup: {
            from: "videos",
            localField: "video",
            foreignField: "_id",
            as: "res"
          }
        },
        {
          $unwind: "$res"
        },
        {
          $addFields: {
            own:"$res.owner"
          }
        },
        {
          $match:{
            own:new mongoose.Types.ObjectId(userId)
          }
        },
        {
          $count:'count'
        }
      ])
      if(!countoflikes || !countofsubs || !videosandviews)
        {
            throw new apiError(500,'cant get the number of likes or views')
        }
    return res.status(200).send(new apiResponse
    (200,{countoflikes,countofsubs,videosandviews},"succesfull stats revievend"))

})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    if (!req.user?._id) throw new apiError(404, "Unauthorized request");
    const userId = req.user?._id;

    const video = [
        {
            $match: {

                owner: new mongoose.Types.ObjectId(userId)

            }
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
                            fullName: 1,
                            username: 1,
                            avatar: "$avatar.url"
                        }
                    }
                ]
            }
        },

        {
            $unwind: "$owner"
        },

        {
            $addFields: {
                videoFile: "$videoFile.url"
            }
        },

        {
            $addFields: {
                thumbnail: "$thumbnail.url"
            }
        },

    ]

    try {
        const allVideos = await Video.aggregate(video);
        console.log("allVideos ::", allVideos);
        return res.status(200).
            json(
                new apiResponse(
                    200,
                    allVideos,
                    "Video fetched successfully"
                )
            )
    } catch (error) {
        console.error("Error while deleting video:", error);
        throw new apiError("500", "Server Error while fetching video");
    }
})

export {
    getChannelStats,
    getChannelVideos
}



/*
[
  {
    $match: {
      comment: null,
      tweet: null,
    }
  },
  {
    $lookup: {
      from: "videos",
      localField: "video",
      foreignField: "_id",
      as: "res"
    }
  },
  {
    $unwind: "$res"
  },
  {
    $addFields: {
      own:"$res.owner"
    }
  },
  {
    $match:{
      own:ObjectId('6666088d36643a842f2b35af')
    }
  },
  {
    $count:'count'
  }
]
*/