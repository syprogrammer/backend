import mongoose, { Schema } from "mongoose"

const wishlistSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    items: [
        {
            type: Schema.Types.ObjectId,
            ref: "Product"
        }
    ]

})

export const Wishlist = mongoose.model("Wishlist", wishlistSchema)