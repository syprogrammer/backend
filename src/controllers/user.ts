import { NextFunction, Request, Response } from "express"
import { User } from "../models/user.models.js"
import { NewUserRequestBody } from "../types/types.js"
import { asyncErrorHandler } from "../middleware/error.middleware.js"
import ErrorHandler from "../utils/errorHandler.js"
import mongoose from "mongoose"

export const newUser = asyncErrorHandler(
    async (
        req: Request<{}, {}, NewUserRequestBody>,
        res: Response,
        next: NextFunction
    ) => {

        const { name, email, photo, gender, _id, dob } = req.body
        console.log(req.body)

        const existingUser = await User.findById(_id)

        if (existingUser) {
            return res.status(200)
                .json({
                    success: true,
                    message: `Welcome , ${existingUser.name}`
                })
        }

        if (!name || !email || !photo || !gender || !dob) {
            return next(new ErrorHandler("please add all fields", 400))
        }

        const newUser = await User.create({
            name, email, photo, gender, dob
        })
        return res.status(200)
            .json({
                success: true,
                message: `Welcome , ${newUser.name}`
            })

    }
)
export const changeUserRole = asyncErrorHandler(async (req, res, next) => {
    const id = req.params.id

    if (!id) {
        return next(new ErrorHandler("Invalid request", 400))
    }

    const user = await User.findById(id)
    if (!user) {
        return next(new ErrorHandler("No user found by this id", 404))
    }
    if (user.role == "admin") {
        user.role = "user"
    } else {
        user.role = "admin"
    }

    await user.save()

    return res.status(200).json({
        success: true,
        message: "Successfully changed user previlege"
    })

})


export const getAllUsers = asyncErrorHandler(async (req, res, next) => {
    const users = await User.find({})
    return res.status(200).json({ success: true, users })
})

export const getUser = asyncErrorHandler(async (req, res, next) => {
    const id = req.params.id
    // const user = await User.findById(id).populate("wishlist").populate({
    //     path: 'wishlist.items', // Populate the products field within wishlist
    //     model: 'Product', // Specify the model for products

    // })

    const user = await User.aggregate([
        {
            $lookup: {
                from: "products",
                localField: "wishlist",
                foreignField: "_id",
                as: "wishlist",
            }
        }
    ])
    if (!user) { return next(new ErrorHandler("Invalid Id", 400)) }
    return res.status(200).json({ success: true, user })
})

export const deleteUser = asyncErrorHandler(async (req, res, next) => {
    const id = req.params.id
    const user = await User.findByIdAndDelete(id)
    if (!user) { return next(new ErrorHandler("Invalid Id", 400)) }
    return res.status(200).json({ success: true, message: "User deleted successfully" })
})