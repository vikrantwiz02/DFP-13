# Technical Reference: Hex-Core Solenoid Convergent Embossing

## Quick Reference Guide

### Hardware at a Glance

```
SYSTEM OVERVIEW
═══════════════════════════════════════════════════════════

                    [Mobile App - React Native]
                              ↓ WiFi socket.io
                              
                    [Raspberry Pi Zero 2W/Pi 4]
                    
         ┌──────────────────┬──────────────────┐
         ↓                  ↓                  ↓
    [Stepper Motors]   [Solenoid Drivers]   [Sensors]
    (2× NEMA-17)       (6× ULN2803+IRFZ44N) (Limit SW)
         ↓                  ↓
    [XY Gantry]        [Hex-Core Array]
    (200×280mm)        (6× 24V 20N solenoids)
         ↓
    [Paper Platform]
    [Embossed Braille]
```

---

### GPIO Pin Assignment (Quick Reference)

```
RASPBERRY PI GPIO PINOUT - BRAILLE PLOTTER
═════════════════════════════════════════════════

STEPPER CONTROL (24V logic via A4988)
──────────────────────────────────────
GPIO 17 → X-Axis Step     (A4988 #1)
GPIO 22 → X-Axis Direction (A4988 #1)
GPIO 18 → Y-Axis Step     (A4988 #2)
GPIO 23 → Y-Axis Direction (A4988 #2)

SOLENOID CONTROL (3.3V logic → ULN2803 → MOSFET → 24V)
────────────────────────────────────────────────────────
GPIO 24 → Solenoid 1 (Dot 1)
GPIO 25 → Solenoid 2 (Dot 2)
GPIO 12 → Solenoid 3 (Dot 3)
GPIO 16 → Solenoid 4 (Dot 4)
GPIO 20 → Solenoid 5 (Dot 5)
GPIO 21 → Solenoid 6 (Dot 6)

LIMIT SWITCHES (Input with internal pull-up)
──────────────────────────────────────────────
GPIO 13 → X-Min Limit (microswitch, normally open)
GPIO 14 → Y-Min Limit (microswitch, normally open)

SENSORS (Optional)
──────────────────
GPIO 4  → Paper Presence (IR reflective sensor)

POWER
─────
5V   → Raspberry Pi power input (USB-C)
GND  → Common ground (multiple pins)
```

---

### Solenoid Firing Patterns (Braille Characters)

```
BRAILLE CHARACTER ENCODING
═════════════════════════════════════════════════════════

Standard 6-dot braille cell layout:
┌────┬────┐
│ 1  │ 4  │
├────┼────┤
│ 2  │ 5  │
├────┼────┤
│ 3  │ 6  │
└────┴────┘

Binary bitmask format:
Bit 0 = Dot 1 (top-left)
Bit 1 = Dot 2 (middle-left)
Bit 2 = Dot 3 (bottom-left)
Bit 3 = Dot 4 (top-right)
Bit 4 = Dot 5 (middle-right)
Bit 5 = Dot 6 (bottom-right)

COMMON CHARACTERS
─────────────────────────────────────
'A' → 0b000001 (dot 1 only)           [fire GPIO 24]
'B' → 0b011001 (dots 1, 2, 4)         [fire GPIO 24, 25, 16]
'C' → 0b001001 (dots 1, 4)            [fire GPIO 24, 16]
'D' → 0b001101 (dots 1, 4, 5)         [fire GPIO 24, 16, 20]
...
'M' → 0b011101 (dots 1, 3, 4)         [fire GPIO 24, 12, 16]
Space → 0b000000 (no dots)            [fire none]

FIRING SEQUENCE (Example: 'B')
────────────────────────────────
t=0ms:   Set GPIO[24, 25, 16] = HIGH  (Dots 1, 2, 4)
t=5ms:   Solenoid plungers extending
t=15ms:  Styli impacting paper (combined 60N force)
t=20ms:  Set all GPIO = LOW           (Retract)
t=25ms:  Solenoids fully retracted
t=30ms:  Ready for next character
```

---

### Motion Coordinate System

