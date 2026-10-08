node .\esbuild.config.js

REM js 파일들을 CDN 폴더로 복사
copy /y "docuK-2.3.css" "C:\kipids-recoeve\templates\CDN\"

copy /y "docuK-prism.css" "C:\kipids-recoeve\templates\CDN\"

copy /y "docuK-postProcess-2.3.js" "C:\kipids-recoeve\templates\CDN\"

copy /y "docuK-postProcess-2.3.js.map" "C:\kipids-recoeve\templates\CDN\"

copy /y "docuK-prepare-2.3.js" "C:\kipids-recoeve\templates\CDN\"

copy /y "docuK-prepare-2.3.js.map" "C:\kipids-recoeve\templates\CDN\"

echo JS 파일 복사가 완료되었습니다.
