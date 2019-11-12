<?php
/*
phpGrace.com 轻快的实力派！ 
*/
class wxController extends grace{
    public function EnterprisesPayUsers(){
        $graceWeChat = tool('graceWeChat');
        $openid = 'o1Fo445RlNTMD3p8f77TPbbPhBds';
        $totalFee = 0.01;
        $outTradeNo = uniqid();
        // $arr = $graceWeChat->createJsBizPackage($openid, $totalFee, $outTradeNo);
        $arr = $graceWeChat->getJsBizPackage($outTradeNo);
        $this->json($arr);
    }
    
}