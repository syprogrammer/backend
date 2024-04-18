// console.log("user models")

import mongoose, { Schema } from "mongoose"
import validator from "validator"

interface IUser extends Document {
    _id: string;
    name: string
    photo: string
    email: string,
    role: "admin" | "user"
    gender: "male" | "female"
    createdAt: Date
    updatedAt: Date
}

const userSchema = new Schema({

    name: {
        type: String,
        required: [true, "Please enter name"]
    },
    email: {
        type: String,
        unique: [true, "Email already exists"],
        required: [true, "Please enter email"],
        validate: validator.default.isEmail,
    },
    photo: {
        type: String,

    },
    role: {
        type: String,
        enum: ["admin", "user"],
        default: "user",
    },
    gender: {
        type: String,
        enum: ["male", "female"],

    },
    wishlist: [
        {
            type: Schema.Types.ObjectId,
            ref: "Product"
        }
    ],
    
    cart:[
        {
            type: Schema.Types.ObjectId,
            ref: "Product"
        }
    ],
    

},
    {
        timestamps: true,
    })



export const User = mongoose.model<IUser>("User", userSchema)