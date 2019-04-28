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

var sess;
var mongoose = require('mongoose');
mongoose.set('useCreateIndex', true)
mongoose.connect('mongodb://localhost/test', { useNewUrlParser: true });

var personSchema = mongoose.Schema({
    name: String,
    age: Number,
    nationality: String
});

var userSchema = mongoose.Schema({
    name: String,
    noInduk: {type: Number, unique: true},
    password: String,
    role: String

});

userSchema.pre('save', function (next) {
    var self = this;
    User.find({name : self.username}, function (err, docs) {
        if (!docs.length){
            next();
        }else{                
            console.log('user exists: ',self.username);
            next(new Error("User exists!"));
        }
    });
});
var Person = mongoose.model("Person", personSchema);
var User = mongoose.model("User", userSchema);


app.get('/', function (req, res) {
    res.render('login');
});


app.post('/login', function (req, res) {
    var user = req.body;

    User.find({noInduk: user.noInduk}, function(err, response){
        if (err) throw err;
        if (response.length > 0 ){
            console.log('berhasil login');
            sess = req.session;
            sess.noInduk = req.body.noInduk;
            res.cookie('SESSION_MHS', req.body.noInduk, {maxAge: 9000000, httpOnly: true }) //2.5 jam
        }
    });
    res.redirect('anggota');
});

app.get('/register', function (req, res) {
    res.render('register');
});

app.get('/anggota', function(req, res){
    sess = req.session;
    if (sess.page_views){
        sess.page_views++;
        res.send('Hi ' + sess.name + ' You visited this page ' + sess.page_views + ' times' );
    } else if (sess.page_views === 1) {
        res.send('Hi ' + sess.name + ' You visited this page for the first times' );
    } else {
        res.redirect('/');
    }
});

app.get('/mahasiswa/register', function(req, res){
    res.render('register');
});

app.post('/mahasiswa/add', function(req, res){
    var user = req.body; //Get the parsed information

    if(!user.name || !user.noInduk || !user.password){
       res.render('anggota',{
           error : 'Sorry, you provided worng info'
       });
       console.log('sorry salah cuk');
    } else {
       var newUser = new User({
          noInduk: user.noInduk,
          name: user.name,
          password: user.password,
          role: user.role
       });
         
       newUser.save(function(err, User){
          if(err)
            return res.send('Error');
          else{
            console.log('berhasil');
            res.redirect('/')

          } 
       });
    }

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
            res.render('anggota', Person);

          } 
       });
    }
});

app.listen(3000, function (req, res) {
    console.log("App start at port 3000");
});