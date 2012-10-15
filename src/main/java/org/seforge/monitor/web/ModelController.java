package org.seforge.monitor.web;

import java.util.Date;
import java.util.List;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;

import org.seforge.monitor.domain.Resource;
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
	private ResourceManager resourceManager;

	@RequestMapping(value = "/getmodel", method = RequestMethod.GET)
	public ResponseEntity<String> getJsonModel(@RequestParam("groupId") Integer groupId) {
		HttpHeaders responseHeaders = new HttpHeaders();
		responseHeaders.add("Content-Type", "application/json");
		List<Resource> entities;
		entities = resourceManager.getPhymsByGroup(groupId);
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
}
