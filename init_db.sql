-- Таблица отчетов отдела А
CREATE TABLE IF NOT EXISTS reports_a (
    id SERIAL PRIMARY KEY,
    report_date DATE NOT NULL,
    merch_name TEXT NOT NULL,
    merch_phone TEXT NOT NULL,
    product_count INT NOT NULL,
    latitude NUMERIC(9,6),
    longitude NUMERIC(9,6),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    photo_url TEXT NOT NULL,
    s3_url TEXT
);

-- Таблица отчетов отдела Б
CREATE TABLE IF NOT EXISTS reports_b (
    id SERIAL PRIMARY KEY,
    report_date DATE NOT NULL,
    merch_name TEXT NOT NULL,
    merch_phone TEXT NOT NULL,
    product_exists BOOLEAN NOT NULL,
    promo_type TEXT CHECK (promo_type IN ('Стойка', 'Цена', 'Рекомендации')),
    latitude NUMERIC(9,6),
    longitude NUMERIC(9,6),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    photo_url TEXT NOT NULL,
    s3_url TEXT
);
