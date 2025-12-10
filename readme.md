![Node.js](https://img.shields.io/badge/Node.js-v20.x-339933?logo=nodedotjs&logoColor=white)
![Nest.js](https://img.shields.io/badge/-NestJs-ea2845?style=flat-square&logo=nestjs&logoColor=white)
![Typescript](img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)
![MongoDB](https://img.shields.io/badge/-MongoDB-4DB33D?style=flat&logo=mongodb&logoColor=FFFFFF)
![MariaDB](https://img.shields.io/badge/MariaDB-003545?style=plastic&logo=mariadb&logoColor=white)

# 🚀 Mcitys API 3.0 | A scalable and modular REST API built with modern technologies

## 🏗️ Architecture philosophy

This new version of Mcitys API is built using the **Nest.js framework**. As systems grow, maintaining a clean architecture is crucial to avoid the pitfalls of **boilerplate code** and the monolithic structure that is often hard to maintain.

The transition to Nest.js was driven by a commitment to **robust, low-coupled architecture**. My first version (v1) of the API suffered from heavy interconnection, where changing one dependency initiated a cascade of updates throughout the codebase (a common beginner's mistake).

### 🎯 Key Architectural Drivers

The current architecture is built upon the following principles, largely enabled by Nest.js:

* **Inversion of Control (IoC) & Dependency Injection (DI):** Ensures a low-coupled design, making components easily interchangeable and testable.
* **TypeScript & Interfaces:** Guarantees strong typing and maintainability across the entire codebase.
* **Separation of Concerns (SoC):** The application is strictly divided into functional modules (Controllers, Services, Repositories).
* **Enterprise Standards:** The framework facilitates the implementation of microservices architecture and enforces high code quality through tools like ESLint.

**Goal:** To move beyond simply writing functional code, towards thinking like an architect who builds scalable, enterprise-grade applications.

## 🛠️ Key technologies

| Role | Technology |
| :--- | :--- |
| **Framework** | Nest.js |
| **Language** | TypeScript |
| **Databases** | MariaDB & MongoDB |
| **Containerizing** | Docker & Docker Compose |
| **Cache & Sessions** | Redis |
| **Frontend** | Angular |
