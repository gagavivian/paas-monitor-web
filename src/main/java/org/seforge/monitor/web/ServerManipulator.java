package org.seforge.monitor.web;

import java.util.Date;

import org.seforge.monitor.domain.Resource;
import org.seforge.monitor.extjs.JsonObjectResponse;
import org.seforge.monitor.manager.ResourceManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

import flexjson.JSONSerializer;
import flexjson.transformer.DateTransformer;

@RequestMapping("/serverManipulator")
@Controller
public class ServerManipulator {

	@Autowired
	ResourceManager rm;
	
	/*
	@RequestMapping(value = "/deleteserver", method = RequestMethod.GET)
	public ResponseEntity<String> hello() {
		System.out.println("OK");
		return new ResponseEntity<String>("HELLO", HttpStatus.INTERNAL_SERVER_ERROR);
	}
	*/
	

	
	//serverManipulator/addnewtomcat?ip=192.168.4.242&jmxPort=21711&path=E:\sasep\jsp\tomcat7_21411&servicename=tomcat7_21411&groupId=100
	@RequestMapping(value = "/addnewtomcat", method = RequestMethod.POST)
	public ResponseEntity<String> add(@RequestParam("ip") String ip,
			@RequestParam("jmxPort") String jmxPort,
			@RequestParam("path") String path,
			@RequestParam("servicename") String serviceName
			//@RequestParam("groupId") String groupId
			) {
		HttpStatus returnStatus;
		JsonObjectResponse response = new JsonObjectResponse();
		try {
			String groupId="100";
			Integer returnNumber = rm.addNewServer(ip, jmxPort, path,
					serviceName, groupId, "Apache Tomcat 7.0");			
			if (returnNumber == -1) {
				returnStatus = HttpStatus.INTERNAL_SERVER_ERROR;
				response.setMessage("New server creating failed!");
				response.setSuccess(false);
				response.setTotal(0L);
			} else {
				returnStatus = HttpStatus.OK;
				response.setMessage("New server created!");
				response.setSuccess(true);
				response.setTotal(1L);
				response.setData(returnNumber);
			}
		} catch (Exception e) {
			e.printStackTrace();
			returnStatus = HttpStatus.INTERNAL_SERVER_ERROR;
			response.setMessage("New server creating failed!");
			response.setSuccess(false);
			response.setTotal(0L);
		}
		return new ResponseEntity<String>(new JSONSerializer()
				.exclude("*.class").exclude("data.resourcePrototype")
				.transform(new DateTransformer("MM/dd/yy"), Date.class)
				.serialize(response), returnStatus);
	}
	
	// /serverManipulator/addapache?ip=192.168.4.179&port=80&path=E:\Server\wamp\bin\apache\Apache2.2.21&servicename=wampapache&groupId=100
	@RequestMapping(value="/addapache", method = RequestMethod.GET)
	public ResponseEntity<String> addApache(@RequestParam("ip") String ip,
			@RequestParam("port") String port,
			@RequestParam("path") String path,
			@RequestParam("servicename") String serviceName,
			@RequestParam("groupId") String groupId) {
		HttpStatus returnStatus;
		JsonObjectResponse response = new JsonObjectResponse();
		try {
			path += "\\conf\\httpd.conf";
			Integer returnNumber = rm.addApache(ip, port, path, serviceName, groupId, "Apache httpd");
			if (returnNumber == -1) {
				returnStatus = HttpStatus.INTERNAL_SERVER_ERROR;
				response.setMessage("New server creating failed!");
				response.setSuccess(false);
				response.setTotal(0L);
			} else {
				returnStatus = HttpStatus.OK;
				response.setMessage("New server created!");
				response.setSuccess(true);
				response.setTotal(1L);
				response.setData(returnNumber);
			}
		} catch (Exception e) {
			e.printStackTrace();
			returnStatus = HttpStatus.INTERNAL_SERVER_ERROR;
			response.setMessage("New server creating failed!");
			response.setSuccess(false);
			response.setTotal(0L);
		}
		return new ResponseEntity<String>(new JSONSerializer()
				.exclude("*.class").exclude("data.resourcePrototype")
				.transform(new DateTransformer("MM/dd/yy"), Date.class)
				.serialize(response), returnStatus);
	}

	// url:   /servermanipulator/addapacheapp?id=2563&dir=homework1&type=Apache+Html+App
	@RequestMapping(value = "/addapacheapp", method = RequestMethod.GET)
	public ResponseEntity<String> addApacheApp(@RequestParam("id") String id, @RequestParam("dir") String dir, @RequestParam("type") String type) {
		HttpStatus returnStatus;
		JsonObjectResponse response = new JsonObjectResponse();
		try {
			rm.addApacheApp(id, dir, type);
			returnStatus = HttpStatus.OK;
			response.setMessage("Apache app created!");
			response.setSuccess(true);
			response.setTotal(0L);
		} catch (Exception e) {
			returnStatus = HttpStatus.INTERNAL_SERVER_ERROR;
			response.setMessage("Apache app deleting failed!");
			response.setSuccess(false);
			response.setTotal(0L);
		}
		return new ResponseEntity<String>(new JSONSerializer()
				.exclude("*.class").exclude("data.resourcePrototype")
				.transform(new DateTransformer("MM/dd/yy"), Date.class)
				.serialize(response), returnStatus);
	}
	
	// url:  /serverManipulator/deleteserver?id=2563
	@RequestMapping(value = "/deleteserver", method = RequestMethod.GET)
	public ResponseEntity<String> delete(@RequestParam("id") String id) {
		HttpStatus returnStatus;
		JsonObjectResponse response = new JsonObjectResponse();
		try {
			rm.deleteServer(id);
			returnStatus = HttpStatus.OK;
			response.setMessage("Server deleted!");
			response.setSuccess(true);
			response.setTotal(0L);
		} catch (Exception e) {
			returnStatus = HttpStatus.INTERNAL_SERVER_ERROR;
			response.setMessage("Server deleting failed!");
			response.setSuccess(false);
			response.setTotal(0L);
		}
		return new ResponseEntity<String>(new JSONSerializer()
				.exclude("*.class").exclude("data.resourcePrototype")
				.transform(new DateTransformer("MM/dd/yy"), Date.class)
				.serialize(response), returnStatus);
	}
}
