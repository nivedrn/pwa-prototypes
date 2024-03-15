'use server'

import clientPromise from "../lib/mongodb";

export async function fetchBooks(limit: number, offset: number = 0, featured: boolean = false, category: string = "", search: string = "") {
    try {

        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_NAME);
        const query: any = {};
        if (featured) {
            query.featured = featured;
        }
        if (category && category !== "") {
            query.categories = category;
        }
        if (search && search !== "") {
            query.$or = [
                { title: { $regex: search, $options: 'i' } }, 
                { authors: { $elemMatch: { $regex: search, $options: 'i' } } } 
            ];
        }
        const options = { 
            projection: {
                id: { $toString: "$_id" },
                title: 1,
                isbn: 1,
                status: 1,
                is_featured: 1,
                thumbnail_url: 1,
                price: 1,
                _id: 0
            },
            skip: offset, limit: limit };
        const booksData = await db.collection("books").find(query, options).toArray();

        return { results: booksData };
    } catch (error) {
        console.log('error', error);
        return { data: null, error: 'Failed to fetch book records: ' + error };
    }
}

export async function fetchBookDetails(bookId: string) {
    try {
        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_NAME);
        const query: any = {};
        if (bookId != "" && bookId != null) {
            query.isbn = bookId;
        }
        const options = { 
            projection: {
                id: { $toString: "$_id" },
                title: 1,
                isbn: 1,
                status: 1,
                is_featured: 1,
                thumbnail_url: 1,
                short_description: 1,
                long_description: 1,
                authors: 1,
                categories: 1,
                price: 1,
                page_count: 1,
                _id: 0
            } };
        const bookData = await db.collection("books").findOne(query, options);

        return { results: bookData };
    } catch (error) {
        console.log('error', error);
        return { data: null, error: 'Failed to fetch book records: ' + error };
    }
}

export async function fetchGroupedBooks() {
    try {
        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_NAME);

        const pipeline = [
            { $unwind: "$categories" }, 
            {
                $group: {
                    _id: "$categories", books: {
                        $push: {
                            id: { $toString: "$_id" },
                            title: "$title",
                            isbn: "$isbn",
                            status: "$status",
                            is_featured: "$is_featured",
                            thumbnail_url: "$thumbnail_url",
                            price: "$price"
                        }
                    }, count: { $sum: 1 } 
                }
            },
            {
                $match: { count: { $gte: 5 } } 
            }, 
            { $project: { _id: 0, category: "$_id", books: { $slice: ["$books", 10] } } } 
        ];

        const groupedBooks = await db.collection("books").aggregate(pipeline).toArray();

        return { results: groupedBooks };
    } catch (error) {
        console.log('error', error);
        return { data: null, error: 'Failed to fetch grouped book records: ' + error };
    }
}
