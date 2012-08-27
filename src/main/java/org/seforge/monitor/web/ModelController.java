package org.seforge.monitor.web;

import java.io.IOException;
import java.util.Date;
import java.util.List;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;

import org.seforge.monitor.domain.Resource;
import org.seforge.monitor.hqapi.HQProxy;
import org.seforge.monitor.manager.ResourceManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

import flexjson.JSONSerializer;
import flexjson.transformer.DateTransformer;

@RequestMapping("/model")
@Controller
public class ModelController {

	@Autowired
	private HQProxy proxy;

	@Autowired
	private ResourceManager resourceManager;

	@RequestMapping(value = "/getmodel", method = RequestMethod.GET)
	public ResponseEntity<String> getJsonModel(HttpServletRequest request) {
		HttpHeaders responseHeaders = new HttpHeaders();
		responseHeaders.add("Content-Type", "application/json");
		List<Resource> entities;
		entities = resourceManager.getAllVims();
		return new ResponseEntity<String>(new JSONSerializer()
				.exclude("*.class")
				.include("resourcePropertyValues")
				.exclude("resourcePropertyValues.resourcePropertyKey.resourcePrototype")
				.transform(new DateTransformer("MM/dd/yy"), Date.class)
				.serialize(entities), responseHeaders, HttpStatus.OK);

	}
	
	@RequestMapping(value = "/getchildren", method = RequestMethod.GET)
	public ResponseEntity<String> getChildren(@RequestParam("id") Integer id) {
		HttpHeaders responseHeaders = new HttpHeaders();
		responseHeaders.add("Content-Type", "application/json");
		Set<Resource> entities;
		entities = Resource.findResource(id).getChildren();
		return new ResponseEntity<String>(new JSONSerializer()
				.exclude("*.class")
				.include("resourcePropertyValues")
				.exclude("resourcePropertyValues.resourcePropertyKey.resourcePrototype")
				.transform(new DateTransformer("MM/dd/yy"), Date.class)
				.serialize(entities), responseHeaders, HttpStatus.OK);

	}
	
	//从HQ server处获得所有的资源的信息（包括resourceprototype、resourceproperty等），存到数据库中
	@RequestMapping(value = "/save", method = RequestMethod.GET)
	public ResponseEntity<String> saveResources(HttpServletRequest request) {
		HttpHeaders responseHeaders = new HttpHeaders();
		responseHeaders.add("Content-Type", "application/json");
		try {
			proxy.saveResources();
			return new ResponseEntity<String>("success", responseHeaders,
					HttpStatus.OK);
		} catch (IOException e) {
			return new ResponseEntity<String>(e.getMessage(), responseHeaders,
					HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

}
