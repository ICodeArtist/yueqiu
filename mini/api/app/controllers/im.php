<?php
require_once(dirname(PG_IN)."/extend/GatewayClient/Gateway.php");
/*
phpGrace.com 轻快的实力派！ 
*/
use GatewayClient\Gateway;
class imController extends grace{
	
	//__init 函数会在控制器被创建时自动运行用于初始化工作，如果您要使用它，请按照以下格式编写代码即可：
	/*
	public function __init(){
		parent::__init();
		//your code ......
	}
	*/
	public function index(){
		$usermodel = db('user');
		$arr = $usermodel->where('id = ?', array(2))->fetch();
		$this->json($arr);
	}
	public function bind(){
		Gateway::$registerAddress = '127.0.0.1:1238';
		Gateway::bindUid($_GET['clientid'], $_GET['uid']);
	}
	public function sendmessage(){
		Gateway::$registerAddress = '127.0.0.1:1238';
		Gateway::sendToUid($_GET['uid'], $_GET['msg']);
	}
}