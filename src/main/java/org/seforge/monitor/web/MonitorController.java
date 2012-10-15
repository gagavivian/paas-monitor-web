package org.seforge.monitor.web;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.Date;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.DefaultHttpClient;
import org.seforge.monitor.domain.ApacheSnap;
import org.seforge.monitor.extjs.JsonObjectResponse;
import org.seforge.monitor.utils.TimeUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

import flexjson.JSONSerializer;
import flexjson.transformer.DateTransformer;

@RequestMapping("/monitor/**")
@Controller
public class MonitorController {	
	/*
	//To view the page: http://localhost:8080/PaaSMonitor/monitor?ip=192.168.4.168&jmxPort=8999&contextName=doc
    @RequestMapping(method = RequestMethod.GET)
    public String get(@RequestParam("ip") String ip,
			@RequestParam("jmxPort") String jmxPort, @RequestParam("contextName") String contextName) {
    	return "monitor/index";
    }
    
    @RequestMapping(value = "/snap", method = RequestMethod.GET)
    public ResponseEntity<String>  getSnap(@RequestParam("ip") String ip,
			@RequestParam("jmxPort") String jmxPort,  @RequestParam("contextName") String contextName) {
    	JsonObjectResponse response = new JsonObjectResponse();
    	HttpStatus returnStatus;
    	JmxAppServer appServer = JmxAppServer.findJmxAppServerByIpAndJmxPort(ip, jmxPort);
    	if(appServer == null){
    		appServer = new JmxAppServer();
    		appServer.setIp(ip);
    		appServer.setJmxPort(jmxPort);   		
    		try {
				appServer.init();
			} catch (Exception e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
    		appServer.persist();    		
    	}
    	JmxAppInstance appInstance = JmxAppInstance.findAppInstanceByAppServerAndContextName(appServer, contextName);
    	if(appInstance == null){
    		appInstance = new JmxAppInstance();
    		appInstance.setName(contextName);
    		appInstance.setAppServer(appServer);
    		appInstance.persist();    		
    	}
    	
    	try{
    		AppInstanceSnap snap = monitorService.getLatestSnap(appInstance);
    		response.setMessage("AppInstanceSnap obtained.");
    		response.setSuccess(true);
    		response.setTotal(1L);
    		response.setData(snap);
    		returnStatus = HttpStatus.OK;
    	}catch(Exception e){
    		response.setMessage(e.getMessage());
    		response.setSuccess(false);
    		response.setTotal(0L);    	
    		returnStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    	}   	
        return new ResponseEntity<String>(new JSONSerializer().exclude("*.class").transform(new DateTransformer("MM/dd/yy-HH:mm:ss"), Date.class).serialize(response), returnStatus);
    }

    */
	
	
	@RequestMapping(value = "/apachesnap", method = RequestMethod.GET)
	public ResponseEntity<String> getApacheSnap(@RequestParam("ip") String ip,
			@RequestParam("httpPort") String httpPort) {
		JsonObjectResponse response = new JsonObjectResponse();
		HttpStatus returnStatus;
		
		try {			
			ApacheSnap snap = takeApacheSnap(ip, httpPort);			
			snap.setStatus("STARTED");
			response.setMessage("AppInstanceSnap obtained.");
			response.setSuccess(true);
			response.setTotal(1L);
			response.setData(snap);
			returnStatus = HttpStatus.OK;
		} catch (Exception e) {
			response.setMessage(e.getMessage());
			response.setSuccess(false);
			response.setTotal(0L);
			returnStatus = HttpStatus.INTERNAL_SERVER_ERROR;
		}

		return new ResponseEntity<String>(
				new JSONSerializer()
						.exclude("*.class")
						.transform(new DateTransformer("MM/dd/yy-HH:mm:ss"),
								Date.class).serialize(response), returnStatus);
	}
	
	
	public ApacheSnap takeApacheSnap(String ip, String port) throws IOException {
		ApacheSnap snap = new ApacheSnap();		
		String[] autoStatuses = getLinesFromStatus(ip, port,1, 8).split("\n");
		snap.setTotalAccessCount(Integer
				.valueOf(findNumericValue(autoStatuses[0])));
		snap.setTotalKBytes(Long.valueOf(findNumericValue(autoStatuses[1])));
		snap.setUptime(Long.valueOf(findNumericValue(autoStatuses[2])));
		snap.setReadableUptime(TimeUtils.secondToShortDHMS(snap.getUptime()));
		snap.setReqPerSec(Double.valueOf(findNumericValue(autoStatuses[3])));
		snap.setBytesPerSec(Double.valueOf(findNumericValue(autoStatuses[4])));
		snap.setBytesPerReq(Double.valueOf(findNumericValue(autoStatuses[5])));
		snap.setBusyWorkerCount(Integer
				.valueOf(findNumericValue(autoStatuses[6])));
		snap.setIdleWorkerCount(Integer
				.valueOf(findNumericValue(autoStatuses[7])));
		return snap;
	}
	
	public String findNumericValue(String sourceString) {
		Pattern pattern = Pattern.compile("\\d*\\.*\\d+$");
		Matcher matcher = pattern.matcher(sourceString);
		if (matcher.find()) {
			String value = matcher.group(0);
			if (value.startsWith("."))
				value = "0" + value;
			return value;
		}

		else
			return null;
	}
	
