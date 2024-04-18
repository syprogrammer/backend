import { NextFunction, Request, Response } from "express"
import { User } from "../models/user.models.js"
import { NewUserRequestBody } from "../types/types.js"
import { asyncErrorHandler } from "../middleware/error.middleware.js"
import ErrorHandler from "../utils/errorHandler.js"
import { Wishlist } from "../models/wishlist.js"
import { Product } from "../models/product.models.js"
import mongoose from "mongoose"




// Controller function to add an item to the wishlist
export const addItemToWishlist = asyncErrorHandler(
    async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        const user = req.user
        const { productId } = req.body; // find userId and productId in the request body
        console.log(productId)
        const product = await Product.findById(productId)

        if (!product) {
            return next(new ErrorHandler("Product not found", 404))

        }
        // Find the wishlist for the given user
        // let wishlist = await Wishlist.findOne({ user: user._id });

        // if (!wishlist) {
        //     // If wishlist doesn't exist, create a new one
        //     wishlist = new Wishlist({ user: user._id });
        // }
        user.wishlist.push(productId)

        // // Add the product to the wishlist
        // wishlist.items.push(productId);
        // await wishlist.save();
        await user.save()

        return res.status(200).json({ message: 'Item added to wishlist successfully', user });

    }


)




export const getWishlist = asyncErrorHandler(async (req, res, next) => {

    const wishlist = await Wishlist.find({}).populate('user')
    return res.status(200).json({ success: true, wishlist })
})

export const getUser = asyncErrorHandler(async (req, res, next) => {
    const id = req.params.id
    const user = await User.findById(id)
    if (!user) { return next(new ErrorHandler("Invalid Id", 400)) }
    return res.status(200).json({ success: true, user })
})

export const deleteUser = asyncErrorHandler(async (req, res, next) => {
    const id = req.params.id
    const user = await User.findByIdAndDelete(id)
    if (!user) { return next(new ErrorHandler("Invalid Id", 400)) }
    return res.status(200).json({ success: true, message: "User deleted successfully" })
})