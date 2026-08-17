# ── Stage 1: Build ────────────────────────────
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app

# Install Maven in the build stage
RUN apk add --no-cache maven

# Copy Maven files and download dependencies first (layer caching)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source and build
COPY src ./src
RUN mvn package -DskipTests -B

# ── Stage 2: Runtime ───────────────────────────
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create data directory for H2 file-based DB (used as fallback)
RUN mkdir -p /app/data

# Copy the built JAR
COPY --from=build /app/target/nexusai-crm-1.0.0-SNAPSHOT.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
