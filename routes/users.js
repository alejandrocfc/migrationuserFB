var express = require('express');
var app = express();
var router = express.Router();
var obj = require("./users.json");
var newuser = require("./newuser.json");
var bodyParser = require("body-parser");
var request = require('request');
var serviceAccount = require("./adminsdk.json");
var admin = require("firebase-admin");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://myfirebasedb.firebaseio.com"
});


var _ = require('underscore');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

function logger(param1, param2) {
    if (process.env.ENV) return;

    if (param2)
        console.log(param1, param2);
    else
        console.log(param1);
}

function createUser(params, success, failure) {
    admin.auth().createUser({
        displayName: params.name,
        email: params.email,
        password: params.mobile
    }).then(success).catch(failure);
}



/* GET users listing. */
router.get('/', function(req, res, next) {
    var asd = {
        successfully : [],
        error : []
    };
    for( var i = 0,length = newuser.users.length; i < length; i++ ) {
        var uid = newuser.users[i].localId;
        admin.auth().deleteUser(uid)
            .then(function () {
                asd.successfully.push(uid);
                // res.send("Successfully deleted user");
                console.log("Successfully deleted user");
            })
            .catch(function (error) {
                asd.error.push(uid);
                // res.send("Error deleting user:", error);
                console.log("Error deleting user:", error);
            });
    }
    /*var params = [];
    for(var ojbKey in obj) {
      if(obj[ojbKey].info){
              params.push(obj[ojbKey].info);
          admin.auth().createUser({
              displayName: params.name,
              email: params.email,
              password: params.mobile
          }).then(function(userRecord) {
              var userRef =  admin.database().ref('users').child(userRecord.uid);
              userRef.child('info').set({
                  country : {
                      code: params.country.code,
                      dial_code: params.country.dial_code,
                      name: obj[ojbKey].info.country.name
                  },
                  email : obj[ojbKey].info.email,
                  firstName : obj[ojbKey].info.firstName,
                  lastName : obj[ojbKey].info.lastName,
                  mobile : obj[ojbKey].info.mobile,
                  name : obj[ojbKey].info.name,
                  rol: obj[ojbKey].info.rol,
                  select: obj[ojbKey].info.select,
                  title: obj[ojbKey].info.title
              });
              // See the UserRecord reference doc for the contents of userRecord.
              console.log("Successfully created new user:", userRecord.uid);
          }).catch(function(error) {
                  console.log("Error creating new user:", error);
              });*/
        /*createUser(, function (userData) {
            var userRef =  admin.database().ref('users').child(userData.uidInternal);
            userRef.child('info').set({
                country : {
                    code: obj[ojbKey].info.country.code,
                    dial_code: obj[ojbKey].info.country.dial_code,
                    name: obj[ojbKey].info.country.name
                },
                email : obj[ojbKey].info.email,
                firstName : obj[ojbKey].info.firstName,
                lastName : obj[ojbKey].info.lastName,
                mobile : obj[ojbKey].info.mobile,
                name : obj[ojbKey].info.name,
                rol: obj[ojbKey].info.rol,
                select: obj[ojbKey].info.select,
                title: obj[ojbKey].info.title
            });
            userRef.then(function () {
                asd.successfully.push(userData);
             /!*console.log({
             success: true,
             data: userData
             });*!/
             }).catch(function (err) {
                 asd.error[userData].error = error;
                 asd.error[userData].data = userData;
                /!*console.log({
                 success: false,
                 data: err
                 });*!/
             });
        }, function (err) {
            asd.maxError.push(err);
            /!*console.log({
                success: false,
                data: err
            });*!/
        });*/

        // console.log("key:"+exKey+", value:"+obj[exKey]);



    /*var datos =  admin.database().ref('datos').set(params);
    res.send(params);*/
  res.send('respond with a resource');
});

router.get('/asd', function(req, res, next) {
    var usuarios = [];

    var query = admin.database().ref("datos").orderByKey();
    query.once("value")
        .then(function(snapshot) {
            snapshot.forEach(function(childSnapshot) {
                // childData will be the actual contents of the child
                var params = childSnapshot.val();
                usuarios.push(params);
                // console.log(params.name);
                if(params.name && params.email && params.mobile){
                    var info = {
                        country : {
                            code: params.country.code,
                            dial_code: params.country.dial_code,
                            name: params.country.name
                        },
                        email : params.email,
                        firstName : params.firstName,
                        lastName : params.lastName,
                        mobile : params.mobile,
                        personInvitation : (params.personInvitation) ? params.personInvitation : null,
                        name : params.name,
                        rol: params.rol,
                        title: params.title
                    };
                    createUser(params, function (userData) {
                        var userRef =  admin.database().ref('users').child(userData.uid);
                        //var logisRef = admin.database().ref('logistic').child(userData.uidInternal);
                        userRef.child('info').set(info);
                        //logisRef.set(data);
                        userRef.then(function () {
                            console.log(true)
                            /*res.send({
                             success: true,
                             data: userData
                             });*/
                        }).catch(function (err) {
                            console.log(false, err);
                            /*res.send({
                             success: false,
                             data: err
                             });*/
                        });
                    }, function (err) {
                        console.log('FAIL UPLOAD', err);
                        /*res.send({
                         success: false,
                         data: err
                         });*/
                    });
                }
            });
        res.send(usuarios);
        });

});


/*
 $firebase.get('datos').then(function(data){
 if (data) {
 console.info(data);
 angular.forEach(data, function (val, key) {

 var datos = {val};

 //console.log(datos);

 $http.post(url, datos).then(function (res) {
 if (res.data.success) {
 console.log('success:', res.success);
 //alert('User created successfully');
 } else {
 console.log('error:', res.data);
 //alert('An error occurred creating the user, please try again');
 }
 }).catch(function (err) {
 console.log('err:', err);
 //alert('error connecting with the server');
 })
 //console.log(val.NAME);
 //console.info($scope.search);
 //val.$key = key;*
 });
 }else{
 $window.alert('Sube el CSV primero');
 }
 //$commons.apply($scope);
 });
*/

module.exports = router;
