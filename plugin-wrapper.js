/*
*				                  Apache License
*                           Version 2.0, January 2004
*                        http://www.apache.org/licenses/
*
*      Copyright (c) 2014 2015 2016 Dario Bruneo, Francesco Longo, Giovanni Merlino, Andrea Rocco Lotronto, Nicola Peditto
* 
*/

var plugin_name;
var plugin_json;

var fs = require('fs');
var outputFilename = './plugins.json';

process.once('message', function(message) {
  
    plugin_name = message.plugin_name;
    plugin_json = message.plugin_json;

    
    if (fs.existsSync('./plugins/' + plugin_name + '.js') === true){
      
        var plugin = require('./plugins/' + plugin_name);

        process.send({ name: plugin_name, level: "info" , logmsg: "I'm alive!"});

        process.send({ name: plugin_name, level: "info" , logmsg: "starting..."});

        process.send({ name: plugin_name, status: "alive"});

        plugin.main(plugin_json);
      
    }
    else{
      
      process.send({ name: plugin_name, level: "warn" , logmsg: "plugin source file does not exist!"});
      
    }
    
});

process.on('exit', function(){
    
    process.send({ name: plugin_name, level: "warn" , logmsg: 'Process terminated: putting ' + plugin_name + ' to off'});
    
    try{
        //Reading the plugin configuration file
        var pluginsConf = JSON.parse(fs.readFileSync(outputFilename, 'utf8'));
    }
    catch(err){
	    process.send({ name: plugin_name, level: "error" , logmsg: 'Error parsing JSON file ./plugins.json'});
    }

    pluginsConf.plugins[plugin_name].status = "off";
    pluginsConf.plugins[plugin_name].pid = "";

    //updates the JSON file
    fs.writeFileSync(outputFilename, JSON.stringify(pluginsConf, null, 4));
    
});


