# MCP Server Deduplication

## Overview

The MCP (Model Context Protocol) server deduplication feature prevents duplicate MCP servers from being created when multiple `mcp.json` files contain the same server definitions. This improves performance and prevents resource conflicts.

## Problem

When multiple MCP configuration files exist (e.g., workspace `.cursor/mcp.json`, user `mcp.json`, extension-provided servers), the same server definition can be discovered multiple times, leading to:

- Duplicate server instances
- Resource waste
- Conflicting server configurations
- Performance degradation

## Solution

The deduplication logic in `McpService.updateCollectedServers()` now:

1. **Collects all server definitions** from all discovery sources
2. **Deduplicates based on server ID and configuration** (command, args)
3. **Prioritizes servers by collection scope**:
   - Workspace collections (highest priority)
   - User collections (medium priority)  
   - Extension collections (lowest priority)

## Implementation Details

### Deduplication Key

Servers are considered duplicates if they have:
- Same server ID
- Same command
- Same arguments

### Priority Order

1. **Workspace scope** - Server from workspace `.cursor/mcp.json`
2. **User scope** - Server from user `mcp.json`
3. **Extension scope** - Server from extension contributions

### Logging

The deduplication process logs:
- Which server is kept (from which collection)
- Which duplicate servers are skipped

Example log output:
```
MCP deduplication: Keeping server my-server from collection workspace-collection
MCP deduplication: Skipping duplicate server my-server from collection user-collection
```

## Configuration

No additional configuration is required. Deduplication happens automatically during server collection updates.

## Testing

The deduplication logic is tested to ensure:
- Duplicate servers are properly identified
- Higher priority collections are preferred
- Different server configurations are preserved
- Logging works correctly

## Benefits

- **Performance**: Prevents unnecessary server instances
- **Reliability**: Avoids configuration conflicts
- **User Experience**: Clear logging of deduplication decisions
- **Resource Efficiency**: Reduces memory and CPU usage

