const mongoose=require("mongoose");
const { type } = require("os");


const volunteerSchema=new mongoose.Schema({
    name:String,
    email:String,
    phone:Number,
    teamName:String,
    location:String,
    available:{
        type:Boolean,
        default:true,
    },
    joinedOn:{
        type:Date,
        default:Date.now
    },

    pastEvents:[String],
    skills:[String],


    }
);

const volunteers=mongoose.model("Volunteer", volunteerSchema);

module.exports=volunteers;