const express = require('express');
const bodyParser = require('body-parser');
const date = require(__dirname+'/date.js')
const mongoose = require("mongoose");
const alert = require("alert");
const prompt = require("prompt");
const readline = require('readline-sync');
const _ = require("lodash");

mongoose.set('useUnifiedTopology', true);
mongoose.set('useNewUrlParser', true);
mongoose.connect("mongodb+srv://Admin-lekha:test123@cluster0.xzexg.mongodb.net/todolistDB");

var day = date.getDate();

const itemsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please check the data as no name is entered"],
  },
  check: String
});

const listSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please check the data as no name is entered"],
  },
  items: [itemsSchema]
});

const Item = mongoose.model("Item", itemsSchema);
const List = mongoose.model("List", listSchema);

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

//var items = ["Complete Dev course","Do office work","Update resume and Apply"];

const item1 = new Item({
  name: "Welcome to your To-Do List!",
  check: ""
});
const item2 = new Item({
  name: "Hit the + button to add a new item.",
  check: ""
});
const item3 = new Item({
  name: "<-- Hit this to delete an item.",
  check: ""
});
const defaultItems = [item1, item2, item3];



app.get("/", function(req,res){


  Item.find({},function(err, foundItems){
    if(err){
      console.log("error while finding Items");
      console.log(err);
    }else{
      if(foundItems.length === 0){
        Item.insertMany([item1, item2, item3], function(err){});
        res.redirect("/");
      }else{
          //mongoose.connection.close();
          res.render("list",{
            //listTitle: day,
            listTitle: "Today",
            itemToAdd: foundItems //just to initialize, we are redirecting this variable in post
          });
      }
    }
  })
})


app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name: customListName},function(err,foundLists){
    if(!err){
      if(!foundLists){
        const list = new List({
          name: customListName,
          items: defaultItems
        })
        list.save();
      }
      else{
        res.render("list",{
          listTitle: foundLists.name,
          itemToAdd: foundLists.items
        });
      }

    }
  })

})

app.post("/",function(req,res){
  let item = req.body.newItem;
  let listName = req.body.list;
  const newitem = new Item({
    name: item,
    check: ""
  });
  if(listName === "Today"){
    newitem.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName},function(error,foundList){
      foundList.items.push(newitem);
      foundList.save();
      res.redirect("/"+listName);
    })
  }

})

app.post("/delete",function(req,res){
  //let customListName = req.body.listName;
  if(req.body.listName === "Today"){
    Item.find({_id: req.body.checkVal},function(err, fitem){
    if(req.body.checkVal === req.body.delVal){
      let decision = readline.question("Please enter 'Y' to delete this item!!!!");
      console.log('decision: ' + decision);
      if(decision === 'Y'){
        Item.deleteOne({_id: req.body.delVal},function(err, items){});
      }

    }else{
      fitem.forEach(function(i){
        if(i.check === ""){
          Item.updateOne({_id: req.body.checkVal}, {check: "checked"},function(err, items){})
        }
        else if(i.check === "checked"){
          Item.updateOne({_id: req.body.checkVal}, {check: ""},function(err, items){})
        }
      })
      }
    })
    res.redirect("/");
  }else{
    //console.log(req.body);
    List.findOneAndUpdate(
      {name: req.body.listName},
      //{$set: {"items.$[element].check": "check"}},
      //{arrayFilters: {"items._id": req.body.checkVal}}
      {$pull: {items: {_id: req.body.checkVal}}},function(err, items){
        if(!err){
          res.redirect("/"+req.body.listName);
        }
      }
    )
  }

})

let port = process.env.PORT;
if(port == null || port == ""){
  port = 3000;
}

app.listen(port, function(){
  console.log("Server started on port successfully");
})

// var currentDay = today.getDay();
// var day = ""
// day = days[currentDay];

// if(currentDay===0 || currentDay===6){
//   day = days[currentDay];
// }else{
//   day = days[currentDay];
// }


// let totalitemsinList = foundLists.items.length;
// console.log(totalitemsinList);
//     const newitem = new Item({
//       _id: totalitems+1,
//       name: item,
//       check: ""
//     });
//     newitem.save();
//     res.redirect("/");