```
COORDINATE SYSTEM (mm)
═════════════════════════════════════════════════════════

Physical Layout:
┌─────────────────────────────────────────┐
│(0,280)  Y-axis travel: 280mm           │
│    ↑                                     │
│    │                                     │
│    │  200mm × 280mm print area          │
│    │                                     │
│    └──────────────────→ X-axis: 200mm  │
│(0,0)                              (200,0)│
└─────────────────────────────────────────┘

For A4 page (210×297mm paper):
  Print area: 200×280mm (safe margins)
  
Braille cell spacing:
  Horizontal (X): 6.2mm per cell
  Vertical (Y):   10.0mm per line
  
Dot spacing within cell:
  Center-to-center: 2.5mm

POSITION CALCULATION EXAMPLE
────────────────────────────────
To print word "HI":
  H: First braille cell at (10mm, 10mm)
  I: Second cell at (16.2mm, 10mm) = 10 + 6.2
  
Stepper steps = position_mm × (1000 / 8)
            = position_mm × 125 steps/mm
```

---

### Power Distribution

```
POWER SCHEMATIC (24V Domain)
═════════════════════════════════════════════════════════

AC Mains 230V
    │
    └─→ [SMPS 24V/5A] (120W, isolated, regulated)
        │
        ├─→ 24V Power Rail (solenoids + steppers)
        │   │
        │   ├─→ [470µF @ 35V Capacitor]
        │   │   (ripple suppression, EMI filtering)
        │   │
        │   ├─→ Solenoids (6× 20N)
        │   │   Peak current: 6 × 2.4A = 14.4A
        │   │   Duty cycle: 50% avg = 7.2A continuous
        │   │
        │   ├─→ A4988 Stepper Drivers
        │   │   Current: 2 × 1.68A peak ≈ 3.4A
        │   │
        │   └─→ ULN2803 Driver IC
        │       Current: <100mA
        │
        └─→ [Return path] ─ Common GND

SEPARATE 5V DOMAIN (Logic)
════════════════════════════
USB Power Adapter 5V/2.5A
    │
    └─→ Raspberry Pi
        ├─→ GPIO logic (3.3V buffered)
        ├─→ WiFi module
        └─→ System on chip

CRITICAL: Separate power domains prevent 24V solenoid 
noise from corrupting RPi 3.3V logic!
```

---

### Stepper Motor Control

```
MOTOR SPECIFICATION (NEMA-17)
═════════════════════════════════════════════════════════

Electrical:
  Voltage rated: 12-24V (we use 24V for max speed)
  Current per phase: 1.68A @ 24V
  Coil resistance: ~14Ω per phase
  
Mechanical:
  Steps per revolution: 200 (1.8° per step)
  Torque: 42 oz-in = 3 kg-cm
  Holding torque: 2 kg-cm (maintains position unpowered)
  
Motion Profile (with A4988 1/16 microstepping):
  Full steps: 200 per revolution
  Microsteps: 3,200 per revolution (200 × 16)
  Step size: 1.8° ÷ 16 = 0.1125° per microstep
  
Linear Motion (8mm GT2 belt pitch):
  Distance per rev: 8mm (belt pitch)
  Distance per step: 8mm ÷ 200 = 0.04mm
  Distance per microstep: 0.04mm ÷ 16 = 0.0025mm
  
RESOLUTION: Can achieve ±0.1mm positioning over 200mm travel

ACCELERATION PROFILE
─────────────────────
Max speed: 500 steps/sec (practical)
Acceleration: 300 steps/sec² (smooth ramp-up)
  Result: Takes ~1.7 sec to reach max speed from rest
  Distance covered during accel: ~2.5mm
  
For typical 50mm move:
  Time = sqrt(2 × 50mm / (0.125mm/step × 300 steps/sec²))
       ≈ 0.3 seconds
```

---

### Solenoid Characteristics

