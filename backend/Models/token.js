const mongoose = require('mongoose');
const {Schema} = mongoose;
const refreshTokenSchema = Schema({
    token : {type:String, required:true},
    userId :{type: Schema.Types.ObjectId,ref: 'User'}
},
{timestamps : true}
);
module.exports = mongoose.model('RefreshToken',refreshTokenSchema,'tokens');