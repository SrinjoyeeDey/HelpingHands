const express=require("express");
const mongoose=require("mongoose");
const path=require("path");
const methodOverride=require("method-override");
const User=require("./models/username");
const Donation=require("./models/donation");
const volunteer=require("./models/Volunteer");
const Inventory=require("./models/Inventory");
const bcrypt=require("bcrypt");


const app=express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(express.json());


main().then(()=>{
    console.log("connection successful");
})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/ngodb');

}

app.get("/",(req,res)=>{
  res.send("Ngo project running successfully");
});


app.get("/register",(req,res)=>{
  res.render("register.ejs");
});

app.post("/register", async(req,res)=>{
  try{
    const {name, email, password, role}=req.body;
    const newUser=new User({
      name,
      email,
      password,
      role
    });
    const savedUser= await newUser.save();
    console.log("User registered", savedUser);
    res.send(`<h2 style="text-align-center; color:green; font-family:sans-serif; margin-top:40px">
      Registration Successful</h2>`);
  }
  catch(err){
    console.log("Registration error: ",err);
    if(err.code===11000){
      res.send(`<h2 style="text-align-center; color:red;">
      Email already registered</h2>`)
    }
    else{
      res.status(500).send("Something went wrong.");
    }
  }
});

app.get("/volunteer",(req,res)=>{
  res.render("volunteer.ejs");
});

app.post("/volunteer", async (req,res)=>{
  try{
    const {name, email, phone, team, location, pastEvents, skills}=req.body;
    const newVolunteer=new volunteer({
      name, email, phone, team, location, pastEvents, skills
    });
    const savedVolunteer=await newVolunteer.save();
    console.log("Volunteer registered", savedVolunteer);
    // res.send(`<h2 style="text-align-center; color:green; font-family:sans-serif; margin-top:40px">
    //   Registration Successful</h2>`);

     res.redirect("/admin/go?success=1");

  }catch(err){
    console.log("Error registering volunteer: ",err);
    if(err.code===11000){
      res.send(`<h2 style="text-align-center; color:red;">
      Something went wrong!!</h2>`)
    }
    else{
      res.status(500).send("Something went wrong.");
    }

  }
});

app.get("/inventory",(req,res)=>{
  res.render("inventory.ejs");
});

app.post("/inventory", async (req,res)=>{
  try{
    const {item, quantity, status, donationRef}=req.body;

    const newInventory=new Inventory({
      item, quantity, status, donationRef:donationRef || null,
    });
    const savedItem=await newInventory.save();
    console.log("Inventory Item Saved: ",savedItem);
    // res.send(`<h2 style="text-align-center; color:#d39e00; font-family:sans-serif; margin-top:40px">
    // Inventory Entry Successful </h2>`);

    res.redirect("/admin/go?success=1");
}
catch(err){
    console.log("Error registering volunteer: ",err);
    if(err.code===11000){
      res.send(`<h2 style="text-align-center; color:red;">
      Something went wrong!!</h2>`)
    }
    else{
      res.status(500).send("Something went wrong.");
    }

  }
});

app.get("/donation",(req,res)=>{
  res.render("donation.ejs");
});

app.post("/donation", async (req,res)=>{
  try{
    const {donor, itemDonated, otherItem, quantity, date, notes}=req.body;

    if(itemDonated=="other" && otherItem && otherItem.trim()!==""){
      itemDonated=otherItem.trim();
    }
    const newDonation=new Donation({
      donor, itemDonated, otherItem, quantity, date, notes
    });

    const savedDonation=await newDonation.save();
    console.log("Inventory Item Saved: ",savedDonation);
    // res.send(`<h2 style="text-align-center; color:green; font-family:sans-serif; margin-top:40px">
    // Donation recorded Successfully </h2>`);
    res.redirect("/admin/go?success=1");
}
catch(err){
    console.log("Error saving donation: ",err);
    if(err.code===11000){
      res.send(`<h2 style="text-align-center; color:red;">
      Something went wrong!!</h2>`)
    }
    else{
      res.status(500).send("Something went wrong.");
    }

  }
});

app.get("/admin",(req,res)=>{
  res.render("admin.ejs");
});

app.get("/admin/go",async (req,res)=>{
    try{
      const userCount=await User.countDocuments();
      const donationCount=await Donation.countDocuments();
      const inventoryCount=await Inventory.countDocuments();
      const volunteerCount=await volunteer.countDocuments();

      res.render("admin-go",{
        userCount,
        donationCount,
        inventoryCount,
        volunteerCount
      });

    }
    catch(err){
      res.status(500).send("Error loading dashboard");
    }
});



