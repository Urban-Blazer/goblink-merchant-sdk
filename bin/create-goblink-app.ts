#!/usr/bin/env node

import * as readline from "node:readline";
import * as fs from "node:fs";
import * as path from "node:path";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer.trim()));
  });
}

function writeFile(filePath: string, content: string) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, content, "utf-8");
}

// --- Templates ---

function envTemplate(mode: string): string {
  return `GOBLINK_API_KEY=gb_${mode === "test" ? "test" : "live"}_your_key_here
GOBLINK_WEBHOOK_SECRET=whsec_your_secret_here
`;
}

// --- Next.js templates ---

function nextjsPaymentRoute(): string {
  return `import { GoBlink } from "@goblink/merchant-sdk";
import { NextResponse } from "next/server";

const goblink = new GoBlink({
  apiKey: process.env.GOBLINK_API_KEY!,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payment = await goblink.payments.create({
      amount: body.amount,
      currency: body.currency ?? "USD",
      orderId: body.orderId,
      returnUrl: body.returnUrl,
    });
    return NextResponse.json(payment);
  } catch (error) {
    console.error("Payment error:", error);
    return NextResponse.json(
      { error: "Failed to create payment" },
      { status: 500 },
    );
  }
}
`;
}

function nextjsWebhookRoute(): string {
  return `import { createWebhookHandler } from "@goblink/merchant-sdk/nextjs";

export const POST = createWebhookHandler({
  secret: process.env.GOBLINK_WEBHOOK_SECRET!,
  onPaymentConfirmed: async (payment) => {
    console.log("Payment confirmed:", payment.id);
    // TODO: Fulfill the order
  },
  onPaymentFailed: async (payment) => {
    console.log("Payment failed:", payment.id);
    // TODO: Handle failed payment
  },
});
`;
}

function nextjsPage(): string {
  return `"use client";

import { PayButton } from "@goblink/merchant-sdk/react";

export default function CheckoutPage() {
  return (
    <main style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
      <h1>Checkout</h1>
      <p>Pay with crypto via goBlink</p>
      <PayButton
        apiKey={process.env.NEXT_PUBLIC_GOBLINK_API_KEY!}
        amount={9.99}
        currency="USD"
        onSuccess={(id) => {
          console.log("Payment successful:", id);
          alert("Payment confirmed!");
        }}
        onError={(err) => {
          console.error("Payment error:", err);
          alert("Payment failed: " + err.message);
        }}
      />
    </main>
  );
}
`;
}

function nextjsReadme(): string {
  return `# goBlink Next.js Example

## Setup

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Copy \`.env.local\` and fill in your API keys:
   \`\`\`bash
   cp .env.local.example .env.local
   \`\`\`

3. Run the dev server:
   \`\`\`bash
   npm run dev
   \`\`\`

## Routes

- \`/\` — Checkout page with PayButton
- \`/api/payments\` — Create payment API
- \`/api/webhooks/goblink\` — Webhook handler
`;
}

// --- Express templates ---

function expressServer(): string {
  return `import express from "express";
import { GoBlink } from "@goblink/merchant-sdk";
import { webhookHandler } from "@goblink/merchant-sdk/webhooks";

const app = express();
const port = process.env.PORT || 3001;

const goblink = new GoBlink({
  apiKey: process.env.GOBLINK_API_KEY!,
});

// Webhook endpoint (must be before express.json() to get raw body)
app.post(
  "/webhooks/goblink",
  express.raw({ type: "application/json" }),
  webhookHandler({
    secret: process.env.GOBLINK_WEBHOOK_SECRET!,
    onPaymentConfirmed: async (payment) => {
      console.log("Payment confirmed:", payment.id);
      // TODO: Fulfill the order
    },
    onPaymentFailed: async (payment) => {
      console.log("Payment failed:", payment.id);
    },
  }),
);

app.use(express.json());

// Create payment
app.post("/payments", async (req, res) => {
  try {
    const payment = await goblink.payments.create({
      amount: req.body.amount,
      currency: req.body.currency ?? "USD",
      orderId: req.body.orderId,
      returnUrl: req.body.returnUrl,
    });
    res.json(payment);
  } catch (error) {
    console.error("Payment error:", error);
    res.status(500).json({ error: "Failed to create payment" });
  }
});

// Get payment
app.get("/payments/:id", async (req, res) => {
  try {
    const payment = await goblink.payments.get(req.params.id);
    res.json(payment);
  } catch (error) {
    console.error("Get payment error:", error);
    res.status(500).json({ error: "Failed to get payment" });
  }
});

app.listen(port, () => {
  console.log(\`Server running on port \${port}\`);
});
`;
}

