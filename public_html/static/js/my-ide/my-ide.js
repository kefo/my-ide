$(document).ready(init);

function init() {
	
	acemodes = new Object();
	getacemodes = $.getJSON('static/js/m.json');
	getacemodes.done(function(data) { 
		acemodes = data;
	});
	
	fileObj = new Object();
	config = new Object();
	getconfig = $.getJSON('config.json');
	getconfig.done(function(data) { 
		config = data;
		loadProjects();
	});
	
	// Capture tab click events.
	$("#editorTabs").on("click", function(e) {
		toggleTab($(e.target));
	});
	
	$(window).bind('beforeunload', function() {
		editing = false;
		$.each(openFiles, function(i, obj) {
			if (obj.savestatus == "edited") {
				editing = true;
			}
		});
		if (editing) {
			return 'You have unsaved changes.  Are you sure you want to close the page?';
		} else {
			return 'All documents saved.  Did you want to close?';
		}
	});
	
	// Set up the editor
	EditSession = ace.require('ace/edit_session').EditSession;
	editor = ace.edit("ed1");
	editor.setTheme("ace/theme/eclipse");
    editor.getSession().setMode("ace/mode/text");
    editor.getSession().setValue("");
    editor.resize()
    editor.on("change", function(e) {
		setUnsaved();
	});
	editor.commands.addCommand({
		name: 'closeTab',
		bindKey: {
			win: 'Ctrl-W',
			mac: 'Command-W',
			sender: 'editor|cli'
		},
		exec: function(env, args, request) {
			eTabs = $("#editorTabs");
			li = eTabs.find("li.active").eq(0);
			tab = eTabs.find("li.active a").eq(0);
	
			fid = tab.attr('href').replace("-eContent", "");
			fid = fid.replace("#", "");
			
			if (openFiles[fid].savestatus == "saved") {
				// Let's close the tab and destroy the editing session.
				closeTab(li, fid);
			} else {
				var r=confirm("The file has changed and not been saved.  Do you really want to close this tab?");
				if (r==true) {
					closeTab(li, fid);
				} else {
					toggleTab(tab);
				}
			}
		}
	});
	editor.commands.addCommand({
		name: 'saveFile',
		bindKey: {
			win: 'Ctrl-S',
			mac: 'Command-S',
			sender: 'editor|cli'
		},
		exec: function(env, args, request) {
			eTabs = $("#editorTabs");
			li = eTabs.find("li.active").eq(0);
			tab = eTabs.find("li.active a").eq(0);
	
			fid = tab.attr('href').replace("-eContent", "");
			fid = fid.replace("#", "");
			
			if (openFiles[fid].savestatus == "edited") {
				// Content has been edited, let's save it.
				if ( openFiles[fid].filepath != "" ) {
					content = editor.getSession().getValue();
					$.post("/savefile/", { filepath: openFiles[fid].filepath, content: content } )
						.done(function(data) {
							response = data;
							if (response.error) {
								idiv = $("#info");
								var messagediv = $('<div id="responsemessage" class="alert alert-danger">' + response.message + '</div>');
								idiv.append(messagediv);
								messagediv.fadeOut(15000, function() {
									idiv.empty();
								});
							} else {
								text = tab.html()
								text = text.replace(" *", "");
								tab.html(text);
								tab.removeClass("alert-unsaved");
								openFiles[fid].savestatus = "saved";
								
								idiv = $("#info");
								var messagediv = $('<div id="responsemessage" class="alert alert-success">' + response.message + '</div>');
								idiv.append(messagediv);
								messagediv.fadeOut(2000, function() {
									idiv.empty();
								});
							}
						});
				}
			}
		}
	});
	
	openFiles = new Object();
	openFiles["edtab"] = { fileid: "edtab", edsession: editor.getSession(), filename: "", filepath: "", savestatus: "saved" };
          
	$( "#prettify" ).click(function() {
			
		var xml = editor.getSession().getValue();
		xml = vkbeautify.xml(xml)
		editor.getSession().setValue(xml);
	});
	
	$( "#validate" ).click(function() {
		var xml = editor.getSession().getValue();
		var xmlDoc = $.parseXML( xml );
		var $xml = $( xmlDoc );
		
		root = ($xml.find("*").eq(0)[0]);
		rootName = root.nodeName;
		xmlns = $( root ).attr("xmlns");
		schema = $( root ).attr("xsi:schemaLocation")
		alert(schema);
	});
	
}

