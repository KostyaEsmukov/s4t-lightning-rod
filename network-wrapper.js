
nconf = require('nconf');
nconf.file ({file: 'settings.json'});

log4js = require('log4js');
log4js.loadAppender('file');
logfile = nconf.get('config:log:logfile');
log4js.addAppender(log4js.appenders.file(logfile));    


//service logging configuration: "network-wrapper"
var logger = log4js.getLogger('network-wrapper');


process.once('message', function(message) {
  
      var spawn = require('child_process').spawn;
      
      //MESSAGE RECEIVED FROM IOTRONIC:
      /*
       	    var input_message = {
                "args": args,
		"socatBoard_ip": socatBoard_ip,
                "basePort": basePort,
		"bSocatNum": bSocatNum,
		"socatClient": socatClient
            }
      */

      
      //NEW-net
      var basePort = message.basePort;
      var socatBoard_ip = message.socatBoard_ip;
      var socatServer_ip = message.socatServer_ip;
      //var logger = log4js.getLogger('network-wrapper');
      
      logger.info("[NETWORK-MANAGER] - NetWRAPPER loaded!");
      logger.info("[NETWORK-MANAGER] - SOCAT starting...");
      
	    //NEW-net
	    //socat -d -d \ TCP-L:<basePort>,bind=localhost,reuseaddr,forever,interval=10 \ TUN:<socatBoard_ip>,tun-name=socat0,iff-up &
	    var socatProcess = spawn('socat', ['-d','-d','TCP-L:'+ basePort +',bind=localhost,reuseaddr,forever,interval=10','TUN:'+socatBoard_ip+'/31,tun-name=socat0,up'])
	    logger.info('SOCAT COMMAND: socat -d -d TCP-L:'+ basePort +',bind=localhost,reuseaddr,forever,interval=10 TUN:'+socatBoard_ip+'/31,tun-name=socat0,up' );
	    
	    logger.info("--> SOCAT PID: "+socatProcess.pid);
	    
            socatProcess.stdout.on('data', function (data) {
                logger.info('SOCAT - stdout: ' + data);
            });
	    
            socatProcess.stderr.on('data', function (data) {
	      
                var textdata = 'stderr: ' + data;
                logger.info("SOCAT - "+textdata);
		
		if(textdata.indexOf("starting data transfer loop") > -1) {
		  
		      //NEW-net
		      //ip link set $TUNNAME up
		      spawn('ifconfig',['socat0','up']);
		      
		      logger.info('NETWORK COMMAND: ifconfig socattun socat0 up');
		      
		      logger.info('SOCAT TUNNEL SUCCESSFULLY ESTABLISHED!');
		      
		      
		      //NEW-net: INIZIALIZZARE IL TUNNEL GRE CONDIVISO
		      //ip link add gre-lr0 type gretap remote <serverip> local <boadip>
		      //ip link set gre-lr0 up		    
		      var greIface = spawn('ip',['link','add','gre-lr0','type', 'gretap', 'remote', socatServer_ip, 'local', socatBoard_ip]); 
		      logger.info('GRE IFACE CREATION: ip link add gre-lr0 type gretap remote '+ socatServer_ip+' local '+socatBoard_ip);
		      
		      greIface.stdout.on('data', function (data) {
			  logger.info('--> GRE IFACE CREATION stdout: ' + data);
		      });
		      greIface.stderr.on('data', function (data) {
			  logger.info('--> GRE IFACE CREATION stderr: ' + data);
		      });
		      greIface.on('close', function (code) {
			
			  logger.info("--> GRE IFACE CREATED!");
			  
			  //ip link set gre-lr<port> up
			  var greIface_up = spawn('ip',['link','set','gre-lr0','up']); 
			  logger.info('GRE IFACE UP: ip link set gre-lr0 up');
			  
			  greIface_up.stdout.on('data', function (data) {
			      logger.info('--> GRE IFACE UP stdout: ' + data);
			  });
			  greIface_up.stderr.on('data', function (data) {
			      logger.info('--> GRE IFACE UP stderr: ' + data);
			  });
			  greIface_up.on('close', function (code) {
			    
			      logger.info("--> GRE IFACE UP!");
			      //logger.info('TUNNELS CONFIGURATION BOARD SIDE COMPLETED!');
			      
			      //SEND MESSAGE TO IOTRONIC
			      process.send({ name: "socat", status: "complete" , logmsg: "tunnels configured"});
			      
			      			    
			      
			  });
			  
		      });
		    
		  
		  
		}
		
            });
	    
	    
	    
	    
            socatProcess.on('close', function (code) { //in case of disconnection, delete all interfaces
                logger.info('SOCAT - process exited with code ' + code);
				
            }); 
	    
	    //NEW-net
	    process.send({ name: "socat", status: "alive" , logmsg: "I'm alive!"});
    
	    
});





process.on('exit', function(){

       process.send({ name: "socat", level: "warn" , logmsg: 'SOCAT Process terminated!'}); 
});


