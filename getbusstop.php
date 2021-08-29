<?php

//$csvFileLoc = "./ramdisk/bus_stops_long_lat.csv";
$csvFileLoc = "bus_stops_long_lat.csv";


function array_sort_by_column(&$arr, $col, $dir = SORT_ASC) {
    $sort_col = array();
    foreach ($arr as $key=> $row) {
        $sort_col[$key] = $row[$col];
    }

    array_multisort($sort_col, $dir, $arr);
}
function distance($lat1, $lon1, $lat2, $lon2) {

  $theta = $lon1 - $lon2;
  $dist = sin(deg2rad($lat1)) * sin(deg2rad($lat2)) +  cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * cos(deg2rad($theta));
  $dist = acos($dist);
  $dist = rad2deg($dist);
  $miles = $dist * 60 * 1.1515;
//  $unit = strtoupper($unit);
  return $miles;
}

// Store this in a DB for fast access this is not the way to do it below.
$bus_stops = array();
if (($handle = fopen($csvFileLoc, 'r')) !== FALSE) {
    while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
                $theDistance = distance($data[2],$data[3],$_GET['lat'],$_GET['lon']);
                if ($theDistance > 1)
                        continue;

                $bus_stops[] = array(                   "distance"=>$theDistance,
                                                        "naptan"   =>$data[0],
                                                        "name"     =>$data[1],
                                                        "lat"     =>$data[2],
                                                        "lon"     =>$data[3]
                                                        );
    }
    fclose($handle);
}

array_sort_by_column($bus_stops, "distance");
echo json_encode(array_slice($bus_stops,0,45));

?>
