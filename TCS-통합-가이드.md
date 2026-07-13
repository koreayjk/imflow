# IM Flow → TCS 통합 가이드

IM Flow(프로젝트·단계·할일·오늘 화면·알림 기능)를 **TCS 프로그램 안의 한 기능**으로 그대로 넣기 위한 안내서입니다.
링크로 나가는 게 아니라, TCS 안에서 하나의 화면/메뉴로 동작합니다.

---

## 0. 핵심 요약

- **파일 하나면 끝**: `embed/imflow.html` — 프로젝트/할일 관리 기능 **전체**가 이 파일 1개에 들어있습니다.
- **서버 불필요**: 데이터는 브라우저의 `localStorage`에 저장됩니다. 백엔드·DB·로그인 서버가 필요 없습니다.
- **격리 안전**: `<iframe>`으로 넣으면 TCS의 CSS/JS와 절대 충돌하지 않습니다. (권장)
- **네임스페이스 지원**: 저장소 키를 지정해 TCS의 다른 데이터와 안 섞이게 할 수 있습니다.

### 파일 받는 곳
- GitHub(raw): `https://raw.githubusercontent.com/koreayjk/imflow/main/embed/imflow.html`
- 미리보기(라이브): `https://koreayjk.github.io/imflow/embed/imflow.html`

---

## 1. 통합 방법 A — iframe (권장 ✅)

가장 안전하고 간단합니다. TCS가 어떤 기술로 만들어졌든(React/Vue/순수 HTML/Electron 등) 그대로 됩니다.
CSS·JS가 완전히 격리되어 **TCS 화면이 깨질 위험이 0** 입니다.

### 순서
1. `embed/imflow.html` 파일을 **TCS 프로젝트 안에 복사**합니다.
   (예: `public/imflow.html`, `assets/imflow.html`, `static/imflow.html` 등 정적 파일 위치)
2. TCS에 "프로젝트 관리" 같은 **메뉴/탭/라우트**를 하나 추가하고, 그 화면에 아래처럼 iframe을 넣습니다.

### 순수 HTML
```html
<iframe
  src="/imflow.html?storageKey=tcs_imflow"
  title="IM Flow"
  style="width:100%; height:100%; min-height:80vh; border:0;">
</iframe>
```

### React
```jsx
function ProjectManager() {
  return (
    <iframe
      src="/imflow.html?storageKey=tcs_imflow"
      title="IM Flow"
      style={{ width: '100%', height: '100%', minHeight: '80vh', border: 0 }}
    />
  );
}
```

### Vue
```vue
<template>
  <iframe
    src="/imflow.html?storageKey=tcs_imflow"
    title="IM Flow"
    style="width:100%; height:100%; min-height:80vh; border:0;"
  />
</template>
```

> `?storageKey=tcs_imflow` 는 TCS 전용 저장 공간을 쓰게 해서 다른 데이터와 안 섞이게 합니다.
> TCS 상단바가 이미 있으면 `?storageKey=tcs_imflow&header=0` 으로 IM Flow 자체 헤더를 숨길 수 있습니다.

---

## 2. 통합 방법 B — 인라인(같은 페이지에 직접 삽입)

iframe 없이 TCS 화면 DOM 안에 직접 넣는 방법입니다. 더 "한 몸"처럼 보이지만 **주의**가 필요합니다.

- 이 파일은 **Tailwind CDN**(`cdn.tailwindcss.com`)을 사용합니다. 인라인으로 넣으면 Tailwind가 **TCS 전체 페이지 스타일에 영향**을 줄 수 있습니다.
- TCS가 **이미 Tailwind를 쓰는 경우**가 아니라면 → **iframe(방법 A)을 쓰세요.**
- 그래도 인라인을 원하면, CSS 충돌이 없도록 **Shadow DOM 방식의 오프라인 빌드**가 필요합니다. (아래 3번 참고 — 요청 시 제작 가능)

설정은 host 페이지에서 전역 변수로 줍니다:
```html
<script>
  window.IMFLOW_CONFIG = { storageKey: 'tcs_imflow', showHeader: false };
</script>
<!-- 이후 imflow.html의 <body> 내용을 삽입 -->
```

---

## 3. 알아둘 점 (제약 & 옵션)

| 항목 | 내용 |
|------|------|
| **데이터 저장** | 브라우저 `localStorage`. 기기·브라우저마다 별도 저장(동기화 X). 여러 직원/기기 공유가 필요하면 서버(DB) 연동 버전이 따로 필요합니다. |
| **인터넷 필요** | 디자인용 Tailwind·Pretendard 폰트를 CDN에서 불러옵니다. **완전 오프라인**으로 써야 하면, CDN 없이 CSS를 파일에 내장한 **오프라인 빌드**가 필요합니다(요청 시 제공). |
| **알림** | 브라우저 알림은 화면이 열려 있을 때만 동작. 앱을 닫아도 오는 푸시 알림은 서버가 필요합니다. |
| **설정 옵션** | `storageKey`(저장 공간 이름), `showHeader`(자체 헤더 표시 여부). `window.IMFLOW_CONFIG` 또는 URL 파라미터로 지정. |

---

## 4. 커스터마이즈 포인트 (원하면 수정)

`imflow.html` 안의 자바스크립트 상단에서 바꿀 수 있습니다.

- **단계 이름**: `var STAGES = [...]` — `준비/진행/검토/완료` 를 TCS 업무에 맞게 변경 가능
  (예: `기획 / 발주 / 제작 / 오픈`)
- **브랜드 색**: `<head>` 안 `tailwind.config` 의 `brand` 색상값
- **앱 이름**: `IM Flow` 텍스트

---

## 5. TCS Claude Code에 붙여넣을 프롬프트

아래를 그대로 복사해서 TCS 프로젝트의 Claude Code에 전달하세요.

```
우리 TCS 프로그램 안에 "프로젝트 관리(IM Flow)" 기능을 하나의 화면으로 추가하고 싶어.

- 기능 전체가 담긴 단일 HTML 파일이 여기에 있어:
  https://raw.githubusercontent.com/koreayjk/imflow/main/embed/imflow.html
  (이 파일은 서버 없이 localStorage로 동작하는 자체 완결형 앱이야.)

요청:
1. 위 파일을 우리 프로젝트의 정적 파일 위치(public/ 또는 static/ 등)에 imflow.html 로 복사해줘.
2. 좌측 메뉴(또는 라우트)에 "프로젝트 관리" 항목을 새로 만들고,
   그 화면에서 imflow.html 을 iframe 으로 100% 크기로 띄워줘.
   iframe src 는 "/imflow.html?storageKey=tcs_imflow" 로 해서
   우리 데이터와 저장 공간이 안 섞이게 해줘.
3. TCS 상단에 이미 헤더가 있으니, iframe src 에 &header=0 도 붙여서
   IM Flow 자체 헤더는 숨겨줘.
4. 모바일에서도 안 깨지게 iframe 높이를 화면에 꽉 차게 잡아줘.

우리 TCS의 프론트엔드 구조(React/Vue/순수HTML 등)에 맞춰서 적용하고,
적용 후 그 메뉴로 들어가면 프로젝트/할일 관리가 바로 뜨는지 확인해줘.
```

> 만약 완전 오프라인(인터넷 없이) 동작이나, iframe 없이 완전히 한 몸으로 녹이는 버전이 필요하면
> 그 조건을 알려주세요 — CDN 없는 오프라인 빌드 또는 Shadow DOM 위젯 버전을 따로 만들어 드립니다.
