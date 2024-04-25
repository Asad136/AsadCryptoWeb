class BlogDetailsDTO{
    constructor(blog){
        this.id = blog._id;
        this.content = blog.content;
        this.title = blog.title;
        this.photo = blog.photopath;
        this.username = blog.author.username;
        this.author=blog.author._id;
        this.name = blog.author.name;
        this.createdAt = blog.createdAt;
        this.updatedAt = blog.updatedAt;


    }
}
module.exports = BlogDetailsDTO;