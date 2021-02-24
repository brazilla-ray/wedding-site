<?php
# Include the Autoloader (see "Libraries" for install instructions)
require '../../vendor/autoload.php';
use Mailgun\Mailgun;

$json = file_get_contents('php://input');

$mailgun = sendMailgun($json);

function ajaxResponse($status, $message, $data = NULL, $mg = NULL) {
  $response = array (
    'status' => $status,
    'message' => $message,
    'data' => $data,
    'mailgun' => $mg
    );

  $output = json_encode($response);
  // var_dump($output);
  exit($output);
}

function sendMailgun($data) {
  # Instantiate the client.
  $mgClient = new Mailgun('key-e267875716f48670a1725c67fd3d6b55');
  $domain = "https://api.mailgun.net/v3/mg.williamandlaura.us";
  $email = '<event@williamandlaura.us>';

  # Make the call to the client.
  $result = $mgClient->sendMessage($domain, array(
      'from' => '<postmaster@mg.williamandlaura.us>',
      'to' => $email,
      'subject' => 'RSVP',
      'html' => $data
  ));

  $response = $mgClient->get("$domain/log", array('limit' => 1,
                                                  'skip' => 0));
  $httpResponseCode = $response->http_response_code;

  if ($httpResponseCode === 200) {
    ajaxResponse('success', 'Great success', $data);
  } else {
    ajaxResponse('error', 'Mailgun did not connect properly.', $data);
  }
}
?>
