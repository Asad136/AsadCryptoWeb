const express = require('express');
const authController = require('../Controller/authController');
const blogController = require('../Controller/blogController');
const auth = require('../middleware/auth');
const CommentController = require('../Controller/CommentController');
const router = express.Router();
//test
router.get('/test',(req,res)=>res.json({msg:"its working"}));
//auth
router.post('/register' ,authController.register);
router.post('/login' ,authController.login);
router.post('/logout' , auth ,authController.logout);
router.get('/refresh' , auth ,authController.refresh);
//blog
router.post('/blog',auth , blogController.create);
router.get('/blog/all',auth , blogController.getall);
router.get('/blog/:id',auth , blogController.getbyid);
router.put('/blog/update',auth , blogController.update);
router.delete('/blog/delete/:id',auth , blogController.delete);
//comment 
router.post('/comment/create',auth,CommentController.create);
router.get('/comment/:id',auth,CommentController.getbyId);


module.exports = router;