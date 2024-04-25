const Joi = require('joi');
const fs = require('fs');
const BlogDTO = require('../Dto/blog');
const Blog = require('../Models/blog');
const mongoIdPattern = /^[0-9a-fA-F]{24}$/;
const { BACKEND_SERVER_PATH } = require('../config/index');
const BlogDetailsDTO = require('../Dto/blogdetails');
const Comment = require('../Models/comment');

const blogController = {
    async create(req, res, next) {
        const createBlogSchema = Joi.object({
            title: Joi.string().required(),
            content: Joi.string().required(),
            photo: Joi.string().required(),
            author: Joi.string().regex(mongoIdPattern).required(),
        });

        const { error } = createBlogSchema.validate(req.body);
        if (error) {
            return next(error); 
        }

        const { title, content, photo, author } = req.body;

        const buffer = Buffer.from(photo.replace(/^data:image\/(png|jpg|jpeg);base64,/, ''), 'base64');

        const imagePath = `${Date.now()}-${author}`;

        try {
            fs.writeFileSync(`Storage/${imagePath}`, buffer);
        } catch (error) {
            return next(error);
        }
        let newBlog;
        try {
            newBlog = new Blog({
                title,
                content,
                photopath:`${BACKEND_SERVER_PATH}/Storage/${imagePath}`,
                author
            });
            await newBlog.save();
        } catch (error) {
            return next(error)
        }
        const blogDTO = new BlogDTO(newBlog)
        return res.status(201).json({blog : blogDTO});
    },

    async getall(req, res, next) { 
        
        try {
            const blogs = await Blog.find({});

            const blogsarray = [];

            for(let i = 0 ; i < blogs.length ; i++ ){

                const blogsdto = new BlogDTO(blogs[i]);

                blogsarray.push(blogsdto);
            }
            return res.status(200).json({blogs:blogsarray});
        } catch (error) {
           return next(error); 
        }
    },


    async getbyid(req, res, next) {
        const validateIdSchema = Joi.object({
            id: Joi.string().regex(mongoIdPattern).required()
        });
    
        const { error } = validateIdSchema.validate(req.params);
        if (error) {
            return next(error);
        }
    
        const { id } = req.params;
    
        try {
            const blog = await Blog.findOne({ _id: id }).populate('author');
    
            if (!blog) {
                return res.status(404).json({ error: 'Blog not found' });
            }
    
            const blogdto = new BlogDetailsDTO(blog);
    
            return res.status(200).json({ blog: blogdto });
        } catch (error) {
            return next(error);
        }
    }
,    
    async update(req, res, next) {
        const updateBlogSchema = Joi.object({
            title: Joi.string().required(),
            content: Joi.string().required(),
            photo: Joi.string(),
            author: Joi.string().regex(mongoIdPattern).required(),
            blogId: Joi.string().regex(mongoIdPattern).required(),
        });
        const { error } = updateBlogSchema.validate(req.body);
        if (error) {
            return next(error); 
        }

        const { title, content, photo, author, blogId } = req.body;

        let blog ;
        try {
            blog = await Blog.findOne({_id :blogId });

        } catch (error) {
            return next(error); 
            
        }
        if(photo){
            let previousphoto = blog.photopath;

            previousphoto = previousphoto.split('/').at(-1);
            fs.unlinkSync(`Storage/${previousphoto}`);
            const buffer = Buffer.from(photo.replace(/^data:image\/(png|jpg|jpeg);base64,/, ''), 'base64');

            const imagePath = `${Date.now()}-${author}`;
    
            try {
                fs.writeFileSync(`Storage/${imagePath}`, buffer);
            } catch (error) {
                return next(error);
            }

            await Blog.updateOne({_id : blogId},
                {title,content,photopath:`${BACKEND_SERVER_PATH}/Storage/${imagePath}`,
                }
                ); 
        }else{
            await Blog.updateOne({_id:blogId},{
                content,title
            });

        }
        return res.status(200).json({message:"blog update"});
 
     },
    async delete(req, res, next) {

        const validateIdSchemaa = Joi.object({
            id : Joi.string().regex(mongoIdPattern).required()
        });
        const {id} = req.params;
        const {error} = validateIdSchemaa.validate(req.params);
        if(error){
            return next(error);
        }
        try {
            await Blog.deleteOne({ _id : id });
            await Comment.deleteMany({blog : id});
                
        } catch (error) {
            return next(error);    
        }
        
        return res.status(200).json({message:"blog  is deleted"});
     }
};
module.exports = blogController;