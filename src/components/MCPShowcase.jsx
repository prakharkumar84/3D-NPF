/* eslint-disable react/prop-types */
import { useState, useRef, useEffect, useMemo, Suspense, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, Float } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

// ─── MCP Tool Demo Data ──────────────────────────────────────────────────────
const mcpTools = [
  {
    id: "code-gen",
    title: "Code Generation",
    subtitle: "DAL, REST API, Extensions",
    description: "Generates production-ready 4GL code following all syntax rules, naming conventions, and best practices automatically.",
    prompt: "Generate DAL for sales order with validation hooks and business methods",
    code: `|function extern boolean dal.before.save.object(void)
{
    | Validate mandatory fields before save
    if isspace(tdsls400.orno) then
        dal.set.error.message("sls0400", 1,
            "Order number is mandatory")
        return(false)
    endif

    | Check credit limit
    if not check.credit.limit(tdsls400.ofbp) then
        dal.set.error.message("sls0400", 2,
            "Credit limit exceeded for %1",
            tdsls400.ofbp)
        return(false)
    endif

    | Set audit fields
    tdsls400.lmdt = utc.num()
    tdsls400.lmby = logname$

    return(true)
}

function extern long dal.field.orno.is.valid(
    domain  tcorno  i.orno)
{
    | Validate order format
    if len(strip$(str$(i.orno))) < 3 then
        dal.set.field.error.message("sls0400",
            "orno", 3, "Invalid order format")
        return(DALHOOKERROR)
    endif
    return(DALHOOKNOACTION)
}`,
  },
  {
    id: "knowledge-graph",
    title: "Knowledge Graph",
    subtitle: "610 Nodes, Concept Mapping",
    description: "Query relationships between 4GL concepts, find connected topics, discover dependencies — all through natural language.",
    prompt: "How does DAL validation connect to BOD extensions?",
    code: `Query: "DAL validation → BOD extension"

╭─────────────────────────────────────────────╮
│  Knowledge Graph Path Found (3 hops)        │
╰─────────────────────────────────────────────╯

  [DAL Validation]
       │
       ├──uses──→ [dal.set.error.message]
       │               │
       │               └──part_of──→ [Error Handling]
       │
       ├──triggers──→ [before.save.object]
       │                    │
       │                    └──extended_by──→ [BOD Extension]
       │
       └──validates──→ [Field Hooks]
                           │
                           └──consumed_by──→ [Outgoing BOD]
                                                │
                                                └── UserArea fields
                                                    populated from
                                                    validated data

Related Concepts:
  • dal.field.depends.on() — field dependencies
  • bod.userarea.add.field() — BOD extension hook
  • enum domain validation — shared pattern
  • transaction.safety — both use commit groups`,
  },
  {
    id: "doc-gen",
    title: "Document Generation",
    subtitle: "DES-020, ANA-050, TES-070",
    description: "Transforms structured JSON into fully formatted .docx design documents, analysis specs, and test cases.",
    prompt: "Generate DES-020 design document for PayPal integration",
    code: `Generating DES-020: PayPal Payment Integration
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Document Structure:
┌─────────────────────────────────────────┐
│ 1. Header                               │
│    ├── Subject: PayPal Integration      │
│    ├── Author: Prakhar Kumar            │
│    ├── Module: Sales (sls)              │
│    └── Status: In Development           │
│                                          │
│ 2. Sessions                              │
│    ├── tdsls4501m000 - PayPal Config    │
│    │   └── Fields: client_id, secret,   │
│    │       mode, webhook_url            │
│    └── tdsls4502m000 - Payment Status   │
│        └── Fields: txn_id, status,      │
│            amount, currency             │
│                                          │
│ 3. Tables                                │
│    ├── tdsls450 - PayPal Configuration  │
│    └── tdsls451 - Payment Transactions  │
│                                          │
│ 4. Processing Logic                      │
│    ├── Create checkout order from SO    │
│    ├── Generate payment link            │
│    ├── Capture webhook response         │
│    └── Update LN invoice status         │
│                                          │
│ 5. Domain Definitions                    │
│    ├── tcpyst (Payment Status enum)     │
│    └── tcpymd (Payment Mode enum)       │
└─────────────────────────────────────────┘

✅ Output: DES-020_PayPal_Integration.docx (42 KB)
   → 3 tables, 2 sessions, 4 domains defined
   → Processing logic with sequence diagrams
   → Test cases auto-generated`,
  },
  {
    id: "api-discovery",
    title: "API Discovery & Execution",
    subtitle: "ION, SOAP, OData",
    description: "Search, retrieve swagger specs, and call LN APIs through natural language — no manual endpoint hunting.",
    prompt: "Find and call the purchase order API to get open orders",
    code: `> Searching API catalog for "purchase order"...

Found 3 matching endpoints:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. tdapi.purPurchaseOrder (OData)
   GET /odata/tdapi.purPurchaseOrder/Orders
   → Purchase order CRUD operations

2. c4ws.PurchaseOrderService (SOAP)
   WSDL: /c4ws/services/PurchaseOrderService
   → Legacy SOAP interface

3. Custom: txbpt.PurchaseApproval (REST)
   POST /api/v1/purchase/approve
   → Custom approval workflow

> Calling endpoint #1 with filter...

GET /odata/tdapi.purPurchaseOrder/Orders
    ?$filter=Status eq 'Open'
    &$top=5
    &$select=OrderNumber,Supplier,Amount

Response (200 OK, 23ms):
┌──────────┬─────────────────┬───────────┐
│ Order    │ Supplier        │ Amount    │
├──────────┼─────────────────┼───────────┤
│ PO-10042 │ ACME Corp       │ $12,450   │
│ PO-10043 │ GlobalTech Ltd  │ $8,900    │
│ PO-10044 │ IndustrialCo    │ $34,200   │
│ PO-10045 │ MetalWorks Inc  │ $5,670    │
│ PO-10046 │ ChemSupply AG   │ $19,800   │
└──────────┴─────────────────┴───────────┘`,
  },
  {
    id: "extension-bridge",
    title: "Extension Modeler Bridge",
    subtitle: "Chrome Automation",
    description: "Automates LN Extension Modeler directly in browser — write hooks, compile, check-in without manual clicks.",
    prompt: "Write before.save hook for table tdsls400 to validate delivery date",
    code: `🌐 Extension Modeler Bridge - Connected
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Step 1: Checkout extension...
  ✓ tdsls400 checked out successfully

Step 2: Navigating to Before Save hook...
  ✓ Hook selected: "Before Save"

Step 3: Writing code...
  ┌─────────────────────────────────────────┐
  │ |#Prakhar.Kumar CR-2026-0142            │
  │ | Validate planned delivery date        │
  │                                          │
  │ if tdsls400.ddta < utc.num() then       │
  │     message("Delivery date %1 is in "   │
  │         "the past. Please update.",      │
  │         tdsls400.ddta)                   │
  │     set.output.fixed()                   │
  │     choice.again()                       │
  │     return                               │
  │ endif                                    │
  └─────────────────────────────────────────┘
  ✓ Code written to editor

Step 4: Compile...
  ✓ Generate & Compile successful (0 errors)

Step 5: Check-in...
  ✓ Extension checked in

📸 Screenshot captured for verification`,
  },
  {
    id: "workspace",
    title: "LN Workspace Manager",
    subtitle: "Read, Write, Generate",
    description: "Full workspace integration — read components, generate tables/sessions/domains, detect compilation errors.",
    prompt: "Generate table txsls450 for payment tracking with all fields",
    code: `LN Workspace: Generating Component
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Activity: EXTce01098
Component: txsls450 (Table)

Generated XML Structure:
┌─ txsls450.xml ────────────────────────────┐
│ <Table code="txsls450">                    │
│   <Description>Payment Transactions</...>  │
│   <Columns>                                │
│     <Column name="orno" domain="tcorno"    │
│            key="true" mandatory="true"/>    │
│     <Column name="pono" domain="tcpono"    │
│            key="true"/>                     │
│     <Column name="txid" domain="tcmcs.str" │
│            length="50"                      │
│            desc="Transaction ID"/>          │
│     <Column name="amnt" domain="tcamnt"    │
│            desc="Payment Amount"/>          │
│     <Column name="curr" domain="tccurr"/>  │
│     <Column name="stat" domain="tcpyst"    │
│            desc="Payment Status"/>          │
│     <Column name="pdat" domain="tcdate"    │
│            desc="Payment Date"/>            │
│   </Columns>                               │
│   <Indexes>                                │
│     <Index name="txsls450a" unique="true"> │
│       <Field>orno</Field>                  │
│       <Field>pono</Field>                  │
│     </Index>                               │
│   </Indexes>                               │
│ </Table>                                   │
└────────────────────────────────────────────┘

✓ Table XML generated
✓ Labels created (7 fields × 2 languages)
✓ DAL skeleton created
✓ Written to workspace: EXTce01098/txsls450`,
  },
];

