package org.seforge.monitor.web;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.seforge.monitor.domain.GroupOwner;
import org.seforge.monitor.utils.EncryptionDecryption;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@RequestMapping("/")
@Controller
public class IndexController {
   
    @RequestMapping(method = RequestMethod.GET)
    public void parseGroupId(HttpServletRequest request, HttpServletResponse response) {    	
    	/*
    	Integer ownerId = (Integer)request.getSession().getAttribute("groupowner");
    	
    	Cookie myCookie[] = request.getCookies();
		Cookie monitorCookie[] = request.getCookies();
		Cookie namecookie = null;				
		if (monitorCookie != null && monitorCookie.length > 0) {					
			for (int i = 0; i < myCookie.length; i++) {						
				if (myCookie[i].getName().equals("_monitor_")) {
					namecookie = myCookie[i];							
				}
			}
		}				
		if(namecookie == null){
			namecookie = new Cookie("_monitor_",ownerId.toString());  
			namecookie.setPath("/");
			response.addCookie(namecookie); 
		}   	
    	
    	if(ownerId == null)
    		ownerId = 1; 
    	*/
    	try {
			response.sendRedirect("index.html");
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}    	
		
    }   
  
}