```
24V PUSH-PULL SOLENOID (20N Force)
═════════════════════════════════════════════════════════

Electrical:
  Operating voltage: 24V DC (±10% = 21.6-26.4V acceptable)
  Coil resistance: ~10Ω
  Current draw: 24V ÷ 10Ω = 2.4A per solenoid
  
  Peak power (single): 24V × 2.4A = 57.6W
  Peak power (6 units): 57.6W × 6 = 345.6W (!)
  Average power (50% duty): ~172.8W
  
  Suitable power supply: 24V/5A = 120W min (our 120W matches)

Mechanical:
  Push force: 20 Newtons
  Pull force: 20 Newtons (push-pull = both directions)
  Plunger stroke: 15mm
  Engagement time: ~5ms (time to reach max force)
  
  For our stylus rod (Ø1.5mm):
  Force at tip = solenoid force (transmitted via rod)
  Embossing pressure = 20N ÷ (π × (0.75mm)²)
                     ≈ 11.3 MPa
  
  This is sufficient to indent 140-160 GSM paper 0.15-0.20mm

Thermal:
  Continuous duty: Not recommended (solenoids overheat)
  Intermittent duty: 50% recommended (our timing allows this)
  
  Our cycle: 30ms total
    Fire: 20ms (solenoid energized)
    Rest: 10ms (solenoid de-energized, cooling)
  Result: 50% duty cycle - SAFE ✓

Lifespan:
  Mechanical: 1-10 million cycles
  At 30ms/cycle: 1M cycles = 8.3 hours continuous
  Expected lifespan: 100,000+ operating hours realistic
```

---

### Convergent Guide Block Geometry

```
GUIDE BLOCK DESIGN (SLA 3D-Printed)
═════════════════════════════════════════════════════════

Input Side (Mounted to solenoid plungers):
  6 bores arranged in circle
  Diameter of bore circle: 75mm
  Bore spacing: 60° apart (0°, 60°, 120°, 180°, 240°, 300°)
  Each bore diameter: 4mm (fits 3mm plunger rods with clearance)
  
Output Side (Braille embossing head):
  7 stylus holes arranged in braille matrix:
  ┌──┬──┐
  │1 │4 │  Hole spacing: 2.5mm center-to-center
  ├──┼──┤  Matrix size: 7.5mm × 10mm
  │2 │5 │  (standard ISO braille cell)
  ├──┼──┤
  │3 │6 │  
  └──┴──┘
  
Material:
  SLA-printed resin (Castable or Surgical Guide type)
  Strength: High (24 Durometer Shore A hardness)
  Precision: ±0.1mm tolerance achievable
  Surface finish: Smooth (stainless steel rods slide freely)
  
Taper Geometry:
  Input bores: 75mm circle, 6-fold symmetry
  Output holes: 7.5mm cell area
  Convergence ratio: 75mm ÷ 7.5mm = 10:1
  
  Tapers internally to guide rods inward
  Angular approach: Each rod angled ~10° from vertical
  Result: Rods converge smoothly without binding
  
Assembly:
  Brass inserts pressed into stylus holes (6× Ø1.5mm)
  Stainless steel rods (Ø1.5mm) slide through inserts
  Rod length: 50mm (15mm stroke + 35mm grip)
  Rod tolerance: H7 in brass (±0.0075mm clearance)
```

---

### Network Communication

```
WIFI SOCKET.IO PROTOCOL
═════════════════════════════════════════════════════════

Device: Raspberry Pi runs Flask + Flask-SocketIO
Port: 5000 (default, change if needed)
Protocol: WebSocket (real-time, bidirectional)

MOBILE APP → DEVICE
────────────────────────
emit('print_job', {
  'job_id': 'job_12345',
  'dots': [
    {'x': 10.0, 'y': 10.0, 'bitmask': 0x01},  // 'A'
    {'x': 16.2, 'y': 10.0, 'bitmask': 0x19},  // 'B'
    {'x': 22.4, 'y': 10.0, 'bitmask': 0x09},  // 'C'
    ...
  ]
})

DEVICE → MOBILE APP (Progress Updates)
────────────────────────────────────────
emit('progress', {
  'job_id': 'job_12345',
  'dot_index': 42,
  'total_dots': 150,
  'percent': 28,
  'position': {'x': 45.2, 'y': 20.5},
  'timestamp': 1705530600
})

emit('job_complete', {
  'job_id': 'job_12345',
  'total_dots': 150,
  'duration_ms': 4500,
  'status': 'success'
})

emit('error', {
  'job_id': 'job_12345',
  'error_code': 'MOTOR_STALL',
  'message': 'X-axis motor stalled at position 50mm',
  'position': {'x': 50.0, 'y': 15.3},
  'recoverable': False
})

ADVANTAGES OVER BLE
───────────────────
✓ Higher bandwidth (more frequent status updates)
✓ Lower latency (real-time progress bar updates)
✓ Works on any WiFi device (not just iOS/Android)
✓ Can use browser-based interface as fallback
✓ Better for video/image transfer
✓ Easier debugging (web console)
✗ Requires WiFi network (BLE doesn't)
```

