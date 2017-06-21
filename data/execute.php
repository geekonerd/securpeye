<?php

  // load config
  require("config.php");

  // retrieve action to execute
  $action = $_REQUEST["action"];
  if (null != $action && (in_array($action, $config_actions))) {

    $data = file_get_contents("data.json");
    $data = json_decode($data, true);
    
    switch($action) {
      case "_on" :
        $port = start();
        $result = '{"port" : "' . $port . '", "status" : "ok"}';
        break;
      
      case "_off" :
        $status = close();
        $result = '{"status" : "' . $status . '"}';
        break;

      case "_record" :
        close();
        $command = "sudo python3 record.py " . $data["duration"];
        exec($command);
        $result = '{"status" : "ok"}';
        break;

      case "_snap" :
        close();
        $command = "sudo python3 snap.py";
        exec($command);
        $result = '{"status" : "ok"}';
        break;
        
      case "_load" :
        $files = load();
        $result = '{"status" : "ok", "files" : ' . $files . '}';
        break;
    }
    
    // execute command
    echo $result;

  } else {
    // send error 500 back to web-app

    header($_SERVER['SERVER_PROTOCOL'] . ' 500 Internal Server Error', true, 500);
  }

  function start() {
    $command = "";
    $port = "";
    if (file_exists("./pistreaming")) {
      $command = "sudo python3 pistreaming/server.py > /dev/null 2>&1 & echo $!; ";
      $port = "8082";
    } else {
      $command = "sudo python3 activate.py > /dev/null 2>&1 & echo $!; ";
      $port = "8000";
    }
    if (!file_exists(".pid")) {
      $pid = exec($command, $output);
      file_put_contents(".pid", $pid);
    }
    return $port;
  }

  function close() {
    if ((file_exists(".pid") && $pid = file_get_contents(".pid"))) {
      $command = "sudo kill -15 $pid";
      exec($command);
      unlink(".pid");
      return "ok";
    } else {
      return "Nessuno streaming aperto";
    }
  }

  function load() {
    $files = array();
    if ($handle = opendir('./snaps')) {
      while (false !== ($entry = readdir($handle))) {
        if ($entry != "." && $entry != "..") {
           array_push($files, $entry);
        }
      }
      closedir($handle);
    }
    return json_encode($files);
  }
