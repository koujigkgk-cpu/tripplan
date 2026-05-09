# --- ステージ1: ビルド（Java 21を使用） ---
FROM maven:3.9.6-eclipse-temurin-21 AS build
COPY . /app
WORKDIR /app
# Java 21環境でWARファイルを作成
RUN mvn clean package -DskipTests

# --- ステージ2: 実行（Tomcat 10 + Java 21） ---
# slim版をやめることでJSPエンジン(Jasper)を確実に動かします
FROM tomcat:10.1-jdk21-openjdk
# 日本時間に設定
ENV TZ=Asia/Tokyo

# ビルドステージで生成された ROOT.war をコピー
COPY --from=build /app/target/ROOT.war /usr/local/tomcat/webapps/ROOT.war

EXPOSE 8080
CMD ["catalina.sh", "run"]
