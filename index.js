import express from "express";
import bodyParser from "body-parser";
import mongoose, { mongo } from "mongoose";
import _ from "lodash";
import "dotenv/config";
// $(".addBtn").on("click", function () {
//     $("h4").after(newTaskValue());
// });

// Create DB Connection
// mongoose.connect('mongodb://127.0.0.1:27017/todoListDB');
mongoose.connect(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.gkv69kb.mongodb.net/todoListDB`);

// Create new Schema and Model (collection)
const itemSchema = new mongoose.Schema({
    name: String
});

const itemListSchema = new mongoose.Schema({
    category: String,
    task: [itemSchema]
});

const Task = mongoose.model("Task", itemListSchema);

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"))

let workTaskList = [];
app.get("/", async (req, res) => {
    const tasks = await Task.findOne({category:"Main"});
    if (!tasks) {
        const task = new Task({
            category: "Main",
            task: []
        });
        await task.save();
        res.redirect("/");
    } else {
        res.render("index.ejs", {
            taskList: tasks.task,
            category: "Main Tasks"
        });
    }
});

app.get("/:id", async(req, res) => {
    const category = _.capitalize(req.params.id);
    const tasks = await Task.findOne({category:category});
    if (!tasks) {
        const task = new Task({
            category: category,
            task:[]
        });
        await task.save();
        res.redirect(`/${category}`);
    } else {
        res.render("index.ejs", {
            taskList: tasks.task,
            category: category
        });
    }
}); 

app.post("/submit", async (req, res) => {
    let newTask = req.body.taskDetail;
    let category = req.body.category;
    category = category.split(" ");
    await Task.findOneAndUpdate({category: category[0]}, {
        $push:{task: {name: newTask}}
    });

    if (category[0] === "Main") {
        res.redirect("/");
    } else {
        res.redirect(`/${category}`);
    }
});

app.post("/delete", async (req, res) => {
    let taskID = req.body.taskId;
    let category = req.body.category
    await Task.findOneAndUpdate({category: category}, {
        $pull:{task: {_id: taskID}}
    });
    if (category === "Main") {
        res.redirect("/");
    } else {
        res.redirect(`/${category}`);
    }
});

app.listen(port, () => {
    console.log(`server running in port ${port}`);
});