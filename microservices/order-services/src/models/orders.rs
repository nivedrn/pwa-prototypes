use mongodb::{bson::{doc, Document}, Collection, Database, options::FindOptions, error::Error};
use futures::TryStreamExt;
use serde::{Deserialize, Serialize};

pub async fn get_orders_count(db: Database) -> Result<u64, Error> {
    let collection: Collection<Document> = db.collection("orders");
    let count = collection.count_documents(doc! {}, None).await?;
    Ok(count)
}

pub async fn get_orders(db: Database, limit: i64, offset: u64) -> Result<Vec<Document>, Error> {
    println!("limit: {}, offset: {}", limit, offset);
    let limited = if limit <= 0 || limit > 100 { 100 } else { limit};
    let options = FindOptions::builder()
                  .limit(Some(limited))
                  .skip(offset)
                  .build();
    
    let query = doc! {};
    let collection: Collection<Document> = db.collection("orders");    
    let mut cursor = collection.find(query, options).await?;
    let mut orders: Vec<Document> = Vec::new();

    while let Some(order) = cursor.try_next().await? {
        orders.push(order);
    }

    Ok(orders)   
}

pub async fn get_order_detail(db: Database, order_id: String) -> Result<Document, Error> {
    let query = doc! {"_id": order_id};

    let collection: Collection<Document> = db.collection("orders");    
    let order_detail: Document = collection.find_one(query, None).await?.unwrap_or_default();

    Ok(order_detail)
}

#[allow(non_snake_case)]
#[derive(Debug, Serialize, Deserialize)]
struct OrderItem{
    id: String,
    isbn: String,
    title: String,
    qty: i32,
    price: f64,
    amount: f64
}

#[allow(non_snake_case)]
#[derive(Debug, Serialize, Deserialize)]
struct PaymentInfo {
    paymentIntent: String,
    paymentIntentSecret: String,
    paymentStatus: String    
}

#[allow(non_snake_case)]
#[derive(Debug, Serialize, Deserialize)]
pub struct OrderData {
    customer: String,
    customerEmail: String,
    orderTotal: f64,
    currencySymbol: String,
    status: String,
    paymentInfo: PaymentInfo,
    items: Vec<OrderItem>
}

fn order_item_to_doc(item: &OrderItem) -> Document {
    doc! {
        "id": item.id.clone(),
        "isbn": item.isbn.clone(),
        "title": item.title.clone(),
        "qty": item.qty,
        "price": item.price,
        "amount": item.amount,
    }
}

pub async fn create_order(db: Database, order_data: &OrderData) -> Result<Document, Error> {
    let order_doc = doc!{
        "customer": order_data.customer.clone(),
        "customerEmail": order_data.customerEmail.clone(),	
        "orderTotal": order_data.orderTotal,
        "currencySymbol": order_data.currencySymbol.clone(),
        "status": order_data.status.clone(),
        "paymentInfo": {
            "paymentIntent": order_data.paymentInfo.paymentIntent.clone(),
            "paymentIntentSecret": order_data.paymentInfo.paymentIntentSecret.clone(),
            "paymentStatus": order_data.paymentInfo.paymentStatus.clone(),
        },
        "items": order_data.items.iter()
        .map(order_item_to_doc)
        .collect::<Vec<Document>>()
    };
    
    let collection = db.collection("orders");
    let result = collection.insert_one(order_doc, None).await?;

    let inserted_id = result.inserted_id;
    let inserted_id_str = inserted_id.as_object_id().unwrap().to_hex();

    Ok(doc! { "_id": inserted_id_str })
}