package org.seforge.monitor.web;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.seforge.monitor.utils.EncryptionDecryption;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@RequestMapping("/")
@Controller
public class IndexController {
   
    @RequestMapping(method = RequestMethod.GET)
    public String parseGroupId(@RequestParam("gId") String gId, HttpServletRequest request) {    	
    	String readableGroupId = "0";
    	/*
    	try {
			EncryptionDecryption des = new EncryptionDecryption("seforge");
			readableGroupId = des.decrypt(gId);
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		*/
    //	System.out.println(readableGroupId);  
    //	request.getSession().setAttribute("groupId", readableGroupId);
    	
    //return "redirect:index.html";
    	return "redirect:/index.html?groupId=" + gId;
    }   
  
}
