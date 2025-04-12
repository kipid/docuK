import esbuild from 'esbuild';

// esbuild 설정
const config = {
    entryPoints: ['src/docuK-prepare-2.3.ts', 'src/docuK-postProcess-2.3.ts'],
    outdir: './',
    bundle: false, // 번들링 비활성화
    minify: true, // 코드 최소화
    sourcemap: true, // 소스맵 생성
    target: 'es2022', // ES2022 문법으로 변환
    platform: 'browser', // 브라우저 환경
    format: 'iife', // IIFE 포맷 사용
    tsconfig: 'tsconfig.json', // TypeScript 설정 파일
    loader: {
        '.ts': 'ts' // TypeScript 파일 로더
    }
};

// 프로덕션 모드 빌드
async function prodBuild() {
    try {
        await esbuild.build(config);
        console.log('프로덕션 빌드 완료');
    } catch (err) {
        console.error('빌드 실패:', err);
        process.exit(1);
    }
}

prodBuild();