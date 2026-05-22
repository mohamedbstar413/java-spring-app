FROM eclipse-temurin:21-jdk-jammy AS runner

WORKDIR /app

COPY ./target/billing-service-0.0.1-SNAPSHOT.jar ./app.jar
EXPOSE 8080
EXPOSE 9001

ENTRYPOINT ["java", "-jar", "app.jar"]
