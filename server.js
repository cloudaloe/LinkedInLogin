//
// Login with LinkedIn identity - see client-side code for the real stuff
//
// LinkedIn relies on some cross-domain injections to establish this.
// They seem to claim it is no big deal - http://developer.linkedin.com/forum/cross-domain-issues
// See also http://developer.linkedin.com/forum/login-linkedin.
//
// Note this project can only fully run on Heroku (i.e. it cannot fully run locally).
// Currently it is running on http://serene-taiga-2666.herokuapp.com/showCase.html
//
// Only prints the login data to the browser console for now.
//

//var hostname = 'localhost';
console.log('Server starting');
var port = process.env.PORT || 8080;  // for Heroku runtime compatibility
var staticPath = './code';

var geoip = require('geoip-lite');
var queryString = require('querystring');
var server = require('http').createServer(requestHandler);
var static = require('node-static'); 
staticContentServer = new static.Server(staticPath, { cache: false });

function requestHandler(request, response) {

    //
    // IP to Geolocation translation package
    // Note that for proper utilization, it should only check
    // the IP upon a new TCP connection, not every http request
    //
    // var geo = geoip.lookup(request.connection.remoteAddress);
    // console.log(request.connection.remoteAddress, geo);
    //

    function apiError(textMessage)
    {
        textMessage = 'API Error: ' + textMessage;
        console.log(textMessage);
        response.writeHead(400, textMessage);
        response.end();
    }

    function confirmParamInApiRequest(postObject, paramName)
    {
        if (!postObject[paramName])
        {
            apiError('The API parameter ' + paramName + ' is required in this API request, but not included in it.')
            return false;
        }
        else
            return true;
    }

    function handleLevel1(postObject)
    {
        switch (postObject.command)
        {
            case 'data':
                if (confirmParamInApiRequest(postObject, 'apiKey'))
                {
                    // here need to extract all identifiers and start the real handling -
                    // entering the data into the database
                    response.writeHead(200, null);
                    response.end();
                }
                break;
            case undefined:
               apiError('no command specified in the request.');
                break;
            default:
                apiError('command ' + postObject.command + ' is not supported.');
        }
    }

	if (request.method == 'GET')
        //
        // a UI client page load
        //  delegated to node-static for serving it
        //
		staticContentServer.serve(request, response, function (err, res) {
            if (err) { 
                console.error("Error serving " + staticPath + request.url + " - " + err.message);
                response.writeHead(err.status, err.headers);
                response.end(); }
			else
                console.log("Served " + staticPath + request.url)});

    if (request.method == 'POST')
    {
        //
        // handle uploading new data
        // not delegated to node-static,
        // so we handle parsing and  responding ourselves
        //
        console.log('Handling post request from client ' + request.connection.remoteAddress +
            ' (port ' + request.connection.remotePort +')');
        //console.log('Request headers are:' + JSON.stringify(request.headers));

        //request.setEncoding("utf8");
        var data = '';

        request.on('data', function(chunk) {
            data += chunk.toString();
        });

        request.on('end', function() {
            var postObject = queryString.parse(data);
            //console.log('data', data);
            console.log(postObject);
            switch(postObject.version)
            {
                case undefined:
                    apiError('an  API version is not specified in the client request');
                    break;
                 case '0.1':
                    handleLevel1(postObject);
                    break;
                default:
                    apiError('the API version specified by the client request is not supported');
            }
        });
    }
}
		
server.listen(port, null, null, function(){ 
	console.log('Server listening on' + ': '  + port);});

