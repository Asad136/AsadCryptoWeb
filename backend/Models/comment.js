const mongoose = require('mongoose');
const {Schema} = mongoose;

const commentSchema = new Schema({
    content:{type:String,required:true},
    blog:{type:Schema.Types.ObjectId,ref:'Blog'},
    author:{type:Schema.Types.ObjectId,ref:'User'},
},
{timeseries:true}
) 
module.exports=mongoose.model('Comment',commentSchema,'comments');