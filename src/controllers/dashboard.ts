import { myCache } from "../app.js";
import { asyncErrorHandler } from "../middleware/error.middleware.js";
import { Order } from "../models/order.models.js";
import { Product } from "../models/product.models.js";
import { User } from "../models/user.models.js";
import { ClearCache, calculatePercentage, getChartData, getInventories } from "../utils/features.js";



export const getDasboardStats = asyncErrorHandler(async (req, res, next) => {
    // console.log("getDashboard stats controller called")
    // await ClearCache({
    //     product: true,
    //     order: true,
    //     admin: true,
    // userId: user,
    // productId: order.orderItems.map((prod) => String(prod.productId))
    // })
    const key = "admin-stats"
    let stats
    if (myCache.has(key)) {
        stats = JSON.parse(myCache.get(key) as string)
    } else {
        const today = new Date()
        const sixMonthsAgo = new Date()
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

        const thisMonth = {
            start: new Date(today.getFullYear(), today.getMonth(), 1),
            end: today
        }

        const lastMonth = {
            start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
            end: new Date(today.getFullYear(), today.getMonth(), 0)
        }

        const thisMonthProductPromise = Product.find({
            createdAt: {
                $gte: thisMonth.start,
                $lte: thisMonth.end
            }
        })
        const lastMonthProductPromise = Product.find({
            createdAt: {
                $gte: lastMonth.start,
                $lte: lastMonth.end
            }
        })

        const thisMonthUserPromise = User.find({
            createdAt: {
                $gte: thisMonth.start,
                $lte: thisMonth.end
            }
        })
        const lastMonthUserPromise = User.find({
            createdAt: {
                $gte: lastMonth.start,
                $lte: lastMonth.end
            }
        })
        const thisMonthOrderPromise = Order.find({
            createdAt: {
                $gte: thisMonth.start,
                $lte: thisMonth.end
            }
        })
        const lastMonthOrderPromise = Order.find({
            createdAt: {
                $gte: lastMonth.start,
                $lte: lastMonth.end
            }
        })
        const lastSixMonthOrderPromise = Order.find({
            createdAt: {
                $gte: sixMonthsAgo,
                $lte: today
            }
        })

        const latestTransactionPromise = Order.find({})
            .select(["orderItems", "discount", "total", "status"])
            .limit(4)

        const [
            thisMonthProducts,
            lastMonthProducts,
            thisMonthUsers,
            lastMonthUsers,
            thisMonthOrders,
            lastMonthOrders,
            productsCount,
            usersCount,
            allOrders, lastSixMonthOrders,
            categories,
            maleUsersCount,
            latestTransaction
        ] =
            await Promise.all([
                thisMonthProductPromise,
                lastMonthProductPromise,
                thisMonthUserPromise,
                lastMonthUserPromise,
                thisMonthOrderPromise,
                lastMonthOrderPromise,
                Product.countDocuments(),
                User.countDocuments(),
                Order.find({}).select("total"),
                lastSixMonthOrderPromise,
                Product.distinct("category"),
                User.countDocuments({ "gender": "male" }),
                latestTransactionPromise
            ])

        const thisMonthRevenue = thisMonthOrders.reduce(
            (total, order) => total + (order.total || 0), 0
        )
        const lastMonthRevenue = lastMonthOrders.reduce(
            (total, order) => total + (order.total || 0), 0
        )


        const changePercent = {
            revenue: calculatePercentage(thisMonthRevenue, lastMonthRevenue),
            product: calculatePercentage(
                thisMonthProducts.length,
                lastMonthProducts.length
            ),
            user: calculatePercentage(
                thisMonthUsers.length,
                lastMonthUsers.length,

            ),
            order: calculatePercentage(
                thisMonthOrders.length,
                lastMonthOrders.length
            )
        }


        const revenue = allOrders.reduce(
            (total, order) => total + (order.total || 0), 0
        )

        const count = {
            revenue: revenue,
            user: usersCount,
            product: productsCount,
            order: allOrders.length
        }
        const orderMonthCounts = new Array(6).fill(0)
        const orderMonthlyRevenue = new Array(6).fill(0)

        lastSixMonthOrders.forEach((order) => {
            const creationDate = order.createdAt
            const monthDiff = (today.getMonth() - creationDate.getMonth() + 12) % 12
            if (monthDiff < 6) {
                orderMonthCounts[5 - monthDiff] += 1
                orderMonthlyRevenue[5 - monthDiff] += order.total
            }
        })


        // const categoriesCountPromise = categories.map((category) => Product.countDocuments({ category }))


        const inventory = await getInventories({
            categories,
            productsCount
        })

        const userRatio = {
            male: maleUsersCount,
            female: usersCount - maleUsersCount
        }
        // console.log(userRatio)

        const modifiedLatestTransaction = latestTransaction.map((transaction) => ({
            _id: transaction._id,
            discount: transaction.discount,
            amount: transaction.total,
            quantity: transaction.orderItems.length,
            status: transaction.status
        }))

        stats = {
            userRatio,
            modifiedLatestTransaction,
            inventory,
            changePercent,
            count,
            chart: {
                order: orderMonthCounts,
                revenue: orderMonthlyRevenue
            },


        }
        myCache.set(key, JSON.stringify(stats))

    }


    return res.status(200).json({
        success: true,
        stats
    })
})

