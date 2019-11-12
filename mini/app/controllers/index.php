<?php
/*
phpGrace.com 轻快的实力派！ 
*/
class indexController extends grace{
	
	//__init 函数会在控制器被创建时自动运行用于初始化工作，如果您要使用它，请按照以下格式编写代码即可：
	
	public function __init(){
		parent::__init();
		//your code ......
	}

	public function index(){
		exit;
	}

	public function buildyue(){
		$_POST['endtime'] = strtotime($_POST['bd'].' '.$_POST['bt'].':00');
		if(time()>=$_POST['endtime'])
			$this->json('','-1','运动时间过期');
		$yueid = db('yueparty')->add($_POST);
		if($yueid){
			$this->joinInc($yueid,$_POST['uid']);
			$this->json($yueid);
		}else{
			$this->json('','-1','创建失败，请稍后再试');
		}
	}

	public function codeToSession(){
		$appid = 'wx41245dd430035de4';
		$secret = '07603983645cde794fd57c44db9d2975';
		$url =  "https://api.weixin.qq.com/sns/jscode2session?appid=".$appid.
        "&secret=".$secret."&js_code=".$_GET['code']."&grant_type=authorization_code";
		$curl = new phpGrace\tools\curl();
		$res = $curl->get($url);
		$this->json($res);
	}

	public function login(){
		if(isset($_POST['openid']) && $_POST['openid']){
			$member = db('user')->where('openid=?',array($_POST['openid']))->fetch();
			// 用户未注册
			if(empty($member)){
				$_POST['nickName'] = urlencode($_POST['nickName']);
				$member['id'] = db('user')->add($_POST);
			}
			
			if(empty($member['id'] )){
				$this->json('','-1','注册失败，请返回重试');
			}
			// 如果用户已经注册 member 变量中已经保存用户信息
			// 返回用户信息
			$this->json($member);
		}else{
			$this->json('','-1','请稍等');
		}
	}
	public function myyue(){
		$yueids = db('yuejoin')->where('uid=?',array($_GET['uid']))->fetchAll('yueid');
		if(!empty($yueids)){
			$yueid = "(";
			foreach ($yueids as $value) {
				$yueid .= $value['yueid'].',';
			}
			$yueid = rtrim($yueid,',').")";
			$data = db('yueparty')->where('id in '.$yueid.' and endtime>? and ifdelete=?',array(time(),0))->fetchAll('id,uid,title,place,bd,bt,joinnum,num,moshi');
			foreach ($data as $key => $value) {
				if($value['uid'] == $_GET['uid']){
					$data[$key]['cancancel'] = '1';
				}else{
					$data[$key]['cancancel'] = '0';
				}
			}
			$this->json($data,'1000');
		}else{
			$this->json([],'1001');
		}
	}

	public function delyue(){
		db('yueparty')->where('id=?',array($_GET['yueid']))->update(array('ifdelete'=>1));
		// db('yuejoin')->where('yueid=?',array($_GET['yueid']))->delete();
		$this->json('');
	}

