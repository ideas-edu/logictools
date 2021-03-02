﻿<?php
require_once __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . '/lti/db.php';

use \IMSGlobal\LTI;
$launch = LTI\LTI_Message_Launch::new(new Example_Database())
    ->validate();
// var_dump($launch->get_launch_data())

?>
<script type="text/javascript">
const user = <?php echo json_encode($launch->get_launch_data()); ?>

console.log(user)
</script>
<!DOCTYPE html>
<!--[if lt IE 7]>      <html class="no-js lt-ie9 lt-ie8 lt-ie7"> <![endif]-->
<!--[if IE 7]>         <html class="no-js lt-ie9 lt-ie8"> <![endif]-->
<!--[if IE 8]>         <html class="no-js lt-ie9"> <![endif]-->
<!--[if gt IE 8]><!--> <html class="no-js"> <!--<![endif]-->
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
        <title>Ideas - LogEX</title>
        <meta name="description" content="">
        <meta name="viewport" content="width=1020">

		<script type="module" src="../../main.bundle.js" type="text/javascript"></script>
    </head>
    <body>
        <!--[if lt IE 9]>
            <p class="alert alert-error">You are using an outdated browser. <a href="http://browsehappy.com/">Upgrade your browser today</a> to better experience this site.</p>
        <![endif]-->

        <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
            <a class="navbar-brand" href="#">Ideas - LogEX</a>
			<ul class="navbar-nav ml-auto">
				<li class="nav-item" style="padding:0px 10px;" id="button-NL"><a href="#" id="lang2-NL">NL</a></li>
				<li class="nav-item" style="padding:0px 10px;" id="button-EN"><a href="#" id="lang2-EN">EN</a></li>
				<li class="nav-item" style="padding:0px 10px;"><a href="" target="_new" id="help"> </a></li>
			</ul>
        </nav>

        <div class="container" style="padding-top: 10px;">
			<div class="row">
				<div class="col-md-12">
		            <ul class="nav nav-tabs" id="myTabs">
		                <li class="nav-item"><a class="nav-link" data-toggle="tab" href="#dnv" id="tab-dnv">Section 1</a></li>
		                <li class="nav-item"><a class="nav-link" data-toggle="tab" href="#cnv" id="tab-cnv">Section 2</a></li>
		                <li class="nav-item"><a class="nav-link" data-toggle="tab" href="#logeq" id="tab-logeq">Section 3</a></li>
		            </ul>
		            <div style="padding: 0px; border-left: 1px solid #ddd; border-right: 1px solid #ddd; border-bottom: 1px solid #ddd; border-bottom-left-radius: 5px; border-bottom-right-radius: 5px;" class="tab-content">
		                <div id="dnv" class="tab-pane" data-src="oneway.html?exerciseType=DNV">
		                	<iframe src="" seamless frameBorder="0" id="fraDNV" width="100%" scrolling="no"></iframe>
		                </div>
		                <div id="cnv" class="tab-pane" data-src="oneway.html?exerciseType=CNV">
		                	<iframe src="" seamless frameBorder="0" id="fraCNV" width="100%" scrolling="no"></iframe>
		                </div>
		                <div id="logeq" class="tab-pane" data-src="twoway.html?exerciseType=LOGEQ">
		                	<iframe src="" seamless frameBorder="0" id="fraLogEQ" width="100%" scrolling="no"></iframe>
		                </div>
		            </div>
				</div>
            </div>
		</div>
    </body>
</html>
