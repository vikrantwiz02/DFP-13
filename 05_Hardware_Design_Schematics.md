# Chapter 5: Hardware Design & Electrical Schematics
## Arduino UNO + 3 Servo Motor Architecture

---

## 5.1 System Overview - 3 Servo Motor Design

Our braille plotter uses a **simplified 3-servo architecture** based on Arduino UNO, as shown in your circuit diagram:

- **X-Axis Servo Motor**: Controls horizontal movement of the stylus carriage
- **Y-Axis Servo Motor**: Controls vertical movement of the paper platform  
- **Stylus Holder Servo Motor**: Actuates the braille stylus to emboss dots

This design eliminates the complexity of stepper motors and drivers, making the system:
- **Simpler** - fewer components, easier assembly
- **Cheaper** - 3 servos cost $15-24 total vs. $60+ for steppers+drivers
- **Quieter** - no stepper motor noise
- **More accessible** - standard hobby servos available everywhere
- **Beginner-friendly** - Arduino Servo library makes programming trivial

---

## 5.2 Mechanical Design - 3 Servo Architecture

### 5.2.1 XY Plotter Mechanism

As shown in your circuit diagram, this design uses **3 standard hobby servo motors** for all motion:

**X-Axis Servo Motor (MG996R):**
- Controls horizontal (left-right) movement
- Servo arm connected to stylus carriage via linkage or rack-and-pinion
- 180° rotation maps to ~200mm horizontal travel
- Mounted on base frame, drives carriage along X rail

**Y-Axis Servo Motor (MG996R):**
- Controls vertical (forward-backward) movement
- Rotates paper platform or moves entire X-axis assembly
- 180° rotation maps to ~280mm vertical travel
- Similar linkage mechanism to X-axis

**Stylus Holder Servo Motor (SG90):**
- Actuates the braille stylus up/down
- Small rotation (20-30°) for embossing motion
- Direct mechanical link to stylus tip
- Creates 0.5-0.8mm raised dots on paper

**Mechanical Structure:**
- **Frame:** Lightweight wood, acrylic sheets, or 3D printed parts
- **Build Area:** ~200×280mm (covers A4 size paper)
- **Paper Platform:** Black acrylic or MDF backing (6-10mm thick) - acts as braille slate
- **Linear Guides:** Smooth rods (6-8mm diameter) or rails for X/Y carriage movement
- **Linkages:** 3D printed or laser-cut arms connecting servo horns to linear motion
- **Belt/Pulley:** Optional GT2 belt system for smoother motion (vs. direct linkage)

**Key Advantages of This Design:**
1. **Simplicity** - No motor drivers needed, direct PWM control from Arduino
2. **Cost** - Total motor cost $15-24 (vs. $60+ for steppers+drivers)
3. **Ease** - Beginner-friendly Arduino Servo library
4. **Quiet** - Much quieter than stepper motors
5. **Available** - Standard hobby servos sold in every electronics store
6. **Robust** - Metal gear servos (MG996R) handle mechanical loads well

### 5.2.2 Stylus Mechanism Design

**Servo-Driven Braille Stylus:**
- **Servo Model:** SG90 (9g micro servo) or MG90S (metal gear upgrade)
- **Rotation Range:** 20-30° travel (0° = stylus up, 30° = emboss down)
- **Stylus Tip:** Steel ball-point or rounded pin (1.5mm diameter)
- **Force Generation:** Servo torque ~1.8-2.5 kg-cm converts to 2-3N force at tip
- **Embossing Depth:** 0.6-0.8mm penetration into 140-160 GSM paper
- **Cycle Time:** <100ms per dot (move down → press → lift up)
- **Mounting:** Servo attached to X-axis carriage, moves with stylus

**Mechanical Diagram (Cross-Section):**
```
    [SG90 Servo Motor]
         |
    [Servo Horn] --- 30° rotation
         |
    [Linkage Arm]
         |
    [Stylus Shaft] ---> Guided by sleeve bearing
         |
    [Steel Ball Tip] ──┐
                       │ 0.6-0.8mm depth
    ═══════════════════╧═══  [Paper 140-160 GSM]
    ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  [Acrylic/MDF Backing Plate]
```

**Force Calculation:**
- Required embossing force: ~2-3N (from braille literature)
- SG90 torque: 1.8 kg-cm @ 5V = 0.177 N-m
- With 2cm lever arm: Force = 0.177/0.02 = 8.85N (sufficient!)
- Actual tip force ~3-4N after mechanical losses

### 5.2.3 Paper Handling System

**Paper Support:**
- Black acrylic or MDF board (8-10mm thick) as rigid backing
- Surface flatness critical: within 0.1mm across entire print area
- Optional: thin rubber mat (0.5-1mm) between paper and backing for better embossing

