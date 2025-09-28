# BluetoothArduinoApp

🎨 **아두이노 LED 제어 앱** - 블루투스(BLE)를 통해 아두이노와 연결하여 LED 색상과 모드를 실시간으로 제어할 수 있는 React Native 앱입니다.

![React Native](https://img.shields.io/badge/React%20Native-0.77.0-61DAFB?style=flat-square&logo=react)
![Bluetooth](https://img.shields.io/badge/Bluetooth-BLE-0082FC?style=flat-square&logo=bluetooth)
![Arduino](https://img.shields.io/badge/Arduino-Compatible-00979D?style=flat-square&logo=arduino)

## 📱 주요 기능

- **🔍 자동 기기 검색**: "Jake"라는 이름의 BLE 기기를 자동으로 검색하고 연결
- **🎨 색상 제어**: RED, GREEN, BLUE 색상을 선택하여 아두이노 LED 제어
- **🌈 모드 선택**:
  - 무지개 모드 (01): 자동으로 색상이 변화하는 모드
  - 원하는 색 고르기 모드 (02): 사용자가 직접 색상을 선택하는 모드
- **📡 실시간 통신**: BLE를 통한 즉시 데이터 전송
- **🔒 권한 관리**: Android BLE 권한 자동 요청 및 관리

## 🛠 기술 스택

### Frontend (React Native)

- **React Native**: 0.77.0
- **react-native-ble-plx**: BLE 통신을 위한 라이브러리
- **@react-native-picker/picker**: 모드 선택을 위한 드롭다운 컴포넌트
- **Buffer**: 데이터 패킷 인코딩

### 지원 플랫폼

- ✅ Android (API Level 21+)
- ✅ iOS (준비됨)

## 📋 사전 요구사항

- **Node.js**: >= 18
- **React Native CLI**: 최신 버전
- **Android Studio**: Android 개발용 (API Level 21+)
- **Xcode**: iOS 개발용 (macOS만)
- **아두이노 기기**: BLE 모듈이 탑재되고 "Jake"로 명명된 기기

## 🚀 설치 및 실행

### 1. 프로젝트 클론

```bash
git clone https://github.com/makerthon-filament/BluetoothArduinoApp.git
cd BluetoothArduinoApp/client
```

### 2. 의존성 설치

```bash
npm install
# 또는
yarn install
```

### 3. Android 실행

```bash
npx react-native run-android
# 또는
npm run android
```

### 4. iOS 실행 (macOS만)

```bash
cd ios && pod install && cd ..
npx react-native run-ios
# 또는
npm run ios
```

## 📡 BLE 통신 프로토콜

### 서비스 및 특성 UUID

```javascript
const serviceUUID = '71c46861-691a-4b1e-9ddb-d722fa9ad632';
const characteristicUUID = '71c46862-691a-4b1e-9ddb-d722fa9ad632';
```

### 데이터 패킷 포맷

앱에서 아두이노로 전송되는 데이터는 다음과 같은 형식입니다:

```
[모드(2자리)] + [R값(3자리)] + [G값(3자리)] + [B값(3자리)]
```

**예시:**

- `02255000000`: 모드 02, RGB(255, 0, 0) - 빨간색
- `01000255000`: 모드 01, RGB(0, 255, 0) - 초록색
- `02000000255`: 모드 02, RGB(0, 0, 255) - 파란색

### 모드 설명

- **01 (무지개 모드)**: 아두이노에서 자동으로 색상을 순환
- **02 (색상 선택 모드)**: 앱에서 지정한 RGB 값으로 고정

## 📱 앱 사용법

### 1. 기기 연결

1. 앱을 실행합니다
2. **"🔍 BLE 기기 검색 및 연결"** 버튼을 탭합니다
3. 권한 요청이 나타나면 모두 허용합니다
4. "Jake" 기기가 자동으로 검색되어 연결됩니다

### 2. LED 제어

연결이 완료되면:

1. **모드 선택**: 드롭다운에서 원하는 모드를 선택
2. **색상 선택**: RED, GREEN, BLUE 버튼 중 하나를 선택
3. **전송**: **"🚀 데이터 전송"** 버튼을 탭하여 명령을 아두이노로 전송

## 🔧 아두이노 설정

아두이노 측에서는 다음과 같은 설정이 필요합니다:

### 필요한 하드웨어

- Arduino (Uno, Nano, ESP32 등)
- BLE 모듈 (ESP32 내장 또는 외부 모듈)
- RGB LED 또는 LED 스트립

### BLE 설정

- 기기 이름: `"Jake"`
- 서비스 UUID: `71c46861-691a-4b1e-9ddb-d722fa9ad632`
- 특성 UUID: `71c46862-691a-4b1e-9ddb-d722fa9ad632`

## 🛡️ 권한 설정

### Android 권한

앱에서 자동으로 요청하는 권한들:

**Android 12+ (API Level 31+)**

- `BLUETOOTH_SCAN`: BLE 기기 검색
- `BLUETOOTH_CONNECT`: BLE 기기 연결
- `ACCESS_FINE_LOCATION`: 위치 기반 BLE 검색

**Android 11 이하**

- `ACCESS_FINE_LOCATION`: BLE 검색을 위한 위치 권한

## 🐛 문제 해결

### 연결 문제

- **권한 거부**: 앱 설정에서 모든 권한을 허용했는지 확인
- **기기를 찾을 수 없음**: 아두이노 기기명이 "Jake"인지 확인
- **연결 실패**: 아두이노가 켜져있고 BLE가 활성화되었는지 확인

### 데이터 전송 문제

- **명령이 전달되지 않음**: UUID가 올바르게 설정되었는지 확인
- **LED가 동작하지 않음**: 아두이노 코드에서 RGB 값 파싱 로직 확인
