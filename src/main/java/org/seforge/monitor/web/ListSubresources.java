package org.seforge.monitor.web;

import java.util.Date;
import java.util.Set;
import javax.persistence.TypedQuery;

import org.seforge.monitor.domain.Resource;
import org.seforge.monitor.domain.ResourceGroup;
import org.seforge.monitor.extjs.JsonObjectResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

import flexjson.JSONSerializer;
import flexjson.transformer.DateTransformer;

@RequestMapping("/embedded/list_subresources")
@Controller
public class ListSubresources {

	@RequestMapping(method = RequestMethod.GET)
	public ResponseEntity<String> generateMetrics(@RequestParam("id") Integer id) {

		HttpStatus returnStatus;
		JsonObjectResponse response = new JsonObjectResponse();
		if (id == null) {
			returnStatus = HttpStatus.BAD_REQUEST;
			response.setMessage("No Resource Id provided.");
			response.setSuccess(false);
			response.setTotal(0L);
		} else {
			try {
				TypedQuery<Resource> result = Resource.findResourcesByResourceIdEquals(id);
				Resource r = result.getSingleResult();
				Set<ResourceGroup> rgs = r.getResourceGroups();
				returnStatus = HttpStatus.OK;
				response.setMessage("The group information is found.");
				response.setSuccess(true);
				response.setTotal(rgs.size());
				response.setData(rgs);
			} catch (Exception e) {
				e.printStackTrace();
				returnStatus = HttpStatus.INTERNAL_SERVER_ERROR;
				response.setMessage(e.getMessage());
				response.setSuccess(false);
				response.setTotal(0L);
			}
		}
		return new ResponseEntity<String>(new JSONSerializer()
				.exclude("*.class")
				.transform(new DateTransformer("MM/dd/yy"), Date.class)
				.serialize(response), returnStatus);

	}
}
