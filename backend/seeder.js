const mongoose = require('mongoose');
const dotenv = require('dotenv');
const users = require('./data/users');
const products = require('./data/products');
const User = require('./models/userModel');
const Product = require('./models/productModel');
const Order = require('./models/orderModel');
const {connectDB} = require('./config/db');
const path = require('path');
const fs = require('fs');
// Add missing model imports
const Review = require('./models/reviewModel');
// If you don't have a Category model yet, we'll handle that in the export function

dotenv.config();

connectDB();

const importData = async () => {
  try {
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    const createdUsers = await User.insertMany(users);

    const adminUser = createdUsers[0]._id;

    const sampleProducts = products.map((product) => {
      return { ...product, user: adminUser };
    });

    await Product.insertMany(sampleProducts);

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    console.log('Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};


/**
 * Export current database data to JSON files
 */
const exportData = async () => {
  try {
    console.log('Starting data export...');
    
    const exportedUsers = await User.find({}).lean();
    const exportedProducts = await Product.find({}).lean();
    const exportedOrders = await Order.find({}).lean();
    const exportedReviews = await Review.find({}).lean();
    
    // Handle Category model if it exists
    let exportedCategories = [];
    try {
      // Try to dynamically import the Category model if it exists
      const Category = mongoose.models.Category || 
                       (mongoose.modelNames().includes('Category') ? 
                        mongoose.model('Category') : null);
      
      if (Category) {
        exportedCategories = await Category.find({}).lean();
      } else {
        console.log('Category model not found, skipping category export');
      }
    } catch (err) {
      console.log('Category model not available, skipping category export');
    }
    
    const exportDir = path.join(__dirname, 'data', 'exports');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const exportPath = path.join(exportDir, `export-${timestamp}`);
    fs.mkdirSync(exportPath, { recursive: true });
    
    fs.writeFileSync(path.join(exportPath, 'users.json'), JSON.stringify(exportedUsers, null, 2));
    fs.writeFileSync(path.join(exportPath, 'products.json'), JSON.stringify(exportedProducts, null, 2));
    fs.writeFileSync(path.join(exportPath, 'orders.json'), JSON.stringify(exportedOrders, null, 2));
    fs.writeFileSync(path.join(exportPath, 'reviews.json'), JSON.stringify(exportedReviews, null, 2));
    
    // Only write categories if we have them
    if (exportedCategories.length > 0) {
      fs.writeFileSync(path.join(exportPath, 'categories.json'), JSON.stringify(exportedCategories, null, 2));
    }
    
    console.log(`Data exported successfully to ${exportPath}`);
    process.exit();
  } catch (error) {
    console.error(`Data export failed: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
};

// Update the command line argument handling
if (process.argv[2] === '-d') {
  destroyData();
} else if (process.argv[2] === '-e') {
  exportData();
} else {
  importData();
}