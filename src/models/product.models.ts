import mongoose,{Schema} from "mongoose"

const productSchema = new Schema({

    name:{
        type:String,
        required:[true,"please enter product name"]
    },
    photo:{
        type:String,
        required:[true,"please enter product photo"]
    },
    price:{
        type:Number,
        required:[true,"please enter product price"]
    },
    stock:{
        type:Number,
        required:[true,"please enter product stock"]
    },
    category:{
        type:String,
        trim:true,
        required:[true,"please enter product category"]
    },

},{
    timestamps:true
})

export const Product = mongoose.model("Product",productSchema)