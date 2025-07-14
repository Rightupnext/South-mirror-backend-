import mongoose from 'mongoose';
import { handleError } from "../helpers/handleError.js";
import Category from "../models/category.model.js";

export const addCategory = async (req, res, next) => {
    try {
        const { name, slug } = req.body;

        // Check if the slug already exists
        const existingCategory = await Category.findOne({ slug });
        if (existingCategory) {
            return next(handleError(400, 'Slug already exists. Please choose a different one.'));
        }

        const category = new Category({
            name, slug
        });

        await category.save();

        res.status(200).json({
            success: true,
            message: 'Category added successfully.'
        });

    } catch (error) {
        next(handleError(500, error.message));
    }
};

export const showCategory = async (req, res, next) => {
    try {
        const { categoryid } = req.params;
        const category = await Category.findById(categoryid);
        
        if (!category) {
            return next(handleError(404, 'Data not found.'));
        }

        res.status(200).json({
            category
        });
    } catch (error) {
        next(handleError(500, error.message));
    }
};

export const updateCategory = async (req, res, next) => {
    try {
        const { name, slug } = req.body;
        const { categoryid } = req.params;

        // Check if the category ID is valid
        if (!mongoose.Types.ObjectId.isValid(categoryid)) {
            return next(handleError(400, 'Invalid category ID.'));
        }

        // Check if the category exists
        const category = await Category.findByIdAndUpdate(categoryid, { name, slug }, { new: true });

        if (!category) {
            return next(handleError(404, 'Category not found.'));
        }

        res.status(200).json({
            success: true,
            message: 'Category updated successfully.',
            category
        });
    } catch (error) {
        next(handleError(500, error.message));
    }
};

export const deleteCategory = async (req, res, next) => {
    try {
        const { categoryid } = req.params;

        // Check if the category ID is valid
        if (!mongoose.Types.ObjectId.isValid(categoryid)) {
            return next(handleError(400, 'Invalid category ID.'));
        }

        // Check if the category exists
        const category = await Category.findByIdAndDelete(categoryid);

        if (!category) {
            return next(handleError(404, 'Category not found.'));
        }

        res.status(200).json({
            success: true,
            message: 'Category deleted successfully.'
        });
    } catch (error) {
        next(handleError(500, error.message));
    }
};

export const getAllCategory = async (req, res, next) => {
    try {
        const category = await Category.find().sort({ name: 1 }).lean().exec();
        res.status(200).json({
            category
        });
    } catch (error) {
        next(handleError(500, error.message));
    }
};
