import mongoose, { Schema } from "mongoose"

const cartSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    Items: [
        {
            type: Schema.Types.ObjectId,
            ref: "Product"
        }
    ]

})

export const Cart = mongoose.model("cart", cartSchema)