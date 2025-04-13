node .\esbuild.config.js

REM js 파일들을 CDN 폴더로 복사
copy /y "docuK-2.3.css" "C:\Recoeve\src\main\java\recoeve\db\CDN\"

copy /y "docuK-postProcess-2.3.js" "C:\Recoeve\src\main\java\recoeve\db\CDN\"

copy /y "docuK-postProcess-2.3.js.map" "C:\Recoeve\src\main\java\recoeve\db\CDN\"

copy /y "docuK-prepare-2.3.js" "C:\Recoeve\src\main\java\recoeve\db\CDN\"

copy /y "docuK-prepare-2.3.js.map" "C:\Recoeve\src\main\java\recoeve\db\CDN\"

echo JS 파일 복사가 완료되었습니다.
