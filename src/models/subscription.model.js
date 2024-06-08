import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
    subscriber: {
        type: mongoose.Schema.Types.ObjectId, // one who is subscribing
        ref: "User",
    },
    channel:{
        type: mongoose.Schema.Types.ObjectId, // one who is being subscribed
        ref: "User",
    }
    // Also add a functionality that in the page, that whether this channel is subscribed or not
}, {timestamps: true})

export const Subscription = mongoose.model("Subscription", subscriptionSchema)