const Joi = require('joi');
const Comment = require('../Models/comment');
const CommentDTO = require('../Dto/Comment');



const mongoIdPattern = /^[0-9a-fA-F]{24}$/;

const CommentController = {
    async create(req,res,next){
        const commentvalidationscheme = Joi.object({
            content : Joi.string().required(),
            author: Joi.string().regex(mongoIdPattern).required(),
            blog: Joi.string().regex(mongoIdPattern).required(),
        })
        const { error } = commentvalidationscheme.validate(req.body);
        if (error) {
            return next(error); 
        }
        const {content,author,blog} = req.body ;
        try {
            const comment = new Comment({
                content,
                author,
                blog
            })
            await comment.save();
        } catch (error) {
            return next(error);
        }
        return res.status(200).json({message:"comment posted"})

    },
    async getbyId(req,res,next){
        const validateIdSchema = Joi.object({
            id: Joi.string().regex(mongoIdPattern).required()
        });
    
        const { error } = validateIdSchema.validate(req.params);
        if (error) {
            return next(error);
        }
    
        const { id } = req.params;
        let comment
        try {
            comment = await Comment.find({blog:id}).populate('author');

        } catch (error) {
            return next(error);
            
        }
        let commentdto=[] ;
        for( let i = 0 ; i < comment.length; i++){
            const obj = new CommentDTO(comment[i]);
            commentdto.push(obj);
        }
        return res.status(200).json({data:commentdto})

    },
}
module.exports = CommentController;