// ─── Three.js Floating Particles ─────────────────────────────────────────────
function FloatingParticles() {
  const meshRef = useRef();
  const count = 150;

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      arr[i] = (Math.random() - 0.5) * 20;
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#915EFF" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

// ─── Three.js Orbiting Nodes (representing MCP tools) ────────────────────────
function OrbitingNode({ index, total, color, label }) {
  const meshRef = useRef();
  const angle = (index / total) * Math.PI * 2;
  const radius = 3;

  useFrame((state) => {
    const t = state.clock.elapsedTime * 0.3 + angle;
    meshRef.current.position.x = Math.cos(t) * radius;
    meshRef.current.position.z = Math.sin(t) * radius;
    meshRef.current.position.y = Math.sin(t * 2) * 0.5;
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.15, 16, 16]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
    </mesh>
  );
}

function MCPOrbit() {
  const colors = ["#915EFF", "#00d4ff", "#ff6b6b", "#ffd93d", "#6bcb77", "#4ecdc4"];
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 0, 0]} intensity={1} color="#915EFF" />
      {/* Central core */}
      <Float speed={2} rotationIntensity={0.5}>
        <mesh>
          <icosahedronGeometry args={[0.5, 2]} />
          <meshStandardMaterial
            color="#915EFF"
            emissive="#915EFF"
            emissiveIntensity={0.3}
            wireframe
          />
        </mesh>
      </Float>
      {/* Orbiting tool nodes */}
      {mcpTools.map((tool, i) => (
        <OrbitingNode
          key={tool.id}
          index={i}
          total={mcpTools.length}
          color={colors[i % colors.length]}
          label={tool.title}
        />
      ))}
      <FloatingParticles />
      <Stars radius={15} depth={50} count={1000} factor={2} saturation={0} />
    </>
  );
}

