FROM eclipse-temurin:21-jdk-jammy AS runner

WORKDIR /app

COPY ./target/api-gateway-0.0.1-SNAPSHOT.jar ./app.jar

EXPOSE 4004

ENTRYPOINT ["java", "-jar", "app.jar"]
