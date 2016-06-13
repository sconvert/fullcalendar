<?php

function saveDataToJSON($datain) {
  $datain["title"] = "Evénement en attente de validation";
  $json = file_get_contents('bdrest.json');
  $data = json_decode($json);
  $data[] = $datain;
  file_put_contents('bdrest.json', json_encode($data));





  /*$data = json_encode($data);
  print $data;
  $inp = file_get_contents('bdrest.json');
  $tempArray = json_decode($inp);
  array_push($tempArray, $data);
  $jsonData = json_encode($tempArray);
  file_put_contents('bdrest.json', $jsonData);*/
}

saveDataToJSON($_POST);

$temp = "";
foreach ($_POST as $key => $value)
  $temp .= "<br /><b>" . $key . "</b> " . $value;

print $temp;

?>
