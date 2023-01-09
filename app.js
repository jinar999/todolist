//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];
const mongoose = require("mongoose")
mongoose.connect("mongodb+srv://admin_jinar:jinar123@cluster0.pkjlfqr.mongodb.net/todolistDB")

const itemSchema = {
  name:String,
};
const Item = mongoose.model("Item", itemSchema);

const item1 = new  Item({
  name:"Welcome to do list"
});
const item2 = new Item ({
  name: "Hit + button to Add new task"
});
const item3 = new Item({
  name: "<--Click this to delete task"
});
const defaultItems =[item1,item2,item3];
//
// Item.updateOne({_id:"62d9b5afddbd464c3d34d75c"},{name:"Hit X to delete task"},function (err) {
//   if(err){
//     console.log(err);
//   }else {
//     console.log("Updated successfully");
//   }
// });

// Item.deleteOne({_id:"62d9c6e04dc1c8524b656827"},function(err){
//   if (err) {
//     console.log(err);
//   }else {
//     console.log("deleted");
//   }
// })
const listSchema={
  name:String,
  items: [itemSchema]
};
const List= mongoose.model("List", listSchema);

app.get("/", function(req, res) {

// const day = date.getDate();
Item.find({},function (err, foundItems) {
  // console.log(foundItems);
  if (foundItems.length === 0) {
    Item.insertMany(defaultItems, function(err){
     if (err){
       console.log(err);
     }else {
       console.log("Successfully added default Items  in Db");
     }
   }); res.redirect("/");
 }else {
   res.render("list", {listTitle: "Today", newListItems: foundItems});
   }
 })
});


app.post("/delete", function(req,res) {
  // console.log(req.body.checkbox);
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  if (listName==="Today") {
    Item.findByIdAndRemove(checkedItemId,function (err) {
      if (err) {
        console.log(err);
      }else {
        console.log("Successfully deleted checked item");
        res.redirect("/")

      }
    });
  } else {
    List.findOneAndUpdate({name:listName}, {$pull:{items: {_id:checkedItemId}}},function (err, foundList) {
      if (!err) {
        res.redirect("/"+listName);
      }
    })
  }

})
app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName= req.body.list;
  const item = new Item({
    name:itemName
  });
  if (listName==="Today") {
    item.save();
    res.redirect("/")
  }else {
    List.findOne({name:listName}, function (err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);

    });
  }

  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});

app.get("/:customListName",function (req, res) {

  const customListName=_.capitalize(req.params.customListName);
  List.findOne({name:customListName}, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        // console.log("Doesn't Exist");
        // Create a new list
        const list = new List({
          name:customListName,
          items: defaultItems,
        });
        list.save();
        res.redirect("/" + customListName);
        // setTimeout(() => { res.redirect('/' + customListName);}, 2000);
      }else {
        // console.log("Exists!");
        // Show the existing list
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});

      }
    }
  })

})

app.get("/about", function(req, res){
  res.render("about");
});
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server is up and running");
});
