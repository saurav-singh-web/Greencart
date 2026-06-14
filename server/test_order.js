import mongoose from 'mongoose';
import Order from './models/Order.js';
import 'dotenv/config';

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    const orders = await Order.find({}).populate('items.product', 'name price').limit(1);
    if(orders.length > 0) {
        const o = orders[0];
        console.log('Order Items:', o.items);
        try {
            const itemsStr = o.items.map(item => `${item.quantity}x ${item.product?.name || 'Unknown'}`).join(', ');
            console.log('Items string:', itemsStr);
        } catch(e) {
            console.error('Error formatting items:', e);
        }
    } else {
        console.log('No orders found');
    }
    process.exit(0);
}).catch(console.error);
