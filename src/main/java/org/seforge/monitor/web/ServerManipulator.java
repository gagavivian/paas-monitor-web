package org.seforge.monitor.web;

import java.util.Date;

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
	@RequestMapping(value = "/addnewtomcat", method = RequestMethod.GET)
	public ResponseEntity<String> add(@RequestParam("ip") String ip,
			@RequestParam("jmxPort") String jmxPort,
			@RequestParam("path") String path,
			@RequestParam("servicename") String serviceName,
			@RequestParam("groupId") String groupId) {
		HttpStatus returnStatus;
		JsonObjectResponse response = new JsonObjectResponse();
		try {
			String jmxUrl = "service:jmx:rmi:///jndi/rmi://localhost:"+ jmxPort + "/jmxrmi";
			Integer returnNumber = rm.addNewServer(ip, jmxUrl, path,
					serviceName, groupId, "Apache Tomcat 7");
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
