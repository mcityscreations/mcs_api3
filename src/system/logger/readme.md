## Architecture of the logging system

**The Middleware**: It captures each visitor and attaches a tag (correlationId) to their front end.

**The ALS**: This is the invisible notebook that carries this tag throughout the code, without having to pass it from function to function.

**The Factory**: It configures the Winston machine to send logs to the console (for you) and to MongoDB (for future reference).

**The Service**: This is the universal translator. It ensures that even if NestJS sends it internal logs, they are enriched with custom metadata.

**The Interceptor**: It uses this service to signal "The query has started" and "The query has finished," thus creating the two parentheses that surround each user action.

**The TypeOrmLogger**: It also uses this service to whisper to Winston every SQL query that is sent to PostgreSQL.