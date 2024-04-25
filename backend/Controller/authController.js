const Joi = require('joi');
const User = require('../Models/user');
const bcrypt = require('bcryptjs');
const { ValidationError } = require('joi');
const RefreshToken = require('../Models/token');
const user = require('../Models/user');
const UserDTO = require('../Dto/user');
const JWTService = require('../Service/JWTService');
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;



const authController = {
    async register(req, res, next) {
        const userRegisterSchema = Joi.object({
            username: Joi.string().min(5).max(25).required(),
            name: Joi.string().min(3).max(25).required(),
            email: Joi.string().email().required(),
            password: Joi.string().pattern(passwordPattern).required(),
            confirmPassword: Joi.ref('password')
        })
        const { error } = userRegisterSchema.validate(req.body);
        if (error) {
            return next(error);
        }

        const { name, username, email, password } = req.body;
        try {
            const alreadyAusername = await User.exists({ username: username });
            const alreadyAemail = await User.exists({ email: email });
            if (alreadyAemail) {
                const error = {
                    status: 409,
                    message: 'email already register'
                }
                return next(error)
            }
            if (alreadyAusername) {
                const error = {
                    status: 409,
                    message: 'username already register'
                }
                return next(error)
            }
            const hassedPassword = await bcrypt.hash(password, 10);
            let accesstoken;
            let refreshtoken;
            let user;
            try {
                const userRegister = new User({
                    email: email,
                    username: username,
                    name: name,
                    password: hassedPassword
                })
                user = await userRegister.save();
                accesstoken = JWTService.signAccessToken({ _id: user._id }, '30m')
                refreshtoken = JWTService.signRefreshToken({ _id: user._id }, '60m')

            } catch (error) {
                return next(error);

            }
            await JWTService.storeRefreshToken(refreshtoken, user._id);
            res.cookie('accesstoken', accesstoken, {
                maxAge: 1000 * 60 * 60 * 24,
                httpOnly: true
            })
            res.cookie('refreshtoken', refreshtoken, {
                maxAge: 1000 * 60 * 60 * 24,
                httpOnly: true
            })
            const userdto = new UserDTO(user);
            return res.status(200).json({ user: userdto, auth: true });
        } catch (error) {
            return next(error)
        }
    },
    async login(req, res, next) {
        const userSchemalogin = Joi.object({
            username: Joi.string().min(5).max(25).required(),
            password: Joi.string().pattern(passwordPattern).required()
        })
        const { error } = userSchemalogin.validate(req.body);
        if (error) {
            return next(error);
        }
        const { username, password } = req.body;
        let user;
        try {
            user = await User.findOne({ username: username });
            if (!user) {
                const error = {
                    status: 401,
                    message: 'invalid user'
                }
                return next(error);
            }
            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                const error = {
                    status: 401,
                    message: 'invalid password'
                }
                return next(error);
            }
        } catch (error) {
            return next(error);
        }
        const accesstoken = JWTService.signAccessToken({ _id: user._id }, '30m');
        const refreshtoken = JWTService.signRefreshToken({ _id: user._id }, '60m');
        try {
            await RefreshToken.updateOne({
                _id: user._id
            }, {
                token: refreshtoken
            }, {
                upsert: true
            })
        } catch (error) {
            return next(error)
        }
        res.cookie('accesstoken', accesstoken, {
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true
        })
        res.cookie('refreshtoken', refreshtoken, {
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true
        })
        const userdto = new UserDTO(user);
        return res.status(200).json({ user: userdto, auth: true });
    },


    async logout(req, res, next) {
        
        const { refreshtoken } = req.cookies;
        try {
          await RefreshToken.deleteOne({ token: refreshtoken });
        } catch (error) {
          next(error);
        }
        res.clearCookie('accesstoken');
        res.clearCookie('refreshtoken');
        res.status(200).json({ user: null, auth: false });
      },
    
    async refresh(req , res , next){
        
        const orignalToken = req.cookies.refreshtoken;
        console.log("🚀 ~ refresh ~ req.cookies.refreshtoken:", req.cookies.refreshtoken)
        let id;
        try {
          id = JWTService.verifyRefreshToken(orignalToken)._id;

        } catch (e) {
            const error = {
                status: 401,
                message: 'unauthorize'
            };
            return next(error);
        }
        try {
            const match = await RefreshToken.findOne({_id : id , token : orignalToken});
            if(!match){
                const error = {
                    status: 401,
                    message: 'unauthorize'
                };
                return next(error); 
            }
        } catch (error) {
           return next(error); 
        }
        try {
            const accesstoken = JWTService.signAccessToken({_id : id },'30m');
            const refreshtoken = JWTService.signRefreshToken({_id : id },'60m');
    
            await RefreshToken.updateOne({_id : id},{ token : refreshtoken});
            res.cookie('accesstoken', accesstoken, {
                maxAge: 1000 * 60 * 60 * 24,
                httpOnly: true
            })
    
            res.cookie('refreshtoken', refreshtoken, {
                maxAge: 1000 * 60 * 60 * 24,
                httpOnly: true
            })  
        } catch (error) {
            return next(error)
        }
        
        const user = await User.findOne({_id : id });
        const userdto = new UserDTO(user);
        return res.status(200).json({ user: userdto, auth: true });
    }
}



module.exports = authController;