// ─── Typing Effect Hook ──────────────────────────────────────────────────────
function useTypingEffect(text, speed = 15, isActive = false) {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const indexRef = useRef(0);
  const intervalRef = useRef(null);

  const start = useCallback(() => {
    if (intervalRef.current) return;
    setIsComplete(false);
    intervalRef.current = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayedText(text.slice(0, indexRef.current + 1));
        indexRef.current++;
      } else {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        setIsComplete(true);
      }
    }, speed);
  }, [text, speed]);

  const pause = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  }, []);

  const reset = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    indexRef.current = 0;
    setDisplayedText("");
    setIsComplete(false);
  }, []);

  useEffect(() => {
    if (isActive) {
      reset();
      setTimeout(start, 300);
    } else {
      pause();
    }
    return () => clearInterval(intervalRef.current);
  }, [isActive, text, reset, start, pause]);

  return { displayedText, isComplete, start, pause, reset };
}

// ─── 3D Interactive Robot (WASD + Space + Click) ─────────────────────────────
function useKeyboard() {
  const keys = useRef({});

  useEffect(() => {
    const handleDown = (e) => {
      if (e.key === " " || e.key === "Space") e.preventDefault();
      keys.current[e.key.toLowerCase()] = true;
    };
    const handleUp = (e) => {
      if (e.key === " " || e.key === "Space") e.preventDefault();
      keys.current[e.key.toLowerCase()] = false;
    };
    window.addEventListener("keydown", handleDown);
    window.addEventListener("keyup", handleUp);
    return () => {
      window.removeEventListener("keydown", handleDown);
      window.removeEventListener("keyup", handleUp);
    };
  }, []);

  return keys;
}

