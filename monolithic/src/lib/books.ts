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
        const options = { projection: { _id: 0 }, skip: offset, limit: limit };
        const booksData = await db.collection("books").find(query, options).toArray();

        return { results: booksData };
    } catch (error) {
        console.log('error', error);
        return { data: null, error: 'Failed to fetch book records: ' + error };
    }
}

export async function fetchGroupedBooks() {
    try {
        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_NAME);

        // Aggregation pipeline to group books by category and limit to 10 books per category
        const pipeline = [
            { $unwind: "$categories" }, // Unwind the categories array
            {
                $group: {
                    _id: "$categories", books: {
                        $push: {
                            title: "$title",
                            isbn: "$isbn",
                            status: "$status",
                            authors: "$authors",
                            categories: "$categories",
                            is_featured: "$is_featured",
                            long_description: "$long_description",
                            page_count: "$page_count",
                            published_date: "$published_date",
                            short_description: "$short_description",
                            thumbnail_url: "$thumbnail_url",
                            price: "$price"
                        }
                    }, count: { $sum: 1 } // Count the number of books per category
                }
            },
            {
                $match: { count: { $gte: 5 } } // Filter out categories with less than 5 books
            }, // Group by category and push books into an array
            { $project: { _id: 0, category: "$_id", books: { $slice: ["$books", 10] } } } // Project to rename fields and limit books array to 10
        ];

        const groupedBooks = await db.collection("books").aggregate(pipeline).toArray();

        return { results: groupedBooks };
    } catch (error) {
        console.log('error', error);
        return { data: null, error: 'Failed to fetch grouped book records: ' + error };
    }
}
