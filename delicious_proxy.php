<?php
/**
 * $Id$
 */

/**
* This PHP script serves as a proxy for Delicious API requests. It processes
* the request made by the client, posts the request to Delicious, and
* formats the response as JSON data for the client. It provides support for
* a JSONP callback so that users can access the Delicious API entirely via
* JavaScript and this proxy.
*/

/*
* It is a security liability to accept the user's password parameter in a
* GET request because it will show up in the server's logs. Unfortunately,
* that's the only way this proxy can work across different servers because
* the script must be loaded via a <script src="...this script..."></script>
* tag. Note that the password is transmitted insecurely only to the proxy
* script; it is sent to the Delicious server over https.
*
* To improve this situation, install this proxy script on the same server
* that serves the Javascript and use a POST request instead. This will
* hide the password when used in conjunction with https
*/

// For error management
$errors = new Errors();

// Start with base URL for Delcious API
// http://delicious.com/help/api
$url ='https://api.del.icio.us/v1/';

// These are the methods described in the Delicious API
$allowed_methods = array(
    'posts/update',
    'posts/add',
    'posts/delete',
    'posts/get',
    'posts/dates',
    'posts/recent',
    'posts/all',
    'posts/all?hashes',
    'posts/suggest',
    'tags/get',
    'tags/delete',
    'tags/rename',
    'tags/bundles/all',
    'tags/bundles/set',
    'tags/bundles/delete'
);

// These are the parameters allowed by the various Delicious API methods
$allowed_params = array(
	'bundle',
	'count',
	'description',
	'dt',
	'extended',
	'fromdt',
	'hashes',
	'meta',
	'meta',
	'new',
	'old',
	'replace',
	'results',
	'shared',
	'start',
	'tag',
	'tags',
	'todt',
	'url'
);

// Check that a username and password were provided
// Prefer $_POST to $_GET because of the security issues mentioned above
$username = '';
$password = '';
if (isset($_POST['username'])) {
    $username = $_POST['username'];
} else if (isset($_GET['username'])) {
	$username = $_GET['username'];
} else {
	$errors->add('A Delicious username was not provided.');
}

if (isset($_POST['password'])) {
	$password = $_POST['password'];
} else if (isset($_GET['password'])) {
	$password = $_GET['password'];
} else {
    $errors->add('A password was not provided.');
}

// Check that a valid method was specified
if (in_array($_POST['method'], $allowed_methods)) {
    $url .= $_POST['method'];
} else if (in_array($_GET['method'], $allowed_methods)) {
    $url .= $_GET['method'];
} else {
    // Use posts/add as default method
    $url .= 'posts/add';
}

// Some methods (like all?hashes) already include the ? query indicator
// Add it to the URL only if it is needed
if (strpos($url, '?') === false) {
	$url .= '?';
}

// Format the query parameters as part of the URL
$params = array();
foreach (array_merge($_GET, $_POST) as $key => $value) {
    if (in_array($key, $allowed_params)) {
		$params[] = urlencode($key) . '=' . urlencode($value);
	}
}
$url .= implode('&', $params);

// Final response
$json = array();

if (!$errors->exist()) {
	// Fetch the URL using cURL
	// Uses cURL becuase allow_url_fopen may be disabled
	// This will fail if the current PHP installation does not include cURL
	$ch = curl_init();
	$timeout = 5; // set to zero for no timeout
	curl_setopt ($ch, CURLOPT_URL, $url);
    curl_setopt ($ch, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt ($ch, CURLOPT_CONNECTTIMEOUT, $timeout);
	curl_setopt ($ch, CURLOPT_USERPWD, $username . ':' . $password);
    $rsp = curl_exec($ch);
	$curl_error = curl_errno($ch);
	curl_close($ch);

	if ($curl_error == 28) {
		// Connection timeout
		// CURLE_OPERATION_TIMEDOUT 28
		$errors->add('Request to Delicious API timed out');
	} else {
		// Convert XML response to JSON
    	$xml = simplexml_load_string($rsp);
    	$json['request_url'] = $url;
        $json['xml'] = $rsp;
        $json['result_code'] = (string) $xml['code'];
	}
}


if ($errors->exist()) {
	$json['errors'] = $errors->getErrors();
}

header('Content-type: application/json');
$json = str_replace("\n", '', json_encode($json));

/* If a callback is specified that means the request is being processed
 * across domains using JSONP. Send the response wrapped in the callback.
 * Otherwise, just send the response. It doesn't make sense to set a callback
 * via POST, so we just check GET.
 */
if (isset($_GET['callback'])) {
    echo $_GET['callback'] . '(' . $json . ')';
} else {
    echo $json;
}




/**
* This simple class manages a collection of errors
*/
class Errors {
    var $errors = array();

	/**
	 * Add an error to the list
	 */
	function add($error) {
		$this->errors[] = $error;
	}

    /**
     * Detect if any errors have been entered into the list
     */
    function exist() {
        return count($this->errors) > 0;
    }

    /**
     * Return an array of errors
     */
     function getErrors() {
         return $this->errors;
     }
}
