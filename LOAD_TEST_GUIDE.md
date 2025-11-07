# 부하 테스트 가이드

Vercel 배포 후 100~200명 동시 접속 시 성능을 검증하는 방법입니다.

## 🎯 테스트 목표

- **동시 사용자**: 200명
- **목표 응답 시간**: 95%의 요청이 3초 이내
- **에러율**: 5% 미만
- **테스트 시나리오**: 실제 투표 + 관리자 조회

---

## 방법 1: Artillery (추천 - 가장 쉬움)

### 1단계: Artillery 설치

```bash
npm install --save-dev artillery
```

### 2단계: 부하 테스트 설정 파일 수정

`load-test.yml` 파일을 열어서 첫 줄의 URL을 변경:

```yaml
config:
  target: "https://your-app.vercel.app"  # ← 실제 Vercel URL로 변경
```

### 3단계: 부하 테스트 실행

```bash
# 간단한 테스트 (20명, 30초)
npx artillery quick --count 20 --num 10 https://your-app.vercel.app

# 완전한 시나리오 테스트 (200명, 2분 30초)
npx artillery run load-test.yml
```

### 4단계: 결과 분석

테스트 완료 후 다음 지표를 확인:

```
Summary report @ 17:45:30
--------------------------
http.codes.200: ........................ 1234  ← 성공 요청 수
http.codes.500: ........................ 12    ← 실패 요청 수
http.request_rate: ..................... 45/sec
http.response_time:
  min: .............................. 234 ms
  max: .............................. 4521 ms
  median: ........................... 892 ms
  p95: .............................. 2345 ms ← 95%가 2.3초 이내 (좋음!)
  p99: .............................. 3678 ms ← 99%가 3.6초 이내 (좋음!)
errors: ................................ 3 ← 에러 수
```

**판단 기준:**
- ✅ **p95 < 3000ms**: 양호
- ✅ **에러율 < 5%**: 안정적
- ⚠️ **p95 > 5000ms**: 최적화 필요
- ❌ **에러율 > 10%**: 문제 있음

### 5단계: HTML 리포트 생성

```bash
npx artillery run --output report.json load-test.yml
npx artillery report report.json
```

브라우저에서 `report.html` 열어서 그래프로 확인!

---

## 방법 2: k6 (더 강력함)

### 설치

Windows:
```powershell
choco install k6
```

또는 https://k6.io/docs/get-started/installation/ 에서 다운로드

### 테스트 스크립트 생성

`load-test.js` 파일 생성:

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 10 },   // 워밍업
    { duration: '30s', target: 100 },  // 100명까지 증가
    { duration: '1m', target: 200 },   // 200명 유지
    { duration: '30s', target: 0 },    // 감소
  ],
  thresholds: {
    http_req_duration: ['p(95)<3000'], // 95%가 3초 이내
    http_req_failed: ['rate<0.05'],    // 에러율 5% 미만
  },
};

const BASE_URL = 'https://your-app.vercel.app';

export default function () {
  // 1. 세션 생성
  const sessionRes = http.post(`${BASE_URL}/api/session`, '{}', {
    headers: { 'Content-Type': 'application/json' },
  });

  check(sessionRes, {
    '세션 생성 성공': (r) => r.status === 200,
  });

  const sessionId = sessionRes.json('sessionId');

  sleep(1);

  // 2. 발표 목록 조회
  const presRes = http.get(`${BASE_URL}/api/presentations`);

  check(presRes, {
    '발표 목록 조회 성공': (r) => r.status === 200,
  });

  sleep(2);

  // 3. 투표 (랜덤 1-5점)
  const rating = Math.floor(Math.random() * 5) + 1;
  const voteRes = http.post(`${BASE_URL}/api/votes`, JSON.stringify({
    sessionId: sessionId,
    presentationId: 1,
    rating: rating,
  }), {
    headers: { 'Content-Type': 'application/json' },
  });

  check(voteRes, {
    '투표 저장 성공': (r) => r.status === 200,
  });

  sleep(1);
}
```

### 실행

```bash
k6 run load-test.js
```

---

## 방법 3: 간단한 Node.js 스크립트

부하 테스트 도구 설치가 어려운 경우 직접 작성:

`simple-load-test.js` 파일 생성:

```javascript
const https = require('https');

const BASE_URL = 'your-app.vercel.app';
const TOTAL_USERS = 200;
const CONCURRENT = 50; // 동시 실행 수

async function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: BASE_URL,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          body: body,
          duration: Date.now() - startTime,
        });
      });
    });

    const startTime = Date.now();
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function simulateUser(userId) {
  const results = [];

  try {
    // 1. 세션 생성
    const session = await makeRequest('/api/session', 'POST', {});
    results.push({ api: 'session', ...session });
    const sessionId = JSON.parse(session.body).sessionId;

    // 2. 발표 목록
    const presentations = await makeRequest('/api/presentations');
    results.push({ api: 'presentations', ...presentations });

    // 3. 투표
    const vote = await makeRequest('/api/votes', 'POST', {
      sessionId,
      presentationId: 1,
      rating: Math.floor(Math.random() * 5) + 1,
    });
    results.push({ api: 'vote', ...vote });

    return { userId, success: true, results };
  } catch (error) {
    return { userId, success: false, error: error.message };
  }
}

