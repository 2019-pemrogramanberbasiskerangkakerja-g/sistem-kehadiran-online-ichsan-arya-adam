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

var mataKuliahSchema = new mongoose.Schema({
    mataKuliahId: {type: Number, unique: true},
    mataKuliahName: String,
    kelas: String
});

var MataKuliah = mongoose.model("MataKuliah", mataKuliahSchema); 

var userSchema = new mongoose.Schema({
    userName: String,
    userRegisterNumber: {type: Number, unique: true},
    userPassword: String,

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

var jadwalKuliahSchema = new mongoose.Schema({
    mataKuliahId: {
        type: mongoose.Schema.Types.String, ref: 'MataKuliah'
    },
    pertemuanKe: Number,
    ruang: String,
    jamMasuk: Date,
    jamSelesai: Date,
    tahunAjaran: String,
    semester: String
});

var ambilKuliahSchema = new mongoose.Schema({
    userId: [{
        type: mongoose.Schema.Types.ObjectId, ref: 'User'
    }],
    mataKuliahId: [{
        type: mongoose.Schema.Types.ObjectId, ref: 'MataKuliah'
    }]
});

var kehadiranSchema = new mongoose.Schema({
    classId: {mataKuliahSchema},
    userId: [userSchema],
    semester: String,
    pertemuanKe: Number
});

var Jadwal = mongoose.model("Jadwal", jadwalKuliahSchema);
var AmbilKuliah = mongoose.model("AmbilKuliah", ambilKuliahSchema);

app.get('/', function (req, res) {
    res.render('login');
});

app.post('/login', function (req, res) {
    var user = req.body;

    User.find({userRegisterNumber: user.noInduk, userPassword: user.password}, function(err, response){
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
        console.log(" cookie has been destroyed");
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
    } else {
        res.redirect('/');
    }
});

app.post('/tambahmahasiswa', function(req, res){
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

app.post('/tambahjadwal', function(req, res){
    var jadwal = req.body;
    if (!jadwal.idMatkul || !jadwal.pertemuanKe || !jadwal.ruang || !jadwal.jamMasuk || !jadwal.jamSelesai || !jadwal.tahunAjaran || !jadwal.semester) {
        res.send("Wrong info provided")
    } else{
        MataKuliah.findOne({mataKuliahId: jadwal.idMatkul}, function (err, MataKuliah){
            // console.log(MataKuliah)
            var newJadwal = new Jadwal({
                mataKuliahId: MataKuliah.mataKuliahId,
                pertemuanKe: jadwal.pertemuanKe,
                ruang: jadwal.ruang,
                jamMasuk: jadwal.jamMasuk,
                jamSelesai: jadwal.jamSelesai,
                tahunAjaran: jadwal.tahunAjaran,
                semester: jadwal.semester
            });

            console.log(newJadwal)

            newJadwal.save(function (err, Jadwal) {
                if (err) {
                    console.log(err)
                    return res.send('Wrong input');
                }
                else {
                    console.log('Berhasil!');
                    return res.send('Berhasil!')
                    res.redirect('/')
                }
            });
        });
    }
});

app.post('/tambahmatkul', function (req, res) {
    var matkul = req.body; //Get the parsed information  

    var newMatkul = new MataKuliah({
        mataKuliahId: matkul.matkulId,
        mataKuliahName: matkul.name,
        kelas: matkul.kelas
    });

    newMatkul.save(function (err, MataKuliah) {
        if (err)
            return res.send('Error matakuliah id exist');
        else {
            console.log('Berhasil!');
            // res.redirect('/')  
            return res.send('berhasil');
        }
    });
});

app.post('/tambahpeserta/:mataKuliahId/:userId', function(req, res, next){
    MataKuliah.find({ mataKuliahId: req.params.mataKuliahId}, function (err, mataKuliah){
        if (err) throw err;
        if (mataKuliah.length >0 ){
            User.find({userRegisterNumber: req.params.userId}, function(err, user){
                if (err) throw err;
                if (user.length>0){
                    var newAmbilMatkul = new AmbilKuliah({
                        userId: user[0]._id,
                        mataKuliahId: mataKuliah[0]._id
                    });
                    console.log("hahaha");
                    console.log(newAmbilMatkul);

                    newAmbilMatkul.save(function(err){
                        if(err)
                            return res.send('Error hahaha');
                        else{
                            console.log('Berhasil!');
                            return res.send('berhasil');
                            
                        } 

                    });

                }

            });
        }

    });

});

app.listen(3000, function (req, res) {
    console.log("App start at port 3000");
});