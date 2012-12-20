package org.seforge.monitor.web;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.List;
import java.util.Set;
import org.seforge.monitor.domain.Metric;
import org.seforge.monitor.domain.MetricTemplate;
import org.seforge.monitor.domain.Resource;
import org.seforge.monitor.domain.ResourceGroup;
import org.seforge.monitor.domain.Vim;
import org.seforge.monitor.exception.DuplicateEntityException;
import org.seforge.monitor.exception.NotMonitoredException;
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
        	Resource exist = Resource.findPhymByIp(ip);
        	if(exist==null){    
        		String phymName = "UNknown";
                List<Vim> vims = vsphereService.getVims(ip, username, password, phymName);                
                returnStatus = HttpStatus.CREATED;
                response.setMessage(phymName);
                response.setSuccess(true);
                response.setTotal(vims.size());
                response.setData(vims);
        	}else{
        		throw new DuplicateEntityException("Resource of "+ ip + " has existed!");
        	}        	
        } catch (Exception e) {        	
        	e.printStackTrace();
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
    	Collection<Vim> vims = Vim.fromJsonArrayToVims(json);
    	List<Resource> added = new ArrayList<Resource>();    	
    	for(Vim vim : vims){
    		Resource parent = Resource.findResource(vim.getParentId());
			org.hyperic.hq.hqapi1.types.Resource vimResource;
			try {
				vimResource = proxy.getVimResource(vim.getIp(), true, true);
				Resource result = proxy.saveResource(vimResource, parent, true);
				added.add(result);
			} catch (Exception e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}			
    	}
    	returnStatus = HttpStatus.OK;
        response.setMessage("Vim saved successfully");
        response.setSuccess(true);
        response.setTotal(added.size());
        response.setData(added);
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
                List<MetricTemplate> templates = resource.getResourcePrototype().getMetricTemplates();           
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
    
    @RequestMapping(value = "/propogateMetricTemplates", method = RequestMethod.GET)
    public ResponseEntity<String> propogate() {
    	HttpStatus returnStatus;    	
    	proxy.propogateMetricTemplatesForAll();
    	returnStatus = HttpStatus.OK;        
        return new ResponseEntity<String>("Propogate Successfully!", returnStatus);
    }
    
    
    @RequestMapping(value = "/allocateGroup", method = RequestMethod.GET)
    public ResponseEntity<String> allocate(@RequestParam("resourceId") Integer resourceId, @RequestParam("groupId") Integer groupId) {
    	HttpStatus returnStatus;
    	Resource r = Resource.findResource(resourceId);
    	ResourceGroup g = ResourceGroup.findResourceGroup(groupId);
    	if(g == null){
    		g = new ResourceGroup();
    		g.setId(groupId);
    		g.persist();
    	}
    	r.getResourceGroups().add(g);  
    	r.merge();
    	
    	returnStatus = HttpStatus.OK;        
        return new ResponseEntity<String>("Propogate Successfully!", returnStatus);
    }
    
 
}
