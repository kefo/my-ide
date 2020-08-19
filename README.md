# My-IDE 

My-IDE is an in-browser [Integrated Development Environment](http://en.wikipedia.org/wiki/Integrated_development_environment) 
designed to do the basics.  It's minimal; that's the way I wanted it.

This type of thing isn't new.  It's been done before, but I needed an excuse to 
become familiar with [node.js](http://nodejs.org/) and spend a little time 
with Javascript.  There are a few things to do along with some refactoring, 
but it suits my needs.  More importantly, I wanted one IDE 
that could accommodate any number of mark-ups, most notably XQuery.

This project makes use of [ace-builds](https://github.com/ajaxorg/ace-builds/), which
is the ace.io Cloud9 editor.

### Installing

```bash
nodeenv ideenv
git clone https://github.com/kefo/my-ide.git
cd my-ide/
npm install
cd public_html/static/js/
git clone https://github.com/ajaxorg/ace-builds.git
cd ..
cd ..
ls -l
cp config-default.json config.json
cd ..
./bin/myide start
```

The above will start the application on port 8300.  You can, if so desired, 
create a `.env` file in the main directory and configure your own port:

```bash
vi .env
```

Contents of .env:
```bash
PORT=8301
```

The above would start the application on port 8301.

### config.json

The default [`config-default.json`](public_html/config-default.json) file shows
the most basic usage.  Three things:
1. It is important to bear in mind that directories MUST end in slashes.  
2. If using `my-ide` on a Windows machine, the paths need to be properly escaped.
3. Ignoring directories with lots of unimportant files (with respect to code creation/editing) is strongly encouraged.

Here is an example config object for use on Windows.  It references the `my-ide` 
project and `lds-id`:

```json
{
"editor":
	{
		"fontsize": 12,
		"theme": "eclipse"
	},
"projects": 
	[
		{
			"project-name": "LDS-ID",
			"project-source": "C:\\Users\\kevinford\\work\\lds-id\\",
			"ignore-dirs": [
			    ".git",
			    "load",
			    "source"
			 ]
		},
		{
			"project-name": "My IDE",
			"project-source": "C:\\Users\\kevinford\\work\\ideenv\\my-ide\\",
			"ignore-dirs": [
			    ".git",
			    "node_modules",
			    "ace-builds"
			 ]
		}
	]
}
```

The same for a Linux environment:

```json
{
"editor":
	{
		"fontsize": 12,
		"theme": "eclipse"
	},
"projects": 
	[
		{
			"project-name": "lds-id",
			"project-source": "/marklogic/data/kefo/work/lds-id/",
			"ignore-dirs": [
                		".git",
                		".github",
                		"marc-lcc",
                		"lcdgt",
                		"lcmpt",
                		"names",
                		"lcsh",
                		"bibframe2marc"
			 ]
		},
		{
			"project-name": "My IDE",
			"project-source": "/marklogic/data/kefo/ideenv/my-ide/",
			"ignore-dirs": [
                		".git",
                		"node_modules",
                		"ace-builds"
			 ]
		}
	]

}
```