	/**
	 * Get the lineNum th line from server-status
	 * 
	 * @param lineNum
	 *            (start from 1)
	 * @return
	 */
	public String getLineFromStatus(String ip, String httpPort, int lineNum, boolean auto)
			throws IOException {
		HttpClient httpclient = new DefaultHttpClient();
		StringBuilder sb = new StringBuilder();
		sb.append("http://").append(ip).append(":").append(httpPort)
				.append("/server-status");
		if (auto)
			sb.append("?auto");
		final String statusUrl = sb.toString();
		HttpGet httpget = new HttpGet(statusUrl);
		HttpResponse response;
		try {
			response = httpclient.execute(httpget);
			HttpEntity entity = response.getEntity();
			String returnLine = null;
			// If the response does not enclose an entity, there is no need
			// to worry about connection release
			if (entity != null) {
				InputStream instream = entity.getContent();
				try {

					BufferedReader reader = new BufferedReader(
							new InputStreamReader(instream));
					// do something useful with the response

					// Skip the first 6 lines of server_status
					for (int i = 1; i < lineNum; i++) {
						reader.readLine();
					}
					returnLine = reader.readLine();

				} catch (IOException ex) {

					// In case of an IOException the connection will be released
					// back to the connection manager automatically
					throw ex;

				} catch (RuntimeException ex) {
					// In case of an unexpected exception you may want to abort
					// the HTTP request in order to shut down the underlying
					// connection and release it back to the connection manager.
					httpget.abort();
					throw ex;

				} finally {

					// Closing the input stream will trigger connection release
					instream.close();

				}

				// When HttpClient instance is no longer needed,
				// shut down the connection manager to ensure
				// immediate deallocation of all system resources
				httpclient.getConnectionManager().shutdown();
			}
			return returnLine;

		} catch (ClientProtocolException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			return null;
		}

	}

	/**
	 * Get the lineNum th line from server-status
	 * 
	 * @param lineNum
	 *            (start from 1)
	 * @return
	 */
	public String getLinesFromStatus(String ip, String httpPort,int startLineNum, int endLineNum)
			throws IOException {
		HttpClient httpclient = new DefaultHttpClient();
		final String statusUrl = "http://" + ip + ":" + httpPort
				+ "/server-status?auto";
		HttpGet httpget = new HttpGet(statusUrl);
		HttpResponse response;
		try {
			response = httpclient.execute(httpget);
			HttpEntity entity = response.getEntity();
			String returnLine = null;
			// If the response does not enclose an entity, there is no need
			// to worry about connection release
			if (entity != null) {
				InputStream instream = entity.getContent();
				try {

					BufferedReader reader = new BufferedReader(
							new InputStreamReader(instream));
					// do something useful with the response

					// Skip the first 6 lines of server_status
					for (int i = 1; i < startLineNum; i++) {
						reader.readLine();
					}
					StringBuilder sb = new StringBuilder();
					for (int i = 0; i < endLineNum - startLineNum + 1; i++) {
						sb.append(reader.readLine() + "\n");
					}
					returnLine = sb.toString();

				} catch (IOException ex) {

					// In case of an IOException the connection will be released
					// back to the connection manager automatically
					throw ex;

				} catch (RuntimeException ex) {
					// In case of an unexpected exception you may want to abort
					// the HTTP request in order to shut down the underlying
					// connection and release it back to the connection manager.
					httpget.abort();
					throw ex;

				} finally {

					// Closing the input stream will trigger connection release
					instream.close();

				}

				// When HttpClient instance is no longer needed,
				// shut down the connection manager to ensure
				// immediate deallocation of all system resources
				httpclient.getConnectionManager().shutdown();
			}
			return returnLine;

		} catch (ClientProtocolException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			return null;
		}

	}
	
	
	/*
    
    @RequestMapping(value = "/control", method = RequestMethod.GET)
    public ResponseEntity<String>  control(@RequestParam("ip") String ip,
			@RequestParam("jmxPort") String jmxPort,  @RequestParam("contextName") String contextName, @RequestParam("operation") String operation) {
    	JsonObjectResponse response = new JsonObjectResponse();
    	HttpStatus returnStatus;
    	JmxAppServer appServer = JmxAppServer.findJmxAppServerByIpAndJmxPort(ip, jmxPort);
    	if(appServer == null){
    		appServer = new JmxAppServer();
    		appServer.setIp(ip);
    		appServer.setJmxPort(jmxPort);   		
    		try {
				appServer.init();
			} catch (Exception e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
    		appServer.persist();    		
    	}
    	JmxAppInstance appInstance = JmxAppInstance.findAppInstanceByAppServerAndContextName(appServer, contextName);
    	if(appInstance == null){
    		appInstance = new JmxAppInstance();
    		appInstance.setName(contextName);
    		appInstance.setAppServer(appServer);
    		appInstance.persist();    		
    	}
    	
    	try{
    		monitorService.controlAppInstance(appInstance, operation);
    		response.setMessage("Operation performed.");
    		response.setSuccess(true);
    		response.setTotal(1L);    		
    		returnStatus = HttpStatus.OK;
    	}catch(Exception e){
    		response.setMessage(e.getMessage());
    		response.setSuccess(false);
    		response.setTotal(0L);    	
    		returnStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    	}   	
        return new ResponseEntity<String>(new JSONSerializer().exclude("*.class").transform(new DateTransformer("MM/dd/yy-HH:mm:ss"), Date.class).serialize(response), returnStatus);
    }
    */
    
	
    
    @RequestMapping(method = RequestMethod.POST, value = "{id}")
    public void post(@PathVariable Long id, ModelMap modelMap, HttpServletRequest request, HttpServletResponse response) {
    }

    @RequestMapping
    public String index() {
        return "monitor/index";
    }
}
