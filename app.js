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

app.use(bodyParser.urlencoded({ extended: true })); 

app.use(upload.array()); 

var sess;
var mongoose = require('mongoose');
mongoose.set('useCreateIndex', true)
mongoose.connect('mongodb://localhost/test', { useNewUrlParser: true });

var classSchema = new mongoose.Schema({
    className: String,
    classCode: String,
    classDay: String,
    classStartTime: Date,
    classEndTime: Date,
    classLecturer: String,
    classStudent: [String]
});

var userSchema = new mongoose.Schema({
    userName: String,
    userRegisterNumber: {type: Number, unique: true},
    userPassword: String,
    userRole: {
        type: String, 
        enum: ['Mahasiswa', 'Dosen']
    },
    userClass: [classSchema]
});

var takeClass = new mongoose.Schema({
    classId: {classSchema},
    classUser: [userSchema]
});

var presentCount = new mongoose.Schema({
    classId: {classSchema},
    classUser: [userSchema],
    presentDay: Date,
    presentStartTime: Date,
    presentEndTime: Date,
    presentStatus: {
        type: Boolean,
        enum: ['Hadir', 'Tidak Hadir']
    }
});

userSchema.pre('save', function (next) {
    var self = this;
    User.find({userRegisterNumber : self.noInduk}, function (err, docs) {
        if (!docs.length){
            next();
        }
        else{                
            console.log('user exists: ',self.noInduk);
            next(new Error("User exists!"));
        }
    });
});

var User = mongoose.model("User", userSchema);

app.get('/', function (req, res) {
    res.render('login');
});


app.post('/login', function (req, res) {
    var user = req.body;

    User.find({userRegisterNumber: user.noInduk}, function(err, response){
        if (err) throw err;
        if (response.length > 0 ){
            console.log('berhasil login');
            sess = req.session;
            sess.userRegisterNumber = req.body.noInduk;
            res.cookie('SESSION_MHS', req.body.noInduk, {maxAge: 9000000, httpOnly: true }) //2.5 jam
            console.log('Cookies: ', req.cookies);
            console.log('login lagi');
        }
        res.redirect('anggota');
    });
    
});

app.get('/logout', function(req, res, next) {
    if (req.session) {
        res.clearCookie('SESSION_MHS');
        console.log(req.cookies);
        // delete session object
        req.session.destroy(function(err) {
            if(err) {
                return next(err);
            }
            else {
                return res.redirect('/');
            }
        });
    }
});
  

app.get('/register', function (req, res) {
    res.render('register');
});

app.get('/anggota', function(req, res){
    sess = req.session;
    if (sess.userRegisterNumber){
        var userSess = sess;
        res.render('anggota', userSess );
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
       console.log('wrong info!');
    } else {
       var newUser = new User({
          userRegisterNumber: user.noInduk,
          userName: user.name,
          userPassword: user.password,
          userRole: user.role
       });
         
       newUser.save(function(err, User){
          if(err)
            return res.send('Error user register number exist');
          else{
            console.log('Berhasil!');
            res.redirect('/')

          } 
       });
    }

});

app.listen(3000, function (req, res) {
    console.log("App start at port 3000");
});