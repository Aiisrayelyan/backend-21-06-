const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const PRODUCTS_FILE = 'products.json';
const ORDERS_FILE = 'orders.json';
const USERS_FILE = 'users.json';

let products = [];
let orders = [];

try {
    const productsData = fs.readFileSync(PRODUCTS_FILE);
    products = JSON.parse(productsData);
} catch (err) {
    if (err.code === 'ENOENT') {
        console.log('products.json file does not exist. Starting with an empty list.');
    } else {
        throw err;
    }
}

try {
    const ordersData = fs.readFileSync(ORDERS_FILE);
    orders = JSON.parse(ordersData);
} catch (err) {
    if (err.code === 'ENOENT') {
        console.log('orders.json file does not exist. Starting with an empty list.');
    } else {
        throw err;
    }
}

app.post('/products', (req, res) => {
    const { name, description, price } = req.body;
    if (!name || !description || !price) {
        return res.status(400).send('Name, description, and price are required');
    }

    const newProduct = {
        id: products.length + 1,
        name,
        description,
        price
    };

    products.push(newProduct);
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
    res.status(201).json(newProduct);
});

app.get('/products', (req, res) => {
    res.json(products);
});

app.get('/products/:id', (req, res) => {
    const product = products.find(p => p.id === parseInt(req.params.id));
    if (!product) return res.status(404).send('Product not found');
    res.json(product);
});

app.put('/products/:id', (req, res) => {
    const product = products.find(p => p.id === parseInt(req.params.id));
    if (!product) return res.status(404).send('Product not found');

    const { name, description, price } = req.body;
    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = price;

    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
    res.json(product);
});

app.delete('/products/:id', (req, res) => {
    const productIndex = products.findIndex(p => p.id === parseInt(req.params.id));
    if (productIndex === -1) return res.status(404).send('Product not found');

    products.splice(productIndex, 1);
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
    res.status(204).send();
});

app.post('/orders', (req, res) => {
    const { userId, items } = req.body;
    if (!userId || !items || !Array.isArray(items)) {
        return res.status(400).send('User ID and items are required');
    }

    const newOrder = {
        id: orders.length + 1,
        userId,
        items,
        status: 'pending'
    };

    orders.push(newOrder);
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
    res.status(201).json(newOrder);
});

app.get('/orders', (req, res) => {
    res.json(orders);
});

app.get('/orders/:id', (req, res) => {
    const order = orders.find(o => o.id === parseInt(req.params.id));
    if (!order) return res.status(404).send('Order not found');
    res.json(order);
});

app.put('/orders/:id', (req, res) => {
    const order = orders.find(o => o.id === parseInt(req.params.id));
    if (!order) return res.status(404).send('Order not found');

    const { items, status } = req.body;
    if (items) order.items = items;
    if (status) order.status = status;

    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
    res.json(order);
});

app.delete('/orders/:id', (req, res) => {
    const orderIndex = orders.findIndex(o => o.id === parseInt(req.params.id));
    if (orderIndex === -1) return res.status(404).send('Order not found');

    orders.splice(orderIndex, 1);
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
    res.status(204).send();
});

app.post('/orders/:id/items', (req, res) => {
    const order = orders.find(o => o.id === parseInt(req.params.id));
    if (!order) return res.status(404).send('Order not found');

    const { items } = req.body;
    if (!items || !Array.isArray(items)) {
        return res.status(400).send('Items are required');
    }

    order.items = order.items.concat(items);
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
    res.status(201).json(order);
});

app.get('/orders/:id/items', (req, res) => {
    const order = orders.find(o => o.id === parseInt(req.params.id));
    if (!order) return res.status(404).send('Order not found');
    res.json(order.items);
});

app.put('/orders/:id/status', (req, res) => {
    const order = orders.find(o => o.id === parseInt(req.params.id));
    if (!order) return res.status(404).send('Order not found');

    const { status } = req.body;
    if (!status) return res.status(400).send('Status is required');

    order.status = status;
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
    res.json(order);
});

app.get('/users/:userId/orders', (req, res) => {
    const userOrders = orders.filter(o => o.userId === parseInt(req.params.userId));
    res.json(userOrders);
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
