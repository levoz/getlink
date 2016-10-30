# Get Link!

借助七牛云存储实现的一个简单的图床应用

:point_right: [主页][1]

:point_right: [配套 Chrome 扩展][2]


## 公共空间

目前的版本可以使用公共的空间（公共空间不保证数据持久性），也可以使用自己的空间，使用公共空间只需要在设置里勾选上 `Use Default Server` 即可，当然这个是默认开启的，其实并不需要任何操作

## 私有空间

这里要做三件事：

 - 申请七牛空间
 - 部署服务端程序，用于生成 uptoken
 - 在主页里设置域名和安全码

最主要的就是部署自己的服务端程序，[这个][3]是我用 Node 写的服务端程序，很简单的程序，其实就是为客户端提供 uptoken ，所以你也可以参考[七牛文档][4]自己写（接口一致即可）

部署服务端程序的时候需要几个参数：

```javascript
var AUTH_KEY = process.env.AUTH_KEY || '<AUTH_KEY>'

var qiniu = {
    accessKey: process.env.ACCESS_KEY || '<ACCESS_KEY>',
    secretKey: process.env.SECRET_KEY || '<SECRET_KEY>',
    bucket: process.env.BUCKET || '<BUCKET>',
    domain: process.env.DOMAIN || '<DOMAIN>', // 七牛空间域名
};
```

这里的 `AUTH_KEY` 和你部署的服务端域名（eg: `https://your.server.com/uptoken`）就是客户端需要的设置的内容

如果有任何问题可以开 Issue :-)

 [1]: https://get-link.xyz
 [2]: https://goo.gl/hI9FR5
 [3]: https://github.com/int64ago/node-qiniu-server
 [4]: http://developer.qiniu.com/
