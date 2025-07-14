import cloudinary from "../config/cloudinary.js"
import { handleError } from "../helpers/handleError.js"
import Blog from "../models/blog.model.js"
import { encode } from 'entities'
import Category from "../models/category.model.js"
import Subscribers from "../models/Subscriber.js"
import sendEmail from "../utils/sendEmail.js"
import dotenv from 'dotenv';
dotenv.config();


export const addBlog = async (req, res, next) => {
    try {
        const data = JSON.parse(req.body.data);
        let featuredImage = '';

        if (req.file) {
            const uploadResult = await cloudinary.uploader
                .upload(req.file.path, { folder: 'vvv', resource_type: 'auto' })
                .catch((error) => next(handleError(500, error.message)));

            featuredImage = uploadResult.secure_url;
        }

        const blogSlug = `${data.slug}-${Math.round(Math.random() * 100000)}`;

        // ✅ Get category slug
        const category = await Category.findById(data.category).select('slug');
        if (!category) {
            return next(handleError(404, 'Category not found.'));
        }

        const blog = new Blog({
            author: data.author,
            category: data.category,
            title: data.title,
            slug: blogSlug,
            featuredImage: featuredImage,
            blogContent: encode(data.blogContent),
        });

        await blog.save();

        const FRONTEND_URL = process.env.FRONTEND_URL; // ✅ from .env

        const liveLink = `${FRONTEND_URL}/blog/${category.slug}/${blogSlug}`;

        // ✅ Send email to subscribers
        const subscribers = await Subscribers.find({}, 'email').lean();
        const emails = subscribers.map(sub => sub.email);

        if (emails.length > 0) {
            const subject = "📰 New Blog Published!";
            const html = `
                <h2>${data.title}</h2>
                <p>A new blog has been published on our site. Click below to read it:</p>
                <p><a href="${liveLink}" target="_blank">${liveLink}</a></p>
                <p>Thanks for subscribing!</p>
            `;

            await sendEmail(emails, subject, html);
        }

        res.status(200).json({
            success: true,
            message: 'Blog added and email sent to subscribers.',
            blogUrl: liveLink
        });

    } catch (error) {
        next(handleError(500, error.message));
    }
}


export const editBlog = async (req, res, next) => {
    try {
        const { blogid } = req.params
        const blog = await Blog.findById(blogid).populate('category', 'name')
        if (!blog) {
            next(handleError(404, 'Data not found.'))
        }
        res.status(200).json({
            blog
        })
    } catch (error) {
        next(handleError(500, error.message))
    }
}
export const updateBlog = async (req, res, next) => {
    try {
        const { blogid } = req.params
        const data = JSON.parse(req.body.data)

        const blog = await Blog.findById(blogid)

        blog.category = data.category
        blog.title = data.title
        blog.slug = data.slug
        blog.blogContent = encode(data.blogContent)

        let featuredImage = blog.featuredImage

        if (req.file) {
            // Upload an image
            const uploadResult = await cloudinary.uploader
                .upload(
                    req.file.path,
                    { folder: 'yt-mern-blog', resource_type: 'auto' }
                )
                .catch((error) => {
                    next(handleError(500, error.message))
                });

            featuredImage = uploadResult.secure_url
        }

        blog.featuredImage = featuredImage

        await blog.save()


        res.status(200).json({
            success: true,
            message: 'Blog updated successfully.'
        })

    } catch (error) {
        next(handleError(500, error.message))
    }
}
export const deleteBlog = async (req, res, next) => {
    try {
        const { blogid } = req.params
        await Blog.findByIdAndDelete(blogid)
        res.status(200).json({
            success: true,
            message: 'Blog Deleted successfully.',
        })
    } catch (error) {
        next(handleError(500, error.message))
    }
}
export const showAllBlog = async (req, res, next) => {
    try {
        const user = req.user
        let blog;
        if (user.role === 'admin') {
            blog = await Blog.find().populate('author', 'name avatar role').populate('category', 'name slug').sort({ createdAt: -1 }).lean().exec()
        } else {
            blog = await Blog.find({ author: user._id }).populate('author', 'name avatar role').populate('category', 'name slug').sort({ createdAt: -1 }).lean().exec()
        }
        res.status(200).json({
            blog
        })
    } catch (error) {
        next(handleError(500, error.message))
    }
}

export const getBlog = async (req, res, next) => {
    try {
        const { slug } = req.params
        const blog = await Blog.findOne({ slug }).populate('author', 'name avatar role').populate('category', 'name slug').lean().exec()
        res.status(200).json({
            blog
        })
    } catch (error) {
        next(handleError(500, error.message))
    }
}

export const getRelatedBlog = async (req, res, next) => {
    try {
        const { category, blog } = req.params

        const categoryData = await Category.findOne({ slug: category })
        if (!categoryData) {
            return next(404, 'Category data not found.')
        }
        const categoryId = categoryData._id
        const relatedBlog = await Blog.find({ category: categoryId, slug: { $ne: blog } }).lean().exec()
        res.status(200).json({
            relatedBlog
        })
    } catch (error) {
        next(handleError(500, error.message))
    }
}

export const getBlogByCategory = async (req, res, next) => {
    try {
        const { category } = req.params

        const categoryData = await Category.findOne({ slug: category })
        if (!categoryData) {
            return next(404, 'Category data not found.')
        }
        const categoryId = categoryData._id
        const blog = await Blog.find({ category: categoryId }).populate('author', 'name avatar role').populate('category', 'name slug').lean().exec()
        res.status(200).json({
            blog,
            categoryData
        })
    } catch (error) {
        next(handleError(500, error.message))
    }
}
export const search = async (req, res, next) => {
    try {
        const { q } = req.query

        const blog = await Blog.find({ title: { $regex: q, $options: 'i' } }).populate('author', 'name avatar role').populate('category', 'name slug').lean().exec()
        res.status(200).json({
            blog,
        })
    } catch (error) {
        next(handleError(500, error.message))
    }
}

export const getAllBlogs = async (req, res, next) => {
    try {
        const user = req.user
        const blog = await Blog.find().populate('author', 'name avatar role').populate('category', 'name slug').sort({ createdAt: -1 }).lean().exec()
        res.status(200).json({
            blog
        })
    } catch (error) {
        next(handleError(500, error.message))
    }
}


export const toggleBlogVisibility = async (req, res, next) => {
    try {
        const { blogid } = req.params;

        const blog = await Blog.findById(blogid);
        if (!blog) {
            return next(handleError(404, 'Blog not found.'));
        }

        // Toggle the visibility
        blog.visibility = !blog.visibility;

        await blog.save();

        res.status(200).json({
            success: true,
            message: `Blog visibility updated to ${blog.visibility ? 'visible' : 'hidden'}.`,
            visibility: blog.visibility
        });

    } catch (error) {
        next(handleError(500, error.message));
    }
};
