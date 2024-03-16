mod models;
mod config;

use actix_web::{get, post, web, App, HttpResponse, HttpServer, Responder};
use mongodb::{ bson::{doc, Document}, Client, Database};
use config::Config;
use std::error::Error;
use serde::{Serialize,Deserialize};
use models::orders::OrderData;

#[derive(Deserialize)]
struct OrderQuery {
    limit: Option<i64>,
    offset: Option<u64>
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
async fn orders_list(query: web::Query<OrderQuery>, store: web::Data<Bookstore>) -> impl Responder { 
    println!("limit: {:?}, offset: {:?}", query.limit, query.offset);
    let queried_orders = models::orders::get_orders(store.db.clone(), query.limit.unwrap_or(0), query.offset.unwrap_or(0)).await;
    let total_count = match models::orders::get_orders_count(store.db.clone()).await {
        Ok(count) => count,
        Err(e) => {
            println!("Error: {}", e);
            0
        }
    };
    match queried_orders {
        Ok(orders) => {
            let response = ApiListResponse {
                data: orders,
                status: 200,
                total_count: total_count,
                next: Some("/api/orders/list?limit=10&skip=10".to_string()),
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
async fn order_detail(path: web::Path<(String,)>, store: web::Data<Bookstore>) -> impl Responder {
    let order_id = path.into_inner().0;
    let queried_orders = models::orders::get_order_detail(store.db.clone(), order_id.to_string()).await;

    match queried_orders {
        Ok(orders) => {
            let response = ApiResponse {
                data: orders,
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

#[post("/item/create")]
async fn order_create(order_data: web::Json<OrderData>, store: web::Data<Bookstore>) -> impl Responder  {
    let order_creation = models::orders::create_order(store.db.clone(), &order_data).await;
    match order_creation {
        Ok(result) => {
            let response = ApiResponse {
                data: result,
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
                    web::scope("/api/orders")
                    .service(orders_list)
                    .service(order_detail)
                    .service(order_create)
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