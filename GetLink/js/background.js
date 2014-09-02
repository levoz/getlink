chrome.contextMenus.create({
    'type':'normal',
    'title':'Get Link!',
	'contexts':["image"],
    'id':'gl',
    'onclick': function(info){
		getlink(info.srcUrl);
	}
});

function getlink(url){
	var picUrl = 'http://getlink.sinaapp.com/ext?url='+url;
	var xhr = new XMLHttpRequest();
	xhr.open("GET", picUrl, true);
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			var retUrl = xhr.responseText;
			if(retUrl != 'none'){
				copyTextToClipboard(retUrl);
				alert('成功生成外链，已经复制到剪贴板');
			}else{
				alert('无法生成外链，请下载后用getlink.sinaapp.com上传');
			}
		}
	}
	xhr.send();
}

function copyTextToClipboard(text) {
	var copyFrom = document.createElement("textarea");
	copyFrom.textContent = text;
	var body = document.getElementsByTagName('body')[0];
	body.appendChild(copyFrom);
	copyFrom.select();
	document.execCommand('copy');
	body.removeChild(copyFrom);
}