app.get("/admin/volunteers",async (req,res)=>{
  try{
    const volunteers=await volunteer.find({});
    res.render("admin-volunteers", {volunteers});
  }catch{
    res.status(500).send("server Error");
  }
  
});

app.get("/admin/users",async (req,res)=>{
  const users=await User.find();
  res.render("admin-users", {users});
});

app.get("/admin/analytics",async (req,res)=>{
  res.render("admin-analytics");
});

app.get("/admin/donations", async (req,res)=>{
  try{
    const donations=await Donation.find().populate("donor");
    res.render("admin-donations",{donations});
  }
  catch(err){
    console.log("Error fetching donations: ",err);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/admin/inventory", async (req,res)=>{
  try{
    const inventories=await Inventory.find({}).populate("addedBy");
    res.render("admin-inventory",{inventories});
  }
  catch(err){
    console.log("Error fetching donations: ",err);
    res.status(500).send("Internal Server Error");
  }
});

app.delete("/inventory/:id", async(req,res)=>{
  try{
    const {id} =req.params;
    await Inventory.findByIdAndDelete(id);
    res.redirect("/admin/inventory");
  }
  catch(err){
    console.log("Error fetching donations: ",err);
    res.status(500).send("Internal Server Error");
  }
});

app.delete("/donation/:id", async(req,res)=>{
  try{
    const {id} =req.params;
    await Donation.findByIdAndDelete(id);
    res.redirect("/admin/donations");
  }
  catch(err){
    console.log("Error deleting donations: ",err);
    res.status(500).send("Internal Server Error");
  }
});


app.get("/donation/:id/edit", async(req,res)=>{
  try{
    const {id} =req.params;
    const donation=await Donation.findById(id);
    if(!donation){
      return res.status(404).send("Donation not found");
    }
    res.render("edit-donation",{donation});
  }
  catch(err){
    console.log("Error updating donations: ",err);
    res.status(500).send("Internal Server Error");
  }
});

app.put("/donation/:id", async (req,res)=>{
  try{
    const {id} =req.params;
    const {donor, itemDonated, quantity, date, notes}=req.body;

    await Donation.findByIdAndUpdate(id, {
      donor, itemDonated, quantity, date, notes
    });
    res.redirect("/admin/donations");
  }catch (err){
    console.log("Error updating donations: ",err);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/volunteer/:id/edit", async(req,res)=>{
  try{
    const {id} =req.params;
    await volunteer.findById(id);
    // if(!volunteer){
    //   return res.status(404).send("Volunteer not found");
    // }
    res.render("edit-volunteer",{volunteer});
  }
  catch(err){
    console.log("Error updating volunteers: ",err);
    res.status(500).send("Internal Server Error");
  }
});

app.put("/volunteer/:id", async (req,res)=>{
  try{
    const {id} =req.params;
    const {name, email, phone, location, teamName, available, pastEvents}=req.body;

    await Donation.findByIdAndUpdate(id, {
      name, email, phone, location, teamName, available, pastEvents,
      available:available==="on"? true:false,
    });
    res.redirect("/admin/volunteers");
  }catch (err){
    console.log("Error updating volunteers: ",err);
    res.status(500).send("Internal Server Error");
  }
});

app.delete("/volunteer/:id", async(req,res)=>{
  try{
    const {id} =req.params;
    await volunteer.findByIdAndDelete(id);
    res.redirect("/admin/volunteers");
  }
  catch(err){
    console.log("Error deleting volunteers: ",err);
    res.status(500).send("Internal Server Error");
  }
});


app.get("/signup" ,(req,res)=>{
  res.render("signup");
});

app.post("/signup", async (req,res)=>{
  try{
    const {name, email, password, role}=req.body;

    const existingUser=await User.findOne({email});
    if(existingUser){
      return res.send(`<h3 style="color:red;">Email already registered. </h3>`);
    }
    const hashedPassword=await bcrypt.hash(password,8);

    const newUser= new User({
      name,
      email,
      password:hashedPassword,
      role:role ||"user",
    });
    const savedUsers=await newUser.save();

    res.redirect("/admin");
  }
  catch(err){
    console.log("Error during signUp:",err);
    res.status(500).send("Internal server Error");
  }
});

app.get("/admin/users", async (req,res)=>{
  const users=await User.find();
  res.render("admin-users", {users});
});

app.delete("/admin/users/:id", async (req,res)=>{
  try{
    const {id} =req.params;
    await User.findByIdAndDelete(id);
    res.redirect("/admin/users");
  }
  catch(err){
    console.log("Error deleting user: ",err);
    res.status(500).send("Internal server Error");
  }
})

app.listen(8080, ()=>{
    console.log('server is listening to port 8080');
});
