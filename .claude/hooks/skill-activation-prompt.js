#!/usr/bin/env node

/**
 * Skill Activation Hook (UserPromptSubmit)
 * 
 * Automatically suggests relevant skills based on:
 * - User prompt content
 * - Files in context
 * - Active directory
 * 
 * This is the ESSENTIAL hook that makes skills activate automatically.
 */

const fs = require('fs');
const path = require('path');

// Read hook data from stdin
let inputData = '';
process.stdin.on('data', (chunk) => {
  inputData += chunk;
});

process.stdin.on('end', () => {
  try {
    const hookData = JSON.parse(inputData);
    processHook(hookData);
  } catch (error) {
    console.error('Error parsing hook data:', error);
    process.exit(1);
  }
});

function processHook(hookData) {
  const { userPrompt, contextFiles } = hookData;
  
  // Load skill rules
  const skillRulesPath = path.join(process.cwd(), '.claude', 'skills', 'skill-rules.json');
  
  if (!fs.existsSync(skillRulesPath)) {
    // No skill rules defined yet - exit silently
    process.exit(0);
  }
  
  const skillRules = JSON.parse(fs.readFileSync(skillRulesPath, 'utf8'));
  const suggestions = [];
  
  // Check each skill for activation
  for (const [skillName, rules] of Object.entries(skillRules)) {
    let score = 0;
    const reasons = [];
    
    // Check prompt triggers
    if (rules.triggers) {
      for (const trigger of rules.triggers) {
        if (userPrompt.toLowerCase().includes(trigger.toLowerCase())) {
          score += 2;
          reasons.push(`prompt mentions "${trigger}"`);
        }
      }
    }
    
    // Check file paths
    if (rules.paths && contextFiles) {
      for (const filePath of contextFiles) {
        for (const pattern of rules.paths) {
          if (matchesPattern(filePath, pattern)) {
            score += 3;
            reasons.push(`working in ${pattern}`);
            break;
          }
        }
      }
    }
    
    // If skill is relevant, suggest it
    if (score >= 2) {
      suggestions.push({
        skill: skillName,
        score,
        reasons: reasons.slice(0, 2), // Top 2 reasons
        description: rules.description || ''
      });
    }
  }
  
  // Sort by score and output suggestions
  if (suggestions.length > 0) {
    suggestions.sort((a, b) => b.score - a.score);
    
    const topSkills = suggestions.slice(0, 2); // Top 2 skills
    
    console.log('\n🎯 Relevant skills detected:\n');
    for (const suggestion of topSkills) {
      console.log(`📚 ${suggestion.skill}`);
      if (suggestion.description) {
        console.log(`   ${suggestion.description}`);
      }
      console.log(`   Reason: ${suggestion.reasons.join(', ')}`);
      console.log(`   💡 Load with: @${suggestion.skill}\n`);
    }
  }
  
  process.exit(0);
}

function matchesPattern(filePath, pattern) {
  // Convert glob-like pattern to regex
  const regexPattern = pattern
    .replace(/\*\*/g, '.*')
    .replace(/\*/g, '[^/]*')
    .replace(/\?/g, '.')
    .replace(/\./g, '\\.');
  
  const regex = new RegExp(regexPattern);
  return regex.test(filePath);
}
