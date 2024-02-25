use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, Eq, Deserialize, Serialize)]
pub struct Inventory {
    pub book_id: String,
    pub qty_available: String,
}