function InteractiveRobot({ isTyping }) {
  const groupRef = useRef();
  const leftArmRef = useRef();
  const rightArmRef = useRef();
  const leftLegRef = useRef();
  const rightLegRef = useRef();
  const keys = useKeyboard();

  const velocity = useRef({ x: 0, z: 0, y: 0 });
  const isGrounded = useRef(true);
  const isWalking = useRef(false);
  const facingAngle = useRef(0);
  const waveTime = useRef(0);
  const isWaving = useRef(false);
  const userControlled = useRef(false);
  const wanderTarget = useRef({ x: 2, z: 2 });
  const wanderPause = useRef(0);
  const wanderTimer = useRef(0);

  const SPEED = 4;
  const WANDER_SPEED = 1.5;
  const JUMP_FORCE = 5;
  const GRAVITY = -12;
  const GROUND_Y = -1.8;
  const BOUNDS_X = 8;
  const BOUNDS_Z_NEAR = -2;
  const BOUNDS_Z_FAR = 4;

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    const k = keys.current;

    const userMoving =
      k["w"] || k["arrowup"] || k["s"] || k["arrowdown"] ||
      k["a"] || k["arrowleft"] || k["d"] || k["arrowright"];

    if (userMoving) userControlled.current = true;

    let moveX = 0;
    let moveZ = 0;

    if (userControlled.current) {
      if (k["w"] || k["arrowup"]) moveZ = -1;
      if (k["s"] || k["arrowdown"]) moveZ = 1;
      if (k["a"] || k["arrowleft"]) moveX = -1;
      if (k["d"] || k["arrowright"]) moveX = 1;

      const moving = moveX !== 0 || moveZ !== 0;
      isWalking.current = moving;

      if (!moving) {
        wanderTimer.current += delta;
        if (wanderTimer.current > 3) {
          userControlled.current = false;
          wanderTimer.current = 0;
        }
      } else {
        wanderTimer.current = 0;
      }
    } else {
      if (wanderPause.current > 0) {
        wanderPause.current -= delta;
        isWalking.current = false;
      } else {
        const pos = groupRef.current.position;
        const dx = wanderTarget.current.x - pos.x;
        const dz = wanderTarget.current.z - pos.z;
        const dist = Math.sqrt(dx * dx + dz * dz);

        if (dist < 0.3) {
          wanderPause.current = 1 + Math.random() * 2;
          wanderTarget.current = {
            x: (Math.random() - 0.5) * 12,
            z: BOUNDS_Z_NEAR + Math.random() * (BOUNDS_Z_FAR - BOUNDS_Z_NEAR),
          };
        } else {
          moveX = dx / dist;
          moveZ = dz / dist;
          isWalking.current = true;
        }
      }
    }

    const len = Math.sqrt(moveX * moveX + moveZ * moveZ);
    if (len > 0) {
      moveX /= len;
      moveZ /= len;
      facingAngle.current = Math.atan2(moveX, moveZ);
    }

    const currentSpeed = userControlled.current ? SPEED : WANDER_SPEED;
    velocity.current.x = moveX * currentSpeed;
    velocity.current.z = moveZ * currentSpeed;

    if ((k[" "] || k["space"]) && isGrounded.current) {
      velocity.current.y = JUMP_FORCE;
      isGrounded.current = false;
      userControlled.current = true;
      wanderTimer.current = 0;
    }

    velocity.current.y += GRAVITY * delta;

    const pos = groupRef.current.position;
    pos.x += velocity.current.x * delta;
    pos.z += velocity.current.z * delta;
    pos.y += velocity.current.y * delta;

    if (pos.y <= GROUND_Y) {
      pos.y = GROUND_Y;
      velocity.current.y = 0;
      isGrounded.current = true;
    }

    pos.x = Math.max(-BOUNDS_X, Math.min(BOUNDS_X, pos.x));
    pos.z = Math.max(BOUNDS_Z_NEAR, Math.min(BOUNDS_Z_FAR, pos.z));

    groupRef.current.rotation.y += (facingAngle.current - groupRef.current.rotation.y) * 0.1;

    // Limb animations
    const walkSpeed = 10;
    if (isWalking.current) {
      if (leftLegRef.current) leftLegRef.current.rotation.x = Math.sin(t * walkSpeed) * 0.5;
      if (rightLegRef.current) rightLegRef.current.rotation.x = Math.sin(t * walkSpeed + Math.PI) * 0.5;
      if (leftArmRef.current && !isWaving.current) leftArmRef.current.rotation.x = Math.sin(t * walkSpeed + Math.PI) * 0.4;
      if (rightArmRef.current) rightArmRef.current.rotation.x = Math.sin(t * walkSpeed) * 0.4;
    } else if (isTyping) {
      if (leftArmRef.current) leftArmRef.current.rotation.x = Math.sin(t * 8) * 0.15 - 0.5;
      if (rightArmRef.current) rightArmRef.current.rotation.x = Math.sin(t * 8 + Math.PI) * 0.15 - 0.5;
      if (leftLegRef.current) leftLegRef.current.rotation.x = 0;
      if (rightLegRef.current) rightLegRef.current.rotation.x = 0;
    } else {
      if (leftLegRef.current) leftLegRef.current.rotation.x = 0;
      if (rightLegRef.current) rightLegRef.current.rotation.x = 0;
      if (leftArmRef.current && !isWaving.current) leftArmRef.current.rotation.x = Math.sin(t * 1.5) * 0.05;
      if (rightArmRef.current) rightArmRef.current.rotation.x = Math.sin(t * 1.5 + 0.5) * 0.05;
    }

    // Wave on click
    if (isWaving.current) {
      waveTime.current += delta;
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = -2.5;
        leftArmRef.current.rotation.z = Math.sin(waveTime.current * 10) * 0.3;
      }
      if (waveTime.current > 1.2) {
        isWaving.current = false;
        waveTime.current = 0;
        if (leftArmRef.current) leftArmRef.current.rotation.z = 0;
      }
    }
  });

  const handleClick = () => {
    isWaving.current = true;
    waveTime.current = 0;
  };

  return (
    <group ref={groupRef} position={[0, -1.8, 2]} onClick={handleClick} renderOrder={999}>
      {/* Head */}
      <group position={[0, 1.35, 0]}>
        <mesh>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshStandardMaterial color="#915EFF" metalness={0.3} roughness={0.4} />
        </mesh>
        {/* Eyes with point lights */}
        <mesh position={[-0.12, 0.05, 0.26]}>
          <sphereGeometry args={[0.07, 12, 12]} />
          <meshStandardMaterial color="#00ffcc" emissive="#00ffcc" emissiveIntensity={2} />
        </mesh>
        <pointLight position={[-0.12, 0.05, 0.35]} intensity={0.8} distance={4} color="#00ffcc" />
        <mesh position={[0.12, 0.05, 0.26]}>
          <sphereGeometry args={[0.07, 12, 12]} />
          <meshStandardMaterial color="#00ffcc" emissive="#00ffcc" emissiveIntensity={2} />
        </mesh>
        <pointLight position={[0.12, 0.05, 0.35]} intensity={0.8} distance={4} color="#00ffcc" />
        {/* Antenna */}
        <mesh position={[0, 0.35, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.25]} />
          <meshStandardMaterial color="#aaa" metalness={0.8} />
        </mesh>
        <mesh position={[0, 0.5, 0]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#ff6b6b" emissive="#ff6b6b" emissiveIntensity={1} />
        </mesh>
      </group>

      {/* Body */}
      <mesh position={[0, 0.7, 0]}>
        <boxGeometry args={[0.65, 0.85, 0.4]} />
        <meshStandardMaterial color="#6b3fa0" metalness={0.2} roughness={0.5} />
      </mesh>
      {/* Chest screen */}
      <mesh position={[0, 0.8, 0.21]}>
        <planeGeometry args={[0.4, 0.3]} />
        <meshStandardMaterial color="#00ffcc" emissive="#00ffcc" emissiveIntensity={0.3} />
      </mesh>

      {/* Left Arm */}
      <group position={[-0.45, 0.9, 0]}>
        <mesh ref={leftArmRef}>
          <boxGeometry args={[0.15, 0.6, 0.15]} />
          <meshStandardMaterial color="#7b4fbb" metalness={0.3} />
        </mesh>
      </group>

      {/* Right Arm */}
      <group position={[0.45, 0.9, 0]}>
        <mesh ref={rightArmRef}>
          <boxGeometry args={[0.15, 0.6, 0.15]} />
          <meshStandardMaterial color="#7b4fbb" metalness={0.3} />
        </mesh>
      </group>

      {/* Left Leg */}
      <group position={[-0.15, 0.1, 0]}>
        <mesh ref={leftLegRef}>
          <boxGeometry args={[0.18, 0.5, 0.18]} />
          <meshStandardMaterial color="#4a2d7a" metalness={0.3} />
        </mesh>
      </group>

      {/* Right Leg */}
      <group position={[0.15, 0.1, 0]}>
        <mesh ref={rightLegRef}>
          <boxGeometry args={[0.18, 0.5, 0.18]} />
          <meshStandardMaterial color="#4a2d7a" metalness={0.3} />
        </mesh>
      </group>

      {/* Shadow */}
      <mesh position={[0, -0.14, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.5, 16]} />
        <meshStandardMaterial color="#000" transparent opacity={0.2} />
      </mesh>
    </group>
  );
}

function RobotFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
      <planeGeometry args={[30, 30]} />
      <meshStandardMaterial color="#1a1a2e" transparent opacity={0.4} />
    </mesh>
  );
}

function TypingCharacterScene() {
  // No longer used as a standalone component — robot is in the full-screen background
  return null;
}

// ─── IDE Terminal Component ──────────────────────────────────────────────────
function IDETerminal({ code, isActive, title }) {
  const { displayedText, isComplete } = useTypingEffect(code, 12, isActive);
  const contentRef = useRef(null);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [displayedText]);

  return (
    <div className="rounded-xl overflow-hidden shadow-2xl shadow-[#915EFF]/10 border border-white/5">
      {/* IDE Header */}
      <div className="bg-[#2d2d30] px-4 py-3 flex items-center gap-3">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
          <div className="w-3 h-3 rounded-full bg-[#27ca3f]" />
        </div>
        <span className="text-[#ccc] text-[12px] ml-3 font-mono">{title}</span>
        {!isComplete && isActive && (
          <span className="ml-auto text-[#915EFF] text-[11px] animate-pulse">● generating...</span>
        )}
        {isComplete && (
          <span className="ml-auto text-[#27ca3f] text-[11px]">✓ complete</span>
        )}
      </div>
      {/* IDE Content */}
      <div
        ref={contentRef}
        className="bg-[#1e1e1e] p-5 h-[420px] overflow-y-auto font-mono text-[13px] leading-relaxed"
      >
        <pre className="text-[#d4d4d4] whitespace-pre-wrap">{displayedText}
          {!isComplete && isActive && <span className="animate-pulse text-[#915EFF]">▊</span>}
        </pre>
      </div>
    </div>
  );
}

