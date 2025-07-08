const mongoose=require("mongoose");
const { type } = require("os");

const donationSchema=new mongoose.Schema({
    donor:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    itemDonated:{
        type:String,
        enum:['money','clothes','food','books','other'],
        required:true,
    },
    quantity:Number,
    date:{
        type:Date,
        default:Date.now
    },
    notes:String


    }
);

const donate=mongoose.model("Donation", donationSchema);

module.exports=donate;