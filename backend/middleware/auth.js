const JWTService = require('../Service/JWTService');
const User = require('../Models/user');
const UserDTO = require('../Dto/user');

const auth = async (req, res, next) => {
    try {
        const { refreshtoken, accesstoken } = req.cookies;
        
        if (!refreshtoken || !accesstoken) {
            const error = {
                status: 401,
                message: 'Unauthorized'
            };
            return next(error);
        }

        let _id;
        try {
            _id = JWTService.verifyAccessToken(accesstoken)._id;
        } catch (error) {
            return next(error);
        }

        let user;
        try {
            user = await User.findOne({ _id });
            if (!user) {
                const error = {
                    status: 404,
                    message: 'User not found'
                };
                return next(error);
            }
        } catch (error) {
            return next(error);
        }

        const userDTO = new UserDTO(user);
        req.user = userDTO;
        next();
    } catch (error) {
        return next(error);
    }
};

module.exports = auth;
