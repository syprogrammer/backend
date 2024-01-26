import { stripe } from "../app.js";
import { asyncErrorHandler } from "../middleware/error.middleware.js";
import { Coupon } from "../models/coupon.js";
import ErrorHandler from "../utils/errorHandler.js";


export const createPayment = asyncErrorHandler(async (req, res, next) => {
    const { amount } = req.body
    if (!amount) {
        return next(new ErrorHandler("please enter amount ", 400))
    }
    const paymentIntent = await stripe.paymentIntents.create({
        amount: Number(amount) * 100,
        currency: "inr"
    })
    return res.status(201).json({
        success: true,
        clientSecret: paymentIntent.client_secret
    })

})
export const newCoupon = asyncErrorHandler(async (req, res, next) => {
    const { coupon, amount } = req.body
    if (!coupon || !amount) {
        return next(new ErrorHandler("please enter coupon and amount both", 400))
    }
    await Coupon.create({ code: coupon, amount })

    return res.status(201).json({
        success: true,
        message: `Coupon ${coupon} created successfully`
    })

})

export const applyDiscount = asyncErrorHandler(async (req, res, next) => {
    const { coupon } = req.query
    const discount = await Coupon.findOne({ code: coupon })

    if (!discount) {
        return next(new ErrorHandler("Invalid coupon", 400))
    }
    return res.status(200).json({
        success: true,
        discount: discount.amount
    })
})

export const allCoupons = asyncErrorHandler(async (req, res, next) => {
    const coupons = await Coupon.find({})
    return res.status(200).json({
        success: true,
        coupons
    })
})
export const deleteCoupon = asyncErrorHandler(async (req, res, next) => {
    const { id } = req.params
    if (!id) {
        return next(new ErrorHandler("Invalid id", 404))
    }
    const coupon = await Coupon.findById(id)
    if (!coupon) {
        return next(new ErrorHandler("Coupon not found", 404))
    }
    await coupon.deleteOne()
    return res.status(200).json({
        success: true,
        message: `coupon ${coupon.code} deleted successfully`
    })
})

