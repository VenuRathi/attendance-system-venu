#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <SPI.h>
#include <MFRC522.h>

#define SS_PIN 5
#define RST_PIN 2

#define GREEN_LED 26
#define RED_LED 27
#define BUZZER 15

// ⚠️ USE 2.4GHz WiFi or hotspot
const char* ssid = "Home 803";
const char* password = "04062008";

const char* serverUrl = "https://attendance-system-ul60.onrender.com/attendance";
const char* apiKey = "ESP32_SECRET_KEY_123";

MFRC522 rfid(SS_PIN, RST_PIN);
LiquidCrystal_I2C lcd(0x27,16,2);

void connectWiFi(){
  Serial.println("Starting WiFi...");
  Serial.print("Connecting to: ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  lcd.clear();
  lcd.print("Connecting WiFi");

  int attempts = 0;
  while(WiFi.status() != WL_CONNECTED && attempts < 20){
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if(WiFi.status() == WL_CONNECTED){
    Serial.println("\nWiFi Connected!");
    Serial.println(WiFi.localIP());

    lcd.clear();
    lcd.print("WiFi Connected");
    delay(1000);

    lcd.clear();
    lcd.print("Scan Card...");
  } else {
    Serial.println("\nWiFi Connection Failed!");
    lcd.clear();
    lcd.print("WiFi Failed!");
    delay(2000);
    ESP.restart(); // Restart if WiFi fails
  }
}

void sendToServer(String uid){
  if(WiFi.status() != WL_CONNECTED){
    Serial.println("WiFi not connected!");
    return;
  }

  Serial.println("Sending to server...");
  Serial.print("UID: ");
  Serial.println(uid);

  HTTPClient http;

  // 🔥 IMPORTANT: Allow insecure HTTPS for testing
  http.setInsecure();

  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-API-KEY", apiKey);

  // 🔥 ONLY UID (backend handles name)
  String json = "{\"uid\":\"" + uid + "\"}";

  Serial.print("Sending JSON: ");
  Serial.println(json);

  int code = http.POST(json);
  String response = http.getString();

  Serial.println("HTTP Code: " + String(code));
  Serial.println("Response: " + response);

  // 🔥 HANDLE RESPONSE
  lcd.clear();

  if(code == 200){
    if(response.indexOf("success") != -1){
      Serial.println("✅ Attendance marked successfully!");
      lcd.print("Attendance OK");

      digitalWrite(GREEN_LED, LOW);

      for(int i=0;i<3;i++){
        digitalWrite(BUZZER, HIGH);
        delay(150);
        digitalWrite(BUZZER, LOW);
        delay(150);
      }

      digitalWrite(GREEN_LED, HIGH);
    }
    else if(response.indexOf("duplicate") != -1){
      Serial.println("⚠️ Already marked for this lecture!");
      lcd.print("Already Marked");

      for(int i=0;i<2;i++){
        digitalWrite(RED_LED, HIGH);
        digitalWrite(BUZZER, HIGH);
        delay(200);
        digitalWrite(RED_LED, LOW);
        digitalWrite(BUZZER, LOW);
        delay(200);
      }
    }
    else if(response.indexOf("invalid") != -1){
      Serial.println("❌ Invalid card!");
      lcd.print("Invalid Card");

      digitalWrite(RED_LED, HIGH);
      delay(1000);
      digitalWrite(RED_LED, LOW);
    }
    else {
      Serial.println("❓ Unknown response format");
      lcd.print("Unknown Response");
      delay(2000);
    }
  }
  else {
    Serial.println("❌ HTTP Error: " + String(code));
    lcd.print("Server Error");
    lcd.setCursor(0,1);
    lcd.print("Code: " + String(code));

    // Flash red LED for error
    for(int i=0;i<3;i++){
      digitalWrite(RED_LED, HIGH);
      delay(300);
      digitalWrite(RED_LED, LOW);
      delay(300);
    }
  }

  http.end();
}

void setup(){
  Serial.begin(115200);
  Serial.println("ESP32 RFID Attendance System Starting...");

  SPI.begin();
  rfid.PCD_Init();

  Serial.println("RFID Reader initialized");

  Wire.begin(21,22);

  lcd.init();
  lcd.backlight();

  pinMode(GREEN_LED, OUTPUT);
  pinMode(RED_LED, OUTPUT);
  pinMode(BUZZER, OUTPUT);

  // Turn off LEDs initially
  digitalWrite(GREEN_LED, HIGH); // Active LOW
  digitalWrite(RED_LED, HIGH);   // Active LOW

  connectWiFi();

  Serial.println("Setup complete. Ready to scan cards!");
}

void loop(){
  // Check WiFi connection
  if(WiFi.status() != WL_CONNECTED){
    Serial.println("WiFi disconnected! Reconnecting...");
    connectWiFi();
    return;
  }

  if (!rfid.PICC_IsNewCardPresent()) return;
  if (!rfid.PICC_ReadCardSerial()) return;

  String uid="";

  for(byte i=0;i<rfid.uid.size;i++){
    uid += String(rfid.uid.uidByte[i],HEX);
  }

  uid.toUpperCase();
  Serial.println("Card detected! UID: " + uid);

  // 🔥 SEND TO BACKEND DIRECTLY
  sendToServer(uid);

  delay(2000);

  lcd.clear();
  lcd.print("Scan Card...");

  rfid.PICC_HaltA();
}