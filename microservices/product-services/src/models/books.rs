use mongodb::{bson::doc, bson::oid::ObjectId, Collection, Database, options::FindOptions, error::Error};
use serde::{Deserialize, Serialize};
use futures::TryStreamExt;
// use crate::models::authors::Author;
use chrono::{DateTime, Utc};
use bson::serde_helpers::chrono_datetime_as_bson_datetime;

#[derive(Debug, Serialize, Deserialize)]
pub struct Book {
    #[serde(rename = "_id")]
    pub id: Option<ObjectId>, 
    pub title: Option<String>,
    pub isbn: Option<String>,
    pub page_count: Option<u64>,
    #[serde(default)]
    #[serde(with = "chrono_datetime_as_bson_datetime")]
    pub published_date: DateTime<Utc>,
    pub thumbnail_url: Option<String>,
    pub short_description: Option<String>,
    pub long_description: Option<String>,
    pub status: Option<String>,
    pub authors: Option<Vec<String>>,
    pub categories: Option<Vec<String>>,
    pub is_featured: Option<bool>,
}

pub async fn get_books_count(db: Database) -> Result<u64, Error> {
    let collection: Collection<Book> = db.collection("books");
    let count = collection.count_documents(doc! {}, None).await?;
    Ok(count)
}

pub async fn get_books(db: Database, limit: i64, offset: u64, is_featured: bool) -> Result<Vec<Book>, Error> {
    println!("limit: {}, offset: {}, is_featured: {}", limit, offset, is_featured);
    let limited = if limit <= 0 || limit > 100 { 100 } else { limit};
    let options = FindOptions::builder()
                  .limit(Some(limited as i64))
                  .skip(offset)
                  .build();
    
    let mut query = doc! {};

    if is_featured {
        query.insert("isFeatured", true);
    }

    let collection: Collection<Book> = db.collection("books");    
    let mut cursors = collection.find(query, options).await?;
    let mut books: Vec<Book> = Vec::new();

    while let Some(book) = cursors.try_next().await? {
        books.push(Book {
            id: Some(book.id.unwrap()),
            title: book.title,
            isbn: book.isbn,
            page_count: book.page_count,
            published_date: book.published_date,
            thumbnail_url: book.thumbnail_url,
            short_description: book.short_description,
            long_description: book.long_description,
            status: book.status,
            authors: book.authors,
            categories: book.categories,
            is_featured: book.is_featured,
        })
    }

    Ok(books)    
}
