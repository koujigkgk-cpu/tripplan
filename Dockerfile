# --- ステージ1: ビルド（Mavenでコンパイル） ---
FROM maven:3.8.4-openjdk-11 AS build
COPY . /app
WORKDIR /app
# pom.xmlを使って、GitHub上でJavaファイルを一からコンパイルしWARを作成します
RUN mvn clean package -DskipTests

# --- ステージ2: 実行（Tomcat 10で起動） ---
# Tomcat 10 以降が jakarta.servlet (Jakarta EE 9+) に対応しています
FROM tomcat:10.1-jdk11-openjdk-slim
# 日本時間に設定
ENV TZ=Asia/Tokyo

# ビルドステージで生成された ROOT.war を Tomcat の配備フォルダへコピー
COPY --from=build /app/target/ROOT.war /usr/local/tomcat/webapps/ROOT.war

EXPOSE 8080
CMD ["catalina.sh", "run"]