async function runLoadTest() {
  console.log(`🚀 Starting load test: ${TOTAL_USERS} users, ${CONCURRENT} concurrent`);
  const startTime = Date.now();

  const results = [];

  for (let i = 0; i < TOTAL_USERS; i += CONCURRENT) {
    const batch = [];
    for (let j = 0; j < CONCURRENT && (i + j) < TOTAL_USERS; j++) {
      batch.push(simulateUser(i + j + 1));
    }

    const batchResults = await Promise.all(batch);
    results.push(...batchResults);

    console.log(`✓ Completed ${i + batch.length}/${TOTAL_USERS} users`);
  }

  const totalTime = Date.now() - startTime;

  // 결과 분석
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  const allDurations = results
    .filter(r => r.success)
    .flatMap(r => r.results.map(req => req.duration));

  const avg = allDurations.reduce((a, b) => a + b, 0) / allDurations.length;
  const sorted = allDurations.sort((a, b) => a - b);
  const p95 = sorted[Math.floor(sorted.length * 0.95)];
  const p99 = sorted[Math.floor(sorted.length * 0.99)];

  console.log('\n📊 Test Results:');
  console.log(`Total time: ${(totalTime / 1000).toFixed(2)}s`);
  console.log(`Successful requests: ${successful} (${(successful/TOTAL_USERS*100).toFixed(1)}%)`);
  console.log(`Failed requests: ${failed} (${(failed/TOTAL_USERS*100).toFixed(1)}%)`);
  console.log(`Average response time: ${avg.toFixed(0)}ms`);
  console.log(`P95 response time: ${p95}ms`);
  console.log(`P99 response time: ${p99}ms`);

  if (p95 < 3000 && (failed / TOTAL_USERS) < 0.05) {
    console.log('\n✅ PASS: 시스템이 안정적입니다!');
  } else {
    console.log('\n⚠️  WARNING: 성능 최적화가 필요할 수 있습니다.');
  }
}

runLoadTest();
```

실행:
```bash
node simple-load-test.js
```

---

## 방법 4: 온라인 서비스 (가장 간편)

### Loader.io (무료)
1. https://loader.io 가입
2. 도메인 인증 (Vercel에 파일 업로드)
3. 테스트 생성:
   - URL: `https://your-app.vercel.app`
   - Clients: 0 → 200 (60초)
   - Duration: 120초
4. Run Test 클릭!

### BlazeMeter (무료 50명)
1. https://www.blazemeter.com 가입
2. Create Test 클릭
3. URL 입력 및 사용자 수 설정
4. 테스트 실행

---

## 📊 결과 해석 가이드

### 응답 시간 (Response Time)

| P95 | 평가 | 조치 |
|-----|------|------|
| < 1s | 매우 우수 | 문제 없음 |
| 1-3s | 양호 | 문제 없음 |
| 3-5s | 보통 | 모니터링 필요 |
| 5-10s | 느림 | 최적화 고려 |
| > 10s | 매우 느림 | 최적화 필수 |

### 에러율 (Error Rate)

| 에러율 | 평가 | 조치 |
|--------|------|------|
| < 1% | 매우 안정적 | 문제 없음 |
| 1-5% | 안정적 | 문제 없음 |
| 5-10% | 주의 필요 | 로그 확인 |
| > 10% | 불안정 | 긴급 조치 |

### Vercel 무료 Tier 제한

- **함수 실행 시간**: 10초
- **함수 메모리**: 1024 MB
- **대역폭**: 100 GB/월
- **함수 실행**: 100 GB-시간/월

200명 동시 접속은 무료 tier로 충분합니다!

---

## 🔧 성능 최적화 팁

### 문제 발견 시

1. **응답 시간 느림 (> 5초)**
   - Vercel Postgres 연결 고려
   - API 엔드포인트 캐싱 추가
   - 불필요한 데이터 조회 최소화

2. **에러율 높음 (> 5%)**
   - Vercel 로그 확인: `vercel logs`
   - 메모리 부족 확인
   - 동시 접속 제한 추가

3. **데이터베이스 에러**
   - 현재 메모리 기반이므로 서버 재시작 시 초기화
   - 영구 저장 필요 시 Vercel Postgres 연결

---

## ✅ 테스트 체크리스트

### 배포 전
- [ ] `load-test.yml`에 배포 URL 입력
- [ ] Artillery 설치: `npm install --save-dev artillery`
- [ ] 로컬에서 간단한 테스트: `npx artillery quick --count 5 --num 2 http://localhost:3000`

### 배포 후
- [ ] Vercel 배포 완료 확인
- [ ] 브라우저에서 수동 접속 테스트
- [ ] 워밍업 테스트: 10명, 10초
- [ ] 본 테스트: 200명, 2분
- [ ] 결과 분석 및 리포트 저장

### 행사 당일
- [ ] 행사 30분 전 재테스트
- [ ] Vercel 대시보드 모니터링 준비
- [ ] 에러 발생 시 대응 계획 수립

---

## 📞 문제 발생 시

### Vercel 무료 Tier 초과
- Hobby ($20/월) 또는 Pro ($40/월) 플랜으로 업그레이드

### 지속적인 에러
- Vercel 로그 확인: https://vercel.com/dashboard → 프로젝트 → Logs
- GitHub Issues 등록
- 임시 조치: 투표 기능 일시 중단

---

## 🎯 최종 권장 사항

**행사 3일 전:**
1. Artillery로 200명 부하 테스트
2. p95 < 3초, 에러율 < 5% 확인

**행사 1일 전:**
1. 재테스트로 안정성 재확인
2. Vercel 대시보드 모니터링 설정

**행사 당일:**
1. 실시간 모니터링
2. 문제 발생 시 즉시 대응

Vercel 무료 tier는 200명 동시 접속을 충분히 지원하므로, 테스트만 통과하면 안심하고 사용하실 수 있습니다!