function closeTab(tab, fileid) {
	// Let's close the tab and destroy the editing session.
	if ( li.next("li").length > 0 ) {
		newhref = li.next().find("a").eq(0);
	} else if ( li.prev("li").length > 0 ) {
		newhref = li.prev().find("a").eq(0);
	} else {
		$("#edtab").find("a").eq(0);
	}
	li.remove();
	delete openFiles[fid];
	toggleTab(newhref);	
}

function createNew(href, newtype) {
	newwhat = "file";
	if (newtype == "dir") {
		newwhat = "directory";
	}
	var a=prompt("Please enter a new " + newwhat + " name","");
	if (a != "") {
		// entered something.
		fid = $(href).attr("id")
		fid = fid.replace("-file", "");
		fid = fid.replace("-dir", "");
		loc = findFileBlock(fid, fileObj);
		alert(loc.filepath);
		if (newwhat == "file") {
			f = loc.filepath + a;
			newfile = $.get("/newfile/", { file: f });
			newfile.done(function(data) { 
				response = data;
				if (response.error) {
					idiv = $("#info");
					var messagediv = $('<div id="responsemessage" class="alert alert-danger">' + response.message + '</div>');
					idiv.append(messagediv);
					messagediv.fadeOut(15000, function() {
						idiv.empty();
					});
				} else {
					var messagediv = $('<div id="responsemessage" class="alert alert-success">New file created.</div>');
					idiv.append(messagediv);
					messagediv.fadeOut(2000, function() {
						idiv.empty();
					});
				}
			});
		}
	}
		 
};

function fileClickAction(href) {
	fid = href.attr('id');
	//file = findFileBlock(fid, fileObj);
	foundFile = false;
	file = "";
	$.each(config["projects"], function(a, p) {
		f = findFileBlock(fid, p["project-files"]);
		if (typeof f != 'undefined') {
			// Found it.  Set the super var and exit this loop.
			file = f;
			foundFile = true;
			return;
		}
	})
	//alert(fBlock.filepath);
	
	if (file.isdir) {
		href.parent().toggleClass('dirclosed diropen');
		href.parent().find("ul").eq(0).toggleClass('hide open');
	} else {
		
		if ( openFiles[fid] ) {
			href = $( 'a[id="#' + fid + '-eContentID"]');
			if (href.parent().attr("class") != "active") { 
				toggleTab(href);
			}
		} else {
			var periods = file.filename.match(/\./g);  
			ext = file.filename;
			for (var i = 0; i < periods.length; i++) {
				ext = file.filename.substring((file.filename.indexOf('.') + 1));
			}
			//alert(ext);
		
			getfile = $.get("/getfile/", { file: file.filepath });
			getfile.done(function(data) { 
			
				// Set up the tab
				eTabs = $("#editorTabs");
				var li = $('<li><a id="#' + fid + '-eContentID" href="#' + fid + '-eContent" data-toggle="tab">' + file.filename + '</a></li>');
				eTabs.append(li);
					
				//alert(JSON.stringify(acemodes));
				var arr = [];
				$.each(acemodes.mode, function(k, v) {
					$.each(v, function(n, e) {
						//alert(e);
						if (e.indexOf(ext) >= 0) {
							arr.push(n);
						}
					});
				});
				//alert(arr);
			
				// Set up a new edit session
				var es = new EditSession(data, "ace/mode/" + arr[0]);
				editor.setSession(es);
				editor.resize();

				openFiles[file.fileid] = { fileid: file.fileid, edsession: es, filename: file.filename, filepath: file.filepath, savestatus: "saved" };
				
				a = li.find("a").eq(0);
				toggleTab(a);
			});
		}
		
		
		
	}

}

