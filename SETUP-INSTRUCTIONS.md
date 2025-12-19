Fork notice: This repository is a fork of https://github.com/bottobot/touchdesigner-mcp-server by Robert Spring (bottobot). All original credit belongs to the original author.

# TD-MCP Setup Instructions (Codex CLI)

This guide shows how to run the TD-MCP documentation server locally and connect it to Codex CLI using MCP.

## What This Is

A pure MCP server that provides TouchDesigner operator documentation, tutorials, and Python API references to Codex CLI. TouchDesigner runs independently; Codex CLI connects to this server over stdio.

## Step-by-Step Setup

### Step 1: Install Dependencies

1. Open a terminal
2. Navigate to this repository:
   ```bash
   cd /path/to/touchdesigner-codex-mcp
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Step 2: Test the MCP Server

1. Start the server:
   ```bash
   node index.js
   ```
2. You should see output similar to:
   ```
   TD-MCP v2.6.1 Server Starting...
   ================================
   TouchDesigner MCP Server for Codex CLI
   Keep it simple: pure MCP server, no WebSocket complexity

   [Server] Initializing operator data manager...
   ...
   ✓ TD-MCP v2.6.1 Server is now running with HTM Wiki System integrated
   ```
3. Press Ctrl+C to stop the server

### Step 3: Configure Codex CLI

Add the MCP server to your Codex CLI configuration (for example, `~/.codex/config.json`):
```json
{
  "mcpServers": {
    "td-mcp": {
      "command": "npx",
      "args": ["@bottobot/td-mcp"]
    }
  }
}
```

Once configured, Codex CLI will launch the server automatically when needed.

## Available MCP Tools

### get_operator
Get detailed information about a TouchDesigner operator.

### search_operators
Search operators with contextual ranking and optional parameter search.

### list_operators
List operators, optionally filtered by category.

### suggest_workflow
Suggest operators commonly used after a given operator.

### get_tutorial
Retrieve a specific TouchDesigner tutorial.

### list_tutorials
List available tutorials, optionally filtered by a search term.

### get_python_api
Retrieve documentation for a TouchDesigner Python class.

### search_python_api
Search across TouchDesigner Python API classes, methods, and members.

## What Is Available

### Operator Categories
- TOP (Texture Operators)
- CHOP (Channel Operators)
- SOP (Surface Operators)
- DAT (Data Operators)
- MAT (Material Operators)
- COMP (Component Operators)
- POP (Point Operators)

### Content Summary
- 629 operators
- 14 tutorials
- 69 Python API classes

## File Structure

```
touchdesigner-codex-mcp/
├── index.js                    # Main MCP server
├── package.json               # Dependencies and configuration
├── README.md                  # Documentation
├── MCP-ARCHITECTURE.md        # Codex CLI architecture guide
├── SETUP-INSTRUCTIONS.md      # This file
├── tools/                     # Individual MCP tools
│   ├── get_operator.js
│   ├── search_operators.js
│   ├── list_operators.js
│   ├── suggest_workflow.js
│   ├── get_tutorial.js
│   ├── list_tutorials.js
│   ├── get_python_api.js
│   └── search_python_api.js
├── wiki/                      # Documentation system
│   ├── operator-data-manager.js
│   └── data/
└── data/
    └── patterns.json
```

## Troubleshooting

### Server Won't Start
- Check Node.js version (requires 18.0.0 or higher)
- Run `npm install` in the repo root
- Verify data files exist in `wiki/data/`

### Codex CLI Connection Issues
- Check your Codex CLI MCP configuration
- Confirm the `command` and `args` are correct
- Restart Codex CLI after editing config

### No Operators Found
- Ensure `wiki/data/processed/` exists
- Verify startup logs show operators were loaded

## Usage Tips

- Use full operator names for best results (for example, "Movie File In TOP")
- Use category filters for narrower results
- Use `search_python_api` to discover methods before calling `get_python_api`

## What This Is Not

- Not a WebSocket server
- Not a TouchDesigner bridge
- Not a GUI application
