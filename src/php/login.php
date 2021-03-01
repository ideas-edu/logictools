<?php
require_once __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . '/db.php';

use \IMSGlobal\LTI;

// $r_db = new Example_Database();
// var_dump($r_db->find_registration_by_issuer("http://localhost:8000"));

LTI\LTI_OIDC_Login::new(new Example_Database())
    ->do_oidc_login_redirect(TOOL_HOST . "/index.php")
    ->do_redirect();
?>
