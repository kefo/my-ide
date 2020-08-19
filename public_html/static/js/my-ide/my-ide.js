$(document).ready(init);

function init() {
	
	acemodes = new Object();
	getacemodes = $.getJSON('static/js/my-ide/modes.json');
	getacemodes.done(function(data) { 
		acemodes = data;
	});
	
	fileObj = new Object();
	editor = new Object();
	openFiles = new Object();
	
	config = new Object();
	getconfig = $.getJSON('config.json');
	getconfig.done(function(data) { 
		config = data;
		loadProjects();
		instantiateEditor();
		
		setTimeout( function() {
				$.each(config["projects"], function(i, p) {
					pname = p["project-name"];
					pdir = p["project-source"];
					if (p["project-files"] === undefined) {
						idiv = $("#info");
						var messagediv = $('<div id="responsemessage" class="alert alert-danger">' + pname + " (" + pdir + ")" + ' not found!</div>');
						idiv.append(messagediv);
						messagediv.fadeOut(15000, function() {
							idiv.empty();
						});
					}
				})
			},
			20000
		);
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
	
	fnamediv = $("#filename");
	var fdiv = $('<div></div>');
	fnamediv.html(fdiv);
				
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
		
		foundFile = false;
		loc = "";
		$.each(config["projects"], function(a, p) {
			f = findFileBlock(fid, p["project-files"]);
			if (typeof f != 'undefined') {
				// Found it.  Set the super var and exit this loop.
				loc = f;
				foundFile = true;
				return;
			}
		});
	
		if (newwhat == "file") {
			newfile = $.get("newfile/", { filepath: loc.filepath, filename: a });
			newfile.done(function(data) { 
				response = data;
				idiv = $("#info");
				if (response.error) {
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
		} else if (newwhat == "directory") {
			newdir = $.get("newdir/", { filepath: loc.filepath, dirname: a });
			newdir.done(function(data) { 
				response = data;
				idiv = $("#info");
				if (response.error) {
					var messagediv = $('<div id="responsemessage" class="alert alert-danger">' + response.message + '</div>');
					idiv.append(messagediv);
					messagediv.fadeOut(15000, function() {
						idiv.empty();
					});
				} else {
					var messagediv = $('<div id="responsemessage" class="alert alert-success">New directory created.</div>');
					idiv.append(messagediv);
					messagediv.fadeOut(2000, function() {
						idiv.empty();
					});
				}
			});
		}
		
		loadProjects();
	}
		 
};

function fileClickAction(href) {
	fid = href.attr('id');
	//file = findFileBlock(fid, fileObj);
	foundFile = false;
	file = "";
	//console.log(fid);
	$.each(config["projects"], function(a, p) {
		f = findFileBlock(fid, p["project-files"]);
		if (typeof f != 'undefined') {
			// Found it.  Set the super var and exit this loop.
			file = f;
			foundFile = true;
			return;
		}
	})
	//console.log(file.filepath);
	
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
			getfile = $.get("getfile/", { file: file.filepath });
			getfile.done(function(data) { 

                // What type of file is this?
    			ext = file.filename;
	    		if (file.filename.lastIndexOf(".") === -1) {
	    		    if (file.filename === "Dockerfile" || file.filename === "Berksfile") {
	    		        ext = "sh";
	    		    } else {
		    	        var firstLine = data.split('\n')[0];
    		    	    if (firstLine.indexOf('python') > -1) {
	    	    	        ext = "py";
		        	    } else if (firstLine.indexOf('php') > -1) {
		        	        ext = "php";
		    	        } else if (firstLine.indexOf('node') > -1) {
		    	            ext = "js";
		    	        } else if (firstLine.indexOf('bash') > -1) {
		    	            ext = "sh";
		    	        } else if (firstLine.indexOf('/sh') > -1) {
		    	            ext = "sh";
		    	        }
	    		    }
		    	} else {
                    ext = file.filename.substring(file.filename.lastIndexOf("."));
                    ext = ext.replace('.', '');
    			}
    			//alert(ext);
			
				// Set up the tab
				eTabs = $("#editorTabs");
				var li = $('<li><a id="#' + fid + '-eContentID" href="#' + fid + '-eContent" data-toggle="tab">' + file.filename + '</a></li>');
				eTabs.append(li);
					
				//alert(JSON.stringify(acemodes));
				//if (ext === '') {
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
                es.setUndoManager(new UndoManager());
				editor.setSession(es);
				editor.resize();
				//alert(arr[0]);

				openFiles[file.fileid] = { fileid: file.fileid, edsession: es, filename: file.filename, filepath: file.filepath, savestatus: "saved" };
				
				fnamediv = $("#filename");
				var fdiv = $('<div id="fmessage" class="alert alert-info" style="padding: 1px 20px 1px 1px; margin-bottom: 5px;">' + file.filepath + '</div>');
				fnamediv.html(fdiv);
				
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
	if (fObj.isdir) {
		// We have a directory.  I believe we should always have a directory, no?
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
}

function instantiateEditor() {
	// Set up the editor
	
	EditSession = ace.require('ace/edit_session').EditSession; // this is not used here, but instantiated for later.
	UndoManager = ace.require('ace/undomanager').UndoManager; // this is not used here, but instantiated for later.
	
	editortheme = "eclipse";
	if ( config["editor"].theme ) {
		theme = config["editor"].theme;
	}

	editorfontsize = 12;
	if ( config["editor"].fontsize ) {
		editorfontsize = config["editor"].fontsize;
	}
	
	editor = ace.edit("ed1");
	editor.setTheme("ace/theme/" + theme);
	editor.setFontSize(editorfontsize);
    editor.getSession().setMode("ace/mode/text");
    editor.getSession().setValue("");
    editor.resize()
    editor.on("change", function(e) {
		setUnsaved();
	});
    //editor.commands.bindKey("Ctrl-Shift-Space", "startAutocomplete");
    editor.commands.addCommand({
		name: 'closeTab',
		bindKey: {
			win: 'Super-Q',
			mac: 'Option-W',
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
			win: 'Super-S',
			mac: 'Option-S',
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
	
	openFiles["edtab"] = { fileid: "edtab", edsession: editor.getSession(), filename: "", filepath: "", savestatus: "saved" };
};

function loadProjects() {
	divcontents = $("#files");
	divcontents.empty();
	var div = $('<div></div>');
	divcontents.append(div);
	
	$.each(config["projects"], function(i, p) {
		pname = p["project-name"];
		pdir = p["project-source"];
		ignored = p["ignore-dirs"];
		
		if (!ignored) {
			ignored = [''];
		}
			
		var mainul = $('<ul class="open"></ul>');
		div.append(mainul);
		
		getdir = $.get("directory/", { dir: pdir, ignoredirs: ignored });
		getdir.done(function(data) { 
				
			fObj = data;
			p["project-files"] = fObj;

			var li = $('<li class="dirclosed"><a id="' + fObj.fileid + '" href="#">' + p["project-name"] + '</a> <a id="' + fObj.fileid + '-dir" href="#"><img src="static/images/folder-new-7.png" title="Create directory here" /></a> <a id="' + fObj.fileid + '-file" href="#"><img src="static/images/document-new-6.png" title="Create file here" /></a></li>');
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
			
			fnamediv = $("#filename");
			if (openFiles[fid].filepath) {
                fdiv = $('<div id="fmessage" class="alert alert-info" style="padding: 1px 20px 1px 1px; margin-bottom: 5px;">' + openFiles[fid].filepath + '</div>');
                fnamediv.html(fdiv);
			} else {
                fdiv = $('<div></div>');
                fnamediv.html(fdiv);
			}
		} else {
			alert(JSON.stringify(href));
		}
	}

}
