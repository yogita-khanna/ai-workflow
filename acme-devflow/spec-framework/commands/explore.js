const idea = process.argv.slice(2).join(' ');
if (!idea) {
  console.error('Error: Please provide an idea description (e.g., "Add OAuth Login").');
  process.exit(1);
}

console.log(`\x1b[36m=== DevFlow Explore Sandbox ===\x1b[0m`);
console.log(`Evaluating fuzzy idea: "${idea}"\n`);

console.log(`\x1b[35m--- Architectural Alignment & Constraints Check ---\x1b[0m`);
console.log(`1. Monorepo Stack: Next.js + NestJS + Raw Postgres (No ORM).`);
console.log(`2. Security Check: JWT cookie-based session, zero-trust endpoint protection.`);
console.log(`3. Cost & Risk: Lower risks can proceed via auto-apply; database schema changes require hard human gates.`);

console.log(`\n\x1b[33m--- Brainstorming Prompts & Discussion Guidance ---\x1b[0m`);
console.log(`- How would this feature map to NestJS Controllers vs Services vs Repositories?`);
console.log(`- What data constraints/tables will be added (UP migration)?`);
console.log(`- Are there any performance bottlenecks (e.g., N+1 queries)?`);

console.log(`\nReady to proceed? Create a ticket and run:`);
console.log(`  \x1b[32m/devflow:propose <ticket-id>\x1b[0m to scaffold a formal specification.`);
