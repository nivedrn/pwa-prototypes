mod models;
mod config;

use actix_web::{get, post, web, App, HttpResponse, HttpServer, Responder};
use mongodb::{ bson::{doc, Document}, Client, Database};
use config::Config;
use std::error::Error;
use serde::{Serialize,Deserialize};

#[derive(Deserialize)]
struct ProductQuery {
    limit: Option<i64>,
    offset: Option<u64>,
    featured: Option<bool>,
}

struct Bookstore{
    db: Database,
}

#[derive(Serialize)]
struct ApiListResponse {
    data: Vec<Document>,
    status: i32,
    total_count: u64,
    next: Option<String>,
    prev: Option<String>,
    error: Option<String>,
}

#[derive(Serialize)]
struct ApiResponse {
    data: Document,
    status: i32,
    error: Option<String>,
}

#[get("*")]
async fn server_with_disabled_services() -> impl Responder {
    HttpResponse::Ok().body("Server is Up. DB Services are disabled.")
}

#[get("/")]
async fn server_up() -> impl Responder {
    HttpResponse::Ok().body("Server is Up!")
}

#[get("/list")]
async fn product_list(query: web::Query<ProductQuery>, store: web::Data<Bookstore>) -> impl Responder { 
    println!("limit: {:?}, offset: {:?}, featured: {:?}", query.limit, query.offset, query.featured);
    let queried_books = models::books::get_books(store.db.clone(), query.limit.unwrap_or(0), query.offset.unwrap_or(0), query.featured.unwrap_or(false)).await;
    let total_count = match models::books::get_books_count(store.db.clone()).await {
        Ok(count) => count,
        Err(e) => {
            println!("Error: {}", e);
            0
        }
    };
    match queried_books {
        Ok(books) => {
            let response = ApiListResponse {
                data: books,
                status: 200,
                total_count: total_count,
                next: Some("/api/products/list?limit=10&skip=10&featured=true".to_string()),
                prev: None,
                error: None,
            };
        
            HttpResponse::Ok().json(response)
        },
        Err(e) => {
            HttpResponse::InternalServerError().body(format!("Error: {}", e))
        }
    }
}

#[get("/groupedlist")]
async fn product_groupedlist(store: web::Data<Bookstore>) -> impl Responder { 
    let queried_books = models::books::get_grouped_books(store.db.clone()).await;

    match queried_books {
        Ok(books) => {
            let response = ApiListResponse {
                data: books,
                status: 200,
                total_count: 1,
                next: None,
                prev: None,
                error: None,
            };
        
            HttpResponse::Ok().json(response)
        },
        Err(e) => {
            HttpResponse::InternalServerError().body(format!("Error: {}", e))
        }
    }
}

#[get("/item/{id}")]
async fn product_detail(path: web::Path<(String,)>, store: web::Data<Bookstore>) -> impl Responder {
    let book_id = path.into_inner().0;
    let queried_books = models::books::get_book_detail(store.db.clone(), book_id.to_string()).await;

    match queried_books {
        Ok(books) => {
            let response = ApiResponse {
                data: books,
                status: 200,
                error: None,
            };
        
            HttpResponse::Ok().json(response)
        },
        Err(e) => {
            HttpResponse::InternalServerError().body(format!("Error: {}", e))
        }
    }
}

#[post("/create")]
async fn product_create(req_body: String) -> impl Responder {
    HttpResponse::Ok().body(req_body)
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {

    let config = Config::new();

    println!("DB: Attempting connection to MongoDB...");
    let mut is_db_connected = false;
    let client = Client::with_uri_str(&config.db_connection_string).await.unwrap();
    match client.database(&config.db_name).run_command(doc! { "ping": 1 }, None).await {
        Ok(_) => {
            is_db_connected = true;
            println!("DB: Connected to MongoDB!");
        },
        Err(e) => {
            println!("DB: Connection Error - {}", e);
        },
    }

    if is_db_connected {
        let bookstore_db = client.database(&config.db_name);
        println!("Server: Running at http://{}:{}", config.server_host, config.server_port);
        HttpServer::new(move || {
            App::new()
                .app_data(web::Data::new(Bookstore { db: bookstore_db.clone() }))
                .service(
                    web::scope("/api/products")
                    .service(product_list)
                    .service(product_groupedlist)
                    .service(product_detail)
                    .service(product_create)
                )
                .service(server_up)
        })
        .bind(format!("{}:{}",config.server_host, config.server_port))?
        .run()
        .await?;
    }else{
        println!("Server: DB Services disabled. Server Running at http://{}:{}", config.server_host, config.server_port);
        HttpServer::new(|| {
            App::new().service(server_with_disabled_services)
        })
        .bind(format!("{}:{}",config.server_host, config.server_port))?
        .run()
        .await?;
    } 

    Ok(())    
}