**Paper Positioning:**
- Corner registration pins for consistent paper alignment
- Spring clips or magnetic holders to secure paper during printing
- Paper size: Standard braille paper 11×11 inches or A4

**Optional Sensors:**
- IR reflective sensor (TCRT5000) to detect paper presence
- Connected to Arduino analog pin A0

---

## 5.3 Electronic Components Selection

### 5.3.1 Microcontroller: Arduino UNO R3

**Specifications:**
- **Chip:** ATmega328P (8-bit AVR microcontroller)
- **Clock Speed:** 16 MHz
- **Memory:** 
  - 2 KB SRAM (runtime variables)
  - 32 KB Flash (program storage)
  - 1 KB EEPROM (persistent data)
- **Digital I/O:** 14 pins (6 with hardware PWM on pins 3, 5, 6, 9, 10, 11)
- **Analog Input:** 6 pins (10-bit ADC, 0-1023 range)
- **Power:** 5V logic, 7-12V DC input via barrel jack or USB (5V)
- **Programming:** USB interface (CH340 or ATmega16U2 chip)
- **Dimensions:** 68.6×53.4mm
- **Cost:** $3-5 (compatible clone) or $25 (genuine Arduino)

**Why Arduino UNO for This Project:**
1. **Beginner-friendly** - Massive tutorials, examples, community support
2. **Servo library** - Built-in library provides smooth PWM control
3. **Widely available** - Every electronics store and online shop stocks it
4. **Reliable** - Proven platform used in thousands of robotics projects
5. **Expandable** - Easy to add shields (Bluetooth, SD card, LCD, motor)
6. **Low cost** - Clones available for $3-5 with identical functionality

**Pin Assignment (Detailed in Section 5.4.1)**

### 5.3.2 Servo Motors (3x Required)

**X-Axis & Y-Axis Servos (2x):**

- **Model:** MG996R or MG995 (metal gear, high torque servo)
- **Torque:** 9.4-11 kg-cm @ 4.8V, 11-13 kg-cm @ 6V
- **Speed:** 0.17 sec/60° @ 4.8V, 0.14 sec/60° @ 6V
- **Rotation:** 180° (120° usable for linear motion)
- **Voltage:** 4.8-7.2V (typically run at 5-6V)
- **Current:** 500mA idle, 900mA-2.5A stall
- **PWM Signal:** 50 Hz, 1.0-2.0ms pulse width (1.5ms = center)
- **Gear Material:** Metal gears (brass/steel) for durability
- **Weight:** ~55g
- **Dimensions:** 40×20×38mm
- **Cost:** ~$8-12 each

**Why MG996R:**
- High torque needed to move carriage and paper platform
- Metal gears withstand repeated motion without wear
- Affordable and widely available
- Standard servo mounting holes for easy mechanical integration

**Stylus Holder Servo (1x):**

- **Model:** SG90 micro servo (9g) or MG90S (metal gear upgrade)
- **Torque:** 1.8 kg-cm @ 5V (SG90), 2.5 kg-cm @ 6V (MG90S)
- **Speed:** 0.10 sec/60° @ 4.8V (very fast response)
- **Rotation:** 180° total (only using 20-30° for embossing)
- **Voltage:** 4.8-6V
- **Current:** 100mA idle, 500mA stall
- **Weight:** 9g (SG90), 13g (MG90S)
- **Dimensions:** 22×12×29mm (compact)
- **Cost:** ~$2-4 (SG90) or $5-8 (MG90S)