	public function yueinfo(){
		$yueinfo = db('yueparty')->where('id=?',array($_GET['yueid']))->fetch();
		$data['longitude'] = $yueinfo['longitude'];
		$data['latitude'] = $yueinfo['latitude'];
		$data['markers'][0]['id'] =  $yueinfo['id'];
		$data['markers'][0]['latitude'] =  $yueinfo['latitude'];
		$data['markers'][0]['longitude'] =  $yueinfo['longitude'];
		$data['markers'][0]['width'] =  50;
		$data['markers'][0]['height'] =  50;
		$data['markers'][0]['callout']['content'] =  $yueinfo['place'];
		$data['yueinfo'] = $yueinfo;
		$data['join'] = db('yuejoin')->join('as a left join user as b on a.uid = b.id')
		->where('a.yueid=?',array($_GET['yueid']))
		->fetchAll('a.create_time, b.nickName,b.avatarUrl,b.level,b.znum');
		foreach ($data['join'] as $key => $value) {
			$data['join'][$key]['nickName'] = urldecode($value['nickName']);
		}
		$this->json($data,'1000');
	}
	public function logyueinfo(){
		$yueinfo = db('yueparty')->where('id=?',array($_GET['yueid']))->fetch();
		$data['longitude'] = $yueinfo['longitude'];
		$data['latitude'] = $yueinfo['latitude'];
		$data['markers'][0]['id'] =  $yueinfo['id'];
		$data['markers'][0]['latitude'] =  $yueinfo['latitude'];
		$data['markers'][0]['longitude'] =  $yueinfo['longitude'];
		$data['markers'][0]['width'] =  50;
		$data['markers'][0]['height'] =  50;
		$data['markers'][0]['callout']['content'] =  $yueinfo['place'];
		$data['yueinfo'] = $yueinfo;
		$data['join'] = db('yuejoin')->join('as a left join user as b on a.uid = b.id')
		->where('a.yueid=?',array($_GET['yueid']))->order('a.znum desc,a.id asc')
		->fetchAll('a.id,a.create_time,a.znum,a.zu,b.nickName,b.avatarUrl,b.level');
		foreach ($data['join'] as $key => $value) {
			$data['join'][$key]['nickName'] = urldecode($value['nickName']);
			if(in_array($_GET['uid'],explode(',',$value['zu']))){
				$data['join'][$key]['ifz'] = '1';
			}else{
				$data['join'][$key]['ifz'] = '0';
			}
		}
		$this->json($data,'1000');
	}
	public function joinyue(){
		//已经加入
		$hasjoin = db('yuejoin')->where('yueid=? and uid=?',array($_POST['yueid'],$_POST['uid']))->count();
		if($hasjoin>0)
			$this->json('','-1','已经加入');
		//人满
		$yueinfo = db('yueparty')->where('id=?',array($_POST['yueid']))->fetch('num,joinnum');
		if($yueinfo['num'] <= $yueinfo['joinnum'])
			$this->json('','-1','人数已满');
		$this->joinInc($_POST['yueid'],$_POST['uid']);
			$this->json('');
	}
	//支付
	public function joinpay(){
		//已经加入
		$hasjoin = db('yuejoin')->where('yueid=? and uid=?',array($_POST['yueid'],$_POST['uid']))->count();
		if($hasjoin>0)
			$this->json('','-1','已经加入');
		//人满
		$yueinfo = db('yueparty')->where('id=? and ifdelete=?',array($_POST['yueid'],0))->fetch();
		if(empty($yueinfo))
			$this->json('','-1','该场已删除');
		if($yueinfo['num'] <= $yueinfo['joinnum'])
			$this->json('','-1','人数已满');
        $order = array(
			'uid'		=> $_POST['uid'],
			'ordersn'   => $this->getOrderSn(),     //订单号码
			'yueid'		=> $_POST['yueid'],
            'amount'     => $yueinfo['amount']         //订单价格
		);
		$orderid = db('yueorder')->add($order);
		if($orderid){
			//使用统一下单接口返回微信支付前端必须的信息
			$orderWxPay = array();
			$orderWxPay['body']                 = $yueinfo['id'].'-'.$yueinfo['title']; //支付描述
			$orderWxPay['out_trade_no']         = $order['ordersn']; //商户系统内部订单号，要求32个字符内
			$orderWxPay['total_fee']            = $order['amount'] * 100 ; //总价，需要 * 100
			$orderWxPay['notify_url']           = 'https://mini.orianna.top/index/payback'; //异步接收微信支付结果通知的回调地址
			$orderWxPay['openid']               = 'o1Fo445RlNTMD3p8f77TPbbPhBds'; //openid 小程序内获取
			//实例化微信支付对象
			$gracewechat = tool('graceWeChat');
			//生成订单并返回支付必须的信息
			$gracewechat->createOrder($orderWxPay, 'XCX');
		}else{
			$this->json('','-1','订单生产失败');
		}
	}
	 public function payback(){
        $gracewechat = tool('graceWeChat');
        //生成订单并返回支付必须的信息
		$res = $gracewechat->payBack('XCX');
		db('yueorder')->where('ordersn=?',[$res['out_trade_no']])->update(array('status'=>1));
		$order = db('yueorder')->where('ordersn=?',[$res['out_trade_no']])->fetch();
		//付款给发起人

        //将 res 数组与数据库内订单信息进行比对，比对后进行后续操作，如：更新订单状态、通知等
		file_put_contents('payBack.txt', json_encode($res));
		echo "<xml>";
		echo "<return_code><![CDATA[SUCCESS]]></return_code>";
		echo "<return_msg><![CDATA[OK]]></return_msg>";
		echo "</xml>";
		exit();
    }
	//点赞
	public function zyuejoin(){
		//先判断是否是改组球员
		$yj = db('yuejoin')->where('id=?',[$_POST['yuejoinid']])->fetch();
		$ifexist = db('yuejoin')->where('uid=? and yueid=?',[$_POST['uid'],$yj['yueid']])->fetch();
		if(empty($ifexist)){
			$this->json('','-1','你不是改组参与者');
		}else{
			//判断是否已经点赞
			if(in_array($_POST['uid'],explode(',',$yj['zu'])))
				$this->json('','-1','已经点赞');
			//设置点赞
			if(!$yj['zu']){
				$zu = $_POST['uid'];
			}else{
				$zu = $yj['zu'].','.$_POST['uid'];
			}
			$updata = array(
				'zu'		=>		$zu,
				'znum'		=>		$yj['znum'] + 1
			);
			db('yuejoin')->where('id=?',[$_POST['yuejoinid']])->update($updata);
			db('user')->where('id=?',[$yj['uid']])->field('znum',1);
			$u = db('user')->where('id=?',[$yj['uid']])->fetch();
			if($u['znum']>=120){
				$level = 4;
			}else if($u['znum']>=70){
				$level = 3;
			}else if($u['znum']>=30){
				$level = 2;
			}
			db('user')->where('id=?',[$yj['uid']])->update(['level'=>$level]);
			$this->json('','0','成功');
		}
	}
	public function myhistory(){
		$yueids = db('yuejoin')->where('uid=?',array($_GET['uid']))->fetchAll('yueid');
		if(!empty($yueids)){
			$yueid = "(";
			foreach ($yueids as $value) {
				$yueid .= $value['yueid'].',';
			}
			$yueid = rtrim($yueid,',').")";
			$data = db('yueparty')->where('id in '.$yueid.' and endtime<=? and ifdelete=?',array(time(),0))
			->order('id desc')->limit(0,5)
			->fetchAll('id,uid,title,place,bd,bt,joinnum,num,moshi');
			$this->json($data,'1000');
		}else{
			$this->json([],'1001');
		}
	}

	public function myinfo(){
		$data = db('user')->where('id=?',[$_GET['uid']])->fetch('znum,level');
		$this->json($data);
	}
	private function joinInc($yueid,$uid){
		db('yuejoin')->add(array('yueid'=>$yueid,'uid'=>$uid));
		db('yueparty')->where('id=?',array($yueid))->field('joinnum', 1);
	}
	/**
	 * 生成订单号
	 */
	private function getOrderSn(){
		$yCode = array('A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J');
		$zCode = array('01','02','03','04','05','06','07','08','09','10','11','12');
		$orderSn = $yCode[intval(date('Y')) - 2011] .$zCode[intval(date('m'))-1] . strtoupper(dechex(date('m'))) . date('d') . substr(time(), -5) . substr(microtime(), 2, 5) . sprintf('%02d', rand(0, 99));
		return $orderSn;
	}
}