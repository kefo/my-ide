// imports
var express = require('express'),
    fs = require('fs'),
	http = require('http'),
    path = require('path');

// establish server
var express = require('express');
var fs = require('fs');
var server = express();

// configure application
server.configure(function () {
  server.set('views', __dirname + '/views');
  server.set('view engine', 'jade');
  server.use(express.bodyParser());
});

server.configure('development', function () {
  server.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  server.use(express.static(__dirname + '/public_html'));
});

server.configure('production', function () {
  server.use(express.errorHandler());
  server.use(express.static(__dirname + '/public_html', {maxAge: 60*15*1000}));
});

server.get('/', function (req, res){
  res.render('index', {
    title: 'IDE'
  });
});

server.get('/directory/', function (req, res){
	console.log("Entered directory function.");
	d = req.query.dir
	ignored = req.query.ignoredirs
	
	f = readDirRecursively(d, ignored);
	
	console.log(f);
	res.send(f);
});

server.get('/getfile/', function (req, res){
	console.log("Entered file function.");
	file = req.query.file
	f = fs.readFileSync(file)
	res.send(f);
});

server.get('/newdir/', function(req, res) {
	
	var fpath = req.query.filepath;
	var dname = req.query.dirname;
	var dirpath = fpath + dname;
	
	if ( dname.match("/"+"$") != "/" ) {
		dname += "/";
	}

	console.log("Creating new directory: " + dirpath);
		
	var file = new Object();
	file.filepath = dirpath;
	file.filename = dname;
	fid = file.filepath.replace(/([\.\s\-\/:'\(\)]*)/g,"");
	file.fileid = fid;
	file.isdir = true;
	
	var response = new Object();
	response.filepath = dirpath;
	response.error = false;
	
	fs.mkdir(dirpath, function (err) {
		if (err) {
			console.log(err);
			response.error = true;
			response.message = err;
			console.log("Failed to create new directory: " + err);
		} else {
			response.message = "Directory created.";
			response.file = file;
			console.log("Directory created: " + dirpath);
		}
		res.send(response);
	});
	
});

server.get('/newfile/', function(req, res) {
	
	var fpath = req.query.filepath;
	var fname = req.query.filename;
	var filepath = fpath + fname;
	
	console.log("Creating new file: " + filepath);
		
	var file = new Object();
	file.filepath = filepath;
	file.filename = fname;
	fid = file.filepath.replace(/([\.\s\-\/:'\(\)]*)/g,"");
	file.fileid = fid;
	file.isdir = false;
	
	var response = new Object();
	response.filepath = filepath;
	response.error = false;
	
	fs.writeFile(filepath, "", function (err) {
		if (err) {
			console.log(err);
			response.error = true;
			response.message = err;
			console.log("Failed to create new file: " + err);
		} else {
			response.message = "File created.";
			response.file = file;
			console.log("File created: " + filepath);
		}
		res.send(response);
	});
	
});

server.post('/savefile/', function(req, res) {
	
	var content = req.body.content,
		filepath = req.body.filepath;
	
	console.log("Trying to save file: " + filepath);
	
	var response = new Object();
	response.filepath = filepath;
	response.error = false;
	
	fs.writeFile(filepath, content, function (err) {
		if (err) {
			console.log(err);
			response.error = true;
			response.message = err;
			console.log("Error saving file: " + error);
		} else {
			response.message = "File saved.";
			console.log("File saved: " + filepath);
		}
		res.send(response);
	});
	
});

server.get('/about/', function (req, res){
  res.render('about', {
    title: 'about ide'
  });
});

server.listen(3000);
console.log('Server started; Listening on port 3000');

function readDirRecursively(d, ignored) {
	
	var f = new Object();
	f.filepath = d;
	fid = f.filepath.replace(/([\.\s\-\/:']*)/g,"");
	f.fileid = fid;
	f.isdir = true;
	
	fnameParts = d.split('/');
	fname = fnameParts[fnameParts.length-2]; // Dirs always end in / so it will be the second from the end.
	//console.log(fname);
	f.filename = fname;
	
	tree = fs.readdirSync(d);
	//console.log(tree);
	
	f.file = [];
	tree.forEach(function(file){
		fstart = file.substring(0, 1)
		if (fstart === ".") { return; }
		//console.log(file);
		stats = fs.statSync(d + file);
		if (stats.isFile()) {
			finfo = new Object();
			finfo.filepath = d + file;
			finfo.filename = file;
			fid = finfo.filepath.replace(/([\.\s\-\/:'\(\)]*)/g,"");
			finfo.fileid = fid;
			finfo.isdir = false;
			f.file.push(finfo);
		} else if (stats.isDirectory()) {
		    if (ignored.indexOf(file) == -1) {
			    fpath = d + file + "/";
			    children = readDirRecursively(fpath, ignored)
			    f.file.push(children);
		    }
		}
	});
	return f;
}
