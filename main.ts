import * as fs from "fs";

// MidLang Interpreter Class
class MidLang {
  private variables: Record<string, any> = {};  // Store variables
  private functions: Record<string, string> = {};  // Store functions as strings

  // Parse each line and execute the corresponding logic
  parseLine(line: string): void {
    line = line.trim();
    if (line.startsWith("//") || line === "") return;

    const tokens = line.split(/\s+/);
    const command = tokens[0];

    switch (command) {
      case "let":
        this.handleLet(tokens);
        break;
      case "print":
        this.handlePrint(tokens);
        break;
      case "if":
        this.handleIf(tokens);
        break;
      case "func":
        this.handleFunc(tokens);
        break;
      case "call":
        this.handleCall(tokens);
        break;
      case "loop":
        this.handleLoop(tokens);
        break;
      default:
        console.error(`Unknown command: ${command}`);
    }
  }

  // Handle variable assignment (let x 10)
  private handleLet(tokens: string[]): void {
    const [_, name, value] = tokens;
    if (name) {
      this.variables[name] = this.evaluateExpression(value);
    }
  }

  // Handle print statement (print "Value of x is" x)
  private handlePrint(tokens: string[]): void {
    const [_, ...rest] = tokens;
    const expression = rest.join(" ");
    const result = this.evaluateExpression(expression);
    console.log(result);
  }

  // Handle if statements (if x < y print "x is less")
  private handleIf(tokens: string[]): void {
    const condition = tokens.slice(1, -2).join(" ");
    const action = tokens[tokens.length - 1];
    if (this.evaluateExpression(condition)) {
      this.parseLine(action);
    }
  }

  // Handle function definitions (func sayHello print "Hello!")
  private handleFunc(tokens: string[]): void {
    const [_, name, ...body] = tokens;
    if (name) {
      this.functions[name] = body.join(" ");
    }
  }

  // Handle function calls (call sayHello)
  private handleCall(tokens: string[]): void {
    const [_, name] = tokens;
    if (name && this.functions[name]) {
      this.parseLine(this.functions[name]);
    } else {
      console.error(`Function ${name} not defined`);
    }
  }

  // Handle loops (loop 5 print "Hello")
  private handleLoop(tokens: string[]): void {
    const count = parseInt(tokens[1], 10);
    const body = tokens.slice(2).join(" ");
    for (let i = 0; i < count; i++) {
      this.parseLine(body);
    }
  }

  // Evaluate expressions with support for variables and strings
  private evaluateExpression(expr: string): any {
    try {
      // Handle variables (e.g., x)
      if (this.variables[expr] !== undefined) {
        return this.variables[expr];
      }

      // Handle string concatenation with variables (e.g., "Value of x is" x)
      if (expr.includes('"')) {
        const parts = expr.split('"').map((part, index) => {
          if (index % 2 === 0) {
            return part; // Just a string literal
          } else {
            const trimmedPart = part.trim();
            if (this.variables[trimmedPart] !== undefined) {
              return this.variables[trimmedPart]; // Variable value
            }
            return `"${trimmedPart}"`; // Keep string literals as they are
          }
        });

        // Join everything back and return
        return parts.join('');
      }

      // Handle mathematical expressions (e.g., x + 1)
      return Function(`"use strict"; return (${expr});`)();
    } catch (err) {
      console.error(`Error evaluating expression: ${expr}`);
      return NaN;
    }
  }

  // Run the provided code
  run(code: string): void {
    const lines = code.split("\n");
    for (const line of lines) {
      this.parseLine(line);
    }
  }
}

// Main Code to Handle Command-Line Arguments

const interpreter = new MidLang();

// Check if filename argument is provided
const args = process.argv.slice(2);
if (args.length !== 1) {
  console.error("Usage: ts-node main.ts <filename.mscpt>");
  process.exit(1);
}

const filePath = args[0];

// Validate if the provided file exists and ends with .mscpt
if (!filePath.endsWith(".mscpt")) {
  console.error("Error: The file must have a .mscpt extension.");
  process.exit(1);
}

if (fs.existsSync(filePath)) {
  const fileCode = fs.readFileSync(filePath, "utf8");
  console.log(`\nRunning: ${filePath}`);
  interpreter.run(fileCode);
} else {
  console.error(`File "${filePath}" not found.`);
  process.exit(1);
}
