#include <SoftwareSerial.h>

// Initialize SoftwareSerial for SIM900 (RX=7, TX=8)
// Make sure to cross-connect: Arduino Pin 7 to SIM900 TX, Arduino Pin 8 to SIM900 RX
SoftwareSerial sim900(7, 8); 

// The public tunnel URL we created earlier
const String API_URL = "https://expletive-glamour-liberty.ngrok-free.dev/api/feedback";

void setup() {
  // Start serial monitor for debugging
  Serial.begin(9600);
  
  // Start serial communication with the SIM900 module
  sim900.begin(9600);
  
  Serial.println("Initializing SIM900...");
  delay(3000);
  
  // Set SMS to text mode
  sim900.println("AT+CMGF=1"); 
  delay(1000);
  
  // Configure module to route incoming SMS directly to serial
  sim900.println("AT+CNMI=2,2,0,0,0"); 
  delay(1000);
  
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
    
    // The C# app sends commands like: SEND:+639123456789:Hello there
    if (command.startsWith("SEND:")) {
      // Find the colons to split the string
      int firstColon = command.indexOf(':');
      int secondColon = command.indexOf(':', firstColon + 1);
      
      if (firstColon > -1 && secondColon > -1) {
        String outPhone = command.substring(firstColon + 1, secondColon);
        String outMsg = command.substring(secondColon + 1);
        
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
  sim900.print("AT+CMGS=\"");
  sim900.print(phone);
  sim900.println("\""); 
  delay(1000);
  
  sim900.print(msg); 
  delay(100);
  
  sim900.write(26); // Send CTRL+Z
  delay(3000);
  
  Serial.println("Outbound SMS sent to: " + phone);
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
  int firstNewLine = rawData.indexOf('\n');
  if (firstNewLine > -1) {
    String msg = rawData.substring(firstNewLine + 1);
    msg.trim(); // Remove leading/trailing whitespace
    return msg;
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
