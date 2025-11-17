# AstroJS-Bun-Nest-FastAPI-Project Constitution

## Core Principles

### I. Library-First

Every feature begins as a standalone library. Libraries must be self-contained, independently testable, and thoroughly documented. Each library must have a clear, non-negotiable purpose, eliminating organizational-only libraries that serve no functional need.

### II. CLI Interface

All libraries and services must expose functionality via a command-line interface (CLI). The text-based input/output protocol is standardized: stdin for input arguments, stdout for normal output, and stderr for errors. Support for both JSON and human-readable formats is mandatory to ensure flexibility and debuggability.

### III. Test-First (NON-NEGOTIABLE)

Test-Driven Development (TDD) is mandatory for all new features and modifications. The process is: Tests are written first, then user approval is sought, tests must fail initially, implementation follows, and finally, refactoring occurs. This enforces the Red-Green-Refactor cycle strictly, ensuring robust and reliable code from the outset.

### IV. Integration Testing

Integration testing is critical and must cover key areas, including: new library contract tests upon creation, verification of contract changes, inter-service communication between microservices, and validation of shared schemas across components. This ensures system cohesion and interoperability.

### V. Observability, Versioning & Breaking Changes, Simplicity

Adopt text-based I/O for enhanced observability and debuggability. Implement structured logging for easier monitoring. Versioning follows the MAJOR.MINOR.BUILD format, adhering to semantic versioning. Embrace simplicity with the YAGNI (You Ain't Gonna Need It) principle to avoid unnecessary complexity.

## Additional Constraints, Security Requirements, Performance Standards

- **Technology Stack**: Frontend - AstroJS; Backend - Bun with Nest.js microservices; Resolver calls - FastAPI; Internal data research - Python notebooks; Database - PostgreSQL with pgvector extension for vector similarity search.

- **Security Requirements**: Prioritize security by following OWASP Top 10 guidelines, implementing secure coding practices, regular security audits, and ensuring data encryption at rest and in transit. Accessibility must be top priority, adhering to WCAG 2.1 standards for web components.

- **Performance Standards**: Aim for sub-second response times for common queries, with comprehensive monitoring and alerting. Ensure efficient database queries and scalable architecture to handle expected loads.

## Development Workflow, Review Process, Quality Gates

- **Code Review Policy**: Enforced strictly; all Pull Requests must undergo mandatory review for compliance with the constitution, including adherence to coding standards, test coverage requirements, and security checks.

- **Testing Requirements**: 100% test coverage is mandatory for all code changes. Unit tests, integration tests, and end-to-end tests must be included.

- **Conventional Commits**: All commit messages must follow the conventional commits specification to standardize versioning and changelog generation.

- **Documentation**: Major decisions, architectural changes, and significant bug fixes must be documented in a central knowledge base.

- **Backward Compatibility**: Maintain backward API compatibility at all costs. Any changes that could break existing integrations must be deprecated gracefully with a minimum six-month support period.

## Governance

This constitution supersedes all other internal guidelines and practices. Amendments require formal documentation, approval from governance board, and a detailed migration plan. All PRs and reviews must verify compliance with this document.

**Version**: 1.0.0 | **Ratified**: 2025-11-17 | **Last Amended**: 2025-11-17
