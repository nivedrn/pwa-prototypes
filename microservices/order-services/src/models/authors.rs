use mongodb::bson::oid::ObjectId;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, Eq, Deserialize, Serialize)]
pub struct Author {
    #[serde(rename = "_id")]
    pub id: Option<ObjectId>,
    pub name: String, // Add more fields as needed
}