---

### Performance Metrics

```
SPEED ANALYSIS
═════════════════════════════════════════════════════════

Sequential Design (1 solenoid per dot):
  Firing time: 20ms
  Retraction: 10ms
  Motion overhead: 15ms (move to next position)
  Total per dot: 45ms = 22 dots/sec = 1,320 characters/min

Hex-Core Simultaneous Design:
  Firing time: 20ms (all 6 solenoids together)
  Retraction: 10ms
  Motion overhead: 5ms (2.5mm spacing very small)
  Total per character: 35ms = 28 characters/sec = 1,680 characters/min
  
  With optimized timing:
  Total: 30ms = 33 characters/sec = 1,980 characters/min

Theoretical Maximum:
  If we could reduce cycle to 20ms:
  50 characters/sec = 3,000 characters/min
  (Limited by solenoid mechanical response time)

Comparison to Commercial Embossers:
  Perkins Brailler: Manual (~3-5 characters/min)
  Mountbatten: ~20-30 characters/sec
  ViewPlus: ~60 characters/sec (fast mechanical embosser)
  Our device: 30-50 characters/sec (competitive!)

Printing Examples (our speed):
  Single letter: 35ms
  Simple word "HI": 70ms (2 characters)
  Grade 1 sentence (50 chars): 1.75 seconds
  Full A4 page (500 chars): 17.5 seconds
```

---

### Calibration Procedures

```
INITIAL SETUP & CALIBRATION
═════════════════════════════════════════════════════════

1. HOMING CALIBRATION
──────────────────────
Run homing sequence (limit switches):
  a) Move X-axis left until X_LIMIT GPIO goes LOW
     Set X position = 0mm
  b) Move Y-axis forward until Y_LIMIT GPIO goes LOW
     Set Y position = 0mm
  c) Move to safe position (5mm, 5mm)
  
Verify: Stepper should not stall at end stops
        If stalling, reduce HOMING_SPEED to 100 steps/sec

2. STEPPER MICROSTEPPING CALIBRATION
──────────────────────────────────────
Physical measurement method:
  a) Command stepper: move_absolute(100, 0)  [100mm right]
  b) Measure actual movement with caliper
  c) Calculate: actual_distance / commanded_distance
  d) If ratio ≠ 1.0, adjust STEPS_PER_MM constant
  
Expected: 100mm ± 0.5mm (0.5% tolerance)
  100mm ÷ 125 steps/mm = 12,500 steps
  Each step = 0.08mm

3. SOLENOID TIMING OPTIMIZATION
────────────────────────────────
Experiment on test paper (140-160 GSM):
  a) Start with 20ms fire time (current setting)
  b) Print test pattern: single dots
  c) Measure dot indent depth (should be 0.15-0.20mm)
  d) If too shallow: increase fire time to 25ms
  e) If too deep/torn: reduce fire time to 15ms
  f) Adjust SOLENOID_FIRE_MS in firmware
  
Target: Consistent 0.18mm indent, no tearing

4. CONVERGENT BLOCK PARALLELISM
────────────────────────────────
Verify guide block is perpendicular to paper:
  a) Fire all 6 solenoids (bitmask 0b111111)
  b) Measure distance from stylus tips to paper
  c) Should be uniform (±0.1mm)
  d) If skewed, shim guide block mount with washers

5. PAPER SENSOR CALIBRATION
────────────────────────────
For TCRT5000 IR sensor (if installed):
  a) Measure ADC value with paper present
  b) Measure ADC value with no paper
  c) Set threshold midpoint in firmware
  Alert user if GPIO 4 reads wrong state

6. END-TO-END VALIDATION
────────────────────────
Print alphabet A-Z test pattern:
  a) Print each letter individually
  b) Feel tactile quality with fingertip
  c) Verify dot sharpness and consistency
  d) Check line spacing (should be 10mm center-to-center)
  
Success criteria:
  ✓ All 26 letters legible by touch
  ✓ No split dots or overlapping dots
  ✓ Consistent pressure across all solenoids
  ✓ No stutter or misalignment
```

