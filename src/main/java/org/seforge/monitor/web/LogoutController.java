package org.seforge.monitor.web;

import java.util.Date;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.seforge.monitor.extjs.JsonObjectResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import flexjson.JSONSerializer;
import flexjson.transformer.DateTransformer;

@RequestMapping("/logout")
@Controller
public class LogoutController {
	@RequestMapping(method = RequestMethod.GET)
	public ResponseEntity<String> logout(HttpServletRequest req, HttpServletResponse resp) {
		HttpStatus returnStatus;
    	JsonObjectResponse response = new JsonObjectResponse();
		req.getSession().invalidate();
		if (req == null){
			returnStatus = HttpStatus.BAD_REQUEST;
            response.setMessage("Failed.");
            response.setSuccess(false);
            response.setTotal(0L);
            return new ResponseEntity<String>(new JSONSerializer().exclude("*.class").transform(new DateTransformer("MM/dd/yy"), Date.class).serialize(response), returnStatus);
		}			
		for (Cookie c : req.getCookies()) {
			boolean cookieExists = false;
			Cookie[] cookies = req.getCookies();
			try {
				for (int j = 0; j < cookies.length; j++) {
					Cookie oldCookie = cookies[j];
					System.out.println(oldCookie.getName() + ":"
							+ oldCookie.getPath() + ":" + oldCookie.getValue()
							+ ":" + oldCookie.getDomain());
					Cookie killMyCookie = new Cookie(oldCookie.getName(), null);
					killMyCookie.setMaxAge(0);
					killMyCookie.setValue("");
					if (oldCookie.getPath() == null)
						killMyCookie.setPath("/");
					else
						killMyCookie.setPath(oldCookie.getPath());
					if (oldCookie.getDomain() == null)
						killMyCookie.setDomain("seforge.org");
					else
						killMyCookie.setDomain(oldCookie.getDomain());
					// if(cookies[j].getName()==AuthorizationFilter.whichCookie)
					// killMyCookie.setPath( "/ ");//这个不是随便用的，请清楚你的目录设置
					resp.addCookie(killMyCookie);
					// cookies[j].setValue( " ");
					System.out.println("After:" + killMyCookie.getName() + ":"
							+ killMyCookie.getPath() + ":"
							+ killMyCookie.getValue());
				}
			} catch (Exception ex) {
				ex.printStackTrace();
				returnStatus = HttpStatus.INTERNAL_SERVER_ERROR;
                response.setMessage(ex.getMessage());
                response.setSuccess(false);
                response.setTotal(0L);
			}
		}
		 returnStatus = HttpStatus.OK;
         response.setMessage("Log out successfully!");
         response.setSuccess(true);
         response.setTotal(0L);
         response.setData(null);
         return new ResponseEntity<String>(new JSONSerializer().exclude("*.class").transform(new DateTransformer("MM/dd/yy"), Date.class).serialize(response), returnStatus);
	}

}
