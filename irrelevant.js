//
// Simple program for logging in with your LinkedIn account.
// Uses the proprietary LinkedIn protocol. As per:
// https://developer.linkedin.com/documents/sign-linkedin
//

var port = process.env.PORT || 8080;  // for Heroku runtime compatibility
 
var url = require('url');
var querystring = require('querystring');

var server = require('http').createServer(
    function(req, res)
    {
        var parsedUrl = url.parse(req.url);
		console.log('Received request url ' + parsedUrl + ', method=' + req.method);
        if(parsedUrl.pathname == '/google')
        { 
          // User supplied identifier
          var query = querystring.parse(parsedUrl.query);
          //var identifier = query.openid_identifier;
		  
		  identifier = "https://www.google.com/accounts/o8/id";

          // Resolve identifier, associate, and build authentication URL
          relyingParty.authenticate(identifier, false, function(error, authUrl)
          {
            if(error)
            {
              res.writeHead(200, { 'Content-Type' : 'text/plain; charset=utf-8' });
              res.end('Authentication failed: ' + error.message);
            }
            else if (!authUrl)
            {
              res.writeHead(200, { 'Content-Type' : 'text/plain; charset=utf-8' });
              res.end('Authentication failed');
            }
            else
            {
              res.writeHead(302, { Location: authUrl });
              res.end();
            }
          });
        }
        else if(parsedUrl.pathname == '/verified')
        {
          // Verify identity assertion
          // NOTE: Passing just the URL is also possible
          relyingParty.verifyAssertion(req, function(error, result)
          {
            res.writeHead(200, { 'Content-Type' : 'text/plain; charset=utf-8' });

            if(error)
            {
              res.end('Authentication failed: ' + error.message);
            }
            else
            {
              // Result contains properties:
              // - authenticated (true/false)
              // - answers from any extensions (e.g. 
              //   "http://axschema.org/contact/email" if requested 
              //   and present at provider)
			  
              //res.end((result.authenticated ? 'Success :)' : 'Failure :(') +
              //  '\n\n' + JSON.stringify(result));
			  console.log(JSON.stringify(result));
			  
			  if (result.authenticated)
			  {
			    res.end('authentication status: ' + result.authenticated + '.\n' + 'the returned identity identifier is '+ result.claimedIdentifier + '\nall data of the request follows:\n ' + JSON.stringify(result)); // this prints all the attributes requested on top the login if any, such as
				// users's first and last name, email address, or any other requested attribute from the 
				// the Google or other account provider.
			  }
			  else
			  {
			    res.end("couldn't authenticate. " + JSON.stringify(result));
			  }
            }
          });
        }
        else
        {
        }
    });
server.listen(port);