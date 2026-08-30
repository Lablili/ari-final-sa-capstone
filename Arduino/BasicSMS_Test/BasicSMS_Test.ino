#include <SoftwareSerial.h>

// Connect SIM900 TX to Arduino Pin 7, and RX to Arduino Pin 8
SoftwareSerial mySerial(7, 8); 

void setup() {
  // Start the laptop communication
  Serial.begin(9600);
  
  // Start the SIM900 communication (Try 9600, or 19200, or 115200 if it gives gibberish)
  mySerial.begin(4800);

  Serial.println("Initializing...");
  delay(1000);

  // Send a basic handshake to wake it up
  mySerial.println("AT");
}

void loop() {
  // If the SIM900 says something, print it to the laptop
  if (mySerial.available()) {
    Serial.write(mySerial.read());
  }
  
  // If you type something on the laptop, send it to the SIM900
  if (Serial.available()) {
    mySerial.write(Serial.read());
  }
}
