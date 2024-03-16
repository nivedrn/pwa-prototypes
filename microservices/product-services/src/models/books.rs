use mongodb::{bson::{doc, Document}, Collection, Database, options::FindOptions, error::Error};
use futures::TryStreamExt;

pub async fn get_books_count(db: Database) -> Result<u64, Error> {
    let collection: Collection<Document> = db.collection("books");
    let count = collection.count_documents(doc! {}, None).await?;
    Ok(count)
}

pub async fn get_books(db: Database, limit: i64, offset: u64, is_featured: bool) -> Result<Vec<Document>, Error> {
    println!("limit: {}, offset: {}, is_featured: {}", limit, offset, is_featured);
    let limited = if limit <= 0 || limit > 100 { 100 } else { limit};
    let options = FindOptions::builder()
                  .limit(Some(limited))
                  .skip(offset)
                  .build();
    
    let mut query = doc! {};

    if is_featured {
        query.insert("is_featured", true);
    }

    let collection: Collection<Document> = db.collection("books");    
    let mut cursor = collection.find(query, options).await?;
    let mut books: Vec<Document> = Vec::new();

    while let Some(book) = cursor.try_next().await? {
        books.push(book);
    }

    Ok(books)   
}

pub async fn get_grouped_books(db: Database) -> Result<Vec<Document>, Error> {
    let pipeline: Vec<Document> = vec![
        doc! { "$unwind": "$categories" },
        doc! {
            "$group": {
                "_id": "$categories",
                "books": {
                    "$push": {
                        "id": { "$toString": "$_id" },
                        "title": "$title",
                        "isbn": "$isbn",
                        "status": "$status",
                        "is_featured": "$is_featured",
                        "thumbnail_url": "$thumbnail_url",
                        // Include other fields as needed
                    }
                },
                "count": { "$sum": 1 }
            }
        },
        doc! { "$match": { "count": { "$gte": 5 } } },
        doc! { "$project": { "_id": 0, "category": "$_id", "books": { "$slice": ["$books", 10] } } },
    ];

    let mut grouped_books_cursor = db.collection::<Document>("books")
        .aggregate(pipeline, None)
        .await?;
    let mut grouped_books: Vec<Document> = Vec::new();

    while let Some(document) = grouped_books_cursor.try_next().await? {
        grouped_books.push(document);
    }

    Ok(grouped_books)
}

pub async fn get_book_detail(db: Database, book_id: String) -> Result<Document, Error> {
    let query = doc! {"isbn": book_id};

    let collection: Collection<Document> = db.collection("books");    
    let book_detail: Document = collection.find_one(query, None).await?.unwrap_or_default();

    Ok(book_detail)
}