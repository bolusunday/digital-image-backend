DROP TABLE IF EXISTS reviews CASCADE;
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
    price INT NOT NULL, -- Stored in cents
    category VARCHAR(100) DEFAULT 'digital',
    public_thumb_url VARCHAR(500) NOT NULL,
    image_url VARCHAR(500),
    images TEXT[],
    private_file_key VARCHAR(500) NOT NULL,
    rating_average NUMERIC(3, 2) DEFAULT 0.00,
    rating_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. ORDERS TABLE
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    customer_email VARCHAR(255) NOT NULL,
    total_amount INT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
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

-- 5. REVIEWS TABLE
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    order_id INT REFERENCES orders(id) ON DELETE SET NULL,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    customer_email VARCHAR(255) NOT NULL,
    user_name VARCHAR(255),
    rating INT CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_order_product_review UNIQUE (order_id, product_id)
);

-- 6. INDEXES
CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_orders_email_id ON orders(id, LOWER(customer_email));
CREATE INDEX idx_order_items_order_product ON order_items(order_id, product_id);

-- 7. TRIGGER FOR AUTO RATING UPDATE
CREATE OR REPLACE FUNCTION update_product_rating_stats()
RETURNS TRIGGER AS $$
DECLARE
    target_product_id INT;
BEGIN
    target_product_id := COALESCE(NEW.product_id, OLD.product_id);

    UPDATE products
    SET 
        rating_average = COALESCE((
            SELECT ROUND(AVG(rating)::numeric, 2) 
            FROM reviews 
            WHERE product_id = target_product_id
        ), 0.00),
        rating_count = (
            SELECT COUNT(*) 
            FROM reviews 
            WHERE product_id = target_product_id
        )
    WHERE id = target_product_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_product_rating
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_product_rating_stats();