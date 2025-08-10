# Aetherquill Logging System

This document describes the comprehensive logging system implemented in Aetherquill to help with debugging and monitoring.

## Overview

The logging system writes detailed logs to files instead of relying solely on Docker's console output, which can be truncated. This provides better debugging capabilities and persistent log storage.

## Log File Location

Logs are written to: `logs/app.log`

This file is created automatically when the server starts and is accessible both inside Docker containers and on the host machine.

## Log Levels

The system supports multiple log levels:

- **DEBUG**: Detailed information for diagnosing issues (development only)
- **INFO**: General information about application flow
- **WARN**: Warning messages for potentially problematic situations
- **ERROR**: Error conditions that don't stop the application
- **FATAL**: Critical errors that cause application termination

## Log Format

Each log entry includes:
- **Timestamp**: ISO 8601 format
- **Level**: Log level (DEBUG, INFO, WARN, ERROR, FATAL)
- **Source**: Component that generated the log (server, routes, vite, etc.)
- **Message**: Human-readable message
- **Data**: Additional structured data (when applicable)
- **Stack**: Error stack trace (for errors)

### Example Log Entry
```
2025-01-27T10:30:45.123Z [INFO] [server] Server started successfully | Data: {"port":5000,"host":"0.0.0.0","logFile":"/app/logs/app.log","environment":"development"}
```

## Using the Logging System

### In Code

```typescript
import logger from "./logger";

// Different log levels
logger.debug("component", "Detailed debug info", { userId: 123 });
logger.info("component", "Operation completed successfully");
logger.warn("component", "Deprecated API used", { endpoint: "/old-api" });
logger.error("component", "Database connection failed", error);
logger.fatal("component", "Critical system failure", error); // Exits process
```

### HTTP Request Logging

All HTTP requests are automatically logged with:
- Method and path
- Status code
- Response time
- Request/response data (when applicable)
- Client information (IP, User-Agent)

## Viewing Logs

### NPM Scripts

```bash
# View recent logs (last 50 lines)
npm run logs

# Follow logs in real-time
npm run logs:follow

# Clear current log file
npm run logs:clear

# Rotate log file
npm run logs:rotate
```

### Direct Script Usage

```bash
# Make script executable (one time)
chmod +x scripts/tail-logs.sh

# Show last 50 lines
./scripts/tail-logs.sh

# Follow logs in real-time
./scripts/tail-logs.sh -f

# Show last 100 lines
./scripts/tail-logs.sh -n 100

# Follow with custom line count
./scripts/tail-logs.sh -f -n 20

# Clear logs
./scripts/tail-logs.sh --clear

# Force log rotation
./scripts/tail-logs.sh --rotate
```

### Manual Tailing

```bash
# Follow logs
tail -f logs/app.log

# Show last 100 lines
tail -n 100 logs/app.log

# Search for errors
grep "ERROR" logs/app.log

# Search for specific component
grep "\[routes\]" logs/app.log
```

## Log Rotation

Logs are automatically rotated when they exceed 50MB. You can also force rotation using:
```bash
npm run logs:rotate
```

Rotated files are named with timestamps: `app_2025-01-27_10-30-45.log`

## Docker Integration

The logging system works seamlessly with Docker:

1. **Host Access**: Logs are mounted to `./logs` on the host machine
2. **Persistent Storage**: Logs survive container restarts
3. **No Truncation**: Unlike Docker logs, file logs are never truncated

### Docker Compose Configuration

```yaml
volumes:
  - ./logs:/app/logs # Mount logs directory for persistent logging
```

## Debugging Workflow

1. **Start Application**: Run `npm run dev` or `docker-compose up`
2. **Monitor Logs**: In another terminal, run `npm run logs:follow`
3. **Reproduce Issue**: Perform actions that cause the problem
4. **Analyze Logs**: Look for ERROR/WARN messages with full stack traces
5. **Search Logs**: Use `grep` or search tools to find specific patterns

### Common Debug Scenarios

```bash
# Find all errors
grep "ERROR" logs/app.log

# Find database issues
grep "database" logs/app.log -i

# Find specific API endpoint issues
grep "PUT /api/campaigns" logs/app.log

# Find campaign-related operations
grep "campaign" logs/app.log -i

# Show logs from the last hour
grep "$(date -d '1 hour ago' '+%Y-%m-%d')" logs/app.log
```

## Performance Impact

- **Development**: All log levels enabled for detailed debugging
- **Production**: Only INFO and above to reduce overhead
- **Async Writing**: Log writing is non-blocking
- **Rotation**: Automatic cleanup prevents disk space issues

## Troubleshooting

### Log File Not Created
- Ensure `logs/` directory exists: `mkdir -p logs`
- Check file permissions
- Verify server is starting successfully

### Cannot Tail Logs
```bash
# Make script executable
chmod +x scripts/tail-logs.sh

# Or use direct tail
tail -f logs/app.log
```

### Logs Too Verbose
- Reduce log level in production
- Use grep to filter specific components
- Focus on ERROR and WARN levels first

### Log File Too Large
- Use log rotation: `npm run logs:rotate`
- Clear logs: `npm run logs:clear`
- Set up automated log rotation

## Integration with Other Tools

### Log Analysis Tools
- **grep/awk/sed**: Command-line text processing
- **jq**: JSON log parsing (logs are JSON formatted)
- **Elasticsearch**: For advanced log aggregation
- **Splunk**: Enterprise log analysis

### Monitoring
- Set up alerts on ERROR/FATAL log entries
- Monitor log file size for disk space management
- Track application performance through request timing logs

## Best Practices

1. **Use Appropriate Levels**: Don't log everything as ERROR
2. **Include Context**: Add relevant data objects to log entries
3. **Structured Logging**: Use the data parameter for searchable information
4. **Sensitive Data**: Never log passwords, tokens, or PII
5. **Performance**: Avoid logging in tight loops
6. **Rotation**: Monitor and rotate logs regularly

## Environment Variables

- `NODE_ENV`: Controls log level (development = DEBUG, production = INFO)
- `LOG_LEVEL`: Override default log level
- `LOG_FILE`: Override default log file path

## Support

For logging issues:
1. Check this documentation
2. Verify log file permissions
3. Test with manual tail commands
4. Review console output for logger initialization messages