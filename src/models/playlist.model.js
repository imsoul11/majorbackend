import mongoose, { Schema } from "mongoose";

const playlistSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    videos: [{
        type: Schema.Types.ObjectId,
        ref: "Video",
    }],
    discription: {
        type: String,
        required: true,
    }
}, { timestamps: true })

export const Playlist = mongoose.model("Playlist", playlistSchema);