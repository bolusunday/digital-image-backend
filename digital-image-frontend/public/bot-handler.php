<?php
// Get the product ID or slug passed from .htaccess
$product = isset($_GET['product']) ? $_GET['product'] : '';

if (empty($product)) {
    header("Location: /");
    exit;
}

// Ensure a crawler User-Agent is always sent to the API
$incomingUserAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
$userAgent = !empty($incomingUserAgent) ? $incomingUserAgent : 'LinkedInBot/1.0';

// Fetch the pre-rendered metadata HTML from Express API
$apiUrl = "https://api.pegty.com/product/" . urlencode($product);

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_USERAGENT, $userAgent);
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
    // Fallback to React index.html if API fetch fails
    readfile('index.html');
}