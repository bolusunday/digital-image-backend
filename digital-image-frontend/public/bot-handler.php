<?php
$product = isset($_GET['product']) ? $_GET['product'] : '';

if (empty($product)) {
    header("Location: /");
    exit;
}

$apiUrl = "https://api.pegty.com/product/" . urlencode($product);

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_USERAGENT, $_SERVER['HTTP_USER_AGENT'] ?? 'LinkedInBot/1.0');
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 200 && !empty($response)) {
    header('Content-Type: text/html; charset=utf-8');
    echo $response;
} else {
    readfile('index.html');
}