exports.main = function (arguments){
  
    /* {"m_authid" : "22c5cfa7-9dea-4dd9-9f9d-eedf296852ae", "m_resourceid" : "364c14d3-03a4-441d-a7f1-49ff264c8815", "pin_temp" : "A0", "pin_hum" : "A2", "timer" : "5000", "autostart":"false"} */

    
    var pin_temp = arguments.pin_temp;
    var pin_hum = arguments.pin_hum;
    var timer = arguments.timer;
    var m_authid = arguments.m_authid;
    var m_resourceid = arguments.m_resourceid;
    
    var api = require('../plugin-apis');
    var position = api.getPosition();
    
    var linino = require('ideino-linino-lib');
    board = new linino.Board();

    
    board.connect(function() {
        
      setInterval(function(){

	var record = [];
	
	/*FOR TEMP SENSOR*/
	var ADCres = 1023.0;
	var Beta = 3950;		 
	var Kelvin = 273.15;	  
	var Rb = 10000;		       
	var Ginf = 120.6685;
	var temp_volt = board.analogRead(pin_temp);
	var Rthermistor = Rb * (ADCres / temp_volt - 1);
	var _temperatureC = Beta / (Math.log( Rthermistor * Ginf )) ;
	var temp = _temperatureC - Kelvin;
	
	
	/*FOR HUM SENSOR*/
	var degreesCelsius = temp; 
	var supplyVolt = 4.64;
	var HIH4030_Value = board.analogRead(pin_hum);
	var voltage = HIH4030_Value/1023. * supplyVolt; 
	var sensorRH = 161.0 * voltage / supplyVolt - 25.8;
	var relativeHumidity = sensorRH / (1.0546 - 0.0026 * degreesCelsius);  
	
	

	record.push({
	    Date: new Date().toISOString(),
	    Humidity: relativeHumidity,
	    Altitude: position.altitude,
	    Latitude: position.latitude, 
	    Longitude: position.longitude  
	});	

	
	api.sendToCKAN(m_authid, m_resourceid, record, function(payloadJSON){
    
	    console.log("PAYLOAD:\n" + payloadJSON);
	    console.log("Humidity " + relativeHumidity + " percent (with "+temp+" °C) sent to CKAN");
    
	});

	
      },timer);
      
    });
    
}