export const getPieCharts = asyncErrorHandler(async (req, res, next) => {
    const key = "admin-pie-charts"
    let charts
    if (myCache.has(key)) {
        charts = JSON.parse(myCache.get(key) as string)
    } else {
        const allOrderPromise = Order.find({}).select([
            "total",
            "discount",
            "subtotal",
            "tax",
            "shippingCharges"
        ])

        const [
            processingOrder,
            shippedOrder,
            deliveredOrder,
            categories,
            productsCount,
            outOfStock,
            allOrders,
            allUsers,
            adminUsers,
            customerUsers
        ] = await
                Promise.all([
                    Order.countDocuments({ status: "Processing" }),
                    Order.countDocuments({ status: "Shipped" }),
                    Order.countDocuments({ status: "Delivered" }),
                    Product.distinct("category"),
                    Product.countDocuments(),
                    Product.countDocuments({ stock: 0 }),
                    allOrderPromise,
                    User.find({}).select(["dob"]),
                    User.countDocuments({ role: "admin" }),
                    User.countDocuments({ role: "user" })
                ])

        const orderFullfillment = {
            processing: processingOrder,
            shipped: shippedOrder,
            delivered: deliveredOrder
        }

        const productCategories = await getInventories({
            categories,
            productsCount
        })

        const stockAvailability = {
            inStock: productsCount - outOfStock,
            outOfStock: outOfStock
        }

        const grossIncome = allOrders.reduce(
            (prev, order) => prev + (order.total || 0), 0
        )

        const productionCost = allOrders.reduce(
            (prev, order) => prev + (order.shippingCharges || 0),
            0
        )


        const burnt = allOrders.reduce(
            (prev, order) => prev + (order.tax || 0),
            0
        )

        const marketingCost = Math.round(grossIncome * (30 / 100))
        let discount = 100
        const netMargin = grossIncome - discount - productionCost - burnt - marketingCost

        const revenueDistribution = {
            netMargin,
            discount,
            productionCost,
            burnt,
            marketingCost,
        }


        const adminCustomer = {
            admin: adminUsers,
            customer: customerUsers
        }

        const userAgeGroup = {
            // teen: allUsers.filter((i) => i.age < 20).length,
            // adult: allUsers.filter((i) => i.age >= 20 && i.age < 40).length,
            // old: allUsers.filter((i) => i.age > 40).length,
        }

        charts = {
            orderFullfillment,
            productCategories,
            stockAvailability,
            revenueDistribution,
            adminCustomer,
            userAgeGroup
        }

        myCache.set(key, JSON.stringify(charts))
    }


    return res.status(200).json({
        success: true,
        charts
    })
})
export const getBarCharts = asyncErrorHandler(async (req, res, next) => {

    const key = "adin-bar-charts"
    let charts

    if (myCache.has(key)) {
        charts = JSON.parse(myCache.get(key) as string)
    } else {

        const today = new Date()

        const sixMonthsAgo = new Date()
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
        const twelveMonthsAgo = new Date()
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)

        const sixMonthProductPromise = Product.find({
            createdAt: {
                $gte: sixMonthsAgo,
                $lte: today
            }
        }).select("createdAt")

        const sixMonthUsersPromise = User.find({
            createdAt: {
                $gte: sixMonthsAgo,
                $lte: today
            }
        }).select("createdAt")

        const twelveMonthOrdersPromise = Order.find({
            createdAt: {
                $gte: twelveMonthsAgo,
                $lte: today
            }
        }).select("createdAt")


        const [
            products,
            users,
            orders
        ] = await Promise.all(
            [
                sixMonthProductPromise,
                sixMonthUsersPromise,
                twelveMonthOrdersPromise
            ]
        )
        const productCounts = getChartData({ length: 6, docArr: products })
        const userCounts = getChartData({ length: 6, docArr: users })
        const orderCounts = getChartData({ length: 6, docArr: orders })


        charts = {
            users: userCounts,
            product: productCounts,
            order: orderCounts
        }

        myCache.set(key, JSON.stringify(charts))

    }

    return res.status(200).json({
        success: true,
        charts
    })
})
export const getLineCharts = asyncErrorHandler(async (req, res, next) => {
    const key = "admin-line-charts"
    let charts

    if (myCache.has(key)) {
        charts = JSON.parse(myCache.get(key) as string)
    } else {

        const today = new Date()
        const twelveMonthsAgo = new Date()

        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)
        const baseQuery = {
            createdAt: {
                $gte: twelveMonthsAgo,
                $lte: today
            }
        }




        const [
            products,
            users,
            orders
        ] = await Promise.all(
            [
                Product.find(baseQuery).select(["createdAt"]),
                User.find(baseQuery).select("createdAt"),
                Order.find(baseQuery).select(["createdAt", "discount", "total"])

            ]
        )
        const productCounts = getChartData({ length: 12, docArr: products })
        const userCounts = getChartData({ length: 12, docArr: users })
        const discount = getChartData({
            length: 12,
            docArr: orders,
            property: "discount"
        })
        const revenue = getChartData({
            length: 12,
            docArr: orders,
            property: "total"
        })


        charts = {
            users: userCounts,
            product: productCounts,
            discount,
            revenue
        }

        myCache.set(key, JSON.stringify(charts))

    }

    return res.status(200).json({
        success: true,
        charts
    })
})