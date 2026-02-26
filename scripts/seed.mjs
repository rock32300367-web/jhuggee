import mongoose from "mongoose";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, "../.env.local");
const envVars = readFileSync(envPath, "utf-8").split("\n")
  .filter(l => l && !l.startsWith("#"))
  .reduce((acc, l) => { const [k,...v] = l.split("="); if(k) acc[k.trim()] = v.join("=").trim(); return acc; }, {});

const MONGODB_URI = envVars.MONGODB_URI;
if (!MONGODB_URI) { console.error("MONGODB_URI not found in .env.local"); process.exit(1); }

const UserSchema    = new mongoose.Schema({ phone:{type:String,sparse:true}, name:String, email:{type:String,sparse:true}, role:{type:String,default:"buyer"}, isVerified:{type:Boolean,default:false}, authProvider:{type:String,default:"phone"} }, {timestamps:true});
const SellerSchema  = new mongoose.Schema({ userId:mongoose.Schema.Types.ObjectId, shopName:String, shopDescription:String, bankAccount:{accountNumber:String,ifsc:String,accountHolder:String}, address:{line1:String,city:String,state:String,pincode:String}, isApproved:{type:Boolean,default:false}, totalSales:{type:Number,default:0}, rating:{type:Number,default:0}, ratingCount:{type:Number,default:0} }, {timestamps:true});
const ProductSchema = new mongoose.Schema({ sellerId:mongoose.Schema.Types.ObjectId, name:String, description:String, category:String, images:[String], price:Number, mrp:Number, stock:Number, sizes:[String], colors:[String], tags:[String], rating:{type:Number,default:0}, ratingCount:{type:Number,default:0}, sold:{type:Number,default:0}, isActive:{type:Boolean,default:true}, freeDelivery:{type:Boolean,default:true}, deliveryDays:{type:Number,default:5} }, {timestamps:true});

async function seed() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("Connected!");

  const User    = mongoose.model("User",    UserSchema);
  const Seller  = mongoose.model("Seller",  SellerSchema);
  const Product = mongoose.model("Product", ProductSchema);

  let user = await User.findOne({ phone: "9999999999" });
  if (!user) {
    user = await User.create({ phone:"9999999999", name:"Rahul Sharma", email:"rahul@jhuggee.com", role:"seller", isVerified:true });
    console.log("Seller user created:", user._id.toString());
  } else { console.log("Seller user exists:", user._id.toString()); }

  // Make sure role is seller
  if (user.role !== "seller") { await User.findByIdAndUpdate(user._id, { role: "seller" }); }

  let seller = await Seller.findOne({ userId: user._id });
  if (!seller) {
    seller = await Seller.create({
      userId: user._id, shopName:"Rahul Fashion Store", isApproved:true,
      shopDescription:"Premium ethnic wear at best prices",
      bankAccount:{accountNumber:"1234567890",ifsc:"SBIN0001234",accountHolder:"Rahul Sharma"},
      address:{line1:"123 MG Road",city:"Mumbai",state:"Maharashtra",pincode:"400001"},
    });
    console.log("Seller profile created:", seller._id.toString());
  } else { console.log("Seller profile exists:", seller._id.toString()); }

  const count = await Product.countDocuments({ sellerId: seller._id });
  if (count >= 8) { console.log(count + " products already exist, skipping"); }
  else {
    const PRODS = [
      { name:"Floral Georgette Saree", category:"Sarees", description:"Khoobsoorat floral print georgette saree with embroidered blouse piece. Perfect for festive occasions.", price:399, mrp:1299, stock:50, images:["https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80","https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&q=80"], sizes:["S","M","L","XL","XXL"], colors:["Pink","Green","Blue"], tags:["saree","georgette","ethnic","festive"], rating:4.2, ratingCount:2841, freeDelivery:true },
      { name:"Men's Slim Fit Shirt", category:"Men's Wear", description:"Stylish slim fit casual shirt. Comfortable cotton fabric for daily wear.", price:279, mrp:899, stock:100, images:["https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80"], sizes:["S","M","L","XL","XXL"], colors:["White","Blue","Black"], tags:["shirt","men","casual","cotton"], rating:4.1, ratingCount:5612, freeDelivery:true },
      { name:"Anarkali Kurti with Palazzo", category:"Kurtis", description:"Beautiful anarkali kurti with matching palazzo pants. Ideal for casual and semi-formal occasions.", price:329, mrp:999, stock:75, images:["https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&q=80"], sizes:["S","M","L","XL"], colors:["Red","Blue","Green"], tags:["kurti","anarkali","ethnic","women"], rating:4.3, ratingCount:1923, freeDelivery:true },
      { name:"Sports Running Sneakers", category:"Footwear", description:"Lightweight and comfortable running sneakers with cushioned sole.", price:499, mrp:1799, stock:60, images:["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80"], sizes:["6","7","8","9","10","11"], colors:["White","Black","Blue"], tags:["shoes","sneakers","sports","running"], rating:4.0, ratingCount:3310, freeDelivery:true },
      { name:"Gold Plated Jhumka Earrings", category:"Jewellery", description:"Elegant gold plated jhumka earrings with intricate design.", price:149, mrp:599, stock:200, images:["https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80"], colors:["Gold","Silver"], tags:["earrings","jhumka","gold","jewellery"], rating:4.4, ratingCount:8820, freeDelivery:true },
      { name:"Printed Cotton Kurti", category:"Kurtis", description:"Comfortable everyday cotton kurti with beautiful prints. Machine washable.", price:249, mrp:799, stock:120, images:["https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80"], sizes:["XS","S","M","L","XL","XXL"], colors:["Yellow","Pink","Orange"], tags:["kurti","cotton","printed","casual"], rating:4.2, ratingCount:4211, freeDelivery:true },
      { name:"Non-Stick Cookware Set 5 Pcs", category:"Home & Kitchen", description:"Premium 5-piece non-stick cookware set. Includes kadhai, tawa, 2 pans. PFOA free.", price:799, mrp:2499, stock:30, images:["https://images.unsplash.com/photo-1585515320310-259814833e62?w=600&q=80"], tags:["cookware","kitchen","non-stick","utensils"], rating:4.1, ratingCount:2041, freeDelivery:true },
      { name:"Kids Graphic T-Shirt", category:"Kids", description:"Fun and colorful graphic t-shirt for kids. Soft cotton fabric.", price:199, mrp:499, stock:80, images:["https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600&q=80"], sizes:["2-3Y","4-5Y","6-7Y","8-9Y","10-11Y"], colors:["Blue","Red","Yellow"], tags:["kids","t-shirt","children"], rating:4.5, ratingCount:1100, freeDelivery:true },
    ];
    await Product.insertMany(PRODS.map(p => ({ ...p, sellerId: seller._id })));
    console.log("8 products added!");
  }

  console.log("\n========================================");
  console.log("SEED COMPLETE!");
  console.log("========================================");
  console.log("Seller Login: Phone = 9999999999");
  console.log("OTP: dev mode terminal pe dikhega");
  console.log("========================================\n");
  await mongoose.disconnect();
}

seed().catch(e => { console.error("Seed error:", e.message); process.exit(1); });
