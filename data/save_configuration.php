<?php

  // load config
  require("config.php");
  
  // retrieve data from POST
  $data = $_REQUEST["data"];
  if (null !== $data && (null !== ($data = json_decode($data)))) {
  
    $cams = (null != $data->cams) ? $data->cams : null;
    $ips = (null != $data->ips) ? $data->ips : null;
    $duration = (null != $data->duration) ? $data->duration : 30;

    // override configuration plugs array
    if (sizeof($cams) === sizeof($config_data["cams"])
      && sizeof($ips)  === sizeof($config_data["cams"])) {

      // set names && ips
      for ($i = 0; $i < sizeof($cams); $i++) {
        $config_data["cams"][$i]["name"] = $cams[$i];
        $config_data["cams"][$i]["ip"] = $ips[$i];
      }
      
      // set duration
      $config_data["duration"] = $duration;
      
      // jsonify, save to data.json and send back to web-app
      $config_data = json_encode($config_data);
      $file = "/var/www/html/securpeye/data/data.json";
      if (file_put_contents($file, $config_data)) {
        echo $config_data;
      } else {
        // send error 500 back to web-app
        header($_SERVER['SERVER_PROTOCOL'] . ' 500 Internal Server Error', true, 500);
      }
      
    } else {
      // send error 500 back to web-app
      header($_SERVER['SERVER_PROTOCOL'] . ' 500 Internal Server Error', true, 500);
    }
    
  } else {
    // send error 500 back to web-app
    header($_SERVER['SERVER_PROTOCOL'] . ' 500 Internal Server Error', true, 500);
  }
