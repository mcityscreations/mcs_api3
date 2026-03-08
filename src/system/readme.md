# System Module

**A modular, scalable infrastructure for NestJS applications.**

This module centralizes **core, cross-cutting concerns** and infrastructure-level functionalities, designed for maintainability and performance. It includes database management, HTTP standardization, logging, metrics, and scheduled tasks—everything needed to build robust backend applications.

## Features

| Feature                | Description                                                                                     |
|------------------------|-------------------------------------------------------------------------------------------------|
| **Database**           | SQL engine built on an abstract class, allowing easy switching between MySQL and PostgreSQL. Redis is used to store MFA sessions, OTPs, and weather data consumed by the frontend. |
| **HTTP**               | - **Interceptors**: Standardize API responses (format, metadata).
|                        | - **Filters**: Global exception filter to catch and format errors consistently.               |
| **Async Local Storage**| Stores and shares correlation IDs across requests, used by audit and tracing tools.            |
| **Cron Tasks**         | Scheduled jobs for maintenance, cleanup, or periodic operations.                               |
| **Logging**            | Custom logger built with Winston. Critical logs are persisted in MongoDB for audit purposes.    |
| **Metrics**            | Prometheus integration for system health monitoring and performance metrics.                   |

## Usage

- **Database**: Import `PostgreSQLService` or use the abstract class `IDatabaseService` to interact with SQL.
- **HTTP**: Interceptors and filters are globally registered.
- **Logging**: Inject `WinstonLoggerService` anywhere in the app. Critical logs are automatically stored in MongoDB.
- **Metrics**: Endpoint `/metrics` is exposed by default for Prometheus scraping.

## Dependencies

- Requires environment variables for database connections, Redis, MongoDB, and Prometheus configuration.
- Relies on `@nestjs/common`, `@nestjs/core`, `winston`, `prom-client`, and `async_hooks` for async local storage.

## Environment Variables

| Variable               | Description                          | Example Value          | Required |
|------------------------|--------------------------------------|------------------------|----------|
| `REDIS_HOST`           | Redis server host                    | `localhost`            | Yes      |
| `REDIS_PORT`           | Redis server port                    | `6379`                 | Yes      |
| `REDIS_PASSWORD`       | Redis authentication password        | `your_secure_password` | Yes      |
| `POSTGRES_MAIN_HOST`   | PostgreSQL main database host        | `localhost`            | Yes      |
| `POSTGRES_MAIN_PORT`   | PostgreSQL main database port        | `5432`                 | Yes      |
| `POSTGRES_MAIN_USER`   | PostgreSQL main database username    | `admin`                | Yes      |
| `POSTGRES_MAIN_PASSWORD` | PostgreSQL main database password  | `your_secure_password` | Yes      |
| `MONGODB_LOG_URI_SRV` | MongoDB URI+SRV | `mongodb+srv://${user}:${your_secret_password}@...` | Yes  |
| `RABBITMQ_ENABLED` | Is RabbitMQ enabled ? If 'false' the NestJS EventBus will be used | `false` | Yes      |
| `RABBITMQ_HOST` | RabbitMQ host | `localhost` | No |
| `RABBITMQ_PORT` | RabbitMQ port | `5672` | No |
| `RABBITMQ_USER` | RabbitMQ user | `username` | No |
| `RABBITMQ_PASSWORD` | RabbitMQ password | `your_secret_key` | No |
| `RABBITMQ_EXCHANGE_NAME` | RabbitMQ Exchange name | `topic` | No |
