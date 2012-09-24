package org.seforge.monitor.web;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import org.hyperic.hq.hqapi1.types.LastMetricData;
import org.seforge.monitor.domain.Metric;
import org.seforge.monitor.domain.ResourceGroup;
import org.seforge.monitor.manager.MetricManager;
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
import org.springframework.web.bind.annotation.RequestParam;

import flexjson.JSONSerializer;
import flexjson.transformer.DateTransformer;


@RequestMapping("/generate_metrics")
@Controller
public class GenerateMetric {
	
	@Autowired
	private HQProxy proxy;
	
	@Autowired
	private MetricManager metricManager;
    
  
    
  //thd PathVariable id is the id of a resourcePrototype
   
    @RequestMapping(method = RequestMethod.GET)
    public ResponseEntity<String> generateMetrics(@RequestParam("groupId") Integer groupId, @RequestParam("resourcePrototypeId") Integer resourcePrototypeId, @RequestParam("metrics") String metricsJson) {
    	
    	HttpStatus returnStatus;
    	JsonObjectResponse response = new JsonObjectResponse();
    	if( groupId == null){
    		returnStatus = HttpStatus.BAD_REQUEST;
            response.setMessage("No ResourcePrototype Id provided.");
            response.setSuccess(false);
            response.setTotal(0L);
    	}else{
    		try {

    	    	ArrayList<Metric> metrics = new ArrayList<Metric>(Metric.fromJsonArrayToMetrics(metricsJson));
    	    	
    	    	int len = metrics.size();
    	    	for (int i = 0; i < len; i ++) {
    	    		metrics.get(i).setResourceGroup(ResourceGroup.findResourceGroup(groupId));
    	    		metrics.get(i).setResourcePrototype(ResourcePrototype.findResourcePrototype(resourcePrototypeId));
    	    	}
    	    	
    	    	metricManager.saveAndUpdateMetrics(metrics);
    	    	
                returnStatus = HttpStatus.OK;
                response.setMessage("All Metric Templates found");
                response.setSuccess(true);
                response.setTotal(0L);
                response.setData(null);
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
