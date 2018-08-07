function setStyleSheet() {
	if ((navigator.appName == 'Microsoft Internet Explorer')
	 && (parseInt(navigator.appVersion.substring(22,25)) < 7))
		document.getElementById('stylesheet').href='main-ie6.css';
	
}