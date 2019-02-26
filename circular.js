var express = require('express')
 var request=require('request')
var fileUpload = require('express-fileupload');
var csv = require("csvtojson");


var bodyParser = require('body-parser')
var fs=require('fs')
var app = express()

app.use(express.static('public'))
app.use(fileUpload());

app.use(bodyParser.urlencoded({ extended: false }))


var mongojs = require('mongojs')
var db=mongojs('mongodb://Manasa:srimanya7@ds151124.mlab.com:51124/mydatabase',['circular'])


app.set('view engine','ejs');

app.get('/',function(req,res){
	res.render('circular', {error:false})
})

app.get('/openexport',function(req,res){
	res.render('export')
})
app.get('/openupload',function(req,res){
	res.render('upload')
})

app.post('/',function(req,res){
	var user=req.body.username
	var pwd=req.body.password
	var doc = {
		username:user,
		password:pwd
	}
	db.circular.find(doc,function(err,docs){// frr mongo db
		console.log(docs)
		if(docs.length>0){
			if(docs[0].role=="operator"){
				res.render('operator',{error:false})
			}
			else if(docs[0].role=="user"){
				res.render('user')
			}
		}
		else{
			res.render("circular", {error:true})
		}

	})

})

app.get('/Subject:subject',function(req,res){
	var sub=req.params.subject
	var doc = {
        subject:sub
	}
	db.datacircular.find(doc,function(err,docs){// frr mongo db
		
		if(docs.length>0){
			db.datacircular.find({docs},function(err,data){
				res.render('category',{res:docs})
			})
		}
		else{
			res.send("No such circulars!!!!")
		}
	})

})

app.post('/export', function(req, res) {
  if (Object.keys(req.files).length == 0) {
    return res.status(400).send('No files were uploaded.');
  }
  let sampleFile = req.files.inputfile;
  uploadPath = __dirname + '/uploads/' + Date.now()+ '-' +sampleFile.name ;
  sampleFile.mv(uploadPath, function(err) {
    if (err){
      return res.status(500).send(err);
    }
    else
    {
          csv()
            .fromFile(uploadPath)
            .then(function(jsonArrayObj){ //when parse finished, result will be emitted here.
               //console.log(jsonArrayObj); 
               var cnt=0

               var bulk = db.circular.initializeOrderedBulkOp()
                  for (var idx in jsonArrayObj){
                  var doc=jsonArrayObj[idx]
                  bulk.insert(doc)
                   cnt++

                }
                bulk.execute(function (err, resss) {
                    console.log('Done!')
                   res.send('<h1>'+cnt+' rows are Sucessully inserted</h1>')
                })
               
            })
     }
  });
});



app.post('/upload', function(req, res) {
 var date = req.body.datee
	var time =  req.body.timee
	var type = req.body.circulartype
	var sub = req.body.subject
	var desc = req.body.description
    var imgname = req.files.imgupload.name
	var doc ={
		datee:date,
		timee:time,
		circulartype:type,
		subject:sub,
		description:desc,
		imgupload:imgname
	}
	db.datacircular.insert(doc,function(err,newD){// for mongo
         if(err){
         	res.send(' something goes wrong')
         }
         else{
             res.send('successfully uploaded!!')
         }

       })
    let sampleFile;
  let uploadPath;
  console.log(req.files)
  if (Object.keys(req.files).length == 0) {
    res.status(400).send('No files were uploaded.');
    return;
  }

  console.log('req.files >>>', req.files); // eslint-disable-line

  sampleFile = req.files.imgupload;

  uploadPath = __dirname + '/images/' + sampleFile.name;

  sampleFile.mv(uploadPath, function(err) {
    if (err) {
      return res.status(500).send(err);
    }

    res.send('File uploaded to ' + uploadPath);
  });
 
});



 app.post('/loadcsv',function(req,res){
  
csv()
  .fromFile(csvFilePath)
  .then(function(jsonArrayObj){ //when parse finished, result will be emitted here.
     console.log(jsonArrayObj); 
   })
  var doc={
          username:uname,
          password:pwd,
          role:role
      }
  
 });

app.get('/logout',function(req,res){
 		res.redirect('/')
 })

app.listen(3000,function(req,res){
	console.log("circular on way!!!!!!")
})
