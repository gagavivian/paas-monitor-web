package org.seforge.monitor.web;

import java.util.Date;
import java.util.List;

import org.hyperic.hq.hqapi1.types.LastMetricData;
import org.seforge.monitor.domain.Metric;
import org.seforge.monitor.domain.ResourcePrototype;
import org.seforge.monitor.extjs.JsonObjectResponse;
import org.seforge.monitor.hqapi.HQProxy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import flexjson.JSONSerializer;
import flexjson.transformer.DateTransformer;


@RequestMapping("/generate_metrics")
@Controller
public class GenerateMetric {
	/*
	@Autowired
	private HQProxy proxy;
	
	@Autowired
	private MetricManager matricManager;
    
    
  //thd PathVariable id is the id of a resourcePrototype
   
    @RequestMapping(method = RequestMethod.GET)
    public ResponseEntity<String> generateMetrics(@PathVariable("id") Integer id) {
    	HttpStatus returnStatus;
    	JsonObjectResponse response = new JsonObjectResponse();
    	if( id == null){
    		returnStatus = HttpStatus.BAD_REQUEST;
            response.setMessage("No ResourcePrototype Id provided.");
            response.setSuccess(false);
            response.setTotal(0L);
    	}else{
    		try {
                ResourcePrototype prototype = ResourcePrototype.findResourcePrototype(id);
                List data = proxy.getMetricTemplatesByResourcePrototype(prototype.getName());     
                returnStatus = HttpStatus.OK;
                response.setMessage("All Metric Templates found");
                response.setSuccess(true);
                response.setTotal(data.size());
                response.setData(data);
            } catch (Exception e) {
            	returnStatus = HttpStatus.INTERNAL_SERVER_ERROR;
                response.setMessage(e.getMessage());
                response.setSuccess(false);
                response.setTotal(0L);
            }
    	}        
        return new ResponseEntity<String>(new JSONSerializer().exclude("*.class").transform(new DateTransformer("MM/dd/yy"), Date.class).serialize(response), returnStatus);
    } 
    */   
}