// ─── Tool Card Component ─────────────────────────────────────────────────────
function ToolCard({ tool, isSelected, onClick, index }) {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`w-full text-left p-4 rounded-[20px] transition-all duration-300 border ${
        isSelected
          ? "bg-[#915EFF]/20 border-[#915EFF] shadow-lg shadow-[#915EFF]/10"
          : "bg-tertiary border-transparent hover:border-[#915EFF]/40"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[#915EFF]/30 flex items-center justify-center text-white text-[12px] font-bold">
          {(index ?? 0) + 1}
        </div>
        <div>
          <h4 className="text-white font-bold text-[14px]">{tool.title}</h4>
          <p className="text-white/60 text-[11px]">{tool.subtitle}</p>
        </div>
      </div>
    </motion.button>
  );
}

// ─── Main MCPShowcase Page ───────────────────────────────────────────────────
export default function MCPShowcase() {
  const navigate = useNavigate();
  const [selectedTool, setSelectedTool] = useState(0);
  const [demoActive, setDemoActive] = useState(false);

  const activeTool = mcpTools[selectedTool];
  const isCodeGen = activeTool.id === "code-gen";

  const handleToolSelect = (index) => {
    setDemoActive(false);
    setSelectedTool(index);
    setTimeout(() => setDemoActive(true), 100);
  };

  return (
    <div className="relative min-h-screen bg-primary overflow-hidden">
      {/* Three.js Background with interactive robot */}
      <div className="fixed inset-0 z-0">
        <Canvas camera={{ position: [0, 3, 10], fov: 60 }}>
          <ambientLight intensity={0.4} />
          <pointLight position={[5, 6, 3]} intensity={0.8} color="#915EFF" />
          <pointLight position={[-4, 3, 2]} intensity={0.4} color="#00d4ff" />
          <spotLight position={[0, 8, 0]} intensity={0.3} angle={0.5} penumbra={1} />
          <Suspense fallback={null}>
            <MCPOrbit />
            <InteractiveRobot isTyping={isCodeGen && demoActive} />
            <RobotFloor />
          </Suspense>
        </Canvas>
      </div>

      {/* Controls hint - fixed bottom left */}
      <div className="fixed bottom-4 left-4 z-20 flex gap-2 text-[11px] text-white/50 font-mono bg-black/30 backdrop-blur-sm px-3 py-2 rounded-lg">
        <span className="bg-white/10 px-1.5 py-0.5 rounded">WASD</span>
        <span>move</span>
        <span className="bg-white/10 px-1.5 py-0.5 rounded">SPACE</span>
        <span>jump</span>
        <span className="bg-white/10 px-1.5 py-0.5 rounded">CLICK</span>
        <span>wave</span>
      </div>

      {/* Content Overlay */}
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="flex items-center justify-between px-6 sm:px-16 py-5">
          <button
            onClick={() => navigate("/")}
            className="text-white flex items-center gap-2 hover:text-[#915EFF] transition-colors"
          >
            ← Back to Portfolio
          </button>
          <h3 className="text-white font-bold text-[18px]">MCP Server Showcase</h3>
        </nav>

        {/* Hero */}
        <div className="text-center px-6 py-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-white font-black text-[36px] sm:text-[52px] leading-tight"
          >
            40+ AI Tools.{" "}
            <span className="text-[#915EFF]">One MCP Server.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/80 text-[16px] mt-4 max-w-2xl mx-auto"
          >
            Each tool is a specialized AI capability — from generating production code
            to querying knowledge graphs to automating entire workflows.
            Click any tool below to see it in action.
          </motion.p>
        </div>

        {/* Main Content Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Tool Selector - Left Panel */}
            <div className="lg:col-span-3 space-y-3">
              <h3 className="text-white font-bold text-[14px] uppercase tracking-wider mb-4 px-2">
                Select a Tool
              </h3>
              {mcpTools.map((tool, index) => (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  index={index}
                  isSelected={selectedTool === index}
                  onClick={() => handleToolSelect(index)}
                />
              ))}
            </div>

            {/* Demo Area - Right Panel */}
            <div className="lg:col-span-9">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTool.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Tool Description */}
                  <div className="mb-6">
                    <h2 className="text-white font-bold text-[24px] mb-2">{activeTool.title}</h2>
                    <p className="text-white/75 text-[15px] max-w-2xl">
                      {activeTool.description}
                    </p>
                  </div>

                  {/* Prompt Box */}
                  <div className="bg-[#915EFF]/10 border border-[#915EFF]/30 rounded-lg p-4 mb-4">
                    <div className="text-[#915EFF] text-[12px] font-bold uppercase tracking-wider mb-1">
                      Prompt
                    </div>
                    <p className="text-white text-[14px] italic">
                      &ldquo;{activeTool.prompt}&rdquo;
                    </p>
                  </div>

                  {/* IDE Terminal */}
                  <IDETerminal
                    code={activeTool.code}
                    isActive={demoActive}
                    title={`MCP Tool: ${activeTool.title}`}
                  />

                  {/* Action buttons */}
                  <div className="flex gap-4 mt-4">
                    <button
                      onClick={() => {
                        setDemoActive(false);
                        setTimeout(() => setDemoActive(true), 100);
                      }}
                      className="bg-[#915EFF] text-white px-6 py-2 rounded-full text-[14px] hover:bg-[#7a4de0] transition-colors"
                    >
                      ▶ Replay
                    </button>
                    <button
                      onClick={() => setDemoActive(false)}
                      className="border border-white/20 text-white px-6 py-2 rounded-full text-[14px] hover:border-[#915EFF] transition-colors"
                    >
                      ⏸ Pause
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
