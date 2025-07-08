const mongoose=require("mongoose");
const { type } = require("os");

const inventorySchema=new mongoose.Schema({
    item:String,
    quantity:Number,
    status:{
        type:String,
        enum:['available','distributed'],
        default:'available'
    },
    donationRef:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Donation'
    },
    addedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    }
}
);

const inventory=mongoose.model("Inventory", inventorySchema);

module.exports=inventory;