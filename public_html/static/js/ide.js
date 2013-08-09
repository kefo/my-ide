$(document).ready(init);

function init() {
	
	// Capture tab click events.
	$("#editorTabs").on("click", function(e) {
		toggleTab($(e.target));
	});
	
	acemodes = new Object();
	getacemodes = $.getJSON('static/js/m.json');
	getacemodes.done(function(data) { 
		acemodes = data;
	});
	
	var projects = '{"project": [ \
			{ \
				"project-name": "ID-2013", \
				"project-source": "/home/kefo/Desktop/elasticsearch/id-main-ide/" \
			}, \
			{ \
				"project-name": "BFI Website", \
				"project-source": "/home/kefo/Desktop/bfi/bibframe-model/bfweb/" \
			} \
		] \
	}';
	
	projs = new Object();
	projs = $.parseJSON(projects);
	//alert(projects.project[0]["project-name"]);
		
	$(function () {
		$(document).on('shown', 'a[data-toggle="tab"]', function (e) {
			alert("this ran");
			toggleTab(e.target); // activated tab
			//e.relatedTarget; // previous tab
		})
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
	
	fileObj = new Object();
	loadProjects();
	//getDir(projs.project[0]["project-source"]);
	
	xml = '<?xml version="1.0" encoding="UTF-8"?><mods xmlns="http://www.loc.gov/mods/v3" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.loc.gov/mods/v3 http://www.loc.gov/standards/mods/v3/mods-3-4.xsd" version="3.4"><titleInfo><title>Gacha Gacha</title></titleInfo><titleInfo type="uniform" nameTitleGroup="1"><title>Gachagacha. English</title></titleInfo><name type="personal" usage="primary" nameTitleGroup="1"><namePart>Tamakoshi, Hiroyuki.</namePart></name><name type="personal"><namePart>Ury, David.</namePart></name><typeOfResource>text</typeOfResource><genre authority="marcgt">comic strip</genre><genre authority="">Graphic novels.</genre><originInfo><place><placeTerm type="code" authority="marccountry">nyu</placeTerm></place><place><placeTerm type="text">New York, N.Y</placeTerm></place><publisher>Ballantine Books</publisher><dateIssued>&lt;c2005-c2008&gt;</dateIssued><dateIssued point="start" encoding="marc">2006</dateIssued><dateIssued point="end" encoding="marc">9999</dateIssued><issuance>monographic</issuance></originInfo><language><languageTerm type="code" authority="iso639-2b">eng</languageTerm></language><language objectPart="translation"><languageTerm type="code" authority="iso639-2b">jpn</languageTerm></language><physicalDescription><form authority="marcform">print</form><extent>v. &lt;1-6, 8,9,11&gt; : chiefly ill. ; 21 cm.</extent></physicalDescription><abstract>Lately, Kouhei can\'t get his friend Kurara out of his mind. Even though he has known her since elementary school, all of a sudden, ever since she came back from summer vacation, he has been crushing on her hard. But something is different about Kurara-she is acting very oddly. Sometimes she seems wholesome, pure, and innocent, and at other times she is extremely forward and unabashed. Kouhei soon learns that Kurara has multiple personalities-and decides to help her keep her secret from their classmates. But Kouhei finds himself struggling between helping Kurara as a friend and trying to win her heart ... which is a challenge, since she has many!</abstract><tableOfContents>v. 6,9. The next revolution</tableOfContents><targetAudience>Rating: OT ages 16+</targetAudience><note type="statement of responsibility" altRepGroup="00">Hiroyuki Tamakoshi ; translated and adapted by David Ury ; lettered by North Market Street Graphics.</note><note>"DEL REY."</note><note>Vol. 2-3 lettered by Wilson Ramos, Jr. ; v. &lt;4-5&gt;- lettered by Patrice Sheridan ; v. 9 lettered by North Market Street Graphics ; v. 11 lettered by North Market Street Graphics.</note><note>Vol. 1 published in 2006.</note><note>"Mature content"---Vol. 5, cover p. 1.</note><classification authority="lcc">PN6790.J33 T37 2005</classification><classification authority="ddc" edition="22">741.5/952</classification><identifier type="isbn">9780345492333 (v. 1 : pbk.)</identifier><identifier type="isbn">9780345486226 (v. 2 : pbk.)</identifier><identifier type="isbn">0345486226 (v. 2 : pbk.)</identifier><identifier type="isbn">9780345486233 (v. 3 : pbk.)</identifier><identifier type="isbn">0345486234 (v. 3 : pbk.)</identifier><identifier type="isbn">9780345493224 (v. 4 : pbk.)</identifier><identifier type="isbn">034548679X (v. 4 : pbk.)</identifier><identifier type="isbn">9780345493231 (v. 5 :pbk)</identifier><identifier type="isbn">0345492323 (v. 5 : pbk.)</identifier><identifier type="isbn">9780345501707 (v. 8 : pbk.)</identifier><identifier type="isbn">9780345506719 (v. 9 : pbk.)</identifier><identifier type="isbn">9780345515858 (v. 11 : pbk.)</identifier><identifier type="lccn">2005904335</identifier><identifier type="oclc">ocm63257616</identifier><identifier type="oclc">63257616</identifier><relatedItem><location><url displayLabel="Publisher description">http://www.loc.gov/catdir/enhancements/fy0710/2005904335-d.html</url></location></relatedItem><recordInfo><descriptionStandard>aacr</descriptionStandard><recordContentSource authority="marcorg">IOS</recordContentSource><recordCreationDate encoding="marc">070116</recordCreationDate><recordChangeDate encoding="iso8601">20110120111835.0</recordChangeDate><recordIdentifier>14699176</recordIdentifier><recordOrigin>Converted from MARCXML to MODS version 3.4 using MARC21slim2MODS3-4.xsl (Revision 1.85 2013/03/07)</recordOrigin></recordInfo></mods>';
	
	// Set up the editor
	//VirtualRenderer = ace.require('ace/virtual_renderer').VirtualRenderer;
	EditSession = ace.require('ace/edit_session').EditSession;
	//Editor = ace.require('ace/editor').Editor;
	editor = ace.edit("ed1");
	editor.setTheme("ace/theme/eclipse");
    editor.getSession().setMode("ace/mode/xml");
    editor.getSession().setValue(xml);
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
	$.each(projs, function(i, proj) {
		$.each(proj, function(a, p) {
			f = findFileBlock(fid, p["project-files"]);
			if (typeof f != 'undefined') {
				// Found it.  Set the super var and exit this loop.
				file = f;
				foundFile = true;
				return;
			}
		})
		if (foundFile) { return; }
	});
	//alert(fBlock.filepath);
	
	if (file.isdir) {
		//alert( href.parent().find("ul").eq(0).attr('class') );
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
	//alert(fid);
	//alert(JSON.stringify(fileObj));
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

function getDir(dirtoget) {
	getdir = $.get("/directory/", { dir: dirtoget });
	getdir.done(function(data) { 
		fileObj = data;
		divcontents = $("#files");
		divcontents.empty();
		var ul = $('<ul class="open"></ul>');
		divcontents = divcontents.append(ul);
		fileObjToHTMLTree(fileObj, ul);
	});
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
	$.each(projs, function(i, proj) {
		
		divcontents = $("#files");
		divcontents.empty();
		var div = $('<div></div>');
		divcontents.append(div);
		
		$.each(proj, function(a, p) {
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
		})
	});
	/*
	 * getdir = $.get("/directory/", { dir: dirtoget });
	getdir.done(function(data) { 
		fileObj = data;
		divcontents = $("#files");
		divcontents.empty();
		var ul = $('<ul class="open"></ul>');
		divcontents = divcontents.append(ul);
		fileObjToHTMLTree(fileObj, ul);
	});
	*/
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
			editor.resize();
		} else {
			alert(JSON.stringify(href));
		}
	}

}
