package org.seforge.monitor.utils;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URL;
import java.net.URLConnection;

public class Requester {

	public static String request(String target) throws IOException {
		URL url = new URL(target);
		URLConnection conn = url.openConnection();
		
		conn.setRequestProperty("accept", "*/*");
		conn.setRequestProperty("connection", "Keep-Alive");
		conn.setRequestProperty("user-agent",
				"Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1)");
		
		conn.connect();

		BufferedReader in = new BufferedReader(new InputStreamReader(
				conn.getInputStream(),"UTF-8"));
		StringBuffer sb = new StringBuffer();
		String line;
		line = in.readLine();
		while (line != null)
		{
			sb.append(line);
			line = in.readLine();
		}
		in.close();
		return sb.toString();
	}
}
