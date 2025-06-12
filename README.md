# 블로그 프로젝트

Next.js 15, TypeScript, Shadcn UI로 구축된 현대적인 블로그 애플리케이션입니다.

## 기술 스택

- **프레임워크:** Next.js 15
- **언어:** TypeScript
- **스타일링:** Tailwind CSS
- **UI 컴포넌트:** Shadcn UI, Radix UI
- **폼 관리:** React Hook Form, Zod
- **날짜 처리:** date-fns
- **상태 관리:** React Server Components
- **URL 상태 관리:** nuqs

## 시작하기

### 필수 요구사항

- Node.js 18.17 이상
- npm 또는 yarn

### 설치 방법

1. 저장소 클론:

```bash
git clone [your-repository-url]
cd blog
```

2. 의존성 설치:

```bash
npm install
# 또는
yarn install
```

3. 루트 디렉토리에 `.env` 파일을 생성하고 환경 변수를 추가:

```env
# 환경 변수를 여기에 추가하세요
```

4. 개발 서버 실행:

```bash
npm run dev
# 또는
yarn dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 결과를 확인하세요.

## 프로젝트 구조

```
├── app/                # App 라우터 디렉토리
├── components/         # React 컴포넌트
├── lib/               # 유틸리티 함수 및 설정
├── public/            # 정적 자산
└── styles/            # 전역 스타일
```

## 주요 기능

- 모던하고 반응형 디자인
- 서버 사이드 렌더링
- TypeScript를 통한 타입 안전한 개발
- Shadcn UI를 활용한 아름다운 UI 컴포넌트
- Zod를 통한 폼 유효성 검사
- React Server Components를 통한 최적화된 성능