---

### Troubleshooting Guide

```
COMMON ISSUES & SOLUTIONS
═════════════════════════════════════════════════════════

PROBLEM: Dots not forming (paper untouched)
──────────────────────────────────────────
Possible causes:
  1. Solenoid not firing
     → Check 24V power with multimeter
     → Verify GPIO output changes with logic probe
     → Test solenoid manually (apply 24V directly)
     
  2. Solenoid fires but no plunger movement
     → Remove solenoid, verify plunger moves freely
     → Check for debris in bore
     → Solenoid coil may be burned out (test with megohm meter)
     
  3. Guide block rods stuck
     → Remove assembly, manually slide rods
     → If sticky: clean with solvent, apply light oil
     → Check for 3D print defects (warping)
     
  4. Paper not in contact with stylus
     → Verify paper is flat against platform
     → Check platform level (use spirit level)
     → Adjust guide block height with shims

PROBLEM: Dots too shallow (barely indented)
───────────────────────────────────────────
Possible causes:
  1. Solenoid firing time too short
     → Increase SOLENOID_FIRE_MS from 20ms to 25ms
     → Test with print pattern
     
  2. Paper too thick or wrong type
     → Use 140-160 GSM specified braille paper
     → Test on standard 80 GSM first (if too deep)
     
  3. Solenoid current insufficient
     → Check 24V power supply output with multimeter
     → If <24V, power supply may be overloaded
     → Verify capacitor across 24V rail is functional
     
  4. Guide block not converging properly
     → Verify all 6 stylus rods are free to move
     → Check 3D print quality (may need reprint)

PROBLEM: Stepper motor not moving
──────────────────────────────────
Possible causes:
  1. A4988 driver not powered
     → Verify 24V at A4988 input pins
     → Check for cold solder joints
     
  2. Step/Dir signals not reaching driver
     → Test GPIO outputs with oscilloscope
     → Check for weak signal (should be 3.3V)
     → Verify GPIO pin configuration in code
     
  3. Motor coil open circuit
     → Measure resistance between motor windings
     → Should be ~10-14Ω per coil
     → Infinite resistance = open wire
     
  4. Stepper shaft binding
     → Manually rotate shaft (should move freely)
     → Check belt tension (should be snug, not tight)
     → Verify linear rods aren't misaligned

PROBLEM: Solenoid fires but sticks (won't retract)
──────────────────────────────────────────────────
Possible causes:
  1. Plunger rod binding in guide block
     → Remove solenoid, check rod can slide freely
     → 3D print may have warped - reprint guide block
     
  2. Freewheeling diode shorted
     → Check 1N4007 diode across solenoid
     → If low resistance both ways, replace
     
  3. Soft solder joint on MOSFET
     → Reflow solder connections on gate/drain
     → Check with magnifying glass for cracks
     
  4. MOSFET gate capacitance too high
     → Verify ULN2803 is sourcing sufficient current
     → Try adding 100Ω resistor in series with gate

PROBLEM: Dots misaligned (scattered, not in pattern)
────────────────────────────────────────────────────
Possible causes:
  1. Stepper motor vibration/resonance
     → Reduce MAX_SPEED from 500 to 300 steps/sec
     → Add damping capacitor to stepper power line
     
  2. STEPS_PER_MM calibration wrong
     → Re-measure actual distance moved
     → Recalculate STEPS_PER_MM constant
     
  3. Limit switch not triggering on homing
     → Verify microswitch mounted at correct position
     → Test switch manually (should click)
     → Check GPIO is pulled HIGH and goes LOW when pressed
     
  4. Paper slipping on platform
     → Add rubber mat under paper for friction
     → Use magnetic or spring clip to secure paper

PROBLEM: Papers gets torn during embossing
──────────────────────────────────────────
Possible causes:
  1. Solenoid firing time too long
     → Reduce SOLENOID_FIRE_MS from 20ms to 15ms
     → Test with scratch paper first
     
  2. Solenoid force excessive for paper type
     → Switch to thicker paper (180+ GSM)
     → Or reduce solenoid voltage to 20V (if possible)
     
  3. Stylus rod tip damaged
     → Inspect rod under magnifying glass
     → Sharp edge can tear paper
     → Smooth with fine sandpaper if needed
     
  4. Paper platform not level
     → Use spirit level to check flatness
     → Adjust shimming under platform
```

