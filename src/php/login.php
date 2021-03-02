<?php
require_once __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . '/lti/db.php';

use \IMSGlobal\LTI;

LTI\LTI_OIDC_Login::new(new Example_Database())
    ->do_oidc_login_redirect(TOOL_HOST . "/index.php")
    ->do_redirect();
?>
