var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer();
var exphandlebars = require('express-handlebars');
var mongoose = require('mongoose');
var cookieParser = require('cookie-parser');
var session = require('express-session');
 
var app = express();

app.use(cookieParser()); 
app.use(session({secret: "Shh, its a secret!"}));
app.engine('handlebars', exphandlebars({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
// for parsing application/xwww-
// app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 
//form-urlencoded

// for parsing multipart/form-data
app.use(upload.array()); 

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test', { useNewUrlParser: true });

var personSchema = mongoose.Schema({
    name: String,
    age: Number,
    nationality: String
 });

 var Person = mongoose.model("Person", personSchema);








app.get('/', function (req, res) {
    res.render('login');
});

app.get('/register', function (req, res) {
    res.render('register');
});

app.get('/person', function(req, res){
    res.render('person');
 });

 app.post('/person', function(req, res){
    var personInfo = req.body; //Get the parsed information
    console.log(personInfo);
    if(!personInfo.name || !personInfo.age || !personInfo.nationality){
       res.render('anggota', personInfo.name, personInfo.age, personInfo.nationality);
    } else {
       var newPerson = new Person({
          name: personInfo.name,
          age: personInfo.age,
          nationality: personInfo.nationality
       });
         
       newPerson.save(function(err, Person){
          if(err)
            console.log(err);
          else{
            console.log('berhasil');
            res.render('anggota', personInfo);

          } 
       });
    }
 });



app.listen(3000, function (req, res) {
    console.log("App start at port 3000");
});