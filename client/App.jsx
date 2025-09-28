import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Alert,
  StyleSheet,
  Platform,
  PermissionsAndroid,
  TouchableOpacity,
} from 'react-native';
import { BleManager } from 'react-native-ble-plx';
import { Picker } from '@react-native-picker/picker';
import { Buffer } from 'buffer';

// 🔹 BLE 매니저 생성
const manager = new BleManager();

export default function App() {
  const [connectedDevice, setConnectedDevice] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [mode, setMode] = useState('02'); // 초기 모드 02
  const [color, setColor] = useState({ r: 255, g: 0, b: 0 }); // 초기 색상 RED

  useEffect(() => {
    requestBluetoothPermission();
    return () => manager.destroy();
  }, []);

  // 📌 [1] 안드로이드 BLE 권한 요청
  const requestBluetoothPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        if (Platform.Version >= 31) {
          const granted = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          ]);
          if (Object.values(granted).some((result) => result !== PermissionsAndroid.RESULTS.GRANTED)) {
            Alert.alert('❌ BLE 권한 부족', '블루투스 및 위치 권한이 필요합니다.');
            return false;
          }
        } else {
          const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            Alert.alert('❌ 위치 권한 부족', 'BLE 검색을 위해 위치 권한이 필요합니다.');
            return false;
          }
        }
      } catch (error) {
        Alert.alert('❌ 권한 요청 실패', error.message);
        return false;
      }
    }
    return true;
  };

  // 📌 [2] BLE 기기 검색 및 연결
  const scanAndConnect = async () => {
    const permissionGranted = await requestBluetoothPermission();
    if (!permissionGranted) return;

    manager.startDeviceScan(null, null, async (error, device) => {
      if (error) {
        Alert.alert('❌ 스캔 오류', error.message);
        return;
      }
      if (device && device.name && device.name.includes('Jake')) {
        manager.stopDeviceScan();
        try {
          const connected = await manager.connectToDevice(device.id);
          await connected.discoverAllServicesAndCharacteristics();
          setConnectedDevice(connected);
          setIsConnected(true);
          Alert.alert('✅ BLE 연결 성공', `연결된 장치: ${device.name}`);

          // 연결 해제 감지
          connected.onDisconnected(() => {
            Alert.alert('⚠️ BLE 연결 끊김', '다시 연결해주세요.');
            setConnectedDevice(null);
            setIsConnected(false);
          });
        } catch (error) {
          Alert.alert('❌ 연결 실패', error.message);
        }
      }
    });

    setTimeout(() => manager.stopDeviceScan(), 10000);
  };

  // 📌 [3] 데이터 패킷 생성 (모드 + RGB 값)
  const formatPacket = (mode, { r, g, b }) => {
    // 모드가 '02' 혹은 2인 경우 "02", 그 외에는 "04"로 설정
    const modePrefix = (mode === '02' || mode === 2) ? '02' : '04';

    // 각 RGB 값들을 3자리 문자열로 변환 (예: 5 → "005", 255 → "255")
    const rStr = r.toString().padStart(3, '0');
    const gStr = g.toString().padStart(3, '0');
    const bStr = b.toString().padStart(3, '0');

    // 접두어와 RGB 값을 결합하여 최종 패킷 문자열 생성
    return modePrefix + rStr + gStr + bStr;
  };

  // 📌 [4] BLE 데이터 전송
  const sendPacket = async () => {
    if (!connectedDevice) {
      Alert.alert('⚠️ BLE 기기 없음', '먼저 BLE 기기와 연결하세요.');
      return;
    }

    const serviceUUID = '71c46861-691a-4b1e-9ddb-d722fa9ad632';
    const characteristicUUID = '71c46862-691a-4b1e-9ddb-d722fa9ad632';

    const packet = formatPacket(mode, color);
    const base64Packet = Buffer.from(packet).toString('base64');

    await connectedDevice.writeCharacteristicWithoutResponseForService(
      serviceUUID,
      characteristicUUID,
      base64Packet
    );

    Alert.alert('✅ 명령 전송 완료', `전송된 패킷: ${packet}`);
  };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Jake BLE Controller</Text>
      {!isConnected ? (
        <TouchableOpacity style={styles.largeButton} onPress={scanAndConnect}>
          <Text style={styles.buttonText}>🔍 BLE 기기 검색 및 연결</Text>
        </TouchableOpacity>
      ) : (
        <>
          <Text style={styles.status}>✅ BLE 연결됨</Text>

          <Text style={styles.label}>원하는 모드를 골라주세요!</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={mode}
              style={styles.picker}
              onValueChange={(value) => setMode(value)}
              mode="dropdown" // ✅ Android에서 드롭다운 모드 적용
              itemStyle={styles.pickerItem} // ✅ iOS용 스타일 적용
            >
              <Picker.Item label="무지개 모드" value="01" />
              <Picker.Item label="원하는 색 고르기 모드" value="02" />
            </Picker>
          </View>

          <TouchableOpacity style={styles.SmallButton} onPress={() => setColor({ r: 255, g: 0, b: 0 })}>
            <Text style={styles.buttonText}>🎨 색상 변경 (RED)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.SmallButton} onPress={() => setColor({ r: 0, g: 255, b: 0 })}>
            <Text style={styles.buttonText}>🎨 색상 변경 (GREEN)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.SmallButton} onPress={() => setColor({ r: 0, g: 0, b: 255 })}>
            <Text style={styles.buttonText}>🎨 색상 변경 (BLUE)</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.SmallButton, styles.sendButton]} onPress={sendPacket}>
            <Text style={styles.buttonText}>🚀 데이터 전송</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5FCFF' },
  title: { fontSize: 35, fontWeight: 'bold', marginBottom: 50 },
  status: { fontSize: 18, marginBottom: 10, color: 'green' },
  label: { fontSize: 16, marginBottom: 5 },

  // ✅ Picker 스타일 추가
  pickerContainer: {
    width: 200,
    backgroundColor: '#ffffff',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    elevation: 5, // ✅ Android에서 드롭다운이 보이도록
  },
  picker: {
    height: 50,
    width: '100%',
    backgroundColor: '#f0f0f0',
    color: '#333',
  },
  pickerItem: {
    fontSize: 16,
    textAlign: 'center',
  },

  // ✅ 버튼 스타일
  largeButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginVertical: 5,
    width: 300,
    alignItems: 'center',
  },
  SmallButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginVertical: 5,
    width: 250,
    alignItems: 'center',
  },
  sendButton: {
    backgroundColor: '#28A745',
  },
  buttonText: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: 'bold',
  },
});

