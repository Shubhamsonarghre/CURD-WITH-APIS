const { faker } = require('@faker-js/faker');
const mysql = require('mysql2');
const express = require('express');
const app = express();
const path = require('path');
const methodOverrid = require('method-override');
const { v4: uuidv4 } = require('uuid');

app.use(express.json());
app.use(methodOverrid("_method"));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'delta_app',
    password: 'shubh@08'
});
    
let getRandomUser = () => {
    return [
        faker.string.uuid(),
        faker.internet.userName(),
        faker.internet.email(),
        faker.internet.password(),
    ];
};
//inserting new data
//let q = "insert into user(id,username,email,password) values ?";
// let user = ["123", "123_user", "user@gmail.com", "abc123"];
// let users = [["1232", "123_user2", "user2@gmail.com", "abc1232"],
// ["1233", "123_user3", "user3@gmail.com", "abc1233"]
// ];

// let data=[];

//     for(let i=1;i<=100;i++){
//         data.push(getRandomUser());//100 fake user data
//     }

//count user
app.get("/", (req, res) => {
    let q = `select count(*) from user`;
    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            let count = (result[0]["count(*)"]);
            res.render("home.ejs", { count });
            // console.log(result[1]);
        });
    }
    catch (err) {
        console.log(err);
        res.send("some error is in DB");
    }

});
//show route

app.get("/user", (req, res) => {
    let q = `select * from user`;
    try {
        connection.query(q, (err, users) => {
            if (err) throw err;
            //console.log(result);
            //res.send(result);
            res.render("users.ejs", { users });
        });
    }
    catch (err) {
        console.log(err);
        res.send("some error is in DB");
    }

});

//edit route

app.get("/user/:id/edit", (req, res) => {
    let { id } = req.params;
    let q = `select * from user where id='${id}'`;
    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            let user = result[0];
            res.render("edit.ejs", { user });
        });

    } catch (err) {
        console.log(err);
        res.send("some error is in DB");
    }

});
//update route
app.patch("/user/:id", (req, res) => {
    let { id } = req.params;
    let { password: formPassword, username: newusername } = req.body;
    let q = `select * from user where id='${id}'`;
    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            let user = result[0];
            if (formPassword != user.password) {
                res.send("Wrong password");
            }
            else {
                let q2 = `update user set username='${newusername}' where id='${id}'`;
                connection.query(q2, (err, result) => {
                    if (err) throw err;
                    res.redirect("/user");
                });
            }
        });

    } catch (err) {
        console.log(err);
        res.send("some error is in DB");
    }
});

//add users
app.get("/user/new",(req,res)=>{
    res.render("new.ejs");
});

app.post("/user/new",(req,res)=>{
    let {username,email,password}=req.body;
    let id=uuidv4();
    let q=`insert into user (id,username,email,password) values ('${id}','${username}','${email}','${password}')`;
    try{
        connection.query(q,(err,result)=>{
            if(err) throw err;
            console.log("added new users");
            res.redirect("/user");
        });

    }catch(err){
        console.log(err);
        res.send("some error is in DB");
    }
});
//delete user
app.get("/user/:id/delete",(req,res)=>{
    let { id } = req.params;
    let q = `select * from user where id='${id}'`;
    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            let user = result[0];
            res.render("delete.ejs",{user});
        });

    } catch (err) {
        console.log(err);
        res.send("some error is in DB");
    }

});
app.delete("/user/:id",(req,res)=>{
    let { id } = req.params;
    let {password ,email}=req.body;
    let q = `select * from user where id='${id}'`;
    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            let user = result[0];
            if(user.password!=password){
                res.send("Wrong password");
            }else if(user.email!=email){
                res.send("Wrong email");
            }
            else{
                let q2=`delete from user where id='${id}'`;
                connection.query(q2,(err,result)=>{
                    if(err)throw err;
                    else{ 
                        console.log(result);
                        res.redirect("/user");
                    }
                });
            }
        });

    } catch (err) {
        console.log(err);
        res.send("some error is in DB");
    }
});

app.listen("8080", () => {
    console.log("server is listning to port 8080.");
});



