CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE public.products_book (
    product_id   VARCHAR(80) PRIMARY KEY,
    name         TEXT,
    skyn_type4   VARCHAR(20),
    ingredients  JSONB,
    product_type VARCHAR(30)
);

CREATE TABLE public.products_scrape (
    product_id  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        TEXT,
    price       DOUBLE PRECISION,
    ingredients JSONB,
    description VARCHAR(500),
    image       VARCHAR(200),
    stars       NUMERIC(3,2) DEFAULT 0,
    alt_id      TEXT,
    brand       TEXT,
    num_reviews INTEGER DEFAULT 0,
    limpiar     BOOLEAN DEFAULT FALSE,
    tratar      BOOLEAN DEFAULT FALSE,
    proteger    BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_alt_id ON public.products_scrape (alt_id);

CREATE TABLE public.users (
    user_id         TEXT PRIMARY KEY,
    name            TEXT,
    email           TEXT NOT NULL,
    age             INTEGER,
    nick_name       TEXT,
    skyn_type       TEXT,
    skyn_conditions TEXT,
    is_sensitive    VARCHAR(10),
    password        TEXT NOT NULL,
    CONSTRAINT unique_email UNIQUE (email)
);

CREATE SEQUENCE IF NOT EXISTS routines_routine_id_seq;

CREATE TABLE public.routines (
    routine_id  INTEGER PRIMARY KEY DEFAULT nextval('routines_routine_id_seq'),
    user_id     VARCHAR NOT NULL,
    name        VARCHAR(100),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    product_ids UUID[],
    usage       TEXT,
    CONSTRAINT routines_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES public.users(user_id) ON DELETE CASCADE
);

CREATE SEQUENCE IF NOT EXISTS feedbacks_feedback_id_seq;

CREATE TABLE public.feedbacks (
    feedback_id   INTEGER PRIMARY KEY DEFAULT nextval('feedbacks_feedback_id_seq'),
    user_id       VARCHAR NOT NULL,
    message       TEXT NOT NULL,
    created_at    TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    status        VARCHAR(20) DEFAULT 'pending',
    feedback_type VARCHAR(30),
    rating        SMALLINT,
    routine_id    INTEGER NOT NULL,
    CONSTRAINT feedbacks_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES public.users(user_id) ON DELETE CASCADE,
    CONSTRAINT feedbacks_routine_id_fkey
    FOREIGN KEY (routine_id) REFERENCES routines(routine_id)
    ON DELETE CASCADE
);

CREATE TABLE public.product_reviews (
    review_id   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id  UUID NOT NULL,
    user_id     TEXT NOT NULL,
    stars       SMALLINT NOT NULL CHECK (stars >= 1 AND stars <= 5),
    review      TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT product_reviews_product_id_fkey
    FOREIGN KEY (product_id) REFERENCES products_scrape(product_id)
    ON DELETE CASCADE,
    CONSTRAINT product_reviews_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON DELETE CASCADE
);

CREATE OR REPLACE FUNCTION update_product_review_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE products_scrape
    SET 
        num_reviews = num_reviews + 1,
        stars = (
            (stars * num_reviews + NEW.stars)::NUMERIC / (num_reviews + 1)
        )
    WHERE product_id = NEW.product_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_review_stats
AFTER INSERT ON product_reviews
FOR EACH ROW
EXECUTE FUNCTION update_product_review_stats();