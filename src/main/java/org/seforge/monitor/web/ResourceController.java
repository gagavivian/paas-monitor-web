package org.seforge.monitor.web;

import java.io.IOException;
import java.util.Date;
import java.util.List;
import java.util.Set;

import org.seforge.monitor.domain.Metric;
import org.seforge.monitor.domain.MetricTemplate;
import org.seforge.monitor.domain.Resource;
import org.seforge.monitor.domain.ResourcePropertyKey;
import org.seforge.monitor.domain.ResourcePropertyValue;
import org.seforge.monitor.domain.ResourcePrototype;
import org.seforge.monitor.domain.Vim;
import org.seforge.monitor.extjs.JsonObjectResponse;
import org.seforge.monitor.hqapi.HQProxy;
import org.seforge.monitor.service.VsphereService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

import flexjson.JSONSerializer;
import flexjson.transformer.DateTransformer;

@RequestMapping("/resources")
@Controller
public class ResourceController {
	
	@Autowired
	private HQProxy proxy;
	
	@Autowired
	private VsphereService vsphereService;
	
    @RequestMapping(value = "createphym", method = RequestMethod.POST)
    public ResponseEntity<String> createFromJson(@RequestParam("ip") String ip, @RequestParam("username") String username, 
    		@RequestParam("password") String password) {
        HttpStatus returnStatus;
        JsonObjectResponse response = new JsonObjectResponse();
        try {
        	ResourcePrototype resourcePrototype = ResourcePrototype.findResourcePrototypeByName("VMware Vsphere");
            Resource resource = new Resource();
            resource.setName(ip);
            resource.setTypeId(resourcePrototype.getTypeId());
            resource.setResourcePrototype(resourcePrototype);
            resource.persist();
            
            ResourcePropertyValue ipValue = new ResourcePropertyValue();
            ResourcePropertyKey ipKey = ResourcePropertyKey.findKey("Ip", resourcePrototype);
            ipValue.setResourcePropertyKey(ipKey);
            ipValue.setValue(ip);
            ipValue.setResource(resource);
            ipValue.persist();
            
            ResourcePropertyValue userValue = new ResourcePropertyValue();
            ResourcePropertyKey userKey = ResourcePropertyKey.findKey("Username", resourcePrototype);
            userValue.setResourcePropertyKey(userKey);
            userValue.setValue(username);
            userValue.setResource(resource);
            userValue.persist();
            
            ResourcePropertyValue pwValue = new ResourcePropertyValue();
            ResourcePropertyKey pwKey = ResourcePropertyKey.findKey("Ip", resourcePrototype);
            pwValue.setResourcePropertyKey(pwKey);
            pwValue.setValue(password);
            pwValue.setResource(resource);
            pwValue.persist();   
            
            List<Vim> vims = vsphereService.getVims(ip, username, password, resource);
            
            returnStatus = HttpStatus.CREATED;
            response.setMessage(resource.getName());
            response.setSuccess(true);
            response.setTotal(vims.size());
            response.setData(vims);
        } catch (Exception e) {        	
        	returnStatus = HttpStatus.INTERNAL_SERVER_ERROR;        	
            response.setMessage(e.getMessage());
            response.setSuccess(false);
            response.setTotal(0L);
        }
        return new ResponseEntity<String>(new JSONSerializer().exclude("*.class").transform(new DateTransformer("MM/dd/yy"), Date.class).serialize(response), returnStatus);
    }
    
    @RequestMapping(value = "/vim", method = RequestMethod.POST)
    public ResponseEntity<String> addVim(@RequestBody String json) {
    	HttpStatus returnStatus;
    	JsonObjectResponse response = new JsonObjectResponse();
    	Vim vim = Vim.fromJsonToVim(json);    	
    	try {
			Resource parent = Resource.findResource(vim.getParentId());
			Resource result = proxy.saveResource(proxy.getPlatformResource(vim.getIp(), true, true), parent, true);
			returnStatus = HttpStatus.OK;
            response.setMessage("Vim saved successfully");
            response.setSuccess(true);
            response.setTotal(1);
            response.setData(result);
		} catch (IOException e) {
			returnStatus = HttpStatus.INTERNAL_SERVER_ERROR;
            response.setMessage("Cannot find vim resource.");
            response.setSuccess(false);
            response.setTotal(0L);
		}
        return new ResponseEntity<String>(new JSONSerializer().exclude("*.class").transform(new DateTransformer("MM/dd/yy"), Date.class).serialize(response), returnStatus);

    }

	
    @RequestMapping(value = "/{id}/metrictemplates", method = RequestMethod.GET)
    public ResponseEntity<String> listMetricTemplates(@PathVariable("id") Integer id) {
    	HttpStatus returnStatus;
    	JsonObjectResponse response = new JsonObjectResponse();
    	if( id == null){
    		returnStatus = HttpStatus.BAD_REQUEST;
            response.setMessage("No Resource Id provided.");
            response.setSuccess(false);
            response.setTotal(0L);
    	}else{
    		try {
                Resource resource = Resource.findResource(id);
                Set<MetricTemplate> templates = resource.getResourcePrototype().getMetricTemplates();           
                returnStatus = HttpStatus.OK;
                response.setMessage("Metric Templates found");
                response.setSuccess(true);
                response.setTotal(templates.size());
                response.setData(templates);
            } catch (Exception e) {
            	returnStatus = HttpStatus.INTERNAL_SERVER_ERROR;
                response.setMessage(e.getMessage());
                response.setSuccess(false);
                response.setTotal(0L);
            }
    	}        
        return new ResponseEntity<String>(new JSONSerializer().exclude("*.class").exclude("data.resourcePrototype").transform(new DateTransformer("MM/dd/yy"), Date.class).serialize(response), returnStatus);
    }
    
    
    @RequestMapping(value = "/{id}/metrics", method = RequestMethod.GET)
    public ResponseEntity<String> listMetrics(@PathVariable("id") Integer id) {
    	HttpStatus returnStatus;
    	JsonObjectResponse response = new JsonObjectResponse();
    	if( id == null){
    		returnStatus = HttpStatus.BAD_REQUEST;
            response.setMessage("No Resource Id provided.");
            response.setSuccess(false);
            response.setTotal(0L);
    	}else{
    		try {
                Resource resource = Resource.findResource(id);
                Set<Metric> metrics = resource.getMetrics();           
                returnStatus = HttpStatus.OK;
                response.setMessage("Metric Templates found");
                response.setSuccess(true);
                response.setTotal(metrics.size());
                response.setData(metrics);
            } catch (Exception e) {
            	returnStatus = HttpStatus.INTERNAL_SERVER_ERROR;
                response.setMessage(e.getMessage());
                response.setSuccess(false);
                response.setTotal(0L);
            }
    	}        
        return new ResponseEntity<String>(new JSONSerializer().exclude("*.class").transform(new DateTransformer("MM/dd/yy"), Date.class).serialize(response), returnStatus);
    }

}
