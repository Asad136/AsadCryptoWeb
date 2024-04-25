const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const RefreshToken = require('../Models/token')
const {ACESS_TOKKEN_SECRET_KEY,REFRESH_TOKKEN_SECRET_KEY} = require('../config/index')
class JWTService{
        static signAccessToken(payload ,expirytime){
            return jwt.sign(payload ,ACESS_TOKKEN_SECRET_KEY ,{expiresIn:expirytime} );
        }
        static signRefreshToken(payload ,expirytime){
            return jwt.sign(payload ,REFRESH_TOKKEN_SECRET_KEY ,{expiresIn:expirytime} );
        }
        static verifyAccessToken(token) {
            return jwt.verify(token, ACESS_TOKKEN_SECRET_KEY);
        }        
        static verifyRefreshToken(token ){
            return jwt.verify(token ,REFRESH_TOKKEN_SECRET_KEY );
        }
        static async storeRefreshToken(token , userId){
            try {
                const newRefreshtoken = new RefreshToken({
                    token : token ,
                    userId: userId
                })
                await newRefreshtoken.save()
            } catch (error) {
                console.log("🚀 ~ JWTService ~ storeRefreshToken ~ error:", error)
            }
        }
}
module.exports = JWTService;