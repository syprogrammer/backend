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
    dob: Date
    createdAt: Date
    updatedAt: Date
    age: number //virtual
}

const userSchema = new Schema({
    _id: {
        type: String,
        required: [true, "Please send valid id"]
    },

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
        required: [true, "Please enter photo"]
    },
    role: {
        type: String,
        enum: ["admin", "user"],
        default: "user",
    },
    gender: {
        type: String,
        enum: ["male", "female"],
        required: [true, "Please enter Gender"]
    },
    dob: {
        type: Date,
        required: [true, "Please enter date of birth"]
    },

},
    {
        timestamps: true,
    })

userSchema.virtual("age").get(
    function () {
        const today = new Date();
        const dob = this.dob
        let age = today.getFullYear() - dob.getFullYear();
        if (today.getMonth() < dob.getMonth()
            ||
            today.getMonth() === dob.getMonth()
            &&
            today.getDate() < dob.getDate()) {
            age -= 1
        }
        return age
    }
)

export const User = mongoose.model<IUser>("User", userSchema)