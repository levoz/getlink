# Get Link!
An image hosting based on [Qiniu Cloud](http://www.qiniu.com/), it's for person who wants to use own space quickly.

:point_right: [Homepage][1]

:point_right: [Chrome Extension][2]

![gif][5]

## Public bucket

Currently, the public bucket is **ONLY** avaliable for testing, there's no reliability assurance, we have set the strict referer rules and may empty the bucket optionally.

You can check on `Use Default Server` in settings for activating the public bucket, of course, it's checked on by default.

## Private bucket

If you want to use your own bucket, there's the quick way:

 - Register a Qiniu account
 - Deploy a server for generating `uptoken`
 - Setting the `AuthKey` in settings

The most important task is to deploy your own server, [here][3] is what I deployed written in Node. You can write one in any language via [Qiniu Docs][4] if you like (The URL API should be the same).


If you deploy with the server I provide, take care of the following params:

```javascript
var AUTH_KEY = process.env.AUTH_KEY || '<AUTH_KEY>'

var qiniu = {
    accessKey: process.env.ACCESS_KEY || '<ACCESS_KEY>',
    secretKey: process.env.SECRET_KEY || '<SECRET_KEY>',
    bucket: process.env.BUCKET || '<BUCKET>',
    domain: process.env.DOMAIN || '<DOMAIN>',
};
```

Remember `AUTH_KEY` and the domain of your server (eg: `https://your.server.com/uptoken`), they will be set in settings.

 [1]: https://get-link.xyz
 [2]: https://goo.gl/hI9FR5
 [3]: https://github.com/int64ago/node-qiniu-server
 [4]: http://developer.qiniu.com/
 [5]: https://cloud.githubusercontent.com/assets/2230882/23832867/666f030a-0778-11e7-9905-64f221692c11.gif
