CREATE DATABASE IF NOT EXISTS vinken_company
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE vinken_company;

-- =========================
-- USERS / ADMINISTRATORS
-- =========================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'staff') DEFAULT 'staff',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- PRODUCT CATEGORIES
-- =========================
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- PRODUCTS
-- =========================
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    specifications TEXT,
    image VARCHAR(255),
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

-- =========================
-- SERVICES
-- =========================
CREATE TABLE services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    image VARCHAR(255),
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- CUSTOMERS
-- =========================
CREATE TABLE customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    organization_name VARCHAR(200),
    contact_person VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- GENERAL INQUIRIES
-- =========================
CREATE TABLE inquiries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(50),
    subject VARCHAR(255),
    message TEXT NOT NULL,
    status ENUM('new', 'read', 'replied', 'closed') DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- QUOTATION REQUESTS
-- =========================
CREATE TABLE quotation_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT,
    product_service VARCHAR(255) NOT NULL,
    quantity VARCHAR(100),
    delivery_location VARCHAR(255),
    tender_reference VARCHAR(150),
    requirement_type VARCHAR(100),
    deadline DATE,
    additional_requirements TEXT,
    status ENUM(
        'pending',
        'reviewing',
        'quoted',
        'approved',
        'rejected',
        'completed'
    ) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (customer_id)
        REFERENCES customers(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

-- =========================
-- TENDER REQUESTS
-- =========================
CREATE TABLE tender_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT,
    tender_reference VARCHAR(150),
    tender_title VARCHAR(255) NOT NULL,
    description TEXT,
    submission_deadline DATE,
    delivery_location VARCHAR(255),
    status ENUM(
        'received',
        'under_review',
        'sourcing',
        'submitted',
        'awarded',
        'completed',
        'unsuccessful'
    ) DEFAULT 'received',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (customer_id)
        REFERENCES customers(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

-- =========================
-- TENDER DOCUMENTS
-- =========================
CREATE TABLE tender_documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tender_request_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (tender_request_id)
        REFERENCES tender_requests(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- =========================
-- SUPPLIERS
-- =========================
CREATE TABLE suppliers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(200) NOT NULL,
    contact_person VARCHAR(150),
    email VARCHAR(150),
    phone VARCHAR(50),
    address TEXT,
    products_services TEXT,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);