package org.seforge.monitor.filter;
import java.io.IOException;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.seforge.monitor.utils.Requester;



public class AuthorizationFilter implements Filter {

	static String ssoAddress = "http://sso.seforge.org/javasso/member/verify.do";
	public static String userToken = "ccUser";
	public static String whichCookie = "_sso_";
	static String redirectURL = "http://sso.seforge.org/javasso/member/rlogin.do?redirectTo=http://monitor.seforge.org";

	// *********************************************************************
	// Initialization

	public void init(FilterConfig config) throws ServletException {

	}

	// *********************************************************************
	// Filter processing

	public void doFilter(HttpServletRequest request,
			HttpServletResponse response, FilterChain fc)
			throws ServletException, IOException {
		/**
		 * XXX Cache控制！2010.6.19
		 */
		String requestURI = request.getRequestURI();

		if (requestURI != null) {

			if (requestURI.endsWith("dwr")) {
				response.addHeader("Cache-Control", "no-cache");
				// System.out.println(requestURI);
			}
		}
		HttpSession session = request.getSession();

		if (session != null && session.getAttribute(this.userToken) != null) {
			fc.doFilter(request, response);
			return;
		}

		Cookie myCookie[] = request.getCookies();

		boolean notFound = true;
		String Base64Cookie_val = null;

		if (myCookie != null && myCookie.length > 0) {
			Cookie newCookie = null;
			for (int i = 0; notFound && i < myCookie.length; i++) {
				newCookie = myCookie[i];
				if (newCookie.getName().equals(this.whichCookie)) {
					notFound = false;
					Base64Cookie_val = newCookie.getValue();
					if (!Base64Cookie_val.startsWith("\"")) {// 如果cookie值两边没有引号
					} else {// 如果cookie值两边有引号
						Base64Cookie_val = Base64Cookie_val.substring(1,
								Base64Cookie_val.length() - 1);
					}
				}
			}
		}
		if (Base64Cookie_val == null) {
			//clearCookie(request, response);
			response.sendRedirect(this.redirectURL);
			// abort chain
			return;

		}
		try {
			String r = Requester.request(this.ssoAddress + "?cookie="
					+ Base64Cookie_val);
			System.out.println(r);
			boolean result = Boolean.parseBoolean(r.trim());// true or false
			System.out.println("boolean: " + result);
			if (result) {
				String user = Base64Cookie_val.split("!")[0];
				System.out.println("USER:" + user);
				/**
				 * TODO
				 * 
				 * 
				 * 权限授予
				 * 
				 */
				if (session != null) { // probably unncessary
					session.setAttribute(this.userToken, user);
				}
			} else {
				throw new ServletException("Unexpected authentication error");
			}

		} catch (Exception e) {
			e.printStackTrace();
			response.sendRedirect(this.redirectURL);
			return;
		}

		// continue processing the request
		fc.doFilter(request, response);
	}

	// *********************************************************************
	// Destruction

	public void destroy() {
	}

	@Override
	public void doFilter(ServletRequest request, ServletResponse response,
			FilterChain fc) throws IOException, ServletException {
		this.doFilter((HttpServletRequest) request,
				(HttpServletResponse) response, fc);
		// TODO Auto-generated method stub

	}

//	static String domain = EnvironmentProperty.readConf("domain");
/*
	private void clearCookie(HttpServletRequest request,
			HttpServletResponse response) {
		Cookie[] cookies = request.getCookies();
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
					killMyCookie.setDomain(domain);
				else
					killMyCookie.setDomain(oldCookie.getDomain());
				// if(cookies[j].getName()==AuthorizationFilter.whichCookie)
				// killMyCookie.setPath( "/ ");//这个不是随便用的，请清楚你的目录设置
				response.addCookie(killMyCookie);
				// cookies[j].setValue( " ");
				System.out.println("After:" + killMyCookie.getName() + ":"
						+ killMyCookie.getPath() + ":"
						+ killMyCookie.getValue());
			}
		} catch (Exception ex) {
		}
	}
	*/
}