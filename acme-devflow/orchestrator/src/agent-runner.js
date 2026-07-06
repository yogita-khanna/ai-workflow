const fs = require('fs');
const path = require('path');

const agentsDir = path.resolve(__dirname, '..', '..', 'agents');
const skillsDir = path.resolve(__dirname, '..', '..', 'skills');

function loadAgentInstructions(agentName) {
  const agentPath = path.join(agentsDir, agentName, 'AGENT.md');
  if (fs.existsSync(agentPath)) {
    return fs.readFileSync(agentPath, 'utf8');
  }
  return `Generic instructions for agent ${agentName}`;
}

function runAgentTask(agentName, ticketId, phase, taskDescription) {
  console.log(`\n\x1b[35m[Agent Runner] Invoking ${agentName} for ${ticketId}...\x1b[0m`);
  const instructions = loadAgentInstructions(agentName);
  
  // Extract and print the role/instructions for visibility
  const lines = instructions.split('\n');
  const roleLine = lines.find(l => l.startsWith('# Agent:')) || `# Agent: ${agentName}`;
  console.log(`  Role: \x1b[32m${roleLine.replace('# Agent:', '').trim()}\x1b[0m`);
  console.log(`  Phase: ${phase}`);
  console.log(`  Executing: ${taskDescription}`);
  
  // Simulate prompt boundary compilation
  console.log(`  [System Context Loaded] Enforcing skills and constraints from agent profile...`);
  return {
    success: true,
    agent: agentName,
    output: `Agent ${agentName} successfully completed task: ${taskDescription}`
  };
}

module.exports = {
  runAgentTask
};
