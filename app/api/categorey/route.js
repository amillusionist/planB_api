import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Category from '@/models/Category';
import { getTranslation } from '@/services/translationService';

export async function POST(req) {
    try {
        await connectDB();
        
        const formData = await req.formData();
        const name = formData.get('name');
        const description = formData.get('description');
        const image = formData.get('image');

        if (!name || !description) {
            return NextResponse.json(
                { error: 'Name and description are required' },
                { status: 400 }
            );
        }

        // Get Arabic translations
        const nameAr = await getTranslation(name, 'ar');
        const descriptionAr = await getTranslation(description, 'ar');

        // Create category
        const category = await Category.create({
            name: name.trim(),
            nameAr,
            description: description.trim(),
            descriptionAr,
            image: image ? `/uploads/categories/${image.name}` : null,
            createdBy: 'admin' // You might want to get this from the session
        });

        return NextResponse.json({
            status: 'success',
            data: { category }
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating category:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create category' },
            { status: 500 }
        );
    }
}

export async function GET(req) {
    try {
        await connectDB();
        
        const categories = await Category.find({ isActive: true });
        const targetLanguage = req.headers.get('accept-language')?.toLowerCase() || 'en';
        
        const formattedCategories = categories.map(category => ({
            _id: category._id,
            name: targetLanguage === 'ar' ? category.nameAr || category.name : category.name,
            description: targetLanguage === 'ar' ? category.descriptionAr || category.description : category.description,
            image: category.image,
            isActive: category.isActive,
            slug: category.slug
        }));

        return NextResponse.json({
            status: 'success',
            results: formattedCategories.length,
            data: { categories: formattedCategories }
        });

    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch categories' },
            { status: 500 }
        );
    }
} 