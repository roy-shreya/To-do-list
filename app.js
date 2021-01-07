const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const date = require(__dirname + "/date.js");

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let day="";

mongoose.connect("mongodb://localhost/todolistdb", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const itemSchema = new mongoose.Schema({
  name: String,
});

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Welcome to do list",
});
const item2 = new Item({
  name: "Click on + button to item to the list",
});
const item3 = new Item({
  name: "<-- Click on this to delete an item",
});

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
});

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {
  //day = date.getDate();
  Item.find({}, function (err, foundItems) {
    if (foundItems.length === 0) {
        Item.insertMany([item1, item2, item3], function (err) {
        if (err) throw err;
        else console.log("Successfully added");
      });
    }
      res.render("list", { listItem: "Today", newListItem: foundItems });
  });
});

app.post("/", function(req, res) {
  const itemName = req.body.newList;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });
  
  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else  {
    List.findOne({name: listName}, function(err,docs){
      docs.items.push(item);
      docs.save();
      res.redirect("/"+listName);
    });
  }
});

app.get("/:categoryTypeList", function (req, res) {
  const requestedList = _.capitalize(req.params.categoryTypeList);

  List.findOne({name: requestedList},function(err,docs){
    if(!err){
      if (!docs){
        //Create a new list
        const list =  new List({
          name: requestedList,
          items: [item1,item2,item3]
        });
        list.save();
        res.redirect("/"+requestedList);
      }
      else{
        res.render("list", {listItem: docs.name, newListItem: docs.items}); 
      }         
    }
  }); 
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.post("/delete", function(req, res){
    const deleteItemId = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === "Today"){
      Item.findByIdAndRemove(deleteItemId, function(err, data) {
        if (!err) {
          console.log("Successfully deleted");
          res.redirect("/");
        }  
      });
    }
    else{
      List.findOneAndUpdate(
        {name: listName},
        {$pull: {items: {_id: deleteItemId}}},
        function(err, data){
          if(!err){
            res.redirect("/"+listName);
          }
      });
    }
    
});


app.listen(3000, function () {
  console.log("Server running on port 3000");
});
