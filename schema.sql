-- Clean up old tables if they exist (drops in reverse order of dependencies)
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. USERS TABLE
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. PRODUCTS TABLE
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price INT NOT NULL, -- Stored in cents (e.g., $10.00 is 1000)
    public_thumb_url VARCHAR(500) NOT NULL,
    private_file_key VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. ORDERS TABLE
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    total_amount INT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    stripe_payment_intent_id VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. ORDER ITEMS TABLE
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id) ON DELETE SET NULL,
    price_at_sale INT NOT NULL
);

-- 5. INSERT A SAMPLE PRODUCT (So your React frontend has something to display!)
INSERT INTO products (title, description, price, public_thumb_url, private_file_key)
VALUES (
    'Cyberpunk Neon City',
    'High-resolution digital illustration for web and print.',
    1999,
    'https://picsum.photos/id/1018/600/400',
    'high_res/cyberpunk_city.png'
);