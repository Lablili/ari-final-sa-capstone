#include <SoftwareSerial.h>

// Initialize SoftwareSerial for SIM900 (RX=7, TX=8)
SoftwareSerial sim900(7, 8); 

// The public tunnel URL we created earlier
const String API_URL = "https://expletive-glamour-liberty.ngrok-free.dev/api/feedback";

void setup() {
  // Start serial monitor for debugging (115200 matches C# perfectly!)
  Serial.begin(115200);
  
  // Start serial communication with the SIM900 module
  sim900.begin(9600);
  
  Serial.println("Initializing SIM900...");
  delay(2000);

  Serial.println("Syncing Baud Rate with SIM900...");
  for (int i = 0; i < 5; i++) {
    sim900.println("AT");
    delay(500);
  }
  sim900.println("AT+IPR=9600"); // Lock the speed
  delay(500);
  
  // Set SMS to text mode
  sim900.println("AT+CMGF=1"); 
  delay(1000);
  
  // Configure module to route incoming SMS directly to serial
  sim900.println("AT+CNMI=2,2,0,0,0"); 
  delay(1000);
  
  while(sim900.available()) sim900.read();
  
  Serial.println("System Ready. Waiting for SMS...");
}

void loop() {
  // -------------------------------------------------------------
  // 1. INBOUND: Wait for incoming SMS from sim900 (Fisherman -> System)
  // -------------------------------------------------------------
  if (sim900.available()) {
    String incomingData = sim900.readString();
    Serial.println("Raw Data Received:");
    Serial.println(incomingData);
    
    // Check if the data contains an SMS (+CMT)
    if(incomingData.indexOf("+CMT:") > -1) {
      String phoneNumber = extractPhoneNumber(incomingData); 
      String messageContent = extractMessage(incomingData);
      
      Serial.println("Phone: " + phoneNumber);
      Serial.println("Message: " + messageContent);
      
      if(phoneNumber != "" && messageContent != "") {
          // Send the data to your C# API via GPRS
          sendDataToAPI(phoneNumber, messageContent);
      }
    }
  }

  // -------------------------------------------------------------
  // 2. OUTBOUND: Listen for commands from the C# laptop via USB
  // -------------------------------------------------------------
  if (Serial.available()) {
    String command = Serial.readStringUntil('\n');
    command.trim();
    
    // The C# app sends commands like: SEND,09123456789,Hello there
    if (command.startsWith("SEND,")) {
      // Find the commas to split the string
      int firstComma = command.indexOf(',');
      int secondComma = command.indexOf(',', firstComma + 1);
      
      if (firstComma > -1 && secondComma > -1) {
        String outPhone = command.substring(firstComma + 1, secondComma);
        String outMsg = command.substring(secondComma + 1);
        
        Serial.println("System requested Outbound SMS.");
        sendSMSOutbound(outPhone, outMsg);
      }
    } else {
      // Allow raw AT commands for debugging
      sim900.println(command); 
    }
  }
}

// Function to actually send the outbound SMS
void sendSMSOutbound(String phone, String msg) {
  // Strip hidden C# carriage returns that break the Ctrl+Z command!
  msg.replace("\r", "");
  msg.replace("\n", "");

  // Clear memory
  while(sim900.available()) sim900.read(); 

  // Force Echo OFF before we do anything!
  sim900.println("ATE0"); 
  delay(500);
  while(sim900.available()) sim900.read();

  sim900.println("AT+CMGF=1");
  delay(500);
  while(sim900.available()) sim900.read();

  sim900.print("AT+CMGS=\"");
  sim900.print(phone);
  sim900.println("\""); 
  delay(1000);
  
  while(sim900.available()) sim900.read();
  
  Serial.print("[GSM-DEBUG] > ");
  Serial.println(msg);
  
  // Send the clean text using print (NOT println)
  sim900.print(msg); 
  delay(500);
  
  // Clear any echoing before sending Ctrl+Z
  while(sim900.available()) sim900.read();

  // Send CTRL+Z using print (NOT println)
  sim900.print((char)26); 
  Serial.println("-> Handed off to Cell Tower. Waiting for SIM900...");
  
  unsigned long startTime = millis();
  bool success = false;
  bool finished = false;
  String response = "";

  while (millis() - startTime < 20000 && !finished) {
    if (sim900.available()) {
      char c = sim900.read();
      response += c;
      if (response.indexOf("OK") != -1) {
        success = true;
        finished = true;
      }
      if (response.indexOf("ERROR") != -1) {
        success = false;
        finished = true;
      }
    }
  }

  if (success) {
    Serial.println("SENT:" + phone);
  } else {
    Serial.println("FAILED:" + phone);
  }
}

String extractPhoneNumber(String rawData) {
  // Typical format: +CMT: "+639123456789","","23/05/25,12:00:00+32"
  int firstQuote = rawData.indexOf('"');
  int secondQuote = rawData.indexOf('"', firstQuote + 1);
  if (firstQuote > -1 && secondQuote > -1) {
    return rawData.substring(firstQuote + 1, secondQuote);
  }
  return "";
}

String extractMessage(String rawData) {
  // The message body is on the next line after the +CMT header
  int cmtIndex = rawData.indexOf("+CMT:");
  if (cmtIndex > -1) {
    int newLineAfterCmt = rawData.indexOf('\n', cmtIndex);
    if (newLineAfterCmt > -1) {
      String msg = rawData.substring(newLineAfterCmt + 1);
      msg.trim(); // Remove leading/trailing whitespace
      return msg;
    }
  }
  return "";
}

void sendDataToAPI(String phone, String msg) {
  Serial.println("Connecting to GPRS...");
  
  // Initialize GPRS and HTTP
  sim900.println("AT+SAPBR=3,1,\"Contype\",\"GPRS\"");
  delay(1000);
  
  // *** IMPORTANT: Change "internet" to your telco's APN ***
  // Globe: internet.globe.com.ph 
  // Smart: smartlte
  sim900.println("AT+SAPBR=3,1,\"APN\",\"internet\""); 
  delay(1000);
  
  sim900.println("AT+SAPBR=1,1"); // Enable bearer
  delay(3000);
  
  sim900.println("AT+HTTPINIT"); // Init HTTP
  delay(1000);
  
  // Set the API URL
  sim900.print("AT+HTTPPARA=\"URL\",\"");
  sim900.print(API_URL);
  sim900.println("\"");
  delay(1000);
  
  sim900.println("AT+HTTPPARA=\"CONTENT\",\"application/json\"");
  delay(1000);
  
  // Construct the JSON string (escaping quotes)
  String jsonPayload = "[{\"Contact\":\"" + phone + "\",\"Msg\":\"" + msg + "\",\"Subject\":\"Hardware SMS\"}]";
  
  // Send the data length
  sim900.print("AT+HTTPDATA=");
  sim900.print(jsonPayload.length());
  sim900.println(",10000");
  delay(1000);
  
  // Send the actual JSON payload
  sim900.println(jsonPayload);
  delay(2000);
  
  Serial.println("Sending HTTP POST...");
  // Execute POST request
  sim900.println("AT+HTTPACTION=1");
  delay(5000);
  
  // Terminate HTTP and GPRS
  sim900.println("AT+HTTPTERM");
  delay(1000);
  
  Serial.println("Data Sent!");
}