---

### Performance Optimization Tips

```
GETTING MAXIMUM SPEED
═════════════════════════════════════════════════════════

1. Reduce motion overhead:
   Current: 5ms between characters
   Optimized: Can reduce to 2ms for small moves (2-3mm)
   Method: Adjust acceleration profile based on distance
   
2. Reduce solenoid timing:
   Current: 20ms fire + 10ms retract = 30ms
   Optimized: 15ms fire + 5ms retract = 20ms
   Risk: May cause incomplete dot formation
   Validate: Test with blind user on actual paper
   
3. Optimize path planning:
   Sequential printing: Left-to-right, top-to-bottom
   Clustered printing: Print nearby dots before moving
   Result: Reduces total motor movement
   
4. Parallel processing:
   While motors moving: Pre-fetch next dots from memory
   Calculate solenoid bitmask for next character
   Reduces latency between cycles
   
Maximum theoretical speed: 50 chars/sec (2ms per character)
Current achievable: 33-35 chars/sec (28-30ms per character)
Headroom for future optimization: 50% faster possible

TARGET FOR COMMERCIAL VERSION
──────────────────────────────
Mountbatten reference: 30-40 chars/sec
Our goal: Match or exceed at lower cost
Status: ON TRACK ✓
```

---

### Cost Analysis Breakdown

```
COMPONENT COST BREAKDOWN (India Pricing, Jan 2026)
═════════════════════════════════════════════════════════

ITEMS COSTING > ₹500
─────────────────────────────────────────────────
Raspberry Pi Zero 2W/Pi 4       ₹6,500   (highest)
24V 20N Solenoids (6×)          ₹2,400   (20% of BOM)
SMPS 24V/5A                     ₹1,200   (10% of BOM)
NEMA-17 Motors (2×)             ₹1,600   (8% of BOM)
SLA 3D-Printed Guide Block      ₹1,200   (6% of BOM)
Aluminum Extrusions             ₹1,200   (6% of BOM)

Subtotal (components >₹500):    ₹15,100  (79%)
                                
ITEMS COSTING ₹100-500
─────────────────────────────────────────────────
Linear bearings, rods, belt     ₹1,640   (8%)
Fasteners, connectors, wiring   ₹1,300   (7%)
Electronics (drivers, caps)     ₹680     (4%)
Miscellaneous                   ₹280     (1%)

Subtotal (components ₹100-500): ₹3,900   (20%)

GRAND TOTAL                      ₹19,000 (100%)

COST REDUCTION OPPORTUNITIES
────────────────────────────────
1. Volume manufacturing (100+ units)
   - Solenoids: ₹2,400 → ₹1,600 (33% savings)
   - Motors: ₹1,600 → ₹1,200 (25% savings)
   - Total savings: ₹1,000 per unit
   
2. Local manufacturing (India)
   - Avoid import duty on stepper motors
   - Potential 5-10% savings on electronics
   
3. 3D printing optimization
   - Current: SLA printing (₹1,200)
   - Alternative: FDM printing (₹200-400)
   - Trade-off: Precision vs cost
   
4. Solenoid alternatives
   - Current: Industrial 24V 20N
   - Cheaper: 24V 10N solenoids (₹200 each)
   - Trade-off: Slower printing, weaker dots
   
MANUFACTURING COST (50 units batch)
────────────────────────────────────
Components at batch rates:      ₹14,500
Assembly & testing (₹500/unit):  ₹500
Packaging & logistics:            ₹300

Batch manufacturing COGS:       ₹15,300 per unit
+ Dealer margin (20%):          ₹3,060
= Retail price:                 ₹18,360

Compared to:
  Commercial embossers: ₹1.65L - ₹6L
  Our device: ₹18,000 retail
  Savings: 70-97% cost advantage! ✓✓✓
```

---

**Last Updated:** January 18, 2026  
**Status:** Complete Technical Reference ✅
