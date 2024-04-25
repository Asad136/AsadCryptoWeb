class BlogDTO{
    constructor(blog){
        this.id = blog._id;
        this.author = blog.author;
        this.content = blog.content;
        this.title = blog.title;
        this.photo = blog.photopath;
    }
}
module.exports = BlogDTO;