**Why SG90/MG90S:**
- Lightweight (doesn't add much load to X-axis carriage)
- Fast actuation (<100ms cycle) for efficient printing
- Sufficient torque for stylus embossing
- Very affordable

**Servo Wire Colors (Industry Standard):**
- **Orange/Yellow:** PWM signal wire → connects to Arduino PWM pins
- **Red:** Power (+5V) → connects to 5V power rail
- **Brown/Black:** Ground → connects to common ground

### 5.3.3 Power Supply System

**Challenge:** Arduino UNO's onboard 5V regulator can only provide **500mA max**. Three servos under load draw **2-3A peak** (far exceeding Arduino capacity).

**Solution:** Use external 5-6V power supply dedicated for servos.

---

**Option A: Separate 5V/6V Supply for Servos (RECOMMENDED)**

- **9V Battery** (or 9V/2A wall adapter) → **DC-DC Buck Converter** → **5V/3A** dedicated servo rail
- **Arduino powered separately** via USB (programming) or barrel jack (standalone)
- **Reason:** Prevents servos from brownout-resetting the Arduino

**Wiring:**
1. 9V adapter → Buck converter input (Vin+, Vin-)
2. Buck converter output set to 5.0V using onboard potentiometer (measure with multimeter)
3. Buck 5V output → All servo red wires (connected in parallel)
4. Buck GND → All servo brown wires + Arduino GND (common ground essential!)
5. Arduino powered via USB or separate 9V to Vin pin

**Buck Converter Module:**
- Model: LM2596 DC-DC step-down module (or XL4015, MP1584)
- Input: 7-40V DC
- Output: Adjustable 1.25-35V (set to 5.0V)
- Current: 3A continuous (sufficient for 3 servos)
- Cost: $1-3
- Features: Built-in protection (overcurrent, thermal)

---

**Option B: Single 9V Power Supply (Alternative)**

- **9V/3A wall adapter** → split to:
  - Arduino Vin pin (powers ATmega328P via onboard 5V regulator)
  - Buck converter → 5V/3A for servos
- **Total current draw:** 200mA (Arduino) + 3A (servos) = 3.2A peak
- Use **9V/5A adapter** to be safe

---

**Power Distribution Diagram:**
```
9V DC Adapter (3-5A)
  │
  ├─→ Arduino Vin pin (7-12V input, onboard regulator creates 5V for ATmega)
  │
  └─→ Buck Converter (LM2596) Input
        ├─ Set output to 5.0V using potentiometer
        │
        └─→ 5V/3A Output Rail
             ├─→ X-Axis Servo Red wire (MG996R)
             ├─→ Y-Axis Servo Red wire (MG996R)
             └─→ Stylus Servo Red wire (SG90)

Common Ground Connection (CRITICAL!):
  9V GND ─┬─ Arduino GND pin
          ├─ Buck converter GND output
          ├─ X-Axis Servo Brown wire
          ├─ Y-Axis Servo Brown wire
          └─ Stylus Servo Brown wire
```

**Decoupling Capacitors (Recommended):**
- Place **100µF electrolytic** capacitor across servo power rail (near servos)
- Reduces voltage spikes when servos start/stop
- Prevents brown-outs and improves stability

---

### 5.3.4 Bluetooth Module - HC-05 or HC-06

**HC-05 Bluetooth Serial Module:**

- **Protocol:** Bluetooth 2.0/2.1 SPP (Serial Port Profile)
- **Range:** ~10 meters (open space)
- **Baud Rate:** 9600 default (configurable 1200-115200)
- **Voltage:** 3.6-6V (typically powered from Arduino 5V)
- **Current:** 30mA active, 8mA paired
- **Pins:** VCC, GND, TX, RX, EN (enable), STATE (connection status)
- **Cost:** $3-6

**HC-06 Alternative (Simpler):**
- Slave-only mode (cannot initiate pairing)
- Easier setup for beginners
- Same pinout and cost

**Connection to Arduino:**

**Important:** HC-05 RX pin is 3.3V logic, but Arduino TX outputs 5V. **Need voltage divider!**

```
HC-05 Module     Arduino UNO
────────────     ───────────
VCC        →     5V pin (or 3.3V pin for safer operation)
GND        →     GND
TX         →     Digital Pin 2 (SoftwareSerial RX) - direct OK
RX         →     Digital Pin 3 (SoftwareSerial TX) - NEEDS VOLTAGE DIVIDER!
EN         →     (Optional: HIGH to enter AT mode for config)
STATE      →     (Optional: monitor connection status)
```

**Voltage Divider for HC-05 RX Pin:**
```
Arduino Pin 3 (5V) ──┬── 1kΩ resistor ──→ HC-05 RX pin (3.3V safe)
                     │
                     └── 2kΩ resistor ──→ GND

Voltage at HC-05 RX = 5V × (2kΩ / (1kΩ + 2kΩ)) = 3.33V ✓
```

**Why Use Software Serial (Pins 2,3) Instead of Hardware Serial (Pins 0,1)?**
- Hardware UART (pins 0,1) shared with USB programming
- Using pins 0,1 for Bluetooth causes upload errors
- SoftwareSerial library allows UART on any digital pins
- Keeps USB available for debugging

---

### 5.3.5 Additional Components

**Limit Switches (Optional but Recommended):**
- **Type:** Mechanical microswitches with lever arm
- **Quantity:** 2x (X-min, Y-min for homing)
- **Wiring:** Normally-open (NO) configuration
  - One pin → Arduino digital pin (with internal pull-up enabled)
  - Other pin → GND
  - When pressed, pin reads LOW; when released, reads HIGH
- **Use:** Home positioning at startup (zero calibration)
- **Cost:** $0.50 each

**Power LED Indicator:**
- **Component:** 5mm LED (red) + 220Ω resistor
- **Connection:** Arduino 5V pin → resistor → LED anode → LED cathode → GND
- **Purpose:** Visual confirmation of power-on

**Status LED (Optional):**
- **Component:** 5mm LED (green) + 220Ω resistor  
- **Connection:** Arduino Pin 13 → resistor → LED → GND
- **Purpose:** Blink patterns for status (printing, idle, error)

**Emergency Stop Button:**
- **Component:** Push-button (normally open)
- **Connection:** Arduino RESET pin → button → GND
- **Purpose:** Immediate hardware reset in case of malfunction

---

## 5.4 Complete Circuit Diagram

### 5.4.1 Arduino UNO Pinout Table

Based on your attached circuit design:

| **Arduino Pin** | **Type** | **Function** | **Connected To** | **Wire Color** | **Notes** |
|---|---|---|---|---|---|
| **Digital Pin 9** | PWM Output | X-Axis Servo Control | X-Axis Servo Signal (Orange) | Orange | 50Hz PWM, 1-2ms pulse |
| **Digital Pin 10** | PWM Output | Y-Axis Servo Control | Y-Axis Servo Signal (Orange) | Orange | 50Hz PWM, 1-2ms pulse |
| **Digital Pin 11** | PWM Output | Stylus Servo Control | Stylus Servo Signal (Orange) | Orange | 50Hz PWM, 1-2ms pulse |
| **Digital Pin 2** | Input | Bluetooth RX (Software Serial) | HC-05 TX Pin | - | Receives data from phone |
| **Digital Pin 3** | Output | Bluetooth TX (Software Serial) | HC-05 RX (via voltage divider) | - | Sends data to phone |
| **Digital Pin 4** | Input | X-Axis Limit Switch | Microswitch (Normally Open) | Black | Optional, with pull-up |
| **Digital Pin 5** | Input | Y-Axis Limit Switch | Microswitch (Normally Open) | Black | Optional, with pull-up |
| **Digital Pin 13** | Output | Status LED | LED + 220Ω resistor | - | Built-in LED also blinks |
| **Analog Pin A0** | Analog Input | Paper Sensor (Optional) | TCRT5000 OUT Pin | - | 10-bit ADC (0-1023) |
| **5V Pin** | Power Output | (Reference Only) | NOT used for servos | - | Max 500mA from USB |
| **GND Pin** | Ground | Common Ground | All GND wires (critical!) | Black/Brown | Multiple GND pins available |
| **Vin Pin** | Power Input | External 9V Supply | 9V DC adapter positive | Red | 7-12V DC input |
| **RESET Pin** | Input | Emergency Stop | Push-button to GND | - | Hardware reset |

**Important Notes:**
- **Servo power (red wires)** connect to external 5V buck converter, NOT Arduino 5V pin
- **All grounds must be common:** Arduino GND, buck GND, servo brown wires, battery GND
- **PWM pins 9, 10, 11** chosen for hardware PWM (smoother servo control than software PWM)

---

### 5.4.2 Wiring Diagram - Text Representation

```
┌──────────────────────────────────────────────────────────────────┐
│                       ARDUINO UNO R3                             │
│                                                                  │
│  [Digital Pin 9  PWM] ────orange──→ X-Axis Servo Signal Wire    │
│  [Digital Pin 10 PWM] ────orange──→ Y-Axis Servo Signal Wire    │
│  [Digital Pin 11 PWM] ────orange──→ Stylus Servo Signal Wire    │
│                                                                  │
│  [Digital Pin 2]      ────────────→ HC-05 TX (Bluetooth)        │
│  [Digital Pin 3]      ─┬──────────→ 1kΩ ──→ HC-05 RX            │
│                        └──────────→ 2kΩ ──→ GND (divider)       │
│                                                                  │
│  [Digital Pin 4]      ←───────────  X-Limit Switch (to GND)     │
│  [Digital Pin 5]      ←───────────  Y-Limit Switch (to GND)     │
│                                                                  │
│  [Analog Pin A0]      ←───────────  Paper Sensor (TCRT5000)     │
│                                                                  │
│  [5V Pin]             ────────────→ HC-05 VCC (Bluetooth power) │
│  [GND Pin]            ────┬───────→ Common Ground Rail          │
│  [Vin Pin]            ←───┘                                     │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
         │                        │
         │                        │
    [9V Adapter]            [Buck Converter]
         │                    LM2596 Module
         │                        │
         ├──→ Arduino Vin    Input: 9V
         │                   Output: 5.0V/3A (adjusted)
         │                        │
         └──→ Buck Input          ├──→ 5V Servo Power Rail ──┬──→ X-Servo Red
                                  │                           ├──→ Y-Servo Red
                                  │                           └──→ Stylus Red
                                  │
                              GND ├──→ Common Ground ─────────┬──→ X-Servo Brown
                                  │                           ├──→ Y-Servo Brown
                                  │                           ├──→ Stylus Brown
                                  │                           ├──→ Arduino GND
                                  │                           └──→ 9V Adapter GND
```

---

### 5.4.3 Servo Connections (All 3 Identical)

Each servo has **3 wires** with standard color coding:

```
Servo Connector (Standard)
─────────────────────────
Orange/Yellow wire  →  PWM Signal (Arduino Pin 9, 10, or 11)
Red wire           →  +5V Power (from Buck Converter output)
Brown/Black wire   →  Ground (common GND rail)
```

**X-Axis Servo (MG996R):**
- Orange → Arduino Pin 9
- Red → 5V servo rail (buck converter)
- Brown → GND rail

**Y-Axis Servo (MG996R):**
- Orange → Arduino Pin 10
- Red → 5V servo rail (buck converter)
- Brown → GND rail

**Stylus Servo (SG90):**
- Orange → Arduino Pin 11
- Red → 5V servo rail (buck converter)
- Brown → GND rail

---

### 5.4.4 Power Distribution Details (CRITICAL!)

**Why External 5V Power for Servos is Mandatory:**

Arduino UNO's onboard 5V regulator (from USB or Vin) can provide **maximum 500mA**. Servo current draw:

| Servo | Idle Current | Active Current | Stall Current |
|---|---|---|---|
| MG996R X-Axis | 100mA | 500-800mA | 2.5A |
| MG996R Y-Axis | 100mA | 500-800mA | 2.5A |
| SG90 Stylus | 50mA | 200-300mA | 500mA |
| **Total** | **250mA** | **1.5-2A** | **5.5A** |

Even normal operation (1.5-2A) **exceeds Arduino's 500mA limit** by 3-4x!

**Consequences of underpowering:**
- Servos jitter and fail to reach position
- Arduino browns out and resets randomly
- USB port on computer can be damaged

**Solution:** Dedicated 5V/3A buck converter powered from 9V supply.

---

**Buck Converter Setup Instructions:**

1. **Connect buck module:** 9V+ → Vin+, 9V- → Vin-
2. **Adjust output voltage:**
   - Use multimeter on Vout+/Vout- terminals
   - Turn potentiometer (small screw) clockwise to increase voltage
   - Set precisely to **5.0V** (5.1-5.2V is OK, don't exceed 6V for SG90)
3. **Connect servos:** All red wires to Vout+, all brown wires to Vout-
4. **Common ground:** Buck Vout- MUST connect to Arduino GND pin

---

### 5.4.5 Bluetooth Module Wiring Detail

**HC-05 Pin Connections:**

```
HC-05 Pin    →    Arduino Pin / Component
─────────────────────────────────────────
VCC (Power)  →    Arduino 5V pin (30mA draw - safe)
GND          →    Arduino GND pin
TX (Output)  →    Arduino Digital Pin 2 (SoftwareSerial RX)
RX (Input)   →    Voltage Divider → Arduino Digital Pin 3
EN (Enable)  →    Not connected (or tie to VCC for normal mode)
STATE (LED)  →    Not connected (optional status monitor)
```

**Voltage Divider Circuit (Essential for 5V→3.3V conversion):**

```
Arduino Pin 3 (TX)
    │
    ├── 1kΩ resistor ──┬──→ HC-05 RX pin
    │                  │
    └── (no connection)│
                       │
                   2kΩ resistor
                       │
                      GND

Math: Vout = 5V × (2kΩ / 3kΩ) = 3.33V ✓ (safe for HC-05 3.3V logic)
```

**Alternative:** Use Arduino 3.3V pin to power HC-05 (then no divider needed, but less current available).

---

## 5.5 Bill of Materials (BOM) - Arduino + 3 Servo Design

### 5.5.1 Core Electronics

| **Component** | **Description** | **Quantity** | **Unit Price (USD)** | **Total** | **Supplier Notes** |
|---|---|---|---|---|---|
| Arduino UNO R3 | ATmega328P, USB | 1 | $5 | $5 | Compatible clone (CH340 USB chip) |
| MG996R Servo | High-torque, metal gear | 2 | $10 | $20 | X-Axis, Y-Axis |
| SG90 Micro Servo | 9g, plastic gear | 1 | $3 | $3 | Stylus actuation |
| HC-05 Bluetooth | Serial SPP module | 1 | $5 | $5 | Or HC-06 |
| LM2596 Buck Converter | DC-DC step-down, 3A | 1 | $2 | $2 | Adjustable output |
| 9V/5A Power Adapter | Wall supply, 5.5mm jack | 1 | $8 | $8 | Or 9V/3A minimum |
| Limit Switches | Microswitch, lever arm | 2 | $1 | $2 | Optional homing |
| Resistors (1kΩ, 2kΩ) | 1/4W carbon film | 1 pack | $1 | $1 | Voltage divider |
| LED + Resistors | Status indicators | 2 | $0.50 | $1 | Red, green LEDs |
| Electrolytic Capacitor | 100µF, 16V | 2 | $0.50 | $1 | Servo power decoupling |
| Jumper Wires | Male-male, male-female | 40 pcs | $3 | $3 | Assorted pack |
| Breadboard | 830 tie-points | 1 | $3 | $3 | For prototyping |

**Subtotal Electronics:** **$54**

---

### 5.5.2 Mechanical Components

| **Component** | **Description** | **Quantity** | **Unit Price** | **Total** | **Notes** |
|---|---|---|---|---|---|
| Acrylic Sheet (Black) | 10mm thick, 300×300mm | 1 | $15 | $15 | Base platform |
| Acrylic Sheet (Clear) | 3mm thick, 200×200mm | 1 | $5 | $5 | Hold-down bar |
| Smooth Rods | 8mm dia, 300mm length | 2 | $4 | $8 | X-axis rails |
| Linear Bearings | LM8UU (8mm ID) | 4 | $2 | $8 | For smooth rods |
| GT2 Timing Belt | 6mm width, 2m length | 1 | $5 | $5 | Alternative to linkage |
| GT2 Pulley (20-tooth) | 5mm bore | 2 | $3 | $6 | For belt drive (optional) |
| Servo Horns/Arms | Plastic, included w/ servos | - | - | $0 | Included |
| Linkage Rods | 3D printed or aluminum | 3 | $2 | $6 | Servo to linear motion |
| Ball-Point Stylus | Steel tip, 1.5mm | 1 | $5 | $5 | Custom fabricated |
| M3 Hardware | Screws, nuts, washers | 50 pcs | $5 | $5 | Assorted pack |
| Spring Clips | Paper hold-downs | 4 | $1 | $4 | Or magnetic holders |
| Wood/MDF Base | 12mm plywood, 350×350mm | 1 | $8 | $8 | Frame base |

**Subtotal Mechanical:** **$75**

---

### 5.5.3 Optional Components

| **Component** | **Description** | **Quantity** | **Unit Price** | **Total** | **Notes** |
|---|---|---|---|---|---|
| TCRT5000 Sensor | IR paper detect | 1 | $2 | $2 | Optional |
| SD Card Module | Data logging | 1 | $3 | $3 | For offline printing |
| LCD Display (16×2) | Status display | 1 | $5 | $5 | Optional UI |
| Push Buttons | User input | 3 | $0.50 | $1.50 | Start/Stop/Home |

**Subtotal Optional:** **$11.50**

---

### 5.5.4 Consumables & Tools

| **Item** | **Description** | **Cost** | **Notes** |
|---|---|---|---|
| Braille Paper | 140-160 GSM, 100 sheets | $10 | Practice/testing |
| 3D Printing Filament | PLA, 1kg spool | $20 | For linkages, mounts |
| Soldering Supplies | Wire, solder, flux | $5 | Assembly |
| Hot Glue / Epoxy | Adhesives | $5 | Mounting components |
| Screwdriver Set | Phillips, hex keys | $10 | (Often already owned) |

**Subtotal Consumables:** **$50**

---

### 5.5.5 Total Prototype Cost

| **Category** | **Cost (USD)** |
|---|---|
| Core Electronics | $54 |
| Mechanical Components | $75 |
| Optional Components | $12 |
| Consumables & Tools | $50 |
| **TOTAL** | **$191** |
| Contingency (20%) | $38 |
| **GRAND TOTAL** | **$229** |

**Note:** Prices are estimates based on AliExpress/eBay (low-cost suppliers). Local electronics stores may charge 20-50% more. Bulk purchases (10+ units) reduce cost by ~30%.

---

## 5.6 Assembly Instructions Overview

### 5.6.1 Electronics Assembly

1. **Test Arduino:** Upload "Blink" example to verify board works
2. **Test Servos:** Connect one servo to Pin 9, upload Servo Sweep example
3. **Setup Buck Converter:** Adjust output to exactly 5.0V (use multimeter)
4. **Wire Power Rails:** Create common 5V and GND rails on breadboard
5. **Connect All Servos:** Follow pinout table (PWM pins 9, 10, 11)
6. **Add Bluetooth:** Wire HC-05 with voltage divider for RX pin
7. **Test Communication:** Upload simple serial echo program
8. **Add Limit Switches:** Wire to pins 4, 5 with internal pull-ups

### 5.6.2 Mechanical Assembly

1. **Build Base Frame:** Cut and assemble wood/acrylic base platform
2. **Mount Linear Rails:** Attach smooth rods for X-axis motion
3. **Install X-Axis Servo:** Mount MG996R, attach linkage to carriage
4. **Install Y-Axis Servo:** Mount MG996R, attach to platform movement
5. **Mount Stylus Servo:** Attach SG90 to X-axis carriage
6. **Fabricate Stylus:** Create steel ball-point tip, connect to servo arm
7. **Install Paper Platform:** Mount acrylic backing with registration pins
8. **Cable Management:** Route servo wires neatly, avoid moving parts
9. **Add Limit Switches:** Position at X-min, Y-min corners
10. **Test Mechanical Range:** Manually move axes, verify 200×280mm travel

### 5.6.3 Calibration

1. **Servo Centering:** Set all servos to 90° (center position)
2. **Mechanical Zero:** Align carriage to X-min, Y-min (home position)
3. **Stylus Height:** Adjust so tip just touches paper at emboss angle
4. **Dot Depth Test:** Test various servo angles (20-30°) for 0.6mm dots
5. **Travel Limits:** Measure max X/Y travel, update firmware constants
6. **Speed Tuning:** Adjust servo movement speed for smooth, accurate motion

---

## 5.7 Firmware Architecture Overview

**Arduino Code Structure:**

```cpp
#include <Servo.h>
#include <SoftwareSerial.h>

// Servo objects
Servo servoX;      // X-axis servo on Pin 9
Servo servoY;      // Y-axis servo on Pin 10
Servo servoStylus; // Stylus servo on Pin 11

// Bluetooth serial
SoftwareSerial BT(2, 3); // RX=2, TX=3

// Configuration
const int STYLUS_UP = 0;    // Degrees (stylus retracted)
const int STYLUS_DOWN = 30; // Degrees (embossing)
const int EMBOSS_DELAY = 80; // ms (time to press dot)

void setup() {
  // Attach servos to PWM pins
  servoX.attach(9);
  servoY.attach(10);
  servoStylus.attach(11);
  
  // Initialize positions
  servoX.write(90);      // Center X
  servoY.write(90);      // Center Y
  servoStylus.write(STYLUS_UP); // Retract stylus
  
  // Start serial
  Serial.begin(9600);    // USB debug
  BT.begin(9600);        // Bluetooth
  
  pinMode(4, INPUT_PULLUP); // X-limit switch
  pinMode(5, INPUT_PULLUP); // Y-limit switch
  pinMode(13, OUTPUT);      // Status LED
  
  Serial.println("Braille Plotter Ready");
}

void loop() {
  // Read commands from Bluetooth
  if (BT.available()) {
    String command = BT.readStringUntil('\n');
    processCommand(command);
  }
}

void embossDot(int x, int y) {
  // Move to position (convert mm to servo angle)
  int angleX = map(x, 0, 200, 0, 180);
  int angleY = map(y, 0, 280, 0, 180);
  
  servoX.write(angleX);
  servoY.write(angleY);
  delay(200); // Wait for movement
  
  // Emboss dot
  servoStylus.write(STYLUS_DOWN);
  delay(EMBOSS_DELAY);
  servoStylus.write(STYLUS_UP);
  delay(50);
}

void processCommand(String cmd) {
  // Parse JSON: {"cmd":"dot", "x":10, "y":15}
  // Or simple format: D,10,15
  // Implementation in full firmware
}

void homeAxes() {
  // Move until limit switches triggered
  while(digitalRead(4) == HIGH) {
    servoX.write(servoX.read() - 1);
    delay(20);
  }
  // X-axis now at home (0,0)
}
```

**Full firmware detailed in Chapter 6.**

---

## 5.8 Advantages of This Design

| **Aspect** | **Our 3-Servo Design** | **Stepper Motor Alternative** |
|---|---|---|
| **Complexity** | Low (beginner-friendly) | High (requires drivers, tuning) |
| **Cost** | $20-24 (3 servos) | $60+ (motors + drivers) |
| **Noise** | Quiet | Loud (stepper whine) |
| **Code Complexity** | Simple Servo library | AccelStepper, step/dir logic |
| **Power Supply** | Single 5V rail | Multiple voltages (12V, 5V, 3.3V) |
| **Availability** | Every hobby store | Specialized robotics shops |
| **Precision** | ±1-2mm (sufficient) | ±0.1mm (overkill for braille) |
| **Speed** | Moderate (10-15 cpm) | Fast (30-60 cpm) |
| **Beginner-Friendly** | ✓✓✓ Excellent | ✗ Steep learning curve |

---

## 5.9 Key Design Considerations

### 5.9.1 Why This Design Works for Braille

**Braille Dot Spacing:** 2.5mm center-to-center
- Servo positioning accuracy: ±1-2mm (adequate!)
- No need for stepper motor precision (±0.1mm)

**Print Speed:** 10-15 characters per minute
- Fast enough for educational use (practice sheets)
- Servo movement (200ms/position) + emboss (80ms) = ~280ms/dot
- 6 dots/character × 280ms = 1.68sec/character ≈ 35 cpm theoretical
- Real-world: 10-15 cpm (with travel time between characters)

**Mechanical Simplicity:**
- 3D printable linkages (no precision machining)
- Standard hobby servos (no specialized parts)
- Direct PWM control (no complex firmware)

### 5.9.2 Limitations and Mitigations

**Limitation 1: Servo Backlash**
- Gears have 0.5-1mm play
- **Mitigation:** Use metal gear servos (MG996R, MG90S) - less backlash
- Always approach position from same direction

**Limitation 2: Travel Distance**
- 180° servo rotation = limited linear travel via linkage
- **Mitigation:** 
  - Use 4:1 mechanical advantage (180° → 200mm)
  - Or use GT2 belt system (servo rotates pulley, belt moves carriage)

**Limitation 3: Speed**
- Slower than stepper-based systems
- **Mitigation:** 
  - Adequate for educational market (not production embossing)
  - Path optimization reduces travel time (nearest-neighbor algorithm)

**Limitation 4: Precision Drift**
- No feedback loop (servos don't report actual position)
- **Mitigation:**
  - Limit switches for homing at startup
  - Periodic re-homing every 10 minutes

---

## 5.10 Testing & Validation Plan

### 5.10.1 Hardware Tests

| **Test ID** | **Test Name** | **Procedure** | **Pass Criteria** |
|---|---|---|---|
| HW-01 | Servo Power Test | Measure current draw under load | <3A total @ 5V |
| HW-02 | Positioning Accuracy | Move to 10 known positions, measure | ±2mm error max |
| HW-03 | Dot Embossing Force | Press stylus, measure dot depth | 0.5-0.8mm on 150 GSM |
| HW-04 | Travel Range | Move to all corners, measure | ≥200×280mm |
| HW-05 | Limit Switch Homing | Trigger home sequence 10 times | Return to 0,0 each time |
| HW-06 | Bluetooth Range | Move phone away while connected | 8-10 meters minimum |
| HW-07 | Continuous Operation | Run 1-hour print job | No overheating, failures |
| HW-08 | Dot Array Test | Print 6×10 dot grid | All dots visible, uniform |

### 5.10.2 User Acceptance Criteria

- Blind users can feel clear braille dots (0.6-0.8mm height)
- System completes setup in <2 minutes (power on → ready)
- Mobile app connects to device in <10 seconds
- Print accuracy: ≥95% of dots correctly positioned
- Mean Time Between Failures: ≥100 hours continuous operation

---

## 5.11 Safety Considerations

1. **Electrical Safety:**
   - Use isolated power supply (wall adapter, not exposed AC)
   - No exposed 120V/240V wiring
   - Fuse on 9V input (5A fast-blow)

2. **Mechanical Safety:**
   - Servo stall torque limited (won't crush fingers)
   - Emergency stop button (reset pin to GND)
   - Rounded stylus tip (no sharp points)

3. **Thermal Safety:**
   - Servos rated for continuous duty
   - Adequate ventilation (no enclosed case)
   - Thermal shutdown if buck converter overheats

---

## 5.12 Summary

This chapter presented a complete hardware design for a braille plotter using:

- **Arduino UNO microcontroller** (beginner-friendly, widely available)
- **3 servo motors** (2× MG996R for X/Y axes, 1× SG90 for stylus)
- **HC-05 Bluetooth module** for wireless app control
- **External 5V/3A power supply** (buck converter from 9V)
- **Simple mechanical design** (3D printed linkages, acrylic platform)

**Total prototype cost: ~$229** (vs. $2,000+ for commercial embossers)

**Key advantages:**
- Simplicity and ease of assembly
- Low cost and high availability of parts
- Beginner-friendly Arduino programming
- Sufficient accuracy for braille (±2mm vs. 2.5mm dot spacing)

Next chapter (6) covers the firmware architecture and software pipeline for text/image-to-braille conversion.

---
