const mongoose=require("mongoose");
const { type } = require("os");

const userSchema=new mongoose.Schema({
    name:String,
    email:{
        type:String,
        unique:true
    },
    password:String,
    role:{
        type:String,
        enum:['admin','donor','volunteer','user'],
        default:'donor'
    },
    totalDonations:{
        type:Number,
        default:0
    },
    certified:{
        type:Boolean,
        default:false
    },
    badges:[String],
    joinedOn:{
        type:Date,
        default:Date.now
    },


});

const user=mongoose.model("User", userSchema);

module.exports=user;