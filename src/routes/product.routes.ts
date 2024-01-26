import express from "express"
import { fileUpload} from "../middleware/multer.js"
import { deleteProduct, getAdminProducts, getAllCategories, getAllProducts, getLatestProduct, getSingleProduct, newProduct, updateProduct } from "../controllers/product.js"

const productRouter = express.Router()

productRouter.post("/new",fileUpload.single("photo"),newProduct)
productRouter.get("/latest",getLatestProduct)
productRouter.get("/getallcategories",getAllCategories)
productRouter.get("/getadminproducts",getAdminProducts)
productRouter.get("/getsingleproduct/:id",getSingleProduct)

productRouter.put("/updateproduct/:id",updateProduct)

productRouter.delete("/deleteproduct/:id",deleteProduct)
productRouter.get("/search",getAllProducts)

export default productRouter