function expressReadme(): string {
  return `# goBlink Express Example

## Setup

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Copy \`.env\` and fill in your API keys:
   \`\`\`bash
   cp .env.example .env
   \`\`\`

3. Run the server:
   \`\`\`bash
   npm run dev
   \`\`\`

## Endpoints

- \`POST /payments\` — Create a payment
- \`GET /payments/:id\` — Get payment details
- \`POST /webhooks/goblink\` — Webhook handler
`;
}

// --- Scaffold functions ---

function scaffoldNextjs(dir: string, mode: string) {
  writeFile(path.join(dir, ".env.local.example"), envTemplate(mode));
  writeFile(
    path.join(dir, "app", "api", "payments", "route.ts"),
    nextjsPaymentRoute(),
  );
  writeFile(
    path.join(dir, "app", "api", "webhooks", "goblink", "route.ts"),
    nextjsWebhookRoute(),
  );
  writeFile(path.join(dir, "app", "page.tsx"), nextjsPage());
  writeFile(path.join(dir, "README.md"), nextjsReadme());
  writeFile(
    path.join(dir, "package.json"),
    JSON.stringify(
      {
        name: "goblink-nextjs-example",
        private: true,
        scripts: { dev: "next dev", build: "next build", start: "next start" },
        dependencies: {
          next: "^14.0.0",
          react: "^18.2.0",
          "react-dom": "^18.2.0",
          "@goblink/merchant-sdk": "^0.1.0",
        },
      },
      null,
      2,
    ),
  );
}

function scaffoldExpress(dir: string, mode: string) {
  writeFile(path.join(dir, ".env.example"), envTemplate(mode));
  writeFile(path.join(dir, "server.ts"), expressServer());
  writeFile(path.join(dir, "README.md"), expressReadme());
  writeFile(
    path.join(dir, "package.json"),
    JSON.stringify(
      {
        name: "goblink-express-example",
        private: true,
        type: "module",
        scripts: { dev: "tsx server.ts", start: "node server.js" },
        dependencies: {
          express: "^4.18.0",
          "@goblink/merchant-sdk": "^0.1.0",
        },
        devDependencies: {
          "@types/express": "^4.17.0",
          tsx: "^4.0.0",
        },
      },
      null,
      2,
    ),
  );
}

function scaffoldPlain(dir: string, mode: string) {
  writeFile(path.join(dir, ".env.example"), envTemplate(mode));
  writeFile(
    path.join(dir, "index.ts"),
    `import { GoBlink } from "@goblink/merchant-sdk";

const goblink = new GoBlink({
  apiKey: process.env.GOBLINK_API_KEY!,
});

async function main() {
  // Create a payment
  const payment = await goblink.payments.create({
    amount: 9.99,
    currency: "USD",
  });

  console.log("Payment created:", payment.id);
  console.log("Payment URL:", payment.paymentUrl);

  // Check status
  const status = await goblink.payments.get(payment.id);
  console.log("Status:", status.status);
}

main().catch(console.error);
`,
  );
  writeFile(path.join(dir, "README.md"), `# goBlink Example\n\nRun: \`npx tsx index.ts\`\n`);
  writeFile(
    path.join(dir, "package.json"),
    JSON.stringify(
      {
        name: "goblink-example",
        private: true,
        type: "module",
        dependencies: { "@goblink/merchant-sdk": "^0.1.0" },
        devDependencies: { tsx: "^4.0.0" },
      },
      null,
      2,
    ),
  );
}

// --- Main ---

async function main() {
  console.log("\n  create-goblink-app\n");
  console.log("  Scaffold a goBlink Merchant SDK project\n");

  const framework = await ask(
    "  Framework (1=Next.js, 2=Express, 3=None) [1]: ",
  );
  const mode = await ask("  Mode (1=test, 2=live) [1]: ");

  const frameworkChoice =
    framework === "2" ? "express" : framework === "3" ? "none" : "nextjs";
  const modeChoice = mode === "2" ? "live" : "test";

  const dirName =
    frameworkChoice === "nextjs"
      ? "goblink-nextjs-app"
      : frameworkChoice === "express"
        ? "goblink-express-app"
        : "goblink-app";

  const dir = path.resolve(process.cwd(), dirName);

  console.log(`\n  Scaffolding ${frameworkChoice} project in ${dir}...\n`);

  switch (frameworkChoice) {
    case "nextjs":
      scaffoldNextjs(dir, modeChoice);
      break;
    case "express":
      scaffoldExpress(dir, modeChoice);
      break;
    default:
      scaffoldPlain(dir, modeChoice);
      break;
  }

  console.log("  Done! Next steps:\n");
  console.log(`    cd ${dirName}`);
  console.log("    npm install");
  console.log(`    # Edit .env${frameworkChoice === "nextjs" ? ".local" : ""} with your API keys`);
  console.log("    npm run dev\n");

  rl.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
