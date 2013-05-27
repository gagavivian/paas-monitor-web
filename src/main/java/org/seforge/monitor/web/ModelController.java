package org.seforge.monitor.web;

import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.List;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;

import org.seforge.monitor.domain.Resource;
import org.seforge.monitor.domain.ResourceGroup;
import org.seforge.monitor.domain.ResourcePrototype;
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
		if(groupId == 1){
			entities = resourceManager.getAllPhyms();
		}else{
			entities = resourceManager.getAppServersByGroup(groupId);
		}		
		for(Resource r : entities){
			r.setChildrenCount(r.getChildren().size());
		}
		return new ResponseEntity<String>(new JSONSerializer()
				.exclude("*.class")
				.exclude("resourcePropertyValues")
				.exclude("resourcePropertyValues.resourcePropertyKey.resourcePrototype")				
				.transform(new DateTransformer("MM/dd/yy"), Date.class)
				.serialize(entities), responseHeaders, HttpStatus.OK);

	}
	
	@RequestMapping(value = "/getchildren", method = RequestMethod.GET)
	public ResponseEntity<String> getChildren(@RequestParam("id") Integer id, @RequestParam("resourcePrototypeId") Integer resourcePrototypeId, @RequestParam("parentId") Integer parentId, @RequestParam("groupId") Integer groupId) {
		HttpHeaders responseHeaders = new HttpHeaders();
		responseHeaders.add("Content-Type", "application/json");
		Collection<Resource> entities;
		//如果是要获取apache的孩子节点
		if(resourcePrototypeId == 11){
			Collection<Resource> original = Resource.findResource(id).getChildren();
			entities = new ArrayList<Resource>();
			for(Resource r : original){
				ResourceGroup g = ResourceGroup.findResourceGroup(groupId);
				if(r.getResourceGroups().contains(g)){
					entities.add(r);
					r.setChildrenCount(r.getChildren().size());
				}
				
			}
		}else{
			if(id !=null){
				entities = Resource.findResource(id).getChildren();
			}else{
				entities = Resource.findResourceByResourcePrototypeAndParent(ResourcePrototype.findResourcePrototype(resourcePrototypeId),  Resource.findResource(parentId));
			}		
			for(Resource r : entities){
				r.setChildrenCount(r.getChildren().size());
			}
		}
		
		return new ResponseEntity<String>(new JSONSerializer()
				.exclude("*.class")
				.include("resourcePropertyValues")				
				.exclude("resourcePropertyValues.resourcePropertyKey.resourcePrototype")
				.transform(new DateTransformer("MM/dd/yy"), Date.class)
				.serialize(entities), responseHeaders, HttpStatus.OK);

	}
	
	@RequestMapping(value = "/savemodel", method = RequestMethod.POST)
	public ResponseEntity<String> saveModel(@RequestParam("content") String content, @RequestParam("groupId") String id, HttpServletRequest request) {		
		FileWriter fw;
		try {
			String path = request.getRealPath("/");
			System.out.println(path);
			fw = new FileWriter(path + "/" + id + "-model.xml");
			fw.write(content,0,content.length());  
			fw.flush(); 
			fw.close();
			return new ResponseEntity<String>("ok", HttpStatus.OK);
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			return new ResponseEntity<String>("ok", HttpStatus.INTERNAL_SERVER_ERROR);
		}		
		
	}
}
