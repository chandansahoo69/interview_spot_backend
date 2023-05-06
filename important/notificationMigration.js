// require("dotenv").config({ path: "./.env" });
// const express = require("express");
// const { MongoClient, ObjectId } = require("mongodb");
// const cors = require("cors");
import express from "express";
import cors from "cors";
import { MongoClient, ObjectId } from "mongodb";

const app = express();

app.use(cors());
app.use(express.json({ limit: "30mb" }));

const url =
  "mongodb+srv://analyticlabs:analyticlabs@cluster0.dlaz0sh.mongodb.net/monnit?retryWrites=true&w=majority";
const client = new MongoClient(url);
const dbName = "monnit";

(async function () {
  try {
    await client.connect();
    console.log("Connected successfully to DB");
    const notifications = await client
      .db(dbName)
      .collection("notifications")
      .find({})
      .toArray();

    const updateDB = async (id, value) => {
      await client
        .db(dbName)
        .collection("notifications")
        .updateOne({ _id: id }, { $set: { category: value } });
    };

    // notifications.forEach(async (data) => {
    //   if (data.message.includes("New leave application")) {
    //     console.log(`leave apply  ${data._id}`);
    //     await updateDB(data._id, "leave_applied");
    //   } else if (data.message.includes("has been Approved")) {
    //     console.log(`Leave approved: ${data._id}`);
    //     await updateDB(data._id, "leave_approved");
    //   } else if (data.message.includes("Welcome to the company")) {
    //     console.log(`welcome: ${data._id}`);
    //     await updateDB(data._id, "greeting");
    //   } else {
    //     await updateDB(data._id, "others");
    //   }
    // });

    for (let index in notifications) {
      console.log(notifications[index]);
      if (notifications[index].message.includes("New leave application")) {
        console.log(`leave apply  ${notifications[index]._id}`);
        await updateDB(notifications[index]._id, "leave_applied");
      } else if (notifications[index].message.includes("has been Approved")) {
        console.log(`Leave approved: ${notifications[index]._id}`);
        await updateDB(notifications[index]._id, "leave_approved");
      } else if (
        notifications[index].message.includes("Welcome to the company")
      ) {
        console.log(`welcome: ${notifications[index]._id}`);
        await updateDB(notifications[index]._id, "greeting");
      } else {
        await updateDB(notifications[index]._id, "others");
      }
    }

    console.log("Done!! ");
  } catch (err) {
    console.log(err);
  }
  process.exit(0);
})();
