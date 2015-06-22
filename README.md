bw2fa-server
============

## Quick Start

bw2fa-server is a standalone two factor auth service that only requires
[Catapult](https://catapult.inetwork.com) credentials to start!  The server
requires very little configuration.  Start by cloning our github repository:

```
git clone git@github.com:BandwidthExamples/bw2fa-server.git
cd bw2fa-server
npm install
```

### Local Deployments

Start by cloning the bw2fa-server repository and installing dependencies using
the steps in the quick start section.

Starting the server:
```
SESSION_SECRET=RANDOM->31-CHARACTER-STRING \
CATAPULT_USER_ID=u-YOUR-CATAPULT-USER-ID \
CATAPULT_TOKEN=t-YOUR-CATAPULT-API-TOKEN \
CATAPULT_SECRET=YOUR-CATAPULT-SECRET \
npm start
```

### Heroku Deployments

Deploy your own instance of bw2fa-server using [Heroku](https://heroku.com)

Start by cloning the bw2fa-server repository and installing dependencies using
the steps in the quick start section.

Then create a new Heroku App:
```heroku create```

Configure app environment:
```
heroku config:set APP_URL=https://YOUR-APP-NAME.herokuapp.com
heroku config:set SESSION_SECRET=RANDOM->=32-CHARACTER-STRING
heroku config:set ACCESS_CODE=MY-SECRET-PASSWORD
heroku config:set CATAPULT_USER_ID=u-YOUR-CATAPULT-USER-ID
heroku config:set CATAPULT_TOKEN=t-YOUR-CATAPULT-API-TOKEN
heroku config:set CATAPULT_SECRET=YOUR-CATAPULT-SECRET
```

Deploy the app:
```
git push heroku master
heroku ps:scale web=1
heroku open
```

## Complete Configuration Guide

  * CATAPULT_USER_ID - **required** catapult api user id
  * CATAPULT_TOKEN - **required** catapult api token
  * CATAPULT_SECRET - **required** catapult api secret
  * SESSION_SECRET - **required** session signing secret. e.g.
    rJL0rAG36HwnWpcq8gPmliCZ58qV0GEQ
  * ACCESS_CODE - **suggested** - shared secret between the service and 
    consumers.  "password" to this instance of bw2fa-server.  default: "2fapass"
  * APP_URL - external url to the root of the application. e.g.
    https://evening-fortress-0000.herokuapp.com. default: http://localhost:8080
  * HOST - hostname of server. default: 0.0.0.0
  * PORT - server http listen port. default: 8080
  * SESSION_TTL - time to live for 2 factor auth sessions before they expire.
    default: 60 seconds.
  * CATAPULT_API_ENDPOINT - catapult api endpoint. default:
    https://api.catapult.inetwork.com

## Node.js Client Implementation

**TODO:** [bw2fa-client](/)

## Technical

When a consumer makes a new auth request, bw2fa-server generates a new
verification code and encrypts it to form a new 2fa-token or *session*
and returns it.  In addition to the verification answer, the encrypted
session includes expiration data.  Consumers then pass this encrypted
session payload back to the user in the form or a cookie or hidden form
field.  The user should then submit their session token and verification
code back to be validated by bw2fa-server.  This process is described in
the following image:

![bw2fa-server sequence diagram](/images/bw2fa-sequence.jpeg)

bw2fa-server is completely stateless so it supports scaling horizontally if
needed.

**Important:** Future versions of this application should consider limiting
verification attempts per session token.  Right not it's feasible that an
attacker could gain access by brute forcing a session code if session ttl
is large enough.
