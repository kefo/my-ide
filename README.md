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



