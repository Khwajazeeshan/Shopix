import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import { faker } from "@faker-js/faker";
import dotenv from "dotenv";
import path from "path";

// ✅ Correct path resolution
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

// Import models using alias
import User from "../src/models/user";
import Store from "../src/models/store";
import Product from "../src/models/product";
import Review from "../src/models/review";
import Order from "../src/models/order";
import Message from "../src/models/message";
import Conversation from "../src/models/conversation";
import Wishlist from "../src/models/wishlist";
import Cart from "../src/models/cart";

const NUM_SELLERS = 10;
const PRODUCTS_PER_STORE = 3;
const NUM_CUSTOMERS = 15;
const SEED_PASSWORD = "password123"; // Fixed password for testing
// Images logic will rely on dynamically generated categories below

const storeLogos = [
  "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=200", // shop
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200", // store
  "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=200", // shopping
  "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=200", // boutique
  "https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=200", // market
  "https://images.unsplash.com/photo-1580857626078-289a0276981a?w=200", // logo1
  "https://images.unsplash.com/photo-1621072156002-e2fccdc0b176?w=200", // logo2
  "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200", // brand
  "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=200", // store2
  "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=200", // shop2
];

function getProductImage(category: string): string {
  const imageMap: Record<string, string[]> = {
    Electronics: [
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400", // phone
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400", // laptop
      "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400", // headphones
      "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400", // laptop2
      "https://images.unsplash.com/photo-1544866092-1935c5ef2a8f?w=400", // smartwatch
    ],
    Clothing: [
      "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400", // clothes
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400", // shoes
      "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400", // tshirt
      "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=400", // hoodie
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400", // sneakers
    ],
    Food: [
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400", // salad
      "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400", // pancakes
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400", // pizza
      "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400", // food
      "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400", // breakfast
    ],
    Books: [
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400", // books
      "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400", // book2
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400", // book3
      "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400", // books2
      "https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=400", // reading
    ],
    General: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400", // watch
      "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400", // camera
      "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400", // perfume
      "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400", // shoes2
      "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400", // product
    ],
  };

  const images = imageMap[category] || imageMap["General"];
  return faker.helpers.arrayElement(images);
}

const reviewCommentsList = [
  "Very good product!", "Highly recommended.", "Worth the price.",
  "Good quality.", "Fast delivery, happy!", "Not bad overall.",
  "Excellent product!", "Will buy again.", "Satisfied with purchase.",
  "Great value for money.", "Product as described.",
  "Better than expected!", "Average quality.",
  "Good but pricey.", "Loved it!"
];

