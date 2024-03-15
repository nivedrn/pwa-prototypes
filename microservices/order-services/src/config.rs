use toml;
use serde::{ Serialize, Deserialize};
use std::fs;

#[derive(Serialize, Deserialize)]
struct ServerConfig {
    host: String,
    port: i32,
}

#[derive(Serialize, Deserialize)]
struct DatabaseConfig {
    db_host: String,
    db_port: i32,
    db_name: String,
    username: String,
    password: String,
}

#[derive(Serialize, Deserialize)]
struct ConfigToml {
    server: Option<ServerConfig>,
    database: Option<DatabaseConfig>,    
}

#[derive(Deserialize)]
pub struct Config {
    pub server_host: String,
    pub server_port: i32,
    pub db_connection_string: String,
    pub db_name: String,
}

impl Config {
    pub fn new() -> Self {
        let mut content: String = "".to_string();

        let config_filepaths: [&str; 2] = [
            "./config.toml",
            "/etc/config.toml",
        ];
        
        for filepath in config_filepaths {
            match fs::read_to_string(filepath) {
                Ok(result) => {
                    content = result;
                    println!("Config: Loading config from {}", filepath);
                    break;
                },
                Err(e) => {
                    println!("Config: Error reading file {}: {}", filepath, e);
                }
            }
        }

        let config_toml:ConfigToml = toml::from_str(&content).unwrap_or_else(|e| {
            println!("Config: Failed to parse TOML file: {}", e);
            ConfigToml {
                server: None,
                database: None,
            }
        });

        let (username, password, db_host, db_port, db_name) = match config_toml.database {
            Some(db) => (db.username, db.password, db.db_host, db.db_port, db.db_name),
            None => ("".to_string(), "".to_string(), "".to_string(), 0, "".to_string()),
        };

        let (host, port) = match config_toml.server {
            Some(server) => (server.host, server.port),
            None => ("127.0.0.1".to_string(), 8400),
        };

        Config {
            server_host: host,
            server_port: port,
            db_connection_string: format!("mongodb://{}:{}@{}:{}/", username, password, db_host, db_port),
            db_name: db_name,
        }
    }
}