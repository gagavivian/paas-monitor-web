package org.seforge.monitor.web;

import java.util.Date;
import java.util.List;

import org.hyperic.hq.hqapi1.types.LastMetricData;
import org.hyperic.hq.hqapi1.types.MetricData;
import org.seforge.monitor.domain.Metric;
import org.seforge.monitor.domain.Resource;
import org.seforge.monitor.domain.ResourceGroup;
import org.seforge.monitor.domain.ResourcePrototype;
import org.seforge.monitor.extjs.JsonObjectResponse;
import org.seforge.monitor.hqapi.HQProxy;
import org.seforge.monitor.manager.MetricManager;
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


@RequestMapping("/metrics")
@Controller
public class MetricController {
	@Autowired
	private HQProxy proxy;
	
	@Autowired
	private MetricManager metricManager;
	
	/*
	//thd PathVariable id is the id of a metric
    @RequestMapping(value = "/{id}/lastmetricdata", method = RequestMethod.GET)
    public ResponseEntity<String> listLastMetricData(@PathVariable("id") Integer id) {
    	HttpStatus returnStatus;
    	JsonObjectResponse response = new JsonObjectResponse();
    	if( id == null){
    		returnStatus = HttpStatus.BAD_REQUEST;
            response.setMessage("No Metric Id provided.");
            response.setSuccess(false);
            response.setTotal(0L);
    	}else{
    		try {
                Metric metric = Metric.findMetric(id);
                LastMetricData data = proxy.getLastMetricData(metric);     
                returnStatus = HttpStatus.OK;
                response.setMessage("Last Metric Data found");
                response.setSuccess(true);
                response.setTotal(1);
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
    
  //thd PathVariable id is the id of a resourcePrototype
   
    @RequestMapping(value = "/all", method = RequestMethod.GET)
    public ResponseEntity<String> listAllMetrics(@RequestParam("groupId") Integer groupId, @RequestParam("resourcePrototypeId") Integer resourcePrototypeId,
    		@RequestParam("start") Integer start, @RequestParam("limit") Integer limit ) {
    	HttpStatus returnStatus;
    	JsonObjectResponse response = new JsonObjectResponse();
    	if( groupId == null){
    		returnStatus = HttpStatus.BAD_REQUEST;
            response.setMessage("No ResourcePrototype Id provided.");
            response.setSuccess(false);
            response.setTotal(0L);
    	}else{
    		try {
                ResourcePrototype prototype = ResourcePrototype.findResourcePrototype(resourcePrototypeId);
                ResourceGroup group = ResourceGroup.findResourceGroup(groupId);
                List total = metricManager.getMetricsByResourcePrototypeAndGroup(prototype, group);
                List data = metricManager.getMetricsByResourcePrototypeAndGroup(prototype, group, start, limit);     
                returnStatus = HttpStatus.OK;
                response.setMessage("All Metric Templates found");
                response.setSuccess(true);
                response.setTotal(total.size());
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
    
    // request for the customed metrics
    @RequestMapping(value = "/customed", method = RequestMethod.GET)
    public ResponseEntity<String> listCustomedMetrics(@RequestParam("resourceId") Integer resourceId,
    		@RequestParam("start") Integer start, @RequestParam("limit") Integer limit ) {
    	HttpStatus returnStatus;
    	JsonObjectResponse response = new JsonObjectResponse();
    	if( resourceId == null){
    		returnStatus = HttpStatus.BAD_REQUEST;
            response.setMessage("No ResourcePrototype Id provided.");
            response.setSuccess(false);
            response.setTotal(0L);
    	}else{
    		try {
    			Resource resource = Resource.findResource(resourceId);
                ResourcePrototype prototype = resource.getResourcePrototype();
                ResourceGroup group = ResourceGroup.findResourceGroup(0);
                List total = metricManager.getMetricsByResourcePrototypeAndGroup(prototype, group);
                
                // 此处的方法需要修改成只返回用户定制的data的方法
                List data = metricManager.getEnabledMetrics(prototype, group, start, limit);     
                returnStatus = HttpStatus.OK;
                response.setMessage("All Metric Templates found");
                response.setSuccess(true);
                response.setTotal(total.size());
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
    
    // request for history data of some metric
    @RequestMapping(value = "/history", method = RequestMethod.GET)
    public ResponseEntity<String> listCustomedMetrics(@RequestParam("metricId") Integer metricId,@RequestParam("resourceId") Integer resourceId,
    		@RequestParam("start") Integer start, @RequestParam("limit") Integer limit ) {
    	HttpStatus returnStatus;
    	JsonObjectResponse response = new JsonObjectResponse();
    	if( metricId == null || resourceId == null){
    		returnStatus = HttpStatus.BAD_REQUEST;
            response.setMessage("No ResourcePrototype Id provided.");
            response.setSuccess(false);
            response.setTotal(0L);
    	}else{
    		try {
                long end = System.currentTimeMillis();
                long begin = end - (8 * 60 * 60 * 1000);
                MetricData data = proxy.getMetricData(Resource.findResource(resourceId), Metric.findMetric(metricId), begin, end);   
                returnStatus = HttpStatus.OK;
                response.setMessage("All Metric Templates found");
                response.setSuccess(true);
                response.setTotal(data.getDataPoint().size());
                response.setData(data.getDataPoint());
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