function findFileBlock(fid, fObj) {
	if (fid == fObj.fileid) {
		return fObj;
	} else if (fObj.file) {

		fbfound = false;
		$.each(fObj.file, function(i, obj) {
			if (fbfound.fileid) {
				return fbfound;
			}
			fb = findFileBlock(fid, obj);
			if (typeof fb != 'undefined') {
				// Found it.  Set the super var and exit this loop.
				fbfound = fb;
				return;
			}
		});
		if (fbfound.fileid) {
			return fbfound;
		}
	}
}

function fileObjToHTMLTree(fObj, el) {
	file = fObj.file;
	$.each(file, function(i, obj) {
		//alert(obj.filename);
		if (obj.isdir) {
			var li = $('<li class="dirclosed"><a id="' + obj.fileid + '" href="#">' + obj.filename + '</a> <a id="' + obj.fileid + '-dir" href="#"><img src="static/images/folder-new-7.png" title="Create directory here" /></a> <a id="' + obj.fileid + '-file" href="#"><img src="static/images/document-new-6.png" title="Create file here" /></a></li>');
			el.append(li);
			$("#" + obj.fileid).click(function() { fileClickAction($(this)); });
			$("#" + obj.fileid + "-dir").click(function() { createNew($(this), "dir"); });
			$("#" + obj.fileid + "-file").click(function() { createNew($(this), "file"); });
			
			var ul = $('<ul class="hide"></ul>');
			li.append(ul);
			fileObjToHTMLTree(obj, ul);
		} else {
			var li = $('<li class="file"><a id="' + obj.fileid + '" href="#">' + obj.filename + '</a></li>');
			el.append(li);
			$("#" + obj.fileid).click(function() { fileClickAction($(this)); });
		}
	});
}

function loadProjects() {
	divcontents = $("#files");
	divcontents.empty();
	var div = $('<div></div>');
	divcontents.append(div);
	
	$.each(config["projects"], function(i, p) {
		pname = p["project-name"];
		pdir = p["project-source"];
			
		var mainul = $('<ul class="open"></ul>');
		div.append(mainul);
		
		getdir = $.get("/directory/", { dir: pdir });
		getdir.done(function(data) { 
				
			fObj = data;
			p["project-files"] = fObj;
				
			var li = $('<li class="dirclosed"><a id="' + fObj.fileid + '" href="#">' + fObj.filename + '</a> <a id="' + fObj.fileid + '-dir" href="#"><img src="static/images/folder-new-7.png" title="Create directory here" /></a> <a id="' + fObj.fileid + '-file" href="#"><img src="static/images/document-new-6.png" title="Create file here" /></a></li>');
			mainul.append(li);
			$("#" + fObj.fileid).click(function() { fileClickAction($(this)); });
			$("#" + fObj.fileid + "-dir").click(function() { createNew($(this), "dir"); });
			$("#" + fObj.fileid + "-file").click(function() { createNew($(this), "file"); });
			
			var ul = $('<ul class="hide"></ul>');
			li.append(ul);
			fileObjToHTMLTree(fObj, ul);
			
		});
	});
}

function setUnsaved() {
	eTabs = $("#editorTabs");
	tab = eTabs.find("li.active a").eq(0);
	
	fid = tab.attr('href').replace("-eContent", "");
	fid = fid.replace("#", "");
	
	if (openFiles[fid].savestatus == "saved") {
		text = tab.html()
		text = text + " *";
		tab.html(text);
		tab.addClass("alert-unsaved");
		openFiles[fid].savestatus = "edited";
	}
	
};

function toggleTab(href) {
	
	if ( $(href).attr('id') != "editorTabs") {
		eTabs = $("#editorTabs");
		eTabs.find("li.active").eq(0).removeClass('active');

		$(href).parent().tab("show");
		$(href).parent().addClass("active");
	
		fid = $(href).attr('id').replace("-eContentID", "");
		fid = fid.replace("#", "");
		
		if (openFiles[fid]) {
			editor.setSession(openFiles[fid].edsession);
			editor.focus();
			editor.resize();
		} else {
			alert(JSON.stringify(href));
		}
	}

}
