import { rm as removeFile } from "fs";
import { asyncErrorHandler } from "../middleware/error.middleware.js";
import { Product } from "../models/product.models.js";
import { BaseQuery, NewProductRequestBody, SearchRequestQuery } from "../types/types.js";
import ErrorHandler from "../utils/errorHandler.js";
import { Request } from "express"
import { myCache } from "../app.js";
import { ClearCache } from "../utils/features.js";

export const newProduct = asyncErrorHandler(async (
    req: Request<{}, {}, NewProductRequestBody>
    , res, next) => {
    const { name, price, stock, category } = req.body
    const photo = req.file

    if (!photo) {
        return next(new ErrorHandler("please choose product image", 400))
    }

    if (!name || !price || !stock || !category) {
        removeFile(
            photo.path, () => {
                console.log("Deleted")
            }
        )

        return next(new ErrorHandler("provide all product fields", 400))
    }


    const product = await Product.create({
        name, price, stock,
        category: category.toLowerCase(),
        photo: photo?.path
    })
    await ClearCache({ product: true,admin:true })
    return res.status(200).json({
        success: true,
        product
    })
})

export const getLatestProduct = asyncErrorHandler(async (req, res, next) => {
    //created at -1 means we get in descending order
    let products
    if (myCache.has("latest-product")) {
        products = JSON.parse(myCache.get("latest-product") as string)
    } else {
        products = await Product.find({}).sort({ createdAt: -1 }).limit(8)
        myCache.set('latest-product', JSON.stringify(products))
    }

    return res.status(200).json({
        success: true,
        products
    })
})

export const getAllCategories = asyncErrorHandler(async (req, res, next) => {

    let categories
    if (myCache.has("categories")) {
        categories = JSON.parse(myCache.get("categories") as string)
    } else {
        categories = await Product.distinct("category")
        myCache.set("categories", JSON.stringify(categories))
    }

    return res.status(200).json({
        success: true,
        categories
    })
})

export const getAdminProducts = asyncErrorHandler(async (req, res, next) => {
    let products
    if (myCache.has("get-admin-products")) {
        products = JSON.parse(myCache.get("get-admin-products") as string)
    } else {
        products = await Product.find({})
        myCache.set("get-admin-products", JSON.stringify(products))
    }

    return res.status(200).json({
        success: true,
        products
    })
})

export const getSingleProduct = asyncErrorHandler(async (req, res, next) => {

    let product
    const id = req.params.id
    if (myCache.has(`product-${id}`)) {

        // console.log(product, myCache.get(`product-${id}`))
        product = JSON.parse(myCache.get(`product-${id}`) as string)
    } else {
        product = await Product.findById(id)

        if (!product) {
            return next(new ErrorHandler("Product not found", 404))

        }
        myCache.set(`product-${id}`, JSON.stringify(product))
    }

    return res.status(200).json({
        success: true,
        product
    })
})

export const updateProduct = asyncErrorHandler(async (
    req, res, next) => {
    const { id } = req.params;
    const { name, price, stock, category } = req.body
    const photo = req.file
    const product = await Product.findById(id)
    if (!product) {
        return next(new ErrorHandler("Product not found", 404))

    }
    if (photo) {
        removeFile(product.photo!, () => {
            console.log("Old photo deleted")
        }),
            product.photo = photo.path
    }

    if (name) product.name = name
    if (price) product.price = price
    if (stock) product.stock = stock
    if (category) product.category = category

    await product.save()
    await ClearCache({ product: true ,productId:String(product._id)})
    return res.status(200).json({
        success: true,
        message: "Product Updated Successfully"
    })

})



export const deleteProduct = asyncErrorHandler(async (req, res, next) => {
    const product = await Product.findById(req.params.id)
    if (!product) {
        return next(new ErrorHandler("Product not found", 404))

    }
    removeFile(product.photo!, () => {
        console.log("Old photo deleted")
    })

    await Product.deleteOne()
    await ClearCache({ product: true,productId:String(product._id) })
    return res.status(200).json({
        success: true,
        message: "Product Deleted Successfully"
    })


})


export const getAllProducts = asyncErrorHandler(async (
    req: Request<{}, {}, {}, SearchRequestQuery>,
    res,
    next
) => {
    const { search, sort, category, price } = req.query
    const page = Number(req.query.page)
    const limit = Number(process.env.PRODUCT_PER_PAGE) || 8
    const skip = (page - 1) * limit
    const baseQuery: BaseQuery = {}

    if (search) {
        baseQuery.name = {
            $regex: search,
            $options: "i"
        }
    }
    if (price) {
        baseQuery.price = {
            $lte: Number(price)//less than equal to
        }
    }
    if (category) {
        baseQuery.category = category
    }
    const productPromise = Product.find(baseQuery)
        .sort(sort && { price: sort === "asc" ? 1 : -1 }
        ).limit(limit).skip(skip)

    const [products, filteredProductwithoutlimit] = await Promise.all([
        productPromise,
        Product.find({ baseQuery })

    ])

    const totalPage = Math.ceil(products.length / limit)

    return res.status(200).json({
        success: true,
        products,
        totalPage
    })
})