async function seedDatabase() {
  try {
    const mongoUri = process.env.MONGODB_URL || process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error("MONGODB_URL is not defined in the environment variables (.env.local or .env)");
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("Connected successfully!");

    console.log("Clearing existing data...");
    await User.deleteMany({ role: "seller" });
    await User.deleteMany({ role: "customer" });
    await Store.deleteMany({});
    await Product.deleteMany({});
    await Review.deleteMany({});
    console.log("Cleared all existing sellers, customers, stores, products, and reviews.");

    const hashedPassword = await bcryptjs.hash(SEED_PASSWORD, 10);

    const categories = ["Electronics", "Clothing", "Food", "Books", "General"];
    const storeTypes = ["Individual", "Company"] as const;

    // Create Customers
    console.log(`Seeding ${NUM_CUSTOMERS} customers...`);
    const customersToInsert = [];
    for (let c = 0; c < NUM_CUSTOMERS; c++) {
      customersToInsert.push({
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: hashedPassword,
        isVerified: true,
        role: "customer"
      });
    }
    const fakeCustomers = await User.insertMany(customersToInsert);

    console.log(`Seeding ${NUM_SELLERS} sellers and stores...`);
    let totalProductsCreated = 0;
    let totalReviewsCreated = 0;

    for (let i = 0; i < NUM_SELLERS; i++) {
      // 1. Create fake seller
      const seller = new User({
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: hashedPassword,
        isVerified: true,
        role: "seller",
      });
      await seller.save();

      // 2. Create store for the seller
      let storeName = faker.company.name();
      // Ensure name is at least 4 characters
      if (storeName.length < 4) {
        storeName += " Store";
      }
      const store = new Store({
        sellerId: seller._id,
        name: storeName,
        description: faker.lorem.paragraph(),
        type: faker.helpers.arrayElement(storeTypes),
        logo: faker.helpers.arrayElement(storeLogos),
        status: "approved",
      });
      await store.save();

      // 3. Create products for the store
      const productsToInsert = [];
      for (let j = 0; j < PRODUCTS_PER_STORE; j++) {
        let desc = faker.commerce.productDescription();
        // Strict 25 characters maximum for description
        desc = desc.length > 25 ? desc.substring(0, 25) : desc;

        const productCategory = faker.helpers.arrayElement(categories);

        productsToInsert.push({
          storeId: store._id,
          sellerId: seller._id,
          name: faker.commerce.productName(),
          description: desc,
          price: faker.number.int({ min: 100, max: 10000 }),
          quantity: faker.number.int({ min: 1, max: 100 }),
          image: getProductImage(productCategory),
          category: productCategory,
          rating: faker.number.float({ min: 1, max: 5, fractionDigits: 1 }),
          sold: faker.number.int({ min: 0, max: 500 }),
        });
      }

      const insertedProducts = await Product.insertMany(productsToInsert);
      totalProductsCreated += insertedProducts.length;

      // 4. Create Random Reviews per Product
      for (const product of insertedProducts) {
        const reviewCount = faker.number.int({ min: 2, max: 30 });
        const shuffledCustomers = faker.helpers.shuffle(fakeCustomers).slice(0, reviewCount);

        const reviewsToInsert = shuffledCustomers.map((customer) => ({
          productId: product._id,
          userId: customer._id,
          rating: faker.number.int({ min: 1, max: 5 }),
          comment: faker.helpers.arrayElement(reviewCommentsList)
        }));

        await Review.insertMany(reviewsToInsert);
        totalReviewsCreated += reviewsToInsert.length;
      }

      console.log(`Seeded seller ${i + 1}/${NUM_SELLERS} with Store and ${PRODUCTS_PER_STORE} products, and random reviews.`);
    }

    console.log("-----------------------------------------");
    console.log(`🔑 Login credentials for all new sellers/customers:`);
    console.log(`Password: ${SEED_PASSWORD}`);
    console.log("-----------------------------------------");

    try {
      // --- TASK 1: 50 FAKE CUSTOMERS ---
      await User.deleteMany({ role: "customer" });
      const fiftyCustomersData = [];
      for (let c = 0; c < 50; c++) {
        fiftyCustomersData.push({
          name: faker.person.fullName(),
          email: faker.internet.email(),
          password: hashedPassword,
          isVerified: true,
          role: "customer"
        });
      }
      const fiftyCustomers = await User.insertMany(fiftyCustomersData);
      console.log("✅ 50 customers created");

      // --- TASK 2: FAKE ORDERS ---
      await Order.deleteMany({});
      const allProducts = await Product.find({});
      const ordersToInsert = [];
      for (const customer of fiftyCustomers) {
        const numOrders = faker.number.int({ min: 2, max: 7 });
        for (let i = 0; i < numOrders; i++) {
          const productsCount = faker.number.int({ min: 1, max: 4 });
          const shuffledProducts = faker.helpers.shuffle(allProducts).slice(0, productsCount);
          for (const product of shuffledProducts) {
            const qty = faker.number.int({ min: 1, max: 3 });
            ordersToInsert.push({
              userId: customer._id,
              storeId: product.storeId,
              productId: product._id,
              receiverName: faker.person.fullName(),
              mobileNumber: faker.phone.number(),
              billingAddress: `${faker.location.streetAddress()}, ${faker.location.city()}, ${faker.location.state()}, ${faker.location.zipCode()}, ${faker.location.country()}`,
              quantity: qty,
              paymentMethod: faker.helpers.arrayElement(["cod", "online"]),
              totalAmount: product.price * qty,
              status: faker.helpers.arrayElement(["new", "progress", "completed"]),
              paymentStatus: faker.helpers.arrayElement(["Pending", "Paid", "Failed"]),
            });
          }
        }
      }
      const insertedOrders = await Order.insertMany(ordersToInsert);
      console.log("✅ Orders created for all 50 customers");

      // --- TASK 3: FAKE MESSAGES ---
      await Conversation.deleteMany({});
      await Message.deleteMany({});
      const allSellers = await User.find({ role: "seller" });
      const conversationsToInsert = [];
      const messagesToInsert = [];
      for (const customer of fiftyCustomers) {
        const numConversations = faker.number.int({ min: 1, max: 5 });
        const shuffledSellers = faker.helpers.shuffle(allSellers).slice(0, numConversations);
        for (const seller of shuffledSellers) {
          const randomProduct = faker.helpers.arrayElement(allProducts);
          const convId = new mongoose.Types.ObjectId();
          const numMsgs = faker.number.int({ min: 3, max: 8 });
          let lastMsgText = "";
          for (let m = 0; m < numMsgs; m++) {
            const isCustomer = m % 2 === 0;
            const senderId = isCustomer ? customer._id : seller._id;
            const senderRole = isCustomer ? "customer" : "seller";
            const msgText = faker.lorem.sentence();
            lastMsgText = msgText;
            messagesToInsert.push({
              conversationId: convId,
              senderId: senderId,
              senderRole: senderRole,
              message: msgText,
              isRead: faker.datatype.boolean(),
              createdAt: faker.date.recent({ days: 30 })
            });
          }
          conversationsToInsert.push({
            _id: convId,
            customerId: customer._id,
            sellerId: seller._id,
            productId: randomProduct._id,
            lastMessage: lastMsgText
          });
        }
      }
      await Conversation.insertMany(conversationsToInsert);
      const insertedMessages = await Message.insertMany(messagesToInsert);
      console.log("✅ Messages created between customers and sellers");

      // --- TASK 4: WISHLIST ---
      await Wishlist.deleteMany({});
      const wishlistsToInsert = [];
      for (const customer of fiftyCustomers) {
        const wishProductCount = faker.number.int({ min: 3, max: 15 });
        const shuffledProducts = faker.helpers.shuffle(allProducts).slice(0, wishProductCount);
        for (const prod of shuffledProducts) {
          wishlistsToInsert.push({
            userId: customer._id,
            productId: prod._id
          });
        }
      }
      await Wishlist.insertMany(wishlistsToInsert);
      console.log("✅ Wishlists created for all 50 customers");

      // --- TASK 5: CART ---
      await Cart.deleteMany({});
      const cartsToInsert = [];
      for (const customer of fiftyCustomers) {
        const cartProductCount = faker.number.int({ min: 1, max: 6 });
        const shuffledProducts = faker.helpers.shuffle(allProducts).slice(0, cartProductCount);
        for (const prod of shuffledProducts) {
          cartsToInsert.push({
            userId: customer._id,
            productId: prod._id
          });
        }
      }
      await Cart.insertMany(cartsToInsert);
      console.log("✅ Carts created for all 50 customers");

      console.log("-----------------------------------------");
      console.log("👥 New Customers Created: 50");
      console.log(`📦 Total Orders Created: ${insertedOrders.length}`);
      console.log(`💬 Total Messages Created: ${insertedMessages.length}`);
      console.log("❤️  Total Wishlists Created: 50");
      console.log("🛒 Total Carts Created: 50");
      console.log("-----------------------------------------");

    } catch (newSeedError) {
      console.error("❌ Error running the new seeding code:", newSeedError);
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();