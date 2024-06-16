import mongoose, { isValidObjectId } from "mongoose"
import { Playlist } from "../models/playlist.model.js"
import { apiError } from "../utils/apiError.js"
import { apiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"
import { Video } from "../models/video.model.js"

const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body
    if (!(name || description) || !(name.trim() !== "" || description.trim() !== "")) throw new apiError(400, "name and description required");
    const user = await User.findById(req.user?._id)
    if (!user) throw new apiError(404, "user not found");
    const playlist = await Playlist.create({ name, description, owner: req.user?._id })
    if (!playlist) throw new apiError(500, "playlist not created");
    return res.status(201).json(new apiResponse(201, "playlist created", playlist))
    //TODO: create playlist
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params
    //TODO: get user playlists
    if (!isValidObjectId(userId)) throw new apiError(400, "invalid user id")
    const user = await  User.findById   (userId)
    if (!user) throw new apiError(404, "user not found")

    const playlistAggregate=    await Playlist.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos",
                pipeline: [
                    // {
                    //     $match: { deleted: { $ne: true } }
                    // },
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
                                        _id: 1,
                                        avatar: "$avatar.url",
                                        username: 1
                                    },
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            videoOwner: {
                                $first: "$owner"
                            }
                        }
                    },
                    {
                        $project: {
                            owner: 0
                        }
                    },
                    {
                        $addFields: {
                        videoFile : "$videoFile.url",
                    }
                },
                {
                    $addFields: {
                        thumbnail: "$thumbnail.url"
                    }
                }
                ]
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
                            _id: 1,
                            avatar: "$avatar.url",
                            username: 1
                        },
                    }
                ]
            }
        },
        {
            $addFields: {
                owner: {
                    $first: "$owner"
                }
            }
        }
    ])
    if (!playlistAggregate) throw new apiError(500, "playlist not found")
    return res.status(200).json(new apiResponse(200, "playlist found", playlistAggregate))


})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    if (!isValidObjectId(playlistId)) throw new apiError(400, "invalid playlist id")
    const playlist = await Playlist.findById(playlistId)
    if (!playlist) throw new apiError(404, "playlist not found")
    const playlistAggregate = await Playlist.aggregate(
        [
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(playlistId)
                }
            },
            {
                $lookup: {
                    from: "videos",
                    localField: "videos",
                    foreignField: "_id",
                    as: "videos",
                    pipeline: [
                        {

                            $match: { deleted: { $ne: true } } // Filter out deleted videos

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
                                            _id: 1,
                                            avatar: "$avatar.url",
                                            username: 1
                                        },
                                    }
                                ]
                            }
                        },
                        {
                            $addFields: {
                                videoOwner: {
                                    $first: "$owner"
                                }
                            }
                        },
                        {
                            $project: {
                                owner: 0
                            }
                        },

                        {
                            $addFields: {
                                videoFile : "$videoFile.url",
                            }
                        },

                        {
                            $addFields: {
                                thumbnail: "$thumbnail.url"
                            }
                        }
                    
                    ]
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
                                _id: 1,
                                avatar: "$avatar.url",
                                username: 1
                            },
                        }
                    ]
                }
            },

            {
                $addFields: {
                    owner: {
                        $first: "$owner"
                    }
                }
            }

        ])
        if (!playlistAggregate) throw new apiError(500, "playlist not found")   
        return res.status(200).json(new apiResponse(200, "playlist found", playlistAggregate))
    //TODO: get playlist by id
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) throw new apiError(400, "invalid playlist id or video id")
    const video = await Video.findById(videoId)
    if (!video) throw new apiError(404, "video not found")
    const playlist = await Playlist.findById(playlistId)
    if (!playlist) throw new apiError(404, "playlist not found")
    /*
The $addToSet operator:

This operator adds a value to an array only if the value is not already present.
It ensures that only unique values are added to the array field. */
    const updatePlaylist = await Playlist.findByIdAndUpdate(playlistId, {
        $addToSet: { videos: videoId }
    }, { new: true })
    if (!updatePlaylist) throw new apiError(500, "video not added to playlist")
    return res.status(200).json(new apiResponse(200, "video added to playlist", updatePlaylist))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) throw new apiError(400, "invalid playlist id or video id")
    const playlist = await Playlist.findById(playlistId)
    if (!playlist) throw new apiError(404, "playlist not found")
    const video = await Video.findById(videoId)
    if (!video) throw new apiError(404, "video not found")
    const updatePlaylist = await Playlist.findByIdAndUpdate(playlistId, {
        $pull: { videos: videoId }
    }, { new: true })
    if (!updatePlaylist) throw new apiError(500, "video not removed from playlist")
    return res.status(200).json(new apiResponse(200, "video removed from playlist", updatePlaylist))
    // TODO: remove video from playlist

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    if (!isValidObjectId(playlistId)) throw new apiError(400, "invalid playlist id")
    const playlist = await Playlist.findById(playlistId)
    if (!playlist) throw new apiError(404, "playlist not found")
    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId)
    if (!deletedPlaylist) throw new apiError(500, "playlist not deleted")
    return res.status(200).json(new apiResponse(200, "playlist deleted", deletedPlaylist))
    
    // TODO: delete playlist
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body
    if (!(name || description) || !(name.trim() !== "" || description.trim() !== "")) throw new apiError(400, "name and description required");
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        { name, description },
        { new: true }
    )
    if (!updatedPlaylist) throw new apiError(500, "playlist not updated");
    return res.status(200)
        .json(new apiResponse(
            200,
            updatedPlaylist,
            "Playlist updated successfully"
        ))

    //TODO: update playlist
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}